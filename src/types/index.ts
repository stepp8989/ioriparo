/**
 * Modelli di dominio del gestionale IO RIPARO.
 * Tutte le date sono in formato ISO `YYYY-MM-DD`, gli importi in euro.
 */

export type StatoRiparazione =
  | 'in_attesa'
  | 'preventivo_inviato'
  | 'in_lavorazione'
  | 'pronto_per_ritiro'
  | 'consegnato'
  | 'non_riparabile'

export type TipoDispositivo =
  | 'smartphone'
  | 'tablet'
  | 'notebook'
  | 'desktop'
  | 'console'
  | 'smartwatch'
  | 'altro'

export type CondizioneEsterna = 'ottime' | 'buone' | 'sufficienti' | 'danneggiato'

/** Chi ha il dispositivo mentre la pratica è aperta. */
export type Custodia = 'negozio' | 'cliente'

export type TipoCliente = 'privato' | 'azienda'

export interface Cliente {
  id: string
  nome: string
  tipo: TipoCliente
  telefono: string
  email?: string
  indirizzo?: string
  citta?: string
  cap?: string
  partitaIva?: string
  codiceFiscale?: string
  note?: string
  creatoIl: string
  /**
   * Chi ha portato questo cliente con il programma «Porta un amico»: l'`id`
   * del cliente presentatore. Assente per chi è arrivato da solo.
   */
  invitatoDa?: string
}

export interface AccessoriConsegnati {
  scatola: boolean
  cover: boolean
  caricabatterie: boolean
  cavoUsb: boolean
  altro?: string
  note?: string
}

export interface RigaIntervento {
  id: string
  descrizione: string
  quantita: number
  prezzoUnitario: number
  /** Articolo di magazzino eventualmente scalato */
  articoloId?: string
  /**
   * Buono fedeltà riscattato: la riga ha prezzo negativo e qui stanno i punti
   * spesi per ottenerlo. Il saldo della tessera si ricava da queste righe,
   * quindi non esiste un registro dei punti separato da tenere allineato.
   */
  puntiUsati?: number
  /** Sconto di benvenuto di chi è arrivato con un codice invito. */
  scontoAmico?: boolean
  /** Prodotto dato in omaggio (prezzo zero), es. la pellicola col display. */
  omaggio?: boolean
}

export interface Riparazione {
  id: string
  /** Codice progressivo mostrato in interfaccia, es. `#24-0001` */
  codice: string
  clienteId: string
  tipoDispositivo: TipoDispositivo
  marca: string
  modello: string
  colore?: string
  capacita?: string
  imei?: string
  passwordBlocco?: string
  difettoSegnalato: string
  condizioniEsterne?: CondizioneEsterna
  noteCondizioni?: string
  accessori: AccessoriConsegnati
  /**
   * Dove sta il dispositivo. Non tutte le pratiche nascono con l'apparecchio
   * sul banco: capita il preventivo al volo, o il ricambio da ordinare con il
   * cliente che intanto il telefono se lo tiene.
   *
   * Le pratiche vecchie non ce l'hanno e valgono `negozio`: prima di questo
   * campo il dispositivo restava sempre qui.
   */
  custodia?: Custodia
  stato: StatoRiparazione
  dataAccettazione: string
  consegnaPrevista?: string
  dataConsegna?: string
  tecnico?: string
  interventi: RigaIntervento[]
  /** Acconto già incassato all'accettazione */
  acconto?: number
  /** Foto del dispositivo scattate in accettazione, come data URL */
  foto?: string[]
  /** Firma del cliente in accettazione, come data URL PNG */
  firmaCliente?: string
  noteInterne?: string
}

export type StatoPreventivo = 'bozza' | 'inviato' | 'accettato' | 'rifiutato' | 'scaduto'

export interface Preventivo {
  id: string
  numero: string
  clienteId: string
  riparazioneId?: string
  data: string
  validoFino?: string
  stato: StatoPreventivo
  righe: RigaIntervento[]
  /** Aliquota IVA in percentuale */
  iva: number
  note?: string
}

export type StatoFattura = 'emessa' | 'pagata' | 'scaduta' | 'annullata'
export type MetodoPagamento = 'contanti' | 'carta' | 'bonifico' | 'satispay' | 'altro'

