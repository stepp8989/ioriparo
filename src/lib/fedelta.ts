import { totaleRiparazione } from './calcoli'
import { formatEuro, formatNumero } from './format'
import type { Cliente, RegoleFedelta, Riparazione } from '@/types'

/**
 * Tessera fedeltà e «Porta un amico».
 *
 * Non esiste un registro dei punti: il saldo si ricava ogni volta da quello
 * che c'è già nell'archivio.
 *
 * - **guadagnati**: un punto ogni `euroPerPunto` spesi sulle riparazioni
 *   consegnate, più `puntiPresentatore` per ogni amico che ha ritirato la sua
 *   prima riparazione;
 * - **spesi**: la somma di `puntiUsati` sulle righe «buono fedeltà» delle
 *   riparazioni del cliente.
 *
 * Così non c'è niente che possa disallinearsi: annullare un buono vuol dire
 * togliere la riga, e i punti tornano da soli. La stessa funzione serve al
 * gestionale e al sito (che riceve dal database solo i tre totali).
 */

export const REGOLE_PREDEFINITE: RegoleFedelta = {
  attivo: true,
  euroPerPunto: 1,
  puntiPremio: 100,
  valorePremio: 10,
  scontoAmico: 10,
  puntiPresentatore: 100,
}

/** Regole complete: un archivio salvato prima del programma non le ha. */
export function regoleFedelta(parziali?: Partial<RegoleFedelta> | null): RegoleFedelta {
  return { ...REGOLE_PREDEFINITE, ...(parziali ?? {}) }
}

/** I tre numeri da cui dipende la tessera. */
export interface Movimenti {
  /** Euro spesi sulle riparazioni consegnate */
  speso: number
  puntiUsati: number
  /** Amici invitati che hanno già ritirato una riparazione */
  amici: number
}

export interface Tessera {
  punti: number
  daAcquisti: number
  daAmici: number
  /** Buoni che il cliente può usare adesso */
  buoni: number
  /** Punti che mancano al prossimo buono */
  mancano: number
  /** Avanzamento verso il prossimo buono, fra 0 e 1 */
  avanzamento: number
}

export function calcolaTessera(m: Movimenti, regole: RegoleFedelta): Tessera {
  const perPunto = regole.euroPerPunto > 0 ? regole.euroPerPunto : 1
  const premio = regole.puntiPremio > 0 ? regole.puntiPremio : 1
  const daAcquisti = Math.floor(m.speso / perPunto)
  const daAmici = m.amici * regole.puntiPresentatore
  const punti = Math.max(0, daAcquisti + daAmici - m.puntiUsati)
  const resto = punti % premio
  return {
    punti,
    daAcquisti,
    daAmici,
    buoni: Math.floor(punti / premio),
    mancano: premio - resto,
    avanzamento: resto / premio,
  }
}

const consegnata = (r: Riparazione) => r.stato === 'consegnato'

/** Movimenti di un cliente, calcolati sull'archivio del gestionale. */
export function movimentiCliente(
  db: { clienti: Cliente[]; riparazioni: Riparazione[] },
  clienteId: string,
): Movimenti {
  let speso = 0
  let puntiUsati = 0
  for (const r of db.riparazioni) {
    if (r.clienteId !== clienteId) continue
    // Una riparazione con sconti maggiori del lavoro non toglie punti.
    if (consegnata(r)) speso += Math.max(0, totaleRiparazione(r))
    for (const riga of r.interventi) puntiUsati += riga.puntiUsati ?? 0
  }
  return { speso, puntiUsati, amici: amiciPortati(db, clienteId).filter((a) => a.valido).length }
}

/** Clienti arrivati con il codice di `clienteId`, con chi ha già ritirato. */
export function amiciPortati(
  db: { clienti: Cliente[]; riparazioni: Riparazione[] },
  clienteId: string,
) {
  return db.clienti
    .filter((c) => c.invitatoDa === clienteId)
    .map((cliente) => ({
      cliente,
      valido: db.riparazioni.some((r) => r.clienteId === cliente.id && consegnata(r)),
    }))
}

