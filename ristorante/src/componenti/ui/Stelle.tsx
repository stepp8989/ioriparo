'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Valutazione in stelle.
 *
 * Le stelle compaiono una dopo l'altra quando entrano nella finestra; il
 * valore resta comunque leggibile a chi usa uno screen reader grazie
 * all'etichetta testuale.
 */
export function Stelle({
  voto,
  dimensione = 'size-4',
  animate = true,
  className,
}: {
  voto: number
  dimensione?: string
  animate?: boolean
  className?: string
}) {
  const menoMovimento = useReducedMotion()
  const anima = animate && !menoMovimento

  return (
    <div
      className={classi('flex items-center gap-1 text-accento', className)}
      role="img"
      aria-label={`Valutazione ${voto} su 5`}
    >
      {[1, 2, 3, 4, 5].map((posizione) => (
        <motion.span
          key={posizione}
          initial={anima ? { opacity: 0, scale: 0.4, rotate: -35 } : false}
          whileInView={anima ? { opacity: 1, scale: 1, rotate: 0 } : undefined}
          viewport={{ once: true }}
          transition={{
            delay: posizione * 0.07,
            type: 'spring',
            stiffness: 320,
            damping: 18,
          }}
          className={classi('block', posizione > Math.round(voto) && 'opacity-25')}
        >
          <Icona nome={posizione <= Math.round(voto) ? 'stella' : 'stellaVuota'} className={dimensione} />
        </motion.span>
      ))}
    </div>
  )
}
