import Icon from '../../components/Icon'
import { COLOR_LABEL, RECOMENDACION } from '../../engine/semaforo'
import { SEMAFORO_STYLE } from './semaforoStyle'

export default function CheckinCard({ checkin, esFuturo, onOpen }) {
  if (esFuturo) {
    return (
      <div className="card flex items-center gap-3 p-3 text-sm text-muted">
        <Icon name="alarm" className="w-5 h-5 shrink-0" />
        El check-in y el semáforo se hacen ese día al despertar.
      </div>
    )
  }

  if (!checkin) {
    return (
      <button onClick={onOpen} className="card flex w-full items-center gap-3 p-3 text-left active:scale-[0.99] transition">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-accent-on">
          <Icon name="heart" />
        </span>
        <span className="flex-1">
          <b className="block">Haz tu check-in</b>
          <span className="text-sm text-muted">Sueño, FC, rodilla, agujetas y energía. 30 segundos.</span>
        </span>
        <Icon name="chevronRight" className="w-5 h-5 text-muted" />
      </button>
    )
  }

  const st = SEMAFORO_STYLE[checkin.semaforo]
  return (
    <div className={`card overflow-hidden border-l-[6px] ${st.border}`}>
      <div className="flex items-start gap-3 p-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`h-3 w-3 rounded-full ${st.dot}`} />
            <b className="font-display text-lg uppercase leading-none">Semáforo {COLOR_LABEL[checkin.semaforo]}</b>
          </div>
          <p className="mt-1 text-sm">{RECOMENDACION[checkin.semaforo]}</p>
          {checkin.motivos?.length > 0 && <p className="mt-1 text-xs text-muted">Por: {checkin.motivos.join(' · ')}</p>}
          <p className="mt-2 font-mono text-[11px] text-muted tabular">
            {checkin.sueno_horas} h · {checkin.fc_reposo_lpm ?? '–'} lpm · rodilla {checkin.rodilla} · agujetas {checkin.agujetas} · energía {checkin.energia}
            {checkin.peso_kg ? ` · ${checkin.peso_kg} kg` : ''}
          </p>
        </div>
        <button onClick={onOpen} className="btn-ghost shrink-0" aria-label="Editar check-in">
          <Icon name="edit" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
