import { useState } from 'react'
import Icon from '../../components/Icon'
import { nutricion, diario } from '../../data/plan'
import { etiquetaVariante } from '../../engine/diario'
import { getDia } from '../../engine/calendar'
import { DIAS_LABEL, todayISO } from '../../engine/dates'
import { useStored, KEYS } from '../../store/store'

const LISTA = nutricion.lista_compras_semana_tipo
const sinAcento = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '')

// Las variantes de día con las que se calculó la lista ("miércoles_B" → "Miércoles: rodaje en la mañana…")
const BASE = (LISTA?.base ?? [])
  .map((id) => diario.dias.find((d) => d.id === sinAcento(id)))
  .filter(Boolean)
  .map((d) => `${DIAS_LABEL[d.dia]}: ${etiquetaVariante(d).toLowerCase()}`)

function textoLista(items) {
  return ['Lista de compras · Hyrox Cancún', '', ...items.map((it) => `☐ ${it.alimento}: ${it.comprar}`)].join('\n')
}

// Comparte la lista (WhatsApp, Notas…) o la copia al portapapeles
async function compartir(items) {
  const text = textoLista(items)
  if (navigator.share) {
    try {
      await navigator.share({ title: 'Lista de compras', text })
      return 'Lista compartida.'
    } catch (e) {
      if (e.name === 'AbortError') return null
    }
  }
  try {
    await navigator.clipboard.writeText(text)
    return 'Lista copiada. Pégala en tus notas o en un mensaje.'
  } catch {
    return 'No se pudo compartir ni copiar la lista en este navegador.'
  }
}

export default function ListaCompras() {
  // Las palomitas se guardan por semana del plan: cada semana empieza vacía
  const semana = getDia(todayISO())?.semana.semana ?? 'fuera'
  const [comprasAll, setCompras] = useStored(KEYS.compras, {})
  const [mensaje, setMensaje] = useState(null)
  if (!LISTA?.items?.length) return null

  const marcados = comprasAll[semana] ?? []
  const toggle = (nombre) =>
    setCompras((all) => {
      const lista = all[semana] ?? []
      return { ...all, [semana]: lista.includes(nombre) ? lista.filter((n) => n !== nombre) : [...lista, nombre] }
    })
  const pendientes = LISTA.items.filter((it) => !marcados.includes(it.alimento))

  return (
    <details className="card group">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
          <Icon name="food" />
        </span>
        <span className="flex-1">
          <b className="block text-sm">Semana tipo · {LISTA.items.length} alimentos</b>
          <span className="font-mono text-xs text-muted tabular">
            {marcados.length}/{LISTA.items.length} en el carrito
          </span>
        </span>
        <Icon name="chevronDown" className="w-5 h-5 text-muted transition-transform group-open:rotate-180" />
      </summary>

      <div className="flex flex-col gap-3 border-t border-line p-3">
        <div className="grid grid-cols-2 gap-2">
          <button
            className="rounded-xl bg-accent py-2.5 text-sm font-bold text-accent-on"
            onClick={async () => setMensaje(await compartir(pendientes.length ? pendientes : LISTA.items))}
          >
            Compartir {pendientes.length && pendientes.length < LISTA.items.length ? 'lo que falta' : 'lista'}
          </button>
          <button
            className="rounded-xl border border-line py-2.5 text-sm font-semibold disabled:opacity-40"
            disabled={!marcados.length}
            onClick={() => setCompras((all) => ({ ...all, [semana]: [] }))}
          >
            Desmarcar todo
          </button>
        </div>
        {mensaje && <p className="rounded-lg bg-accent-soft p-2 text-sm">{mensaje}</p>}

        <ul className="flex flex-col divide-y divide-line">
          {LISTA.items.map((it) => {
            const hecho = marcados.includes(it.alimento)
            return (
              <li key={it.alimento}>
                <button className="flex w-full items-start gap-3 py-2.5 text-left" onClick={() => toggle(it.alimento)} aria-pressed={hecho}>
                  <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border-2 ${hecho ? 'border-ok bg-ok text-white' : 'border-line'}`}>
                    {hecho && <Icon name="check" className="w-3.5 h-3.5" strokeWidth={3} />}
                  </span>
                  <span className={`min-w-0 flex-1 ${hecho ? 'text-muted line-through' : ''}`}>
                    <b className="block text-sm">{it.alimento}</b>
                    <span className={`block text-sm font-semibold ${hecho ? '' : 'text-accent'}`}>Comprar: {it.comprar}</span>
                    <span className="text-xs text-muted">Usas {it.uso_semana} en la semana</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>

        <div className="text-xs text-muted">
          <p>{LISTA.nota}</p>
          {BASE.length > 0 && <p className="mt-1">Calculada con: {BASE.join(' · ')}.</p>}
        </div>
      </div>
    </details>
  )
}
