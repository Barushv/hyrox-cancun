// Única puerta de entrada a los 3 JSON. Para otra carrera se reemplazan los archivos en /data.
import planJson from '../../data/plan_hyrox_cancun.json'
import nutricionJson from '../../data/plan_nutricion_hyrox_cancun.json'
import diarioJson from '../../data/plan_diario_hyrox_cancun.json'
import retiradas from './plantillas_retiradas.json'
import diarioAnterior from './diarios_anteriores/plan_diario_1.3.1.json'

// Las semanas ya pasadas pueden apuntar a plantillas que el plan quitó (p. ej. gym_piernas en S1-S4).
// Se agregan solo si el plan no trae una con ese id.
// eslint-disable-next-line no-unused-vars
const { _nota, ...plantillasRetiradas } = retiradas
export const plan = { ...planJson, plantillas: { ...plantillasRetiradas, ...planJson.plantillas } }
export const nutricion = nutricionJson
export const diario = diarioJson

// El plan diario cambia de estructura en vigente_desde; las fechas anteriores usan la versión previa
// para que la línea de tiempo y las comidas marcadas de esos días sigan cuadrando.
export const diarioPara = (fecha) => (fecha && diarioJson.vigente_desde && fecha < diarioJson.vigente_desde ? diarioAnterior : diarioJson)
