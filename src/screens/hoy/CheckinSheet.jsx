import { useState } from 'react'
import Sheet from '../../components/Sheet'
import { Escala, Numero } from '../../components/Campos'
import { evaluar, COLOR_LABEL, RECOMENDACION } from '../../engine/semaforo'
import { SEMAFORO_STYLE } from './semaforoStyle'

export default function CheckinSheet({ inicial, fcPromedio, onSave, onClose }) {
  const [c, setC] = useState(
    inicial ?? { sueno_horas: null, fc_reposo_lpm: null, rodilla: null, agujetas: null, energia: null, peso_kg: null, dolor_agudo: false },
  )
  const set = (k) => (v) => setC((prev) => ({ ...prev, [k]: v }))
  const { color, motivos } = evaluar(c, fcPromedio)
  const st = SEMAFORO_STYLE[color]
  const completo = ['sueno_horas', 'rodilla', 'agujetas', 'energia'].every((k) => c[k] != null)

  return (
    <Sheet title="Check-in" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-muted">Al despertar, después de ir al baño. Toma 300-400 ml de agua.</p>

        <div className="grid grid-cols-2 gap-3">
          <Numero id="ci-sueno" label="Sueño" unidad="h" step="0.25" value={c.sueno_horas} onChange={set('sueno_horas')} />
          <Numero id="ci-fc" label="FC reposo" unidad="lpm" value={c.fc_reposo_lpm} onChange={set('fc_reposo_lpm')} />
        </div>
        <p className="-mt-3 text-xs text-muted">
          {fcPromedio ? `Tu promedio de 7 días: ${fcPromedio} lpm (Helio).` : 'Con 3 días registrados la app compara tu FC con tu promedio.'}
        </p>

        <Escala id="ci-rodilla" label="Rodilla" ayuda="0 = nada, 10 = mucho dolor" min={0} max={10} value={c.rodilla} onChange={set('rodilla')} alerta={(v) => v >= 3} />
        <Escala id="ci-agujetas" label="Agujetas de piernas" ayuda="0-10" min={0} max={10} value={c.agujetas} onChange={set('agujetas')} alerta={(v) => v >= 5} />
        <Escala id="ci-energia" label="Energía" ayuda="1 = vacío, 5 = al 100" min={1} max={5} value={c.energia} onChange={set('energia')} alerta={(v) => v <= 2} />

        <div className="grid grid-cols-2 gap-3 items-end">
          <Numero id="ci-peso" label="Peso (opcional)" unidad="kg" step="0.1" value={c.peso_kg} onChange={set('peso_kg')} />
          <label htmlFor="ci-dolor" className="flex h-[42px] items-center gap-2 rounded-lg border border-line bg-bg px-3 text-sm font-semibold">
            <input id="ci-dolor" type="checkbox" className="h-4 w-4 accent-[rgb(var(--bad))]" checked={!!c.dolor_agudo} onChange={(e) => set('dolor_agudo')(e.target.checked)} />
            Dolor agudo
          </label>
        </div>

        <div className={`rounded-xl border-2 p-3 ${st.border} ${st.bgSoft}`}>
          <div className="flex items-center gap-2">
            <span className={`h-3.5 w-3.5 rounded-full ${st.dot}`} />
            <b className="font-display text-lg uppercase">{completo ? COLOR_LABEL[color] : 'Completa los datos'}</b>
          </div>
          {completo && (
            <>
              <p className="mt-1 text-sm">{RECOMENDACION[color]}</p>
              {motivos.length > 0 && <p className="mt-1 text-xs text-muted">Por: {motivos.join(' · ')}</p>}
            </>
          )}
        </div>

        <button className="btn-primary disabled:opacity-40" disabled={!completo} onClick={() => onSave({ ...c, semaforo: color, motivos })}>
          Guardar check-in
        </button>
      </div>
    </Sheet>
  )
}
