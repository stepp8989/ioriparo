import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

/**
 * Radice del progetto.
 *
 * Va dichiarata perché questa piattaforma vive dentro un repository che
 * contiene già altri `package-lock.json`: senza, Next risalirebbe alla cartella
 * superiore e tratterebbe come propri file che non gli appartengono.
 */
const RADICE = dirname(fileURLToPath(import.meta.url))

/**
 * Intestazioni di sicurezza applicate a tutte le pagine.
 *
 * `payment=(self)` serve al pagamento con portafogli del browser (Apple Pay,
 * Google Pay) quando verrà collegato Stripe; `camera=(self)` serve al lettore
 * QR del pannello, che legge i biglietti all'ingresso della sala usando la
 * fotocamera del dispositivo dello staff.
 *
 * La `Content-Security-Policy` è volutamente permissiva su `frame-src` perché
 * i trailer arrivano da YouTube e Vimeo; il resto è chiuso al dominio. Vanno
 * aggiunti qui gli host dei servizi che si attivano in produzione (Stripe,
 * archivio immagini S3, statistiche).
 */
const intestazioniSicurezza = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'microphone=(), geolocation=(self), camera=(self), payment=(self)',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains',
  },
]

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: RADICE },
  outputFileTracingRoot: RADICE,

  /**
   * Il deposito su file apre un percorso che dipende da una variabile
   * d'ambiente, e l'analisi statica non potendo prevederlo includerebbe
   * l'intero progetto nel pacchetto del server. Escludere i contenuti statici
   * tiene il pacchetto alla sua dimensione reale.
   */
  outputFileTracingExcludes: {
    '*': ['public/marchio/**', 'public/immagini/**'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
    /**
     * Le locandine dimostrative sono disegnate dal sito (SVG procedurale), ma
     * l'amministratore può indicare l'indirizzo di un'immagine caricata su un
     * archivio compatibile S3. L'host va aggiunto qui prima della messa in
     * produzione: `remotePatterns` è deliberatamente vuoto per non lasciare
     * aperta la porta a qualunque dominio.
     */
    remotePatterns: [],
  },

  async headers() {
    return [{ source: '/:path*', headers: intestazioniSicurezza }]
  },
}

export default config
