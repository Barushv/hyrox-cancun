import { nutricion } from '../data/plan'
import { addDays, formatShort } from './dates'

// Pesajes del check-in, en orden de fecha
export function pesajes(checkins) {
  return Object.entries(checkins)
    .filter(([, c]) => typeof c?.peso_kg === 'number')
    .map(([fecha, c]) => ({ fecha, peso: c.peso_kg }))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : 1))
}

// Promedio de 7 días que terminan en iso. Necesita al menos 3 pesajes (regla del plan: usa el promedio, no el dato suelto).
export function promedio7(checkins, iso) {
  const v = []
  for (let i = 0; i < 7; i++) {
    const p = checkins[addDays(iso, -i)]?.peso_kg
    if (typeof p === 'number') v.push(p)
  }
  return v.length >= 3 ? v.reduce((a, b) => a + b, 0) / v.length : null
}

// kcal extra acumuladas por ajustes de peso vigentes en esa fecha
export const kcalAjustePeso = (lista, fecha) => lista.filter((a) => a.fecha <= fecha).reduce((s, a) => s + a.kcal, 0)

const kg = (x) => `${x > 0 ? '+' : ''}${x.toFixed(2)} kg`

/**
 * Aplica las reglas de "ajuste" del plan de nutrición:
 * - Desde la semana 3 (antes, creatina y glucógeno suben agua).
 * - Cada 2 semanas, comparando promedios de 7 días separados 14 días.
 * - < +0.1 kg/sem → +200 kcal · > +0.5 kg/sem → −200 kcal · pierdes peso → +300 kcal.
 */
export function evaluarPeso(checkins, hoy, semanaNum, ajustesPrevios = []) {
  const actual = promedio7(checkins, hoy)
  const previo = promedio7(checkins, addDays(hoy, -14))
  const base = { actual, previo, porSemana: null, kcal: 0 }
  const reglas = nutricion.ajuste

  if (semanaNum < 3) return { ...base, estado: 'espera', texto: reglas.primeras_semanas }
  if (actual == null || previo == null) {
    return { ...base, estado: 'faltan', texto: 'Para evaluar necesitas 3 pesajes en los últimos 7 días y 3 en la semana de hace 14 días. Anota tu peso en el check-in.' }
  }

  const porSemana = (actual - previo) / 2
  const ultimo = [...ajustesPrevios].sort((a, b) => (a.fecha < b.fecha ? -1 : 1)).pop()
  const proxima = ultimo ? addDays(ultimo.fecha, 14) : null
  if (proxima && hoy < proxima) {
    return { ...base, porSemana, estado: 'reciente', texto: `Vas en ${kg(porSemana)} por semana. Ya ajustaste el ${formatShort(ultimo.fecha)}; la próxima revisión es el ${formatShort(proxima)}.` }
  }

  if (porSemana < 0) return { ...base, porSemana, estado: 'ajustar', kcal: 300, texto: reglas.cada_2_semanas[2] }
  if (porSemana < 0.1) return { ...base, porSemana, estado: 'ajustar', kcal: 200, texto: reglas.cada_2_semanas[0] }
  if (porSemana > 0.5) return { ...base, porSemana, estado: 'ajustar', kcal: -200, texto: reglas.cada_2_semanas[1] }
  return { ...base, porSemana, estado: 'ok', texto: `Vas en ${kg(porSemana)} por semana, dentro de la meta (${reglas.meta_peso})` }
}
