'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LettoreTrailer } from '@/componenti/film/LettoreTrailer'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale, Locandina } from '@/componenti/ui/Poster'
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
 *   — i titoli non mostrati restano nel documento con `aria-hidden`, così non
 *     finiscono nella navigazione da tastiera ma la transizione può comunque
 *     dissolverli.
 *
 * Rispetto alla prima versione l'apertura è **più bassa** — poco più di due
 * terzi di schermata invece di quasi una intera — e i puntini di scorrimento
 * sono diventati una fila di locandine. Un'apertura alta come tutto lo schermo
 * costringe a scorrere prima di vedere anche solo un titolo in programmazione,
 * e i puntini non dicono che cosa si sta per vedere: le locandine sì, e
 * intanto mostrano quattro film invece di uno.
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
      className="relative isolate flex min-h-[min(62vh,38rem)] items-end overflow-hidden"
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
            'absolute inset-0 -z-10 transition-opacity duration-700',
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
        className="absolute inset-0 -z-10 bg-gradient-to-t from-sfondo via-sfondo/72 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-sfondo/94 via-sfondo/40 to-transparent"
        aria-hidden
      />

      <div className="contenitore w-full pb-7 pt-24">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <div key={attuale.id} className="affiora max-w-xl">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
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

            <h1 className="text-balance font-titolo text-[2.1rem] leading-[1.02] sm:text-[3rem] lg:text-[3.4rem]">
              {attuale.titolo}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-tenue">
              {attuale.valutazione > 0 && <Stelle valore={attuale.valutazione} />}
              <span className="tabellare">{durata(attuale.durataMinuti)}</span>
              <span>{attuale.generi.slice(0, 2).join(' · ')}</span>
              <span className="tabellare">{attuale.anno}</span>
              <span className="rounded-[3px] border border-bordo-forte px-1.5 py-0.5 font-stretto text-[0.72rem] font-bold">
                {attuale.classificazione}
              </span>
            </div>

            <p className="mt-3 max-w-lg text-[0.95rem] leading-relaxed text-tenue">
              {attuale.sottotitolo}
            </p>

            <p className="mt-2 max-w-lg text-[0.85rem] leading-relaxed text-tenue">
              <span className="font-semibold text-testo">Regia</span> {attuale.regista}
              {attuale.cast.length > 0 && (
                <>
                  {' · '}
                  <span className="font-semibold text-testo">Con</span>{' '}
                  {attuale.cast
                    .slice(0, 3)
                    .map((voce) => voce.nome)
                    .join(', ')}
                </>
              )}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {attuale.stato === 'in-sala' ? (
                <Bottone href={`/film/${attuale.slug}#orari`} misura="grande">
                  <Icona nome="biglietto" className="size-4" />
                  Acquista biglietti
                </Bottone>
              ) : (
                <Bottone href={`/film/${attuale.slug}`} misura="grande" variante="ambra">
                  <Icona nome="calendario" className="size-4" />
                  Dal {dataEstesa(attuale.dataUscita)}
                </Bottone>
              )}

              <LettoreTrailer trailer={attuale.trailer} titolo={attuale.titolo}>
                <span className="vetro-scuro inline-flex items-center gap-2 rounded-tenue px-6 py-3.5 text-[0.92rem] font-semibold text-white transition-colors duration-200 hover:bg-white/15">
                  <Icona nome="play" className="size-4" pieno />
                  Trailer
                </span>
              </LettoreTrailer>
            </div>
          </div>

          {/*
           * Selettore: le locandine degli altri film in evidenza. Fa da indice
           * del carosello e da anteprima insieme, e su schermo stretto sparisce
           * perché ruberebbe l'altezza al blocco di testo.
           */}
          {film.length > 1 && (
            <div className="hidden shrink-0 items-end gap-2 md:flex">
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
                    'locandina w-[4.75rem] overflow-hidden rounded-tenue border-2 transition-all duration-300 lg:w-[5.75rem]',
                    posizione === indice
                      ? 'border-accento opacity-100'
                      : 'border-transparent opacity-45 hover:opacity-80',
                  )}
                >
                  <Locandina
                    titolo={voce.titolo}
                    chiave={voce.id}
                    palette={voce.palette}
                    immagine={voce.locandina}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center gap-4 border-t border-bordo pt-3">
          <div className="flex gap-1.5 md:hidden">
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
                  'h-1 rounded-full transition-all duration-300',
                  posizione === indice ? 'w-10 bg-accento' : 'w-5 bg-bordo-forte',
                )}
              />
            ))}
          </div>

          <Link
            href="/film"
            className="sottolinea ml-auto inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-tenue transition-colors hover:text-accento"
          >
            Tutti i film in programmazione
            <Icona nome="freccia" className="size-3.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