/** Vero se il cliente ha già usato lo sconto di benvenuto. */
export function scontoAmicoUsato(riparazioni: Riparazione[], clienteId: string): boolean {
  return riparazioni.some((r) => r.clienteId === clienteId && r.interventi.some((i) => i.scontoAmico))
}

/** Lettere e cifre non confondibili, come nei codici pratica. */
const ALFABETO = 'ACDEFHJKLMNPQRTUVWXYZ2346789'

/**
 * Codice invito del cliente, ricavato dal suo identificativo.
 *
 * Calcolato e non salvato: non serve assegnarlo ai clienti che esistevano
 * prima del programma e non può mai cambiare. Non contiene il nome, perché il
 * sito lo mostra a chiunque abbia un codice pratica, e i codici pratica dei
 * primi tempi erano indovinabili.
 */
export function codiceInvito(clienteId: string): string {
  // FNV-1a a 32 bit: corto, stabile, e uguale su ogni browser.
  let h = 0x811c9dc5
  for (let i = 0; i < clienteId.length; i++) {
    h ^= clienteId.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  let codice = ''
  for (let i = 0; i < 5; i++) {
    codice += ALFABETO[h % ALFABETO.length]
    h = Math.floor(h / ALFABETO.length)
  }
  return `IR-${codice}`
}

/** Confronto tollerante: `ir-k7m2q`, `IR K7M2Q` e `IRK7M2Q` coincidono. */
export const normalizzaInvito = (v: string) => {
  const pulito = v.toUpperCase().replace(/[^0-9A-Z]/g, '')
  return pulito.startsWith('IR') ? pulito : `IR${pulito}`
}

/** Il cliente a cui appartiene un codice invito. */
export function clienteDaInvito(clienti: Cliente[], codice: string): Cliente | undefined {
  const cercato = normalizzaInvito(codice)
  if (cercato.length < 7) return undefined
  return clienti.find((c) => normalizzaInvito(codiceInvito(c.id)) === cercato)
}

/**
 * Indirizzo del sito pubblico, per i link d'invito e della tessera. Nella
 * build del solo gestionale il sito non c'è: i messaggi riportano il codice e
 * basta, senza un link che porterebbe a una pagina inesistente.
 */
const SITO =
  import.meta.env.VITE_SOLO_GESTIONALE === '1' || typeof window === 'undefined'
    ? ''
    : window.location.origin

/** Link WhatsApp verso il cliente, con il messaggio già scritto. */
export const whatsappCliente = (telefono: string, testo: string) =>
  `https://wa.me/39${telefono.replace(/\D/g, '').replace(/^39(?=\d{9,})/, '')}?text=${encodeURIComponent(testo)}`

/** Messaggio con il saldo della tessera e il codice da girare agli amici. */
export function messaggioTessera(
  cliente: Cliente,
  tessera: Tessera,
  regole: RegoleFedelta,
  azienda: string,
): string {
  const codice = codiceInvito(cliente.id)
  const nome = cliente.tipo === 'privato' ? cliente.nome.split(' ')[0] : cliente.nome
  const saldo =
    tessera.buoni > 0
      ? `hai ${formatNumero(tessera.punti)} punti sulla tessera ${azienda}: ${
          tessera.buoni === 1 ? 'un buono' : `${tessera.buoni} buoni`
        } da ${formatEuro(regole.valorePremio)} da usare alla prossima riparazione.`
      : `hai ${formatNumero(tessera.punti)} punti sulla tessera ${azienda}: ne mancano ${formatNumero(
          tessera.mancano,
        )} per un buono da ${formatEuro(regole.valorePremio)}.`
  const invito = `Se porti un amico, lui ha ${formatEuro(regole.scontoAmico)} di sconto e tu ${formatNumero(
    regole.puntiPresentatore,
  )} punti: il tuo codice è ${codice}${SITO ? ` (${SITO}/invito/${codice})` : ''}.`
  return `Ciao ${nome}, ${saldo} ${invito}`
}
