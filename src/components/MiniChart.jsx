import { useState } from 'react'
import { diffDays, formatShort } from '../engine/dates'

const W = 340
const H = 150
const M = { top: 12, right: 12, bottom: 22, left: 40 }
const FONT = { font: '500 10px "IBM Plex Mono", monospace' }

// Marcas del eje en números redondos (1, 2, 2.5, 5 × 10ⁿ) que cubren [min, max]
function marcas(min, max) {
  const crudo = (max - min) / 3 || 1
  const p = 10 ** Math.floor(Math.log10(crudo))
  const n = crudo / p
  const paso = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p
  const lo = Math.floor(min / paso) * paso
  const hi = Math.ceil(max / paso) * paso
  const out = []
  for (let v = lo; v <= hi + paso / 2; v += paso) out.push(Math.round(v * 1000) / 1000)
  return out
}

/**
 * Gráfica de una sola serie en el tiempo (línea o barras). El título de la sección la nombra, así que no lleva leyenda.
 * datos: [{ fecha, valor, extra? }] · formato: valor → texto · referencia: { valor, etiqueta } · invertir: más bajo arriba
 */
export default function MiniChart({ datos, formato = (v) => String(v), referencia, invertir = false, tipo = 'line', vacio }) {
  const [sel, setSel] = useState(null)
  if (datos.length < 2) return <p className="p-3 text-sm text-muted">{vacio}</p>

  const primero = datos[0].fecha
  const span = Math.max(1, diffDays(primero, datos[datos.length - 1].fecha))
  const valores = datos.map((d) => d.valor).concat(referencia ? [referencia.valor] : [])
  const vmin = Math.min(...valores)
  const vmax = Math.max(...valores)
  const pad = (vmax - vmin || Math.abs(vmax) || 1) * 0.08
  const ticks = marcas(tipo === 'bar' ? Math.min(0, vmin) : vmin - pad, vmax + pad)
  const min = ticks[0]
  const max = ticks[ticks.length - 1]

  const iw = W - M.left - M.right
  const ih = H - M.top - M.bottom
  const x = (f) => M.left + (diffDays(primero, f) / span) * iw
  const yRaw = (v) => ((v - min) / (max - min)) * ih
  const y = (v) => (invertir ? M.top + yRaw(v) : M.top + ih - yRaw(v))
  const barW = Math.max(3, Math.min(14, iw / (span + 1) - 2))

  const activo = sel != null ? datos[sel] : datos[datos.length - 1]
  const elegir = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    let mejor = 0
    datos.forEach((d, i) => {
      if (Math.abs(x(d.fecha) - px) < Math.abs(x(datos[mejor].fecha) - px)) mejor = i
    })
    setSel(mejor)
  }

  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex items-baseline justify-between gap-2 text-sm" aria-live="polite">
        <span className="font-mono text-xs text-muted">{formatShort(activo.fecha)}</span>
        <span className="font-mono tabular">
          <b>{formato(activo.valor)}</b>
          {activo.extra && <span className="text-muted"> · {activo.extra}</span>}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`${datos.length} registros del ${formatShort(primero)} al ${formatShort(datos[datos.length - 1].fecha)}. Último: ${formato(datos[datos.length - 1].valor)}`}
        onPointerDown={elegir}
        onPointerMove={(e) => (e.pointerType === 'mouse' || e.buttons) && elegir(e)}
        onPointerLeave={() => setSel(null)}
      >
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={M.left} x2={W - M.right} y1={y(t)} y2={y(t)} stroke="rgb(var(--line))" strokeWidth="1" />
            <text x={M.left - 6} y={y(t) + 3.5} textAnchor="end" fill="rgb(var(--muted))" style={FONT}>
              {formato(t)}
            </text>
          </g>
        ))}
        <text x={M.left} y={H - 6} fill="rgb(var(--muted))" style={FONT}>
          {formatShort(primero)}
        </text>
        <text x={W - M.right} y={H - 6} textAnchor="end" fill="rgb(var(--muted))" style={FONT}>
          {formatShort(datos[datos.length - 1].fecha)}
        </text>

        {referencia && (
          <g>
            <line x1={M.left} x2={W - M.right} y1={y(referencia.valor)} y2={y(referencia.valor)} stroke="rgb(var(--sun))" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x={W - M.right} y={y(referencia.valor) - 4} textAnchor="end" fill="rgb(var(--ink))" style={FONT}>
              {referencia.etiqueta}
            </text>
          </g>
        )}
        {sel != null && <line x1={x(datos[sel].fecha)} x2={x(datos[sel].fecha)} y1={M.top} y2={M.top + ih} stroke="rgb(var(--muted))" strokeWidth="1" strokeDasharray="3 3" />}

        {tipo === 'bar'
          ? datos.map((d, i) => {
              const top = y(Math.max(d.valor, 0))
              const base = y(Math.max(min, 0))
              return (
                <rect
                  key={d.fecha + i}
                  x={x(d.fecha) - barW / 2}
                  y={Math.min(top, base)}
                  width={barW}
                  height={Math.max(1, Math.abs(base - top))}
                  rx="2"
                  fill={i === sel ? 'rgb(var(--ink))' : 'rgb(var(--accent))'}
                />
              )
            })
          : (
            <>
              <polyline points={datos.map((d) => `${x(d.fecha).toFixed(1)},${y(d.valor).toFixed(1)}`).join(' ')} fill="none" stroke="rgb(var(--accent))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
              {datos.map((d, i) => (
                <circle key={d.fecha + i} cx={x(d.fecha)} cy={y(d.valor)} r={i === sel || i === datos.length - 1 ? 5 : 3.5} fill="rgb(var(--accent))" stroke="rgb(var(--surface))" strokeWidth="2" />
              ))}
            </>
          )}
      </svg>
    </div>
  )
}
