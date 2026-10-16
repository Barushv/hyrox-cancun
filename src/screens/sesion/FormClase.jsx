import { Escala, Numero, Opciones, Texto } from '../../components/Campos'

export default function FormClase({ r, set }) {
  return (
    <div className="flex flex-col gap-4">
      <Opciones
        id="clase-hecha"
        label="¿La hiciste?"
        opciones={[
          { value: true, label: 'Sí' },
          { value: false, label: 'No, se canceló' },
        ]}
        value={r.realizada}
        onChange={(v) => set('realizada', v)}
      />
      {r.realizada ? (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Numero id="clase-dur" label="Duración" unidad="min" value={r.duracion_min} onChange={(v) => set('duracion_min', v)} />
            <Numero id="clase-fc" label="FC prom" unidad="lpm" value={r.fc_prom} onChange={(v) => set('fc_prom', v)} />
          </div>
          <Escala id="clase-rpe" label="Esfuerzo" ayuda="RPE 1-10" min={1} max={10} value={r.rpe_1_10} onChange={(v) => set('rpe_1_10', v)} />
        </>
      ) : (
        <Texto id="clase-motivo" label="Motivo" value={r.motivo_si_cancelada} onChange={(v) => set('motivo_si_cancelada', v)} placeholder="Semáforo amarillo, poco sueño, agenda…" />
      )}
      <Texto id="clase-notas" label="Notas" multilinea value={r.notas} onChange={(v) => set('notas', v)} />
    </div>
  )
}
