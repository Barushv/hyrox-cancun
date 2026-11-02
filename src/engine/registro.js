// Reglas del registro de sesiones y pruebas. Sin interfaz.

// Formulario que usa cada tipo de plantilla
export function tipoRegistro(s) {
  if (s.tipo === 'gym') return 'gym'
  if (s.tipo === 'running') return 'running'
  if (s.tipo === 'clase') return 'clase'
  return null
}

export function registroVacio(s) {
  switch (tipoRegistro(s)) {
    case 'gym':
      return {
        ejercicios: (s.ejercicios ?? []).map((e) => ({
          nombre: e.ejercicio,
          series: Array.from({ length: e.series }, () => ({ peso_kg: null, reps: null, rir: null })),
        })),
        rpe_sesion: null,
        notas: '',
      }
    case 'running':
      return {
        duracion_min: null,
        distancia_km: null,
        fc_prom_helio: null,
        fc_max_helio: null,
        cadencia_spm: null,
        rpe_1_10: null,
        rodilla_0_10: null,
        intervalos: [],
        clima: { temp_c: null, humedad_pct: null },
        notas: '',
      }
    case 'clase':
      return { realizada: true, motivo_si_cancelada: '', duracion_min: null, rpe_1_10: null, fc_prom: null, notas: '' }
    default:
      return { notas: '' }
  }
}

// "8-10" → 10, "12-15" → 15, "10 / 12-15" → 15. Si no hay rango, el primer número.
export function repsTope(reps) {
  const rangos = [...String(reps).matchAll(/(\d+)\s*-\s*(\d+)/g)]
  if (rangos.length) return Number(rangos[rangos.length - 1][2])
  const n = String(reps).match(/\d+/)
  return n ? Number(n[0]) : null
}

// Ritmo medio en min/km a partir de duración y distancia
export function paceTexto(duracionMin, distanciaKm) {
  if (!duracionMin || !distanciaKm) return null
  const total = Math.round((duracionMin / distanciaKm) * 60)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')} /km`
}

// Registro más reciente de la misma plantilla antes de esta fecha
export function registroAnterior(sesiones, fecha, plantillaId) {
  const fechas = Object.keys(sesiones)
    .filter((f) => f < fecha && sesiones[f]?.[plantillaId])
    .sort()
  const f = fechas[fechas.length - 1]
  return f ? { fecha: f, registro: sesiones[f][plantillaId] } : null
}

// Series de un ejercicio en el registro anterior (busca por nombre)
export function seriesAnteriores(anterior, nombre) {
  const nombres = nombresDe(nombre)
  const ej = anterior?.registro?.ejercicios?.find((e) => nombres.includes(e.nombre))
  return ej?.series?.filter((x) => x.peso_kg != null || x.reps != null) ?? []
}

// Progresión doble: sube peso cuando completas el rango alto en todas las series
export function sugerenciaProgresion(seriesPrev, reps) {
  if (unidadReps(reps) !== 'Reps') return null
  const tope = repsTope(reps)
  if (!tope || seriesPrev.length === 0) return null
  if (seriesPrev.every((x) => x.reps != null && x.reps >= tope)) return 'Completaste el rango alto en todas las series: sube el peso.'
  return null
}

// Estado de una sesión para mostrarla en Hoy y en el Plan
export function estadoSesion(registro, s, fecha, hoy) {
  if (registro) return registro.realizada === false ? 'cancelada' : 'registrada'
  if (s.omitir) return 'omitida'
  if (fecha > hoy) return 'futura'
  return 'pendiente'
}

export const TIPOS_PRUEBA = {
  '3k': { label: 'Prueba de 3 km', ayuda: 'Tiempo', placeholder: '12:45' },
  row_1000: { label: 'Row 1000 m (Concept2)', ayuda: 'Tiempo', placeholder: '3:45' },
  skierg_1000: { label: 'SkiErg 1000 m (Concept2)', ayuda: 'Tiempo', placeholder: '4:00' },
  '5rm_estimado': { label: '5RM estimado', ayuda: 'Ejercicio y peso', placeholder: 'Prensa 180 kg' },
  simulacion: { label: 'Simulación Hyrox', ayuda: 'Tiempo total y tipo', placeholder: '38:20 (media)' },
  inbody: { label: 'InBody', ayuda: null, placeholder: '' },
}

// --- Plan v1.1: ejercicios renombrados y progresión por fase ---

const sinAcento = (t) => String(t ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Nombres anteriores del mismo ejercicio, para que el registro de semanas pasadas siga sirviendo de referencia
export const NOMBRES_ANTERIORES = {
  'Jalón al pecho, agarre neutro': ['Jalón al pecho'],
  'Remo sentado en polea, agarre neutro, pausa de 1 s': ['Remo en polea o máquina'],
  'Remo con apoyo en el pecho (máquina o mancuernas)': ['Remo con apoyo o máquina'],
  'Zancada búlgara con mancuernas': ['Zancada búlgara o step-up'],
}

// Todos los nombres con los que se pudo haber registrado un ejercicio
export const nombresDe = (nombre) => [nombre, ...(NOMBRES_ANTERIORES[nombre] ?? [])]

// Nombre actual de un ejercicio registrado con un nombre viejo
export function nombreActual(nombre) {
  for (const [actual, viejos] of Object.entries(NOMBRES_ANTERIORES)) if (viejos.includes(nombre)) return actual
  return nombre
}

// Qué se mide en la columna de repeticiones: segundos (colgado), metros (farmers, zancada) o reps
export function unidadReps(reps) {
  const t = String(reps ?? '')
  if (/\d\s*s\b|seg/.test(t)) return 'Seg'
  if (/\d\s*m\b/.test(t)) return 'Metros'
  return 'Reps'
}

// Meta de la tabla progresion_gym para la semana actual (S3-S8, S9-S14, S15-S17)
export function metaProgresion(progresion, nombreEjercicio, semana) {
  if (!progresion?.ejercicios || semana == null) return null
  const fase = (progresion.fases ?? []).find((f) => {
    const m = f.match(/S(\d+)\s*-\s*S(\d+)/)
    return m && semana >= Number(m[1]) && semana <= Number(m[2])
  })
  if (!fase) return null
  const n = sinAcento(nombreEjercicio)
  const ej = progresion.ejercicios.find((e) => n.startsWith(sinAcento(e.ejercicio)))
  return ej?.[fase] ? { fase, meta: ej[fase] } : null
}
