import Link from 'next/link'
import { BottonePlay, LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { SchedaFilm } from '@/componenti/film/SchedaFilm'
import { Bottone } from '@/componenti/ui/Bottone'
import { Carosello } from '@/componenti/ui/Carosello'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale } from '@/componenti/ui/Poster'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { Rivela } from '@/componenti/animazioni/Rivela'
import type { Cinema, Film, LivelloLoyalty, PianoAbbonamento, Promozione } from '@/lib/tipi'
import { dataEstesa, durataBreve, percentuale, prezzo } from '@/lib/utili'

/**
 * Sezioni della home.
 *
 * Sono componenti di server: non hanno stato, ricevono già i dati filtrati e
 * non producono JavaScript nel browser. L'unica parte interattiva è il lettore
 * dei trailer, che è un componente di client annidato — il resto della pagina
 * resta HTML.
 */

/* ── In sala ora ─────────────────────────────────────────────────────────── */

export function InSalaOra({
  film,
  prezziMinimi,
}: {
  film: Film[]
  /** Prezzo minimo per film, calcolato dagli spettacoli disponibili. */
  prezziMinimi: Map<string, number>
}) {
  if (film.length === 0) return null

  return (
    <Sezione id="in-sala">
      <TitoloSezione
        soprattitolo="In sala ora"
        titolo="Quello che puoi vedere stasera"
        allineamento="sinistra"
        azione={
          <Bottone href="/film" variante="contorno" misura="piccola">
            Tutti i film
            <Icona nome="freccia" className="size-4" />
          </Bottone>
        }
      />

      <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
        {film.slice(0, 10).map((voce, indice) => (
          <Rivela key={voce.id} ritardo={Math.min(indice, 4) * 0.05}>
            <SchedaFilm film={voce} prezzoDa={prezziMinimi.get(voce.id)} />
          </Rivela>
        ))}
      </div>
    </Sezione>
  )
}

/* ── Prossimamente ───────────────────────────────────────────────────────── */

export function Prossimamente({ film }: { film: Film[] }) {
  if (film.length === 0) return null

  return (
    <Sezione className="bg-sfondo-alt">
      <TitoloSezione
        soprattitolo="Prossimamente"
        titolo="Segnati la data"
        sottotitolo="I titoli in arrivo nelle nostre sale. La prevendita apre una settimana prima dell'uscita."
        allineamento="sinistra"
      />

      <Carosello etichetta="Film in arrivo" className="mt-12">
        {film.map((voce) => (
          <article
            key={voce.id}
            className="group w-[16rem] shrink-0 snap-start sm:w-[19rem]"
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-morbido">
              <div className="size-full transition-transform duration-700 group-hover:scale-105">
                <Fondale chiave={voce.id} palette={voce.palette} immagine={voce.backdrop} />
              </div>

              <div
                className="absolute inset-0 bg-gradient-to-t from-notte via-notte/40 to-transparent"
                aria-hidden
              />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <Etichetta tono="pieno" className="mb-3">
                  {dataEstesa(voce.dataUscita)}
                </Etichetta>
                <h3 className="font-titolo text-[1.3rem] font-semibold leading-tight text-white">
                  {voce.titolo}
                </h3>
                <p className="mt-1.5 text-[0.85rem] text-white/75">{voce.generi.join(' · ')}</p>
              </div>

              <div className="absolute right-4 top-4">
                <LettoreTrailer trailer={voce.trailer} titolo={voce.titolo}>
                  <BottonePlay className="size-11" />
                </LettoreTrailer>
              </div>
            </div>

            <Bottone
              href={`/film/${voce.slug}`}
              variante="tenue"
              misura="piccola"
              className="mt-4 w-full"
            >
              Scopri il film
              <Icona nome="freccia" className="size-4" />
            </Bottone>
          </article>
        ))}
      </Carosello>
    </Sezione>
  )
}

/* ── Trailer ─────────────────────────────────────────────────────────────── */

export function VetrinaTrailer({ film }: { film: Film[] }) {
  const conTrailer = film.filter((voce) => voce.trailer)
  if (conTrailer.length === 0) return null

  return (
    <Sezione id="trailer" className="relative overflow-hidden bg-notte text-white">
      <div className="alone-viola pointer-events-none absolute -right-40 top-0 size-[34rem]" aria-hidden />

      <div className="relative">
        <TitoloSezione
          soprattitolo="Trailer"
          titolo="Guarda prima di scegliere"
          allineamento="sinistra"
          azione={
            <Bottone href="/trailer" variante="vetro" misura="piccola">
              Tutti i trailer
              <Icona nome="freccia" className="size-4" />
            </Bottone>
          }
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {conTrailer.slice(0, 6).map((voce) => (
            <Rivela key={voce.id}>
              <LettoreTrailer
                trailer={voce.trailer}
                titolo={voce.titolo}
                className="block w-full"
              >
                <div className="relative aspect-video overflow-hidden rounded-morbido">
                  <div className="size-full transition-transform duration-700 group-hover/trailer:scale-105">
                    <Fondale chiave={voce.id} palette={voce.palette} immagine={voce.backdrop} />
                  </div>
                  <div className="absolute inset-0 bg-notte/35 transition-colors duration-500 group-hover/trailer:bg-notte/15" aria-hidden />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BottonePlay />
                  </div>
                  {voce.trailer && (
                    <span className="absolute bottom-3 right-3 rounded-full bg-notte/80 px-2.5 py-1 text-[0.7rem] tabellare text-white">
                      {durataBreve(voce.trailer.durataSecondi)}
                    </span>
                  )}
                </div>

                <h3 className="mt-3.5 font-titolo text-[1.02rem] font-semibold">{voce.titolo}</h3>
                <p className="mt-1 text-[0.82rem] text-white/60">{voce.generi.join(' · ')}</p>
              </LettoreTrailer>
            </Rivela>
          ))}
        </div>
      </div>
    </Sezione>
  )
}

