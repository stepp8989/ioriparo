import type { MetadataRoute } from 'next'
import { DOMINIO } from '@/dati/agenzia'

/**
 * Istruzioni per i motori di ricerca.
 *
 * Tutto aperto tranne le rotte di servizio, che non hanno pagine da indicizzare
 * e che un robot interrogherebbe solo per sbaglio.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: '/api/' }],
    sitemap: `${DOMINIO}/sitemap.xml`,
    host: DOMINIO,
  }
}
