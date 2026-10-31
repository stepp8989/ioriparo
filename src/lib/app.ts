import { useEffect, useState } from 'react'

/**
 * Il sito come app installabile.
 *
 * Niente App Store: Chrome, Edge e Samsung Internet propongono l'installazione
 * da soli quando trovano manifesto e service worker; Safari su iPhone la
 * permette dal menu Condividi → «Aggiungi alla schermata Home». Il cliente si
 * ritrova l'icona di Io Riparo accanto alle altre app, con tessera e stato
 * della riparazione a un tocco.
 */

/** L'evento non è ancora nei tipi standard del DOM. */
interface EventoInstallazione extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let richiesta: EventoInstallazione | null = null
const ascoltatori = new Set<() => void>()
const avvisa = () => ascoltatori.forEach((f) => f())

/**
 * Da chiamare il prima possibile: il browser offre l'installazione una volta
 * sola, spesso prima che la pagina che la propone sia montata.
 */
export function preparaApp() {
  if (typeof window === 'undefined') return

  window.addEventListener('beforeinstallprompt', (e) => {
    // Niente fumetto automatico del browser: l'invito lo mostriamo noi, nel
    // momento giusto (dopo una pratica, sulla tessera).
    e.preventDefault()
    richiesta = e as EventoInstallazione
    avvisa()
  })
  window.addEventListener('appinstalled', () => {
    richiesta = null
    avvisa()
  })

  // Il service worker solo nella build pubblicata e su una connessione
  // sicura: in sviluppo terrebbe in cache file vecchi, e nell'anteprima in un
  // file unico non ha nulla da servire.
  const sicuro = location.protocol === 'https:' || location.hostname === 'localhost'
  if (import.meta.env.PROD && sicuro && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        /* senza service worker il sito funziona lo stesso, solo non offline */
      })
    })
  }
}

/** Vero se la pagina è aperta dall'icona installata. */
export function inApp(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** iPhone e iPad: lì l'installazione si fa a mano, dal menu Condividi. */
function suIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  // iPadOS si presenta come Mac: lo tradisce lo schermo tattile.
  return /iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}

export type ModoInstallazione = 'pulsante' | 'ios' | 'installata' | 'nessuno'

/** Come si può installare l'app su questo dispositivo, se si può. */
export function useInstallazione() {
  const [, aggiorna] = useState(0)

  useEffect(() => {
    const f = () => aggiorna((n) => n + 1)
    ascoltatori.add(f)
    return () => {
      ascoltatori.delete(f)
    }
  }, [])

  const modo: ModoInstallazione = inApp()
    ? 'installata'
    : richiesta
      ? 'pulsante'
      : suIos()
        ? 'ios'
        : 'nessuno'

  /** Apre la finestra del browser. Vero se il cliente ha accettato. */
  const installa = async (): Promise<boolean> => {
    const evento = richiesta
    if (!evento) return false
    await evento.prompt()
    const { outcome } = await evento.userChoice
    // L'evento vale una volta sola, comunque sia andata.
    richiesta = null
    avvisa()
    return outcome === 'accepted'
  }

  return { modo, installa }
}
