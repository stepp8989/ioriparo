import 'server-only'
import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { MENU_INIZIALE } from '@/dati/menu'
import { EVENTI_INIZIALI, ORARI_INIZIALI, RECENSIONI_INIZIALI } from '@/dati/contenuti'
import type { Archivio } from '@/lib/tipi'

/**
 * Archivio dei contenuti modificabili dal pannello di amministrazione.
 *
 * I dati stanno in un unico file JSON, scritto in modo atomico (file
 * temporaneo + rinomina) per non lasciare mai un archivio a metà se il
 * processo viene interrotto durante il salvataggio.
 *
 * Dove il disco non è scrivibile — è il caso delle funzioni serverless di
 * molte piattaforme — l'archivio resta in memoria per la durata dell'istanza:
 * il sito funziona e il pannello risponde, ma le modifiche non sopravvivono al
 * riavvio. Per la produzione basta sostituire `leggi` e `scrivi` con le due
 * chiamate equivalenti al proprio database: nient'altro nel progetto conosce
 * il formato di memorizzazione.
 */

const PERCORSO = process.env.PERCORSO_ARCHIVIO ?? join(process.cwd(), 'dati-locali', 'archivio.json')

/** Contenuto di partenza al primo avvio. */
function archivioIniziale(): Archivio {
  return {
    piatti: structuredClone(MENU_INIZIALE),
    recensioni: structuredClone(RECENSIONI_INIZIALI),
    prenotazioni: [],
    orari: structuredClone(ORARI_INIZIALI),
    eventi: structuredClone(EVENTI_INIZIALI),
    messaggi: [],
    newsletter: [],
  }
}

/**
 * Copia in memoria.
 *
 * Non è una cache di comodo: serve solo quando il disco non è disponibile in
 * scrittura. Il file resta la fonte di verità perché pagine e rotte API
 * possono essere servite da processi diversi, e una copia in memoria per
 * processo mostrerebbe a lungo dati vecchi — per esempio una prenotazione già
 * registrata ma non ancora visibile nel pannello.
 */
let memoria: Archivio | null = null
let discoScrivibile = true
let discoLeggibile = true

/** Completa un archivio letto da disco con le chiavi eventualmente mancanti. */
function normalizza(dati: Partial<Archivio>): Archivio {
  const base = archivioIniziale()
  return {
    piatti: dati.piatti ?? base.piatti,
    recensioni: dati.recensioni ?? base.recensioni,
    prenotazioni: dati.prenotazioni ?? [],
    orari: dati.orari?.length ? dati.orari : base.orari,
    eventi: dati.eventi ?? base.eventi,
    messaggi: dati.messaggi ?? [],
    newsletter: dati.newsletter ?? [],
  }
}

/** Legge l'archivio, creandolo al primo accesso. */
export async function leggi(): Promise<Archivio> {
  // Quando il disco non è utilizzabile la copia in memoria è l'unica che c'è.
  if (!discoLeggibile) return memoria ?? archivioIniziale()

  try {
    const contenuto = await readFile(PERCORSO, 'utf8')
    memoria = normalizza(JSON.parse(contenuto) as Partial<Archivio>)
    return memoria
  } catch (errore) {
    // File assente: è il primo avvio, si parte dai contenuti iniziali.
    if ((errore as NodeJS.ErrnoException)?.code === 'ENOENT') {
      memoria ??= archivioIniziale()
      await scrivi(memoria)
      return memoria
    }

    // Archivio illeggibile o danneggiato: si prosegue con quello che si ha,
    // senza sovrascrivere il file, così il contenuto resta recuperabile.
    console.error('[archivio] Lettura non riuscita, si prosegue in memoria:', errore)
    if (discoNonUtilizzabile(errore)) discoLeggibile = false
    memoria ??= archivioIniziale()
    return memoria
  }
}

/** Errori che indicano un disco non utilizzabile, non un intoppo momentaneo. */
function discoNonUtilizzabile(errore: unknown): boolean {
  const codice = (errore as NodeJS.ErrnoException)?.code
  return codice === 'EROFS' || codice === 'EACCES' || codice === 'EPERM'
}

/** Salva l'archivio su disco quando possibile, sempre in memoria. */
export async function scrivi(dati: Archivio): Promise<void> {
  memoria = dati
  if (!discoScrivibile) return

  // Il nome del file temporaneo è unico per singola scrittura, non per
  // processo: durante la compilazione più operazioni partono insieme dallo
  // stesso processo e, condividendo il nome, la prima rinomina toglieva il
  // file da sotto i piedi alle altre.
  const temporaneo = `${PERCORSO}.${process.pid}.${Date.now().toString(36)}${Math.random()
    .toString(36)
    .slice(2, 8)}.tmp`

  try {
    await mkdir(dirname(PERCORSO), { recursive: true })
    await writeFile(temporaneo, JSON.stringify(dati, null, 2), 'utf8')
    await rename(temporaneo, PERCORSO)
  } catch (errore) {
    // Il temporaneo non deve restare in giro se qualcosa è andato storto.
    await rm(temporaneo, { force: true }).catch(() => undefined)

    if (discoNonUtilizzabile(errore)) {
      // Filesystem di sola lettura: si prosegue con la sola copia in memoria.
      console.warn('[archivio] Disco non scrivibile, si prosegue in memoria:', errore)
      discoScrivibile = false
      discoLeggibile = false
      return
    }

    // Intoppo momentaneo: si segnala e si riproverà alla prossima modifica,
    // senza rinunciare al disco per il resto della vita del processo.
    console.error('[archivio] Scrittura non riuscita:', errore)
  }
}

/**
 * Legge, modifica e salva in un solo passaggio.
 * Le modifiche sono serializzate da una coda: due richieste che arrivano
 * insieme non possono sovrascriversi a vicenda.
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
