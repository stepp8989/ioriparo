'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { Stelle } from '@/componenti/ui/Stelle'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import type { Recensione } from '@/lib/tipi'
import { classi, dataEstesa, media } from '@/lib/utili'

/**
 * Recensioni dei clienti, in un carosello che avanza da solo.
 *
 * Lo scorrimento automatico si ferma al passaggio del puntatore, quando un
 * elemento interno riceve il fuoco da tastiera e per chi ha ridotto le
 * animazioni di sistema: un contenuto che si muove da solo mentre lo si legge
 * è un problema di accessibilità, non un effetto.
 */
export function Recensioni({ recensioni }: { recensioni: Recensione[] }) {
  const pubblicate = recensioni.filter((recensione) => recensione.pubblicata)
  const [corrente, setCorrente] = useState(0)
  const [inPausa, setInPausa] = useState(false)
  const contenitore = useRef<HTMLDivElement>(null)

  const totale = pubblicate.length
  const valutazione = media(pubblicate.map((recensione) => recensione.voto))

  const vaiA = useCallback(
    (indice: number) => {
      if (totale === 0) return
      setCorrente(((indice % totale) + totale) % totale)
    },
    [totale],
  )

  useEffect(() => {
    if (inPausa || totale < 2) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const avanzamento = setInterval(() => setCorrente((precedente) => (precedente + 1) % totale), 6000)
    return () => clearInterval(avanzamento)
  }, [inPausa, totale])

  if (totale === 0) return null

  return (
    <Sezione className="bg-sfondo">
      <TitoloSezione
        soprattitolo="Dicono di noi"
        titolo={
          <>
            {valutazione.toLocaleString('it-IT')} su 5,
            <br />
            <span className="testo-accento">da {totale} recensioni</span>
          </>
        }
        sottotitolo="Sono le recensioni pubblicate su Google e Facebook, riportate integralmente."
      />

      <div
        className="relative mx-auto mt-14 max-w-3xl"
        onMouseEnter={() => setInPausa(true)}
        onMouseLeave={() => setInPausa(false)}
        onFocusCapture={() => setInPausa(true)}
        onBlurCapture={() => setInPausa(false)}
        ref={contenitore}
      >
        <div
          className="overflow-hidden"
          aria-live="polite"
          aria-atomic="false"
          aria-label="Recensioni dei clienti"
        >
          <div
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ transform: `translateX(-${corrente * 100}%)` }}
          >
            {pubblicate.map((recensione, indice) => (
              <figure
                key={recensione.id}
                className="w-full shrink-0 px-1"
                aria-hidden={indice !== corrente}
              >
                <div className="rounded-ampio border border-bordo bg-superficie p-8 text-center shadow-morbida sm:p-12">
                  <Icona nome="stella" className="mx-auto size-6 text-accento/25" />

                  <blockquote className="mt-6 font-titolo text-[1.2rem] leading-relaxed text-balance sm:text-[1.4rem]">
                    «{recensione.testo}»
                  </blockquote>

                  <figcaption className="mt-8">
                    <Stelle voto={recensione.voto} className="justify-center" />
                    <p className="mt-4 font-semibold">{recensione.autore}</p>
                    <p className="mt-1 text-[0.82rem] text-tenue">
                      {dataEstesa(recensione.data)} · {recensione.fonte === 'diretta' ? 'Cliente' : recensione.fonte}
                    </p>
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => vaiA(corrente - 1)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
            aria-label="Recensione precedente"
          >
            <Icona nome="chevronSinistra" className="size-4" />
          </button>

          <div className="flex gap-2">
            {pubblicate.map((recensione, indice) => (
              <button
                key={recensione.id}
                type="button"
                onClick={() => vaiA(indice)}
                aria-label={`Vai alla recensione ${indice + 1}`}
                aria-current={indice === corrente}
                className={classi(
                  'h-1.5 rounded-full transition-all duration-400',
                  indice === corrente ? 'w-7 bg-accento' : 'w-1.5 bg-bordo-forte hover:bg-accento/50',
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => vaiA(corrente + 1)}
            className="inline-flex size-10 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
            aria-label="Recensione successiva"
          >
            <Icona nome="chevronDestra" className="size-4" />
          </button>
        </div>
      </div>
    </Sezione>
  )
}
