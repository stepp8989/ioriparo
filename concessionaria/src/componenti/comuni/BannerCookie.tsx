'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useConsenso } from '@/componenti/comuni/Consenso'
import { Bottone } from '@/componenti/ui/Bottone'

/**
 * Banner del consenso ai cookie.
 *
 * Compare solo quando la scelta non è ancora stata fatta, e le due azioni
 * hanno lo stesso peso visivo: rifiutare deve costare quanto accettare.
 * Il ritardo di comparsa serve a non coprire il contenuto nel primo istante
 * di lettura, che è anche il momento in cui il browser sta ancora disegnando.
 */
export function BannerCookie() {
  const { stato, accetta, rifiuta } = useConsenso()
  const [visibile, setVisibile] = useState(false)

  useEffect(() => {
    if (stato !== 'ignoto') {
      setVisibile(false)
      return
    }

    const attesa = setTimeout(() => setVisibile(true), 1200)
    return () => clearTimeout(attesa)
  }, [stato])

  if (stato !== 'ignoto') return null

  return (
    <div
      role="dialog"
      aria-label="Informativa sui cookie"
      aria-live="polite"
      className={`no-stampa fixed inset-x-3 bottom-3 z-[70] transition-all duration-500 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md ${
        visibile ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <div className="vetro rounded-ampio p-6 shadow-rilievo">
        <h2 className="font-titolo text-[1.05rem] font-semibold">Cookie e riservatezza</h2>
        <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">
          Usiamo cookie tecnici, indispensabili al funzionamento del sito. Con il vostro consenso
          attiviamo anche le statistiche anonime e la mappa di Google nella pagina Contatti.
          Maggiori informazioni nella{' '}
          <Link href="/cookie-policy" className="text-accento sottolinea">
            cookie policy
          </Link>
          .
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <Bottone onClick={accetta} misura="piccola" className="flex-1">
            Accetta tutti
          </Bottone>
          <Bottone onClick={rifiuta} variante="contorno" misura="piccola" className="flex-1">
            Solo necessari
          </Bottone>
        </div>
      </div>
    </div>
  )
}
