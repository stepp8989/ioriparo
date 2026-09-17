import Link from 'next/link'
import { classi } from '@/lib/utili'

/**
 * Marchio.
 *
 * Il simbolo è un diaframma stilizzato: sei lamelle che si chiudono attorno a
 * un centro luminoso. È l'unico elemento grafico proprietario del progetto,
 * disegnato per questo marchio e non ripreso da nessuno — nessun logo
 * esistente, nessuna catena reale.
 *
 * Il nome non è disegnato: è testo, e arriva dalle impostazioni. Cambiare
 * «CINEMAX» in qualcos'altro dal pannello cambia l'intestazione, il piè di
 * pagina, i biglietti e le email senza toccare un file grafico — che è tutto
 * il motivo per cui il nome non sta dentro l'SVG.
 */
export function Simbolo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id="marchio-sfumatura" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--accento-1)" />
          <stop offset="100%" stopColor="var(--accento-2)" />
        </linearGradient>
      </defs>

      <circle
        cx="16"
        cy="16"
        r="14"
        fill="none"
        stroke="url(#marchio-sfumatura)"
        strokeWidth="2"
      />

      {/* Sei lamelle disposte a raggiera: la rotazione è calcolata, non disegnata
          sei volte a mano, così il simbolo resta simmetrico al pixel. */}
      <g fill="url(#marchio-sfumatura)" opacity="0.92">
        {Array.from({ length: 6 }, (_, indice) => (
          <path
            key={indice}
            d="M16 16 L16 3.2 A12.8 12.8 0 0 1 27.1 9.6 Z"
            transform={`rotate(${indice * 60} 16 16)`}
            opacity={indice % 2 === 0 ? 0.95 : 0.55}
          />
        ))}
      </g>

      <circle cx="16" cy="16" r="3.6" fill="var(--sfondo)" />
    </svg>
  )
}

export function Marchio({
  nome,
  claim,
  className,
  href = '/',
  compatto = false,
}: {
  nome: string
  claim?: string
  className?: string
  href?: string
  compatto?: boolean
}) {
  return (
    <Link
      href={href}
      className={classi('group inline-flex items-center gap-3', className)}
      aria-label={`${nome}, torna alla pagina iniziale`}
    >
      <Simbolo className={compatto ? 'size-7' : 'size-9'} />
      <span className="leading-none">
        <span
          className={classi(
            'block font-titolo font-bold tracking-[0.2em]',
            compatto ? 'text-[1rem]' : 'text-[1.15rem]',
          )}
        >
          {nome}
        </span>
        {claim && !compatto && (
          <span className="mt-1 block text-[0.6rem] uppercase tracking-[0.24em] text-tenue">
            {claim}
          </span>
        )}
      </span>
    </Link>
  )
}
