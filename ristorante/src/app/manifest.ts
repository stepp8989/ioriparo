import type { MetadataRoute } from 'next'
import { RISTORANTE } from '@/dati/ristorante'

/** Manifesto dell'applicazione web: nome, icone e colori di avvio. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: RISTORANTE.nomeCompleto,
    short_name: RISTORANTE.nome,
    description: RISTORANTE.descrizione,
    lang: 'it',
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f3ec',
    theme_color: '#14110e',
    icons: [
      { src: '/marchio/icona.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  }
}
