import type { Archivio } from '@/lib/tipi'

/**
 * Contratto fra l'archivio e il supporto su cui i dati vengono conservati.
 *
 * Il resto del progetto non sa nulla di file o di database: chiama `leggi` e
 * `scrivi` e basta. Aggiungere un supporto nuovo significa scrivere un altro
 * oggetto con questa forma, senza toccare pagine o rotte API.
 */
export type Deposito = {
  /** Nome mostrato nei messaggi di diagnostica. */
  nome: string
  /** Dati conservati, oppure `null` quando il deposito è ancora vuoto. */
  leggi(): Promise<Archivio | null>
  scrivi(dati: Archivio): Promise<void>
}
