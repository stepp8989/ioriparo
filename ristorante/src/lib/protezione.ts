import 'server-only'

/**
 * Difese di base per le rotte pubbliche.
 *
 * Sono volutamente semplici: un contatore in memoria per limitare gli invii
 * ripetuti e una ripulitura del testo in arrivo. Bastano per un sito di questa
 * dimensione; dietro a un bilanciatore con più istanze conviene spostare il
 * conteggio su Redis o su un servizio dedicato, perché ogni istanza ha il
 * proprio contatore.
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
export function troppeRichieste(chiave: string, massimo = 5, minuti = 10): boolean {
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
 * lunghezza massima e toglie i caratteri di controllo, che nei testi legittimi
 * non compaiono mai e negli archivi creano solo problemi.
 */
export function testoPulito(valore: unknown, lunghezzaMassima = 200): string {
  if (typeof valore !== 'string') return ''
  return (
    valore
      // Caratteri di controllo ASCII: sostituiti con uno spazio.
      .replace(/[\u0000-\u001f\u007f]/g, ' ')
      .trim()
      .slice(0, lunghezzaMassima)
  )
}

/** Converte in numero intero dentro un intervallo, con valore di ripiego. */
export function numeroIntero(valore: unknown, minimo: number, massimo: number, ripiego: number): number {
  const numero = Math.trunc(Number(valore))
  if (!Number.isFinite(numero)) return ripiego
  return Math.min(Math.max(numero, minimo), massimo)
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
