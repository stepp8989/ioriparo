'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Galleria della scheda veicolo.
 *
 * Una fotografia grande, le miniature sotto e un visualizzatore a schermo
 * intero. Se la scheda ha un filmato, questo prende il posto della prima
 * immagine quando lo si seleziona.
 *
 * Le frecce della tastiera scorrono la galleria e Esc chiude il visualizzatore:
 * sono le scorciatoie che chi guarda molte fotografie si aspetta.
 */
export function Galleria({
  immagini,
  video,
  titolo,
}: {
  immagini: string[]
  video: string | null
  titolo: string
}) {
  const [corrente, setCorrente] = useState(0)
  const [aSchermo, setASchermo] = useState(false)
  const [mostraVideo, setMostraVideo] = useState(false)

  const totale = immagini.length

  const scorri = useCallback(
    (passo: number) => {
      setMostraVideo(false)
      setCorrente((precedente) => (precedente + passo + totale) % totale)
    },
    [totale],
  )

  useEffect(() => {
    const allaTastiera = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setASchermo(false)
      if (evento.key === 'ArrowRight') scorri(1)
      if (evento.key === 'ArrowLeft') scorri(-1)
    }

    // Fuori dal visualizzatore le frecce servono a scorrere la pagina: si
    // ascolta la tastiera solo quando è aperto.
    if (!aSchermo) return
    window.addEventListener('keydown', allaTastiera)
    return () => window.removeEventListener('keydown', allaTastiera)
  }, [aSchermo, scorri])

  useEffect(() => {
    if (!aSchermo) return
    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = precedente
    }
  }, [aSchermo])

  return (
    <div>
      <div className="relative aspect-[3/2] overflow-hidden rounded-ampio bg-antracite shadow-rilievo">
        {mostraVideo && video ? (
          <video src={video} controls autoPlay className="size-full object-cover" />
        ) : (
          <>
            <Image
              src={immagini[corrente]}
              alt={`${titolo} — fotografia ${corrente + 1} di ${totale}`}
              fill
              priority
              sizes="(min-width: 1024px) 62vw, 96vw"
              className="object-cover"
            />

            <button
              type="button"
              onClick={() => setASchermo(true)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Apri la fotografia a schermo intero"
            />

            {totale > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => scorri(-1)}
                  className="vetro-scuro absolute top-1/2 left-4 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                  aria-label="Fotografia precedente"
                >
                  <Icona nome="chevronSinistra" className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scorri(1)}
                  className="vetro-scuro absolute top-1/2 right-4 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-white transition-transform hover:scale-105"
                  aria-label="Fotografia successiva"
                >
                  <Icona nome="chevronDestra" className="size-4" />
                </button>
              </>
            )}

            <span className="vetro-scuro absolute right-4 bottom-4 rounded-full px-3 py-1.5 text-[0.78rem] font-medium text-white tabellare">
              {corrente + 1} / {totale}
            </span>
          </>
        )}
      </div>

      <div className="senza-barra mt-4 flex gap-3 overflow-x-auto pb-1">
        {video && (
          <button
            type="button"
            onClick={() => setMostraVideo(true)}
            className={classi(
              'relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-tenue border-2 transition-colors',
              mostraVideo ? 'border-accento' : 'border-transparent hover:border-bordo-forte',
            )}
            aria-label="Guarda il video del veicolo"
          >
            <Image src={immagini[0]} alt="" fill sizes="96px" className="object-cover opacity-60" />
            <span className="absolute inset-0 flex items-center justify-center text-white">
              <Icona nome="riproduci" className="size-7" />
            </span>
          </button>
        )}

        {immagini.map((immagine, indice) => (
          <button
            key={immagine}
            type="button"
            onClick={() => {
              setMostraVideo(false)
              setCorrente(indice)
            }}
            aria-label={`Mostra la fotografia ${indice + 1}`}
            aria-current={!mostraVideo && indice === corrente}
            className={classi(
              'relative aspect-[3/2] w-24 shrink-0 overflow-hidden rounded-tenue border-2 transition-colors',
              !mostraVideo && indice === corrente
                ? 'border-accento'
                : 'border-transparent opacity-65 hover:opacity-100',
            )}
          >
            <Image src={immagine} alt="" fill sizes="96px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Visualizzatore a schermo intero. */}
      {aSchermo && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-notte/95 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Fotografie di ${titolo}`}
        >
          <button
            type="button"
            onClick={() => setASchermo(false)}
            className="absolute top-5 right-5 inline-flex size-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
            aria-label="Chiudi"
            autoFocus
          >
            <Icona nome="chiudi" />
          </button>

          <div className="relative h-full max-h-[85vh] w-full max-w-6xl">
            <Image
              src={immagini[corrente]}
              alt={`${titolo} — fotografia ${corrente + 1} di ${totale}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {totale > 1 && (
            <>
              <button
                type="button"
                onClick={() => scorri(-1)}
                className="absolute left-4 inline-flex size-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                aria-label="Fotografia precedente"
              >
                <Icona nome="chevronSinistra" className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => scorri(1)}
                className="absolute right-4 inline-flex size-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:bg-white/10"
                aria-label="Fotografia successiva"
              >
                <Icona nome="chevronDestra" className="size-5" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
