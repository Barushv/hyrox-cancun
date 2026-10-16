import { nutricion } from '../data/plan'
import { diffDays } from './dates'

// Qué suplementos tocan hoy, según las sesiones y la línea de tiempo del día.
// Las reglas salen de los textos de dosis del plan de nutrición.
export function suplementosDelDia({ info, sesiones, dia }) {
  const titulos = (dia?.items ?? []).map((it) => it.titulo).join(' | ')
  const ids = sesiones.filter((s) => !s.omitir).map((s) => s.id)
  const registrables = sesiones.filter((s) => !s.omitir && !s.opcional && s.tipo !== 'descanso').length
  const largo = ids.includes('run_long') || ids.includes('clase_mezcla_sabado')
  const simulacion = /simulaci/i.test(info.semana.notas ?? '') && info.dia.dia === 'sabado'
  const carrera = info.semana.tipo === 'race'

  return nutricion.suplementos.map((s) => {
    const n = s.nombre.toLowerCase()
    let hoy = false
    let cuando = ''
    if (n.includes('creatina')) {
      hoy = true
      cuando = 'Con el desayuno'
    } else if (n.includes('whey')) {
      cuando = 'Solo si no llegas a la proteína'
    } else if (n.includes('carbohidratos en polvo')) {
      hoy = registrables >= 2
      cuando = hoy ? 'Post-sesión (doble sesión hoy)' : 'Solo en días de doble sesión'
    } else if (n.includes('cafe')) {
      hoy = /cafe[ií]na/i.test(titulos)
      cuando = hoy ? 'Ver hora en tu día' : 'Hoy no toca'
    } else if (n.includes('seltz')) {
      hoy = registrables > 0
      cuando = hoy ? 'Pre y post' : 'Opcional'
    } else if (n.includes('saltstick')) {
      hoy = largo
      cuando = hoy ? 'Sesión de más de 60 min o mucho calor' : 'Solo sesiones largas o calor'
    } else if (n.includes('gel')) {
      hoy = simulacion || carrera
      cuando = hoy ? 'Simulación o carrera' : 'Solo simulaciones y carrera'
    }
    return { ...s, hoy, cuando }
  })
}

// Texto de semana especial (descarga, taper, carrera) o de las 48 h previas a tu ola
export function avisoNutricion(info, fecha, fechaOla) {
  const esp = nutricion.semanas_especiales
  if (fechaOla) {
    const d = diffDays(fecha, fechaOla)
    if (d >= 0 && d <= 2) return { titulo: d === 0 ? 'Día de carrera' : 'Carga de carbohidrato (48 h antes)', texto: esp.carrera_S18 }
  }
  if (info.semana.tipo === 'deload') return { titulo: 'Semana de descarga', texto: esp.descarga }
  if (info.semana.tipo === 'taper') return { titulo: 'Taper', texto: esp.taper_S17 }
  if (info.semana.tipo === 'race') return { titulo: 'Semana de carrera', texto: esp.carrera_S18 }
  return null
}

// "platano_mediano" → "Plátano mediano", "avena_cruda_1_2_taza" → "Avena cruda ½ taza"
const PALABRAS = { platano: 'plátano', maiz: 'maíz', atun: 'atún', proteina: 'proteína' }
export function etiquetaEquivalencia(clave) {
  const t = clave
    .replace(/_1_2_/g, ' ½ ')
    .split('_')
    .map((w) => PALABRAS[w] ?? w)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
  return t.charAt(0).toUpperCase() + t.slice(1)
}
