'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA } from '@/dati/azienda'
import type { SorgenteVideo } from '@/lib/risorse'
import { classi } from '@/lib/utili'

/**
 * Apertura a schermo intero.
 *
 * Se la concessionaria ha caricato le proprie riprese in `public/video/`, il
 * fondo è quel filmato. Altrimenti tre fotografie si alternano con una
 * dissolvenza lenta e una panoramica impercettibile: costa una manciata di
 * chilobyte invece di decine di megabyte, e su una connessione mobile è la
 * differenza fra vedere la home subito o dopo qualche secondo.
 *
 * In entrambi i casi il movimento si ferma per chi ha ridotto le animazioni
 * nelle impostazioni di sistema.
 */

const FOTOGRAMMI = ['/immagini/apertura-1.jpg', '/immagini/apertura-2.jpg', '/immagini/apertura-3.jpg']

const NUMERI = [
  { valore: `${AZIENDA.numeri.anniAttivita}`, etichetta: 'Anni di attività' },
  { valore: `${AZIENDA.numeri.veicoliFlotta}`, etichetta: 'Veicoli a noleggio' },
  { valore: '4,9', etichetta: 'Media recensioni' },
]

export function Apertura({ video }: { video: SorgenteVideo[] }) {
  const [corrente, setCorrente] = useState(0)
  const [fermo, setFermo] = useState(false)

  useEffect(() => {
    const preferenza = window.matchMedia('(prefers-reduced-motion: reduce)')
    setFermo(preferenza.matches)

    const aggiorna = (evento: MediaQueryListEvent) => setFermo(evento.matches)
    preferenza.addEventListener('change', aggiorna)
    return () => preferenza.removeEventListener('change', aggiorna)
  }, [])

  useEffect(() => {
    if (video.length > 0 || fermo) return

    const rotazione = setInterval(() => {
      setCorrente((precedente) => (precedente + 1) % FOTOGRAMMI.length)
    }, 6500)

    return () => clearInterval(rotazione)
  }, [video.length, fermo])

  return (
    <section className="relative flex min-h-[100svh] items-center overflow-hidden bg-notte">
      {/* Fondo */}
      <div className="absolute inset-0" aria-hidden>
        {video.length > 0 ? (
          <video
            autoPlay={!fermo}
            muted
            loop
            playsInline
            poster={FOTOGRAMMI[0]}
            className="size-full object-cover"
          >
            {video.map((sorgente) => (
              <source key={sorgente.percorso} src={sorgente.percorso} type={sorgente.tipo} />
            ))}
          </video>
        ) : (
          FOTOGRAMMI.map((fotogramma, indice) => (
            <Image
              key={fotogramma}
              src={fotogramma}
              alt=""
              fill
              priority={indice === 0}
              sizes="100vw"
              className={classi(
                'object-cover transition-opacity duration-[1600ms] ease-in-out',
                indice === corrente ? 'opacity-100' : 'opacity-0',
                !fermo && 'panoramica',
              )}
            />
          ))
        )}
      </div>

      {/* Velature: senza, il testo bianco non reggerebbe il contrasto su tutte le immagini. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-notte via-notte/75 to-notte/25"
        aria-hidden
      />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-notte" aria-hidden />
      <div className="griglia-tecnica absolute inset-0 opacity-60" aria-hidden />

      <div className="contenitore relative z-10 pt-28 pb-24">
        <div className="max-w-3xl">
          <p className="affiora mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[0.72rem] font-medium tracking-[0.2em] text-white/75 uppercase backdrop-blur-sm">
            <span className="relative flex size-2">
              <span className="pulsa absolute inline-flex size-full rounded-full bg-accento-forte" />
              <span className="relative inline-flex size-2 rounded-full bg-accento" />
            </span>
            Concessionaria multiservizi · {AZIENDA.indirizzo.citta}
          </p>

          <h1
            className="affiora font-titolo text-[2.6rem] leading-[1.04] font-semibold text-white sm:text-6xl lg:text-[4.4rem]"
            style={{ animationDelay: '0.1s' }}
          >
            Passione per i motori.
            <span className="mt-2 block testo-accento">Qualità senza compromessi.</span>
          </h1>

          <p
            className="affiora mt-7 max-w-xl text-[1.05rem] leading-relaxed text-white/70 sm:text-[1.15rem]"
            style={{ animationDelay: '0.2s' }}
          >
            Vendita, Noleggio e Cura Professionale del tuo veicolo.
          </p>

          <div
            className="affiora mt-10 flex flex-col gap-3 sm:flex-row"
            style={{ animationDelay: '0.3s' }}
          >
            <Bottone href="/catalogo" misura="grande">
              Scopri il Catalogo
              <Icona nome="freccia" className="size-4" />
            </Bottone>
            <Bottone href="/contatti#preventivo" variante="vetro" misura="grande">
              Richiedi Preventivo
            </Bottone>
          </div>

          <dl
            className="affiora mt-14 flex flex-wrap gap-x-10 gap-y-6"
            style={{ animationDelay: '0.42s' }}
          >
            {NUMERI.map((numero) => (
              <div key={numero.etichetta}>
                <dt className="sr-only">{numero.etichetta}</dt>
                <dd>
                  <span className="block font-titolo text-[2rem] leading-none font-semibold text-white tabellare">
                    {numero.valore}
                  </span>
                  <span className="mt-2 block text-[0.72rem] tracking-[0.18em] text-white/45 uppercase">
                    {numero.etichetta}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Indicatore di scorrimento: sparisce appena si comincia a leggere. */}
      <a
        href="#servizi"
        className="absolute bottom-8 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-white/45 transition-colors hover:text-white lg:flex"
        aria-label="Vai alla sezione servizi"
      >
        <span className="text-[0.65rem] tracking-[0.28em] uppercase">Scorri</span>
        <Icona nome="frecciaGiu" className="size-4 animate-bounce" />
      </a>
    </section>
  )
}