/* ── Promozioni ──────────────────────────────────────────────────────────── */

export function VetrinaPromozioni({ promozioni }: { promozioni: Promozione[] }) {
  if (promozioni.length === 0) return null

  return (
    <Sezione>
      <TitoloSezione
        soprattitolo="Promozioni"
        titolo="Il cinema costa meno di quanto pensi"
        allineamento="sinistra"
        azione={
          <Bottone href="/promozioni" variante="contorno" misura="piccola">
            Tutte le promozioni
            <Icona nome="freccia" className="size-4" />
          </Bottone>
        }
      />

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {promozioni.slice(0, 3).map((promozione, indice) => (
          <Rivela key={promozione.id} ritardo={indice * 0.06}>
            <Link
              href={`/promozioni#${promozione.slug}`}
              className="group relative flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accento/40 hover:shadow-rilievo"
            >
              <div className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                <Fondale chiave={promozione.id} palette={promozione.palette} />
              </div>

              <span
                className="mb-6 inline-flex size-12 items-center justify-center rounded-full"
                style={{ backgroundColor: `${promozione.palette[1]}22`, color: promozione.palette[1] }}
              >
                <Icona
                  nome={promozione.tipo === 'punti-extra' ? 'trofeo' : 'percento'}
                  className="size-5"
                />
              </span>

              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-accento">
                {promozione.sottotitolo}
              </p>
              <h3 className="mt-2 font-titolo text-[1.35rem] font-semibold leading-tight">
                {promozione.titolo}
              </h3>
              <p className="mt-3 flex-1 text-[0.9rem] leading-relaxed text-tenue">
                {promozione.descrizione}
              </p>

              <span className="mt-5 inline-flex items-center gap-2 text-[0.85rem] font-semibold text-accento">
                {promozione.codice ? `Codice ${promozione.codice}` : 'Sconto automatico'}
                <Icona nome="freccia" className="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Rivela>
        ))}
      </div>
    </Sezione>
  )
}

/* ── CLUB e abbonamenti ──────────────────────────────────────────────────── */

