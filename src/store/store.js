import { useCallback, useMemo, useSyncExternalStore } from 'react'

// Registro local del atleta. Separado del plan: actualizar los JSON no borra el historial.
const PREFIX = 'hgc_'
const listeners = new Map()

export const KEYS = {
  checkins: 'checkins', // { [fecha]: { sueno_horas, fc_reposo_lpm, rodilla, agujetas, energia, peso_kg, dolor_agudo, semaforo, motivos } }
  hechos: 'hechos', // { [fecha]: string[] } items de la línea de tiempo marcados
  ajustes: 'ajustes', // { fechaOla, horaOla, variantes: { [dia]: id } }
  variantesFecha: 'variantes_fecha', // { [fecha]: id }
  anclas: 'anclas', // { [fecha]: { [ref]: 'HH:MM' } }
  sesiones: 'sesiones', // { [fecha]: { [plantillaId]: registro } } campos según registro_campos del plan
  pruebas: 'pruebas', // [{ id, fecha, tipo, resultado, notas, ...campos InBody }]
  nutricionDia: 'nutricion_dia', // { [fecha]: { agua_l, suplementos: string[], hambre_1_5, notas } }
  compras: 'compras', // { [semana del plan]: alimentos ya comprados }
}

function readRaw(key) {
  try {
    return localStorage.getItem(PREFIX + key)
  } catch {
    return null
  }
}

export function read(key, fallback) {
  const raw = readRaw(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function write(key, value) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // Almacenamiento lleno o bloqueado: la app sigue funcionando sin guardar
  }
  listeners.get(key)?.forEach((fn) => fn())
}

export function clearAll() {
  Object.values(KEYS).forEach((k) => {
    try {
      localStorage.removeItem(PREFIX + k)
    } catch {
      /* nada que borrar */
    }
    listeners.get(k)?.forEach((fn) => fn())
  })
}

export function useStored(key, fallback) {
  const subscribe = useCallback(
    (fn) => {
      if (!listeners.has(key)) listeners.set(key, new Set())
      listeners.get(key).add(fn)
      return () => listeners.get(key).delete(fn)
    },
    [key],
  )
  const raw = useSyncExternalStore(subscribe, () => readRaw(key))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(() => (raw ? JSON.parse(raw) : fallback), [raw])
  const set = useCallback(
    (upd) => {
      const prev = read(key, fallback)
      write(key, typeof upd === 'function' ? upd(prev) : upd)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  )
  return [value, set]
}

// Respaldo: todo lo registrado en un solo objeto JSON
export function exportarTodo() {
  const datos = {}
  Object.values(KEYS).forEach((k) => {
    const v = read(k, null)
    if (v != null) datos[k] = v
  })
  return { app: 'hyrox-cancun', version: 1, exportado: new Date().toISOString(), datos }
}

export function validarRespaldo(obj) {
  if (obj?.app !== 'hyrox-cancun' || typeof obj.datos !== 'object') throw new Error('Este archivo no es un respaldo de Hyrox Cancún.')
  return obj
}

// Reemplaza solo las claves que vienen en el respaldo
export function importarTodo(obj) {
  validarRespaldo(obj)
  const validas = new Set(Object.values(KEYS))
  Object.entries(obj.datos).forEach(([k, v]) => validas.has(k) && write(k, v))
}
