// Agrega acentos a los textos visibles de los 3 JSON. Los identificadores no se tocan.
// Uso: node scripts/add-acentos.cjs   (se puede correr varias veces)
const { FILES, load, save, mapTexts } = require('./json-tools.cjs')

const MAPA = {
  activacion: 'activación', aerobica: 'aeróbica', aerobico: 'aeróbico', analisis: 'análisis', atun: 'atún',
  bajon: 'bajón', bano: 'baño', bascula: 'báscula', biceps: 'bíceps', bulgara: 'búlgara', cafeina: 'cafeína',
  calorias: 'calorías', cancun: 'Cancún', colacion: 'colación', condicion: 'condición', cuadriceps: 'cuádriceps',
  datiles: 'dátiles', despues: 'después', dia: 'día', dias: 'días', digestion: 'digestión', energia: 'energía',
  especifico: 'específico', estimacion: 'estimación', evalua: 'evalúa', excepcion: 'excepción',
  extension: 'extensión', facil: 'fácil', faciles: 'fáciles', glucogeno: 'glucógeno', gluteo: 'glúteo',
  hidratacion: 'hidratación', hipotesis: 'hipótesis', items: 'ítems', jalon: 'jalón', liquido: 'líquido',
  manana: 'mañana', mananas: 'mañanas', maquina: 'máquina', mas: 'más', maxima: 'máxima', maximo: 'máximo',
  medico: 'médico', merida: 'Mérida', minimo: 'mínimo', musculo: 'músculo', ningun: 'ningún',
  nutriologa: 'nutrióloga', pajaros: 'pájaros', perdida: 'pérdida', pesate: 'pésate', platano: 'plátano',
  platanos: 'plátanos', progresion: 'progresión', proteina: 'proteína', rapido: 'rápido', repon: 'repón',
  retrasala: 'retrásala', rotula: 'rótula', sabado: 'sábado', sandwich: 'sándwich', satelites: 'satélites',
  segun: 'según', semaforo: 'semáforo', sesion: 'sesión', simulacion: 'simulación', sueno: 'sueño',
  tambien: 'también', tecnica: 'técnica', triceps: 'tríceps', ultima: 'última', unica: 'única',
  miercoles: 'miércoles', estas: 'estás', especifica: 'específica', estandar: 'estándar',
}

// Casos que dependen del contexto ("esta semana" no lleva acento, "está en verde" sí)
const FRASES = [
  [/\besta (en|bajando)\b/g, 'está $1'],
  [/\bEsta (en|bajando)\b/g, 'Está $1'],
]

function conMayuscula(original, reemplazo) {
  if (original[0] === original[0].toUpperCase()) return reemplazo[0].toUpperCase() + reemplazo.slice(1)
  return reemplazo
}

function acentuar(texto) {
  let t = texto.replace(/[A-Za-z]+/g, (w) => {
    const r = MAPA[w.toLowerCase()]
    return r ? conMayuscula(w, r) : w
  })
  for (const [re, rep] of FRASES) t = t.replace(re, rep)
  return t
}

let cambios = 0
for (const f of FILES) {
  const antes = load(f)
  const despues = mapTexts(antes, (t) => {
    const n = acentuar(t)
    if (n !== t) cambios++
    return n
  })
  save(f, despues)
}
console.log(`Textos con acentos agregados: ${cambios}`)
