import { useEffect, useRef } from 'react'
import Icon, { iconoSesion } from '../../components/Icon'
import { resumenSesion } from '../../components/SesionDetalle'
import { plan } from '../../data/plan'
import { getDia, getSesiones, FASES, faseCorta, TIPO_SEMANA, PRIMER_DIA, TOTAL_SEMANAS } from '../../engine/calendar'
import { estadoSesion, tipoRegistro } from '../../engine/registro'
import { DIAS_LABEL, formatShort, todayISO } from '../../engine/dates'
import { useStored, KEYS } from '../../store/store'
import PruebasSection from './PruebasSection'

// Intensidad del color según la fase: de la reentrada a la carrera
const FASE_COLOR = { F0: 'bg-line', F1: 'bg-accent/35', F2: 'bg-accent/65', F3: 'bg-accent', F4: 'bg-sun' }

// Marca corta de la semana para el selector
function marcaSemana(s) {
  if (s.tipo === 'deload') return 'Descarga'
  if (s.tipo === 'taper') return 'Taper'
  if (s.tipo === 'race') return 'Carrera'
  if (/simulaci/i.test(s.notas)) return 'Simulación'
  if (/pruebas|inbody/i.test(s.notas)) return 'Pruebas'
  if (/chequeo/i.test(s.notas)) return 'Chequeo'
  return ''
}

const ESTADO = {
  registrada: { icon: 'check', clase: 'bg-ok text-white', texto: 'Registrada' },
  cancelada: { icon: 'x', clase: 'bg-line text-muted', texto: 'Cancelada' },
  omitida: { icon: 'x', clase: 'bg-line text-muted', texto: 'No va' },
  pendiente: { icon: null, clase: 'bg-warn/15 text-warn', texto: 'Sin registro' },
  futura: { icon: null, clase: 'bg-accent-soft text-accent', texto: '' },
}

