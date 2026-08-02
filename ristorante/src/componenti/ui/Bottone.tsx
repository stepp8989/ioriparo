import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { classi } from '@/lib/utili'

/**
 * Pulsante del sito, in tre varianti.
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

type Variante = 'pieno' | 'contorno' | 'chiaro'
type Misura = 'normale' | 'grande'

const BASE =
  'group relative inline-flex items-center justify-center gap-2.5 font-testo font-medium uppercase ' +
  'tracking-[0.16em] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ' +
  'disabled:pointer-events-none disabled:opacity-50 rounded-[2px] overflow-hidden'

const VARIANTI: Record<Variante, string> = {
  // Dorato pieno: l'azione principale della pagina.
  pieno:
    'bg-accento text-white shadow-morbida hover:shadow-rilievo hover:-translate-y-0.5 ' +
    'hover:bg-accento-forte scuro:text-notte',
  // Contorno sottile: azione secondaria accanto a quella principale.
  contorno:
    'border border-current text-testo hover:border-accento hover:text-accento hover:-translate-y-0.5',
  // Chiara: pensata per stare sopra le fotografie scure.
  chiaro:
    'border border-white/45 text-white backdrop-blur-[2px] hover:bg-white hover:text-notte hover:-translate-y-0.5',
}

const MISURE: Record<Misura, string> = {
  normale: 'px-6 py-3 text-[0.72rem]',
  grande: 'px-8 py-4 text-[0.78rem]',
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

  if ('href' in resto && resto.href) {
    return (
      <Link {...(resto as PropsLink)} className={stile}>
        {children}
      </Link>
    )
  }

  return (
    <button {...(resto as PropsPulsante)} className={stile}>
      {children}
    </button>
  )
}
