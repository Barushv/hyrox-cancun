import React from 'react'
import ReactDOM from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
// Se importa al inicio para no perder el aviso de instalación de Chrome
import './hooks/useInstalar'
import './index.css'

// autoUpdate: la nueva versión se aplica sola al abrir la app
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
