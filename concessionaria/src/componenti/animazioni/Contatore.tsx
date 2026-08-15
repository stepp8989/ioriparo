'use client'

import { animate, useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * Numero che sale da zero al suo valore quando entra nella finestra.
 *
 * Il conteggio parte una volta sola. Chi ha ridotto le animazioni di sistema
 * vede subito il valore finale: il dato è il contenuto, l'animazione è solo
 * il modo in cui arriva.
 */
export function Contatore({
  valore,
  durata = 1.6,
  suffisso = '',
  className,
}: {
  valore: number
  durata?: number
  suffisso?: string
  className?: string
}) {
  const riferimento = useRef<HTMLSpanElement>(null)
  const inVista = useInView(riferimento, { once: true, amount: 0.5 })
  const menoMovimento = useReducedMotion()
  const [mostrato, setMostrato] = useState(0)

  useEffect(() => {
    if (!inVista) return

    if (menoMovimento) {
      setMostrato(valore)
      return
    }

    const controlli = animate(0, valore, {
      duration: durata,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (corrente) => setMostrato(Math.round(corrente)),
    })

    // Se il componente sparisce a metà conteggio l'animazione va fermata,
    // altrimenti continuerebbe ad aggiornare uno stato non più montato.
    return () => controlli.stop()
  }, [inVista, menoMovimento, valore, durata])

  return (
    <span ref={riferimento} className={className}>
      {mostrato.toLocaleString('it-IT')}
      {suffisso}
    </span>
  )
}
