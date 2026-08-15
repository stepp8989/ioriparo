import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/seo'

/**
 * Regole per i motori di ricerca.
 *
 * Il pannello, l'area clienti e le rotte API restano fuori dall'indice: non
 * contengono informazioni utili a chi cerca un'auto e non devono comparire fra
 * i risultati. La pagina di esito del pagamento pure: senza il codice del
 * noleggio non dice nulla.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/api/', '/area-clienti', '/noleggio/esito'],
      },
    ],
    sitemap: new URL('/sitemap.xml', BASE).toString(),
    host: BASE.origin,
  }
}
