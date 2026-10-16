import { useState } from 'react'
import Icon from '../../components/Icon'
import { TIPOS_PRUEBA } from '../../engine/registro'
import { formatShort } from '../../engine/dates'
import { plan } from '../../data/plan'
import { useStored, KEYS } from '../../store/store'
import PruebaSheet from './PruebaSheet'

const ROMA = plan.linea_base_carreras.roma_2026

function resultadoTexto(p) {
  if (p.tipo !== 'inbody') return p.resultado
  return [p.peso_kg && `${p.peso_kg} kg`, p.masa_muscular_kg && `músculo ${p.masa_muscular_kg} kg`, p.grasa_pct && `grasa ${p.grasa_pct}%`].filter(Boolean).join(' · ')
}

export default function PruebasSection() {
  const [pruebas, setPruebas] = useStored(KEYS.pruebas, [])
  const [editando, setEditando] = useState(null) // null | 'nueva' | prueba

  const ordenadas = [...pruebas].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="h-section">Pruebas y mediciones</h2>
        <button className="btn-ghost flex items-center gap-1" onClick={() => setEditando('nueva')}>
          <Icon name="flag" className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="card flex flex-col divide-y divide-line">
        {ordenadas.length === 0 && (
          <p className="p-3 text-sm text-muted">
            Aquí van tu 3K, Row y SkiErg de 1000 m, las simulaciones de S9 y S15 y cada InBody. Tu referencia: Roma {ROMA.total} (running {ROMA.running}).
          </p>
        )}
        {ordenadas.map((p) => (
          <button key={p.id} className="flex items-center gap-3 p-3 text-left active:bg-accent-soft" onClick={() => setEditando(p)}>
            <span className="w-14 shrink-0 font-mono text-xs text-muted tabular">{formatShort(p.fecha)}</span>
            <span className="min-w-0 flex-1">
              <b className="block text-sm">{TIPOS_PRUEBA[p.tipo]?.label ?? p.tipo}</b>
              <span className="font-mono text-xs tabular">{resultadoTexto(p)}</span>
            </span>
            <Icon name="chevronRight" className="w-4 h-4 text-muted" />
          </button>
        ))}
      </div>

      {editando && (
        <PruebaSheet
          inicial={editando === 'nueva' ? null : editando}
          onClose={() => setEditando(null)}
          onSave={(p) => {
            setPruebas((all) => [...all.filter((x) => x.id !== p.id), p])
            setEditando(null)
          }}
          onDelete={(id) => {
            setPruebas((all) => all.filter((x) => x.id !== id))
            setEditando(null)
          }}
        />
      )}
    </section>
  )
}
