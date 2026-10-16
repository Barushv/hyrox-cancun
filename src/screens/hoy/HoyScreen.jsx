import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { faseCorta, TIPO_SEMANA, TOTAL_SEMANAS, PRIMER_DIA, ULTIMO_DIA } from '../../engine/calendar'
import { etiquetaVariante } from '../../engine/diario'
import { promedioFc } from '../../engine/semaforo'
import { estadoSesion } from '../../engine/registro'
import { todayISO, addDays, diffDays, weekdayKey, formatShort, toMin, nowMin, DIAS_LABEL } from '../../engine/dates'
import { useStored, KEYS } from '../../store/store'
import { useDiaPlan } from '../../hooks/useDiaPlan'
import CheckinCard from './CheckinCard'
import CheckinSheet from './CheckinSheet'
import SesionCard from './SesionCard'
import Timeline from './Timeline'
import MacroSummary from './MacroSummary'
import AnclasSheet from './AnclasSheet'
import CalendarioSheet from './CalendarioSheet'

const FECHA_CARRERA_DEFAULT = '2027-02-19'

function Encabezado({ fecha, setFecha, info, diasCarrera }) {
  const esHoy = fecha === todayISO()
  const suave = info && ['deload', 'taper', 'race'].includes(info.semana.tipo)
  return (
    <header className="safe-top sticky top-0 z-40 bg-bg/95 backdrop-blur">
      <div className="flex items-end justify-between gap-3 px-4 pt-4 pb-3">
        <div className="min-w-0">
          <div className="eyebrow flex flex-wrap items-center gap-x-2">
            {info ? (
              <>
                <span className="text-accent">
                  Sem {info.semana.semana} / {TOTAL_SEMANAS}
                </span>
                <span>· {faseCorta(info.semana.fase)}</span>
                {suave && <span className="chip bg-sun/25 text-ink normal-case tracking-normal">{TIPO_SEMANA[info.semana.tipo]}</span>}
              </>
            ) : (
              <span>Fuera del plan</span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-1">
            <button onClick={() => setFecha(addDays(fecha, -1))} className="-ml-2 rounded-full p-1.5 text-muted active:bg-accent-soft" aria-label="Día anterior">
              <Icon name="chevronLeft" />
            </button>
            <h1 className="font-display text-[30px] font-bold uppercase leading-none">
              {esHoy ? 'Hoy' : DIAS_LABEL[weekdayKey(fecha)]}
              <span className="ml-2 text-muted font-semibold">{esHoy ? DIAS_LABEL[weekdayKey(fecha)].slice(0, 3) + ' ' : ''}{formatShort(fecha)}</span>
            </h1>
            <button onClick={() => setFecha(addDays(fecha, 1))} className="rounded-full p-1.5 text-muted active:bg-accent-soft" aria-label="Día siguiente">
              <Icon name="chevronRight" />
            </button>
          </div>
        </div>
        {diasCarrera >= 0 && (
          <div className="shrink-0 text-right">
            <div className="font-display text-3xl font-extrabold leading-none text-accent tabular">{diasCarrera}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">días a Cancún</div>
          </div>
        )}
      </div>
    </header>
  )
}

function Nota({ icon = 'info', children }) {
  return (
    <div className="flex gap-2.5 rounded-xl bg-accent-soft p-3 text-sm">
      <Icon name={icon} className="mt-0.5 w-4 h-4 shrink-0 text-accent" />
      <div>{children}</div>
    </div>
  )
}

export default function HoyScreen({ fecha, setFecha, onOpenSesion }) {
  const hoy = todayISO()
  const [checkins, setCheckins] = useStored(KEYS.checkins, {})
  const [, setHechos] = useStored(KEYS.hechos, {})
  const [ajustes] = useStored(KEYS.ajustes, {})
  const [, setVarFecha] = useStored(KEYS.variantesFecha, {})
  const [, setAnclas] = useStored(KEYS.anclas, {})
  const [registros] = useStored(KEYS.sesiones, {})
  const [sheet, setSheet] = useState(null)
  const [, setTick] = useState(0)

  // Refresca cada minuto para mover el marcador de "ahora"
  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60000)
    return () => clearInterval(t)
  }, [])

  const { info, checkin, sesiones, sinSesiones, variante, vars, auto, dia, hechos, consumido } = useDiaPlan(fecha)
  const diasCarrera = diffDays(hoy, ajustes.fechaOla || FECHA_CARRERA_DEFAULT)

  if (!info) {
    const antes = fecha < PRIMER_DIA
    return (
      <>
        <Encabezado fecha={fecha} setFecha={setFecha} info={null} diasCarrera={diasCarrera} />
        <div className="flex flex-col items-center gap-3 px-6 pt-16 text-center">
          <Icon name={antes ? 'calendar' : 'flag'} className="w-10 h-10 text-accent" />
          <p className="font-display text-2xl font-bold uppercase">{antes ? 'Aún no empieza el plan' : 'Plan terminado'}</p>
          <p className="text-sm text-muted">
            {antes ? `El plan arranca el ${formatShort(PRIMER_DIA)}.` : `El plan terminó el ${formatShort(ULTIMO_DIA)}.`}
          </p>
          <button className="btn-ghost" onClick={() => setFecha(antes ? PRIMER_DIA : hoy)}>
            {antes ? 'Ir al primer día' : 'Volver a hoy'}
          </button>
        </div>
      </>
    )
  }

  const esHoy = fecha === hoy
  const esFuturo = fecha > hoy
  const semaforo = checkin?.semaforo

  let actualKey = null
  if (esHoy && dia) {
    const ahora = nowMin()
    dia.items.forEach((it) => {
      if (toMin(it.hora) <= ahora) actualKey = it.key
    })
  }

  const toggleHecho = (key) =>
    setHechos((all) => {
      const lista = all[fecha] ?? []
      return { ...all, [fecha]: lista.includes(key) ? lista.filter((k) => k !== key) : [...lista, key] }
    })

  return (
    <>
      <Encabezado fecha={fecha} setFecha={setFecha} info={info} diasCarrera={diasCarrera} />

      <div className="flex flex-col gap-5 px-4 pb-28">
        {!esHoy && (
          <button onClick={() => setFecha(hoy)} className="btn-ghost -mt-1 self-start bg-accent-soft">
            Volver a hoy
          </button>
        )}

        <CheckinCard checkin={checkin} esFuturo={esFuturo} onOpen={() => setSheet('checkin')} />

        {(info.semana.notas || info.dia.indicacion || info.semana.notas_nutricion) && (
          <div className="flex flex-col gap-2">
            {info.dia.indicacion && <Nota icon="flag">{info.dia.indicacion}</Nota>}
            {info.semana.notas && <Nota>{info.semana.notas}</Nota>}
            {info.semana.notas_nutricion && <Nota icon="food">{info.semana.notas_nutricion}</Nota>}
          </div>
        )}

        {!sinSesiones && (
          <section className="flex flex-col gap-2">
            <h2 className="h-section">Entrenamiento</h2>
            {sesiones.map((s, i) => (
              <SesionCard
                key={i}
                s={s}
                omitidaPorSemaforo={s.opcional && semaforo && semaforo !== 'verde'}
                semanaRoja={semaforo === 'rojo'}
                estado={estadoSesion(registros[fecha]?.[s.id], s, fecha, hoy)}
                esFuturo={esFuturo}
                onRegistrar={() => onOpenSesion(fecha, i)}
              />
            ))}
          </section>
        )}

        {dia && (
          <section className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h2 className="h-section">Tu día</h2>
              <span className="flex">
                {!sinSesiones && Object.keys(variante.anclas).length > 0 && (
                  <button className="btn-ghost flex items-center gap-1" onClick={() => setSheet('anclas')}>
                    <Icon name="clock" className="w-4 h-4" />
                    Horas
                  </button>
                )}
                <button className="btn-ghost flex items-center gap-1" onClick={() => setSheet('calendario')}>
                  <Icon name="alarm" className="w-4 h-4" />
                  Recordatorios
                </button>
              </span>
            </div>

            {vars.length > 1 && !sinSesiones && (
              <div className="grid gap-1 rounded-xl border border-line bg-surface p-1" style={{ gridTemplateColumns: `repeat(${vars.length}, minmax(0,1fr))` }} role="radiogroup" aria-label="Variante del día">
                {vars.map((v) => {
                  const on = v.id === variante.id
                  return (
                    <button
                      key={v.id}
                      role="radio"
                      aria-checked={on}
                      onClick={() => setVarFecha((all) => ({ ...all, [fecha]: v.id }))}
                      className={`rounded-lg px-2 py-2 text-xs font-semibold leading-tight transition-colors ${on ? 'bg-ink text-bg' : 'text-muted'}`}
                    >
                      {etiquetaVariante(v)}
                    </button>
                  )
                })}
              </div>
            )}
            {auto && <p className="text-xs text-muted">{auto}</p>}
            {vars.length === 1 && !sinSesiones && <p className="text-xs text-muted">{variante.variante}</p>}

            <Timeline items={dia.items} hechos={hechos} actualKey={actualKey} onToggle={toggleHecho} />
          </section>
        )}

        {dia && (
          <section className="flex flex-col gap-2">
            <h2 className="h-section">Nutrición de hoy</h2>
            <MacroSummary meta={dia.meta} consumido={consumido} tipo={info.dia.nutricion_tipo} ajuste={dia.ajuste} />
          </section>
        )}
      </div>

      {sheet === 'checkin' && (
        <CheckinSheet
          inicial={checkin}
          fcPromedio={promedioFc(checkins, fecha)}
          onClose={() => setSheet(null)}
          onSave={(data) => {
            setCheckins((all) => ({ ...all, [fecha]: data }))
            setSheet(null)
          }}
        />
      )}

      {sheet === 'calendario' && <CalendarioSheet fecha={fecha} onClose={() => setSheet(null)} />}

      {sheet === 'anclas' && variante && (
        <AnclasSheet
          base={variante.anclas}
          actuales={dia.anclas}
          onClose={() => setSheet(null)}
          onSave={(val) => {
            setAnclas((all) => ({ ...all, [fecha]: { ...(all[fecha] ?? {}), [variante.id]: val } }))
            setSheet(null)
          }}
          onReset={() => {
            setAnclas((all) => {
              const copia = { ...(all[fecha] ?? {}) }
              delete copia[variante.id]
              return { ...all, [fecha]: copia }
            })
            setSheet(null)
          }}
        />
      )}
    </>
  )
}
