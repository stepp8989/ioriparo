'use client'

import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useCallback, useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'

export type Scatto = {
  file: string
  titolo: string
  formato: 'verticale' | 'orizzontale' | 'quadrato'
}

/** Proporzioni per ogni formato: evitano lo spostamento del layout in caricamento. */
const MISURE: Record<Scatto['formato'], { larghezza: number; altezza: number }> = {
  verticale: { larghezza: 1000, altezza: 1400 },
  orizzontale: { larghezza: 1600, altezza: 1067 },
  quadrato: { larghezza: 1200, altezza: 1200 },
}

/**
 * Galleria a mosaico con visualizzatore a schermo intero.
 *
 * L'impaginato usa le colonne CSS (`.mosaico` in `globals.css`): le immagini si
 * incastrano da sole in base alla loro altezza, senza calcoli in JavaScript e
 * senza salti mentre caricano, perché ogni scatto dichiara le sue proporzioni.
 */
export function Mosaico({ scatti }: { scatti: readonly Scatto[] }) {
  const [aperto, setAperto] = useState<number | null>(null)
  const menoMovimento = useReducedMotion()

  const chiudi = useCallback(() => setAperto(null), [])
  const scorri = useCallback(
    (passo: number) =>
      setAperto((corrente) =>
        corrente === null ? null : (corrente + passo + scatti.length) % scatti.length,
      ),
    [scatti.length],
  )

  // Tastiera: Esc chiude, le frecce scorrono. Con il visualizzatore aperto la
  // pagina sotto non deve scorrere.
  useEffect(() => {
    if (aperto === null) return

    const suTasto = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') chiudi()
      if (evento.key === 'ArrowRight') scorri(1)
      if (evento.key === 'ArrowLeft') scorri(-1)
    }

    document.addEventListener('keydown', suTasto)
    const scorrimento = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', suTasto)
      document.body.style.overflow = scorrimento
    }
  }, [aperto, chiudi, scorri])

  const corrente = aperto === null ? null : scatti[aperto]

  return (
    <>
      <ul className="mosaico">
        {scatti.map((scatto, indice) => {
          const misura = MISURE[scatto.formato]
          return (
            <li key={scatto.file}>
              <motion.button
                type="button"
                onClick={() => setAperto(indice)}
                className="group relative block w-full cursor-zoom-in overflow-hidden"
                initial={menoMovimento ? false : { opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.65, delay: (indice % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                aria-label={`Apri la fotografia: ${scatto.titolo}`}
              >
                <Image
                  src={`/immagini/galleria/${scatto.file}.jpg`}
                  alt={scatto.titolo}
                  width={misura.larghezza}
                  height={misura.altezza}
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 92vw"
                  className="w-full transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                />

                {/* Velo e didascalia al passaggio del puntatore */}
                <span
                  className="absolute inset-0 bg-gradient-to-t from-notte/80 via-notte/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
                  aria-hidden
                />
                <span className="absolute inset-x-0 bottom-0 flex translate-y-3 items-center justify-between gap-3 p-5 text-left opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100">
                  <span className="font-titolo text-xl text-white">{scatto.titolo}</span>
                  <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/40 text-white">
                    <Icona nome="cerca" className="size-4" />
                  </span>
                </span>
              </motion.button>
            </li>
          )
        })}
      </ul>

      {/* Visualizzatore a schermo intero */}
      <AnimatePresence>
        {corrente && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={corrente.titolo}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-notte/95 p-4 backdrop-blur-sm sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: menoMovimento ? 0.01 : 0.25 }}
            onClick={chiudi}
          >
            <button
              type="button"
              onClick={chiudi}
              autoFocus
              className="absolute top-4 right-4 z-10 grid size-12 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-accento hover:text-accento sm:top-6 sm:right-6"
              aria-label="Chiudi la fotografia"
            >
              <Icona nome="chiudi" className="size-6" />
            </button>

            {[
              { passo: -1, icona: 'chevronSinistra' as const, lato: 'left-2 sm:left-6', testo: 'precedente' },
              { passo: 1, icona: 'chevronDestra' as const, lato: 'right-2 sm:right-6', testo: 'successiva' },
            ].map((comando) => (
              <button
                key={comando.testo}
                type="button"
                onClick={(evento) => {
                  evento.stopPropagation()
                  scorri(comando.passo)
                }}
                className={`absolute top-1/2 z-10 grid size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 text-white transition-colors hover:border-accento hover:text-accento ${comando.lato}`}
                aria-label={`Fotografia ${comando.testo}`}
              >
                <Icona nome={comando.icona} className="size-6" />
              </button>
            ))}

            <motion.figure
              key={corrente.file}
              className="relative max-h-full w-full max-w-5xl"
              initial={{ opacity: 0, scale: menoMovimento ? 1 : 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: menoMovimento ? 1 : 0.97 }}
              transition={{ duration: menoMovimento ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
              onClick={(evento) => evento.stopPropagation()}
            >
              <Image
                src={`/immagini/galleria/${corrente.file}.jpg`}
                alt={corrente.titolo}
                width={MISURE[corrente.formato].larghezza}
                height={MISURE[corrente.formato].altezza}
                sizes="(min-width: 1024px) 64rem, 100vw"
                className="mx-auto max-h-[78vh] w-auto object-contain"
                priority
              />

              <figcaption className="mt-5 flex items-center justify-center gap-4 text-center text-white/70">
                <span className="font-titolo text-xl">{corrente.titolo}</span>
                <span className="text-sm tabular-nums text-white/40">
                  {(aperto ?? 0) + 1} / {scatti.length}
                </span>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
