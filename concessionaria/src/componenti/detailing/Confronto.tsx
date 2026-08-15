'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Confronto prima/dopo con cursore trascinabile.
 *
 * Il controllo vero è un `input[type=range]` sovrapposto e reso invisibile:
 * si trascina con il puntatore come ci si aspetta, ma funziona anche con le
 * frecce della tastiera e viene annunciato correttamente dai lettori di
 * schermo. Costruire lo stesso comportamento a mano, con soli eventi del
 * puntatore, lo renderebbe inutilizzabile senza mouse.
 */
export function Confronto({
  prima,
  dopo,
  titolo,
}: {
  prima: string
  dopo: string
  titolo: string
}) {
  const [posizione, setPosizione] = useState(50)
  const contenitore = useRef<HTMLDivElement>(null)

  return (
    <figure>
      <div
        ref={contenitore}
        className="relative aspect-[3/2] overflow-hidden rounded-ampio border border-bordo select-none"
      >
        <Image
          src={dopo}
          alt={`${titolo} — dopo il trattamento`}
          fill
          sizes="(min-width: 1024px) 46vw, 92vw"
          className="object-cover"
        />

        {/* Il «prima» viene ritagliato: resta visibile solo a sinistra del cursore. */}
        <div
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - posizione}% 0 0)` }}
          aria-hidden
        >
          <Image
            src={prima}
            alt=""
            fill
            sizes="(min-width: 1024px) 46vw, 92vw"
            className="object-cover"
          />
        </div>

        <span className="pointer-events-none absolute top-4 left-4 rounded-full bg-notte/75 px-3 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
          Prima
        </span>
        <span className="pointer-events-none absolute top-4 right-4 rounded-full bg-accento px-3 py-1 text-[0.7rem] font-semibold tracking-[0.14em] text-white uppercase">
          Dopo
        </span>

        {/* Linea di separazione e maniglia. */}
        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90"
          style={{ left: `${posizione}%` }}
          aria-hidden
        >
          <span className="absolute top-1/2 left-1/2 inline-flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-notte shadow-rilievo">
            <Icona nome="ordina" className="size-4 rotate-90" />
          </span>
        </div>

        <label className="sr-only" htmlFor={`confronto-${titolo}`}>
          Trascina per confrontare prima e dopo — {titolo}
        </label>
        <input
          id={`confronto-${titolo}`}
          type="range"
          min={0}
          max={100}
          value={posizione}
          onChange={(evento) => setPosizione(Number(evento.target.value))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>

      <figcaption className="mt-3 text-[0.88rem] text-tenue">{titolo}</figcaption>
    </figure>
  )
}
