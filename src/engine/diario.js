import { diario, nutricion } from '../data/plan'
import { toMin, fromMin } from './dates'

export const variantesDe = (diaKey) => diario.dias.filter((d) => d.dia === diaKey)

// "A: clase en la manana" → "Clase en la manana"
export function etiquetaVariante(v) {
  // Solo quita el prefijo "A:" / "B:"; no corta horas como "6:30"
  const txt = v.variante.replace(/^[A-Z]:\s*/, '')
  return txt.charAt(0).toUpperCase() + txt.slice(1)
}

const FRAC = { 0.25: '¼', 0.5: '½', 0.75: '¾' }
function fraccion(x) {
  const q = Math.round(x * 4) / 4
  const ent = Math.floor(q)
  const dec = FRAC[q - ent] ?? ''
  return ent === 0 ? dec || '0' : `${ent}${dec}`
}

// Composición por 100 g que trae el plan de nutrición, buscada por nombre del alimento
const BASE = Object.values(nutricion.alimentos_base_por_100g ?? {})
const carbosPor100 = (nombre) => BASE.find((b) => b.nombre === nombre)?.carbohidrato_g
// Gramos aproximados por taza para mostrar la medida casera
const TAZA_G = { arroz: 160, pasta: 140, papa: 150 }

// Quita carbohidrato de la fuente principal (arroz, pasta o papa) y recalcula sus gramos
function reducirCarbo(alimentos, quita) {
  const carbo = alimentos?.find((a) => a.unidad === 'g' && /arroz|pasta|papa/i.test(a.alimento) && carbosPor100(a.alimento))
  if (!carbo) return alimentos
  const c100 = carbosPor100(carbo.alimento)
  const gr = Math.max(0, Math.round((carbo.cantidad - (quita / c100) * 100) / 5) * 5)
  const tipo = Object.keys(TAZA_G).find((k) => carbo.alimento.toLowerCase().includes(k))
  const tazas = tipo ? gr / TAZA_G[tipo] : null
  const medida = tazas ? `≈ ${fraccion(tazas)} taza${tazas > 1.1 ? 's' : ''}` : undefined
  return alimentos.map((a) => (a === carbo ? { ...a, cantidad: gr, medida, ajustada: true } : a))
}

export const ANCLA_LABEL = { clase: 'Clase', gym: 'Gym', engine: 'Clase Engine', correr: 'Correr', rodaje: 'Rodaje' }

/**
 * Elige la plantilla diaria.
 * Prioridad: la que elegiste para esa fecha → (martes) regla automática → tu preferida del día → la primera.
 * Martes: sin Engine (variante B) si la semana la omite o el semáforo no está en verde.
 */
export function elegirVariante({ diaKey, elegidaFecha, preferida, sesiones, semaforo }) {
  const vars = variantesDe(diaKey)
  if (vars.length === 0) return { variante: null, vars, auto: null }
  const porId = (id) => vars.find((v) => v.id === id)

  if (elegidaFecha && porId(elegidaFecha)) return { variante: porId(elegidaFecha), vars, auto: null }

  if (diaKey === 'martes' && porId('martes_B')) {
    const engine = sesiones.find((s) => s.id === 'clase_engine_extra')
    let auto = null
    if (!engine || engine.omitir) auto = 'Esta semana no va la clase Engine.'
    else if (semaforo && semaforo !== 'verde') auto = 'El semáforo no está en verde: se omite la clase Engine.'
    if (auto) return { variante: porId('martes_B'), vars, auto }
  }

  return { variante: porId(preferida) ?? vars[0], vars, auto: null }
}

/**
 * Arma la línea de tiempo del día.
 * - Las horas ancladas se recalculan con las anclas (las del JSON o las que ajustaste).
 * - Si el día del calendario es "media" pero la plantilla es "alta" (descargas, taper),
 *   quita la diferencia de carbohidratos entre la comida y la cena.
 * - sinSesiones (semana 0): deja solo despertar y comidas fijas.
 */
export function construirDia(variante, { anclas = {}, tipoNutricion, sinSesiones = false }) {
  const a = { ...variante.anclas, ...anclas }

  let items = variante.items.map((it, i) => ({
    ...it,
    key: `${variante.id}-${i}`,
    macros: it.macros ? { ...it.macros } : undefined,
    hora: it.ref === 'fija' ? it.hora_default ?? it.hora : fromMin(toMin(a[it.ref]) + it.offset_min),
  }))

  if (sinSesiones) items = items.filter((it) => it.ref === 'fija' || it.tipo === 'despertar')

  const nominal = nutricion.tipos_dia[variante.nutricion]
  const meta = nutricion.tipos_dia[tipoNutricion] ?? nominal
  // Carbohidrato que la plantilla trae por encima de su meta nominal (p. ej. el pre de 44 g)
  const extraC = sinSesiones ? 0 : Math.max(0, variante.totales.c - nominal.carbos_g)
  let ajuste = null

  if (variante.nutricion !== tipoNutricion && meta) {
    const diff = nominal.carbos_g - meta.carbos_g
    const objetivo = items.filter((it) => it.tipo === 'comida' && ['Comida', 'Cena'].includes(it.titulo))
    if (diff > 0 && objetivo.length) {
      const parte = Math.floor(diff / objetivo.length)
      objetivo.forEach((it, i) => {
        const quita = i === objetivo.length - 1 ? diff - parte * (objetivo.length - 1) : parte
        it.macros.c -= quita
        it.ajusteCarbos = -quita
        it.alimentos = reducirCarbo(it.alimentos, quita)
      })
      ajuste = `Hoy toca día media: se quitaron ${diff} g de carbohidrato entre la comida y la cena.`
    }
  }

  items.sort((x, y) => toMin(x.hora) - toMin(y.hora))

  return {
    items,
    anclas: a,
    meta: { p: meta.proteina_g, c: meta.carbos_g + extraC, g: meta.grasa_g, kcal: meta.kcal + extraC * 4 },
    ajuste,
  }
}
