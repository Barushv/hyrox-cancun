import { useState } from 'react'
import Icon from './Icon'
import { useInstalar } from '../hooks/useInstalar'

// Botón propio para instalar la PWA.
// compacto: tarjeta en Hoy que solo aparece cuando Chrome permite instalar.
// completo: sección de Ajustes con instrucciones manuales si el botón no está disponible.
export default function InstalarApp({ compacto = false }) {
  const { instalada, puedeInstalar, esIOS, instalar } = useInstalar()
  const [estado, setEstado] = useState(null)

  if (instalada) {
    return compacto ? null : <p className="p-3 text-sm text-ok">Estás usando la app instalada.</p>
  }

  const boton = puedeInstalar && (
    <button
      className="btn-primary"
      onClick={async () => {
        const r = await instalar()
        setEstado(r === 'accepted' ? 'Instalando… búscala como "Hyrox CUN" en tu pantalla de inicio o en el cajón de apps.' : null)
      }}
    >
      <Icon name="check" className="w-5 h-5" strokeWidth={3} />
      Instalar app
    </button>
  )

  if (compacto) {
    if (!puedeInstalar && !estado) return null
    return (
      <div className="card flex flex-col gap-2 p-3">
        <p className="text-sm">
          <b>Instala la app</b> para usarla a pantalla completa y sin internet.
        </p>
        {boton}
        {estado && <p className="text-sm text-muted">{estado}</p>}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-3 text-sm">
      {boton || (
        <>
          <p className="text-muted">Tu navegador no ofrece el botón de instalación en este momento. Hazlo a mano:</p>
          {esIOS ? (
            <p>
              En <b>Safari</b>: botón <b>Compartir</b> → <b>Agregar a pantalla de inicio</b>.
            </p>
          ) : (
            <ol className="flex list-decimal flex-col gap-1 pl-4">
              <li>
                En Chrome: <b>⋮ → Instalar app</b>.
              </li>
              <li>
                Si Chrome dice que ya está instalada y no abre, prueba con <b>Samsung Internet</b>, <b>Edge</b> o <b>Firefox</b>: menú → <b>Agregar a pantalla de inicio</b> o <b>Instalar</b>.
              </li>
            </ol>
          )}
        </>
      )}
      {estado && <p className="text-muted">{estado}</p>}
    </div>
  )
}
