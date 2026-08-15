import type { MetadataRoute } from 'next'
import { AZIENDA } from '@/dati/azienda'

/**
 * Manifesto dell'applicazione web.
 *
 * È ciò che rende il sito installabile sulla schermata iniziale del telefono.
 * Le scorciatoie compaiono tenendo premuta l'icona: sono le tre cose che si
 * fanno da mobile — guardare il catalogo, prenotare un noleggio, telefonare.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: AZIENDA.nomeCompleto,
    short_name: AZIENDA.nome,
    description: AZIENDA.descrizione,
    lang: 'it',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0a0705',
    theme_color: '#0a0705',
    categories: ['business', 'shopping', 'travel'],
    icons: [
      { src: '/marchio/icona.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/marchio/icona-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/marchio/icona-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/marchio/icona-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'Catalogo', short_name: 'Catalogo', url: '/catalogo' },
      { name: 'Noleggio', short_name: 'Noleggio', url: '/noleggio' },
      { name: 'Contatti', short_name: 'Contatti', url: '/contatti' },
    ],
  }
}
