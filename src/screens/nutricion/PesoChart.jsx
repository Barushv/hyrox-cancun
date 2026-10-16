import { useState } from 'react'
import { formatShort } from '../../engine/dates'
import { promedio7 } from '../../engine/peso'

const W = 340
const H = 160
const M = { top: 12, right: 12, bottom: 22, left: 34 }

// Pesajes diarios (puntos neutros) y promedio de 7 días (línea de acento). Toca la gráfica para ver cada día.
export default function PesoChart({ checkins, puntos }) {
  const [sel, setSel] = useState(null)
  const datos = puntos.slice(-42) // últimas 6 semanas
  if (datos.length < 2) {
    return <p className="p-3 text-sm text-muted">Con 2 pesajes en el check-in aparece aquí tu gráfica de peso y su promedio de 7 días.</p>
  }

  const conProm = datos.map((d) => ({ ...d, prom: promedio7(checkins, d.fecha) }))
  const valores = conProm.flatMap((d) => [d.peso, d.prom]).filter((v) => v != null)
  const min = Math.floor((Math.min(...valores) - 0.3) * 2) / 2
  const max = Math.ceil((Math.max(...valores) + 0.3) * 2) / 2
  const iw = W - M.left - M.right
  const ih = H - M.top - M.bottom
  const x = (i) => M.left + (datos.length === 1 ? iw / 2 : (i / (datos.length - 1)) * iw)
  const y = (v) => M.top + ih - ((v - min) / (max - min)) * ih
  const ticks = [min, (min + max) / 2, max]

  const linea = conProm
    .map((d, i) => (d.prom == null ? null : `${x(i).toFixed(1)},${y(d.prom).toFixed(1)}`))
    .reduce((acc, p) => {
      if (!p) acc.push([])
      else acc[acc.length - 1].push(p)
      return acc
    }, [[]])
    .filter((seg) => seg.length > 1)

  const ultimoProm = [...conProm].reverse().find((d) => d.prom != null)
  const ultimoIdx = ultimoProm ? conProm.lastIndexOf(ultimoProm) : -1
  const activo = sel != null ? conProm[sel] : conProm[conProm.length - 1]

  const elegir = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - M.left) / iw) * (datos.length - 1))
    setSel(Math.max(0, Math.min(datos.length - 1, i)))
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-baseline justify-between gap-2 text-sm" aria-live="polite">
        <span className="font-mono text-xs text-muted">{formatShort(activo.fecha)}</span>
        <span className="font-mono tabular">
          <b>{activo.peso.toFixed(1)} kg</b>
          {activo.prom != null && <span className="text-muted"> · prom {activo.prom.toFixed(2)}</span>}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`Peso de ${formatShort(datos[0].fecha)} a ${formatShort(datos[datos.length - 1].fecha)}: de ${datos[0].peso} a ${datos[datos.length - 1].peso} kg`}
        onPointerDown={elegir}
        onPointerMove={(e) => e.buttons && elegir(e)}
        onMouseMove={elegir}
        onMouseLeave={() => setSel(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeWidth="1" />
            <text x={M.left - 6} y={y(t) + 3.5} textAnchor="end" fill="rgb(var(--muted))" style={{ font: '500 10px "IBM Plex Mono", monospace' }}>
              {t.toFixed(1)}
            </text>
          </g>
        ))}
        <text x={M.left} y={H - 6} fill="rgb(var(--muted))" style={{ font: '500 10px "IBM Plex Mono", monospace' }}>
          {formatShort(datos[0].fecha)}
        </text>
        <text x={W - M.right} y={H - 6} textAnchor="end" fill="rgb(var(--muted))" style={{ font: '500 10px "IBM Plex Mono", monospace' }}>
          {formatShort(datos[datos.length - 1].fecha)}
        </text>

        {sel != null && <line x1={x(sel)} x2={x(sel)} y1={M.top} y2={M.top + ih} stroke="rgb(var(--muted))" strokeWidth="1" strokeDasharray="3 3" />}

        {conProm.map((d, i) => (
          <circle key={d.fecha} cx={x(i)} cy={y(d.peso)} r={i === sel ? 5 : 4} fill="rgb(var(--muted) / 0.45)" stroke="rgb(var(--surface))" strokeWidth="2" />
        ))}
        {linea.map((seg, i) => (
          <polyline key={i} points={seg.join(' ')} fill="none" stroke="rgb(var(--accent))" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {ultimoIdx >= 0 && <circle cx={x(ultimoIdx)} cy={y(ultimoProm.prom)} r="5" fill="rgb(var(--accent))" stroke="rgb(var(--surface))" strokeWidth="2" />}
      </svg>
      <div className="flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-muted/45" />
          Pesaje del día
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-[3px] w-4 rounded-full bg-accent" />
          Promedio 7 días
        </span>
      </div>
    </div>
  )
}
