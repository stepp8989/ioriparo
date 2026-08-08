import type { MetadataRoute } from 'next'
import { DOMINIO } from '@/dati/agenzia'

/**
 * Mappa del sito.
 *
 * Il sito è una pagina sola più l'informativa: la mappa è breve per natura. Le
 * ancore interne non vanno elencate — per Google sono la stessa pagina, e
 * ripeterle non aiuta.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const oggi = new Date()

  return [
    { url: `${DOMINIO}/`, lastModified: oggi, changeFrequency: 'monthly', priority: 1 },
    { url: `${DOMINIO}/privacy`, lastModified: oggi, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
