import { useEffect } from 'react'
import Icon from './Icon'

// Hoja inferior para formularios cortos (check-in, horarios)
export default function Sheet({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button className="absolute inset-0 bg-ink/40" aria-label="Cerrar" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-surface safe-bottom">
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-4 pt-4 pb-2">
          <h2 className="font-display text-2xl font-bold uppercase">{title}</h2>
          <button onClick={onClose} className="rounded-full p-2 text-muted active:bg-accent-soft" aria-label="Cerrar">
            <Icon name="x" />
          </button>
        </div>
        <div className="px-4 pb-6">{children}</div>
      </div>
    </div>
  )
}
