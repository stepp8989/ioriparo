import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { NextConfig } from 'next'

/**
 * Radice del progetto.
 *
 * Va dichiarata perché questo sito vive dentro un repository che contiene già
 * altri `package-lock.json`: senza, Next risalirebbe alla cartella superiore e
 * tratterebbe come propri file che non gli appartengono.
 */
const RADICE = dirname(fileURLToPath(import.meta.url))

/**
 * Intestazioni di sicurezza applicate a tutte le pagine.
 *
 * Il sito non carica nulla da domini terzi: non ci sono fotografie remote, i
 * caratteri arrivano dal dominio grazie a `next/font` e le illustrazioni sono
 * disegnate in SVG dentro le pagine. La `Content-Security-Policy` può quindi
 * restare severa; l'unico allentamento è `'unsafe-inline'` sugli stili, che
 * servono alle animazioni scritte come variabili CSS inline sugli elementi.
 */
/**
 * In sviluppo React ricostruisce le tracce degli errori con `eval`: senza
 * `'unsafe-eval'` la console si riempie di avvisi che non c'entrano nulla con
 * il codice. In produzione `eval` non serve a nessuno e resta vietato.
 */
const inSviluppo = process.env.NODE_ENV !== 'production'

const CSP = [
  "default-src 'self'",
  // `'unsafe-inline'` sugli script copre i dati strutturati inseriti nella
  // pagina; nessuno script di terze parti viene caricato.
  `script-src 'self' 'unsafe-inline'${inSviluppo ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

const intestazioniSicurezza = [
  { key: 'Content-Security-Policy', value: CSP },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
]

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: { root: RADICE },
  outputFileTracingRoot: RADICE,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [{ source: '/:path*', headers: intestazioniSicurezza }]
  },
}

export default config
