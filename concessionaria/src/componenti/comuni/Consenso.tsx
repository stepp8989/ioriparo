'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Consenso ai cookie non necessari.
 *
 * Un solo stato governa tutto ciò che tocca servizi terzi: statistiche e mappa
 * incorporata. Finché la scelta non è stata fatta, o se è negativa, quei
 * contenuti non vengono nemmeno inseriti nella pagina — non basta non
 * inizializzarli, perché il solo caricamento dello script deposita già dati.
 *
 * La scelta resta in `localStorage`: non è un cookie, quindi non viaggia a
 * ogni richiesta, e sopravvive alla chiusura del browser.
 */

export type StatoConsenso = 'ignoto' | 'accettato' | 'rifiutato'

type Contesto = {
  stato: StatoConsenso
  accetta: () => void
  rifiuta: () => void
  /** Riapre il banner: serve al collegamento nella cookie policy. */
  riapri: () => void
}

const CHIAVE = 'consenso-cookie'

const ContestoConsenso = createContext<Contesto>({
  stato: 'ignoto',
  accetta: () => undefined,
  rifiuta: () => undefined,
  riapri: () => undefined,
})

export function ProviderConsenso({ children }: { children: ReactNode }) {
  /**
   * Si parte sempre da `ignoto`, anche quando la scelta è già salvata: il
   * server non può leggere `localStorage`, e disegnare qualcosa di diverso al
   * primo giro provocherebbe un disallineamento di idratazione. Il valore
   * vero arriva subito dopo, nell'effetto.
   */
  const [stato, setStato] = useState<StatoConsenso>('ignoto')

  useEffect(() => {
    try {
      const salvato = localStorage.getItem(CHIAVE)
      if (salvato === 'accettato' || salvato === 'rifiutato') setStato(salvato)
    } catch {
      // Archiviazione non disponibile: la scelta vale per questa visita.
    }
  }, [])

  const registra = useCallback((prossimo: StatoConsenso) => {
    setStato(prossimo)
    try {
      if (prossimo === 'ignoto') localStorage.removeItem(CHIAVE)
      else localStorage.setItem(CHIAVE, prossimo)
    } catch {
      // Come sopra.
    }
  }, [])

  const valore = useMemo<Contesto>(
    () => ({
      stato,
      accetta: () => registra('accettato'),
      rifiuta: () => registra('rifiutato'),
      riapri: () => registra('ignoto'),
    }),
    [stato, registra],
  )

  return <ContestoConsenso.Provider value={valore}>{children}</ContestoConsenso.Provider>
}

export function useConsenso(): Contesto {
  return useContext(ContestoConsenso)
}
