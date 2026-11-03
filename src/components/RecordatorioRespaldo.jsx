import { useState } from 'react'
import Icon from './Icon'
import { useStored, KEYS, exportarTodo } from '../store/store'
import { compartirArchivo } from '../engine/ics'
import { todayISO, diffDays } from '../engine/dates'

const CADA_DIAS = 7

// Comparte el respaldo y anota la fecha, para que el aviso de Hoy sepa cuándo fue el último
export function useRespaldo() {
  const [ajustes, setAjustes] = useStored(KEYS.ajustes, {})
  const exportar = async () => {
    const hoy = todayISO()
    const r = await compartirArchivo(`hyrox-cancun-respaldo-${hoy}.json`, JSON.stringify(exportarTodo(), null, 2), 'application/json')
    if (r !== 'cancelado') setAjustes((a) => ({ ...a, ultimoRespaldo: hoy }))
    return r
  }
  return { ultimo: ajustes.ultimoRespaldo, pospuesto: ajustes.respaldoPospuesto, exportar, posponer: () => setAjustes((a) => ({ ...a, respaldoPospuesto: todayISO() })) }
}

// Aviso en Hoy: aparece si ya hay registros y pasaron 7 días (o nunca) desde el último respaldo
export default function RecordatorioRespaldo() {
  const hoy = todayISO()
  const { ultimo, pospuesto, exportar, posponer } = useRespaldo()
  const [sesiones] = useStored(KEYS.sesiones, {})
  const [checkins] = useStored(KEYS.checkins, {})
  const [listo, setListo] = useState(false)

  const hayDatos = Object.keys(sesiones).length > 0 || Object.keys(checkins).length > 0
  const dias = ultimo ? diffDays(ultimo, hoy) : null
  if (listo || !hayDatos || pospuesto === hoy || (dias != null && dias < CADA_DIAS)) return null

  return (
    <div className="card flex flex-col gap-2.5 border-sun/60 p-3">
      <div className="flex gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sun/25">
          <Icon name="alert" className="w-5 h-5" />
        </span>
        <div className="text-sm">
          <b>Respalda tus registros</b>
          <p className="text-muted">
            {dias == null ? 'Aún no tienes ningún respaldo.' : `Tu último respaldo fue hace ${dias} días.`} Solo viven en este teléfono: mándalo a Drive, WhatsApp o tu correo.
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button
          className="flex-1 rounded-xl bg-accent py-2 text-sm font-bold text-accent-on"
          onClick={async () => {
            if ((await exportar()) !== 'cancelado') setListo(true)
          }}
        >
          Respaldar ahora
        </button>
        <button className="rounded-xl border border-line px-4 py-2 text-sm font-semibold text-muted" onClick={posponer}>
          Mañana
        </button>
      </div>
    </div>
  )
}
