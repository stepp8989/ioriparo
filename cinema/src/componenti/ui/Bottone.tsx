import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { classi } from '@/lib/utili'

/**
 * Pulsante della piattaforma, in sei varianti.
 *
 * Rende un `<a>` quando riceve `href`, un `<button>` altrimenti: così un
 * invito all'azione che porta a un'altra pagina resta un collegamento vero,
 * navigabile da tastiera e apribile in una nuova scheda.
 *
 * Forma: angoli appena smussati, non pillola. La pillola è la forma dei
 * prodotti software; un pulsante «Acquista» di un circuito di sale è un
 * rettangolo netto, e accanto alle locandine — che sono rettangoli — sta meglio.
 *
 * `className` si aggiunge alle classi di base, non le sostituisce: per
 * mostrare o nascondere il pulsante a certe larghezze agite su un contenitore
 * esterno, perché due utilità `display` sullo stesso elemento si
 * contenderebbero la precedenza in base all'ordine del foglio di stile.
 */

type Variante = 'pieno' | 'contorno' | 'chiaro' | 'vetro' | 'tenue' | 'ambra'
type Misura = 'piccola' | 'normale' | 'grande'

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-tenue font-testo font-semibold ' +
  'tracking-[0.01em] transition-colors duration-200 ' +
  'disabled:pointer-events-none disabled:opacity-45'

const VARIANTI: Record<Variante, string> = {
  // Rosso pieno: l'azione principale, che in questo sito è quasi sempre
  // «acquista». Non va usata due volte nella stessa schermata.
  pieno: 'bg-accento text-white hover:bg-accento-forte',
  // Ambra: azione importante ma non commerciale — abbonati, iscriviti al CLUB.
  // Il testo è scuro perché il bianco sull'ambra non arriva a 4,5:1.
  ambra: 'bg-ambra text-notte hover:bg-ambra-forte',
  // Contorno sottile: azione secondaria accanto a quella principale.
  contorno: 'border border-bordo-forte text-testo hover:border-accento hover:text-accento',
  // Chiara: pensata per stare sopra i fondali scuri dei film.
  chiaro: 'bg-white text-notte hover:bg-white/88',
  // Vetro: sopra le immagini, quando non deve rubare la scena all'azione principale.
  vetro: 'vetro-scuro text-white hover:bg-white/15',
  // Tenue: azioni di servizio dentro le schede e nel pannello.
  tenue: 'bg-superficie-alt text-testo border border-bordo hover:border-accento hover:text-accento',
}

const MISURE: Record<Misura, string> = {
  piccola: 'px-3.5 py-1.5 text-[0.78rem]',
  normale: 'px-5 py-2.5 text-[0.85rem]',
  grande: 'px-7 py-3.5 text-[0.92rem]',
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
