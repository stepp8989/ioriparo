import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Orari } from '@/componenti/film/Orari'
import { SelettoreGiorni } from '@/componenti/film/SelettoreGiorni'
import { SchedaFilm } from '@/componenti/film/SchedaFilm'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale, Locandina } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { Stelle } from '@/componenti/ui/Stelle'
import {
  datiStrutturatiFilm,
  datiStrutturatiPercorso,
  datiStrutturatiSpettacoli,
  descrizioneFilm,
  metadatiPagina,
} from '@/lib/seo'
import { datiSito, filmVisibili, giorniConSpettacoli, spettacoliUtili } from '@/lib/sito'
import { supplementoFormato } from '@/lib/prezzi'
import { classi, dataEstesa, durata, paragrafi, prezzo, raggruppa } from '@/lib/utili'

/**
 * Scheda di un singolo film.
 *
 * È la pagina che porta più traffico dai motori di ricerca — chi cerca «orari
 * <titolo> <città>» deve atterrare qui — e per questo è interamente disegnata
 * dal server, con dati strutturati per il film, per le proiezioni e per il
 * percorso di navigazione.
 *
 * La scelta del giorno e del cinema passa dall'indirizzo: ogni combinazione ha
 * il proprio collegamento condivisibile, e la pagina resta utilizzabile anche
 * se JavaScript non parte.
 */
export const revalidate = 120

