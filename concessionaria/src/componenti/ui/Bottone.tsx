import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { classi } from '@/lib/utili'

/**
 * Pulsante del sito, in cinque varianti.
 *
 * Rende un `<a>` quando riceve `href`, un `<button>` altrimenti: così un
 * invito all'azione che porta a un'altra pagina resta un collegamento vero,
 * navigabile da tastiera e apribile in una nuova scheda.
 *
 * `className` si aggiunge alle classi di base, non le sostituisce: per
 * mostrare o nascondere il pulsante a certe larghezze agite su un contenitore
 * esterno, perché due utilità `display` sullo stesso elemento si
 * contenderebbero la precedenza in base all'ordine del foglio di stile.
 */

type Variante = 'pieno' | 'contorno' | 'chiaro' | 'vetro' | 'tenue'
type Misura = 'piccola' | 'normale' | 'grande'

const BASE =
  'group relative inline-flex items-center justify-center gap-2.5 font-testo font-semibold ' +
  'transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] rounded-full overflow-hidden ' +
  'disabled:pointer-events-none disabled:opacity-50'

const VARIANTI: Record<Variante, string> = {
  // Blu pieno: l'azione principale della pagina.
  pieno:
    'bg-accento text-white shadow-accento hover:-translate-y-0.5 hover:bg-accento-forte ' +
    'active:translate-y-0',
  // Contorno sottile: azione secondaria accanto a quella principale.
  contorno:
    'border border-bordo-forte text-testo hover:border-accento hover:text-accento hover:-translate-y-0.5',
  // Chiara: pensata per stare sopra le fotografie scure.
  chiaro: 'bg-white text-notte hover:-translate-y-0.5 hover:bg-white/90',
  // Vetro: sopra le fotografie, quando non deve rubare la scena all'azione principale.
  vetro: 'vetro-scuro text-white hover:-translate-y-0.5 hover:bg-white/15',
  // Tenue: azioni di servizio dentro le schede.
  tenue: 'bg-superficie-alt text-testo border border-bordo hover:border-accento hover:text-accento',
}

const MISURE: Record<Misura, string> = {
  piccola: 'px-4 py-2 text-[0.8rem]',
  normale: 'px-6 py-3 text-[0.875rem]',
  grande: 'px-8 py-4 text-[0.95rem]',
}

type Comune = {
  variante?: Variante
  misura?: Misura
  className?: string
  children: ReactNode
}

type PropsLink = Comune & Omit<ComponentProps<typeof Link>, 'className' | 'children'>
type PropsPulsante = Comune & Omit<ComponentProps<'button'>, 'className' | 'children'>

export function Bottone(props: PropsLink | PropsPulsante) {
  const { variante = 'pieno', misura = 'normale', className, children, ...resto } = props
  const stile = classi(BASE, VARIANTI[variante], MISURE[misura], className)

  // Riflesso che attraversa il pulsante al passaggio del puntatore: solo sulle
  // varianti piene, dove si vede, e sempre fuori dal flusso del contenuto.
  const riflesso =
    variante === 'pieno' || variante === 'chiaro' ? (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 -left-full w-1/3 bg-white/25 blur-md transition-none group-hover:animate-[riflesso_0.9s_ease-out]"
      />
    ) : null

  if ('href' in resto && resto.href) {
    return (
      <Link {...(resto as PropsLink)} className={stile}>
        {riflesso}
        <span className="relative inline-flex items-center gap-2.5">{children}</span>
      </Link>
    )
  }

  return (
    <button {...(resto as PropsPulsante)} className={stile}>
      {riflesso}
      <span className="relative inline-flex items-center gap-2.5">{children}</span>
    </button>
  )
}
