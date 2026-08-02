import 'server-only'
import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto'
import { cookies, headers } from 'next/headers'

/**
 * Accesso al pannello di amministrazione.
 *
 * Il pannello ha un solo utente — lo staff del ristorante — quindi non serve
 * un archivio di account: basta una password condivisa e un cookie firmato.
 * Il cookie contiene solo la scadenza e la firma HMAC: non essendo cifrato ma
 * essendo firmato, non può essere alterato lato client.
 *
 * Variabili d'ambiente (vedi `.env.example`):
 *   PANNELLO_PASSWORD  password d'accesso
 *   PANNELLO_SEGRETO   chiave usata per firmare il cookie
 */

const NOME_COOKIE = 'aurea_sessione'
const DURATA_ORE = 12

/** Segreto di firma: in sviluppo se ne genera uno volatile, in produzione va impostato. */
const SEGRETO =
  process.env.PANNELLO_SEGRETO ??
  (process.env.NODE_ENV === 'production' ? '' : randomBytes(32).toString('hex'))

/** Password d'accesso: senza variabile d'ambiente vale il valore di prova. */
const PASSWORD = process.env.PANNELLO_PASSWORD ?? 'aurea'

/** Confronto a tempo costante: non rivela quanti caratteri sono corretti. */
function confrontoSicuro(atteso: string, ricevuto: string): boolean {
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

/** Verifica la password inserita nel modulo di accesso. */
export function passwordCorretta(tentativo: string): boolean {
  if (!PASSWORD) return false
  return confrontoSicuro(PASSWORD, tentativo)
}

/**
 * Il pannello è utilizzabile solo se password e segreto di firma esistono.
 * In produzione senza `PANNELLO_SEGRETO` il cookie verrebbe emesso ma mai
 * riconosciuto valido, e l'accesso resterebbe bloccato senza spiegazione:
 * meglio dirlo subito e chiaramente.
 */
export function configurazioneCompleta(): boolean {
  return Boolean(SEGRETO) && Boolean(PASSWORD)
}

/**
 * Crea il cookie di sessione dopo un accesso riuscito.
 *
 * Il contrassegno `secure` segue il protocollo con cui è arrivata la
 * richiesta: sotto HTTPS il cookie viaggia solo cifrato, mentre su `http://`
 * (sviluppo o anteprima in rete locale) resta utilizzabile, perché un cookie
 * `secure` inviato su HTTP verrebbe semplicemente scartato dal browser.
 */
export async function apriSessione(): Promise<void> {
  const scadenza = Date.now() + DURATA_ORE * 3600_000
  const contenuto = String(scadenza)
  const [deposito, intestazioni] = await Promise.all([cookies(), headers()])
  const protocollo = intestazioni.get('x-forwarded-proto')?.split(',')[0].trim()

  deposito.set(NOME_COOKIE, `${contenuto}.${firma(contenuto)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: protocollo === 'https',
    path: '/',
    maxAge: DURATA_ORE * 3600,
  })
}

/** Cancella il cookie di sessione. */
export async function chiudiSessione(): Promise<void> {
  const deposito = await cookies()
  deposito.delete(NOME_COOKIE)
}

/** Vero se la richiesta arriva da una sessione valida e non scaduta. */
export async function sessioneAttiva(): Promise<boolean> {
  if (!SEGRETO) return false

  const valore = (await cookies()).get(NOME_COOKIE)?.value
  if (!valore) return false

  const separatore = valore.lastIndexOf('.')
  if (separatore < 1) return false

  const contenuto = valore.slice(0, separatore)
  const firmaRicevuta = valore.slice(separatore + 1)
  if (!confrontoSicuro(firma(contenuto), firmaRicevuta)) return false

  const scadenza = Number(contenuto)
  return Number.isFinite(scadenza) && scadenza > Date.now()
}

/**
 * Da usare all'inizio di ogni rotta API riservata.
 * Restituisce `null` se la sessione è valida, altrimenti la risposta 401 da
 * restituire subito al chiamante.
 */
export async function bloccaSeNonAutenticato(): Promise<Response | null> {
  if (await sessioneAttiva()) return null
  return Response.json({ errore: 'Accesso non autorizzato.' }, { status: 401 })
}
