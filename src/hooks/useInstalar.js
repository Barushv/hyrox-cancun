import { useEffect, useState } from 'react'

// Chrome avisa con "beforeinstallprompt" cuando la app se puede instalar.
// Se guarda el evento para lanzarlo desde un botón propio, sin depender del menú del navegador.
let aviso = null
const subs = new Set()
const notificar = () => subs.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    aviso = e
    notificar()
  })
  window.addEventListener('appinstalled', () => {
    aviso = null
    notificar()
  })
}

const enModoApp = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true

export function useInstalar() {
  const [, setN] = useState(0)
  useEffect(() => {
    const f = () => setN((n) => n + 1)
    subs.add(f)
    return () => subs.delete(f)
  }, [])

  const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  return {
    instalada: enModoApp(),
    puedeInstalar: Boolean(aviso) && !enModoApp(),
    esIOS,
    instalar: async () => {
      if (!aviso) return 'no-disponible'
      aviso.prompt()
      const { outcome } = await aviso.userChoice
      aviso = null
      notificar()
      return outcome
    },
  }
}
