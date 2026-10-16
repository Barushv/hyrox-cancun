// Calcula las porciones (gramos por alimento) de las 5 comidas fijas de cada día,
// a partir de los macros que ya trae plan_diario. Se puede correr varias veces.
// Uso: node scripts/add-porciones.cjs
const { load, save } = require('./json-tools.cjs')

const FILE = 'plan_diario_hyrox_cancun.json'

// Valores aproximados por 100 g (o por pieza). Alimentos en cocido.
const A = {
  huevo: { alimento: 'Huevo entero', unidad: 'pieza', pieza_g: 50, p: 6, c: 0.5, g: 5 },
  clara: { alimento: 'Clara de huevo', unidad: 'pieza', pieza_g: 33, p: 3.6, c: 0.2, g: 0 },
  tortilla: { alimento: 'Tortilla de maíz', unidad: 'pieza', pieza_g: 30, p: 1.4, c: 12, g: 0.7, alternativa: 'o 1 rebanada de pan de caja por tortilla' },
  platano: { alimento: 'Plátano mediano', unidad: 'pieza', pieza_g: 120, p: 1.3, c: 27, g: 0.4 },
  fruta: { alimento: 'Fruta picada (papaya o melón)', unidad: 'taza', pieza_g: 140, p: 0.7, c: 15, g: 0.4 },
  yogurt: { alimento: 'Yogurt griego natural sin azúcar', por100: { p: 10, c: 3.6, g: 0.4 } },
  granola: { alimento: 'Granola', por100: { p: 10, c: 64, g: 15 } },
  pollo: { alimento: 'Pechuga de pollo cocida', por100: { p: 31, c: 0, g: 3.6 }, alternativa: 'o pescado blanco: +25% de peso' },
  arroz: { alimento: 'Arroz blanco cocido', por100: { p: 2.7, c: 28, g: 0.3 }, taza_g: 160, alternativa: 'o papa cocida: +40% de peso' },
  frijoles: { alimento: 'Frijoles cocidos', por100: { p: 8.8, c: 23.5, g: 0.5 }, taza_g: 170 },
  verdura: { alimento: 'Verdura cocida', unidad: 'taza', pieza_g: 150, p: 2, c: 7, g: 0.3 },
  aceite: { alimento: 'Aceite de oliva', por100: { p: 0, c: 0, g: 100 }, cda_g: 14, alternativa: 'o aguacate: 7 g de aceite = 50 g de aguacate' },
  pan: { alimento: 'Pan de caja integral', unidad: 'rebanada', pieza_g: 30, p: 3, c: 13, g: 1 },
  pavo: { alimento: 'Pechuga de pavo en rebanadas', por100: { p: 18, c: 2, g: 2 }, alternativa: 'o atún en agua: 70% de ese peso' },
  jugo: { alimento: 'Jugo de naranja', unidad: 'vaso', etiqueta: '250 ml', pieza_g: 250, p: 1.7, c: 26, g: 0.5 },
  pasta: { alimento: 'Pasta cocida', por100: { p: 5.8, c: 31, g: 0.9 }, taza_g: 140, alternativa: 'o arroz cocido: +10% de peso' },
}

const r10 = (x) => Math.max(0, Math.round(x / 10) * 10)
const r5 = (x) => Math.max(0, Math.round(x / 5) * 5)
const rHalf = (x) => Math.max(0, Math.round(x * 2) / 2)
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))
const r1 = (x) => Math.round(x * 10) / 10
// Porción mínima de proteína para que la comida sea realista (la proteína del día sube unos gramos)
const PROTEINA_MIN_G = 60

const FRAC = { 0.25: '¼', 0.5: '½', 0.75: '¾' }
function fraccion(x) {
  const q = Math.round(x * 4) / 4
  const ent = Math.floor(q)
  const dec = FRAC[q - ent] ?? ''
  return ent === 0 ? dec || '0' : `${ent}${dec}`
}

// Porción por piezas o tazas
function piezas(key, n, rol) {
  const f = A[key]
  const plural = n <= 1 ? f.unidad : f.unidad.replace(/^(\w+)/, (u) => (u.endsWith('a') || u.endsWith('o') ? `${u}s` : `${u}es`))
  return {
    alimento: f.alimento,
    cantidad: f.etiqueta ?? `${fraccion(n)} ${plural}`,
    piezas: n,
    unidad: f.unidad,
    gramos: Math.round(n * f.pieza_g),
    rol,
    macros: { p: r1(n * f.p), c: r1(n * f.c), g: r1(n * f.g) },
    ...(f.alternativa ? { alternativa: f.alternativa } : {}),
  }
}

