import { AGENZIA } from '@/dati/agenzia'
import { cn } from '@/lib/utili'

/**
 * Il marchio.
 *
 * È un disegno vettoriale, non un file: pesa poche centinaia di byte, resta
 * nitido su qualunque schermo e prende i colori dal tema. Il simbolo è
 * un'orbita — un nucleo luminoso e un anello inclinato che gli gira intorno —
 * e l'anello ruota piano, ma solo quando il movimento è ammesso (ci pensa la
 * regola globale su `prefers-reduced-motion`).
 *
 * Per usare un logo proprio basta sostituire questo componente con
 * un `<Image src="/marchio/logo.svg" … />`: nessun altro file lo conosce.
 */

/** Quel che resta del nome completo dopo il nome breve: «Orbita» → «Studio». */
const SECONDA_PAROLA = AGENZIA.nomeCompleto.replace(AGENZIA.nome, '').trim()

export function Simbolo({ misura = 34, className }: { misura?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={misura}
      height={misura}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="marchio-sfumatura" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--blu-chiaro)" />
          <stop offset="55%" stopColor="var(--viola)" />
          <stop offset="100%" stopColor="var(--ciano)" />
        </linearGradient>
        <radialGradient id="marchio-nucleo">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="var(--blu-chiaro)" />
          <stop offset="100%" stopColor="var(--blu)" />
        </radialGradient>
      </defs>

      {/* Orbita esterna, inclinata. */}
      <ellipse
        cx="24"
        cy="24"
        rx="21"
        ry="9.5"
        fill="none"
        stroke="url(#marchio-sfumatura)"
        strokeWidth="2"
        transform="rotate(-28 24 24)"
        opacity="0.9"
      />
      {/* Orbita interna, in controparte. */}
      <ellipse
        cx="24"
        cy="24"
        rx="14"
        ry="6.5"
        fill="none"
        stroke="url(#marchio-sfumatura)"
        strokeWidth="1.4"
        transform="rotate(34 24 24)"
        opacity="0.55"
      />
      {/* Nucleo. */}
      <circle cx="24" cy="24" r="6.2" fill="url(#marchio-nucleo)" />
      {/* Satellite sull'orbita esterna. */}
      <circle cx="41" cy="15.5" r="2.6" fill="var(--ciano)" />
    </svg>
  )
}

export function Marchio({
  misura = 34,
  conNome = true,
  className,
}: {
  misura?: number
  conNome?: boolean
  className?: string
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <Simbolo misura={misura} />
      {conNome ? (
        <span className="flex flex-col leading-none">
          <span className="font-titolo text-lg font-semibold tracking-tight text-testo">
            {AGENZIA.nome}
            {/* La seconda parola del nome completo, accesa in sfumatura. */}
            {SECONDA_PAROLA ? <span className="testo-neon"> {SECONDA_PAROLA}</span> : null}
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.28em] text-fioco">
            Web design
          </span>
        </span>
      ) : null}
    </span>
  )
}
