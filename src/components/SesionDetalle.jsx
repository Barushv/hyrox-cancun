// Piezas compartidas para mostrar una sesión del plan (Hoy, Plan y pantalla de sesión)

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

export function CargaChip({ carga }) {
  if (!carga) return null
  return <span className={`chip ${CARGA_STYLE[carga] ?? 'bg-line text-muted'}`}>{CARGA_LABEL[carga] ?? carga}</span>
}

// Línea principal de la sesión. En clases, la indicación de la plantilla es más concreta que el texto general de la semana.
export const resumenSesion = (s) => s.parametros ?? s.bloque_principal ?? (s.tipo === 'clase' ? s.indicaciones : s.indicacion_semana)

export function tieneDetalle(s) {
  const resumen = resumenSesion(s)
  return Boolean(s.ejercicios || s.estructura || (s.indicaciones && s.indicaciones !== resumen) || (s.indicacion_semana && s.indicacion_semana !== resumen))
}

export default function SesionDetalle({ s }) {
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
            <li key={i} className="flex justify-between gap-3 py-1.5">
              <span>{e.ejercicio}</span>
              <span className="shrink-0 font-mono text-xs text-muted tabular">
                {e.series} × {e.reps}
              </span>
            </li>
          ))}
        </ul>
      )}
      {s.indicaciones && s.indicaciones !== resumen && <p className="text-muted">{s.indicaciones}</p>}
    </div>
  )
}