// Porción por gramos
function gramos(key, gr, rol) {
  const f = A[key]
  const k = gr / 100
  let cantidad = `${gr} g`
  if (f.taza_g) cantidad += ` (≈ ${fraccion(gr / f.taza_g)} taza${gr / f.taza_g > 1.1 ? 's' : ''})`
  if (f.cda_g) cantidad += ` (≈ ${fraccion(gr / f.cda_g)} cda)`
  return {
    alimento: f.alimento,
    cantidad,
    gramos: gr,
    ...(f.taza_g ? { taza_g: f.taza_g } : {}),
    ...(f.cda_g ? { cda_g: f.cda_g } : {}),
    rol,
    c_por_100g: f.por100.c,
    macros: { p: r1(k * f.por100.p), c: r1(k * f.por100.c), g: r1(k * f.por100.g) },
    ...(f.alternativa ? { alternativa: f.alternativa } : {}),
  }
}

const RECETAS = {
  Desayuno({ p, c, g }) {
    const nf = c >= 90 ? 2 : 1
    const t = Math.round((c - 27 * nf - 1) / 12)
    const h = clamp(Math.round((g - 0.7 * t - 0.4 * nf) / 5), 1, 4)
    const cl = clamp(Math.round((p - 6 * h - 1.4 * t - 1.3 * nf) / 3.6), 0, 8)
    return [
      piezas('huevo', h, 'proteina'),
      ...(cl > 0 ? [piezas('clara', cl, 'proteina')] : []),
      piezas('tortilla', t, 'carbo'),
      piezas('platano', nf, 'fruta'),
    ]
  },
  Colacion({ p, c, g }, item) {
    if (/yogurt/i.test(item.detalle)) {
      const gran = r5((g - 0.7) / 0.15)
      const yog = r10((p - gran * 0.1 - 0.7) / 0.1)
      const fr = rHalf((c - gran * 0.64 - yog * 0.036) / 15)
      return [gramos('yogurt', yog, 'proteina'), gramos('granola', gran, 'carbo'), ...(fr > 0 ? [piezas('fruta', fr, 'fruta')] : [])]
    }
    // Sándwich de pavo + fruta + jugo
    const pavo = r10((p - 6 - 1.7) / 0.18)
    const fr = rHalf((c - 52 - pavo * 0.02) / 15)
    return [piezas('pan', 2, 'carbo'), gramos('pavo', pavo, 'proteina'), piezas('jugo', 1, 'carbo'), ...(fr > 0 ? [piezas('fruta', fr, 'fruta')] : [])]
  },
  Comida({ p, c, g }) {
    const frij = 85
    const arroz = r10((c - 20 - 7) / 0.28)
    const pollo = Math.max(PROTEINA_MIN_G, r10((p - 7.5 - 2 - arroz * 0.027) / 0.31))
    const aceite = r5(g - pollo * 0.036 - arroz * 0.003 - 0.4 - 0.3)
    return [
      gramos('pollo', pollo, 'proteina'),
      gramos('arroz', arroz, 'carbo'),
      gramos('frijoles', frij, 'carbo_fijo'),
      piezas('verdura', 1, 'verdura'),
      gramos('aceite', aceite, 'grasa'),
    ]
  },
  Cena({ p, c, g }) {
    const pasta = r10((c - 7) / 0.31)
    const pollo = Math.max(PROTEINA_MIN_G, r10((p - 2 - pasta * 0.058) / 0.31))
    const aceite = r5(g - pollo * 0.036 - pasta * 0.009 - 0.3)
    return [gramos('pollo', pollo, 'proteina'), gramos('pasta', pasta, 'carbo'), piezas('verdura', 1, 'verdura'), gramos('aceite', aceite, 'grasa')]
  },
}

const diario = load(FILE)
const reporte = []

diario.porciones_nota =
  'Cantidades aproximadas, calculadas con tablas de composición para cumplir los macros de cada toma. Pesos en cocido. Verifica etiquetas y valida con tu nutrióloga.'

for (const dia of diario.dias) {
  for (const it of dia.items) {
    if (it.ref !== 'fija' || it.tipo !== 'comida' || !it.macros) continue
    const receta = RECETAS[it.titulo.normalize('NFD').replace(/[̀-ͯ]/g, '')]
    if (!receta) continue
    it.porciones = receta(it.macros, it)
    if (it.titulo === 'Desayuno') it.detalle = 'Huevos y claras + tortillas o pan + fruta.'
    const tot = it.porciones.reduce((a, x) => ({ p: a.p + x.macros.p, c: a.c + x.macros.c, g: a.g + x.macros.g }), { p: 0, c: 0, g: 0 })
    reporte.push({
      dia: dia.id,
      toma: it.titulo,
      meta: `${it.macros.p}/${it.macros.c}/${it.macros.g}`,
      porciones: `${Math.round(tot.p)}/${Math.round(tot.c)}/${Math.round(tot.g)}`,
      dif: `${Math.round(tot.p - it.macros.p)}/${Math.round(tot.c - it.macros.c)}/${Math.round(tot.g - it.macros.g)}`,
    })
  }
}

save(FILE, diario)
console.table(reporte)
