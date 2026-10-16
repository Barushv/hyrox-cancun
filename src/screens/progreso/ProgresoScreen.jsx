import { useState } from 'react'
import MiniChart from '../../components/MiniChart'
import { plan } from '../../data/plan'
import { adherencia, serieCheckin, progresionGym, serieZ2, parseTiempo, fmtTiempo, fmtPace } from '../../engine/progreso'
import { TIPOS_PRUEBA } from '../../engine/registro'
import { addDays, formatShort, fromISO, todayISO } from '../../engine/dates'
import { useStored, KEYS } from '../../store/store'

const ROMA = plan.linea_base_carreras.roma_2026
const METAS = plan.linea_base_carreras.metas_hipotesis
const INBODY_BASE = plan.meta.linea_base_inbody_2026_06_23
const Z2_MAX = plan.zonas_fc.z2[1]

function Seccion({ titulo, nota, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="h-section">{titulo}</h2>
      {nota && <p className="-mt-1 text-xs text-muted">{nota}</p>}
      {children}
    </section>
  )
}

function Tile({ valor, total, label }) {
  const pct = total ? Math.round((valor / total) * 100) : null
  return (
    <div className="card flex flex-col gap-0.5 p-3">
      <span className="font-display text-3xl font-bold leading-none tabular">{pct != null ? `${pct}%` : '–'}</span>
      <span className="font-mono text-[11px] text-muted tabular">
        {valor}/{total}
      </span>
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </div>
  )
}

const SEM_CLASE = { verde: 'bg-ok', amarillo: 'bg-warn', rojo: 'bg-bad' }
const SEM_LABEL = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' }

