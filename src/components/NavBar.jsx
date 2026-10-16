import Icon from './Icon'

export const TABS = [
  { id: 'hoy', label: 'Hoy', icon: 'sun' },
  { id: 'plan', label: 'Plan', icon: 'calendar' },
  { id: 'nutricion', label: 'Nutrición', icon: 'food' },
  { id: 'progreso', label: 'Progreso', icon: 'chart' },
  { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
]

export default function NavBar({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t border-line bg-surface/95 backdrop-blur safe-bottom">
      <div className="mx-auto grid max-w-lg grid-cols-5">
        {TABS.map((t) => {
          const on = active === t.id
          return (
            <button
              key={t.id}
              onClick={() => onChange(t.id)}
              aria-current={on ? 'page' : undefined}
              className={`flex flex-col items-center gap-0.5 pt-2 pb-2.5 text-[11px] font-semibold transition-colors ${
                on ? 'text-accent' : 'text-muted'
              }`}
            >
              <Icon name={t.icon} className="w-6 h-6" strokeWidth={on ? 2.2 : 1.8} />
              {t.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
