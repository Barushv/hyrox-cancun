import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

let audio = null

// Se llama desde un toque o al escribir, para que el navegador deje sonar el aviso después
function prepararAudio() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)()
    if (audio.state === 'suspended') audio.resume()
  } catch {
    audio = null
  }
}

function pitido() {
  if (!audio) return
  const t = audio.currentTime
  ;[0, 0.25, 0.5].forEach((d, i) => {
    const o = audio.createOscillator()
    const g = audio.createGain()
    o.frequency.value = i === 2 ? 1320 : 880
    g.gain.setValueAtTime(0.0001, t + d)
    g.gain.exponentialRampToValueAtTime(0.4, t + d + 0.02)
    g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.2)
    o.connect(g).connect(audio.destination)
    o.start(t + d)
    o.stop(t + d + 0.22)
  })
}

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// Estado del cronómetro: { fin (ms), total (s), nombre }
export function useDescanso() {
  const [d, setD] = useState(null)
  const iniciar = (segundos, nombre) => {
    prepararAudio()
    setD({ fin: Date.now() + segundos * 1000, total: segundos, nombre })
  }
  const ajustar = (delta) => setD((x) => x && { ...x, fin: Math.max(Date.now(), x.fin + delta * 1000), total: Math.max(1, x.total + delta) })
  return { descanso: d, iniciar, ajustar, cerrar: () => setD(null) }
}

// Barra fija sobre el botón de guardar. Vibra y suena al terminar, y mantiene la pantalla encendida mientras corre.
export default function Descanso({ descanso, onAjustar, onCerrar }) {
  const [ahora, setAhora] = useState(Date.now())
  const avisado = useRef(false)
  const restante = descanso ? Math.max(0, Math.ceil((descanso.fin - ahora) / 1000)) : 0
  const listo = descanso && restante === 0

  useEffect(() => {
    if (!descanso) return
    avisado.current = false
    const t = setInterval(() => setAhora(Date.now()), 250)
    return () => clearInterval(t)
  }, [descanso?.fin])

  // Pantalla encendida mientras hay descanso
  useEffect(() => {
    if (!descanso || listo || !navigator.wakeLock) return
    let lock = null
    navigator.wakeLock.request('screen').then((l) => (lock = l)).catch(() => {})
    return () => lock?.release().catch(() => {})
  }, [!!descanso, listo])

  useEffect(() => {
    if (!listo || avisado.current) return
    avisado.current = true
    navigator.vibrate?.([300, 120, 300, 120, 500])
    pitido()
    const t = setTimeout(onCerrar, 6000)
    return () => clearTimeout(t)
  }, [listo])

  if (!descanso) return null
  const pct = listo ? 100 : 100 - (restante / descanso.total) * 100

  return (
    <div className={`mx-auto mb-2 max-w-lg overflow-hidden rounded-2xl border shadow-lg ${listo ? 'border-ok bg-ok text-white' : 'border-line bg-surface'}`} role="timer" aria-live="polite">
      <div className="flex items-center gap-3 px-3 py-2.5">
        <Icon name={listo ? 'check' : 'clock'} className={`w-6 h-6 shrink-0 ${listo ? '' : 'text-accent'}`} strokeWidth={listo ? 3 : 2} />
        <div className="min-w-0 flex-1">
          <div className={`text-[11px] uppercase tracking-wide ${listo ? 'text-white/85' : 'text-muted'}`}>{listo ? 'Descanso terminado' : 'Descanso'}</div>
          <div className="truncate text-xs font-semibold">{listo ? 'Va la siguiente serie' : descanso.nombre}</div>
        </div>
        {!listo && (
          <>
            <button className="rounded-lg border border-line px-2 py-1.5 font-mono text-xs font-semibold" onClick={() => onAjustar(-15)} aria-label="Quitar 15 segundos">
              −15
            </button>
            <div className="w-[64px] text-center font-display text-3xl font-bold leading-none tabular">{fmt(restante)}</div>
            <button className="rounded-lg border border-line px-2 py-1.5 font-mono text-xs font-semibold" onClick={() => onAjustar(15)} aria-label="Agregar 15 segundos">
              +15
            </button>
          </>
        )}
        <button className={`rounded-full p-1.5 ${listo ? '' : 'text-muted'}`} onClick={onCerrar} aria-label={listo ? 'Cerrar' : 'Saltar descanso'}>
          <Icon name="x" className="w-5 h-5" />
        </button>
      </div>
      {!listo && (
        <div className="h-1 bg-line">
          <div className="h-full bg-accent transition-[width] duration-200" style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