// Últimas 4 semanas de semáforo, de lunes a domingo
function MapaSemaforo({ checkins, hoy }) {
  const dow = (fromISO(hoy).getDay() + 6) % 7 // 0 = lunes
  const inicio = addDays(hoy, -dow - 21)
  const dias = Array.from({ length: 28 }, (_, i) => addDays(inicio, i))
  return (
    <div className="card flex flex-col gap-2 p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-muted">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {dias.map((f) => {
          const c = checkins[f]?.semaforo
          const futuro = f > hoy
          return (
            <span
              key={f}
              title={`${formatShort(f)}: ${c ? SEM_LABEL[c] : futuro ? 'próximo' : 'sin check-in'}`}
              aria-label={`${formatShort(f)}: ${c ? SEM_LABEL[c] : futuro ? 'próximo' : 'sin check-in'}`}
              className={`grid aspect-square place-items-center rounded-md font-mono text-[10px] ${
                c ? `${SEM_CLASE[c]} text-white` : futuro ? 'border border-dashed border-line text-muted' : 'bg-line text-muted'
              } ${f === hoy ? 'ring-2 ring-ink ring-offset-1 ring-offset-surface' : ''}`}
            >
              {fromISO(f).getDate()}
            </span>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-3 text-[11px] text-muted">
        {Object.keys(SEM_CLASE).map((k) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`h-2.5 w-2.5 rounded-sm ${SEM_CLASE[k]}`} />
            {SEM_LABEL[k]}
          </span>
        ))}
        <span className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-line" />
          Sin check-in
        </span>
      </div>
    </div>
  )
}

function Pruebas({ pruebas }) {
  const porTipo = {}
  ;[...pruebas].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).forEach((p) => (porTipo[p.tipo] ??= []).push(p))
  const tipos = Object.keys(porTipo).filter((t) => t !== 'inbody')
  const inbody = porTipo.inbody ?? []
  const ultimoIB = inbody[inbody.length - 1]

  return (
    <div className="card flex flex-col divide-y divide-line">
      <div className="p-3 text-sm">
        <b>Referencia Roma 2026:</b> <span className="font-mono tabular">{ROMA.total}</span>
        <span className="text-muted"> · meta {METAS.total}</span>
        <p className="mt-1 text-xs text-muted">
          Row {ROMA.estaciones.row} (meta {METAS.row}) · Lunges {ROMA.estaciones.sandbag_lunge} · Wall balls {ROMA.estaciones.wall_balls}
        </p>
      </div>
      {tipos.length === 0 && !ultimoIB && <p className="p-3 text-sm text-muted">Registra tus pruebas en la pestaña Plan y aquí verás cómo mejoran.</p>}
      {tipos.map((t) => {
        const lista = porTipo[t]
        const a = lista[0]
        const b = lista[lista.length - 1]
        const ta = parseTiempo(a.resultado)
        const tb = parseTiempo(b.resultado)
        const dif = lista.length > 1 && ta != null && tb != null ? tb - ta : null
        return (
          <div key={t} className="flex items-center justify-between gap-3 p-3">
            <span>
              <b className="block text-sm">{TIPOS_PRUEBA[t]?.label ?? t}</b>
              <span className="font-mono text-xs text-muted tabular">
                {lista.length > 1 ? `${formatShort(a.fecha)} ${a.resultado} → ` : ''}
                {formatShort(b.fecha)} {b.resultado}
              </span>
            </span>
            {dif != null && (
              <span className={`chip shrink-0 ${dif < 0 ? 'bg-ok/10 text-ok' : dif > 0 ? 'bg-bad/10 text-bad' : 'bg-line text-muted'}`}>
                {dif < 0 ? '−' : dif > 0 ? '+' : ''}
                {fmtTiempo(dif)}
              </span>
            )}
          </div>
        )
      })}
      {ultimoIB && (
        <div className="p-3">
          <b className="block text-sm">InBody vs junio</b>
          <div className="mt-1 grid grid-cols-3 gap-2 font-mono text-xs tabular">
            {[
              ['Peso', INBODY_BASE.peso_kg, ultimoIB.peso_kg, 'kg'],
              ['Músculo', INBODY_BASE.masa_muscular_esqueletica_kg, ultimoIB.masa_muscular_kg, 'kg'],
              ['Grasa', INBODY_BASE.grasa_corporal_pct, ultimoIB.grasa_pct, '%'],
            ].map(([l, base, ahora, u]) => (
              <span key={l} className="flex flex-col">
                <span className="font-sans text-[11px] text-muted">{l}</span>
                {ahora != null ? `${ahora} ${u}` : '–'}
                {ahora != null && <span className="text-muted">{`${ahora - base >= 0 ? '+' : ''}${(ahora - base).toFixed(1)}`}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProgresoScreen() {
  const hoy = todayISO()
  const [checkins] = useStored(KEYS.checkins, {})
  const [sesiones] = useStored(KEYS.sesiones, {})
  const [pruebas] = useStored(KEYS.pruebas, [])
  const ad = adherencia(sesiones, checkins, hoy)
  const fc = serieCheckin(checkins, 'fc_reposo_lpm').slice(-42)
  const sueno = serieCheckin(checkins, 'sueno_horas').slice(-28)
  const z2 = serieZ2(sesiones)
  const gym = progresionGym(sesiones)
  const ejercicios = [...gym.keys()]
  const [ej, setEj] = useState(null)
  const ejSel = ej && gym.has(ej) ? ej : ejercicios[0]

  return (
    <div className="flex flex-col gap-6 px-4 pb-28">
      <header className="safe-top pt-4">
        <div className="eyebrow">Desde el {formatShort(plan.semanas[0].inicio)}</div>
        <h1 className="mt-1 font-display text-[30px] font-bold uppercase leading-none">Progreso</h1>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Tile valor={ad.hechas} total={ad.total} label="Sesiones registradas" />
        <Tile valor={ad.conCheckin} total={ad.dias} label="Días con check-in" />
        <Tile valor={ad.verdes} total={ad.conCheckin} label="Días en verde" />
      </div>

      <Seccion titulo="Semáforo">
        <MapaSemaforo checkins={checkins} hoy={hoy} />
      </Seccion>

      <Seccion titulo="FC en reposo" nota="Helio, al despertar. Si sube 7 lpm sobre tu promedio, cuenta para el semáforo.">
        <div className="card">
          <MiniChart datos={fc} formato={(v) => `${Math.round(v)}`} vacio="Con 2 check-ins con FC aparece tu tendencia." />
        </div>
      </Seccion>

      <Seccion titulo="Sueño" nota="Menos de 6 h cuenta para el semáforo. El plan pide 7-9 h.">
        <div className="card">
          <MiniChart datos={sueno} tipo="bar" formato={(v) => `${Math.round(v * 10) / 10} h`} referencia={{ valor: 7, etiqueta: '7 h' }} vacio="Con 2 check-ins aparece tu sueño de las últimas 4 semanas." />
        </div>
      </Seccion>

      <Seccion titulo="Ritmo en Z2" nota={`Rodajes y long run. Arriba = más rápido. Compáralo con la FC: el plan pide máximo ${Z2_MAX} lpm.`}>
        <div className="card">
          <MiniChart datos={z2} invertir formato={(v) => `${fmtPace(Math.round(v))}`} vacio="Registra 2 rodajes con duración y distancia para ver tu ritmo." />
        </div>
      </Seccion>

      <Seccion titulo="Fuerza" nota="Peso más alto de cada sesión por ejercicio.">
        <div className="card">
          {ejercicios.length > 0 && (
            <div className="p-3 pb-0">
              <label htmlFor="prog-ej" className="sr-only">
                Ejercicio
              </label>
              <select id="prog-ej" className="field text-sm" value={ejSel} onChange={(e) => setEj(e.target.value)}>
                {ejercicios.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          )}
          <MiniChart datos={ejSel ? gym.get(ejSel) : []} formato={(v) => `${Math.round(v * 10) / 10}`} vacio="Registra el mismo ejercicio en 2 sesiones de gym para ver tu progresión." />
        </div>
      </Seccion>

      <Seccion titulo="Pruebas">
        <Pruebas pruebas={pruebas} />
      </Seccion>
    </div>
  )
}
