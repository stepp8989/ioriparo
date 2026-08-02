'use client'

import { useInView, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

/**
 * Numero che sale fino al valore finale quando entra nella finestra.
 *
 * Il conteggio usa `requestAnimationFrame` invece di un intervallo fisso, così
 * segue il ritmo di aggiornamento dello schermo e si ferma da solo quando la
 * scheda passa in secondo piano. Chi ha ridotto le animazioni vede subito il
 * numero finale.
 */
export function Contatore({
  valore,
  suffisso = '',
  durata = 1600,
}: {
  valore: number
  suffisso?: string
  durata?: number
}) {
  const riferimento = useRef<HTMLSpanElement>(null)
  const visibile = useInView(riferimento, { once: true, amount: 0.5 })
  const menoMovimento = useReducedMotion()
  const [corrente, setCorrente] = useState(0)

  useEffect(() => {
    if (!visibile) return

    if (menoMovimento) {
      setCorrente(valore)
      return
    }

    let fotogramma = 0
    let inizio: number | null = null

    const passo = (tempo: number) => {
      inizio ??= tempo
      const avanzamento = Math.min((tempo - inizio) / durata, 1)
      // Decelerazione: veloce all'inizio, morbida sul finale.
      const morbido = 1 - Math.pow(1 - avanzamento, 3)
      setCorrente(Math.round(valore * morbido))
      if (avanzamento < 1) fotogramma = requestAnimationFrame(passo)
    }

    fotogramma = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(fotogramma)
  }, [visibile, valore, durata, menoMovimento])

  return (
    <span ref={riferimento}>
      {corrente}
      {suffisso}
    </span>
  )
}
