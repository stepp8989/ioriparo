import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Orari } from '@/componenti/film/Orari'
import { SelettoreGiorni } from '@/componenti/film/SelettoreGiorni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale, Locandina } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { capienza, conteggioPerTipo } from '@/lib/posti'
import { datiStrutturatiCinema, datiStrutturatiPercorso, metadatiPagina } from '@/lib/seo'
import { cinemaVisibili, datiSito, giorniConSpettacoli, spettacoliUtili } from '@/lib/sito'
import { durata, GIORNI_SETTIMANA, numero, raggruppa } from '@/lib/utili'

/**
 * Scheda di una sala cinematografica.
 *
 * Porta tre cose che il pubblico cerca davvero in questa pagina: come
 * arrivarci, cosa c'è in programma oggi, e com'è fatta la sala — quante
 * poltrone, quante premium, quanti posti riservati. L'ultima informazione
 * quasi nessuno la pubblica, ed è quella che serve a chi deve sapere in
 * anticipo se può venire.
 */
export const revalidate = 300

export async function generateStaticParams() {
  const archivio = await datiSito()
  return cinemaVisibili(archivio).map((cinema) => ({ slug: cinema.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const archivio = await datiSito()
  const cinema = archivio.cinema.find((voce) => voce.slug === slug && voce.visibile)

  if (!cinema) {
    return metadatiPagina({
      titolo: 'Cinema non trovato',
      descrizione: 'La sala richiesta non esiste o non è più attiva.',
      percorso: `/cinema/${slug}`,
      indicizza: false,
    })
  }

  const nome = archivio.impostazioni.marchio.nome
  return metadatiPagina({
    titolo: `${nome} ${cinema.nome} — orari e biglietti a ${cinema.citta}`,
    descrizione: `${cinema.descrizione} ${cinema.indirizzo}, ${cinema.citta}.`.slice(0, 280),
    percorso: `/cinema/${cinema.slug}`,
    nomeSito: nome,
  })
}

export default async function PaginaCinema({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ slug }, parametri, archivio] = await Promise.all([params, searchParams, datiSito()])

  const cinema = archivio.cinema.find((voce) => voce.slug === slug && voce.visibile)
  if (!cinema) notFound()

  const nome = archivio.impostazioni.marchio.nome
  const sale = archivio.sale.filter((sala) => sala.cinemaId === cinema.id && sala.attiva)

  const risolti = spettacoliUtili(archivio, { cinemaId: cinema.id })
  const giorni = giorniConSpettacoli(risolti, 10)

  const richiesto = parametri.data
  const giornoRichiesto = (Array.isArray(richiesto) ? richiesto[0] : richiesto) ?? ''
  const giornoScelto = giorni.includes(giornoRichiesto) ? giornoRichiesto : (giorni[0] ?? '')

  const delGiorno = risolti.filter((voce) => voce.spettacolo.data === giornoScelto)
  const perFilm = raggruppa(delGiorno, (voce) => voce.film.id)

  const postiTotali = sale.reduce((somma, sala) => somma + capienza(sala.schema), 0)
  const riservati = sale.reduce(
    (somma, sala) => somma + conteggioPerTipo(sala.schema).disabili,
    0,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datiStrutturatiCinema(cinema, sale, nome)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            datiStrutturatiPercorso([
              { nome: 'Cinema', href: '/cinema' },
              { nome: cinema.nome, href: `/cinema/${cinema.slug}` },
            ]),
          ),
        }}
      />

      <header className="relative isolate overflow-hidden pt-28">
        <div className="absolute inset-0 -z-10">
          <Fondale chiave={cinema.id} palette={cinema.palette} immagine={cinema.immagine} />
          <div className="absolute inset-0 bg-gradient-to-t from-sfondo via-sfondo/80 to-sfondo/40" aria-hidden />
        </div>

        <div className="contenitore pb-12">
          <nav aria-label="Percorso" className="mb-5 text-[0.8rem] text-tenue">
            <Link href="/cinema" className="transition-colors hover:text-accento">
              Cinema
            </Link>
            <span className="mx-2" aria-hidden>
              /
            </span>
            <span className="text-testo">{cinema.nome}</span>
          </nav>

          <h1 className="text-balance font-titolo text-[2.2rem] leading-tight sm:text-[3rem]">
            {nome} {cinema.nome}
          </h1>

          <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-tenue">
            {cinema.descrizione}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={`https://www.openstreetmap.org/?mlat=${cinema.coordinate.lat}&mlon=${cinema.coordinate.lng}#map=17/${cinema.coordinate.lat}/${cinema.coordinate.lng}`}
              target="_blank"
              rel="noreferrer noopener"
              className="vetro-scuro inline-flex items-center gap-2 rounded-tenue px-5 py-3 text-[0.86rem] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Icona nome="posizione" className="size-4" />
              {cinema.indirizzo}, {cinema.citta}
              <Icona nome="esterno" className="size-3.5" />
            </a>
            <a
              href={`tel:${cinema.telefono.replace(/\s/g, '')}`}
              className="vetro-scuro inline-flex items-center gap-2 rounded-tenue px-5 py-3 text-[0.86rem] font-semibold text-white transition-colors hover:bg-white/15"
            >
              <Icona nome="telefono" className="size-4" />
              {cinema.telefono}
            </a>
          </div>
        </div>
      </header>

      {/* ── Programmazione ──────────────────────────────────────────────── */}
      <Sezione id="programmazione">
        <TitoloSezione soprattitolo="Programmazione" titolo="Cosa c’è in sala" allineamento="sinistra" />

        <SelettoreGiorni
          giorni={giorni}
          attivo={giornoScelto}
          costruisciHref={(giorno) => `/cinema/${cinema.slug}?data=${giorno}#programmazione`}
          className="mt-8"
        />

        {perFilm.size === 0 ? (
          <Nota className="mt-8 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
            Nessuno spettacolo in programma per questa giornata.
          </Nota>
        ) : (
          <div className="mt-8 space-y-5">
            {[...perFilm.entries()].map(([filmId, voci]) => {
              const film = voci[0].film
              return (
                <article
                  key={filmId}
                  className="grid gap-5 rounded-ampio border border-bordo bg-superficie p-5 sm:grid-cols-[6rem_1fr]"
                >
                  <Link href={`/film/${film.slug}`}>
                    <div className="locandina overflow-hidden rounded-tenue">
                      <Locandina
                        titolo={film.titolo}
                        chiave={film.id}
                        palette={film.palette}
                        immagine={film.locandina}
                      />
                    </div>
                  </Link>

                  <div className="min-w-0">
                    <h3 className="font-titolo text-[1.15rem] font-semibold">
                      <Link href={`/film/${film.slug}`} className="transition-colors hover:text-accento">
                        {film.titolo}
                      </Link>
                    </h3>
                    <p className="mt-1 text-[0.82rem] text-tenue">
                      {film.generi.join(' · ')} · {durata(film.durataMinuti)} ·{' '}
                      {film.classificazione}
                    </p>

                    <Orari
                      className="mt-4"
                      spettacoli={voci.map((voce) => voce.spettacolo)}
                      sale={archivio.sale}
                      impostazioni={archivio.impostazioni}
                      durataFilm={film.durataMinuti}
                    />
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Sezione>

      {/* ── Struttura e servizi ─────────────────────────────────────────── */}
      <Sezione className="bg-sfondo-alt">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <h2 className="font-titolo text-[1.5rem] font-semibold">Le sale</h2>
            <p className="mt-2 text-[0.92rem] text-tenue">
              {sale.length} sale per {numero(postiTotali)} posti complessivi, di cui {riservati}{' '}
              riservati a chi usa la sedia a rotelle, ciascuno con il posto dell’accompagnatore
              accanto e senza supplemento.
            </p>

            <ul className="mt-7 grid gap-3 sm:grid-cols-2">
              {sale.map((sala) => {
                const conteggio = conteggioPerTipo(sala.schema)
                return (
                  <li key={sala.id} className="rounded-morbido border border-bordo bg-superficie p-4">
                    <p className="font-titolo text-[1rem] font-semibold">{sala.nome}</p>
                    <p className="mt-1.5 text-[0.84rem] text-tenue">
                      {numero(capienza(sala.schema))} posti
                      {conteggio.premium > 0 && ` · ${conteggio.premium} premium`}
                      {conteggio.disabili > 0 && ` · ${conteggio.disabili} riservati`}
                    </p>
                    {sala.formati.length > 0 && (
                      <p className="mt-2.5 flex flex-wrap gap-1.5">
                        {sala.formati.map((formato) => (
                          <Etichetta
                            key={formato}
                            tono={formato === '2D' ? 'neutro' : 'ambra'}
                            className="px-2 py-0.5 text-[0.6rem]"
                          >
                            {formato}
                          </Etichetta>
                        ))}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>

          <aside className="space-y-8">
            <div>
              <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-accento">
                Orari di apertura
              </h2>
              <dl className="mt-4 space-y-2 text-[0.88rem]">
                {[...cinema.orari]
                  .sort((a, b) => ((a.giorno + 6) % 7) - ((b.giorno + 6) % 7))
                  .map((orario) => (
                    <div key={orario.giorno} className="flex justify-between gap-4">
                      <dt className="text-tenue">{GIORNI_SETTIMANA[orario.giorno]}</dt>
                      <dd className="tabellare font-medium">
                        {orario.chiuso ? 'Chiuso' : `${orario.apertura} – ${orario.chiusura}`}
                      </dd>
                    </div>
                  ))}
              </dl>
            </div>

            <div>
              <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-accento">
                Servizi
              </h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {cinema.servizi.map((servizio) => (
                  <li
                    key={servizio}
                    className="inline-flex items-center gap-1.5 rounded-tenue border border-bordo bg-superficie px-3 py-1.5 text-[0.8rem] text-tenue"
                  >
                    <Icona nome="spunta" className="size-3.5 text-ok" />
                    {servizio}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-[0.74rem] font-semibold uppercase tracking-[0.18em] text-accento">
                Contatti
              </h2>
              <p className="mt-4 space-y-1.5 text-[0.88rem] text-tenue">
                <span className="block">{cinema.indirizzo}</span>
                <span className="block">
                  {cinema.cap} {cinema.citta} ({cinema.provincia})
                </span>
                <a href={`tel:${cinema.telefono.replace(/\s/g, '')}`} className="mt-3 block transition-colors hover:text-accento">
                  {cinema.telefono}
                </a>
                <a href={`mailto:${cinema.email}`} className="block transition-colors hover:text-accento">
                  {cinema.email}
                </a>
              </p>
            </div>

            <Bottone href="/cinema" variante="contorno" className="w-full">
              <Icona nome="frecciaIndietro" className="size-4" />
              Tutte le sale
            </Bottone>
          </aside>
        </div>
      </Sezione>
    </>
  )
}
