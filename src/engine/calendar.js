import { plan } from '../data/plan'

export const PRIMER_DIA = plan.semanas[0].inicio
export const ULTIMO_DIA = plan.semanas[plan.semanas.length - 1].fin
export const TOTAL_SEMANAS = Math.max(...plan.semanas.map((s) => s.semana))

export const FASES = Object.fromEntries(plan.fases.map((f) => [f.id, f]))

const FASE_CORTA = { F0: 'Reentrada', F1: 'Base', F2: 'Potencia y umbral', F3: 'Específico Hyrox', F4: 'Carrera' }
export const faseCorta = (id) => FASE_CORTA[id] ?? FASES[id]?.nombre ?? id

export const TIPO_SEMANA = {
  reentrada: 'Reentrada',
  build: 'Carga',
  specific: 'Específica',
  deload: 'Descarga',
  taper: 'Taper',
  race: 'Carrera',
}

// Índice fecha → { semana, dia } para buscar cualquier día en O(1)
const indice = new Map()
for (const semana of plan.semanas) {
  for (const dia of semana.dias) indice.set(dia.fecha, { semana, dia })
}

export const getDia = (iso) => indice.get(iso) ?? null

// Une cada sesión del día con su plantilla. Los campos de la semana pisan a los de la plantilla.
export function getSesiones(dia) {
  return (dia.sesiones ?? []).map((s) => ({
    ...(plan.plantillas[s.plantilla] ?? {}),
    ...s,
    id: s.plantilla,
  }))
}
