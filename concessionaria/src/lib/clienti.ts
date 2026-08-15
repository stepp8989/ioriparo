import 'server-only'
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'
import { leggi } from '@/lib/archivio'
import { cancellaCookie, leggiCookieFirmato, scriviCookieFirmato } from '@/lib/firma'
import type { Cliente, ClientePubblico } from '@/lib/tipi'

/**
 * Area clienti: registrazione, accesso e sessione.
 *
 * A differenza del pannello, qui gli utenti sono molti e ciascuno ha la sua
 * password. Le password non vengono mai salvate: si conserva l'impronta
 * prodotta da scrypt, con un sale casuale diverso per ogni cliente.
 *
 * scrypt è nella libreria standard di Node, è pensato apposta per le password
 * ed è volutamente lento e avido di memoria: chi rubasse l'archivio non
 * potrebbe provare miliardi di combinazioni al secondo.
 */

const scrypt = promisify(scryptCallback) as (
  password: string,
  sale: Buffer,
  lunghezza: number,
) => Promise<Buffer>

const NOME_COOKIE = 'aurora_cliente'
const DURATA_ORE = 24 * 14
const LUNGHEZZA_IMPRONTA = 64

/** Requisito minimo della password, ripetuto identico anche nel modulo. */
export const LUNGHEZZA_MINIMA_PASSWORD = 8

/** Calcola l'impronta di una password, nel formato `scrypt$sale$impronta`. */
export async function impronta(password: string): Promise<string> {
  const sale = randomBytes(16)
  const derivata = await scrypt(password, sale, LUNGHEZZA_IMPRONTA)
  return `scrypt$${sale.toString('base64url')}$${derivata.toString('base64url')}`
}

/**
 * Verifica una password contro l'impronta salvata.
 *
 * Un'impronta malformata — archivio manomesso, migrazione a metà — non deve
 * mai passare per buona: in quel caso si risponde `false` senza sollevare
 * eccezioni, così l'accesso fallisce ma la rotta non cade.
 */
export async function passwordCombacia(password: string, salvata: string): Promise<boolean> {
  const parti = salvata.split('$')
  if (parti.length !== 3 || parti[0] !== 'scrypt') return false

  try {
    const sale = Buffer.from(parti[1], 'base64url')
    const attesa = Buffer.from(parti[2], 'base64url')
    if (attesa.length !== LUNGHEZZA_IMPRONTA) return false

    const derivata = await scrypt(password, sale, LUNGHEZZA_IMPRONTA)
    return timingSafeEqual(derivata, attesa)
  } catch {
    return false
  }
}

/** Crea il cookie di sessione del cliente dopo un accesso riuscito. */
export async function apriSessioneCliente(clienteId: string): Promise<void> {
  await scriviCookieFirmato(NOME_COOKIE, clienteId, DURATA_ORE)
}

/** Chiude la sessione del cliente. */
export async function chiudiSessioneCliente(): Promise<void> {
  await cancellaCookie(NOME_COOKIE)
}

/** Identificativo del cliente collegato, oppure `null`. */
export async function clienteCollegatoId(): Promise<string | null> {
  return leggiCookieFirmato(NOME_COOKIE)
}

/** Toglie la password dal cliente: è la forma che può uscire dalle rotte API. */
export function senzaPassword(cliente: Cliente): ClientePubblico {
  const { password: _password, ...resto } = cliente
  return resto
}

/**
 * Cliente collegato, letto dall'archivio.
 *
 * Restituisce `null` anche quando il cookie è valido ma il cliente non esiste
 * più: può succedere se l'account è stato cancellato dal pannello mentre la
 * sessione era ancora aperta.
 */
export async function clienteCollegato(): Promise<Cliente | null> {
  const id = await clienteCollegatoId()
  if (!id) return null

  const { clienti } = await leggi()
  return clienti.find((cliente) => cliente.id === id) ?? null
}

/**
 * Da usare all'inizio delle rotte riservate ai clienti.
 * Restituisce il cliente, oppure la risposta 401 da restituire subito.
 */
export async function richiediCliente(): Promise<
  { cliente: Cliente; blocco: null } | { cliente: null; blocco: Response }
> {
  const cliente = await clienteCollegato()
  if (cliente) return { cliente, blocco: null }
  return {
    cliente: null,
    blocco: Response.json({ errore: 'Accesso non effettuato.' }, { status: 401 }),
  }
}
