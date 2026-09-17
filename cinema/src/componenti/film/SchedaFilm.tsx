import Link from 'next/link'
import { BottonePlay, LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Icona } from '@/componenti/ui/Icona'
import { Locandina } from '@/componenti/ui/Poster'
import { Stelle } from '@/componenti/ui/Stelle'
import type { Film } from '@/lib/tipi'
import { classi, dataEstesa, durata } from '@/lib/utili'

/**
 * Scheda di un film nelle griglie e nei caroselli.
 *
 * La locandina è il collegamento alla scheda; il pulsante del trailer è un
 * comando distinto, sovrapposto ma separato. Annidare un pulsante dentro un
 * collegamento sarebbe HTML non valido e renderebbe l'insieme inutilizzabile
 * da tastiera: qui sono due elementi fratelli, e il trailer sta sopra grazie a
 * un contesto di impilamento, non all'annidamento.
 */
export function SchedaFilm({
  film,
  prezzoDa,
  className,
}: {
  film: Film
  /** Prezzo minimo degli spettacoli disponibili, se ne esistono. */
  prezzoDa?: number
  className?: string
}) {
  const prossimamente = film.stato === 'prossimamente'

  return (
    <article className={classi('group relative', className)}>
      <div className="relative overflow-hidden rounded-morbido bg-superficie shadow-morbida transition-shadow duration-500 group-hover:shadow-rilievo">
        <div className="locandina relative w-full overflow-hidden">
          <div className="size-full transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]">
            <Locandina
              titolo={film.titolo}
              chiave={film.id}
              palette={film.palette}
              immagine={film.locandina}
              mostraTitolo={false}
            />
          </div>

          {/* Velo che compare al passaggio: serve a far leggere i comandi. */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-notte via-notte/25 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90"
            aria-hidden
          />

          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {prossimamente && <Etichetta tono="viola">Dal {dataEstesa(film.dataUscita).replace(/ \d{4}$/, '')}</Etichetta>}
            {film.formati.includes('IMAX') && <Etichetta tono="scuro">IMAX</Etichetta>}
            {film.formati.includes('4DX') && <Etichetta tono="scuro">4DX</Etichetta>}
          </div>

          {film.classificazione !== 'T' && (
            <span className="absolute right-3 top-3 rounded-full bg-notte/85 px-2.5 py-1 text-[0.68rem] font-bold text-white">
              {film.classificazione}
            </span>
          )}

          {/* Il trailer sta sopra la locandina ma fuori dal collegamento. */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 focus-within:opacity-100">
            <LettoreTrailer trailer={film.trailer} titolo={film.titolo}>
              <BottonePlay />
            </LettoreTrailer>
          </div>

          <Link
            href={`/film/${film.slug}`}
            className="absolute inset-0 z-10"
            aria-label={`Scheda del film ${film.titolo}`}
          >
            <span className="sr-only">{film.titolo}</span>
          </Link>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[15] p-3.5">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.74rem] text-white/85">
              <span className="inline-flex items-center gap-1">
                <Icona nome="orologio" className="size-3" />
                {durata(film.durataMinuti)}
              </span>
              {film.generi[0] && <span>{film.generi[0]}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 space-y-1.5">
        <h3 className="font-titolo text-[1rem] font-semibold leading-tight">
          <Link href={`/film/${film.slug}`} className="transition-colors hover:text-accento">
            {film.titolo}
          </Link>
        </h3>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {film.valutazione > 0 ? (
            <Stelle valore={film.valutazione} />
          ) : (
            <span className="text-[0.8rem] text-tenue">Non ancora valutato</span>
          )}
          {typeof prezzoDa === 'number' && prezzoDa > 0 && (
            <span className="tabellare text-[0.8rem] text-tenue">
              da {prezzoDa.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
