import type { MetadataRoute } from 'next'
import { leggi } from '@/lib/archivio'

/**
 * Manifesto dell'applicazione web.
 *
 * Serve perché il sito possa essere aggiunto alla schermata iniziale del
 * telefono e aperto a tutto schermo: è il modo con cui la maggior parte delle
 * persone userà davvero i biglietti, aprendo l'icona invece di cercare
 * l'email. Il `start_url` punta all'area personale proprio per questo — chi
 * apre l'icona di solito vuole il proprio biglietto, non la home.
 */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { impostazioni } = await leggi()
  const { marchio } = impostazioni

  return {
    name: `${marchio.nome} — ${marchio.claim}`,
    short_name: marchio.nome,
    description: marchio.descrizione,
    start_url: '/area-personale',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#07060c',
    theme_color: '#07060c',
    lang: 'it-IT',
    categories: ['entertainment', 'lifestyle'],
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
    shortcuts: [
      { name: 'I miei biglietti', url: '/area-personale?vista=biglietti' },
      { name: 'Programmazione', url: '/programmazione' },
      { name: 'Trova cinema', url: '/cinema' },
    ],
  }
}
