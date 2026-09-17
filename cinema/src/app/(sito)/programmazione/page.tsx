import type { Metadata } from 'next'
import Link from 'next/link'
import { Orari } from '@/componenti/film/Orari'
import { SelettoreGiorni } from '@/componenti/film/SelettoreGiorni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Locandina } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { cinemaVisibili, datiSito, giorniConSpettacoli, spettacoliUtili } from '@/lib/sito'
import { classi, durata, raggruppa } from '@/lib/utili'

/**
 * Programmazione completa della rete.
 *
 * È la pagina che sostituisce il volantino affisso all'ingresso: un giorno,
 * un cinema, tutti i film con tutti gli orari. La scelta di giorno e cinema
 * passa dall'indirizzo, così ogni combinazione ha un collegamento proprio —
 * quello che si manda a un amico per dire «guarda cosa danno domani a Olbia».
 */
export const revalidate = 120

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Programmazione e orari',
    descrizione:
      'Tutti gli spettacoli in programma nelle sale della rete, giorno per giorno, con formati, sale e prezzi.',
    percorso: '/programmazione',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaProgrammazione({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [parametri, archivio] = await Promise.all([searchParams, datiSito()])

  const leggi = (chiave: string) => {
    const valore = parametri[chiave]
    return (Array.isArray(valore) ? valore[0] : valore) ?? ''
  }

  const cinemaScelto = leggi('cinema')
  const tutti = spettacoliUtili(archivio)
  const giorni = giorniConSpettacoli(tutti, 10)
  const giornoScelto = giorni.includes(leggi('data')) ? leggi('data') : (giorni[0] ?? '')

  const delGiorno = tutti.filter(
    (voce) =>
      voce.spettacolo.data === giornoScelto &&
      (!cinemaScelto || voce.cinema.id === cinemaScelto),
  )

  const perFilm = raggruppa(delGiorno, (voce) => voce.film.id)
  const strutture = cinemaVisibili(archivio)

  const indirizzo = (chiave: 'data' | 'cinema', valore: string) => {
    const prossimi = new URLSearchParams()
    const data = chiave === 'data' ? valore : giornoScelto
    const cinema = chiave === 'cinema' ? valore : cinemaScelto
    if (data) prossimi.set('data', data)
    if (cinema) prossimi.set('cinema', cinema)
    const stringa = prossimi.toString()
    return `/programmazione${stringa ? `?${stringa}` : ''}`
  }

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Programmazione"
        titolo="Cosa c’è in sala"
        sottotitolo="Scegli il giorno e il cinema: qui sotto ci sono tutti gli spettacoli acquistabili."
        allineamento="sinistra"
      />

      <div className="mt-9 flex flex-wrap gap-2">
        <Link
          href={indirizzo('cinema', '')}
          className={classi(
            'rounded-full border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
            cinemaScelto
              ? 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento'
              : 'border-accento bg-accento text-white',
          )}
        >
          Tutta la rete
        </Link>
        {strutture.map((struttura) => (
          <Link
            key={struttura.id}
            href={indirizzo('cinema', struttura.id)}
            className={classi(
              'rounded-full border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
              cinemaScelto === struttura.id
                ? 'border-accento bg-accento text-white'
                : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
            )}
          >
            {struttura.nome}
          </Link>
        ))}
      </div>

      <SelettoreGiorni
        giorni={giorni}
        attivo={giornoScelto}
        costruisciHref={(giorno) => indirizzo('data', giorno)}
        className="mt-6"
      />

      {perFilm.size === 0 ? (
        <Nota className="mt-10 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
          Nessuno spettacolo per questa combinazione. Prova un altro giorno, oppure guarda la
          programmazione di tutta la rete.
        </Nota>
      ) : (
        <div className="mt-10 space-y-6">
          {[...perFilm.entries()].map(([filmId, voci]) => {
            const film = voci[0].film

            // Gli orari dello stesso film in cinema diversi restano separati:
            // «20:00 a Cagliari» e «20:00 a Nuoro» sono due cose diverse e
            // mescolarle in un'unica fila è il modo più rapido per far
            // comprare il biglietto sbagliato.
            const perCinema = raggruppa(voci, (voce) => voce.cinema.id)

            return (
              <article
                key={filmId}
                className="grid gap-6 rounded-ampio border border-bordo bg-superficie p-5 sm:grid-cols-[7rem_1fr] sm:p-6"
              >
                <Link href={`/film/${film.slug}`} className="block">
                  <div className="locandina overflow-hidden rounded-tenue">
                    <Locandina
                      titolo={film.titolo}
                      chiave={film.id}
                      palette={film.palette}
                      immagine={film.locandina}
                      mostraTitolo={false}
                    />
                  </div>
                </Link>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-titolo text-[1.2rem] font-semibold">
                        <Link href={`/film/${film.slug}`} className="transition-colors hover:text-accento">
                          {film.titolo}
                        </Link>
                      </h2>
                      <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-tenue">
                        <span>{film.generi.join(' · ')}</span>
                        <span className="inline-flex items-center gap-1">
                          <Icona nome="orologio" className="size-3" />
                          {durata(film.durataMinuti)}
                        </span>
                        <Etichetta tono="neutro" className="px-2 py-0.5 text-[0.6rem]">
                          {film.classificazione}
                        </Etichetta>
                      </p>
                    </div>

                    <Bottone href={`/film/${film.slug}`} variante="tenue" misura="piccola">
                      Scheda
                    </Bottone>
                  </div>

                  <div className="mt-5 space-y-5">
                    {[...perCinema.entries()].map(([cinemaId, spettacoliCinema]) => (
                      <div key={cinemaId}>
                        {!cinemaScelto && (
                          <p className="mb-2.5 text-[0.76rem] font-semibold uppercase tracking-[0.14em] text-tenue">
                            {spettacoliCinema[0].cinema.nome}
                          </p>
                        )}
                        <Orari
                          spettacoli={spettacoliCinema.map((voce) => voce.spettacolo)}
                          sale={archivio.sale}
                          impostazioni={archivio.impostazioni}
                          durataFilm={film.durataMinuti}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </Sezione>
  )
}
