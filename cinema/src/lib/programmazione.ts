/**
 * Programmazione: conflitti di sala e costruzione del palinsesto.
 *
 * Il vincolo che conta è uno solo, e non è negoziabile: in una sala non
 * possono esserci due proiezioni sovrapposte. Il controllo tiene conto della
 * durata del film e di un margine di pulizia fra uno spettacolo e l'altro,
 * perché fra i titoli di coda e l'ingresso del pubblico successivo passa
 * comunque un quarto d'ora reale.
 */

import type { Film, Sala, Spettacolo } from '@/lib/tipi'
import { istanteSpettacolo, oraFine } from '@/lib/utili'

/** Minuti di pubblicità e trailer prima dell'inizio effettivo del film. */
export const MINUTI_PUBBLICITA = 15

/** Minuti fra la fine di una proiezione e l'inizio della successiva. */
export const MINUTI_PULIZIA = 15

/** Intervallo occupato da uno spettacolo, in millisecondi. */
export function finestraSpettacolo(
  spettacolo: Pick<Spettacolo, 'data' | 'ora'>,
  durataFilm: number,
): { inizio: number; fine: number } {
  const inizio = istanteSpettacolo(spettacolo.data, spettacolo.ora).getTime()
  const fine = inizio + (MINUTI_PUBBLICITA + durataFilm + MINUTI_PULIZIA) * 60_000
  return { inizio, fine }
}

/** Ora in cui la sala torna libera: è quella che l'editor mostra all'operatore. */
export function oraLiberazione(ora: string, durataFilm: number): string {
  return oraFine(ora, durataFilm, MINUTI_PUBBLICITA + MINUTI_PULIZIA)
}

/**
 * Cerca uno spettacolo già programmato che si sovrapponga a quello proposto.
 *
 * Restituisce lo spettacolo in conflitto, oppure `null`. Il confronto avviene
 * solo dentro la stessa sala: due film alla stessa ora in sale diverse sono la
 * normalità, non un errore.
 */
export function conflittoDiSala(
  proposta: Pick<Spettacolo, 'salaId' | 'data' | 'ora'> & { id?: string },
  esistenti: Spettacolo[],
  filmPerId: Map<string, Film>,
  durataProposta: number,
): Spettacolo | null {
  const finestra = finestraSpettacolo(proposta, durataProposta)

  for (const spettacolo of esistenti) {
    if (spettacolo.salaId !== proposta.salaId) continue
    if (spettacolo.id === proposta.id) continue
    if (spettacolo.stato === 'annullato') continue

    const durata = filmPerId.get(spettacolo.filmId)?.durataMinuti ?? 120
    const altra = finestraSpettacolo(spettacolo, durata)

    // Due intervalli si sovrappongono se ciascuno inizia prima che l'altro
    // finisca. Scritto così non servono casi particolari per il contenimento.
    if (finestra.inizio < altra.fine && altra.inizio < finestra.fine) return spettacolo
  }

  return null
}

/**
 * Verifica che la sala sappia proiettare il formato richiesto.
 *
 * Programmare un IMAX in una sala che non lo è non produce un conflitto di
 * orario ma un rimborso: è un errore che va intercettato quando lo si
 * commette, non alla cassa.
 */
export function formatoCompatibile(sala: Sala, formato: string): boolean {
  // Una sala senza formati dichiarati è una sala normale: proietta in 2D.
  if (sala.formati.length === 0) return formato === '2D'
  return sala.formati.includes(formato as Sala['formati'][number])
}

/** Ordina gli spettacoli per data e ora: è l'ordine di ogni elenco pubblico. */
export function perOrario(a: Spettacolo, b: Spettacolo): number {
  return a.data === b.data ? a.ora.localeCompare(b.ora) : a.data.localeCompare(b.data)
}

/**
 * Spettacoli ancora acquistabili, raggruppati per giorno.
 *
 * Esclude gli annullati e quelli già iniziati: un orario delle 17:30 mostrato
 * alle 19:00 è solo un modo per far perdere tempo a chi legge.
 */
export function orariUtili(
  spettacoli: Spettacolo[],
  chiusuraMinuti: number,
  adesso = new Date(),
): Spettacolo[] {
  return spettacoli
    .filter((spettacolo) => {
      if (spettacolo.stato === 'annullato') return false
      const inizio = istanteSpettacolo(spettacolo.data, spettacolo.ora).getTime()
      return inizio - adesso.getTime() > chiusuraMinuti * 60_000
    })
    .sort(perOrario)
}
