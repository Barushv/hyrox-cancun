// Utilidades compartidas para los scripts que editan /data
const fs = require('fs')
const path = require('path')

const DATA = path.join(__dirname, '..', 'data')
const FILES = ['plan_hyrox_cancun.json', 'plan_nutricion_hyrox_cancun.json', 'plan_diario_hyrox_cancun.json']

// Claves cuyo valor es un identificador que el código usa: nunca se modifican
const ID_KEYS = new Set([
  'id', 'dia', 'dias_semana', 'plantilla', 'ref', 'tipo', 'nutricion', 'nutricion_tipo', 'fase', 'carga',
  'fecha', 'inicio', 'fin', 'hora', 'hora_default', 'version', 'generado', 'archivo', 'estado',
  'check_diario', 'tipos_item', 'registro_campos', 'plantillas_diarias', 'rol',
])

const load = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'))
const save = (f, obj) => fs.writeFileSync(path.join(DATA, f), JSON.stringify(obj, null, 2) + '\n', 'utf8')

// Recorre los textos visibles y aplica fn(texto) → texto
function mapTexts(node, fn, key = null) {
  if (key && ID_KEYS.has(key)) return node
  if (typeof node === 'string') return fn(node)
  if (Array.isArray(node)) return node.map((n) => mapTexts(n, fn, null))
  if (node && typeof node === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(node)) out[k] = mapTexts(v, fn, k)
    return out
  }
  return node
}

module.exports = { DATA, FILES, load, save, mapTexts }
