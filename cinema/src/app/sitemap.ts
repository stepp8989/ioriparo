import type { MetadataRoute } from 'next'
import { leggi } from '@/lib/archivio'
import { BASE } from '@/lib/seo'

/**
 * Mappa del sito.
 *
 * Comprende le pagine fisse, una scheda per ogni film visibile e una per ogni
 * cinema. Le priorità non sono decorative: i film in sala cambiano ogni
 * settimana e vanno ripresi spesso, le schede dei cinema cambiano una volta
 * l'anno.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const archivio = await leggi()
  const adesso = new Date()

  // `as const` sul letterale: senza, TypeScript allarga `changeFrequency` a
  // `string` e la mappa non combacia più con il tipo della mappa del sito.
  const pagine = [
    { url: '/', priority: 1, changeFrequency: 'daily' },
    { url: '/film', priority: 0.9, changeFrequency: 'daily' },
    { url: '/programmazione', priority: 0.9, changeFrequency: 'daily' },
    { url: '/cinema', priority: 0.8, changeFrequency: 'monthly' },
    { url: '/trailer', priority: 0.6, changeFrequency: 'weekly' },
    { url: '/promozioni', priority: 0.7, changeFrequency: 'weekly' },
    { url: '/abbonamenti', priority: 0.7, changeFrequency: 'monthly' },
    { url: '/food', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/gift-card', priority: 0.5, changeFrequency: 'monthly' },
    { url: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { url: '/termini', priority: 0.2, changeFrequency: 'yearly' },
    { url: '/cookie-policy', priority: 0.2, changeFrequency: 'yearly' },
    { url: '/accessibilita', priority: 0.3, changeFrequency: 'yearly' },
  ] as const

  const fisse: MetadataRoute.Sitemap = pagine.map((voce) => ({
    ...voce,
    url: new URL(voce.url, BASE).toString(),
    lastModified: adesso,
  }))

  const film: MetadataRoute.Sitemap = archivio.film
    .filter((voce) => voce.visibile && voce.stato !== 'archivio')
    .map((voce) => ({
      url: new URL(`/film/${voce.slug}`, BASE).toString(),
      lastModified: adesso,
      changeFrequency: 'daily',
      priority: voce.stato === 'in-sala' ? 0.8 : 0.6,
    }))

  const cinema: MetadataRoute.Sitemap = archivio.cinema
    .filter((voce) => voce.visibile)
    .map((voce) => ({
      url: new URL(`/cinema/${voce.slug}`, BASE).toString(),
      lastModified: adesso,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...fisse, ...film, ...cinema]
}
