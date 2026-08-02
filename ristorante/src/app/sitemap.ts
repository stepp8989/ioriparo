import type { MetadataRoute } from 'next'
import { BASE } from '@/lib/seo'

/**
 * Mappa del sito, generata a ogni compilazione.
 *
 * Le pagine sono elencate qui con la priorità che riflette il loro peso
 * commerciale: prenotazione e menù valgono più delle informative, che restano
 * fuori dall'indice.
 */
const PAGINE: Array<{ percorso: string; priorita: number; frequenza: 'daily' | 'weekly' | 'monthly' }> = [
  { percorso: '/', priorita: 1, frequenza: 'weekly' },
  { percorso: '/menu', priorita: 0.9, frequenza: 'weekly' },
  { percorso: '/prenota', priorita: 0.9, frequenza: 'monthly' },
  { percorso: '/chi-siamo', priorita: 0.7, frequenza: 'monthly' },
  { percorso: '/galleria', priorita: 0.6, frequenza: 'monthly' },
  { percorso: '/contatti', priorita: 0.8, frequenza: 'monthly' },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const aggiornamento = new Date()

  return PAGINE.map((pagina) => ({
    url: new URL(pagina.percorso, BASE).toString(),
    lastModified: aggiornamento,
    changeFrequency: pagina.frequenza,
    priority: pagina.priorita,
  }))
}
