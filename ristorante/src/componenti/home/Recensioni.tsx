'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { Stelle } from '@/componenti/ui/Stelle'
import type { Recensione } from '@/lib/tipi'
import { classi, dataEstesa, media } from '@/lib/utili'

const INTERVALLO = 7000

const NOMI_FONTE: Record<Recensione['fonte'], string> = {
  google: 'Google',
  tripadvisor: 'Tripadvisor',
  diretta: 'Recensione diretta',
}

/**
 * Carosello delle recensioni.
 *
 * Scorre da solo, ma si ferma appena il puntatore entra o qualcuno raggiunge
 * i comandi con il tabulatore: un carosello che continua a muoversi mentre si
 * legge è una barriera di accessibilità, non un effetto. Chi ha ridotto le
 * animazioni non vede alcun avanzamento automatico.
 */
export function Recensioni({ recensioni }: { recensioni: Recensione[] }) {
  const [indice, setIndice] = useState(0)
  const [inPausa, setInPausa] = useState(false)
  const menoMovimento = useReducedMotion()

  const vaiA = useCallback(
    (prossimo: number) => setIndice((prossimo + recensioni.length) % recensioni.length),
    [recensioni.length],
  )

  useEffect(() => {
    if (inPausa || menoMovimento || recensioni.length < 2) return
    const timer = setInterval(() => setIndice((corrente) => (corrente + 1) % recensioni.length), INTERVALLO)
    return () => clearInterval(timer)
  }, [inPausa, menoMovimento, recensioni.length])

  if (recensioni.length === 0) return null

  const votoMedio = media(recensioni.map((recensione) => recensione.voto))
  const corrente = recensioni[indice]

  return (
    <section className="relative overflow-hidden bg-sfondo-alt py-24 sm:py-32">
      <div className="trama pointer-events-none absolute inset-0 text-testo" aria-hidden />

      <div
        className="contenitore relative"
        onMouseEnter={() => setInPausa(true)}
        onMouseLeave={() => setInPausa(false)}
        onFocusCapture={() => setInPausa(true)}
        onBlurCapture={() => setInPausa(false)}
      >
        {/* Valutazione media */}
        <div className="text-center">
          <p className="mb-5 flex items-center justify-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento">
            <span className="filetto rotate-180" aria-hidden />
            Recensioni
            <span className="filetto" aria-hidden />
          </p>

          <div className="flex flex-col items-center gap-3">
            <span className="font-titolo text-6xl text-accento">
              {votoMedio.toLocaleString('it-IT', { minimumFractionDigits: 1 })}
            </span>
            <Stelle voto={votoMedio} dimensione="size-5" />
            <p className="text-sm text-tenue">
              Media su {recensioni.length} recensioni verificate · Google e Tripadvisor
            </p>
          </div>
        </div>

        {/* Recensione in evidenza */}
        <div className="relative mx-auto mt-14 min-h-[19rem] max-w-3xl sm:min-h-[16rem]">
          <AnimatePresence mode="wait">
            <motion.figure
              key={corrente.id}
              initial={{ opacity: 0, y: menoMovimento ? 0 : 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: menoMovimento ? 0 : -18 }}
              transition={{ duration: menoMovimento ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              <Icona nome="virgolette" className="mx-auto size-9 text-accento/35" />

              <blockquote className="mt-6 font-titolo text-2xl leading-relaxed text-balance sm:text-[1.75rem]">
                «{corrente.testo}»
              </blockquote>

              <figcaption className="mt-7">
                <span className="block text-sm font-medium tracking-[0.1em] uppercase">
                  {corrente.autore}
                </span>
                <span className="mt-1.5 block text-xs text-tenue">
                  {NOMI_FONTE[corrente.fonte]} · {dataEstesa(corrente.data)}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </div>

        {/* Comandi */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => vaiA(indice - 1)}
            aria-label="Recensione precedente"
            className="grid size-11 place-items-center rounded-full border border-bordo-forte transition-colors hover:border-accento hover:text-accento"
          >
            <Icona nome="chevronSinistra" className="size-5" />
          </button>

          <ul className="flex items-center gap-2.5" role="tablist" aria-label="Scegli la recensione">
            {recensioni.map((recensione, posizione) => (
              <li key={recensione.id}>
                <button
                  type="button"
                  role="tab"
                  aria-selected={posizione === indice}
                  aria-label={`Recensione ${posizione + 1} di ${recensioni.length}`}
                  onClick={() => setIndice(posizione)}
                  className={classi(
                    'block h-1.5 rounded-full transition-all duration-500',
                    posizione === indice ? 'w-8 bg-accento' : 'w-1.5 bg-bordo-forte hover:bg-accento/60',
                  )}
                />
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => vaiA(indice + 1)}
            aria-label="Recensione successiva"
            className="grid size-11 place-items-center rounded-full border border-bordo-forte transition-colors hover:border-accento hover:text-accento"
          >
            <Icona nome="chevronDestra" className="size-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
