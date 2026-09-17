'use client'

import { useId, type ReactNode } from 'react'
import { classi } from '@/lib/utili'

/**
 * Schede a linguetta.
 *
 * Implementa il modello ARIA per intero: frecce per spostarsi, Home e Fine per
 * andare agli estremi, e solo la linguetta attiva raggiungibile con Tab. È più
 * lavoro di una fila di pulsanti, ed è ciò che distingue un'interfaccia
 * navigabile da tastiera da una che sembra esserlo.
 */

export type Scheda<T extends string> = {
  id: T
  etichetta: string
  contenuto?: ReactNode
  /** Numero mostrato accanto all'etichetta: biglietti, risultati, ordini. */
  conteggio?: number
}

export function Schede<T extends string>({
  schede,
  attiva,
  onCambia,
  className,
  etichetta,
}: {
  schede: Scheda<T>[]
  attiva: T
  onCambia: (id: T) => void
  className?: string
  etichetta: string
}) {
  const base = useId()

  function tastiera(evento: React.KeyboardEvent, indice: number) {
    const ultimi = schede.length - 1
    let prossimo: number | null = null

    if (evento.key === 'ArrowRight') prossimo = indice === ultimi ? 0 : indice + 1
    if (evento.key === 'ArrowLeft') prossimo = indice === 0 ? ultimi : indice - 1
    if (evento.key === 'Home') prossimo = 0
    if (evento.key === 'End') prossimo = ultimi

    if (prossimo === null) return
    evento.preventDefault()
    onCambia(schede[prossimo].id)
    document.getElementById(`${base}-${schede[prossimo].id}`)?.focus()
  }

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={etichetta}
        className="senza-barra flex gap-1 overflow-x-auto border-b border-bordo"
      >
        {schede.map((scheda, indice) => {
          const selezionata = scheda.id === attiva
          return (
            <button
              key={scheda.id}
              id={`${base}-${scheda.id}`}
              role="tab"
              type="button"
              aria-selected={selezionata}
              aria-controls={`${base}-pannello-${scheda.id}`}
              tabIndex={selezionata ? 0 : -1}
              onClick={() => onCambia(scheda.id)}
              onKeyDown={(evento) => tastiera(evento, indice)}
              className={classi(
                'relative shrink-0 whitespace-nowrap px-4 py-3 text-[0.88rem] font-medium transition-colors duration-200',
                selezionata ? 'text-accento' : 'text-tenue hover:text-testo',
              )}
            >
              {scheda.etichetta}
              {typeof scheda.conteggio === 'number' && (
                <span className="ml-2 rounded-full bg-superficie-alt px-2 py-0.5 text-[0.7rem] tabellare">
                  {scheda.conteggio}
                </span>
              )}
              {selezionata && (
                <span className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-accento" />
              )}
            </button>
          )
        })}
      </div>

      {schede.map((scheda) =>
        scheda.contenuto === undefined ? null : (
          <div
            key={scheda.id}
            id={`${base}-pannello-${scheda.id}`}
            role="tabpanel"
            aria-labelledby={`${base}-${scheda.id}`}
            hidden={scheda.id !== attiva}
            tabIndex={0}
            className="pt-6 focus:outline-none"
          >
            {scheda.id === attiva && scheda.contenuto}
          </div>
        ),
      )}
    </div>
  )
}
