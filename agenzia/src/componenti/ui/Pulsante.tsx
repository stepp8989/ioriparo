import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utili'

/**
 * Pulsanti del sito.
 *
 * Tre aspetti soltanto, perché una gerarchia con più di tre livelli smette di
 * essere una gerarchia:
 *
 *   principale  sfumatura piena, si accende sotto il puntatore
 *   contorno    vetro e bordo, per l'azione secondaria
 *   fantasma    solo testo, per i collegamenti di servizio
 *
 * Tutti hanno un'area di tocco di almeno 44 pixel di lato, che è la misura
 * sotto la quale un pulsante diventa difficile da centrare con il pollice.
 * L'aspetto è condiviso fra `<a>` e `<button>`: cambia il tag, non lo stile.
 */

type Aspetto = 'principale' | 'contorno' | 'fantasma'

const BASE =
  'group relative inline-flex min-h-[3rem] items-center justify-center gap-2.5 overflow-hidden ' +
  // `whitespace-nowrap`: dentro un contenitore stretto l'etichetta andava a
  // capo in mezzo alla parola, e un pulsante su due righe sembra rotto.
  'whitespace-nowrap rounded-full px-7 text-[0.95rem] font-medium tracking-tight transition-all duration-300 ' +
  'focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-55'

const ASPETTI: Record<Aspetto, string> = {
  principale:
    'text-white shadow-[0_10px_40px_-14px_rgb(59_130_246/.9)] ' +
    'hover:shadow-[0_16px_60px_-12px_rgb(139_92_246/.95)] hover:-translate-y-0.5',
  contorno:
    'vetro text-testo hover:border-blu/60 hover:bg-white/[.07] hover:-translate-y-0.5 ' +
    'hover:shadow-[0_12px_44px_-18px_rgb(59_130_246/.8)]',
  fantasma: 'text-tenue hover:text-testo',
}

type Comune = {
  children: ReactNode
  aspetto?: Aspetto
  className?: string
  /** Icona a destra del testo: una freccia, di solito. */
  coda?: ReactNode
}

type PropsBottone = Comune & ComponentPropsWithoutRef<'button'> & { come?: 'button' }
type PropsLink = Comune & ComponentPropsWithoutRef<'a'> & { come: 'a' }

export function Pulsante(props: PropsBottone | PropsLink) {
  const { children, aspetto = 'principale', className, coda, come = 'button', ...resto } = props as
    | PropsBottone
    | PropsLink

  const contenuto = (
    <>
      {/* Sfumatura di fondo del pulsante principale. */}
      {aspetto === 'principale' ? (
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(100deg,var(--blu-cupo),var(--blu)_35%,var(--viola))]"
          />
          {/* Bagliore che attraversa il pulsante al passaggio del puntatore. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgb(255_255_255/.35),transparent)] transition-transform duration-700 group-hover:translate-x-full"
          />
        </>
      ) : null}

      <span className="relative z-10 inline-flex items-center gap-2.5">
        {children}
        {coda ? (
          <span className="transition-transform duration-300 group-hover:translate-x-1">{coda}</span>
        ) : null}
      </span>
    </>
  )

  const classi = cn(BASE, ASPETTI[aspetto], className)

  if (come === 'a') {
    return (
      <a {...(resto as ComponentPropsWithoutRef<'a'>)} className={classi} data-cursore="pulsante">
        {contenuto}
      </a>
    )
  }

  return (
    <button
      {...(resto as ComponentPropsWithoutRef<'button'>)}
      className={classi}
      data-cursore="pulsante"
    >
      {contenuto}
    </button>
  )
}
