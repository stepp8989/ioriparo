'use client'

import type { ElementType, ReactNode } from 'react'
import { useRivela } from '@/componenti/effetti/ganci'
import { cn } from '@/lib/utili'

type Tipo = 'basso' | 'scala' | 'sinistra' | 'destra' | 'fuoco'

const CLASSI: Record<Tipo, string> = {
  basso: 'rivela',
  scala: 'rivela rivela-scala',
  sinistra: 'rivela rivela-sinistra',
  destra: 'rivela rivela-destra',
  fuoco: 'rivela-fuoco',
}

type Props = {
  children: ReactNode
  /** Da dove arriva. `fuoco` entra a fuoco da una sfocatura: per i titoli. */
  tipo?: Tipo
  /** Ritardo in millisecondi: scala le comparse di una fila di elementi. */
  ritardo?: number
  className?: string
  /** Elemento generato. Utile per non rompere griglie e liste. */
  come?: ElementType
  id?: string
}

/**
 * Fa comparire il contenuto quando entra nello schermo.
 *
 * Il contenuto è sempre nel documento — cambia solo l'aspetto — quindi resta
 * leggibile dai lettori di schermo e dai motori di ricerca anche prima della
 * comparsa, e chi ha chiesto meno movimento lo vede subito al suo posto.
 */
export function Rivela({
  children,
  tipo = 'basso',
  ritardo = 0,
  className,
  come: Come = 'div',
  id,
}: Props) {
  const riferimento = useRivela<HTMLElement>()

  return (
    <Come
      id={id}
      ref={riferimento}
      className={cn(CLASSI[tipo], className)}
      style={ritardo ? ({ '--ritardo': `${ritardo}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Come>
  )
}
