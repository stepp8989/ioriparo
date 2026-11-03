import Link from 'next/link'
import { BottonePlay, LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Etichetta } from '@/componenti/ui/Sezione'
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
 *
 * Rispetto alla prima versione la scheda è **senza velo**: il manifesto si vede
 * per intero e si scurisce solo al passaggio del puntatore, quando deve far
 * leggere il pulsante del trailer. Il velo permanente serviva a far stare i dati
 * sopra l'immagine; quei dati sono scesi sotto, dove non coprono niente e si
 * leggono meglio. Titolo e metadati stanno in un blocco di altezza fissa, così
 * in griglia le locandine restano allineate anche fra titoli di una riga e
 * titoli di due.
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
  const formatiSpeciali = film.formati.filter((formato) => formato !== '2D').slice(0, 2)

  return (
    <article className={classi('group relative', className)}>
      <div className="locandina relative w-full overflow-hidden rounded-tenue border border-bordo bg-superficie transition-colors duration-200 group-hover:border-bordo-forte">
        <Locandina
          titolo={film.titolo}
          chiave={film.id}
          palette={film.palette}
          immagine={film.locandina}
          sopra={film.generi[0]}
        />

        {/* Il velo compare solo al passaggio, e solo per far leggere il play. */}
        <div
          className="pointer-events-none absolute inset-0 bg-notte/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
          aria-hidden
        />

        <div className="pointer-events-none absolute left-1.5 top-1.5 z-20 flex flex-wrap gap-1">
          {prossimamente && (
            <Etichetta tono="pieno">
              Dal {dataEstesa(film.dataUscita).replace(/ \d{4}$/, '')}
            </Etichetta>
          )}
          {formatiSpeciali.map((formato) => (
            <Etichetta key={formato} tono="scuro">
              {formato}
            </Etichetta>
          ))}
        </div>

        {film.classificazione !== 'T' && (
          <span className="pointer-events-none absolute right-1.5 top-1.5 z-20 rounded-[3px] border border-white/25 bg-notte/85 px-1.5 py-0.5 font-stretto text-[0.7rem] font-bold leading-tight text-white">
            {film.classificazione}
          </span>
        )}

        {/* Il trailer sta sopra la locandina ma fuori dal collegamento. */}
        <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
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
      </div>

      <div className="mt-2">
        <h3 className="line-clamp-2 min-h-[2.4em] font-titolo text-[0.9rem] font-semibold leading-[1.2]">
          <Link href={`/film/${film.slug}`} className="transition-colors hover:text-accento">
            {film.titolo}
          </Link>
        </h3>

        <div className="mt-1 flex items-center gap-2 text-[0.74rem] text-tenue">
          {film.valutazione > 0 && <Stelle valore={film.valutazione} />}
          <span className="tabellare">{durata(film.durataMinuti)}</span>
          {typeof prezzoDa === 'number' && prezzoDa > 0 && (
            <span className="tabellare ml-auto font-semibold text-accento">
              da {prezzoDa.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
