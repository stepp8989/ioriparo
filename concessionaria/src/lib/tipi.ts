/**
 * Tipi condivisi fra sito pubblico, rotte API e pannello di amministrazione.
 *
 * Sono l'unico contratto fra le tre aree: cambiare un campo qui obbliga
 * TypeScript a segnalare ogni punto da aggiornare, dalle schede del catalogo
 * ai moduli del pannello.
 */

/* ── Veicoli ─────────────────────────────────────────────────────────────── */

/** Un veicolo è un'automobile o una moto: tutto il resto discende da qui. */
export const TIPI_VEICOLO = ['auto', 'moto'] as const
export type TipoVeicolo = (typeof TIPI_VEICOLO)[number]

export const NOMI_TIPO_VEICOLO: Record<TipoVeicolo, string> = {
  auto: 'Auto',
  moto: 'Moto',
}

export const ALIMENTAZIONI = [
  'benzina',
  'diesel',
  'ibrida',
  'ibrida-plug-in',
  'elettrica',
  'gpl',
  'metano',
] as const
export type Alimentazione = (typeof ALIMENTAZIONI)[number]

export const NOMI_ALIMENTAZIONE: Record<Alimentazione, string> = {
  benzina: 'Benzina',
  diesel: 'Diesel',
  ibrida: 'Ibrida',
  'ibrida-plug-in': 'Ibrida plug-in',
  elettrica: 'Elettrica',
  gpl: 'GPL',
  metano: 'Metano',
}

export const CAMBI = ['manuale', 'automatico', 'sequenziale'] as const
export type Cambio = (typeof CAMBI)[number]

export const NOMI_CAMBIO: Record<Cambio, string> = {
  manuale: 'Manuale',
  automatico: 'Automatico',
  sequenziale: 'Sequenziale',
}

export const CONDIZIONI = ['nuovo', 'km-0', 'aziendale', 'usato'] as const
export type Condizione = (typeof CONDIZIONI)[number]

export const NOMI_CONDIZIONE: Record<Condizione, string> = {
  nuovo: 'Nuovo',
  'km-0': 'Km 0',
  aziendale: 'Aziendale',
  usato: 'Usato',
}

/**
 * Tipologia di carrozzeria (auto) o di telaio (moto).
 * Le due famiglie stanno nello stesso elenco perché il filtro del catalogo è
 * uno solo: mostra le voci pertinenti al tipo di veicolo selezionato.
 */
export const TIPOLOGIE_AUTO = [
  'city-car',
  'berlina',
  'station-wagon',
  'suv',
  'coupe',
  'cabrio',
  'monovolume',
] as const

export const TIPOLOGIE_MOTO = ['naked', 'sportiva', 'touring', 'enduro', 'scooter', 'custom'] as const

export type Tipologia = (typeof TIPOLOGIE_AUTO)[number] | (typeof TIPOLOGIE_MOTO)[number]

export const NOMI_TIPOLOGIA: Record<Tipologia, string> = {
  'city-car': 'City car',
  berlina: 'Berlina',
  'station-wagon': 'Station wagon',
  suv: 'SUV',
  coupe: 'Coupé',
  cabrio: 'Cabrio',
  monovolume: 'Monovolume',
  naked: 'Naked',
  sportiva: 'Sportiva',
  touring: 'Touring',
  enduro: 'Enduro',
  scooter: 'Scooter',
  custom: 'Custom',
}

/** Stato commerciale: governa i pulsanti mostrati sulla scheda. */
export const STATI_VEICOLO = ['disponibile', 'prenotato', 'venduto'] as const
export type StatoVeicolo = (typeof STATI_VEICOLO)[number]

export const NOMI_STATO_VEICOLO: Record<StatoVeicolo, string> = {
  disponibile: 'Disponibile',
  prenotato: 'Prenotato',
  venduto: 'Venduto',
}

