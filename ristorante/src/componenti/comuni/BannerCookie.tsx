'use client'

import Link from 'next/link'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { useConsenso } from '@/componenti/comuni/Consenso'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Banner del consenso ai cookie.
 *
 * Accettare e rifiutare hanno lo stesso peso visivo, come richiesto dalle
 * linee guida del Garante: nessun pulsante è nascosto o reso meno evidente
 * dell'altro. Da «Personalizza» si sceglie categoria per categoria.
 */
export function BannerCookie() {
  const { deciso, inLettura, consenso, salva } = useConsenso()
  const [dettagli, setDettagli] = useState(false)
  const [scelta, setScelta] = useState(consenso)
  const menoMovimento = useReducedMotion()

  const visibile = !inLettura && !deciso

  return (
    <AnimatePresence>
      {visibile && (
        <motion.div
          role="dialog"
          aria-modal="false"
          aria-labelledby="titolo-cookie"
          className="fixed inset-x-3 bottom-3 z-[70] sm:inset-x-6 sm:bottom-6 no-stampa"
          initial={{ opacity: 0, y: menoMovimento ? 0 : 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: menoMovimento ? 0 : 40 }}
          transition={{ duration: menoMovimento ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mx-auto max-w-4xl border border-bordo bg-superficie p-6 shadow-rilievo sm:p-8">
            <div className="flex items-start gap-4">
              <span className="mt-0.5 hidden text-accento sm:block" aria-hidden>
                <Icona nome="foglia" className="size-6" />
              </span>

              <div className="flex-1">
                <h2 id="titolo-cookie" className="font-titolo text-2xl">
                  Rispettiamo le tue scelte
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-tenue">
                  Usiamo cookie tecnici, indispensabili al funzionamento del sito. Solo con il tuo
                  consenso attiviamo le statistiche anonime e i contenuti esterni come la mappa.
                  Trovi i dettagli nella{' '}
                  <Link href="/cookie-policy" className="text-accento underline underline-offset-4">
                    Cookie Policy
                  </Link>
                  .
                </p>

                {dettagli && (
                  <div className="mt-6 space-y-3">
                    <Categoria
                      titolo="Cookie tecnici"
                      testo="Necessari alla navigazione, alla prenotazione e al ricordo del tema scelto."
                      attivo
                      bloccato
                    />
                    <Categoria
                      titolo="Statistiche"
                      testo="Conteggio anonimo delle visite per capire quali pagine sono più utili."
                      attivo={scelta.statistiche}
                      onChange={(valore) => setScelta({ ...scelta, statistiche: valore })}
                    />
                    <Categoria
                      titolo="Contenuti esterni"
                      testo="Mappa di Google e riquadri social incorporati nelle pagine."
                      attivo={scelta.esterni}
                      onChange={(valore) => setScelta({ ...scelta, esterni: valore })}
                    />
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={() => salva({ statistiche: true, esterni: true })}
                    className="inline-flex items-center justify-center bg-accento px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-accento-forte scuro:text-notte"
                  >
                    Accetta tutti
                  </button>

                  <button
                    type="button"
                    onClick={() => salva({ statistiche: false, esterni: false })}
                    className="inline-flex items-center justify-center border border-bordo-forte px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors hover:border-accento hover:text-accento"
                  >
                    Rifiuta tutti
                  </button>

                  {dettagli ? (
                    <button
                      type="button"
                      onClick={() => salva(scelta)}
                      className="inline-flex items-center justify-center border border-bordo-forte px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors hover:border-accento hover:text-accento"
                    >
                      Salva le scelte
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDettagli(true)}
                      className="text-sm text-tenue underline underline-offset-4 transition-colors hover:text-accento sm:ml-auto"
                    >
                      Personalizza
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Singola categoria di cookie, con interruttore accessibile da tastiera. */
function Categoria({
  titolo,
  testo,
  attivo,
  bloccato = false,
  onChange,
}: {
  titolo: string
  testo: string
  attivo: boolean
  bloccato?: boolean
  onChange?: (valore: boolean) => void
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-4 border border-bordo bg-superficie-alt p-4 ${
        bloccato ? 'cursor-default opacity-70' : ''
      }`}
    >
      <input
        type="checkbox"
        checked={attivo}
        disabled={bloccato}
        onChange={(evento) => onChange?.(evento.target.checked)}
        className="mt-1 size-4 accent-[var(--accento)]"
      />
      <span>
        <span className="block text-sm font-medium">
          {titolo}
          {bloccato && <span className="ml-2 text-xs text-tenue">sempre attivi</span>}
        </span>
        <span className="mt-1 block text-sm text-tenue">{testo}</span>
      </span>
    </label>
  )
}

/** Collegamento per riaprire le preferenze, usato nella Cookie Policy. */
export function RiapriPreferenze() {
  const { riapri } = useConsenso()
  return (
    <button
      type="button"
      onClick={riapri}
      className="inline-flex items-center gap-2 border border-bordo-forte px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors hover:border-accento hover:text-accento"
    >
      <Icona nome="ingranaggio" className="size-4" />
      Modifica le preferenze cookie
    </button>
  )
}
