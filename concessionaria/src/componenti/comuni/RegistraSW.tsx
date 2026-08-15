'use client'

import { useEffect } from 'react'

/**
 * Registrazione del registratore di servizio.
 *
 * È ciò che rende il sito installabile e navigabile anche con una connessione
 * intermittente — situazione comune fuori dai centri abitati. La registrazione
 * avviene dopo il caricamento completo della pagina, così non toglie banda al
 * primo disegno, e solo in produzione: in sviluppo un service worker che serve
 * pagine dalla cache confonde e basta.
 */
export function RegistraSW() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    const registra = () => {
      navigator.serviceWorker.register('/sw.js').catch((errore) => {
        console.warn('[pwa] Registrazione non riuscita:', errore)
      })
    }

    if (document.readyState === 'complete') {
      registra()
      return
    }

    window.addEventListener('load', registra)
    return () => window.removeEventListener('load', registra)
  }, [])

  return null
}
