'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { useMovimentoRidotto, usePuntatoreFine } from '@/componenti/effetti/ganci'
import { cn } from '@/lib/utili'

type Props = {
  children: ReactNode
  /** Quanto l'elemento si lascia attrarre, in pixel al bordo dell'area. */
  forza?: number
  /** Quanto l'area di attrazione supera l'elemento, in pixel. */
  raggio?: number
  className?: string
}

/**
 * Attrazione magnetica.
 *
 * L'elemento si sposta verso il puntatore quando il puntatore gli passa
 * vicino, e torna al suo posto quando si allontana. È l'effetto che fa sembrare
 * «vivi» i pulsanti principali.
 *
 * L'ascolto avviene sulla finestra e non sull'elemento, perché l'attrazione
 * deve cominciare *prima* di arrivarci sopra: aspettare `pointerenter`
 * significherebbe far scattare l'effetto quando il mouse è già a destinazione.
 * Per non pagarlo, l'ascoltatore è unico per elemento, passivo, e ogni calcolo
 * è raccolto in un fotogramma.
 *
 * Su schermi tattili e con movimento ridotto non si aggancia niente: resta un
 * contenitore normale.
 */
export function Magnetico({ children, forza = 14, raggio = 90, className }: Props) {
  const riferimento = useRef<HTMLDivElement>(null)
  const puntatoreFine = usePuntatoreFine()
  const ridotto = useMovimentoRidotto()

  useEffect(() => {
    const elemento = riferimento.current
    if (!elemento || !puntatoreFine || ridotto) return

    let inCoda = false
    let ultimo: PointerEvent | null = null

    const applica = () => {
      inCoda = false
      if (!ultimo) return

      const misura = elemento.getBoundingClientRect()
      const centroX = misura.left + misura.width / 2
      const centroY = misura.top + misura.height / 2
      const dx = ultimo.clientX - centroX
      const dy = ultimo.clientY - centroY

      const distanza = Math.hypot(dx, dy)
      const limite = Math.max(misura.width, misura.height) / 2 + raggio

      if (distanza > limite) {
        elemento.style.transform = 'translate3d(0, 0, 0)'
        return
      }

      const quota = 1 - distanza / limite
      elemento.style.transform = `translate3d(${((dx / limite) * forza * quota).toFixed(2)}px, ${((dy / limite) * forza * quota).toFixed(2)}px, 0)`
    }

    const muovi = (evento: PointerEvent) => {
      if (evento.pointerType !== 'mouse') return
      ultimo = evento
      if (inCoda) return
      inCoda = true
      requestAnimationFrame(applica)
    }

    window.addEventListener('pointermove', muovi, { passive: true })
    return () => {
      window.removeEventListener('pointermove', muovi)
      elemento.style.transform = ''
    }
  }, [forza, raggio, puntatoreFine, ridotto])

  return (
    <div
      ref={riferimento}
      className={cn('inline-block will-change-transform', className)}
      style={{ transition: 'transform .35s cubic-bezier(.16,1,.3,1)' }}
    >
      {children}
    </div>
  )
}