/**
 * Tariffe di noleggio di un veicolo.
 * Quando è `null` il veicolo è in vendita soltanto e non compare fra i
 * noleggiabili.
 */
export type TariffeNoleggio = {
  giornaliera: number
  settimanale: number
  mensile: number
  /** Deposito cauzionale trattenuto e restituito alla riconsegna. */
  cauzione: number
  kmInclusiGiorno: number
  etaMinima: number
  consegnaDomicilio: boolean
}

export type Veicolo = {
  id: string
  /** Porzione di indirizzo della scheda: `/catalogo/audi-a4-avant-2023`. */
  slug: string
  tipo: TipoVeicolo
  marca: string
  modello: string
  allestimento: string
  anno: number
  chilometri: number
  prezzo: number
  /** Prezzo barrato: valorizzato solo quando il veicolo è in promozione. */
  prezzoPrecedente: number | null
  condizione: Condizione
  alimentazione: Alimentazione
  cambio: Cambio
  tipologia: Tipologia
  potenzaCv: number
  potenzaKw: number
  cilindrata: number
  posti: number
  porte: number
  colore: string
  /** Consumo misto: l/100 km, oppure kWh/100 km per le elettriche. */
  consumoMisto: number
  emissioniCo2: number
  classeEmissioni: string
  /** Autonomia dichiarata, solo per elettriche e ibride plug-in. */
  autonomiaKm: number | null
  garanziaMesi: number
  descrizione: string
  dotazioni: string[]
  /** Percorsi dentro `public/`: la prima immagine è quella di copertina. */
  immagini: string[]
  /** Filmato di presentazione, se disponibile. */
  video: string | null
  stato: StatoVeicolo
  /** I veicoli in vetrina compaiono in home fra le proposte in evidenza. */
  inVetrina: boolean
  /** Se falso il veicolo resta in archivio ma sparisce dal sito. */
  visibile: boolean
  noleggio: TariffeNoleggio | null
  creatoIl: string
}

/* ── Richieste commerciali ───────────────────────────────────────────────── */

export const TIPI_RICHIESTA = [
  'informazioni',
  'test-drive',
  'finanziamento',
  'permuta',
  'preventivo',
] as const
export type TipoRichiesta = (typeof TIPI_RICHIESTA)[number]

export const NOMI_TIPO_RICHIESTA: Record<TipoRichiesta, string> = {
  informazioni: 'Informazioni',
  'test-drive': 'Test drive',
  finanziamento: 'Finanziamento',
  permuta: 'Permuta',
  preventivo: 'Preventivo',
}

export const STATI_RICHIESTA = ['nuova', 'in-lavorazione', 'chiusa'] as const
export type StatoRichiesta = (typeof STATI_RICHIESTA)[number]

/** Dati del preventivo di finanziamento, presenti solo sulle richieste di tipo `finanziamento`. */
export type DatiFinanziamento = {
  importo: number
  anticipo: number
  durataMesi: number
  rata: number
  taeg: number
}

/** Dati del veicolo offerto in permuta, presenti solo sulle richieste di tipo `permuta`. */
export type DatiPermuta = {
  marca: string
  modello: string
  anno: number
  chilometri: number
}

export type Richiesta = {
  id: string
  codice: string
  tipo: TipoRichiesta
  /** Veicolo a cui si riferisce la richiesta, se ne riguarda uno. */
  veicoloId: string | null
  veicoloTitolo: string
  nome: string
  cognome: string
  telefono: string
  email: string
  messaggio: string
  /** Data e ora richieste per il test drive. */
  data: string | null
  ora: string | null
  finanziamento: DatiFinanziamento | null
  permuta: DatiPermuta | null
  stato: StatoRichiesta
  /** Valorizzato quando la richiesta arriva da un cliente registrato. */
  clienteId: string | null
  creataIl: string
}

/* ── Noleggi ─────────────────────────────────────────────────────────────── */

