import type {
  Conto,
  Impostazioni,
  MetodoPagamento,
  ProdottoFood,
  SchemaSala,
  Spettacolo,
  TipologiaBiglietto,
} from '@/lib/tipi'

/**
 * Dati che il flusso d'acquisto riceve dal server.
 *
 * È un sottoinsieme volutamente magro dell'archivio: film e cinema portano
 * solo i campi che il flusso mostra davvero, e la pianta delle sale non c'è
 * affatto — arriva su richiesta insieme alla disponibilità, quando si sa quale
 * sala serve. Mandarle tutte significherebbe far scaricare al browser la
 * mappa di ventisei sale per usarne una.
 */

export type FilmAcquisto = {
  id: string
  slug: string
  titolo: string
  durataMinuti: number
  classificazione: string
  generi: string[]
  palette: [string, string]
  locandina: string
}

export type CinemaAcquisto = {
  id: string
  slug: string
  nome: string
  citta: string
}

export type ClienteAcquisto = {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string
  punti: number
} | null

export type CatalogoAcquisto = {
  impostazioni: Impostazioni
  cinema: CinemaAcquisto[]
  film: FilmAcquisto[]
  /** Solo gli spettacoli ancora acquistabili dei prossimi giorni. */
  spettacoli: Spettacolo[]
  tipologie: TipologiaBiglietto[]
  food: ProdottoFood[]
  cliente: ClienteAcquisto
  metodi: MetodoPagamento[]
}

/** Risposta della rotta di disponibilità: stato dei posti e pianta della sala. */
export type RispostaDisponibilita = {
  occupati: string[]
  liberi: number
  totale: number
  venditaChiusa: boolean
  sala: {
    id: string
    nome: string
    schema: SchemaSala
    supplemento: number
    formati: string[]
  } | null
}

/** Esito del preventivo restituito da `/api/ordine`. */
export type RispostaConto = {
  conto: Conto
  promozione: { titolo: string; codice: string } | null
  coupon: { codice: string } | null
  giftCard: { codice: string; saldo: number } | null
  piano: { nome: string; scontoFood: number } | null
}

/** Passi del flusso, nell'ordine in cui si attraversano. */
export const PASSI = [
  'cinema',
  'film',
  'data',
  'orario',
  'posti',
  'biglietti',
  'food',
  'pagamento',
] as const

export type Passo = (typeof PASSI)[number]

export const NOMI_PASSO: Record<Passo, string> = {
  cinema: 'Cinema',
  film: 'Film',
  data: 'Data',
  orario: 'Orario',
  posti: 'Posti',
  biglietti: 'Biglietti',
  food: 'Food',
  pagamento: 'Pagamento',
}
