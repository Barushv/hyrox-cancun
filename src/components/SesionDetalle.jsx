// Piezas compartidas para mostrar una sesión del plan (Hoy, Plan y pantalla de sesión)
import { plan } from '../data/plan'
import { metaProgresion } from '../engine/registro'

// Un ejercicio del plan: series × reps, y si el plan los trae, intensidad, descanso, estación y meta de la fase
export function EjercicioPlan({ e, semana, compacto = false }) {
  const meta = metaProgresion(plan.progresion_gym, e.ejercicio, semana)
  return (
    <li className={`flex flex-col gap-0.5 ${compacto ? '' : 'py-2'}`}>
      <div className="flex justify-between gap-3">
        <span className="flex flex-wrap items-center gap-1.5">
          {!compacto && <span>{e.ejercicio}</span>}
          {e.especifico_hyrox && <span className="chip bg-sun/25 text-ink">Hyrox</span>}
        </span>
        {!compacto && (
          <span className="shrink-0 font-mono text-xs text-muted tabular">
            {e.series} × {e.reps}
          </span>
        )}
      </div>
      {(e.intensidad || e.descanso) && (
        <span className="text-xs text-muted">
          {[e.intensidad, e.descanso && `descanso ${e.descanso}`].filter(Boolean).join(' · ')}
        </span>
      )}
      {e.estacion && <span className="text-xs text-accent">Para: {e.estacion}</span>}
      {meta && (
        <span className="text-xs">
          <b>Meta {meta.fase}:</b> {meta.meta}
        </span>
      )}
    </li>
  )
}

export const CARGA_STYLE = {
  dura: 'bg-bad/10 text-bad',
  'media-dura': 'bg-warn/15 text-warn',
  media: 'bg-sun/20 text-ink',
  'facil-media': 'bg-accent-soft text-accent',
  facil: 'bg-ok/10 text-ok',
  nula: 'bg-line text-muted',
}

// La carga es un identificador en el JSON; aquí se muestra con acentos
export const CARGA_LABEL = { facil: 'fácil', 'facil-media': 'fácil-media', 'media-dura': 'media-dura', media: 'media', dura: 'dura', nula: 'descanso' }

// El JSON puede traer la carga con o sin acento ("facil" o "fácil"): se compara sin acentos
const sinAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

export function CargaChip({ carga }) {
  if (!carga) return null
  const k = sinAcento(carga)
  return <span className={`chip ${CARGA_STYLE[k] ?? 'bg-line text-muted'}`}>{CARGA_LABEL[k] ?? carga}</span>
}

// Línea principal de la sesión. En clases, la indicación de la plantilla es más concreta que el texto general de la semana.
export const resumenSesion = (s) => s.parametros ?? s.bloque_principal ?? (s.tipo === 'clase' ? s.indicaciones : s.indicacion_semana)

export function tieneDetalle(s) {
  const resumen = resumenSesion(s)
  return Boolean(s.ejercicios || s.estructura || (s.indicaciones && s.indicaciones !== resumen) || (s.indicacion_semana && s.indicacion_semana !== resumen))
}

export default function SesionDetalle({ s, semana }) {
  const resumen = resumenSesion(s)
  return (
    <div className="flex flex-col gap-3 text-sm">
      {s.indicacion_semana && s.indicacion_semana !== resumen && (
        <p>
          <b>Esta semana:</b> {s.indicacion_semana}
        </p>
      )}
      {s.estructura && (
        <ol className="flex flex-col gap-1">
          {s.estructura.map((e, i) => (
            <li key={i} className="flex gap-2">
              <span className="font-mono text-xs text-accent tabular">{i + 1}</span>
              {e}
            </li>
          ))}
        </ol>
      )}
      {s.ejercicios && (
        <ul className="divide-y divide-line">
          {s.ejercicios.map((e, i) => (
            <EjercicioPlan key={i} e={e} semana={semana} />
          ))}
        </ul>
      )}
      {s.indicaciones && s.indicaciones !== resumen && <p className="text-muted">{s.indicaciones}</p>}
    </div>
  )
}
