import { useEffect, useRef, useState } from 'react'
import NavBar from './components/NavBar'
import HoyScreen from './screens/hoy/HoyScreen'
import AjustesScreen from './screens/AjustesScreen'
import ProgresoScreen from './screens/progreso/ProgresoScreen'
import PlanScreen from './screens/plan/PlanScreen'
import NutricionScreen from './screens/nutricion/NutricionScreen'
import SesionScreen from './screens/sesion/SesionScreen'
import { todayISO } from './engine/dates'

export default function App() {
  const [tab, setTab] = useState('hoy')
  const [fecha, setFecha] = useState(todayISO)
  const ultimoHoy = useRef(todayISO())
  const [sesionAbierta, setSesionAbierta] = useState(null) // { fecha, idx }
  const scrollPrevio = useRef(0)
  const [semanaPlan, setSemanaPlan] = useState(null) // semana elegida en Plan; null = la actual

  // Si la app queda abierta de un día para otro, al volver salta al nuevo "hoy"
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return
      const hoy = todayISO()
      if (hoy !== ultimoHoy.current) {
        setFecha((f) => (f === ultimoHoy.current ? hoy : f))
        ultimoHoy.current = hoy
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [])

  const cambiarTab = (t) => {
    setTab(t)
    window.scrollTo({ top: 0 })
  }

  const abrirSesion = (f, idx) => {
    scrollPrevio.current = window.scrollY
    setSesionAbierta({ fecha: f, idx })
  }
  const cerrarSesion = () => {
    setSesionAbierta(null)
    requestAnimationFrame(() => window.scrollTo({ top: scrollPrevio.current }))
  }

  if (sesionAbierta) {
    return <SesionScreen key={`${sesionAbierta.fecha}-${sesionAbierta.idx}`} fecha={sesionAbierta.fecha} idx={sesionAbierta.idx} onClose={cerrarSesion} />
  }

  return (
    <>
      <main className="mx-auto max-w-lg">
        {tab === 'hoy' && <HoyScreen fecha={fecha} setFecha={setFecha} onOpenSesion={abrirSesion} />}
        {tab === 'plan' && <PlanScreen onOpenSesion={abrirSesion} semanaSel={semanaPlan} setSemanaSel={setSemanaPlan} />}
        {tab === 'nutricion' && <NutricionScreen fecha={fecha} setFecha={setFecha} />}
        {tab === 'ajustes' && <AjustesScreen />}
        {tab === 'progreso' && <ProgresoScreen />}
      </main>
      <NavBar active={tab} onChange={cambiarTab} />
    </>
  )
}
