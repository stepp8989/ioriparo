import 'server-only'
import { archivioIniziale } from '@/dati/iniziali'
import { depositoFile } from '@/lib/deposito/file'
import { depositoPostgres } from '@/lib/deposito/postgres'
import type { Deposito } from '@/lib/deposito/tipi'
import type { Archivio } from '@/lib/tipi'

/**
 * Archivio della piattaforma.
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
 * mostrerebbe a lungo dati vecchi — per esempio posti già venduti ma ancora
 * segnati come liberi nella mappa della sala, che è esattamente l'errore che
 * una biglietteria non può permettersi.
 */
let memoria: Archivio | null = null

/** Passa a `true` dopo un guasto irrimediabile del deposito. */
let soloMemoria = false

/** Completa un archivio letto dal deposito con le collezioni mancanti. */
function normalizza(dati: Partial<Archivio>): Archivio {
  const base = archivioIniziale()
  return {
    // Le impostazioni si fondono con quelle di base: una versione nuova può
    // aggiungere un modulo senza che gli archivi già esistenti lo perdano.
    impostazioni: dati.impostazioni
      ? {
          ...base.impostazioni,
          ...dati.impostazioni,
          marchio: { ...base.impostazioni.marchio, ...dati.impostazioni.marchio },
          social: { ...base.impostazioni.social, ...dati.impostazioni.social },
          moduli: { ...base.impostazioni.moduli, ...dati.impostazioni.moduli },
          supplementiFormato: {
            ...base.impostazioni.supplementiFormato,
            ...dati.impostazioni.supplementiFormato,
          },
          supplementiPosto: {
            ...base.impostazioni.supplementiPosto,
            ...dati.impostazioni.supplementiPosto,
          },
        }
      : base.impostazioni,
    film: dati.film ?? base.film,
    cinema: dati.cinema ?? base.cinema,
    sale: dati.sale ?? base.sale,
    spettacoli: dati.spettacoli ?? base.spettacoli,
    tipologieBiglietto: dati.tipologieBiglietto?.length
      ? dati.tipologieBiglietto
      : base.tipologieBiglietto,
    prenotazioni: dati.prenotazioni ?? [],
    clienti: dati.clienti ?? [],
    livelliLoyalty: dati.livelliLoyalty?.length ? dati.livelliLoyalty : base.livelliLoyalty,
    premiLoyalty: dati.premiLoyalty?.length ? dati.premiLoyalty : base.premiLoyalty,
    movimentiPunti: dati.movimentiPunti ?? [],
    piani: dati.piani?.length ? dati.piani : base.piani,
    sottoscrizioni: dati.sottoscrizioni ?? [],
    promozioni: dati.promozioni ?? base.promozioni,
    coupon: dati.coupon ?? [],
    giftCard: dati.giftCard ?? [],
    food: dati.food ?? base.food,
    notifiche: dati.notifiche ?? [],
    registro: dati.registro ?? [],
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
 * insieme non possono sovrascriversi a vicenda. È la garanzia su cui si regge
 * la vendita dei posti — due clienti che premono «paga» nello stesso istante
 * per la stessa poltrona vengono valutati uno dopo l'altro, e il secondo trova
 * il posto già occupato invece di sovrascrivere la prenotazione del primo.
 *
 * La coda vale per il singolo processo. Con più istanze in parallelo sullo
 * stesso database la mutua esclusione va spostata sul database
 * (`select … for update` sulla riga `prenotazioni`): è la prima cosa da fare
 * prima di scalare orizzontalmente.
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

/** Aggiunge una voce al registro delle operazioni sensibili. */
export function annota(
  archivio: Archivio,
  attore: string,
  azione: string,
  oggetto: string,
  dettaglio = '',
): void {
  archivio.registro.unshift({
    id: `reg-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
    quando: new Date().toISOString(),
    attore,
    azione,
    oggetto,
    dettaglio,
  })
  // Il registro non deve crescere all'infinito nel deposito su file: si
  // conservano le ultimi duemila voci, che coprono mesi di attività normale.
  if (archivio.registro.length > 2000) archivio.registro.length = 2000
}
