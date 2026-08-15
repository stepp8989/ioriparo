import type { MetadataRoute } from 'next'
import { leggi } from '@/lib/archivio'
import { BASE } from '@/lib/seo'

/**
 * Mappa del sito, generata a ogni compilazione.
 *
 * Le pagine fisse sono elencate con la priorità che riflette il loro peso
 * commerciale; le schede dei veicoli e gli articoli si aggiungono da soli
 * leggendo l'archivio, così una vettura appena inserita finisce nella mappa
 * senza che nessuno debba ricordarsene.
 */
const PAGINE: Array<{
  percorso: string
  priorita: number
  frequenza: 'daily' | 'weekly' | 'monthly'
}> = [
  { percorso: '/', priorita: 1, frequenza: 'daily' },
  { percorso: '/catalogo', priorita: 0.95, frequenza: 'daily' },
  { percorso: '/noleggio', priorita: 0.9, frequenza: 'weekly' },
  { percorso: '/detailing', priorita: 0.85, frequenza: 'weekly' },
  { percorso: '/servizi', priorita: 0.8, frequenza: 'monthly' },
  { percorso: '/finanziamenti', priorita: 0.8, frequenza: 'monthly' },
  { percorso: '/contatti', priorita: 0.75, frequenza: 'monthly' },
  { percorso: '/chi-siamo', priorita: 0.6, frequenza: 'monthly' },
  { percorso: '/blog', priorita: 0.7, frequenza: 'weekly' },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { veicoli, articoli } = await leggi()
  const aggiornamento = new Date()

  const fisse = PAGINE.map((pagina) => ({
    url: new URL(pagina.percorso, BASE).toString(),
    lastModified: aggiornamento,
    changeFrequency: pagina.frequenza,
    priority: pagina.priorita,
  }))

  const schede = veicoli
    .filter((veicolo) => veicolo.visibile && veicolo.stato !== 'venduto')
    .map((veicolo) => ({
      url: new URL(`/catalogo/${veicolo.slug}`, BASE).toString(),
      lastModified: new Date(veicolo.creatoIl),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

  const letture = articoli
    .filter((articolo) => articolo.pubblicato)
    .map((articolo) => ({
      url: new URL(`/blog/${articolo.slug}`, BASE).toString(),
      lastModified: new Date(`${articolo.data}T12:00:00Z`),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }))

  return [...fisse, ...schede, ...letture]
}
