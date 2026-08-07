'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { classi } from '@/lib/utili'

/**
 * Inclinazione tridimensionale al passaggio del puntatore.
 *
 * La scheda ruota di pochi gradi seguendo il mouse e una luce morbida si sposta
 * sulla superficie, come se sopra ci fosse un riflettore. È l'effetto che fa
 * sembrare la fotografia di un'auto un oggetto e non un rettangolo.
 *
 * Tre accorgimenti la tengono onesta.
 *
 * L'inclinazione è piccola — sei gradi in tutto — perché oltre si perde la
 * leggibilità del testo e la scheda sembra staccarsi dalla griglia.
 *
 * Il calcolo avviene una volta per fotogramma. Il puntatore genera molti più
 * eventi di quanti schermi ci siano da disegnare, e leggere la posizione della
 * scheda a ogni evento costringerebbe il browser a ricalcolare il layout
 * decine di volte al secondo.
 *
 * Sui dispositivi tattili non si attiva. Senza puntatore non c'è passaggio del
 * mouse: l'inclinazione scatterebbe al tocco, un istante prima che il dito apra
 * la scheda, e sembrerebbe un difetto. Vale lo stesso per chi ha chiesto meno
 * animazioni al sistema operativo.
 */
export function Inclina({
  children,
  className,
  /** Deve combaciare con l'arrotondamento della scheda, o la luce sborda dagli angoli. */
  raggio = 'rounded-ampio',
  /** Gradi di rotazione massima per asse. */
  gradi = 3.5,
}: {
  children: ReactNode
  className?: string
  raggio?: string
  gradi?: number
}) {
  const contenitore = useRef<HTMLDivElement>(null)
  const corpo = useRef<HTMLDivElement>(null)
  const luce = useRef<HTMLSpanElement>(null)
  const fotogramma = useRef(0)

  useEffect(() => {
    const zona = contenitore.current
    const scheda = corpo.current
    if (!zona || !scheda) return

    const puntatore = window.matchMedia('(hover: hover) and (pointer: fine)')
    const fermo = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!puntatore.matches || fermo.matches) return

    const muovi = (evento: PointerEvent) => {
      if (fotogramma.current) return

      fotogramma.current = requestAnimationFrame(() => {
        fotogramma.current = 0

        const area = zona.getBoundingClientRect()
        if (area.width === 0 || area.height === 0) return

        // Coordinate da 0 a 1 dentro la scheda.
        const x = (evento.clientX - area.left) / area.width
        const y = (evento.clientY - area.top) / area.height

        // Il puntatore in alto inclina la scheda all'indietro: è il verso che
        // l'occhio si aspetta da un oggetto appoggiato.
        scheda.style.transition = 'transform 140ms ease-out'
        scheda.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * gradi * 2}deg) rotateY(${(x - 0.5) * gradi * 2}deg)`

        if (luce.current) {
          luce.current.style.opacity = '1'
          luce.current.style.background = `radial-gradient(40% 60% at ${(x * 100).toFixed(1)}% ${(y * 100).toFixed(1)}%, rgb(255 255 255 / 0.18), transparent 72%)`
        }
      })
    }

    const esci = () => {
      cancelAnimationFrame(fotogramma.current)
      fotogramma.current = 0

      // Il ritorno è più lento dell'inseguimento: la scheda si riappoggia
      // invece di scattare.
      scheda.style.transition = 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)'
      scheda.style.transform = ''
      if (luce.current) luce.current.style.opacity = '0'
    }

    zona.addEventListener('pointermove', muovi)
    zona.addEventListener('pointerleave', esci)

    return () => {
      cancelAnimationFrame(fotogramma.current)
      zona.removeEventListener('pointermove', muovi)
      zona.removeEventListener('pointerleave', esci)
    }
  }, [gradi])

  return (
    <div ref={contenitore} className={classi('relative', className)}>
      <div ref={corpo} className="relative h-full will-change-transform">
        {children}

        {/* Riflesso che segue il puntatore. Sta sopra la scheda ma non
            intercetta i clic: il collegamento sotto deve restare cliccabile. */}
        <span
          ref={luce}
          aria-hidden
          className={classi(
            'pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500',
            raggio,
          )}
        />
      </div>
    </div>
  )
}
