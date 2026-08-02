'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Gestione del consenso ai cookie.
 *
 * Il sito non installa nulla prima della scelta dell'utente: gli script di
 * statistica e la mappa incorporata partono solo se la relativa categoria è
 * stata accettata. I cookie tecnici non sono negoziabili e non richiedono
 * consenso, quindi non compaiono fra le opzioni.
 */

export type Consenso = {
  /** Misurazione anonima delle visite (Google Analytics). */
  statistiche: boolean
  /** Contenuti di terze parti: mappa e riquadri social. */
  esterni: boolean
}

const PREDEFINITO: Consenso = { statistiche: false, esterni: false }
const CHIAVE = 'consenso-cookie'

type Contesto = {
  consenso: Consenso
  /** `false` finché l'utente non ha ancora espresso una scelta. */
  deciso: boolean
  /** `true` mentre si legge la scelta salvata: evita di far lampeggiare il banner. */
  inLettura: boolean
  salva: (scelta: Consenso) => void
  riapri: () => void
}

const ContestoConsenso = createContext<Contesto | null>(null)

export function ProviderConsenso({ children }: { children: ReactNode }) {
  const [consenso, setConsenso] = useState<Consenso>(PREDEFINITO)
  const [deciso, setDeciso] = useState(false)
  const [inLettura, setInLettura] = useState(true)

  useEffect(() => {
    try {
      const salvato = localStorage.getItem(CHIAVE)
      if (salvato) {
        setConsenso({ ...PREDEFINITO, ...(JSON.parse(salvato) as Partial<Consenso>) })
        setDeciso(true)
      }
    } catch {
      // Archiviazione non disponibile: si resta sul rifiuto predefinito.
    }
    setInLettura(false)
  }, [])

  const salva = useCallback((scelta: Consenso) => {
    setConsenso(scelta)
    setDeciso(true)
    try {
      localStorage.setItem(CHIAVE, JSON.stringify(scelta))
    } catch {
      // Se non si può salvare la scelta vale comunque per questa visita.
    }
  }, [])

  const riapri = useCallback(() => setDeciso(false), [])

  const valore = useMemo(
    () => ({ consenso, deciso, inLettura, salva, riapri }),
    [consenso, deciso, inLettura, salva, riapri],
  )

  return <ContestoConsenso.Provider value={valore}>{children}</ContestoConsenso.Provider>
}

export function useConsenso(): Contesto {
  const contesto = useContext(ContestoConsenso)
  if (!contesto) throw new Error('useConsenso va usato dentro ProviderConsenso.')
  return contesto
}
