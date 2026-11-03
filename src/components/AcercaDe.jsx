import Icon from './Icon'
import { formatShort } from '../engine/dates'

export const AUTOR = 'Israel Ortiz'
const ANIO = 2026
const REDES = [
  { icon: 'github', label: 'GitHub', url: 'https://github.com/barushv' },
  { icon: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/israel.ortiza/' },
]

export const Copyright = () => (
  <p className="text-center font-mono text-[10px] uppercase tracking-wider text-muted">
    © {ANIO} {AUTOR}
  </p>
)

// Crédito, versión y derechos. Va al final de Ajustes.
export default function AcercaDe() {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="h-section">Acerca de</h2>
      <div className="card flex flex-col items-center gap-3 p-4 text-center">
        <div>
          <div className="font-display text-2xl font-bold uppercase leading-none">Hyrox: Andy & Isra 2027</div>
          <div className="mt-1 font-display text-base font-semibold uppercase text-accent">Prep Cancún</div>
          <div className="mt-1.5 font-mono text-[11px] text-muted tabular">
            Versión {__APP_VERSION__.replace(/\.0$/, '')} · actualizada {formatShort(__BUILD_DATE__)} {__BUILD_DATE__.slice(0, 4)}
          </div>
        </div>
        <div className="text-sm">
          <p>
            Diseñada y desarrollada por <b>{AUTOR}</b>
          </p>
          <p className="text-muted">
            © {ANIO} {AUTOR}. Todos los derechos reservados.
          </p>
        </div>
        <div className="flex gap-2">
          {REDES.map((r) => (
            <a key={r.icon} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-xl border border-line px-3 py-2 text-sm font-semibold active:bg-accent-soft">
              <Icon name={r.icon} className="w-4 h-4" />
              {r.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-muted">App personal no oficial de HYROX.</p>
      </div>
    </section>
  )
}
