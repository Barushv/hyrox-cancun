// Fechas locales en formato ISO (YYYY-MM-DD), sin zonas horarias de por medio.
export const DIAS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export const DIAS_LABEL = {
  lunes: 'Lunes',
  martes: 'Martes',
  miercoles: 'Miércoles',
  jueves: 'Jueves',
  viernes: 'Viernes',
  sabado: 'Sábado',
  domingo: 'Domingo',
}

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

export function toISO(d) {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayISO = () => toISO(new Date())

export function addDays(iso, n) {
  const d = fromISO(iso)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

export const diffDays = (from, to) => Math.round((fromISO(to) - fromISO(from)) / 86400000)

export const weekdayKey = (iso) => DIAS[fromISO(iso).getDay()]

export function formatShort(iso) {
  const d = fromISO(iso)
  return `${d.getDate()} ${MESES[d.getMonth()]}`
}

export function toMin(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function fromMin(min) {
  const t = ((min % 1440) + 1440) % 1440
  return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`
}

export function nowMin() {
  const d = new Date()
  return d.getHours() * 60 + d.getMinutes()
}