export const FORMULE_NOLEGGIO = ['giornaliera', 'settimanale', 'mensile'] as const
export type FormulaNoleggio = (typeof FORMULE_NOLEGGIO)[number]

export const NOMI_FORMULA: Record<FormulaNoleggio, string> = {
  giornaliera: 'Giornaliera',
  settimanale: 'Settimanale',
  mensile: 'Mensile',
}

export const METODI_PAGAMENTO = ['stripe', 'paypal', 'in-sede'] as const
export type MetodoPagamento = (typeof METODI_PAGAMENTO)[number]

export const NOMI_METODO_PAGAMENTO: Record<MetodoPagamento, string> = {
  stripe: 'Carta di credito',
  paypal: 'PayPal',
  'in-sede': 'Pagamento al ritiro',
}

export type StatoPagamento = 'in-attesa' | 'pagato' | 'rimborsato'

export type Pagamento = {
  metodo: MetodoPagamento
  stato: StatoPagamento
  /** Identificativo restituito dal servizio di pagamento. */
  riferimento: string | null
  importo: number
}

export const STATI_NOLEGGIO = ['in-attesa', 'confermato', 'in-corso', 'concluso', 'annullato'] as const
export type StatoNoleggio = (typeof STATI_NOLEGGIO)[number]

export const NOMI_STATO_NOLEGGIO: Record<StatoNoleggio, string> = {
  'in-attesa': 'In attesa',
  confermato: 'Confermato',
  'in-corso': 'In corso',
  concluso: 'Concluso',
  annullato: 'Annullato',
}

export type Noleggio = {
  id: string
  /** Codice breve comunicato al cliente nella conferma. */
  codice: string
  veicoloId: string
  veicoloTitolo: string
  nome: string
  cognome: string
  email: string
  telefono: string
  /** Estremi del periodo, in formato `AAAA-MM-GG`. Il giorno di riconsegna è incluso. */
  dal: string
  al: string
  giorni: number
  formula: FormulaNoleggio
  consegnaDomicilio: boolean
  indirizzoConsegna: string
  totale: number
  cauzione: number
  pagamento: Pagamento
  stato: StatoNoleggio
  note: string
  clienteId: string | null
  creatoIl: string
}

/* ── Appuntamenti di officina e detailing ────────────────────────────────── */

export const STATI_APPUNTAMENTO = ['in-attesa', 'confermato', 'concluso', 'annullato'] as const
export type StatoAppuntamento = (typeof STATI_APPUNTAMENTO)[number]

export const NOMI_STATO_APPUNTAMENTO: Record<StatoAppuntamento, string> = {
  'in-attesa': 'In attesa',
  confermato: 'Confermato',
  concluso: 'Concluso',
  annullato: 'Annullato',
}

export type Appuntamento = {
  id: string
  codice: string
  /** Identificativo del trattamento scelto, da `src/dati/servizi.ts`. */
  servizio: string
  servizioNome: string
  prezzo: number
  nome: string
  cognome: string
  telefono: string
  email: string
  veicolo: string
  targa: string
  data: string
  ora: string
  note: string
  stato: StatoAppuntamento
  clienteId: string | null
  creatoIl: string
}

/* ── Area clienti ────────────────────────────────────────────────────────── */

export const TIPI_DOCUMENTO = ['fattura', 'contratto', 'preventivo', 'documento'] as const
export type TipoDocumento = (typeof TIPI_DOCUMENTO)[number]

export const NOMI_TIPO_DOCUMENTO: Record<TipoDocumento, string> = {
  fattura: 'Fattura',
  contratto: 'Contratto',
  preventivo: 'Preventivo',
  documento: 'Documento',
}

export type Documento = {
  id: string
  titolo: string
  tipo: TipoDocumento
  data: string
  importo: number | null
  /** Percorso del file scaricabile, quando è stato caricato. */
  file: string | null
}

