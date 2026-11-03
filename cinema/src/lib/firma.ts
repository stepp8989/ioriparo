import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'

/**
 * Firme e cookie firmati: la base comune del pannello, dell'area personale e
 * dei biglietti con QR.
 *
 * Il cookie non è cifrato ma è firmato con HMAC-SHA256: chiunque può leggerne
 * il contenuto, nessuno può modificarlo senza conoscere il segreto. Dentro ci
 * finiscono solo un identificativo e una scadenza, mai dati personali.
 *
 * Lo stesso meccanismo firma il contenuto dei QR: il codice stampato sul
 * biglietto porta con sé una firma che la maschera all'ingresso può verificare,
 * così un biglietto contraffatto viene riconosciuto anche senza collegamento
 * al database.
 */

/**
 * Segreto di firma. In sviluppo se ne genera uno volatile — comodo, ma le
 * sessioni cadono a ogni riavvio; in produzione va impostato, altrimenti la
 * firma resta vuota e nessuna sessione viene mai riconosciuta.
 */
export const SEGRETO =
  process.env.PANNELLO_SEGRETO ??
  (process.env.NODE_ENV === 'production' ? '' : randomBytes(32).toString('hex'))

/**
 * Segreto dedicato ai biglietti.
 *
 * È separato da quello delle sessioni di proposito: cambiare la password del
 * pannello, e con essa il segreto dei cookie, non deve invalidare i biglietti
 * già venduti per gli spettacoli della settimana. Se non è impostato si ripiega
 * su quello generale, che è comunque meglio di nessuna firma.
 */
const SEGRETO_BIGLIETTI = process.env.BIGLIETTI_SEGRETO || SEGRETO

/** Confronto a tempo costante: non rivela quanti caratteri sono corretti. */
export function confrontoSicuro(atteso: string, ricevuto: string): boolean {
  const a = Buffer.from(atteso)
  const b = Buffer.from(ricevuto)
  if (a.length !== b.length) {
    // Si confronta comunque qualcosa per non far dipendere il tempo dalla lunghezza.
    timingSafeEqual(a, a)
    return false
  }
  return timingSafeEqual(a, b)
}

function firma(contenuto: string, segreto = SEGRETO): string {
  return createHmac('sha256', segreto).update(contenuto).digest('base64url')
}

/**
 * Firma breve per i biglietti: dieci caratteri.
 *
 * Non è una firma crittografica completa, ed è una scelta consapevole: il QR
 * deve restare leggibile da una fotocamera di servizio anche stampato male, e
 * ogni carattere in più allarga la matrice. Dieci caratteri base64url sono
 * sessanta bit, abbastanza perché indovinarli a tentativi sia impraticabile —
 * e comunque la verifica all'ingresso controlla anche che la prenotazione
 * esista, sia pagata e non sia già stata usata.
 */
export function firmaBiglietto(contenuto: string): string {
  return firma(contenuto, SEGRETO_BIGLIETTI).slice(0, 10)
}

/** Verifica la firma di un biglietto letto dal QR. */
export function firmaBigliettoValida(contenuto: string, ricevuta: string): boolean {
  if (!SEGRETO_BIGLIETTI) return false
  return confrontoSicuro(firmaBiglietto(contenuto), ricevuta)
}

/**
 * Scrive un cookie firmato con la scadenza indicata.
 *
 * Il contrassegno `secure` segue il protocollo con cui è arrivata la richiesta:
 * sotto HTTPS il cookie viaggia solo cifrato, mentre su `http://` (sviluppo o
 * anteprima in rete locale) resta utilizzabile, perché un cookie `secure`
 * inviato su HTTP verrebbe semplicemente scartato dal browser.
 */
export async function scriviCookieFirmato(
  nome: string,
  valore: string,
  durataOre: number,
): Promise<void> {
  const scadenza = Date.now() + durataOre * 3_600_000
  const contenuto = `${scadenza}.${valore}`
  const [deposito, intestazioni] = await Promise.all([cookies(), headers()])
  const protocollo = intestazioni.get('x-forwarded-proto')?.split(',')[0].trim()

  deposito.set(nome, `${contenuto}.${firma(contenuto)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: protocollo === 'https',
    path: '/',
    maxAge: durataOre * 3600,
  })
}

/**
 * Legge un cookie firmato e ne restituisce il contenuto, oppure `null` se
 * manca, se la firma non torna o se la scadenza è passata.
 */
export async function leggiCookieFirmato(nome: string): Promise<string | null> {
  if (!SEGRETO) return null

  const valore = (await cookies()).get(nome)?.value
  if (!valore) return null

  const separatore = valore.lastIndexOf('.')
  if (separatore < 1) return null

  const contenuto = valore.slice(0, separatore)
  const firmaRicevuta = valore.slice(separatore + 1)
  if (!confrontoSicuro(firma(contenuto), firmaRicevuta)) return null

  const punto = contenuto.indexOf('.')
  if (punto < 1) return null

  const scadenza = Number(contenuto.slice(0, punto))
  if (!Number.isFinite(scadenza) || scadenza <= Date.now()) return null

  return contenuto.slice(punto + 1)
}

/** Cancella un cookie di sessione. */
export async function cancellaCookie(nome: string): Promise<void> {
  const deposito = await cookies()
  deposito.delete(nome)
}
