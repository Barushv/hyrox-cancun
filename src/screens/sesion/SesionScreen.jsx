import { useEffect, useState } from 'react'
import Icon, { iconoSesion } from '../../components/Icon'
import SesionDetalle, { CargaChip, resumenSesion } from '../../components/SesionDetalle'
import { getDia, getSesiones } from '../../engine/calendar'
import { DIAS_LABEL, formatShort, weekdayKey } from '../../engine/dates'
import { registroAnterior, registroVacio, tipoRegistro } from '../../engine/registro'
import { useStored, KEYS } from '../../store/store'
import FormGym from './FormGym'
import FormRunning from './FormRunning'
import FormClase from './FormClase'

// Pantalla completa para ver la sesión del plan y registrarla
export default function SesionScreen({ fecha, idx, onClose }) {
  const info = getDia(fecha)
  const s = info ? getSesiones(info.dia)[idx] : null
  const [sesiones, setSesiones] = useStored(KEYS.sesiones, {})
  const guardado = s ? sesiones[fecha]?.[s.id] : null
  const [r, setR] = useState(() => (s ? guardado ?? registroVacio(s) : null))
  const [borrar, setBorrar] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [])

  if (!s) return null
  const tipo = tipoRegistro(s)
  const anterior = registroAnterior(sesiones, fecha, s.id)
  const set = (k, v) => setR((prev) => ({ ...prev, [k]: v }))

  const guardar = () => {
    setSesiones((all) => ({ ...all, [fecha]: { ...(all[fecha] ?? {}), [s.id]: { ...r, guardado: new Date().toISOString() } } }))
    onClose()
  }
  const eliminar = () => {
    setSesiones((all) => {
      const dia = { ...(all[fecha] ?? {}) }
      delete dia[s.id]
      return { ...all, [fecha]: dia }
    })
    onClose()
  }

  return (
    <div className="mx-auto max-w-lg pb-32">
      <header className="safe-top sticky top-0 z-40 bg-bg/95 backdrop-blur">
        <div className="flex items-center gap-2 px-2 pt-3 pb-2">
          <button onClick={onClose} className="rounded-full p-2 text-muted active:bg-accent-soft" aria-label="Volver">
            <Icon name="chevronLeft" />
          </button>
          <div className="eyebrow">
            {DIAS_LABEL[weekdayKey(fecha)]} {formatShort(fecha)} · Sem {info.semana.semana}
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-5 px-4">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent text-accent-on">
            <Icon name={iconoSesion(s)} className="w-6 h-6" />
          </span>
          <div>
            <h1 className="font-display text-[28px] font-bold uppercase leading-none">{s.titulo}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
              <CargaChip carga={s.carga} />
              {s.momento}
            </div>
          </div>
        </div>

        {s.omitir && <p className="rounded-xl bg-bad/10 p-3 text-sm font-semibold text-bad">Esta sesión no va esta semana. Puedes registrarla si de todas formas la hiciste.</p>}

        <section className="card flex flex-col gap-3 p-3">
          {resumenSesion(s) && <p className="font-semibold">{resumenSesion(s)}</p>}
          <SesionDetalle s={s} />
        </section>

        {tipo ? (
          <section className="flex flex-col gap-3">
            <h2 className="h-section">Registro</h2>
            {tipo === 'gym' && <FormGym s={s} r={r} set={set} anterior={anterior} />}
            {tipo === 'running' && <FormRunning s={s} r={r} set={set} />}
            {tipo === 'clase' && <FormClase r={r} set={set} />}
          </section>
        ) : (
          <p className="text-sm text-muted">Esta sesión no lleva registro.</p>
        )}

        {guardado && (
          <div className="flex justify-center">
            {borrar ? (
              <div className="flex gap-2">
                <button className="rounded-lg bg-bad px-4 py-2 text-sm font-bold text-white" onClick={eliminar}>
                  Sí, borrar registro
                </button>
                <button className="rounded-lg border border-line px-4 py-2 text-sm font-semibold" onClick={() => setBorrar(false)}>
                  Cancelar
                </button>
              </div>
            ) : (
              <button className="text-sm font-semibold text-bad" onClick={() => setBorrar(true)}>
                Borrar registro
              </button>
            )}
          </div>
        )}
      </div>

      {tipo && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-surface/95 px-4 pt-3 pb-3 backdrop-blur safe-bottom">
          <div className="mx-auto max-w-lg">
            <button className="btn-primary" onClick={guardar}>
              <Icon name="check" className="w-5 h-5" strokeWidth={3} />
              {guardado ? 'Guardar cambios' : 'Guardar sesión'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
