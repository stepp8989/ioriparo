import 'server-only'
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'

/**
 * Cookie firmati: la base comune del pannello di amministrazione e dell'area
 * clienti.
 *
 * Il cookie non è cifrato ma è firmato con HMAC-SHA256: chiunque può leggerne
 * il contenuto, nessuno può modificarlo senza conoscere il segreto. Dentro ci
 * finiscono solo un identificativo e una scadenza, mai dati personali.
 */

/**
 * Segreto di firma. In sviluppo se ne genera uno volatile — comodo, ma le
 * sessioni cadono a ogni riavvio; in produzione va impostato, altrimenti la
 * firma resta vuota e nessuna sessione viene mai riconosciuta.
 */
export const SEGRETO =
  process.env.PANNELLO_SEGRETO ??
  (process.env.NODE_ENV === 'production' ? '' : randomBytes(32).toString('hex'))

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

function firma(contenuto: string): string {
  return createHmac('sha256', SEGRETO).update(contenuto).digest('base64url')
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
