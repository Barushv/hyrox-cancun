import { plan } from '../data/plan'
import { getSesiones } from './calendar'
import { tipoRegistro } from './registro'

// Cumplimiento desde el inicio del plan hasta hoy
export function adherencia(sesiones, checkins, hoy) {
  const r = { total: 0, hechas: 0, dias: 0, conCheckin: 0, verdes: 0 }
  for (const sem of plan.semanas) {
    for (const d of sem.dias) {
      if (d.fecha > hoy) continue
      r.dias++
      const c = checkins[d.fecha]
      if (c?.semaforo) {
        r.conCheckin++
        if (c.semaforo === 'verde') r.verdes++
      }
      for (const s of getSesiones(d)) {
        if (!tipoRegistro(s) || s.omitir || s.opcional) continue
        r.total++
        if (sesiones[d.fecha]?.[s.id]) r.hechas++
      }
    }
  }
  return r
}

// [{ fecha, valor }] de un campo numérico del check-in
export function serieCheckin(checkins, campo) {
  return Object.entries(checkins)
    .filter(([, c]) => typeof c?.[campo] === 'number')
    .map(([fecha, c]) => ({ fecha, valor: c[campo] }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
}

// Por ejercicio: el peso más alto de cada sesión registrada
export function progresionGym(sesiones) {
  const mapa = new Map()
  for (const fecha of Object.keys(sesiones).sort()) {
    for (const reg of Object.values(sesiones[fecha] ?? {})) {
      for (const ej of reg?.ejercicios ?? []) {
        const series = ej.series.filter((x) => typeof x.peso_kg === 'number')
        if (!series.length) continue
        const top = series.reduce((a, b) => (b.peso_kg > a.peso_kg || (b.peso_kg === a.peso_kg && (b.reps ?? 0) > (a.reps ?? 0)) ? b : a))
        if (!mapa.has(ej.nombre)) mapa.set(ej.nombre, [])
        mapa.get(ej.nombre).push({ fecha, valor: top.peso_kg, extra: `${top.peso_kg} kg × ${top.reps ?? '–'}` })
      }
    }
  }
  return mapa
}

// Rodajes y long runs con duración, distancia y FC: ritmo en segundos por km
export function serieZ2(sesiones) {
  const out = []
  for (const fecha of Object.keys(sesiones).sort()) {
    for (const id of ['run_rodaje', 'run_long']) {
      const r = sesiones[fecha]?.[id]
      if (!r?.duracion_min || !r?.distancia_km) continue
      out.push({
        fecha,
        valor: Math.round((r.duracion_min * 60) / r.distancia_km),
        extra: r.fc_prom_helio ? `FC ${r.fc_prom_helio} lpm` : 'sin FC',
      })
    }
  }
  return out
}

// "1:15:56" o "12:45" → segundos. Devuelve null si no es un tiempo.
export function parseTiempo(t) {
  const m = String(t ?? '').match(/(\d+):(\d{2})(?::(\d{2}))?/)
  if (!m) return null
  return m[3] != null ? Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) : Number(m[1]) * 60 + Number(m[2])
}

export function fmtTiempo(seg) {
  const s = Math.abs(Math.round(seg))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const r = String(s % 60).padStart(2, '0')
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`
}

export const fmtPace = (seg) => `${Math.floor(seg / 60)}:${String(seg % 60).padStart(2, '0')}`
