import { useState } from 'react'
import Icon, { iconoItem } from '../../components/Icon'

function Macros({ m, ajuste }) {
  if (!m) return null
  return (
    <span className="mt-1 flex flex-wrap gap-1 font-mono text-[10.5px] tabular">
      <span className="rounded bg-accent-soft px-1.5 py-px text-accent">P {m.p}</span>
      <span className="rounded bg-sun/20 px-1.5 py-px text-ink">
        C {m.c}
        {ajuste ? <span className="text-muted"> ({ajuste})</span> : null}
      </span>
      <span className="rounded bg-line px-1.5 py-px text-muted">G {m.g}</span>
    </span>
  )
}

function Fila({ it, hecho, actual, onToggle }) {
  const [open, setOpen] = useState(false)
  const entreno = it.tipo === 'entreno'
  return (
    <li className={`relative grid grid-cols-[44px_28px_1fr_40px] items-start gap-x-2 rounded-lg py-2 ${actual ? 'bg-accent-soft -mx-2 px-2' : ''}`}>
      <time className={`pt-1 font-mono text-xs tabular ${actual ? 'text-accent font-semibold' : 'text-muted'}`}>{it.hora}</time>
      <span
        className={`grid h-7 w-7 place-items-center rounded-full border-2 ${
          hecho ? 'border-ok bg-ok text-white' : entreno ? 'border-accent bg-accent text-accent-on' : 'border-line bg-surface text-muted'
        }`}
      >
        <Icon name={hecho ? 'check' : iconoItem(it)} className="w-3.5 h-3.5" strokeWidth={2.4} />
      </span>
      <button className="min-w-0 text-left" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={`block text-sm font-semibold leading-snug ${hecho ? 'text-muted line-through' : ''}`}>
          {it.titulo}
          {it.opcional && <span className="chip ml-1.5 bg-line text-muted align-middle">opcional</span>}
        </span>
        {it.duracion_min > 0 && <span className="text-xs text-muted">{it.duracion_min} min</span>}
        {it.porciones && (
          <span className="mt-1.5 flex flex-col gap-0.5">
            {it.porciones.map((p, i) => (
              <span key={i} className="grid grid-cols-[76px_1fr] gap-2 text-[13px] leading-snug">
                <span className={`font-mono text-xs tabular ${p.ajustada ? 'text-warn' : 'text-accent'}`}>{p.cantidad.replace(/ \(.*\)/, '')}</span>
                <span>
                  {p.alimento}
                  {open && p.cantidad.includes('(') && <span className="text-muted"> {p.cantidad.match(/\(.*\)/)[0]}</span>}
                  {open && p.alternativa && <span className="block text-xs text-muted">{p.alternativa}</span>}
                </span>
              </span>
            ))}
          </span>
        )}
        <Macros m={it.macros} ajuste={it.ajusteCarbos} />
        {open && <span className="mt-1.5 block text-sm text-muted">{it.detalle}</span>}
      </button>
      <button
        onClick={onToggle}
        aria-pressed={hecho}
        aria-label={hecho ? `Desmarcar ${it.titulo}` : `Marcar ${it.titulo} como hecho`}
        className={`ml-auto grid h-8 w-8 place-items-center rounded-lg border-2 transition-colors ${
          hecho ? 'border-ok bg-ok text-white' : 'border-line text-transparent active:border-accent'
        }`}
      >
        <Icon name="check" className="w-4 h-4" strokeWidth={3} />
      </button>
    </li>
  )
}

export default function Timeline({ items, hechos, actualKey, onToggle }) {
  return (
    <ol className="card flex flex-col px-3 py-1">
      {items.map((it) => (
        <Fila key={it.key} it={it} hecho={hechos.includes(it.key)} actual={it.key === actualKey} onToggle={() => onToggle(it.key)} />
      ))}
    </ol>
  )
}
