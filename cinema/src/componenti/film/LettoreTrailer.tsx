'use client'

import { useState } from 'react'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import type { Trailer } from '@/lib/tipi'
import { classi } from '@/lib/utili'

/**
 * Lettore dei trailer.
 *
 * Il video non viene incorporato finché non si preme play: prima c'è solo un
 * pulsante. È un dettaglio che cambia parecchio — un `<iframe>` di YouTube
 * carica qualche centinaio di chilobyte e installa i propri cookie appena
 * compare nella pagina, e una home con sei trailer in vetrina diventerebbe
 * una pagina che chiama sei volte un dominio terzo prima ancora che qualcuno
 * abbia deciso di guardare qualcosa.
 *
 * `youtube-nocookie.com` è il dominio in modalità privacy avanzata: YouTube
 * non registra la visita finché non si avvia davvero la riproduzione.
 */

function indirizzo(trailer: Trailer): string | null {
  if (!trailer.riferimento) return null

  if (trailer.piattaforma === 'youtube') {
    return `https://www.youtube-nocookie.com/embed/${trailer.riferimento}?autoplay=1&rel=0&modestbranding=1`
  }
  if (trailer.piattaforma === 'vimeo') {
    return `https://player.vimeo.com/video/${trailer.riferimento}?autoplay=1&dnt=1`
  }
  // `file`: un filmato servito dal dominio, per chi ha i diritti del materiale.
  return trailer.riferimento
}

export function LettoreTrailer({
  trailer,
  titolo,
  children,
  className,
}: {
  trailer: Trailer | null
  titolo: string
  /** Ciò che apre il lettore: di solito la locandina o un pulsante. */
  children: React.ReactNode
  className?: string
}) {
  const [aperto, setAperto] = useState(false)
  const url = trailer ? indirizzo(trailer) : null

  return (
    <>
      <button
        type="button"
        onClick={() => setAperto(true)}
        className={classi('group/trailer text-left', className)}
        aria-label={`Guarda il trailer di ${titolo}`}
      >
        {children}
      </button>

      <Finestra
        aperta={aperto}
        onChiudi={() => setAperto(false)}
        titolo={`Trailer — ${titolo}`}
        ampia
      >
        {url ? (
          trailer?.piattaforma === 'file' ? (
            // eslint-disable-next-line jsx-a11y/media-has-caption -- i sottotitoli
            // del trailer, quando esistono, arrivano dentro il file stesso.
            <video src={url} controls autoPlay className="aspect-video w-full bg-black" />
          ) : (
            <iframe
              src={url}
              title={`Trailer di ${titolo}`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
              className="aspect-video w-full border-0 bg-black"
            />
          )
        ) : (
          <div className="p-6">
            <Nota tono="ambra" icona={<Icona nome="info" className="size-4" />}>
              <p className="font-medium text-testo">Trailer non ancora disponibile.</p>
              <p className="mt-1">
                L’identificativo del video si inserisce dal pannello, in Film → {titolo} →
                Trailer. Finché non c’è, il sito preferisce dirlo invece di caricare un video
                qualsiasi.
              </p>
            </Nota>
          </div>
        )}
      </Finestra>
    </>
  )
}

/** Pulsante play sovrapposto, usato sopra locandine e fondali. */
export function BottonePlay({ className }: { className?: string }) {
  return (
    <span
      className={classi(
        'inline-flex size-14 items-center justify-center rounded-full vetro-scuro text-white',
        'transition-all duration-500 group-hover/trailer:scale-110 group-hover/trailer:bg-accento',
        className,
      )}
      aria-hidden
    >
      <Icona nome="play" className="ml-0.5 size-5" pieno />
    </span>
  )
}
