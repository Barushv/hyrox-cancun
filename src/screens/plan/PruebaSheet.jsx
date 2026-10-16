import { useState } from 'react'
import Sheet from '../../components/Sheet'
import { Numero, Texto } from '../../components/Campos'
import { TIPOS_PRUEBA } from '../../engine/registro'
import { todayISO } from '../../engine/dates'

export default function PruebaSheet({ inicial, onSave, onDelete, onClose }) {
  const [p, setP] = useState(inicial ?? { id: `p${Date.now()}`, fecha: todayISO(), tipo: '3k', resultado: '', notas: '' })
  const set = (k) => (v) => setP((prev) => ({ ...prev, [k]: v }))
  const def = TIPOS_PRUEBA[p.tipo]
  const esInbody = p.tipo === 'inbody'
  const valido = esInbody ? p.peso_kg != null : p.resultado.trim() !== ''

  return (
    <Sheet title={inicial ? 'Editar prueba' : 'Nueva prueba'} onClose={onClose}>
      <div className="flex flex-col gap-4">
        <label htmlFor="pr-tipo" className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Prueba</span>
          <select id="pr-tipo" className="field" value={p.tipo} onChange={(e) => set('tipo')(e.target.value)}>
            {Object.entries(TIPOS_PRUEBA).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor="pr-fecha" className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Fecha</span>
          <input id="pr-fecha" type="date" className="field font-mono" value={p.fecha} onChange={(e) => set('fecha')(e.target.value)} />
        </label>

        {esInbody ? (
          <div className="grid grid-cols-2 gap-3">
            <Numero id="pr-peso" label="Peso" unidad="kg" step="0.1" value={p.peso_kg} onChange={set('peso_kg')} />
            <Numero id="pr-musc" label="Masa muscular" unidad="kg" step="0.1" value={p.masa_muscular_kg} onChange={set('masa_muscular_kg')} />
            <Numero id="pr-grasa" label="Grasa" unidad="%" step="0.1" value={p.grasa_pct} onChange={set('grasa_pct')} />
            <Numero id="pr-cintura" label="Cintura" unidad="cm" step="0.5" value={p.cintura_cm} onChange={set('cintura_cm')} />
          </div>
        ) : (
          <Texto id="pr-resultado" label={def.ayuda} value={p.resultado} onChange={set('resultado')} placeholder={def.placeholder} />
        )}
        <Texto id="pr-notas" label="Notas" multilinea value={p.notas} onChange={set('notas')} />

        <button className="btn-primary disabled:opacity-40" disabled={!valido} onClick={() => onSave(p)}>
          Guardar prueba
        </button>
        {inicial && (
          <button className="self-center text-sm font-semibold text-bad" onClick={() => onDelete(p.id)}>
            Borrar prueba
          </button>
        )}
      </div>
    </Sheet>
  )
}
