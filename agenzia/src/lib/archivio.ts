import 'server-only'
import { appendFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { Richiesta } from '@/lib/tipi'

/**
 * Registro delle richieste di preventivo.
 *
 * Le richieste vengono aggiunte in coda a un file di testo, una per riga in
 * formato JSON. È il formato più semplice che sopravviva a due invii
 * contemporanei: l'aggiunta in coda è atomica per righe brevi, mentre
 * riscrivere ogni volta un unico array JSON perderebbe una delle due.
 *
 * Dove il disco non è scrivibile — funzioni serverless di molte piattaforme —
 * la scrittura fallisce una volta sola, viene segnalata in console e poi si
 * smette di riprovare: la richiesta resta comunque nella copia in memoria e
 * soprattutto parte la notifica per email, che in quel caso è il recapito
 * vero. Per la produzione basta sostituire `registra` con la chiamata al
 * proprio database: nient'altro nel progetto conosce il formato.
 */

const PERCORSO =
  process.env.PERCORSO_RICHIESTE ?? join(process.cwd(), 'dati-locali', 'richieste.jsonl')

/** Ultime richieste dell'istanza corrente, utili in sviluppo e per il conteggio. */
const recenti: Richiesta[] = []

let discoScrivibile = true

export async function registra(richiesta: Richiesta): Promise<void> {
  recenti.unshift(richiesta)
  if (recenti.length > 50) recenti.length = 50

  if (!discoScrivibile) return

  try {
    await mkdir(dirname(PERCORSO), { recursive: true })
    await appendFile(PERCORSO, JSON.stringify(richiesta) + '\n', 'utf8')
  } catch (errore) {
    discoScrivibile = false
    console.warn(
      '[archivio] Disco non scrivibile: le richieste restano in memoria. ' +
        'Configurare RESEND_API_KEY per riceverle via email.',
      errore,
    )
  }
}

/** Le richieste registrate da questa istanza, dalla più recente. */
export function ultime(): Richiesta[] {
  return recenti
}
