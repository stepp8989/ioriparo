import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/seo'

/**
 * Regole per i motori di ricerca.
 *
 * Il pannello, le API e il flusso d'acquisto sono esclusi: sono pagine che non
 * hanno senso in un risultato di ricerca e che, indicizzate, porterebbero
 * persone dentro un checkout senza contesto. Le pagine dei biglietti sono
 * escluse per una ragione più seria: contengono un codice valido per entrare
 * in sala.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/', '/acquista', '/biglietto/', '/area-personale'],
      },
    ],
    sitemap: new URL('/sitemap.xml', BASE).toString(),
    host: BASE.origin,
  }
}
