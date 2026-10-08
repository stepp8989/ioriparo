'use client'

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Lista orizzontale scorrevole.
 *
 * Non è un carosello automatico: non si muove da solo e non ruba il controllo.
 * È una fila che si trascina con il dito su un telefono e si scorre con due
 * pulsanti su una scrivania, e che resta navigabile con Tab perché gli
 * elementi restano tutti nel documento — niente slide nascoste, niente
 * `aria-hidden` su contenuti raggiungibili da tastiera.
 *
 * I pulsanti compaiono solo quando servono davvero: se il contenuto ci sta
 * tutto, non c'è nulla da scorrere e nulla da mostrare.
 */
export function Carosello({
  children,
  className,
  etichetta,
}: {
  children: ReactNode
  className?: string
  etichetta: string
}) {
  const pista = useRef<HTMLDivElement>(null)
  const [puoIndietro, setPuoIndietro] = useState(false)
  const [puoAvanti, setPuoAvanti] = useState(false)

  const aggiorna = useCallback(() => {
    const elemento = pista.current
    if (!elemento) return
    const margine = 8
    setPuoIndietro(elemento.scrollLeft > margine)
    setPuoAvanti(
      elemento.scrollLeft + elemento.clientWidth < elemento.scrollWidth - margine,
    )
  }, [])

  useEffect(() => {
    aggiorna()
    const elemento = pista.current
    if (!elemento) return

    // `ResizeObserver` copre sia il ridimensionamento della finestra sia
    // l'arrivo di contenuto nuovo, che con il solo evento `resize` sfuggirebbe.
    const osservatore = new ResizeObserver(aggiorna)
    osservatore.observe(elemento)
    return () => osservatore.disconnect()
  }, [aggiorna])

  function scorri(direzione: 1 | -1) {
    const elemento = pista.current
    if (!elemento) return
    // Si scorre di poco meno di una schermata, così l'ultimo elemento visibile
    // resta parzialmente in vista e si capisce che la fila continua.
    elemento.scrollBy({ left: direzione * elemento.clientWidth * 0.85, behavior: 'smooth' })
  }

  const stilePulsante =
    'absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full ' +
    'vetro text-testo shadow-rilievo transition-all duration-300 hover:text-accento lg:inline-flex'

  return (
    <div className={classi('relative', className)}>
      <button
        type="button"
        onClick={() => scorri(-1)}
        className={classi(stilePulsante, '-left-5', !puoIndietro && 'pointer-events-none opacity-0')}
        aria-label={`Scorri indietro: ${etichetta}`}
        tabIndex={puoIndietro ? 0 : -1}
      >
        <Icona nome="chevronSinistra" className="size-5" />
      </button>

      <div
        ref={pista}
        onScroll={aggiorna}
        className="senza-barra -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 md:-mx-8 md:px-8"
        role="group"
        aria-label={etichetta}
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => scorri(1)}
        className={classi(stilePulsante, '-right-5', !puoAvanti && 'pointer-events-none opacity-0')}
        aria-label={`Scorri avanti: ${etichetta}`}
        tabIndex={puoAvanti ? 0 : -1}
      >
        <Icona nome="chevronDestra" className="size-5" />
      </button>
    </div>
  )
}
