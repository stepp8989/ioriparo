'use client'

import { useEffect, useState } from 'react'

/**
 * Lettura di una collezione del pannello.
 *
 * Serve alle pagine che devono riempire un menu a tendina con i dati di
 * un'altra sezione: la programmazione ha bisogno dell'elenco dei film, le
 * promozioni di quello dei cinema. Un `fetch` scritto a mano in ogni pagina
 * funzionerebbe, ma questa forma tiene in un posto solo la gestione
 * dell'errore e dello stato di caricamento.
 */
export function useElenco<T>(endpoint: string): {
  voci: T[]
  caricamento: boolean
  ricarica: () => void
} {
  const [voci, setVoci] = useState<T[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [giro, setGiro] = useState(0)

  useEffect(() => {
    let annullato = false
    setCaricamento(true)

    fetch(endpoint, { cache: 'no-store' })
      .then((risposta) => (risposta.ok ? risposta.json() : { voci: [] }))
      .then((dati) => {
        if (!annullato) setVoci((dati.voci ?? []) as T[])
      })
      .catch(() => {
        if (!annullato) setVoci([])
      })
      .finally(() => {
        if (!annullato) setCaricamento(false)
      })

    return () => {
      annullato = true
    }
  }, [endpoint, giro])

  return { voci, caricamento, ricarica: () => setGiro((precedente) => precedente + 1) }
}

/** Trasforma un elenco in opzioni per un menu a tendina. */
export function inOpzioni<T>(
  voci: T[],
  valore: (voce: T) => string,
  etichetta: (voce: T) => string,
) {
  return voci.map((voce) => ({ valore: valore(voce), etichetta: etichetta(voce) }))
}
