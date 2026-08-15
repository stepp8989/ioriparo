'use client'

import { motion, useReducedMotion, type Variants } from 'framer-motion'
import type { ElementType, ReactNode } from 'react'

/**
 * Comparsa all'ingresso nella finestra.
 *
 * Tre accorgimenti tengono l'animazione leggera:
 *   • `once` — ogni elemento si anima una volta sola;
 *   • si muovono solo `opacity` e `transform`, che il browser compone sulla GPU
 *     senza ricalcolare il layout;
 *   • chi ha ridotto le animazioni di sistema vede il contenuto già a posto.
 */

type Direzione = 'su' | 'giu' | 'sinistra' | 'destra' | 'nessuna'

const SPOSTAMENTI: Record<Direzione, { x: number; y: number }> = {
  su: { x: 0, y: 28 },
  giu: { x: 0, y: -28 },
  sinistra: { x: 36, y: 0 },
  destra: { x: -36, y: 0 },
  nessuna: { x: 0, y: 0 },
}

type Props = {
  children: ReactNode
  /** Da dove entra il contenuto. */
  da?: Direzione
  /** Ritardo in secondi: serve a scaglionare più elementi vicini. */
  ritardo?: number
  durata?: number
  className?: string
  /** Elemento HTML prodotto: utile per non annidare `div` dentro liste o titoli. */
  come?: ElementType
}

export function Rivela({
  children,
  da = 'su',
  ritardo = 0,
  durata = 0.7,
  className,
  come = 'div',
}: Props) {
  const menoMovimento = useReducedMotion()
  const spostamento = menoMovimento ? SPOSTAMENTI.nessuna : SPOSTAMENTI[da]
  const Componente = motion[come as 'div'] ?? motion.div

  return (
    <Componente
      className={className}
      initial={{ opacity: 0, ...spostamento }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.2, margin: '0px 0px -80px 0px' }}
      transition={{
        duration: menoMovimento ? 0.01 : durata,
        delay: menoMovimento ? 0 : ritardo,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </Componente>
  )
}

/**
 * Variante per gruppi: il contenitore scagliona automaticamente i figli
 * marcati con `FiglioRivelato`, evitando di calcolare i ritardi a mano.
 */
const contenitoreVarianti: Variants = {
  nascosto: {},
  visibile: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
}

export const figlioVarianti: Variants = {
  nascosto: { opacity: 0, y: 26 },
  visibile: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
}

export function GruppoRivelato({
  children,
  className,
  come = 'div',
}: {
  children: ReactNode
  className?: string
  come?: ElementType
}) {
  const menoMovimento = useReducedMotion()
  const Componente = motion[come as 'div'] ?? motion.div

  return (
    <Componente
      className={className}
      variants={contenitoreVarianti}
      initial={menoMovimento ? false : 'nascosto'}
      whileInView="visibile"
      viewport={{ once: true, amount: 0.12, margin: '0px 0px -60px 0px' }}
    >
      {children}
    </Componente>
  )
}

export function FiglioRivelato({
  children,
  className,
  come = 'div',
}: {
  children: ReactNode
  className?: string
  come?: ElementType
}) {
  const Componente = motion[come as 'div'] ?? motion.div
  return (
    <Componente className={className} variants={figlioVarianti}>
      {children}
    </Componente>
  )
}