export type Acquisto = {
  id: string
  descrizione: string
  veicoloId: string | null
  data: string
  importo: number
  /** Stato della pratica: dalla firma alla consegna delle chiavi. */
  stato: 'in-lavorazione' | 'consegnato'
}

export type Cliente = {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string
  /** Impronta scrypt della password, nel formato `scrypt$sale$impronta`. */
  password: string
  codiceFiscale: string
  indirizzo: string
  citta: string
  cap: string
  documenti: Documento[]
  acquisti: Acquisto[]
  creatoIl: string
}

/** Cliente senza il campo password: è la forma che esce dalle rotte API. */
export type ClientePubblico = Omit<Cliente, 'password'>

/* ── Contenuti editoriali ────────────────────────────────────────────────── */

export type Recensione = {
  id: string
  autore: string
  testo: string
  voto: 1 | 2 | 3 | 4 | 5
  data: string
  fonte: 'google' | 'facebook' | 'diretta'
  /** Reparto a cui si riferisce: serve a mostrarle nella pagina giusta. */
  servizio: 'vendita' | 'noleggio' | 'detailing' | 'assistenza'
  pubblicata: boolean
}

export const CATEGORIE_ARTICOLO = ['manutenzione', 'guide', 'novita', 'detailing'] as const
export type CategoriaArticolo = (typeof CATEGORIE_ARTICOLO)[number]

export const NOMI_CATEGORIA_ARTICOLO: Record<CategoriaArticolo, string> = {
  manutenzione: 'Consigli di manutenzione',
  guide: 'Guide all’acquisto',
  novita: 'Novità automotive',
  detailing: 'Cura del veicolo',
}

export type Articolo = {
  id: string
  slug: string
  titolo: string
  sommario: string
  /**
   * Corpo dell'articolo in un formato ridotto: `## ` per i sottotitoli,
   * `- ` per gli elenchi puntati, righe vuote fra i paragrafi.
   */
  contenuto: string
  categoria: CategoriaArticolo
  autore: string
  data: string
  immagine: string
  minutiLettura: number
  tag: string[]
  pubblicato: boolean
  inEvidenza: boolean
}

export type Offerta = {
  id: string
  titolo: string
  sottotitolo: string
  descrizione: string
  /** Veicolo collegato, quando la promozione ne riguarda uno solo. */
  veicoloId: string | null
  etichetta: string
  scadenza: string
  immagine: string
  attiva: boolean
}

export type Messaggio = {
  id: string
  nome: string
  email: string
  telefono: string
  oggetto: string
  testo: string
  letto: boolean
  creatoIl: string
}

export type IscrittoNewsletter = {
  id: string
  email: string
  iscrittoIl: string
}

/** Orario di un singolo giorno: due fasce facoltative (mattina e pomeriggio). */
export type OrarioGiorno = {
  giorno: string
  chiuso: boolean
  mattina: string | null
  pomeriggio: string | null
}

/* ── Archivio ────────────────────────────────────────────────────────────── */

/** Forma completa dei dati persistiti. */
export type Archivio = {
  veicoli: Veicolo[]
  richieste: Richiesta[]
  noleggi: Noleggio[]
  appuntamenti: Appuntamento[]
  clienti: Cliente[]
  recensioni: Recensione[]
  articoli: Articolo[]
  offerte: Offerta[]
  messaggi: Messaggio[]
  newsletter: IscrittoNewsletter[]
  orari: OrarioGiorno[]
}

/** Nomi delle collezioni: il deposito PostgreSQL le usa come chiave di riga. */
export const COLLEZIONI = [
  'veicoli',
  'richieste',
  'noleggi',
  'appuntamenti',
  'clienti',
  'recensioni',
  'articoli',
  'offerte',
  'messaggi',
  'newsletter',
  'orari',
] as const satisfies ReadonlyArray<keyof Archivio>

export type Collezione = (typeof COLLEZIONI)[number]
