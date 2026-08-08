'use client'

import { useEffect, useRef, useState } from 'react'
import { fra, useMovimentoRidotto, usePuntatoreFine } from '@/componenti/effetti/ganci'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Cursore su misura
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Due pezzi: un punto che segue il mouse esattamente e un anello che lo insegue
 * con un po' di ritardo. Sopra un elemento marcato `data-cursore` l'anello si
 * allarga e, se l'elemento porta anche `data-etichetta`, mostra una parola —
 * è così che sulla vetrina compare «Vedi progetto» dentro l'anello.
 *
 * Non viene montato affatto dove non c'è un vero puntatore o dove è stato
 * chiesto meno movimento: su telefono e tablet resta il comportamento di
 * sistema, e nessuno si ritrova senza cursore per colpa di un effetto.
 *
 * Gli elementi si dichiarano da soli con un attributo, senza registrarsi da
 * nessuna parte: un solo ascoltatore delegato sul documento basta per tutta la
 * pagina, anche per ciò che compare più tardi.
 */
export function Cursore() {
  const puntatoreFine = usePuntatoreFine()
  const ridotto = useMovimentoRidotto()
  const attivo = puntatoreFine && !ridotto

  const punto = useRef<HTMLDivElement>(null)
  const anello = useRef<HTMLDivElement>(null)
  const [etichetta, setEtichetta] = useState('')
  const [stato, setStato] = useState<'fermo' | 'attivo' | 'premuto'>('fermo')
  const [visibile, setVisibile] = useState(false)

  useEffect(() => {
    if (!attivo) return

    document.body.classList.add('cursore-su-misura')

    const bersaglio = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const seguace = { ...bersaglio }
    let fotogramma = 0

    const muovi = (evento: PointerEvent) => {
      if (evento.pointerType !== 'mouse') return
      bersaglio.x = evento.clientX
      bersaglio.y = evento.clientY
      setVisibile(true)
    }

    const ciclo = () => {
      // L'anello insegue: 0,18 è la quota che dà peso senza far sembrare il
      // cursore incollato al mouse.
      seguace.x = fra(seguace.x, bersaglio.x, 0.18)
      seguace.y = fra(seguace.y, bersaglio.y, 0.18)

      if (punto.current) {
        punto.current.style.transform = `translate3d(${bersaglio.x}px, ${bersaglio.y}px, 0) translate(-50%, -50%)`
      }
      if (anello.current) {
        anello.current.style.transform = `translate3d(${seguace.x}px, ${seguace.y}px, 0) translate(-50%, -50%)`
      }

      fotogramma = requestAnimationFrame(ciclo)
    }

    const entra = (evento: PointerEvent) => {
      const elemento = (evento.target as Element | null)?.closest?.('[data-cursore]')
      if (!elemento) return
      setStato('attivo')
      setEtichetta(elemento.getAttribute('data-etichetta') ?? '')
    }

    const esci = (evento: PointerEvent) => {
      const elemento = (evento.target as Element | null)?.closest?.('[data-cursore]')
      if (!elemento) return
      setStato('fermo')
      setEtichetta('')
    }

    const premi = () => setStato((precedente) => (precedente === 'fermo' ? 'premuto' : precedente))
    const rilascia = () => setStato((precedente) => (precedente === 'premuto' ? 'fermo' : precedente))
    const nascondi = () => setVisibile(false)

    fotogramma = requestAnimationFrame(ciclo)
    document.addEventListener('pointermove', muovi, { passive: true })
    document.addEventListener('pointerover', entra)
    document.addEventListener('pointerout', esci)
    document.addEventListener('pointerdown', premi)
    document.addEventListener('pointerup', rilascia)
    document.addEventListener('pointerleave', nascondi)

    return () => {
      cancelAnimationFrame(fotogramma)
      document.body.classList.remove('cursore-su-misura')
      document.removeEventListener('pointermove', muovi)
      document.removeEventListener('pointerover', entra)
      document.removeEventListener('pointerout', esci)
      document.removeEventListener('pointerdown', premi)
      document.removeEventListener('pointerup', rilascia)
      document.removeEventListener('pointerleave', nascondi)
    }
  }, [attivo])

  if (!attivo) return null

  const dimensione = stato === 'attivo' ? (etichetta ? 104 : 58) : stato === 'premuto' ? 26 : 34

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[100]">
      <div
        ref={punto}
        className="fixed left-0 top-0 h-1.5 w-1.5 rounded-full bg-blu-chiaro transition-opacity duration-300"
        style={{
          opacity: visibile && stato !== 'attivo' ? 1 : 0,
          boxShadow: '0 0 12px 2px rgb(59 130 246 / .8)',
        }}
      />
      <div
        ref={anello}
        className="fixed left-0 top-0 grid place-items-center rounded-full border border-blu-chiaro/60 backdrop-blur-[2px]"
        style={{
          width: dimensione,
          height: dimensione,
          opacity: visibile ? 1 : 0,
          background: etichetta ? 'rgb(59 130 246 / .16)' : 'transparent',
          boxShadow: stato === 'attivo' ? '0 0 26px -4px rgb(139 92 246 / .9)' : 'none',
          transition:
            'width .32s cubic-bezier(.16,1,.3,1), height .32s cubic-bezier(.16,1,.3,1), opacity .3s, background .3s, box-shadow .3s',
        }}
      >
        {etichetta ? (
          <span className="px-2 text-center text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-testo">
            {etichetta}
          </span>
        ) : null}
      </div>
    </div>
  )
}
