import { calcularDia } from '../engine/dia'
import { useStored, KEYS } from '../store/store'

// El día completo (variante, línea de tiempo, metas) para Hoy y Nutrición, siempre al día con lo guardado
export function useDiaPlan(fecha) {
  const [checkins] = useStored(KEYS.checkins, {})
  const [hechosAll] = useStored(KEYS.hechos, {})
  const [ajustes] = useStored(KEYS.ajustes, {})
  const [varFecha] = useStored(KEYS.variantesFecha, {})
  const [anclasAll] = useStored(KEYS.anclas, {})
  return calcularDia(fecha, { checkins, hechosAll, ajustes, varFecha, anclasAll })
}
