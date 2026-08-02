import type { NextConfig } from 'next'

/**
 * Intestazioni di sicurezza applicate a tutte le pagine.
 * Il sito non carica risorse da domini terzi salvo la mappa, che viene
 * inserita solo dopo il consenso esplicito nel banner cookie.
 */
const intestazioniSicurezza = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Le fotografie sono servite dalla cartella public/: nessun dominio esterno.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920],
  },
  async headers() {
    return [{ source: '/:path*', headers: intestazioniSicurezza }]
  },
}

export default config
