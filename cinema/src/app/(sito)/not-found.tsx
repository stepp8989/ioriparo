import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Sezione } from '@/componenti/ui/Sezione'
import { datiSito, filmVisibili } from '@/lib/sito'
import { SchedaFilm } from '@/componenti/film/SchedaFilm'

/**
 * Pagina non trovata.
 *
 * Invece di un vicolo cieco propone una via d'uscita utile: i film in
 * programmazione adesso. Chi arriva qui quasi sempre cercava un film il cui
 * indirizzo è cambiato o la cui programmazione è finita.
 */
export default async function NonTrovata() {
  const archivio = await datiSito()
  const suggeriti = filmVisibili(archivio)
    .filter((film) => film.stato === 'in-sala')
    .slice(0, 5)

  return (
    <Sezione className="pt-36">
      <div className="mx-auto max-w-xl text-center">
        <span className="inline-flex size-16 items-center justify-center rounded-full bg-accento/12 text-accento">
          <Icona nome="ciak" className="size-8" />
        </span>

        <p className="mt-5 font-stretto text-[4.5rem] font-bold leading-none text-accento">404</p>

        <h1 className="mt-4 font-titolo text-[1.8rem] font-semibold">
          Questa pagina non è in programmazione
        </h1>

        <p className="mt-4 text-[1rem] leading-relaxed text-tenue">
          L’indirizzo che hai seguito non esiste, oppure il film che cercavi ha finito il suo
          periodo in sala. Qui sotto trovi quello che c’è adesso.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Bottone href="/programmazione">
            <Icona nome="calendario" className="size-4" />
            Vedi la programmazione
          </Bottone>
          <Bottone href="/" variante="contorno">
            Torna alla home
          </Bottone>
        </div>
      </div>

      {suggeriti.length > 0 && (
        <div className="mt-8">
          <h2 className="text-center text-[0.74rem] font-semibold uppercase tracking-[0.2em] text-tenue">
            In sala ora
          </h2>
          <div className="mt-7 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-5">
            {suggeriti.map((film) => (
              <SchedaFilm key={film.id} film={film} />
            ))}
          </div>
        </div>
      )}
    </Sezione>
  )
}
