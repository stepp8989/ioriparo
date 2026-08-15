import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

/**
 * Radice del progetto.
 *
 * Va dichiarata perché questo sito vive dentro un repository che contiene già
 * un altro `package-lock.json`: senza, Next risalirebbe alla cartella superiore
 * e tratterebbe come propri file che non gli appartengono.
 */
const RADICE = dirname(fileURLToPath(import.meta.url))

/**
 * Intestazioni di sicurezza applicate a tutte le pagine.
 *
 * Il sito non carica nulla da domini terzi al primo caricamento: fotografie,
 * caratteri e script stanno tutti sul dominio. Mappa, statistiche e chat
 * arrivano solo dopo il consenso esplicito nel banner cookie, ed è per questo
 * che qui non compare una `Content-Security-Policy` rigida: la si può
 * aggiungere in produzione una volta scelti i servizi effettivamente attivi.
 */
const intestazioniSicurezza = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
]

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: RADICE },
  outputFileTracingRoot: RADICE,

  /**
   * Il deposito su file apre un percorso che dipende da una variabile
   * d'ambiente, e l'analisi statica non potendo prevederlo includerebbe
   * l'intero progetto nel pacchetto del server — fotografie comprese, che qui
   * sono parecchi megabyte e vengono già servite come contenuto statico.
   * Escluderle esplicitamente tiene il pacchetto alla sua dimensione reale.
   */
  outputFileTracingExcludes: {
    '*': ['public/immagini/**', 'public/marchio/**', 'node_modules/sharp/**'],
  },
  images: {
    // Le fotografie sono servite dalla cartella public/: nessun dominio esterno.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [
      { source: '/:path*', headers: intestazioniSicurezza },
      {
        // Il registratore di servizio deve poter governare tutto il sito.
        source: '/sw.js',
        headers: [
          { key: 'Service-Worker-Allowed', value: '/' },
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ]
  },
}

export default config
