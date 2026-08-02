import { RISTORANTE } from '@/dati/ristorante'
import { classi } from '@/lib/utili'

/**
 * Marchio del ristorante.
 *
 * È disegnato come SVG inline invece che come immagine: resta nitido a
 * qualunque dimensione, eredita il colore del testo (quindi funziona sia sopra
 * le fotografie sia sul fondo chiaro) e non aggiunge una richiesta di rete.
 */
export function Marchio({
  className,
  soloSimbolo = false,
}: {
  className?: string
  soloSimbolo?: boolean
}) {
  return (
    <span className={classi('inline-flex items-center gap-3', className)}>
      <Simbolo className="h-9 w-9 shrink-0 text-accento" />

      {!soloSimbolo && (
        <span className="flex flex-col leading-none">
          <span className="font-titolo text-[1.6rem] font-normal tracking-[0.22em] uppercase">
            {RISTORANTE.nome}
          </span>
          <span className="mt-1 text-[0.55rem] font-medium uppercase tracking-[0.42em] opacity-60">
            Ristorante
          </span>
        </span>
      )}
    </span>
  )
}

/** Il solo simbolo: una «A» stilizzata dentro un rombo dorato. */
export function Simbolo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden focusable="false">
      <path
        d="M20 1.5 38.5 20 20 38.5 1.5 20z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.1"
        opacity="0.55"
      />
      <path
        d="M20 6.5 33.5 20 20 33.5 6.5 20z"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.7"
        opacity="0.3"
      />
      <path
        d="M14.6 26.5 20 12.4l5.4 14.1M16.7 22.3h6.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
