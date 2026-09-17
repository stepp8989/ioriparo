'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Barra dei filtri.
 *
 * I filtri vivono nell'indirizzo, non nello stato del componente. È una scelta
 * con conseguenze concrete: una ricerca filtrata si può salvare fra i
 * preferiti e mandare a qualcuno, il tasto «indietro» torna al filtro
 * precedente invece di uscire dalla pagina, e il risultato lo calcola il
 * server — quindi la pagina filtrata è indicizzabile e non richiede
 * JavaScript per mostrare qualcosa.
 *
 * Qui dentro c'è solo la scrittura dell'indirizzo; il filtro vero lo applica
 * la pagina.
 */

export type Filtro = {
  chiave: string
  etichetta: string
  voci: { valore: string; etichetta: string }[]
}

export function Filtri({
  filtri,
  className,
  conteggio,
}: {
  filtri: Filtro[]
  className?: string
  /** Numero di risultati, annunciato agli screen reader a ogni cambio. */
  conteggio?: number
}) {
  const router = useRouter()
  const percorso = usePathname()
  const parametri = useSearchParams()

  const aggiorna = useCallback(
    (chiave: string, valore: string) => {
      const prossimi = new URLSearchParams(parametri.toString())
      if (valore) prossimi.set(chiave, valore)
      else prossimi.delete(chiave)

      const stringa = prossimi.toString()
      // `scroll: false`: cambiare un filtro non deve riportare in cima una
      // pagina lunga: chi filtra sta guardando i risultati, non l'intestazione.
      router.replace(stringa ? `${percorso}?${stringa}` : percorso, { scroll: false })
    },
    [parametri, percorso, router],
  )

  const attivi = filtri.filter((filtro) => parametri.get(filtro.chiave))

  return (
    <div className={classi('space-y-4', className)}>
      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-tenue">
          <Icona nome="filtro" className="size-4" />
          Filtra
        </span>

        {filtri.map((filtro) => {
          const valore = parametri.get(filtro.chiave) ?? ''
          return (
            <label key={filtro.chiave} className="relative">
              <span className="sr-only">{filtro.etichetta}</span>
              <select
                value={valore}
                onChange={(evento) => aggiorna(filtro.chiave, evento.target.value)}
                className={classi(
                  'appearance-none rounded-full border py-2 pl-4 pr-9 text-[0.84rem] transition-colors focus:border-accento focus:outline-none',
                  valore
                    ? 'border-accento bg-accento/10 text-accento'
                    : 'border-bordo bg-superficie text-tenue hover:border-bordo-forte',
                )}
              >
                <option value="">{filtro.etichetta}</option>
                {filtro.voci.map((voce) => (
                  <option key={voce.valore} value={voce.valore}>
                    {voce.etichetta}
                  </option>
                ))}
              </select>
              <Icona
                nome="chevron"
                className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2"
              />
            </label>
          )
        })}

        {attivi.length > 0 && (
          <button
            type="button"
            onClick={() => router.replace(percorso, { scroll: false })}
            className="inline-flex items-center gap-1.5 rounded-full border border-bordo px-3.5 py-2 text-[0.8rem] text-tenue transition-colors hover:border-errore hover:text-errore"
          >
            <Icona nome="chiudi" className="size-3.5" />
            Azzera
          </button>
        )}
      </div>

      {typeof conteggio === 'number' && (
        <p className="text-[0.85rem] text-tenue" role="status" aria-live="polite">
          {conteggio === 0
            ? 'Nessun risultato con questi filtri.'
            : `${conteggio} ${conteggio === 1 ? 'risultato' : 'risultati'}.`}
        </p>
      )}
    </div>
  )
}
