import Icon from '../../components/Icon'
import { Escala, Numero, Texto } from '../../components/Campos'
import { seriesAnteriores, sugerenciaProgresion } from '../../engine/registro'
import { formatShort } from '../../engine/dates'

function Ejercicio({ idx, ej, plantilla, anterior, onChange }) {
  const prev = seriesAnteriores(anterior, ej.nombre)
  const sugerencia = sugerenciaProgresion(prev, plantilla?.reps)
  const setSerie = (i, campo, v) => onChange({ ...ej, series: ej.series.map((x, j) => (j === i ? { ...x, [campo]: v } : x)) })
  const ultimo = prev[prev.length - 1]

  return (
    <div className="card flex flex-col gap-2 p-3">
      <div className="flex items-start justify-between gap-3">
        <b className="text-sm leading-snug">{ej.nombre}</b>
        {plantilla && (
          <span className="shrink-0 font-mono text-xs text-muted tabular">
            {plantilla.series} × {plantilla.reps}
          </span>
        )}
      </div>
      {prev.length > 0 && (
        <p className="font-mono text-[11px] text-muted tabular">
          {formatShort(anterior.fecha)}: {prev.map((x) => `${x.peso_kg ?? '–'}×${x.reps ?? '–'}`).join(' · ')}
        </p>
      )}
      {sugerencia && (
        <p className="flex items-center gap-1.5 text-xs font-semibold text-ok">
          <Icon name="chevronRight" className="w-3.5 h-3.5 -rotate-90" strokeWidth={3} />
          {sugerencia}
        </p>
      )}

      <div className="grid grid-cols-[24px_1fr_1fr_1fr] items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted">
        <span />
        <span className="text-center">Peso kg</span>
        <span className="text-center">Reps</span>
        <span className="text-center">RIR</span>
      </div>
      {ej.series.map((x, i) => (
        <div key={i} className="grid grid-cols-[24px_1fr_1fr_1fr] items-center gap-1.5">
          <span className="font-mono text-xs text-accent tabular">{i + 1}</span>
          <Numero compacto id={`gym-${idx}-${i}-peso`} label={`Serie ${i + 1} peso`} step="0.5" value={x.peso_kg} placeholder={ultimo?.peso_kg != null ? String(ultimo.peso_kg) : ''} onChange={(v) => setSerie(i, 'peso_kg', v)} />
          <Numero compacto id={`gym-${idx}-${i}-reps`} label={`Serie ${i + 1} reps`} value={x.reps} onChange={(v) => setSerie(i, 'reps', v)} />
          <Numero compacto id={`gym-${idx}-${i}-rir`} label={`Serie ${i + 1} RIR`} value={x.rir} onChange={(v) => setSerie(i, 'rir', v)} />
        </div>
      ))}
      <div className="flex gap-2">
        <button type="button" className="btn-ghost" onClick={() => onChange({ ...ej, series: [...ej.series, { peso_kg: ultimo?.peso_kg ?? null, reps: null, rir: null }] })}>
          + Serie
        </button>
        {ej.series.length > 1 && (
          <button type="button" className="btn-ghost text-muted" onClick={() => onChange({ ...ej, series: ej.series.slice(0, -1) })}>
            − Serie
          </button>
        )}
      </div>
    </div>
  )
}

export default function FormGym({ s, r, set, anterior }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-muted">El peso de la última vez aparece en gris. Si una serie no la hiciste, déjala vacía o quítala.</p>
      {r.ejercicios.map((ej, i) => (
        <Ejercicio
          key={ej.nombre}
          idx={i}
          ej={ej}
          plantilla={s.ejercicios?.find((e) => e.ejercicio === ej.nombre)}
          anterior={anterior}
          onChange={(nuevo) => set('ejercicios', r.ejercicios.map((x, j) => (j === i ? nuevo : x)))}
        />
      ))}
      <Escala id="gym-rpe" label="Esfuerzo de la sesión" ayuda="RPE 1-10" min={1} max={10} value={r.rpe_sesion} onChange={(v) => set('rpe_sesion', v)} />
      <Texto id="gym-notas" label="Notas" multilinea value={r.notas} onChange={(v) => set('notas', v)} placeholder="Molestias, máquina distinta, etc." />
    </div>
  )
}
