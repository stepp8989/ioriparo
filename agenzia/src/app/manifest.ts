import type { MetadataRoute } from 'next'
import { AGENZIA } from '@/dati/agenzia'

/** Scheda dell'applicazione, per chi aggiunge il sito alla schermata iniziale. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: AGENZIA.nomeCompleto,
    short_name: AGENZIA.nome,
    description: AGENZIA.descrizione,
    lang: 'it-IT',
    start_url: '/',
    display: 'standalone',
    background_color: '#04060d',
    theme_color: '#04060d',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
