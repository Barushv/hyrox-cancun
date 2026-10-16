import { getDia, getSesiones } from './calendar'
import { elegirVariante, construirDia } from './diario'
import { kcalAjustePeso } from './peso'
import { weekdayKey } from './dates'

/**
 * Todo lo que el plan dice para una fecha, combinado con lo que registró el atleta.
 * Función pura: recibe los registros guardados y no lee nada por su cuenta.
 */
export function calcularDia(fecha, { checkins = {}, hechosAll = {}, ajustes = {}, varFecha = {}, anclasAll = {} }) {
  const info = getDia(fecha)
  if (!info) return { info: null }

  const diaKey = weekdayKey(fecha)
  const checkin = checkins[fecha]
  const sesiones = getSesiones(info.dia)
  const sinSesiones = !info.dia.sesiones

  const { variante, vars, auto } = elegirVariante({
    diaKey,
    elegidaFecha: varFecha[fecha],
    preferida: ajustes.variantes?.[diaKey],
    sesiones,
    semaforo: checkin?.semaforo,
  })

  let dia = null
  const extraKcal = kcalAjustePeso(ajustes.ajustesPeso ?? [], fecha)
  if (variante) {
    dia = construirDia(variante, { anclas: anclasAll[fecha]?.[variante.id], tipoNutricion: info.dia.nutricion_tipo, sinSesiones })
    // Ajustes por peso: se suman como carbohidrato (+200 kcal ≈ +50 g)
    if (extraKcal) dia.meta = { ...dia.meta, c: dia.meta.c + Math.round(extraKcal / 4), kcal: dia.meta.kcal + extraKcal }
  }

  const hechos = hechosAll[fecha] ?? []
  const consumido = { p: 0, c: 0, g: 0 }
  dia?.items.forEach((it) => {
    if (it.macros && hechos.includes(it.key)) {
      consumido.p += it.macros.p
      consumido.c += it.macros.c
      consumido.g += it.macros.g
    }
  })

  return { info, diaKey, checkin, sesiones, sinSesiones, variante, vars, auto, dia, hechos, consumido, extraKcal }
}
