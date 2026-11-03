import { leggi } from '@/lib/archivio'
import { chiamante, testoPulito, troppeRichieste } from '@/lib/protezione'
import { cercaNellArchivio } from '@/lib/ricerca'

/**
 * Suggerimenti per la ricerca globale.
 *
 *   GET /api/ricerca?q=nevischio
 *
 * Restituisce un elenco piatto già ordinato per rilevanza: film, persone,
 * generi e cinema mescolati, ognuno con il proprio indirizzo di destinazione.
 * È l'intestazione a consumarlo, e le serve una lista sola da scorrere con le
 * frecce — non quattro liste da ricomporre nel browser.
 */

export const dynamic = 'force-dynamic'

export async function GET(richiesta: Request) {
  // La ricerca costa poco ma è pubblica e senza autenticazione: un tetto
  // generoso tiene lontano chi volesse usarla per esplorare l'archivio a
  // colpi di richieste automatiche, senza dare fastidio a chi digita in fretta.
  if (troppeRichieste(`ricerca:${chiamante(richiesta)}`, 120, 1)) {
    return Response.json({ errore: 'Troppe richieste.' }, { status: 429 })
  }

  const termine = testoPulito(new URL(richiesta.url).searchParams.get('q'), 80)
  if (termine.length < 2) return Response.json({ risultati: [] })

  const archivio = await leggi()
  const esito = cercaNellArchivio(archivio, termine, 6)

  const risultati = [
    ...esito.film.map((film) => ({
      tipo: 'film' as const,
      titolo: film.titolo,
      sottotitolo: [film.anno, film.generi[0], film.regista].filter(Boolean).join(' · '),
      href: `/film/${film.slug}`,
    })),
    ...esito.persone.map((persona) => ({
      tipo: 'persona' as const,
      titolo: persona.nome,
      sottotitolo: `${persona.ruolo} · ${persona.film.slice(0, 2).join(', ')}`,
      href: `/ricerca?q=${encodeURIComponent(persona.nome)}`,
    })),
    ...esito.cinema.map((cinema) => ({
      tipo: 'cinema' as const,
      titolo: `${archivio.impostazioni.marchio.nome} ${cinema.nome}`,
      sottotitolo: `${cinema.indirizzo}, ${cinema.citta}`,
      href: `/cinema/${cinema.slug}`,
    })),
    ...esito.generi.map((genere) => ({
      tipo: 'genere' as const,
      titolo: genere,
      sottotitolo: 'Tutti i film del genere',
      href: `/film?genere=${encodeURIComponent(genere)}`,
    })),
  ].slice(0, 10)

  return Response.json(
    { risultati },
    {
      // I suggerimenti possono essere tenuti in cache per pochi secondi: il
      // catalogo non cambia fra un tasto e l'altro, e chi cancella una lettera
      // e la riscrive non deve rifare il giro fino all'archivio.
      headers: { 'Cache-Control': 'private, max-age=15' },
    },
  )
}
