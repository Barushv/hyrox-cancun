// Iconos de línea propios (24x24, trazo 2). Se agregan aquí y se usan por nombre.
const PATHS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </>
  ),
  food: <path d="M7 3v8a2 2 0 0 0 2 2v8M11 3v8M3 3v8a2 2 0 0 0 2 2M17 21V3c2 0 4 2 4 6s-2 5-4 5" />,
  chart: <path d="M3 21h18M7 17v-6M12 17V6M17 17v-4" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
    </>
  ),
  dumbbell: <path d="M6 7v10M3 9v6M18 7v10M21 9v6M6 12h12" />,
  run: (
    <>
      <circle cx="15" cy="4" r="2" />
      <path d="M8 21l3-6 3 2v5M6 12l3-3 4 1 3 3h3M11 15l-2-3" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5M17 11a3 3 0 1 0 0-6M21 20c0-2-1.5-4-4-4.6" />
    </>
  ),
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />,
  alarm: (
    <>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M5 3L2 6M22 6l-3-3" />
    </>
  ),
  drop: <path d="M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0z" />,
  pill: (
    <>
      <path d="M10.5 20.5a5 5 0 0 1-7-7l10-10a5 5 0 0 1 7 7z" />
      <path d="M8.5 8.5l7 7" />
    </>
  ),
  check: <path d="M5 12l5 5 9-10" />,
  chevronLeft: <path d="M15 5l-7 7 7 7" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  chevronDown: <path d="M5 9l7 7 7-7" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  flag: <path d="M4 22V4M4 4h13l-2 4 2 4H4" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  heart: <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />,
  edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />,
  x: <path d="M18 6L6 18M6 6l12 12" />,
}

export default function Icon({ name, className = 'w-5 h-5', strokeWidth = 2 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name]}
    </svg>
  )
}

// Icono según el tipo de sesión o de item de la línea de tiempo
export function iconoSesion(s) {
  if (s.tipo === 'running') return 'run'
  if (s.tipo === 'clase') return 'users'
  if (s.tipo === 'descanso') return 'heart'
  return 'dumbbell'
}

export function iconoItem(it) {
  switch (it.tipo) {
    case 'despertar':
      return 'alarm'
    case 'comida':
      return 'food'
    case 'suplemento':
      return 'pill'
    case 'hidratacion':
      return 'drop'
    case 'cama':
      return 'moon'
    case 'entreno':
      if (/rodaje|intervalos|long run/i.test(it.titulo)) return 'run'
      if (/clase/i.test(it.titulo)) return 'users'
      return 'dumbbell'
    default:
      return 'clock'
  }
}