export interface Fattura {
  id: string
  numero: string
  clienteId: string
  riparazioneId?: string
  data: string
  scadenza?: string
  stato: StatoFattura
  righe: RigaIntervento[]
  iva: number
  metodoPagamento?: MetodoPagamento
  dataPagamento?: string
}

export interface ArticoloMagazzino {
  id: string
  codice: string
  nome: string
  categoria: string
  fornitore?: string
  quantita: number
  scorta_minima: number
  prezzoAcquisto: number
  prezzoVendita: number
  ubicazione?: string
}

export type StatoOrdine = 'bozza' | 'inviato' | 'in_transito' | 'ricevuto' | 'annullato'

export interface RigaOrdine {
  id: string
  articoloId?: string
  descrizione: string
  quantita: number
  prezzoUnitario: number
}

export interface OrdineFornitore {
  id: string
  numero: string
  fornitore: string
  data: string
  consegnaPrevista?: string
  stato: StatoOrdine
  righe: RigaOrdine[]
}

export type TipoScadenza =
  | 'pagamento_fornitore'
  | 'contratto'
  | 'rinnovo'
  | 'promemoria'
  | 'tassa'

export type PrioritaScadenza = 'urgente' | 'normale' | 'bassa'

export interface Scadenza {
  id: string
  titolo: string
  descrizione?: string
  tipo: TipoScadenza
  priorita: PrioritaScadenza
  data: string
  importo?: number
  completata: boolean
}

export type StatoImpianto = 'attivo' | 'in_manutenzione' | 'da_verificare' | 'dismesso'

export interface Impianto {
  id: string
  nome: string
  clienteId: string
  tipologia: string
  indirizzo?: string
  dataInstallazione: string
  prossimaManutenzione?: string
  stato: StatoImpianto
  note?: string
}

export interface Azienda {
  nome: string
  claim: string
  /**
   * Marchio dell'attività, incorporato come dati e non come percorso a un
   * file: sta nell'archivio, quindi ogni installazione ha il suo. Assente
   * finché non viene caricato dalle impostazioni.
   */
  logo?: string
  /**
   * Versione del marchio per fondi scuri — il menu laterale. Quasi tutti i
   * loghi hanno la scritta nera: sul fondo del menu sparisce. Se manca si usa
   * comunque `logo`, che è meglio di niente.
   */
  logoChiaro?: string
  indirizzo: string
  citta: string
  telefono: string
  email: string
  partitaIva: string
  ivaPredefinita: number
  giorniValiditaPreventivo: number
  prefissoCodice: string
  /** Regole della tessera fedeltà e del «Porta un amico». */
  fedelta?: RegoleFedelta
}

/**
 * Regole del programma fedeltà. Valgono per tutti i clienti e si cambiano
 * dalle Impostazioni: il saldo di ognuno viene ricalcolato con quelle in vigore.
 */
export interface RegoleFedelta {
  attivo: boolean
  /** Euro spesi per guadagnare un punto. */
  euroPerPunto: number
  /** Punti necessari per un buono. */
  puntiPremio: number
  /** Valore del buono, in euro IVA inclusa. */
  valorePremio: number
  /** Sconto sulla prima riparazione di chi arriva con un codice invito. */
  scontoAmico: number
  /** Punti a chi ha invitato, quando l'amico ritira la prima riparazione. */
  puntiPresentatore: number
}

/**
 * Chi sta usando il gestionale. Riguarda la persona, non l'attività: i dati
 * dell'azienda stanno in `Azienda` e si modificano dalle Impostazioni.
 */
export interface Utente {
  nome: string
  ruolo: string
  email: string
  telefono?: string
  /** Iniziali mostrate nell'intestazione quando manca una foto */
  iniziali?: string
  preferenze: PreferenzeUtente
}

export interface PreferenzeUtente {
  tema: 'chiaro' | 'scuro' | 'sistema'
  /** Pagina aperta all'accesso, fra i percorsi del gestionale */
  paginaIniziale: string
  avvisiScadenze: boolean
  avvisiSottoScorta: boolean
  /** Righe per pagina negli elenchi */
  righePerPagina: number
}

export interface DatabaseGestionale {
  clienti: Cliente[]
  riparazioni: Riparazione[]
  preventivi: Preventivo[]
  fatture: Fattura[]
  magazzino: ArticoloMagazzino[]
  ordini: OrdineFornitore[]
  scadenze: Scadenza[]
  impianti: Impianto[]
  azienda: Azienda
  utente: Utente
}