export function Club({
  livelli,
  piani,
  nome,
  puntiPerEuro,
}: {
  livelli: LivelloLoyalty[]
  piani: PianoAbbonamento[]
  nome: string
  puntiPerEuro: number
}) {
  const inEvidenza = piani.find((piano) => piano.inEvidenza) ?? piani[0]

  return (
    <Sezione className="bg-sfondo-alt">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <TitoloSezione
            soprattitolo={`${nome} CLUB`}
            titolo="Ogni biglietto vale qualcosa"
            sottotitolo={
              <>
                Guadagni {puntiPerEuro} punti per ogni euro speso, su biglietti e banco. I punti si
                trasformano in biglietti, popcorn e posti migliori — e più sali di livello, più
                velocemente si accumulano.
              </>
            }
            allineamento="sinistra"
          />

          <ul className="mt-9 space-y-3">
            {livelli.map((livello) => (
              <Rivela key={livello.id} da="destra">
                <li className="flex items-start gap-4 rounded-morbido border border-bordo bg-superficie p-4">
                  <span
                    className="mt-0.5 inline-flex size-10 shrink-0 items-center justify-center rounded-full"
                    style={{ backgroundColor: `${livello.colore}22`, color: livello.colore }}
                  >
                    <Icona nome="trofeo" className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-baseline gap-x-3">
                      <span className="font-titolo text-[1.05rem] font-semibold">
                        {livello.nome}
                      </span>
                      <span className="tabellare text-[0.8rem] text-tenue">
                        da {livello.puntiMinimi.toLocaleString('it-IT')} punti
                      </span>
                      {livello.moltiplicatore > 1 && (
                        <Etichetta tono="accento" className="px-2 py-0.5 text-[0.6rem]">
                          punti ×{livello.moltiplicatore}
                        </Etichetta>
                      )}
                    </span>
                    <span className="mt-1.5 block text-[0.86rem] leading-relaxed text-tenue">
                      {livello.vantaggi.slice(0, 3).join(' · ')}
                    </span>
                  </span>
                </li>
              </Rivela>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Bottone href="/area-personale">Iscriviti al CLUB</Bottone>
            <Bottone href="/abbonamenti" variante="contorno">
              Vedi gli abbonamenti
            </Bottone>
          </div>
        </div>

        {inEvidenza && (
          <Rivela da="sinistra">
            <div className="relative overflow-hidden rounded-ampio border border-bordo bg-superficie p-8 shadow-rilievo">
              <div className="alone pointer-events-none absolute -right-20 -top-20 size-64" aria-hidden />

              <Etichetta tono="pieno">Il più scelto</Etichetta>

              <h3 className="mt-5 font-titolo text-[2rem] font-semibold">{inEvidenza.nome}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-tenue">
                {inEvidenza.descrizione}
              </p>

              <p className="mt-7 flex items-baseline gap-2">
                <span className="font-titolo text-[3rem] font-bold leading-none testo-accento">
                  {prezzo(inEvidenza.prezzo)}
                </span>
                <span className="text-[0.9rem] text-tenue">
                  /{inEvidenza.periodo === 'mensile' ? 'mese' : 'anno'}
                </span>
              </p>

              <ul className="mt-7 space-y-2.5">
                {inEvidenza.vantaggi.slice(0, 5).map((vantaggio) => (
                  <li key={vantaggio} className="flex items-start gap-2.5 text-[0.9rem]">
                    <Icona nome="spunta" className="mt-0.5 size-4 shrink-0 text-ok" />
                    {vantaggio}
                  </li>
                ))}
              </ul>

              <Bottone href="/abbonamenti" variante="viola" className="mt-8 w-full">
                Abbonati
              </Bottone>

              {inEvidenza.scontoFood > 0 && (
                <p className="mt-4 text-center text-[0.8rem] text-tenue">
                  Compreso {percentuale(inEvidenza.scontoFood)} di sconto sul banco
                </p>
              )}
            </div>
          </Rivela>
        )}
      </div>
    </Sezione>
  )
}

/* ── Le sale ─────────────────────────────────────────────────────────────── */

export function Strutture({ cinema, nome }: { cinema: Cinema[]; nome: string }) {
  if (cinema.length === 0) return null

  return (
    <Sezione>
      <TitoloSezione
        soprattitolo="Trova cinema"
        titolo="Cinque sale in tutta l’isola"
        allineamento="sinistra"
        azione={
          <Bottone href="/cinema" variante="contorno" misura="piccola">
            Trova il tuo cinema
            <Icona nome="bussola" className="size-4" />
          </Bottone>
        }
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cinema.map((struttura, indice) => (
          <Rivela key={struttura.id} ritardo={Math.min(indice, 3) * 0.05}>
            <Link
              href={`/cinema/${struttura.slug}`}
              className="group relative flex h-full flex-col justify-end overflow-hidden rounded-morbido p-6 transition-transform duration-500 hover:-translate-y-1"
            >
              <div className="absolute inset-0 -z-10">
                <div className="size-full transition-transform duration-700 group-hover:scale-105">
                  <Fondale chiave={struttura.id} palette={struttura.palette} immagine={struttura.immagine} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-notte via-notte/55 to-transparent" aria-hidden />
              </div>

              <div className="min-h-[9rem] text-white">
                <h3 className="font-titolo text-[1.25rem] font-semibold">
                  {nome} {struttura.nome}
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-[0.85rem] text-white/75">
                  <Icona nome="posizione" className="size-3.5" />
                  {struttura.indirizzo}, {struttura.citta}
                </p>
                <p className="mt-3 flex flex-wrap gap-1.5">
                  {struttura.servizi.slice(0, 4).map((servizio) => (
                    <span
                      key={servizio}
                      className="rounded-full bg-white/12 px-2.5 py-1 text-[0.68rem] text-white/85"
                    >
                      {servizio}
                    </span>
                  ))}
                </p>
              </div>
            </Link>
          </Rivela>
        ))}
      </div>
    </Sezione>
  )
}

/* ── Invito finale ───────────────────────────────────────────────────────── */

export function Invito({ nome }: { nome: string }) {
  return (
    <Sezione className="relative overflow-hidden bg-notte text-white">
      <div className="alone pointer-events-none absolute left-1/2 top-0 size-[40rem] -translate-x-1/2" aria-hidden />
      <div className="griglia-tecnica pointer-events-none absolute inset-0" aria-hidden />

      <div className="relative mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-titolo text-[2.2rem] leading-tight sm:text-[3rem]">
          Il posto giusto ti sta aspettando
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-[1.02rem] leading-relaxed text-white/70">
          Scegli il film, scegli la poltrona, entra con il QR sul telefono. Niente code, niente
          stampe, niente sorprese al momento di pagare.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Bottone href="/programmazione" misura="grande">
            <Icona nome="calendario" className="size-4" />
            Vedi la programmazione
          </Bottone>
          <Bottone href="/gift-card" variante="vetro" misura="grande">
            <Icona nome="regalo" className="size-4" />
            Regala il cinema
          </Bottone>
        </div>

        <p className="mt-8 text-[0.8rem] text-white/45">
          {nome} — biglietti, abbonamenti e gift card in un unico posto.
        </p>
      </div>
    </Sezione>
  )
}
