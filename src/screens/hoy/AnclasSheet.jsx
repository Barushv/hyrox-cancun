import { useState } from 'react'
import Sheet from '../../components/Sheet'
import { ANCLA_LABEL } from '../../engine/diario'

// Cambia la hora de las sesiones; el pre, el post y el despertar se recalculan solos
export default function AnclasSheet({ base, actuales, onSave, onReset, onClose }) {
  const [val, setVal] = useState(actuales)
  return (
    <Sheet title="Horario de hoy" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">Cambia la hora de tus sesiones. Despertar, pre y post se mueven con ellas; las 5 comidas fijas no cambian.</p>
        {Object.keys(base).map((ref) => (
          <label key={ref} htmlFor={`ancla-${ref}`} className="flex items-center justify-between gap-3">
            <span className="font-semibold">{ANCLA_LABEL[ref] ?? ref}</span>
            <input
              id={`ancla-${ref}`}
              type="time"
              step="300"
              className="field w-36 font-mono tabular"
              value={val[ref]}
              onChange={(e) => setVal((v) => ({ ...v, [ref]: e.target.value }))}
            />
          </label>
        ))}
        <button className="btn-primary" onClick={() => onSave(val)}>
          Aplicar horario
        </button>
        <button className="btn-ghost self-center" onClick={onReset}>
          Volver al horario del plan
        </button>
      </div>
    </Sheet>
  )
}
