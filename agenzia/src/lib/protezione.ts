import 'server-only'

/**
 * Difese di base della rotta pubblica.
 *
 * Sono volutamente semplici: un contatore in memoria contro gli invii ripetuti
 * e una ripulitura del testo in arrivo. Bastano per un sito di questa
 * dimensione; dietro a un bilanciatore con più istanze il conteggio va
 * spostato su un archivio condiviso, perché ogni istanza tiene il proprio.
 */

type Finestra = { conteggio: number; scadenza: number }

const finestre = new Map<string, Finestra>()

/** Ogni tanto si liberano le finestre scadute, per non far crescere la mappa. */
function pulisci(ora: number) {
  if (finestre.size < 500) return
  for (const [chiave, finestra] of finestre) {
    if (finestra.scadenza <= ora) finestre.delete(chiave)
  }
}

/**
 * Consente al massimo `massimo` richieste ogni `minuti` per una data chiave.
 * Restituisce `true` quando la richiesta va bloccata.
 */
export function troppeRichieste(chiave: string, massimo = 4, minuti = 15): boolean {
  const ora = Date.now()
  pulisci(ora)

  const finestra = finestre.get(chiave)

  if (!finestra || finestra.scadenza <= ora) {
    finestre.set(chiave, { conteggio: 1, scadenza: ora + minuti * 60_000 })
    return false
  }

  finestra.conteggio += 1
  return finestra.conteggio > massimo
}

/** Identifica il chiamante dalle intestazioni del proxy, con ripiego generico. */
export function chiamante(richiesta: Request): string {
  const inoltrato = richiesta.headers.get('x-forwarded-for')
  if (inoltrato) return inoltrato.split(',')[0].trim()
  return richiesta.headers.get('x-real-ip') ?? 'sconosciuto'
}

/**
 * Normalizza un testo ricevuto dall'esterno: taglia gli spazi, impone una
 * lunghezza massima e sostituisce i caratteri di controllo, che nei testi
 * legittimi non compaiono mai e negli archivi creano solo problemi.
 */
export function testoPulito(valore: unknown, lunghezzaMassima = 200): string {
  if (typeof valore !== 'string') return ''

  let ripulito = ''
  for (const carattere of valore) {
    const codice = carattere.codePointAt(0) ?? 0
    ripulito += codice < 32 || codice === 127 ? ' ' : carattere
  }

  return ripulito.trim().slice(0, lunghezzaMassima)
}

/** Legge il corpo JSON senza far cadere la rotta se il corpo non è valido. */
export async function corpoJson(richiesta: Request): Promise<Record<string, unknown>> {
  try {
    const dati = await richiesta.json()
    return typeof dati === 'object' && dati !== null ? (dati as Record<string, unknown>) : {}
  } catch {
    return {}
  }
}
