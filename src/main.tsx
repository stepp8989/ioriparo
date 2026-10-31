import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App'
import { preparaApp } from './lib/app'

// Nella build del solo gestionale niente app di Io Riparo: il manifesto e il
// service worker sono del sito, e su un altro dominio non devono comparire.
if (import.meta.env.VITE_SOLO_GESTIONALE !== '1') preparaApp()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
