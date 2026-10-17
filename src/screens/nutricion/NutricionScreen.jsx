import { useState } from 'react'
import Icon from '../../components/Icon'
import { Escala, Texto } from '../../components/Campos'
import MacroSummary from '../hoy/MacroSummary'
import PesoChart from './PesoChart'
import ListaCompras from './ListaCompras'
import { nutricion } from '../../data/plan'
import { useDiaPlan } from '../../hooks/useDiaPlan'
import { suplementosDelDia, avisoNutricion, etiquetaEquivalencia } from '../../engine/nutricion'
import { pesajes, evaluarPeso } from '../../engine/peso'
import { getDia } from '../../engine/calendar'
import { todayISO, addDays, formatShort, weekdayKey, DIAS_LABEL } from '../../engine/dates'
import { useStored, KEYS } from '../../store/store'

const META_AGUA_DEFAULT = 3

function Seccion({ titulo, accion, children }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="h-section">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}

function Guia({ titulo, children }) {
  return (
    <details className="group border-b border-line last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between p-3 text-sm font-semibold">
        {titulo}
        <Icon name="chevronDown" className="w-4 h-4 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-3 pb-3 text-sm">{children}</div>
    </details>
  )
}

function Agua({ litros, meta, onChange }) {
  const pct = Math.min(100, (litros / meta) * 100)
  return (
    <div className="card flex flex-col gap-3 p-3">
      <div className="flex items-end justify-between">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-4xl font-bold leading-none tabular">{litros.toFixed(2).replace(/0$/, '')}</span>
          <span className="font-mono text-sm text-muted">/ {meta} L</span>
        </div>
        <Icon name="drop" className="w-7 h-7 text-accent" />
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-line">
        <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${pct}%` }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <button className="rounded-xl border border-line py-2.5 text-sm font-semibold disabled:opacity-40" disabled={litros <= 0} onClick={() => onChange(Math.max(0, litros - 0.25))}>
          − 250 ml
        </button>
        <button className="rounded-xl bg-accent-soft py-2.5 text-sm font-bold text-accent" onClick={() => onChange(litros + 0.25)}>
          + 250 ml
        </button>
        <button className="rounded-xl bg-accent py-2.5 text-sm font-bold text-accent-on" onClick={() => onChange(litros + 0.5)}>
          + 500 ml
        </button>
      </div>
    </div>
  )
}

export default function NutricionScreen({ fecha, setFecha }) {
  const hoy = todayISO()
  const { info, sesiones, dia, consumido, extraKcal } = useDiaPlan(fecha)
  const [registroAll, setRegistro] = useStored(KEYS.nutricionDia, {})
  const [checkins] = useStored(KEYS.checkins, {})
  const [ajustes, setAjustes] = useStored(KEYS.ajustes, {})
  const [deshacer, setDeshacer] = useState(false)

  const reg = registroAll[fecha] ?? {}
  const setReg = (campo, valor) => setRegistro((all) => ({ ...all, [fecha]: { ...(all[fecha] ?? {}), [campo]: valor } }))
  const metaAgua = ajustes.metaAgua ?? META_AGUA_DEFAULT

  const listaAjustes = ajustes.ajustesPeso ?? []
  const semanaHoy = getDia(hoy)?.semana.semana ?? 0
  const evaluacion = evaluarPeso(checkins, hoy, semanaHoy, listaAjustes)
  const puntos = pesajes(checkins)

  const supl = info ? suplementosDelDia({ info, sesiones, dia }).sort((a, b) => Number(b.hoy) - Number(a.hoy)) : []
  const tomados = reg.suplementos ?? []
  const aviso = info ? avisoNutricion(info, fecha, ajustes.fechaOla) : null

  const aplicarAjuste = () =>
    setAjustes((a) => ({ ...a, ajustesPeso: [...(a.ajustesPeso ?? []), { fecha: hoy, kcal: evaluacion.kcal, motivo: evaluacion.texto }] }))

  return (
    <div className="flex flex-col gap-6 px-4 pb-28">
      <header className="safe-top sticky top-0 z-40 -mx-4 bg-bg/95 px-4 pt-4 pb-3 backdrop-blur">
        <div className="eyebrow">{info ? `Día ${info.dia.nutricion_tipo}` : 'Fuera del plan'}</div>
        <div className="mt-1 flex items-center gap-1">
          <button onClick={() => setFecha(addDays(fecha, -1))} className="-ml-2 rounded-full p-1.5 text-muted active:bg-accent-soft" aria-label="Día anterior">
            <Icon name="chevronLeft" />
          </button>
          <h1 className="font-display text-[30px] font-bold uppercase leading-none">
            Nutrición <span className="font-semibold text-muted">{fecha === hoy ? 'hoy' : `${DIAS_LABEL[weekdayKey(fecha)].slice(0, 3)} ${formatShort(fecha)}`}</span>
          </h1>
          <button onClick={() => setFecha(addDays(fecha, 1))} className="rounded-full p-1.5 text-muted active:bg-accent-soft" aria-label="Día siguiente">
            <Icon name="chevronRight" />
          </button>
        </div>
      </header>

      {aviso && (
        <div className="rounded-xl bg-sun/15 p-3 text-sm">
          <b className="block">{aviso.titulo}</b>
          {aviso.texto}
        </div>
      )}

      {dia && (
        <Seccion titulo="Metas del día">
          <MacroSummary meta={dia.meta} consumido={consumido} tipo={info.dia.nutricion_tipo} ajuste={dia.ajuste} />
          <p className="text-xs text-muted">
            Marca tus comidas en la pestaña Hoy y se suman aquí.
            {extraKcal ? ` La meta incluye ${extraKcal > 0 ? '+' : ''}${extraKcal} kcal por ajuste de peso.` : ''}
          </p>
        </Seccion>
      )}

      <Seccion titulo="Hidratación">
        <Agua litros={reg.agua_l ?? 0} meta={metaAgua} onChange={(v) => setReg('agua_l', Math.round(v * 100) / 100)} />
      </Seccion>

      {supl.length > 0 && (
        <Seccion titulo="Suplementos">
          <div className="card flex flex-col divide-y divide-line">
            {supl.map((s) => {
              const hecho = tomados.includes(s.nombre)
              return (
                <button
                  key={s.nombre}
                  onClick={() => setReg('suplementos', hecho ? tomados.filter((n) => n !== s.nombre) : [...tomados, s.nombre])}
                  aria-pressed={hecho}
                  className={`flex items-start gap-3 p-3 text-left ${!s.hoy && !hecho ? 'opacity-60' : ''}`}
                >
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${hecho ? 'border-ok bg-ok text-white' : 'border-line'}`}>
                    {hecho && <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <b className="text-sm">{s.nombre}</b>
                      {s.hoy && <span className="chip bg-accent-soft text-accent">Hoy</span>}
                    </span>
                    <span className="block text-xs text-muted">{s.dosis}</span>
                    <span className="block text-xs font-semibold">{s.cuando}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </Seccion>
      )}

      <Seccion titulo="Peso y ajuste">
        <div className="card">
          <PesoChart checkins={checkins} puntos={puntos} />
          <div className="flex flex-col gap-2 border-t border-line p-3">
            <div className="flex items-center gap-2">
              <span
                className={`chip ${
                  evaluacion.estado === 'ok' ? 'bg-ok/10 text-ok' : evaluacion.estado === 'ajustar' ? 'bg-warn/15 text-warn' : 'bg-line text-muted'
                }`}
              >
                {{ ok: 'En meta', ajustar: 'Toca ajustar', espera: 'Aún no', faltan: 'Faltan pesajes', reciente: 'Ajustado' }[evaluacion.estado]}
              </span>
              {evaluacion.actual != null && <span className="font-mono text-xs text-muted tabular">prom 7 días {evaluacion.actual.toFixed(2)} kg</span>}
            </div>
            <p className="text-sm">{evaluacion.texto}</p>
            {evaluacion.estado === 'ajustar' && (
              <button className="btn-primary" onClick={aplicarAjuste}>
                Aplicar {evaluacion.kcal > 0 ? '+' : ''}
                {evaluacion.kcal} kcal al día
              </button>
            )}
            {listaAjustes.length > 0 && (
              <div className="flex flex-col gap-1 pt-1 text-xs text-muted">
                {listaAjustes.map((a, i) => (
                  <span key={i} className="font-mono tabular">
                    {formatShort(a.fecha)}: {a.kcal > 0 ? '+' : ''}
                    {a.kcal} kcal
                  </span>
                ))}
                {deshacer ? (
                  <span className="flex gap-3 pt-1">
                    <button
                      className="font-semibold text-bad"
                      onClick={() => {
                        setAjustes((a) => ({ ...a, ajustesPeso: (a.ajustesPeso ?? []).slice(0, -1) }))
                        setDeshacer(false)
                      }}
                    >
                      Sí, quitar el último
                    </button>
                    <button className="font-semibold" onClick={() => setDeshacer(false)}>
                      Cancelar
                    </button>
                  </span>
                ) : (
                  <button className="self-start pt-1 font-semibold text-bad" onClick={() => setDeshacer(true)}>
                    Quitar el último ajuste
                  </button>
                )}
              </div>
            )}
            <p className="text-xs text-muted">{nutricion.ajuste.revision}</p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="¿Cómo te fue?">
        <div className="card flex flex-col gap-4 p-3">
          <Escala id="nut-hambre" label="Hambre" ayuda="1 = nada, 5 = mucha" min={1} max={5} value={reg.hambre_1_5 ?? null} onChange={(v) => setReg('hambre_1_5', v)} />
          <Texto id="nut-notas" label="Notas" multilinea value={reg.notas} onChange={(v) => setReg('notas', v)} placeholder="No llegué a la cena, cambié arroz por papa…" />
        </div>
      </Seccion>

      <Seccion titulo="Lista de compras">
        <ListaCompras />
      </Seccion>

      <Seccion titulo="Guía rápida">
        <div className="card">
          <Guia titulo="Antes, durante y después de entrenar">
            <dl className="flex flex-col gap-2">
              {Object.entries(nutricion.timing).map(([k, v]) => (
                <div key={k}>
                  <dt className="font-semibold">{{ pre: 'Antes', durante: 'Durante', post: 'Después', distribucion: 'Reparto del día' }[k] ?? k}</dt>
                  <dd className="text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </Guia>
          <Guia titulo="Hidratación">
            <ul className="flex list-disc flex-col gap-1 pl-4 text-muted">
              {nutricion.hidratacion.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted">La meta de {metaAgua} L se cambia en Ajustes.</p>
          </Guia>
          <Guia titulo="Equivalencias">
            <ul className="divide-y divide-line">
              {Object.entries(nutricion.equivalencias_aprox)
                .filter(([k]) => k !== 'nota')
                .map(([k, v]) => (
                  <li key={k} className="flex justify-between gap-3 py-1.5">
                    <span>{etiquetaEquivalencia(k)}</span>
                    <span className="shrink-0 text-right font-mono text-xs text-muted">{v}</span>
                  </li>
                ))}
            </ul>
            <p className="mt-2 text-xs text-muted">{nutricion.equivalencias_aprox.nota}</p>
          </Guia>
          <Guia titulo="Si no llegas a comer todo">
            <p className="text-muted">{nutricion.ajuste.si_no_llegas_a_comer_todo}</p>
          </Guia>
          <Guia titulo="Alertas del plan">
            <ul className="flex list-disc flex-col gap-1 pl-4 text-muted">
              {nutricion.alertas.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </Guia>
        </div>
      </Seccion>
    </div>
  )
}
