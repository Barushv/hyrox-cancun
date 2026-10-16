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
  const ej = anterior?.registro?.ejercicios?.find((e) => e.nombre === nombre)
  return ej?.series?.filter((x) => x.peso_kg != null || x.reps != null) ?? []
}

// Progresión doble: sube peso cuando completas el rango alto en todas las series
export function sugerenciaProgresion(seriesPrev, reps) {
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
