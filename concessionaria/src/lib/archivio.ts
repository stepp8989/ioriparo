import 'server-only'
import { archivioIniziale } from '@/dati/iniziali'
import { depositoFile } from '@/lib/deposito/file'
import { depositoPostgres } from '@/lib/deposito/postgres'
import type { Deposito } from '@/lib/deposito/tipi'
import type { Archivio } from '@/lib/tipi'

/**
 * Archivio dei contenuti gestiti dal pannello di amministrazione.
 *
 * Qui sta la logica comune a tutti i supporti: scelta del deposito, contenuto
 * di partenza al primo avvio, completamento delle collezioni mancanti e coda
 * delle modifiche. Dove i dati finiscono davvero lo decide `lib/deposito/`.
 *
 *   DATABASE_URL impostata  →  PostgreSQL
 *   altrimenti              →  file JSON (`dati-locali/archivio.json`)
 */

/** Deposito scelto una volta sola all'avvio del processo. */
const deposito: Deposito = process.env.DATABASE_URL
  ? depositoPostgres(process.env.DATABASE_URL)
  : depositoFile()

/**
 * Copia in memoria.
 *
 * Non è una cache di comodo: serve solo quando il deposito non è disponibile.
 * Il deposito resta la fonte di verità perché pagine e rotte API possono
 * essere servite da processi diversi, e una copia in memoria per processo
 * mostrerebbe a lungo dati vecchi — per esempio un noleggio già registrato ma
 * non ancora visibile nel pannello.
 */
let memoria: Archivio | null = null

/** Passa a `true` dopo un guasto irrimediabile del deposito. */
let soloMemoria = false

/** Completa un archivio letto dal deposito con le collezioni mancanti. */
function normalizza(dati: Partial<Archivio>): Archivio {
  const base = archivioIniziale()
  return {
    veicoli: dati.veicoli ?? base.veicoli,
    richieste: dati.richieste ?? [],
    noleggi: dati.noleggi ?? [],
    appuntamenti: dati.appuntamenti ?? [],
    clienti: dati.clienti ?? [],
    recensioni: dati.recensioni ?? base.recensioni,
    articoli: dati.articoli ?? base.articoli,
    offerte: dati.offerte ?? base.offerte,
    messaggi: dati.messaggi ?? [],
    newsletter: dati.newsletter ?? [],
    orari: dati.orari?.length ? dati.orari : base.orari,
  }
}

/** Errori che indicano un supporto inutilizzabile, non un intoppo momentaneo. */
function guastoDefinitivo(errore: unknown): boolean {
  const codice = (errore as NodeJS.ErrnoException)?.code
  return codice === 'EROFS' || codice === 'EACCES' || codice === 'EPERM'
}

/** Legge l'archivio, creandolo al primo accesso. */
export async function leggi(): Promise<Archivio> {
  if (soloMemoria) return (memoria ??= archivioIniziale())

  try {
    const dati = await deposito.leggi()

    // Deposito ancora vuoto: si parte dai contenuti iniziali e li si salva.
    if (!dati) {
      memoria ??= archivioIniziale()
      await scrivi(memoria)
      return memoria
    }

    memoria = normalizza(dati)
    return memoria
  } catch (errore) {
    // Deposito illeggibile o danneggiato: si prosegue con quello che si ha,
    // senza sovrascriverlo, così il contenuto resta recuperabile.
    console.error(`[archivio] Lettura da ${deposito.nome} non riuscita:`, errore)
    if (guastoDefinitivo(errore)) soloMemoria = true
    return (memoria ??= archivioIniziale())
  }
}

/** Salva l'archivio quando possibile, sempre in memoria. */
export async function scrivi(dati: Archivio): Promise<void> {
  memoria = dati
  if (soloMemoria) return

  try {
    await deposito.scrivi(dati)
  } catch (errore) {
    if (guastoDefinitivo(errore)) {
      // Supporto di sola lettura: si prosegue con la sola copia in memoria.
      console.warn(`[archivio] ${deposito.nome} non scrivibile, si prosegue in memoria:`, errore)
      soloMemoria = true
      return
    }

    // Intoppo momentaneo: si segnala e si riproverà alla prossima modifica,
    // senza rinunciare al deposito per il resto della vita del processo.
    console.error(`[archivio] Scrittura su ${deposito.nome} non riuscita:`, errore)
  }
}

/**
 * Legge, modifica e salva in un solo passaggio.
 *
 * Le modifiche sono serializzate da una coda: due richieste che arrivano
 * insieme non possono sovrascriversi a vicenda. La coda vale per il singolo
 * processo; con più istanze in parallelo sullo stesso database conviene
 * spostare la mutua esclusione sul database stesso (`select … for update`).
 */
let coda: Promise<unknown> = Promise.resolve()

export function modifica<T>(operazione: (archivio: Archivio) => T | Promise<T>): Promise<T> {
  const risultato = coda.then(async () => {
    const archivio = await leggi()
    const esito = await operazione(archivio)
    await scrivi(archivio)
    return esito
  })

  // La coda prosegue anche se un'operazione fallisce.
  coda = risultato.catch(() => undefined)
  return risultato
}
