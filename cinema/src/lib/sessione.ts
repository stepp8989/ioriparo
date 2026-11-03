import 'server-only'
import {
  cancellaCookie,
  confrontoSicuro,
  leggiCookieFirmato,
  scriviCookieFirmato,
  SEGRETO,
} from '@/lib/firma'

/**
 * Accesso al pannello di amministrazione.
 *
 * Il pannello ha due livelli di accesso, non un archivio di account: la
 * gestione completa (proprietario) e la sola verifica dei biglietti
 * all'ingresso (maschera). Separarli conta davvero: il tablet appoggiato alla
 * porta della sala non deve poter cancellare la programmazione né vedere
 * l'anagrafica dei clienti, e una password diversa è il modo più semplice per
 * ottenerlo senza costruire un sistema di utenti che questa scala non chiede.
 *
 * Variabili d'ambiente (vedi `.env.example`):
 *   PANNELLO_PASSWORD   password di gestione completa
 *   MASCHERA_PASSWORD   password del solo lettore di biglietti (facoltativa)
 *   PANNELLO_SEGRETO    chiave usata per firmare i cookie
 */

const NOME_COOKIE = 'cinemax_pannello'
const DURATA_ORE = 12

/** Password d'accesso: senza variabile d'ambiente vale il valore di prova. */
const PASSWORD = process.env.PANNELLO_PASSWORD ?? 'cinemax'
const PASSWORD_MASCHERA = process.env.MASCHERA_PASSWORD ?? ''

/** Livelli di accesso, dal più ampio al più ristretto. */
export type Livello = 'gestione' | 'maschera'

/**
 * Riconosce la password inserita e restituisce il livello corrispondente,
 * oppure `null`. Entrambe le password vengono sempre confrontate, così il tempo
 * di risposta non dice quale delle due è stata riconosciuta.
 */
export function livelloPerPassword(tentativo: string): Livello | null {
  const gestione = Boolean(PASSWORD) && confrontoSicuro(PASSWORD, tentativo)
  const maschera = Boolean(PASSWORD_MASCHERA) && confrontoSicuro(PASSWORD_MASCHERA, tentativo)
  if (gestione) return 'gestione'
  if (maschera) return 'maschera'
  return null
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
export async function apriSessione(livello: Livello): Promise<void> {
  await scriviCookieFirmato(NOME_COOKIE, livello, DURATA_ORE)
}

/** Cancella il cookie di sessione. */
export async function chiudiSessione(): Promise<void> {
  await cancellaCookie(NOME_COOKIE)
}

/** Livello della sessione in corso, `null` se non c'è o è scaduta. */
export async function livelloAttivo(): Promise<Livello | null> {
  const valore = await leggiCookieFirmato(NOME_COOKIE)
  return valore === 'gestione' || valore === 'maschera' ? valore : null
}

/** Vero se la richiesta arriva da una sessione di gestione completa. */
export async function sessioneAttiva(): Promise<boolean> {
  return (await livelloAttivo()) === 'gestione'
}

/**
 * Da usare all'inizio di ogni rotta API riservata alla gestione.
 * Restituisce `null` se la sessione è valida, altrimenti la risposta 401 da
 * restituire subito al chiamante.
 */
export async function bloccaSeNonAutenticato(): Promise<Response | null> {
  if (await sessioneAttiva()) return null
  return Response.json({ errore: 'Accesso non autorizzato.' }, { status: 401 })
}

/**
 * Come sopra, ma accetta anche la maschera: la usa solo la verifica dei
 * biglietti, che è l'unica operazione permessa al livello ristretto.
 */
export async function bloccaSeNonStaff(): Promise<Response | null> {
  if (await livelloAttivo()) return null
  return Response.json({ errore: 'Accesso non autorizzato.' }, { status: 401 })
}
