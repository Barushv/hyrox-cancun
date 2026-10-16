import { plan } from '../data/plan'
import { addDays } from './dates'

export const RECOMENDACION = {
  verde: plan.semaforo.verde,
  amarillo: plan.semaforo.amarillo,
  rojo: plan.semaforo.rojo,
}

export const COLOR_LABEL = { verde: 'Verde', amarillo: 'Amarillo', rojo: 'Rojo' }

// Promedio de FC en reposo de los 7 días previos. Necesita al menos 3 registros para ser útil.
export function promedioFc(checkins, iso) {
  const valores = []
  for (let i = 1; i <= 7; i++) {
    const fc = checkins[addDays(iso, -i)]?.fc_reposo_lpm
    if (typeof fc === 'number') valores.push(fc)
  }
  if (valores.length < 3) return null
  return Math.round(valores.reduce((a, b) => a + b, 0) / valores.length)
}

// Aplica los criterios_amarillos del plan. 0 = verde, 1 = amarillo, 2+ = rojo.
// Rodilla 3/10 o más, o dolor agudo, es rojo directo.
export function evaluar(c, fcPromedio) {
  const motivos = []
  if (c.sueno_horas != null && c.sueno_horas < 6) motivos.push(`Dormiste ${c.sueno_horas} h (menos de 6)`)
  if (c.fc_reposo_lpm != null && fcPromedio != null && c.fc_reposo_lpm >= fcPromedio + 7) {
    motivos.push(`FC en reposo ${c.fc_reposo_lpm} lpm, +${c.fc_reposo_lpm - fcPromedio} sobre tu promedio`)
  }
  if (c.rodilla === 2) motivos.push('Rodilla 2/10')
  if (c.agujetas != null && c.agujetas >= 5) motivos.push(`Agujetas ${c.agujetas}/10`)
  if (c.energia != null && c.energia <= 2) motivos.push(`Energía ${c.energia}/5`)

  let color = motivos.length === 0 ? 'verde' : motivos.length === 1 ? 'amarillo' : 'rojo'
  if (c.rodilla != null && c.rodilla >= 3) {
    color = 'rojo'
    motivos.push(`Rodilla ${c.rodilla}/10`)
  }
  if (c.dolor_agudo) {
    color = 'rojo'
    motivos.push('Dolor agudo')
  }
  return { color, motivos }
}
