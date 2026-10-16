import { useState } from 'react'
import Sheet from '../../components/Sheet'
import Icon from '../../components/Icon'
import { calcularDia } from '../../engine/dia'
import { generarICS, compartirArchivo } from '../../engine/ics'
import { addDays, formatShort } from '../../engine/dates'
import { read, KEYS } from '../../store/store'

// Exporta la línea de tiempo a un .ics con alarmas: los recordatorios llegan aunque la app esté cerrada
export default function CalendarioSheet({ fecha, onClose }) {
  const [estado, setEstado] = useState(null)

  const generar = async (dias) => {
    const stores = {
      checkins: read(KEYS.checkins, {}),
      hechosAll: read(KEYS.hechos, {}),
      ajustes: read(KEYS.ajustes, {}),
      varFecha: read(KEYS.variantesFecha, {}),
      anclasAll: read(KEYS.anclas, {}),
    }
    const lista = Array.from({ length: dias }, (_, i) => addDays(fecha, i))
      .map((f) => ({ fecha: f, dia: calcularDia(f, stores).dia }))
      .filter((d) => d.dia)
      .map((d) => ({ fecha: d.fecha, items: d.dia.items }))
    if (!lista.length) {
      setEstado('Esos días están fuera del plan.')
      return
    }
    const nombre = dias === 1 ? `hyrox-${fecha}.ics` : `hyrox-${fecha}-${dias}dias.ics`
    const r = await compartirArchivo(nombre, generarICS(lista), 'text/calendar')
    setEstado(
      r === 'cancelado'
        ? null
        : r === 'compartido'
          ? 'Listo. Elige Calendario para agregar los eventos.'
          : 'Se descargó el archivo. Ábrelo para agregarlo a tu calendario.',
    )
  }

  return (
    <Sheet title="Recordatorios" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Cada toma, sesión y suplemento se agrega a tu calendario con alarma (las sesiones avisan 15 min antes). Usa tus horarios y variantes actuales; si los cambias, vuelve a generarlo.
        </p>
        <button className="btn-primary" onClick={() => generar(1)}>
          <Icon name="calendar" className="w-5 h-5" />
          Solo el {formatShort(fecha)}
        </button>
        <button className="w-full rounded-xl border border-line py-3 font-semibold" onClick={() => generar(7)}>
          Los próximos 7 días
        </button>
        <p className="text-xs text-muted">
          Los martes que aún no tienen check-in salen con la clase Engine; si ese día tu semáforo no está en verde, sáltala. Se respetan las variantes que elegiste.
        </p>
        {estado && <p className="rounded-lg bg-accent-soft p-2 text-sm">{estado}</p>}
      </div>
    </Sheet>
  )
}
