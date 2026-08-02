/**
 * Tipi condivisi fra sito pubblico, API e pannello di amministrazione.
 * Sono l'unico contratto fra le tre aree: cambiare un campo qui obbliga
 * TypeScript a segnalare ogni punto da aggiornare.
 */

/** Categorie del menù, nell'ordine in cui compaiono al cliente. */
export const CATEGORIE = [
  'antipasti',
  'primi',
  'secondi',
  'pizza',
  'carne',
  'pesce',
  'dolci',
  'bevande',
  'vini',
] as const

export type Categoria = (typeof CATEGORIE)[number]

/** Etichette leggibili delle categorie, usate in pagina e nel pannello. */
export const NOMI_CATEGORIA: Record<Categoria, string> = {
  antipasti: 'Antipasti',
  primi: 'Primi',
  secondi: 'Secondi',
  pizza: 'Pizza',
  carne: 'Carne',
  pesce: 'Pesce',
  dolci: 'Dolci',
  bevande: 'Bevande',
  vini: 'Vini',
}

/** Allergeni previsti dal Regolamento UE 1169/2011. */
export const ALLERGENI = [
  'glutine',
  'crostacei',
  'uova',
  'pesce',
  'arachidi',
  'soia',
  'latte',
  'frutta a guscio',
  'sedano',
  'senape',
  'sesamo',
  'solfiti',
  'lupini',
  'molluschi',
] as const

export type Allergene = (typeof ALLERGENI)[number]

/** Etichetta promozionale mostrata sulla scheda del piatto. */
export type EtichettaPiatto = 'novita' | 'consigliato' | null

export type Piatto = {
  id: string
  nome: string
  descrizione: string
  prezzo: number
  categoria: Categoria
  allergeni: Allergene[]
  etichetta: EtichettaPiatto
  /** Percorso dell'immagine dentro `public/`. */
  immagine: string
  /** Se falso il piatto resta in archivio ma sparisce dal sito. */
  visibile: boolean
  /** I piatti in evidenza compaiono nella sezione "Piatti più richiesti". */
  inEvidenza: boolean
  /** Ordinamento manuale dentro la categoria: numeri bassi prima. */
  ordine: number
}

export type Recensione = {
  id: string
  autore: string
  testo: string
  voto: 1 | 2 | 3 | 4 | 5
  data: string
  /** Provenienza dichiarata: serve a distinguere le recensioni Google. */
  fonte: 'google' | 'tripadvisor' | 'diretta'
  pubblicata: boolean
}

export type StatoPrenotazione = 'in-attesa' | 'confermata' | 'annullata'

export type Prenotazione = {
  id: string
  /** Codice breve comunicato al cliente nella conferma. */
  codice: string
  nome: string
  cognome: string
  telefono: string
  email: string
  persone: number
  data: string
  ora: string
  note: string
  stato: StatoPrenotazione
  creataIl: string
}

/** Orario di un singolo giorno: due fasce facoltative (pranzo e cena). */
export type OrarioGiorno = {
  giorno: string
  chiuso: boolean
  pranzo: string | null
  cena: string | null
}

export type Evento = {
  id: string
  titolo: string
  sottotitolo: string
  descrizione: string
  data: string
  immagine: string
  attivo: boolean
}

export type Messaggio = {
  id: string
  nome: string
  email: string
  telefono: string
  testo: string
  letto: boolean
  creatoIl: string
}

export type IscrittoNewsletter = {
  id: string
  email: string
  iscrittoIl: string
}

/** Forma completa dell'archivio persistito. */
export type Archivio = {
  piatti: Piatto[]
  recensioni: Recensione[]
  prenotazioni: Prenotazione[]
  orari: OrarioGiorno[]
  eventi: Evento[]
  messaggi: Messaggio[]
  newsletter: IscrittoNewsletter[]
}
