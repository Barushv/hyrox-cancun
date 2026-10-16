import { useState } from 'react'
import Icon, { iconoSesion } from '../../components/Icon'
import SesionDetalle, { CargaChip, resumenSesion, tieneDetalle } from '../../components/SesionDetalle'
import { tipoRegistro } from '../../engine/registro'

// Sesión del día con su plantilla. Toca para ver ejercicios o estructura; "Registrar" abre el formulario.
export default function SesionCard({ s, omitidaPorSemaforo, semanaRoja, estado, esFuturo, onRegistrar }) {
  const [open, setOpen] = useState(false)
  const omitida = s.omitir || omitidaPorSemaforo
  const resumen = resumenSesion(s)
  const detalle = tieneDetalle(s)
  const registrable = tipoRegistro(s) && !esFuturo

  return (
    <div className={`card ${omitida && estado !== 'registrada' ? 'opacity-60' : ''}`}>
      <button className="flex w-full items-start gap-3 p-3 text-left" onClick={() => detalle && setOpen((o) => !o)} aria-expanded={detalle ? open : undefined}>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${estado === 'registrada' ? 'bg-ok text-white' : 'bg-accent-soft text-accent'}`}
        >
          <Icon name={estado === 'registrada' ? 'check' : iconoSesion(s)} strokeWidth={estado === 'registrada' ? 3 : 2} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-1.5">
            <b className={`leading-tight ${omitida ? 'line-through' : ''}`}>{s.titulo}</b>
            <CargaChip carga={s.carga} />
            {s.opcional && !omitida && <span className="chip bg-line text-muted">opcional</span>}
          </span>
          <span className="mt-0.5 block text-xs text-muted">
            <Icon name="clock" className="mr-1 inline w-3.5 h-3.5 -mt-0.5" />
            {s.momento}
          </span>
          {omitida ? (
            <span className="mt-1 block text-sm font-semibold text-bad">{s.omitir ? 'No va esta semana.' : 'Se omite por el semáforo.'}</span>
          ) : (
            resumen && <span className="mt-1 block text-sm">{resumen}</span>
          )}
          {semanaRoja && !omitida && <span className="mt-1 block text-sm font-semibold text-bad">Semáforo rojo: cámbiala por descanso o movilidad.</span>}
        </span>
        {detalle && <Icon name="chevronDown" className={`mt-2 w-5 h-5 shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />}
      </button>

      {open && (
        <div className="border-t border-line px-3 pb-3 pt-2.5">
          <SesionDetalle s={s} />
        </div>
      )}

      {registrable && (
        <button
          onClick={onRegistrar}
          className={`flex w-full items-center justify-center gap-1.5 border-t border-line py-2.5 text-sm font-semibold ${
            estado === 'registrada' ? 'text-ok' : estado === 'cancelada' ? 'text-muted' : 'text-accent'
          }`}
        >
          <Icon name={estado === 'registrada' ? 'check' : 'edit'} className="w-4 h-4" />
          {estado === 'registrada' ? 'Registrada · ver o editar' : estado === 'cancelada' ? 'Cancelada · editar' : 'Registrar sesión'}
        </button>
      )}
    </div>
  )
}
