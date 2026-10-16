import { useState } from 'react'
import { plan, nutricion, diario } from '../data/plan'
import { variantesDe, etiquetaVariante } from '../engine/diario'
import { DIAS_LABEL, formatShort } from '../engine/dates'
import { PRIMER_DIA, ULTIMO_DIA } from '../engine/calendar'
import { useStored, KEYS, clearAll, exportarTodo, importarTodo, validarRespaldo } from '../store/store'
import { compartirArchivo } from '../engine/ics'
import { todayISO } from '../engine/dates'

// Días con más de una plantilla diaria. El martes se decide solo (semáforo y semana).
const DIAS_CON_VARIANTE = [...new Set(diario.dias.map((d) => d.dia))].filter((d) => d !== 'martes' && variantesDe(d).length > 1)

function Seccion({ titulo, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="h-section">{titulo}</h2>
      <div className="card flex flex-col divide-y divide-line">{children}</div>
    </section>
  )
}

export default function AjustesScreen() {
  const [ajustes, setAjustes] = useStored(KEYS.ajustes, {})
  const [confirmar, setConfirmar] = useState(false)
  const [respaldo, setRespaldo] = useState(null) // respaldo leído, esperando confirmación
  const [mensaje, setMensaje] = useState(null)

  const exportar = async () => {
    const r = await compartirArchivo(`hyrox-cancun-respaldo-${todayISO()}.json`, JSON.stringify(exportarTodo(), null, 2), 'application/json')
    if (r !== 'cancelado') setMensaje(r === 'compartido' ? 'Respaldo compartido. Guárdalo en Archivos o mándatelo por correo.' : 'Respaldo descargado.')
  }

  const leerArchivo = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      setRespaldo(validarRespaldo(JSON.parse(await file.text())))
      setMensaje(null)
    } catch (err) {
      setRespaldo(null)
      setMensaje(err instanceof SyntaxError ? 'No se pudo leer el archivo: no es un JSON válido.' : err.message)
    }
  }
  const set = (k, v) => setAjustes((a) => ({ ...a, [k]: v }))

  return (
    <div className="flex flex-col gap-6 px-4 pb-28">
      <header className="safe-top pt-4">
        <div className="eyebrow">{plan.meta.nombre_plan}</div>
        <h1 className="mt-1 font-display text-[30px] font-bold uppercase leading-none">Ajustes</h1>
      </header>

      <Seccion titulo="Tu ola">
        <label htmlFor="aj-fecha" className="flex items-center justify-between gap-3 p-3">
          <span>
            <b className="block text-sm">Día de carrera</b>
            <span className="text-xs text-muted">19 al 21 de febrero</span>
          </span>
          <input id="aj-fecha" type="date" min="2027-02-19" max="2027-02-21" className="field w-44 font-mono" value={ajustes.fechaOla ?? ''} onChange={(e) => set('fechaOla', e.target.value || null)} />
        </label>
        <label htmlFor="aj-hora" className="flex items-center justify-between gap-3 p-3">
          <span>
            <b className="block text-sm">Hora de tu ola</b>
            <span className="text-xs text-muted">Para la carga de 48 h y el desayuno</span>
          </span>
          <input id="aj-hora" type="time" className="field w-32 font-mono" value={ajustes.horaOla ?? ''} onChange={(e) => set('horaOla', e.target.value || null)} />
        </label>
      </Seccion>

      <Seccion titulo="Nutrición">
        <label htmlFor="aj-agua" className="flex items-center justify-between gap-3 p-3">
          <span>
            <b className="block text-sm">Meta de agua al día</b>
            <span className="text-xs text-muted">Ajústala con tu nutrióloga; sube en días de calor</span>
          </span>
          <span className="relative">
            <input
              id="aj-agua"
              type="number"
              inputMode="decimal"
              step="0.25"
              min="1"
              className="field w-28 pr-8 font-mono tabular"
              value={ajustes.metaAgua ?? 3}
              onChange={(e) => set('metaAgua', e.target.value === '' ? null : Number(e.target.value))}
            />
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted">L</span>
          </span>
        </label>
      </Seccion>

      <Seccion titulo="Tu horario habitual">
        <p className="p-3 text-xs text-muted">
          Lo que eliges aquí se usa cada semana. En la pantalla Hoy puedes cambiarlo solo para ese día. El martes se ajusta solo: sin clase Engine si el semáforo no está en verde o en semanas de descarga.
        </p>
        {DIAS_CON_VARIANTE.map((d) => {
          const vars = variantesDe(d)
          const actual = ajustes.variantes?.[d] ?? vars[0].id
          return (
            <div key={d} className="flex flex-col gap-2 p-3">
              <b className="text-sm">{DIAS_LABEL[d]}</b>
              <div className="grid grid-cols-2 gap-1 rounded-xl border border-line bg-bg p-1" role="radiogroup" aria-label={`Variante del ${DIAS_LABEL[d]}`}>
                {vars.map((v) => (
                  <button
                    key={v.id}
                    role="radio"
                    aria-checked={actual === v.id}
                    onClick={() => set('variantes', { ...(ajustes.variantes ?? {}), [d]: v.id })}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold leading-tight ${actual === v.id ? 'bg-ink text-bg' : 'text-muted'}`}
                  >
                    {etiquetaVariante(v)}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </Seccion>

      <Seccion titulo="El plan">
        <div className="grid grid-cols-2 gap-3 p-3 text-sm">
          <span className="text-muted">Fechas</span>
          <span className="text-right font-mono tabular">
            {formatShort(PRIMER_DIA)} → {formatShort(ULTIMO_DIA)}
          </span>
          <span className="text-muted">Entrenamiento</span>
          <span className="text-right font-mono">v{plan.meta.version}</span>
          <span className="text-muted">Nutrición</span>
          <span className="text-right font-mono">v{nutricion.meta.version}</span>
          <span className="text-muted">Plan diario</span>
          <span className="text-right font-mono">v{diario.version}</span>
          <span className="text-muted">Base InBody</span>
          <span className="text-right font-mono tabular">{plan.meta.linea_base_inbody_2026_06_23.peso_kg} kg</span>
        </div>
      </Seccion>

      <Seccion titulo="Respaldo">
        <div className="flex flex-col gap-3 p-3">
          <p className="text-xs text-muted">Tus registros viven solo en este teléfono. Exporta un respaldo cada semana o antes de cambiar de teléfono.</p>
          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-xl bg-accent py-2.5 text-sm font-bold text-accent-on" onClick={exportar}>
              Exportar respaldo
            </button>
            <label htmlFor="aj-importar" className="cursor-pointer rounded-xl border border-line py-2.5 text-center text-sm font-semibold">
              Importar respaldo
              <input id="aj-importar" type="file" accept="application/json,.json" className="sr-only" onChange={leerArchivo} />
            </label>
          </div>
          {respaldo && (
            <div className="flex flex-col gap-2 rounded-xl border-2 border-warn p-3 text-sm">
              <p>
                Respaldo del <b>{new Date(respaldo.exportado).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}</b>. Reemplaza tus registros actuales con los del archivo.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 rounded-lg bg-warn py-2 font-bold text-white"
                  onClick={() => {
                    importarTodo(respaldo)
                    setRespaldo(null)
                    setMensaje('Respaldo importado.')
                  }}
                >
                  Reemplazar
                </button>
                <button className="flex-1 rounded-lg border border-line py-2 font-semibold" onClick={() => setRespaldo(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          )}
          {mensaje && <p className="rounded-lg bg-accent-soft p-2 text-sm">{mensaje}</p>}
        </div>
      </Seccion>

      <Seccion titulo="Tus datos">
        <div className="flex flex-col gap-2 p-3">
          <p className="text-xs text-muted">Se guardan solo en este teléfono. Borrarlos quita check-ins, comidas marcadas y horarios; el plan no cambia.</p>
          {confirmar ? (
            <div className="flex gap-2">
              <button
                className="flex-1 rounded-xl bg-bad py-2.5 text-sm font-bold text-white"
                onClick={() => {
                  clearAll()
                  setConfirmar(false)
                }}
              >
                Sí, borrar todo
              </button>
              <button className="flex-1 rounded-xl border border-line py-2.5 text-sm font-semibold" onClick={() => setConfirmar(false)}>
                Cancelar
              </button>
            </div>
          ) : (
            <button className="self-start rounded-lg px-1 py-1 text-sm font-semibold text-bad" onClick={() => setConfirmar(true)}>
              Borrar mis registros
            </button>
          )}
        </div>
      </Seccion>
    </div>
  )
}
