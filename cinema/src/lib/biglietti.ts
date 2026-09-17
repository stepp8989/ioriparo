import 'server-only'
import { firmaBiglietto, firmaBigliettoValida } from '@/lib/firma'
import type { Archivio, Prenotazione, PostoPrenotato } from '@/lib/tipi'
import { istanteSpettacolo } from '@/lib/utili'

/**
 * Biglietti digitali: contenuto del QR, emissione e verifica all'ingresso.
 *
 * Ogni poltrona è un biglietto a sé con il proprio QR. Sembra più laborioso di
 * un solo codice per prenotazione, ed è invece l'unica forma che regge la
 * realtà di una sala: quattro persone che arrivano separatamente devono poter
 * entrare separatamente, e la maschera deve poter dire «questo posto è già
 * entrato» invece di «questa prenotazione è già entrata».
 *
 * Il contenuto del QR è volutamente corto e leggibile:
 *
 *     CMX1|<prenotazione>|<biglietto>|<firma>
 *
 * Niente dati personali, niente indirizzi: chi fotografa il biglietto di un
 * altro non ricava nulla sul suo conto. La firma è un HMAC troncato calcolato
 * con `BIGLIETTI_SEGRETO`, e permette di scartare un codice inventato prima
 * ancora di interrogare l'archivio.
 */

/** Prefisso di versione: se un giorno il formato cambia, i vecchi QR restano
 *  riconoscibili e si può decidere cosa farne. */
const PREFISSO = 'CMX1'

/** Contenuto da stampare nel QR di un singolo posto. */
export function contenutoQr(codicePrenotazione: string, codiceBiglietto: string): string {
  const corpo = `${codicePrenotazione}|${codiceBiglietto}`
  return `${PREFISSO}|${corpo}|${firmaBiglietto(corpo)}`
}

/** Esito della lettura di un QR: o si entra, o si sa esattamente perché no. */
export type EsitoVerifica =
  | {
      valido: true
      prenotazione: Prenotazione
      posto: PostoPrenotato
      /** Già presente all'ingresso: si segnala, non si nega l'accesso da soli. */
      giaUsato: boolean
      messaggio: string
    }
  | { valido: false; motivo: string }

/**
 * Verifica un QR letto all'ingresso.
 *
 * Non modifica nulla: la marcatura del biglietto come utilizzato è un'azione
 * separata, perché la maschera deve poter leggere un codice per controllarlo
 * senza consumarlo — per esempio quando un cliente chiede conferma di essere
 * nella sala giusta prima dell'orario.
 */
export function verificaQr(archivio: Archivio, contenuto: string, adesso = new Date()): EsitoVerifica {
  const parti = contenuto.trim().split('|')

  if (parti.length !== 4 || parti[0] !== PREFISSO) {
    return { valido: false, motivo: 'Codice non riconosciuto: non è un biglietto di questa rete.' }
  }

  const [, codicePrenotazione, codiceBiglietto, firma] = parti

  if (!firmaBigliettoValida(`${codicePrenotazione}|${codiceBiglietto}`, firma)) {
    return { valido: false, motivo: 'Firma non valida: il biglietto è stato alterato o contraffatto.' }
  }

  const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codicePrenotazione)
  if (!prenotazione) {
    return { valido: false, motivo: 'Prenotazione inesistente.' }
  }

  const posto = prenotazione.posti.find((voce) => voce.codiceBiglietto === codiceBiglietto)
  if (!posto) {
    return { valido: false, motivo: 'Il posto indicato non appartiene a questa prenotazione.' }
  }

  if (prenotazione.stato === 'annullata') {
    return { valido: false, motivo: 'Prenotazione annullata.' }
  }
  if (prenotazione.stato === 'rimborsata') {
    return { valido: false, motivo: 'Prenotazione rimborsata: il biglietto non è più valido.' }
  }
  if (prenotazione.stato === 'in-attesa') {
    return { valido: false, motivo: 'Pagamento non completato: il biglietto non è stato emesso.' }
  }

  // Un biglietto vale per il suo spettacolo, non per la giornata: si accetta
  // da un'ora prima dell'inizio fino a mezz'ora dopo la fine prevista, che è
  // la finestra in cui una persona può ragionevolmente presentarsi.
  const inizio = istanteSpettacolo(prenotazione.data, prenotazione.ora)
  const minutiDaInizio = (adesso.getTime() - inizio.getTime()) / 60_000

  if (minutiDaInizio < -60) {
    return {
      valido: false,
      motivo: `Troppo presto: lo spettacolo inizia alle ${prenotazione.ora} del ${prenotazione.data}.`,
    }
  }
  if (minutiDaInizio > 300) {
    return { valido: false, motivo: 'Spettacolo terminato: il biglietto è scaduto.' }
  }

  return {
    valido: true,
    prenotazione,
    posto,
    giaUsato: Boolean(posto.utilizzatoIl),
    messaggio: posto.utilizzatoIl
      ? 'Biglietto già utilizzato: verificare con il cliente.'
      : 'Biglietto valido.',
  }
}

/**
 * Segna un biglietto come utilizzato.
 *
 * Restituisce `false` se era già stato usato, così il chiamante può distinguere
 * la prima lettura da quelle successive senza rileggere l'archivio.
 */
export function timbraBiglietto(
  prenotazione: Prenotazione,
  codiceBiglietto: string,
  adesso = new Date(),
): boolean {
  const posto = prenotazione.posti.find((voce) => voce.codiceBiglietto === codiceBiglietto)
  if (!posto || posto.utilizzatoIl) return false

  posto.utilizzatoIl = adesso.toISOString()
  prenotazione.aggiornataIl = posto.utilizzatoIl

  // Quando tutti i posti sono entrati la prenotazione è conclusa: serve alle
  // statistiche di affluenza, che contano gli ingressi e non i biglietti
  // venduti — la differenza fra i due numeri è il tasso di mancata presenza,
  // ed è uno dei pochi dati su cui si può davvero agire.
  if (prenotazione.posti.every((voce) => voce.utilizzatoIl)) {
    prenotazione.stato = 'utilizzata'
  }

  return true
}
