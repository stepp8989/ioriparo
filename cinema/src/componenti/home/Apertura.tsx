'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale } from '@/componenti/ui/Poster'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Stelle } from '@/componenti/ui/Stelle'
import type { Film } from '@/lib/tipi'
import { classi, dataEstesa, durata } from '@/lib/utili'

/**
 * Apertura della home.
 *
 * Ruota fra i film in evidenza. Tre scelte che non sono scontate:
 *
 *   — la rotazione si ferma appena si tocca qualcosa (puntatore sopra, fuoco
 *     dentro, scelta manuale) e non riparte: un'apertura che continua a
 *     cambiare mentre si sta leggendo un titolo è il difetto più comune di
 *     questo tipo di sezione;
 *   — chi ha chiesto meno animazioni al sistema non vede nessuna rotazione,
 *     e i comandi restano per scorrere a mano;
 *   — i titoli non mostrati restano nel documento con `aria-hidden` e
 *     `inert`, così non finiscono nella navigazione da tastiera ma la
 *     transizione può comunque dissolverli.
 */

const DURATA_ROTAZIONE = 9000

export function Apertura({ film }: { film: Film[] }) {
  const [indice, setIndice] = useState(0)
  const [fermo, setFermo] = useState(false)

  useEffect(() => {
    if (fermo || film.length < 2) return

    const menoMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (menoMovimento) return

    const orologio = window.setInterval(
      () => setIndice((precedente) => (precedente + 1) % film.length),
      DURATA_ROTAZIONE,
    )
    return () => window.clearInterval(orologio)
  }, [fermo, film.length])

  if (film.length === 0) return null

  const attuale = film[indice]

  return (
    <section
      className="relative isolate flex min-h-[min(92vh,52rem)] items-end overflow-hidden"
      aria-roledescription="carosello"
      aria-label="Film in evidenza"
      onMouseEnter={() => setFermo(true)}
      onFocusCapture={() => setFermo(true)}
    >
      {/* Fondali sovrapposti: quello attivo in dissolvenza sopra gli altri. */}
      {film.map((voce, posizione) => (
        <div
          key={voce.id}
          className={classi(
            'absolute inset-0 -z-10 transition-opacity duration-1000',
            posizione === indice ? 'opacity-100' : 'opacity-0',
          )}
          aria-hidden={posizione !== indice}
        >
          <div className={classi('size-full', posizione === indice && 'panoramica')}>
            <Fondale chiave={voce.id} palette={voce.palette} immagine={voce.backdrop} />
          </div>
        </div>
      ))}

      {/* Due veli: uno dal basso per il testo, uno da sinistra per il blocco. */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-sfondo via-sfondo/70 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-sfondo/90 via-sfondo/35 to-transparent"
        aria-hidden
      />

      <div className="contenitore w-full pb-14 pt-32 sm:pb-20">
        <div key={attuale.id} className="affiora max-w-2xl">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Etichetta tono="pieno">
              {attuale.stato === 'in-sala' ? 'In sala ora' : 'Prossimamente'}
            </Etichetta>
            {attuale.formati
              .filter((formato) => formato !== '2D' && formato !== 'VO sottotitolato')
              .slice(0, 2)
              .map((formato) => (
                <Etichetta key={formato} tono="scuro">
                  {formato}
                </Etichetta>
              ))}
          </div>

          <h1 className="text-balance font-titolo text-[2.4rem] leading-[1.03] sm:text-6xl lg:text-[4.2rem]">
            {attuale.titolo}
          </h1>

          <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed text-tenue">
            {attuale.sottotitolo}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.85rem] text-tenue">
            <span className="inline-flex items-center gap-1.5">
              <Icona nome="orologio" className="size-4" />
              {durata(attuale.durataMinuti)}
            </span>
            <span>{attuale.generi.join(' · ')}</span>
            <span>{attuale.anno}</span>
            <span className="rounded border border-bordo-forte px-1.5 py-0.5 text-[0.72rem] font-semibold">
              {attuale.classificazione}
            </span>
            {attuale.valutazione > 0 && <Stelle valore={attuale.valutazione} />}
          </div>

          <p className="mt-5 max-w-xl text-[0.92rem] leading-relaxed text-tenue">
            <span className="text-testo">Regia</span> {attuale.regista}
            {attuale.cast.length > 0 && (
              <>
                {' · '}
                <span className="text-testo">Con</span>{' '}
                {attuale.cast.slice(0, 3).map((voce) => voce.nome).join(', ')}
              </>
            )}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {attuale.stato === 'in-sala' ? (
              <Bottone href={`/film/${attuale.slug}#orari`} misura="grande">
                <Icona nome="biglietto" className="size-4" />
                Acquista biglietti
              </Bottone>
            ) : (
              <Bottone href={`/film/${attuale.slug}`} misura="grande" variante="viola">
                <Icona nome="calendario" className="size-4" />
                Dal {dataEstesa(attuale.dataUscita)}
              </Bottone>
            )}

            <LettoreTrailer trailer={attuale.trailer} titolo={attuale.titolo}>
              <span className="inline-flex items-center gap-2.5 rounded-full vetro px-7 py-4 text-[0.95rem] font-semibold transition-all duration-500 hover:-translate-y-0.5 hover:text-accento">
                <Icona nome="play" className="size-4" pieno />
                Guarda il trailer
              </span>
            </LettoreTrailer>
          </div>
        </div>

        {film.length > 1 && (
          <div className="mt-12 flex flex-wrap items-center gap-3">
            {film.map((voce, posizione) => (
              <button
                key={voce.id}
                type="button"
                onClick={() => {
                  setIndice(posizione)
                  setFermo(true)
                }}
                aria-label={`Mostra ${voce.titolo}`}
                aria-current={posizione === indice}
                className={classi(
                  'h-1 rounded-full transition-all duration-500',
                  posizione === indice
                    ? 'w-14 bg-accento'
                    : 'w-7 bg-bordo-forte hover:bg-tenue',
                )}
              />
            ))}

            <Link
              href="/film"
              className="sottolinea ml-3 text-[0.82rem] font-medium text-tenue transition-colors hover:text-accento"
            >
              Tutti i film
            </Link>
          </div>
        )}
      </div>

      {/* Fascio del proiettore: l'unico elemento puramente decorativo della pagina. */}
      <div
        className="fascio pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 opacity-60"
        aria-hidden
      />
    </section>
  )
}
