'use client'

import { useEffect, useRef, useState } from 'react'
import { useInVista, useMovimentoRidotto } from '@/componenti/effetti/ganci'
import { numeroIt } from '@/lib/utili'

type Props = {
  /** Valore di arrivo. */
  a: number
  prefisso?: string
  suffisso?: string
  /** Durata della corsa, in millisecondi. */
  durata?: number
  className?: string
}

/**
 * Numero che sale da zero quando entra nello schermo.
 *
 * Il valore finale è presente nel documento fin dall'inizio per chi legge con
 * un lettore di schermo (`aria-label`), mentre la corsa dei numeri è marcata
 * `aria-hidden`: un contatore che cambia sessanta volte al secondo dentro una
 * regione annunciata sarebbe insopportabile da ascoltare.
 *
 * Con movimento ridotto il numero è semplicemente già arrivato.
 */
export function Contatore({ a, prefisso = '', suffisso = '', durata = 1800, className }: Props) {
  const [riferimento, entrato] = useInVista<HTMLSpanElement>(0.4)
  const ridotto = useMovimentoRidotto()
  const [valore, setValore] = useState(0)
  const partito = useRef(false)

  useEffect(() => {
    if (!entrato || partito.current) return
    partito.current = true

    if (ridotto) {
      setValore(a)
      return
    }

    let fotogramma = 0
    const inizio = performance.now()

    const passo = (istante: number) => {
      const quota = Math.min((istante - inizio) / durata, 1)
      // Rallentamento finale marcato: parte deciso e si posa piano.
      const morbido = 1 - Math.pow(1 - quota, 4)
      setValore(Math.round(a * morbido))

      if (quota < 1) fotogramma = requestAnimationFrame(passo)
    }

    fotogramma = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(fotogramma)
  }, [entrato, a, durata, ridotto])

  const finale = `${prefisso}${numeroIt(a)}${suffisso}`

  return (
    <span ref={riferimento} className={className} aria-label={finale}>
      <span aria-hidden="true">
        {prefisso}
        {numeroIt(valore)}
        {suffisso}
      </span>
    </span>
  )
}
