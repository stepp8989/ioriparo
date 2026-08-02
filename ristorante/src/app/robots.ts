import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/seo'

/**
 * Regole per i motori di ricerca.
 *
 * Il pannello e le rotte API restano fuori dall'indice: non contengono
 * informazioni utili a chi cerca un ristorante e non devono comparire fra i
 * risultati.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/'],
      },
    ],
    sitemap: new URL('/sitemap.xml', BASE).toString(),
    host: BASE.origin,
  }
}
