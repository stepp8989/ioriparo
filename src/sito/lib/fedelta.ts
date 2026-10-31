import { useEffect, useState } from 'react'
import { useGestionale } from '@/data/store'
import { regoleFedelta } from '@/lib/fedelta'
import { archivioOnline, leggiRegoleFedelta } from '@/lib/supabase'
import type { RegoleFedelta } from '@/types'

/**
 * Codice invito ricevuto da un amico, ricordato su questo dispositivo.
 *
 * Chi apre il link d'invito di solito non prenota subito: torna giorni dopo,
 * magari dalla home. Il codice resta qui e viene allegato da solo alla prima
 * richiesta di preventivo o appuntamento, così lo sconto non si perde.
 */
const CHIAVE_INVITO = 'ioriparo_invito'

/** Codice pratica dell'ultima tessera aperta, per riaprirla dall'app. */
export const CHIAVE_TESSERA = 'ioriparo_tessera'

export function ricordaInvito(codice: string) {
  try {
    localStorage.setItem(CHIAVE_INVITO, codice)
  } catch {
    /* storage non disponibile: il codice si può sempre dire in negozio */
  }
}

export function invitoRicordato(): string {
  try {
    return localStorage.getItem(CHIAVE_INVITO) ?? ''
  } catch {
    return ''
  }
}

/**
 * Regole del programma come le ha impostate il laboratorio.
 *
 * Con l'archivio online arrivano dal database; senza, dall'archivio locale.
 * Finché la risposta non arriva valgono quelle predefinite, che sono anche
 * quelle con cui parte il gestionale.
 */
export function useRegoleFedelta(): RegoleFedelta {
  const { db } = useGestionale()
  const [online, setOnline] = useState<Partial<RegoleFedelta> | null>(null)

  useEffect(() => {
    if (!archivioOnline) return
    let attivo = true
    void leggiRegoleFedelta().then((r) => {
      if (attivo && r) setOnline(r as Partial<RegoleFedelta>)
    })
    return () => {
      attivo = false
    }
  }, [])

  return regoleFedelta(archivioOnline ? online : db.azienda.fedelta)
}