function FilaSesion({ s, estado, onOpen }) {
  const st = ESTADO[estado]
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 py-2 text-left active:opacity-70">
      <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${st.clase}`}>
        <Icon name={st.icon ?? iconoSesion(s)} className="w-4 h-4" strokeWidth={st.icon ? 3 : 2} />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`block text-sm font-semibold leading-tight ${estado === 'omitida' ? 'text-muted line-through' : ''}`}>
          {s.titulo}
          {s.opcional && estado !== 'omitida' && <span className="ml-1 font-normal text-muted">(opcional)</span>}
        </span>
        <span className="block truncate text-xs text-muted">{resumenSesion(s) ?? s.momento}</span>
      </span>
      {st.texto && estado !== 'futura' && <span className="shrink-0 text-[11px] font-semibold text-muted">{st.texto}</span>}
      <Icon name="chevronRight" className="w-4 h-4 shrink-0 text-muted" />
    </button>
  )
}

export default function PlanScreen({ onOpenSesion, semanaSel, setSemanaSel }) {
  const hoy = todayISO()
  const actual = getDia(hoy)?.semana.semana ?? (hoy < PRIMER_DIA ? 0 : TOTAL_SEMANAS)
  const sel = semanaSel ?? actual
  const setSel = setSemanaSel
  const [sesiones] = useStored(KEYS.sesiones, {})
  const stripRef = useRef(null)

  useEffect(() => {
    stripRef.current?.querySelector(`[data-semana="${sel}"]`)?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [sel])

  const semana = plan.semanas.find((s) => s.semana === sel)
  const fase = FASES[semana.fase]

  // Avance de la semana: sesiones registrables, sin contar omitidas ni opcionales
  let total = 0
  let hechas = 0
  semana.dias.forEach((d) =>
    getSesiones(d).forEach((s) => {
      if (!tipoRegistro(s) || s.omitir || s.opcional) return
      total++
      if (sesiones[d.fecha]?.[s.id]) hechas++
    }),
  )

  return (
    <div className="flex flex-col gap-5 pb-28">
      <header className="safe-top px-4 pt-4">
        <div className="eyebrow">{plan.meta.nombre_plan}</div>
        <h1 className="mt-1 font-display text-[30px] font-bold uppercase leading-none">Plan</h1>
      </header>

      {/* Mapa de fases: una celda por semana */}
      <div className="px-4">
        <div className="flex gap-[3px]" role="img" aria-label="Semanas del plan coloreadas por fase">
          {plan.semanas.map((s) => (
            <button
              key={s.semana}
              onClick={() => setSel(s.semana)}
              aria-label={`Semana ${s.semana}`}
              className={`relative h-6 flex-1 rounded-[4px] ${FASE_COLOR[s.fase]} ${s.semana === sel ? 'ring-2 ring-ink ring-offset-1 ring-offset-bg' : ''}`}
            >
              {s.semana === actual && <span className="absolute -bottom-2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-ink" />}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted">
          {plan.fases.map((f) => (
            <span key={f.id} className="flex items-center gap-1">
              <span className={`h-2.5 w-2.5 rounded-sm ${FASE_COLOR[f.id]}`} />
              {faseCorta(f.id)}
            </span>
          ))}
        </div>
      </div>

      {/* Selector de semanas */}
      <div ref={stripRef} className="flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {plan.semanas.map((s) => {
          const on = s.semana === sel
          const marca = marcaSemana(s)
          return (
            <button
              key={s.semana}
              data-semana={s.semana}
              onClick={() => setSel(s.semana)}
              aria-pressed={on}
              className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-xl border px-2 py-1.5 ${on ? 'border-ink bg-ink text-bg' : 'border-line bg-surface'}`}
            >
              <span className="font-display text-lg font-bold leading-none">S{s.semana}</span>
              <span className={`text-[10px] ${on ? 'opacity-80' : 'text-muted'}`}>{marca || formatShort(s.inicio)}</span>
              {s.semana === actual && <span className={`mt-0.5 h-1 w-1 rounded-full ${on ? 'bg-bg' : 'bg-accent'}`} />}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-4 px-4">
        <section className="card flex flex-col gap-2 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="eyebrow">
                {formatShort(semana.inicio)} – {formatShort(semana.fin)}
              </div>
              <h2 className="mt-0.5 font-display text-2xl font-bold uppercase leading-none">Semana {semana.semana}</h2>
            </div>
            <span className="chip bg-accent-soft text-accent">{TIPO_SEMANA[semana.tipo] ?? semana.tipo}</span>
          </div>
          <p className="text-sm">
            <b>{fase?.nombre}.</b> <span className="text-muted">{fase?.foco}</span>
          </p>
          {semana.notas && <p className="rounded-lg bg-accent-soft p-2 text-sm">{semana.notas}</p>}
          {total > 0 && (
            <div className="flex items-center gap-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-line">
                <div className="h-full rounded-full bg-ok" style={{ width: `${(hechas / total) * 100}%` }} />
              </div>
              <span className="font-mono text-xs text-muted tabular">
                {hechas}/{total} registradas
              </span>
            </div>
          )}
        </section>

        {semana.dias.map((d) => {
          const lista = getSesiones(d)
          const esHoy = d.fecha === hoy
          return (
            <section key={d.fecha} className={`card px-3 pt-2.5 pb-1.5 ${esHoy ? 'border-accent ring-1 ring-accent' : ''}`}>
              <div className="flex items-center justify-between">
                <b className="font-display text-lg uppercase">
                  {DIAS_LABEL[d.dia]} <span className="font-semibold text-muted">{formatShort(d.fecha)}</span>
                </b>
                <span className="flex items-center gap-1.5">
                  {esHoy && <span className="chip bg-accent text-accent-on">Hoy</span>}
                  <span className={`chip ${d.nutricion_tipo === 'alta' ? 'bg-sun/25 text-ink' : 'bg-line text-muted'}`}>Día {d.nutricion_tipo}</span>
                </span>
              </div>
              {d.indicacion && <p className="py-2 text-sm">{d.indicacion}</p>}
              <div className="divide-y divide-line">
                {lista.map((s, i) => (
                  <FilaSesion key={i} s={s} estado={estadoSesion(sesiones[d.fecha]?.[s.id], s, d.fecha, hoy)} onOpen={() => onOpenSesion(d.fecha, i)} />
                ))}
              </div>
            </section>
          )
        })}

        {semana.notas_nutricion && <p className="rounded-xl bg-sun/15 p-3 text-sm">{semana.notas_nutricion}</p>}

        <PruebasSection />
      </div>
    </div>
  )
}
