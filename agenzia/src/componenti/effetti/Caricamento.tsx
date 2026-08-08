'use client'

import { useEffect, useState } from 'react'
import { AGENZIA } from '@/dati/agenzia'
import { useMovimentoRidotto } from '@/componenti/effetti/ganci'

/**
 * Schermata di apertura.
 *
 * Il sito comincia dal nero, con una particella che si accende e si allarga:
 * è il primo pezzo della scena del portale, che poi prosegue nell'apertura
 * vera e propria.
 *
 * Tre cautele, perché una schermata di caricamento fatta male è solo un
 * ostacolo fra il visitatore e il contenuto:
 *
 *  * dura al massimo un secondo, sempre, anche se qualcosa va storto;
 *  * si toglie di mezzo al primo tocco, tasto o rotella;
 *  * copre una pagina che è già completa sotto: il contenuto è nel documento
 *    dall'inizio, quindi motori di ricerca e lettori di schermo non aspettano
 *    nessuno.
 *
 * Con movimento ridotto non compare affatto.
 */
export function Caricamento() {
  const ridotto = useMovimentoRidotto()
  const [fase, setFase] = useState<'attesa' | 'uscita' | 'finita'>('attesa')

  useEffect(() => {
    if (ridotto) {
      setFase('finita')
      return
    }

    const chiudi = () => setFase((precedente) => (precedente === 'attesa' ? 'uscita' : precedente))

    const tempo = window.setTimeout(chiudi, 1000)
    window.addEventListener('wheel', chiudi, { passive: true, once: true })
    window.addEventListener('touchstart', chiudi, { passive: true, once: true })
    window.addEventListener('keydown', chiudi, { once: true })

    return () => {
      window.clearTimeout(tempo)
      window.removeEventListener('wheel', chiudi)
      window.removeEventListener('touchstart', chiudi)
      window.removeEventListener('keydown', chiudi)
    }
  }, [ridotto])

  useEffect(() => {
    if (fase !== 'uscita') return
    const tempo = window.setTimeout(() => setFase('finita'), 750)
    return () => window.clearTimeout(tempo)
  }, [fase])

  // Finché il velo è alzato la pagina non deve scorrere sotto di esso.
  useEffect(() => {
    if (fase === 'finita') return
    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = precedente
    }
  }, [fase])

  if (fase === 'finita') return null

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-[90] grid place-items-center bg-fondo transition-opacity duration-700"
      style={{ opacity: fase === 'uscita' ? 0 : 1 }}
    >
      <div className="relative grid place-items-center">
        {/* La particella: un punto che si accende e pulsa. */}
        <span
          className="absolute h-2 w-2 rounded-full bg-blu-chiaro"
          style={{ boxShadow: '0 0 30px 6px rgb(59 130 246 / .9)', animation: 'respiro 1.1s ease-in-out infinite' }}
        />
        {/* Due anelli che si allargano: l'inizio del portale. */}
        {[0, 0.45].map((ritardo) => (
          <span
            key={ritardo}
            className="absolute h-24 w-24 rounded-full border border-viola/50"
            style={{ animation: `pulsa-anello 1.8s ease-out ${ritardo}s infinite` }}
          />
        ))}

        <span
          className="absolute top-24 text-[11px] font-medium uppercase tracking-[0.42em] text-tenue"
          style={{ animation: 'dissolvi .8s ease .25s both' }}
        >
          {AGENZIA.nome}
        </span>
      </div>
    </div>
  )
}
