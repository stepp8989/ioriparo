/** Una richiesta di preventivo arrivata dal modulo di contatto. */
export type Richiesta = {
  id: string
  nome: string
  azienda: string
  email: string
  telefono: string
  tipoSito: string
  messaggio: string
  /** Data e ora di arrivo, in formato ISO. */
  creataIl: string
}
