import 'server-only'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Risorse facoltative presenti in `public/`.
 *
 * Il filmato dell'apertura non è incluso nel progetto: un video di repertorio
 * pesa decine di megabyte e non ha senso versionarlo. Il sito lo usa se c'è e
 * mostra la sequenza di fotografie se non c'è, così la home funziona da subito
 * e migliora nel momento in cui la concessionaria carica le proprie riprese.
 *
 * Basta copiare il file in `public/video/apertura.mp4` (e, volendo, la
 * versione WebM accanto) e ricompilare.
 */

const VIDEO = [
  { percorso: '/video/apertura.webm', tipo: 'video/webm' },
  { percorso: '/video/apertura.mp4', tipo: 'video/mp4' },
]

export type SorgenteVideo = { percorso: string; tipo: string }

/**
 * Sorgenti del filmato di apertura, in ordine di preferenza.
 * Il controllo avviene sul disco al momento del disegno lato server: nessun
 * tentativo di rete e nessun riquadro nero se il file non esiste.
 */
export function videoApertura(): SorgenteVideo[] {
  const pubblica = join(process.cwd(), 'public')
  return VIDEO.filter((sorgente) => existsSync(join(pubblica, sorgente.percorso)))
}
