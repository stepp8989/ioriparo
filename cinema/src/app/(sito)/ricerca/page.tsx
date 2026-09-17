import type { Metadata } from 'next'
import Link from 'next/link'
import { SchedaFilm } from '@/componenti/film/SchedaFilm'
import { Icona } from '@/componenti/ui/Icona'
import { Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { cercaNellArchivio } from '@/lib/ricerca'
import { datiSito } from '@/lib/sito'

/**
 * Pagina dei risultati di ricerca.
 *
 * Usa la stessa funzione dei suggerimenti nell'intestazione: un solo criterio
 * di corrispondenza, un solo ordinamento, nessuna sorpresa fra quello che il
 * menu a tendina propone e quello che la pagina mostra.
 *
 * Non è indicizzata: una pagina di risultati per ogni possibile parola cercata
 * è esattamente il tipo di contenuto che i motori considerano spazzatura.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}): Promise<Metadata> {
  const parametri = await searchParams
  const termine = (Array.isArray(parametri.q) ? parametri.q[0] : parametri.q) ?? ''

  return metadatiPagina({
    titolo: termine ? `Ricerca: ${termine}` : 'Ricerca',
    descrizione: 'Cerca fra film, interpreti, registi, generi e cinema della rete.',
    percorso: '/ricerca',
    indicizza: false,
  })
}

export default async function PaginaRicerca({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametri = await searchParams
  const termine = ((Array.isArray(parametri.q) ? parametri.q[0] : parametri.q) ?? '').trim()

  const archivio = await datiSito()
  const esito = cercaNellArchivio(archivio, termine, 60)

  const totale = esito.film.length + esito.persone.length + esito.cinema.length

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Ricerca"
        titolo={termine ? `Risultati per «${termine}»` : 'Cerca nel catalogo'}
        sottotitolo={
          termine
            ? `${totale} ${totale === 1 ? 'risultato' : 'risultati'} fra film, persone e cinema.`
            : 'Scrivi il titolo di un film, il nome di un interprete o di una città.'
        }
        allineamento="sinistra"
      />

      {termine && totale === 0 && (
        <Nota className="mt-10 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
          Nessun risultato per «{termine}». Prova con meno parole, oppure sfoglia{' '}
          <Link href="/film" className="text-accento underline">
            tutti i film in programmazione
          </Link>
          .
        </Nota>
      )}

      {esito.film.length > 0 && (
        <section className="mt-12">
          <h2 className="font-titolo text-[1.3rem] font-semibold">
            Film <span className="text-tenue">({esito.film.length})</span>
          </h2>
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {esito.film.map((film) => (
              <SchedaFilm key={film.id} film={film} />
            ))}
          </div>
        </section>
      )}

      {esito.persone.length > 0 && (
        <section className="mt-14">
          <h2 className="font-titolo text-[1.3rem] font-semibold">
            Persone <span className="text-tenue">({esito.persone.length})</span>
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {esito.persone.map((persona) => (
              <li key={`${persona.nome}-${persona.ruolo}`}>
                <Link
                  href={`/ricerca?q=${encodeURIComponent(persona.nome)}`}
                  className="flex items-center gap-3 rounded-morbido border border-bordo bg-superficie p-4 transition-colors hover:border-accento"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-superficie-alt text-tenue">
                    <Icona nome="utente" className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{persona.nome}</span>
                    <span className="block truncate text-[0.82rem] text-tenue">
                      {persona.ruolo} · {persona.film.join(', ')}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {esito.cinema.length > 0 && (
        <section className="mt-14">
          <h2 className="font-titolo text-[1.3rem] font-semibold">
            Cinema <span className="text-tenue">({esito.cinema.length})</span>
          </h2>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {esito.cinema.map((cinema) => (
              <li key={cinema.id}>
                <Link
                  href={`/cinema/${cinema.slug}`}
                  className="flex items-center gap-3 rounded-morbido border border-bordo bg-superficie p-4 transition-colors hover:border-accento"
                >
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-superficie-alt text-accento">
                    <Icona nome="posizione" className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">
                      {archivio.impostazioni.marchio.nome} {cinema.nome}
                    </span>
                    <span className="block truncate text-[0.82rem] text-tenue">
                      {cinema.indirizzo}, {cinema.citta}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </Sezione>
  )
}
