import { Escala, Numero, Texto } from '../../components/Campos'
import { paceTexto } from '../../engine/registro'
import { plan } from '../../data/plan'

const Z2_MAX = plan.zonas_fc.z2[1]

export default function FormRunning({ s, r, set }) {
  const pace = paceTexto(r.duracion_min, r.distancia_km)
  const esFacil = ['run_rodaje', 'run_long'].includes(s.id)
  const pasoZ2 = esFacil && r.fc_prom_helio != null && r.fc_prom_helio > Z2_MAX
  const conIntervalos = Boolean(s.bloque_principal)

  const setIntervalo = (i, campo, v) => set('intervalos', r.intervalos.map((x, j) => (j === i ? { ...x, [campo]: v } : x)))

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Numero id="run-dur" label="Duración" unidad="min" value={r.duracion_min} onChange={(v) => set('duracion_min', v)} />
        <Numero id="run-dist" label="Distancia" unidad="km" step="0.01" value={r.distancia_km} onChange={(v) => set('distancia_km', v)} />
      </div>
      {pace && (
        <p className="-mt-2 text-sm">
          Ritmo medio: <b className="font-mono tabular">{pace}</b>
        </p>
      )}

      <div className="grid grid-cols-3 gap-2">
        <Numero id="run-fcp" label="FC prom" unidad="lpm" value={r.fc_prom_helio} onChange={(v) => set('fc_prom_helio', v)} />
        <Numero id="run-fcm" label="FC máx" unidad="lpm" value={r.fc_max_helio} onChange={(v) => set('fc_max_helio', v)} />
        <Numero id="run-cad" label="Cadencia" unidad="spm" value={r.cadencia_spm} onChange={(v) => set('cadencia_spm', v)} />
      </div>
      {pasoZ2 && (
        <p className="-mt-2 rounded-lg bg-warn/10 p-2 text-xs">
          La FC promedio pasó de Z2 ({Z2_MAX} lpm). En rodajes y long run manda la FC: baja el ritmo aunque el pace se vea lento.
        </p>
      )}

      {conIntervalos && (
        <div className="card flex flex-col gap-2 p-3">
          <b className="text-sm">Repeticiones</b>
          <p className="text-xs text-muted">{s.bloque_principal}</p>
          {r.intervalos.length > 0 && (
            <div className="grid grid-cols-[24px_1fr_1fr_1fr] gap-1.5 text-[11px] uppercase tracking-wide text-muted">
              <span />
              <span className="text-center">Pace</span>
              <span className="text-center">FC prom</span>
              <span className="text-center">FC máx</span>
            </div>
          )}
          {r.intervalos.map((x, i) => (
            <div key={i} className="grid grid-cols-[24px_1fr_1fr_1fr] items-center gap-1.5">
              <span className="font-mono text-xs text-accent tabular">{i + 1}</span>
              <input
                id={`int-${i}-pace`}
                aria-label={`Repetición ${i + 1} pace`}
                className="field px-2 py-1.5 text-center font-mono tabular placeholder:text-muted/60"
                placeholder="4:30"
                value={x.pace ?? ''}
                onChange={(e) => setIntervalo(i, 'pace', e.target.value)}
              />
              <Numero compacto id={`int-${i}-fcp`} label={`Repetición ${i + 1} FC prom`} value={x.fc_prom} onChange={(v) => setIntervalo(i, 'fc_prom', v)} />
              <Numero compacto id={`int-${i}-fcm`} label={`Repetición ${i + 1} FC máx`} value={x.fc_max} onChange={(v) => setIntervalo(i, 'fc_max', v)} />
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" className="btn-ghost" onClick={() => set('intervalos', [...r.intervalos, { rep: r.intervalos.length + 1, pace: '', fc_prom: null, fc_max: null }])}>
              + Repetición
            </button>
            {r.intervalos.length > 0 && (
              <button type="button" className="btn-ghost text-muted" onClick={() => set('intervalos', r.intervalos.slice(0, -1))}>
                − Repetición
              </button>
            )}
          </div>
        </div>
      )}

      <Escala id="run-rpe" label="Esfuerzo" ayuda="RPE 1-10" min={1} max={10} value={r.rpe_1_10} onChange={(v) => set('rpe_1_10', v)} />
      <Escala id="run-rodilla" label="Rodilla" ayuda="0-10" min={0} max={10} value={r.rodilla_0_10} onChange={(v) => set('rodilla_0_10', v)} alerta={(v) => v >= 3} />

      <div className="grid grid-cols-2 gap-3">
        <Numero id="run-temp" label="Temperatura" unidad="°C" value={r.clima?.temp_c} onChange={(v) => set('clima', { ...r.clima, temp_c: v })} />
        <Numero id="run-hum" label="Humedad" unidad="%" value={r.clima?.humedad_pct} onChange={(v) => set('clima', { ...r.clima, humedad_pct: v })} />
      </div>
      <Texto id="run-notas" label="Notas" multilinea value={r.notas} onChange={(v) => set('notas', v)} placeholder="Efecto aeróbico, sensaciones, terreno…" />
    </div>
  )
}
