import { diarioPara, nutricion } from '../data/plan'
import { toMin, fromMin } from './dates'

// Sin fecha: las variantes del plan diario vigente (las que se eligen en Ajustes)
export const variantesDe = (diaKey, fecha) => diarioPara(fecha).dias.filter((d) => d.dia === diaKey)

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

export const ANCLA_LABEL = { clase: 'Clase', gym: 'Gym', engine: 'Clase Hyrox', correr: 'Correr', rodaje: 'Rodaje' }

// Días cuya variante decide la app según el semáforo y la semana (no se eligen en Ajustes)
export const DIAS_AUTOMATICOS = ['martes', 'miercoles']

/**
 * Elige la plantilla diaria.
 * Prioridad: la que elegiste para esa fecha → regla automática → tu preferida del día → la primera.
 * Martes: sin clase Hyrox (B) si la semana la omite o el semáforo no está en verde.
 * Miércoles: sin clase Hybrid (B) si el semáforo no está en verde.
 * Viernes: sin comodín (A) si la semana lo omite o el semáforo no está en verde; si no, el que prefieras.
 */
export function elegirVariante({ fecha, diaKey, elegidaFecha, preferida, sesiones, semaforo }) {
  const vars = variantesDe(diaKey, fecha)
  // Miércoles y viernes automáticos solo con la estructura nueva; antes se elegían a mano
  const vigente = diarioPara(fecha) === diarioPara()
  if (vars.length === 0) return { variante: null, vars, auto: null }
  const porId = (id) => vars.find((v) => v.id === id)

  if (elegidaFecha && porId(elegidaFecha)) return { variante: porId(elegidaFecha), vars, auto: null }

  // Quita una clase si la semana no la trae o el semáforo no está en verde
  const sinClase = (claseId, varianteId, nombre) => {
    if (!porId(varianteId)) return null
    const clase = sesiones.find((s) => s.id === claseId)
    let auto = null
    if (!clase || clase.omitir) auto = `Esta semana no va la ${nombre}.`
    else if (semaforo && semaforo !== 'verde') auto = `El semáforo no está en verde: se omite la ${nombre}.`
    return auto ? { variante: porId(varianteId), vars, auto } : null
  }
  if (diaKey === 'martes') {
    const r = sinClase('clase_engine_extra', 'martes_B', 'clase Hyrox')
    if (r) return r
  }
  if (vigente && diaKey === 'miercoles') {
    const r = sinClase('clase_hybrid_controlada', 'miercoles_B', 'clase Hybrid')
    return r ?? { variante: porId('miercoles_A') ?? vars[0], vars, auto: null }
  }
  if (vigente && diaKey === 'viernes') {
    const r = sinClase('clase_comodin', 'viernes_A', 'clase comodín')
    if (r) return r
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
