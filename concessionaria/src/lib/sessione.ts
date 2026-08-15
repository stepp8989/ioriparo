import 'server-only'
import { cancellaCookie, confrontoSicuro, leggiCookieFirmato, scriviCookieFirmato, SEGRETO } from '@/lib/firma'

/**
 * Accesso al pannello di amministrazione.
 *
 * Il pannello ha un solo utente — lo staff della concessionaria — quindi non
 * serve un archivio di account: basta una password condivisa e un cookie
 * firmato.
 *
 * Variabili d'ambiente (vedi `.env.example`):
 *   PANNELLO_PASSWORD  password d'accesso
 *   PANNELLO_SEGRETO   chiave usata per firmare i cookie
 */

const NOME_COOKIE = 'aurora_pannello'
const DURATA_ORE = 12

/** Password d'accesso: senza variabile d'ambiente vale il valore di prova. */
const PASSWORD = process.env.PANNELLO_PASSWORD ?? 'aurora'

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

/** Crea il cookie di sessione dopo un accesso riuscito. */
export async function apriSessione(): Promise<void> {
  await scriviCookieFirmato(NOME_COOKIE, 'staff', DURATA_ORE)
}

/** Cancella il cookie di sessione. */
export async function chiudiSessione(): Promise<void> {
  await cancellaCookie(NOME_COOKIE)
}

/** Vero se la richiesta arriva da una sessione valida e non scaduta. */
export async function sessioneAttiva(): Promise<boolean> {
  return (await leggiCookieFirmato(NOME_COOKIE)) === 'staff'
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
