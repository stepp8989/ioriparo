import 'server-only'

/**
 * Difese di base per le rotte pubbliche.
 *
 * Un contatore in memoria per limitare gli invii ripetuti e una ripulitura del
 * testo in arrivo. Dietro a un bilanciatore con più istanze il conteggio va
 * spostato su Redis o su un servizio dedicato, perché ogni istanza ha il
 * proprio contatore: finché la biglietteria gira su un processo solo questo
 * basta, e serve soprattutto a rendere impraticabile l'indovinare codici di
 * prenotazione e gift card a forza bruta.
 *
 * Qui non c'è difesa contro SQL injection perché non c'è SQL costruito con
 * stringhe: il deposito PostgreSQL usa esclusivamente query parametriche
 * (`$1`, `$2`), e i valori non vengono mai interpolati nel testo della query.
 * La protezione XSS è quella di React, che tratta come testo tutto ciò che
 * finisce in JSX; nel progetto non compare `dangerouslySetInnerHTML` su
 * contenuti provenienti dall'archivio. Contro il CSRF valgono `SameSite=Lax`
 * sui cookie di sessione e il fatto che ogni operazione che modifica dati
 * passa da `POST`/`PUT`/`PATCH`/`DELETE` con corpo JSON.
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
export function numeroIntero(
  valore: unknown,
  minimo: number,
  massimo: number,
  ripiego: number,
): number {
  const numero = Math.trunc(Number(valore))
  if (!Number.isFinite(numero)) return ripiego
  return Math.min(Math.max(numero, minimo), massimo)
}

/** Come `numeroIntero`, ma conserva i decimali: prezzi, consumi, potenze. */
export function numeroDecimale(
  valore: unknown,
  minimo: number,
  massimo: number,
  ripiego: number,
): number {
  const numero = Number(valore)
  if (!Number.isFinite(numero)) return ripiego
  return Math.min(Math.max(numero, minimo), massimo)
}

/** Vero se il valore è una delle voci ammesse: restringe anche il tipo. */
export function fraLeVoci<T extends string>(valore: unknown, voci: readonly T[]): valore is T {
  return typeof valore === 'string' && (voci as readonly string[]).includes(valore)
}

/** Elenco di testi puliti, con un tetto al numero di voci. */
export function elencoPulito(valore: unknown, massimo = 40, lunghezza = 120): string[] {
  if (!Array.isArray(valore)) return []
  return valore
    .map((voce) => testoPulito(voce, lunghezza))
    .filter(Boolean)
    .slice(0, massimo)
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

/** Data nel formato `AAAA-MM-GG`, oppure stringa vuota se non lo è. */
export function dataPulita(valore: unknown): string {
  const testo = testoPulito(valore, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(testo)) return ''
  // `2026-02-31` supera il controllo di forma ma non esiste: lo scarta il Date.
  const data = new Date(`${testo}T12:00:00Z`)
  return Number.isNaN(data.getTime()) || data.toISOString().slice(0, 10) !== testo ? '' : testo
}

/** Ora nel formato `HH:MM` su 24 ore, oppure stringa vuota. */
export function oraPulita(valore: unknown): string {
  const testo = testoPulito(valore, 5)
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(testo) ? testo : ''
}

/**
 * Codice inserito dal cliente — promo, gift card, prenotazione — normalizzato
 * in maiuscolo senza spazi né trattini, così «bc2 f-4k» e «BC2F4K» sono lo
 * stesso codice.
 */
export function codicePulito(valore: unknown, lunghezzaMassima = 24): string {
  return testoPulito(valore, lunghezzaMassima + 12)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, lunghezzaMassima)
}

/** Colore esadecimale `#rrggbb`, con valore di ripiego se non lo è. */
export function colorePulito(valore: unknown, ripiego: string): string {
  const testo = testoPulito(valore, 7)
  return /^#[0-9a-fA-F]{6}$/.test(testo) ? testo.toLowerCase() : ripiego
}