export async function generateStaticParams() {
  const archivio = await datiSito()
  return filmVisibili(archivio).map((film) => ({ slug: film.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const archivio = await datiSito()
  const film = archivio.film.find((voce) => voce.slug === slug && voce.visibile)

  if (!film) {
    return metadatiPagina({
      titolo: 'Film non trovato',
      descrizione: 'La scheda richiesta non esiste o non è più disponibile.',
      percorso: `/film/${slug}`,
      indicizza: false,
    })
  }

  return metadatiPagina({
    titolo: `${film.titolo} — orari e biglietti`,
    descrizione: descrizioneFilm(film),
    percorso: `/film/${film.slug}`,
    immagine: film.backdrop || undefined,
    nomeSito: archivio.impostazioni.marchio.nome,
  })
}

export default async function PaginaFilm({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ slug }, parametri, archivio] = await Promise.all([params, searchParams, datiSito()])

  const film = archivio.film.find((voce) => voce.slug === slug && voce.visibile)
  if (!film || film.stato === 'archivio') notFound()

  const leggi = (chiave: string) => {
    const valore = parametri[chiave]
    return (Array.isArray(valore) ? valore[0] : valore) ?? ''
  }

  const cinemaScelto = leggi('cinema')
  const risolti = spettacoliUtili(archivio, { filmId: film.id })
  const giorni = giorniConSpettacoli(risolti)
  const giornoScelto = giorni.includes(leggi('data')) ? leggi('data') : (giorni[0] ?? '')

  const delGiorno = risolti.filter(
    (voce) =>
      voce.spettacolo.data === giornoScelto &&
      (!cinemaScelto || voce.cinema.id === cinemaScelto),
  )

  const perCinema = raggruppa(delGiorno, (voce) => voce.cinema.id)

  // Cinema che programmano il film, in qualunque giorno: è l'elenco di «dove
  // vederlo», e deve restare stabile cambiando giorno.
  const strutture = [...raggruppa(risolti, (voce) => voce.cinema.id).entries()].map(
    ([, voci]) => voci[0].cinema,
  )

  const cinemaPerId = new Map(archivio.cinema.map((voce) => [voce.id, voce]))
  const simili = filmVisibili(archivio)
    .filter(
      (voce) =>
        voce.id !== film.id && voce.generi.some((genere) => film.generi.includes(genere)),
    )
    .slice(0, 5)

  const indirizzo = (chiave: string, valore: string) => {
    const prossimi = new URLSearchParams()
    if (chiave === 'data' ? valore : giornoScelto) {
      prossimi.set('data', chiave === 'data' ? valore : giornoScelto)
    }
    const cinema = chiave === 'cinema' ? valore : cinemaScelto
    if (cinema) prossimi.set('cinema', cinema)
    const stringa = prossimi.toString()
    return `/film/${film.slug}${stringa ? `?${stringa}` : ''}#orari`
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datiStrutturatiFilm(film, archivio.impostazioni.marchio.nome),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datiStrutturatiSpettacoli(
              film,
              risolti.map((voce) => voce.spettacolo),
              cinemaPerId,
              archivio.impostazioni,
            ),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datiStrutturatiPercorso([
              { nome: 'Film', href: '/film' },
              { nome: film.titolo, href: `/film/${film.slug}` },
            ]),
          ),
        }}
      />

      {/* ── Apertura ────────────────────────────────────────────────────── */}
      <header className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 -z-10">
          <Fondale chiave={film.id} palette={film.palette} immagine={film.backdrop} />
          <div className="absolute inset-0 bg-gradient-to-t from-sfondo via-sfondo/75 to-sfondo/30" aria-hidden />
        </div>

        <div className="contenitore grid gap-6 pb-9 lg:grid-cols-[18rem_1fr] lg:gap-8">
          <div className="mx-auto w-52 lg:mx-0 lg:w-full">
            <div className="locandina overflow-hidden rounded-morbido shadow-rilievo">
              <Locandina
                titolo={film.titolo}
                chiave={film.id}
                palette={film.palette}
                immagine={film.locandina}
              />
            </div>
          </div>

          <div>
            <nav aria-label="Percorso" className="mb-5 text-[0.8rem] text-tenue">
              <Link href="/film" className="transition-colors hover:text-accento">
                Film
              </Link>
              <span className="mx-2" aria-hidden>
                /
              </span>
              <span className="text-testo">{film.titolo}</span>
            </nav>

            <h1 className="text-balance font-titolo text-[1.9rem] leading-[1.03] sm:text-[2.7rem]">
              {film.titolo}
            </h1>

            {film.titoloOriginale && film.titoloOriginale !== film.titolo && (
              <p className="mt-2 text-[0.95rem] italic text-tenue">{film.titoloOriginale}</p>
            )}

            <p className="mt-4 max-w-2xl text-[1.05rem] leading-relaxed text-tenue">
              {film.sottotitolo}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2.5 text-[0.86rem] text-tenue">
              <span className="inline-flex items-center gap-1.5">
                <Icona nome="orologio" className="size-4" />
                {durata(film.durataMinuti)}
              </span>
              <span>{film.generi.join(' · ')}</span>
              <span>{film.anno}</span>
              <span>{film.paese}</span>
              <span className="rounded border border-bordo-forte px-1.5 py-0.5 text-[0.72rem] font-semibold text-testo">
                {film.classificazione}
              </span>
              {film.valutazione > 0 && <Stelle valore={film.valutazione} />}
            </div>

            {film.formati.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-2">
                {film.formati.map((formato) => {
                  const supplemento = supplementoFormato(formato, archivio.impostazioni)
                  return (
                    <li key={formato}>
                      <Etichetta tono={formato === '2D' ? 'neutro' : 'ambra'}>
                        {formato}
                        {supplemento > 0 && (
                          <span className="font-normal normal-case tracking-normal opacity-75">
                            +{prezzo(supplemento)}
                          </span>
                        )}
                      </Etichetta>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {film.stato === 'in-sala' && risolti.length > 0 ? (
                <Bottone href="#orari" misura="grande">
                  <Icona nome="biglietto" className="size-4" />
                  Acquista biglietti
                </Bottone>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-tenue border border-ambra/40 bg-ambra/10 px-6 py-3.5 text-[0.92rem] font-semibold text-ambra">
                  <Icona nome="calendario" className="size-4" />
                  In sala dal {dataEstesa(film.dataUscita)}
                </span>
              )}

              <LettoreTrailer trailer={film.trailer} titolo={film.titolo}>
                <span className="vetro-scuro inline-flex items-center gap-2 rounded-tenue px-6 py-3.5 text-[0.92rem] font-semibold text-white transition-colors duration-200 hover:bg-white/15">
                  <Icona nome="play" className="size-4" pieno />
                  Trailer
                </span>
              </LettoreTrailer>
            </div>
          </div>
        </div>
      </header>

      {/* ── Trama e cast ────────────────────────────────────────────────── */}
      <Sezione spaziatura="ridotta">
        <div className="grid gap-7 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-titolo text-[1.5rem] font-semibold">La storia</h2>
            <div className="mt-5 space-y-4 text-[1rem] leading-relaxed text-tenue">
              {paragrafi(film.trama).map((pezzo, indice) => (
                <p key={indice}>{pezzo}</p>
              ))}
            </div>
          </div>

          <aside className="space-y-7">
            <div>
              <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-accento">
                Scheda tecnica
              </h2>
              <dl className="mt-4 space-y-3 text-[0.9rem]">
                {[
                  ['Regia', film.regista],
                  ['Durata', durata(film.durataMinuti)],
                  ['Anno', String(film.anno)],
                  ['Paese', film.paese],
                  ['Lingua originale', film.lingua],
                  ['Classificazione', film.classificazione],
                  ['Uscita', dataEstesa(film.dataUscita)],
                ].map(([etichetta, valore]) => (
                  <div key={etichetta} className="flex justify-between gap-4 border-b border-bordo pb-3">
                    <dt className="text-tenue">{etichetta}</dt>
                    <dd className="text-right font-medium">{valore}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {film.cast.length > 0 && (
              <div>
                <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-accento">
                  Interpreti
                </h2>
                <ul className="mt-4 space-y-2.5 text-[0.9rem]">
                  {film.cast.map((voce) => (
                    <li key={voce.nome} className="flex justify-between gap-4">
                      <Link
                        href={`/ricerca?q=${encodeURIComponent(voce.nome)}`}
                        className="font-medium transition-colors hover:text-accento"
                      >
                        {voce.nome}
                      </Link>
                      <span className="text-right text-tenue">{voce.ruolo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </Sezione>

      {/* ── Dove vederlo e orari ────────────────────────────────────────── */}
      <Sezione id="orari" className="bg-sfondo-alt">
        {risolti.length === 0 ? (
          <>
            <TitoloSezione
              soprattitolo="Orari"
              titolo={film.stato === 'prossimamente' ? 'Prevendita non ancora aperta' : 'Nessuno spettacolo in programma'}
              allineamento="sinistra"
            />
            <Nota className="mt-8 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
              {film.stato === 'prossimamente' ? (
                <>
                  Il film esce il {dataEstesa(film.dataUscita)}. La prevendita apre una settimana
                  prima: registrati all’area personale per ricevere l’avviso quando parte.
                </>
              ) : (
                <>
                  Al momento questo film non è in programmazione nelle nostre sale. Consulta la{' '}
                  <Link href="/programmazione" className="text-accento underline">
                    programmazione completa
                  </Link>{' '}
                  per vedere cosa c’è in sala oggi.
                </>
              )}
            </Nota>
          </>
        ) : (
          <>
            <TitoloSezione
              soprattitolo="Dove vederlo"
              titolo="Scegli sala e orario"
              allineamento="sinistra"
            />

            <div className="mt-5 flex flex-wrap gap-2">
              <Link
                href={indirizzo('cinema', '')}
                scroll={false}
                className={classi(
                  'rounded-tenue border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
                  cinemaScelto
                    ? 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento'
                    : 'border-accento bg-accento text-white',
                )}
              >
                Tutti i cinema
              </Link>
              {strutture.map((struttura) => (
                <Link
                  key={struttura.id}
                  href={indirizzo('cinema', struttura.id)}
                  scroll={false}
                  className={classi(
                    'rounded-tenue border px-4 py-2 text-[0.84rem] font-medium transition-all duration-300',
                    cinemaScelto === struttura.id
                      ? 'border-accento bg-accento text-white'
                      : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
                  )}
                >
                  {struttura.nome}
                  <span className="ml-1.5 opacity-70">{struttura.citta}</span>
                </Link>
              ))}
            </div>

            <SelettoreGiorni
              giorni={giorni}
              attivo={giornoScelto}
              costruisciHref={(giorno) => indirizzo('data', giorno)}
              className="mt-6"
            />

            <div className="mt-6 space-y-6">
              {perCinema.size === 0 && (
                <Nota icona={<Icona nome="info" className="size-4" />}>
                  Nessuno spettacolo in questa combinazione di cinema e giorno. Prova un altro
                  giorno del calendario qui sopra.
                </Nota>
              )}

              {[...perCinema.entries()].map(([cinemaId, voci]) => {
                const struttura = voci[0].cinema
                return (
                  <div key={cinemaId} className="rounded-ampio border border-bordo bg-superficie p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h3 className="font-titolo text-[1.15rem] font-semibold">
                          {archivio.impostazioni.marchio.nome} {struttura.nome}
                        </h3>
                        <p className="mt-1 flex items-center gap-1.5 text-[0.84rem] text-tenue">
                          <Icona nome="posizione" className="size-3.5" />
                          {struttura.indirizzo}, {struttura.citta}
                        </p>
                      </div>
                      <Bottone
                        href={`/cinema/${struttura.slug}`}
                        variante="tenue"
                        misura="piccola"
                      >
                        Scheda del cinema
                      </Bottone>
                    </div>

                    <Orari
                      className="mt-5"
                      spettacoli={voci.map((voce) => voce.spettacolo)}
                      sale={archivio.sale}
                      impostazioni={archivio.impostazioni}
                      durataFilm={film.durataMinuti}
                    />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </Sezione>

      {/* ── Film simili ─────────────────────────────────────────────────── */}
      {simili.length > 0 && (
        <Sezione>
          <TitoloSezione soprattitolo="Ti potrebbe piacere" titolo="Dello stesso genere" allineamento="sinistra" />
          <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {simili.map((voce) => (
              <SchedaFilm key={voce.id} film={voce} />
            ))}
          </div>
        </Sezione>
      )}
    </>
  )
}
