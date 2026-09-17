/**
 * Schema dei dati della piattaforma.
 *
 * Questo file è l'unica descrizione dello schema: l'archivio, le rotte API, il
 * pannello e le pagine pubbliche leggono tutti da qui. Le costanti `as const`
 * che accompagnano i tipi non sono una ripetizione: servono a validare i dati
 * in arrivo dalle rotte API (`fraLeVoci`) e a riempire i menu a tendina del
 * pannello, e tenerle accanto al tipo impedisce che le due cose divergano.
 *
 * Per la corrispondenza con un database relazionale normalizzato si veda
 * `docs/schema-database.md`: qui le collezioni sono documenti JSON, ma i
 * campi e le relazioni sono gli stessi.
 */

/* ─────────────────────────────────────────────────────────────────────────
 * Vocabolari comuni
 * ────────────────────────────────────────────────────────────────────── */

/** Formati di proiezione. Determinano supplemento di prezzo e sale compatibili. */
export const FORMATI = ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos', 'VO sottotitolato'] as const
export type Formato = (typeof FORMATI)[number]

/** Classificazione di legge italiana. */
export const CLASSIFICAZIONI = ['T', 'VM6', 'VM14', 'VM18'] as const
export type Classificazione = (typeof CLASSIFICAZIONI)[number]

/** Stato di un film nel listino. */
export const STATI_FILM = ['in-sala', 'prossimamente', 'archivio'] as const
export type StatoFilm = (typeof STATI_FILM)[number]

/** Servizi offerti da una struttura: guidano i filtri di «Trova cinema». */
export const SERVIZI_CINEMA = [
  'Parcheggio',
  'Bar',
  'Food',
  'IMAX',
  '3D',
  '4DX',
  'Dolby Atmos',
  'Accessibilità',
  'Sala VIP',
  'Ricarica elettrica',
  'Wi-Fi',
] as const
export type ServizioCinema = (typeof SERVIZI_CINEMA)[number]

/** Tipo di poltrona nello schema di sala. */
export const TIPI_POSTO = ['standard', 'premium', 'disabili', 'accompagnatore', 'vuoto'] as const
export type TipoPosto = (typeof TIPI_POSTO)[number]

/** Stato di una prenotazione lungo tutto il suo ciclo di vita. */
export const STATI_PRENOTAZIONE = [
  'in-attesa',
  'confermata',
  'annullata',
  'rimborsata',
  'utilizzata',
] as const
export type StatoPrenotazione = (typeof STATI_PRENOTAZIONE)[number]

/** Metodi di pagamento proposti al checkout. */
export const METODI_PAGAMENTO = [
  'carta',
  'apple-pay',
  'google-pay',
  'paypal',
  'gift-card',
  'punti',
  'cassa',
] as const
export type MetodoPagamento = (typeof METODI_PAGAMENTO)[number]

export const STATI_PAGAMENTO = ['in-attesa', 'riuscito', 'fallito', 'rimborsato'] as const
export type StatoPagamento = (typeof STATI_PAGAMENTO)[number]

/** Meccaniche promozionali riconosciute dal motore dei prezzi. */
export const TIPI_PROMOZIONE = ['2x1', 'percentuale', 'fisso', 'punti-extra', 'food-omaggio'] as const
export type TipoPromozione = (typeof TIPI_PROMOZIONE)[number]

/** Categorie del banco alimentari. */
export const CATEGORIE_FOOD = ['Popcorn', 'Nachos', 'Bibite', 'Dolci', 'Combo', 'Menu'] as const
export type CategoriaFood = (typeof CATEGORIE_FOOD)[number]

/** Periodicità dei piani di abbonamento. */
export const PERIODI_ABBONAMENTO = ['mensile', 'annuale'] as const
export type PeriodoAbbonamento = (typeof PERIODI_ABBONAMENTO)[number]

/** Canali di notifica. L'SMS è facoltativo e va abilitato dalle impostazioni. */
export const CANALI_NOTIFICA = ['email', 'push', 'sms'] as const
export type CanaleNotifica = (typeof CANALI_NOTIFICA)[number]

/** Ruoli del pannello. Il controllo effettivo sta in `lib/sessione.ts`. */
export const RUOLI = ['proprietario', 'gestore', 'cassa', 'maschera'] as const
export type Ruolo = (typeof RUOLI)[number]

/* ─────────────────────────────────────────────────────────────────────────
 * Catalogo film
 * ────────────────────────────────────────────────────────────────────── */

/** Riga del cast. Il ruolo è facoltativo: per il regista non ha senso. */
export type VoceCast = { nome: string; ruolo: string }

/**
 * Trailer.
 *
 * `piattaforma` decide come costruire l'indirizzo dell'incorporamento; il
 * lettore non carica nulla finché non si preme play, così nessuna richiesta a
 * YouTube parte al caricamento della pagina.
 */
export type Trailer = {
  piattaforma: 'youtube' | 'vimeo' | 'file'
  /** Identificativo del video, oppure percorso del file quando `file`. */
  riferimento: string
  durataSecondi: number
}

export type Film = {
  id: string
  /** Porzione di indirizzo: `/film/<slug>`. Non cambia dopo la pubblicazione. */
  slug: string
  titolo: string
  titoloOriginale: string
  /** Frase d'effetto mostrata sotto il titolo nell'apertura. */
  sottotitolo: string
  /** Riassunto breve per le schede (una o due frasi). */
  sinossi: string
  /** Trama distesa per la pagina del film. */
  trama: string
  generi: string[]
  durataMinuti: number
  anno: number
  classificazione: Classificazione
  lingua: string
  paese: string
  regista: string
  cast: VoceCast[]
  formati: Formato[]
  trailer: Trailer | null
  /**
   * Indirizzi delle immagini caricate dal pannello. Quando sono vuoti il sito
   * disegna una locandina procedurale a partire da `palette`: i dati
   * dimostrativi non contengono materiale protetto da copyright.
   */
  locandina: string
  backdrop: string
  /** Due colori esadecimali usati dalla locandina e dal fondale procedurali. */
  palette: [string, string]
  valutazione: number
  stato: StatoFilm
  dataUscita: string
  inEvidenza: boolean
  visibile: boolean
  creatoIl: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Strutture e sale
 * ────────────────────────────────────────────────────────────────────── */

export type OrarioApertura = {
  /** 0 = domenica, come `Date.getDay()`. */
  giorno: number
  apertura: string
  chiusura: string
  chiuso: boolean
}

export type Cinema = {
  id: string
  slug: string
  nome: string
  descrizione: string
  indirizzo: string
  citta: string
  cap: string
  provincia: string
  telefono: string
  email: string
  /** Servono alla ricerca per distanza in «Trova cinema». */
  coordinate: { lat: number; lng: number }
  servizi: ServizioCinema[]
  orari: OrarioApertura[]
  immagine: string
  palette: [string, string]
  visibile: boolean
  creatoIl: string
}

/**
 * Una poltrona nello schema della sala.
 *
 * `numero` è quello stampato sul biglietto e non coincide con la posizione
 * nella fila: i corridoi (`tipo: 'vuoto'`) occupano una casella nella griglia
 * ma non ricevono numerazione.
 */
export type Posto = {
  numero: number
  tipo: TipoPosto
}

export type FilaSala = {
  /** Lettera di fila: «A», «B»… fino a «Z», poi «AA». */
  etichetta: string
  posti: Posto[]
}

/**
 * Schema grafico della sala, quello che l'amministratore compone nell'editor.
 *
 * `corridoiOrizzontali` contiene gli indici delle file dopo le quali lasciare
 * un passaggio: serve alla resa grafica, non alla numerazione.
 */
export type SchemaSala = {
  file: FilaSala[]
  corridoiOrizzontali: number[]
  /** Posizione dello schermo: quasi sempre in alto, ma le sale IMAX curve no. */
  schermo: 'alto' | 'basso'
}

export type Sala = {
  id: string
  cinemaId: string
  nome: string
  formati: Formato[]
  schema: SchemaSala
  /** Supplemento fisso applicato a ogni biglietto venduto in questa sala. */
  supplemento: number
  attiva: boolean
  creataIl: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Programmazione
 * ────────────────────────────────────────────────────────────────────── */

export type Spettacolo = {
  id: string
  filmId: string
  cinemaId: string
  salaId: string
  /** `AAAA-MM-GG` nel fuso del cinema. */
  data: string
  /** `HH:MM` in formato 24 ore. */
  ora: string
  formato: Formato
  /** `IT` doppiato, `VO` lingua originale sottotitolata. */
  lingua: 'IT' | 'VO'
  /** Prezzo del biglietto intero per questo spettacolo, senza supplementi. */
  prezzoBase: number
  stato: 'programmato' | 'annullato'
  creatoIl: string
}

/**
 * Tipologia di biglietto (intero, ridotto, under 18…).
 *
 * `variazione` è un delta in euro rispetto al prezzo base dello spettacolo, e
 * può essere negativo. Tenerlo come delta invece che come prezzo assoluto
 * permette di cambiare il prezzo di uno spettacolo — o di alzare il listino di
 * un intero cinema — senza rimettere mano a tutte le tipologie.
 */
export type TipologiaBiglietto = {
  id: string
  nome: string
  descrizione: string
  variazione: number
  /** Richiede l'esibizione di un documento all'ingresso (studenti, senior). */
  richiedeDocumento: boolean
  /** Numero massimo acquistabile per prenotazione; 0 = nessun limite. */
  massimoPerOrdine: number
  attiva: boolean
  ordine: number
}

/* ─────────────────────────────────────────────────────────────────────────
 * Prenotazioni e biglietti
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Un posto venduto: è l'unità che diventa un biglietto con il proprio QR.
 *
 * Prezzo e tipologia sono congelati qui al momento dell'acquisto: se domani il
 * listino cambia, i biglietti già emessi restano quelli che il cliente ha
 * pagato.
 */
export type PostoPrenotato = {
  fila: string
  numero: number
  tipoPosto: TipoPosto
  tipologiaId: string
  tipologiaNome: string
  prezzo: number
  /** Codice del singolo biglietto, quello dentro il QR. */
  codiceBiglietto: string
  /** Impostato dalla verifica all'ingresso: un QR vale una sola volta. */
  utilizzatoIl: string | null
}

export type RigaFood = {
  prodottoId: string
  nome: string
  quantita: number
  prezzoUnitario: number
}

export type Pagamento = {
  metodo: MetodoPagamento
  stato: StatoPagamento
  /**
   * Riferimento restituito dal fornitore (per Stripe l'id del PaymentIntent).
   * Non contiene mai dati della carta: quelli non transitano né vengono
   * conservati dalla piattaforma.
   */
  riferimento: string
  importo: number
  creatoIl: string
}

export type Prenotazione = {
  id: string
  /** Codice comunicato al cliente, sei caratteri leggibili. */
  codice: string
  clienteId: string | null
  /** Dati di contatto per l'acquisto senza registrazione. */
  ospite: { nome: string; email: string; telefono: string } | null
  spettacoloId: string
  filmId: string
  cinemaId: string
  salaId: string
  /** Copia di data e ora dello spettacolo: il biglietto resta leggibile anche
   * se lo spettacolo viene poi cancellato dall'archivio. */
  data: string
  ora: string
  posti: PostoPrenotato[]
  food: RigaFood[]
  importoBiglietti: number
  importoFood: number
  sconto: number
  /** Dettaglio degli sconti applicati, per il riepilogo e per il pannello. */
  scontiApplicati: { etichetta: string; importo: number }[]
  commissioni: number
  totale: number
  promoCodice: string | null
  giftCardCodice: string | null
  puntiUsati: number
  puntiAccreditati: number
  pagamento: Pagamento
  stato: StatoPrenotazione
  /**
   * Fino a quando i posti restano bloccati in attesa del pagamento. Passata
   * questa scadenza una prenotazione ancora `in-attesa` non occupa più i posti.
   */
  scadenzaBlocco: string
  creataIl: string
  aggiornataIl: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Clienti, fedeltà e abbonamenti
 * ────────────────────────────────────────────────────────────────────── */

export type Cliente = {
  id: string
  nome: string
  cognome: string
  email: string
  telefono: string
  /** Impronta `scrypt$sale$derivata`: la password in chiaro non esiste mai. */
  password: string
  dataNascita: string
  cinemaPreferitoId: string
  preferenze: {
    email: boolean
    push: boolean
    sms: boolean
    generi: string[]
  }
  /** Identificativi dei film messi fra i preferiti. */
  preferiti: string[]
  punti: number
  /** Punti accumulati da sempre: determina il livello, che non scende. */
  puntiStorici: number
  livelloId: string
  creatoIl: string
  ultimoAccesso: string
  attivo: boolean
}

export type LivelloLoyalty = {
  id: string
  nome: string
  puntiMinimi: number
  colore: string
  vantaggi: string[]
  /** Moltiplicatore dei punti guadagnati: 1.5 = «+50% punti». */
  moltiplicatore: number
  ordine: number
}

export type PremioLoyalty = {
  id: string
  nome: string
  descrizione: string
  puntiRichiesti: number
  tipo: 'biglietto' | 'food' | 'sconto' | 'upgrade'
  /** Valore in euro del premio, usato per lo sconto al checkout. */
  valore: number
  attivo: boolean
}

export type MovimentoPunti = {
  id: string
  clienteId: string
  tipo: 'accredito' | 'riscatto' | 'rettifica' | 'scadenza'
  punti: number
  motivo: string
  /** Codice prenotazione o identificativo del premio. */
  riferimento: string
  creatoIl: string
}

export type PianoAbbonamento = {
  id: string
  slug: string
  nome: string
  descrizione: string
  prezzo: number
  periodo: PeriodoAbbonamento
  /** Ingressi compresi nel periodo; 0 = illimitati. */
  ingressiInclusi: number
  vantaggi: string[]
  limitazioni: string[]
  /** Sconto percentuale sul banco alimentari. */
  scontoFood: number
  /** Formati compresi senza supplemento. */
  formatiInclusi: Formato[]
  colore: string
  attivo: boolean
  inEvidenza: boolean
  ordine: number
}

export type Sottoscrizione = {
  id: string
  clienteId: string
  pianoId: string
  stato: 'attiva' | 'sospesa' | 'scaduta' | 'annullata'
  dal: string
  al: string
  ingressiUsati: number
  rinnovoAutomatico: boolean
  creataIl: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Promozioni, coupon e gift card
 * ────────────────────────────────────────────────────────────────────── */

export type Promozione = {
  id: string
  slug: string
  titolo: string
  sottotitolo: string
  descrizione: string
  tipo: TipoPromozione
  /** Percentuale quando `tipo` è `percentuale`, euro quando `fisso`. */
  valore: number
  /** Codice da inserire al checkout; vuoto = promozione automatica. */
  codice: string
  immagine: string
  palette: [string, string]
  dal: string
  al: string
  /** Giorni della settimana validi (0 = domenica); vuoto = tutti. */
  giorniValidi: number[]
  /** Fascia oraria di validità, `HH:MM`; vuote = tutta la giornata. */
  oraDa: string
  oraA: string
  /** Elenchi vuoti significano «nessuna restrizione». */
  cinemaIds: string[]
  filmIds: string[]
  formati: Formato[]
  /** 0 = illimitato. */
  limiteUtilizzi: number
  limitePerCliente: number
  utilizzi: number
  soloAbbonati: boolean
  livelliRichiesti: string[]
  attiva: boolean
  inEvidenza: boolean
  creataIl: string
}

/** Codice personale, monouso, generato dal pannello o da una promozione. */
export type Coupon = {
  id: string
  codice: string
  promozioneId: string
  descrizione: string
  tipo: 'percentuale' | 'fisso'
  valore: number
  clienteId: string
  scadenza: string
  usato: boolean
  usatoIl: string
  prenotazioneId: string
  creatoIl: string
}

export type MovimentoGiftCard = {
  importo: number
  prenotazioneId: string
  creatoIl: string
}

export type GiftCard = {
  id: string
  codice: string
  valoreIniziale: number
  saldo: number
  mittente: { nome: string; email: string }
  destinatario: { nome: string; email: string }
  messaggio: string
  /** Data in cui inviare l'email al destinatario. */
  dataInvio: string
  stato: 'programmata' | 'attiva' | 'esaurita' | 'annullata'
  movimenti: MovimentoGiftCard[]
  creataIl: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Banco alimentari
 * ────────────────────────────────────────────────────────────────────── */

export type ProdottoFood = {
  id: string
  nome: string
  descrizione: string
  categoria: CategoriaFood
  prezzo: number
  immagine: string
  palette: [string, string]
  allergeni: string[]
  /** Voci comprese in un combo, mostrate sotto il nome. */
  contenuto: string[]
  /** Cinema in cui il prodotto è disponibile; vuoto = tutti. */
  cinemaIds: string[]
  disponibile: boolean
  inEvidenza: boolean
  ordine: number
}

/* ─────────────────────────────────────────────────────────────────────────
 * Notifiche e registro
 * ────────────────────────────────────────────────────────────────────── */

export type Notifica = {
  id: string
  clienteId: string
  canale: CanaleNotifica
  tipo: 'conferma-ordine' | 'promemoria' | 'promozione' | 'punti' | 'gift-card' | 'sistema'
  titolo: string
  testo: string
  riferimento: string
  stato: 'in-coda' | 'inviata' | 'errore'
  /** Momento in cui va spedita: i promemoria partono prima dello spettacolo. */
  programmataPer: string
  inviataIl: string
  creataIl: string
}

/**
 * Registro delle operazioni sensibili: accessi al pannello, modifiche al
 * listino, rimborsi, verifiche dei biglietti. Serve a rispondere alla domanda
 * «chi ha annullato questa prenotazione e quando».
 */
export type VoceRegistro = {
  id: string
  quando: string
  attore: string
  azione: string
  oggetto: string
  dettaglio: string
}

/* ─────────────────────────────────────────────────────────────────────────
 * Impostazioni generali
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Tutto ciò che l'amministratore può cambiare senza toccare il codice, nome
 * del marchio compreso.
 */
export type Impostazioni = {
  marchio: {
    nome: string
    claim: string
    descrizione: string
    dominio: string
    email: string
    telefono: string
    /** Accento principale e secondario, in esadecimale. */
    colore: string
    coloreAlt: string
  }
  social: { instagram: string; facebook: string; tiktok: string; youtube: string }
  /** Commissione fissa per prenotazione, in euro. */
  commissioneServizio: number
  /** Commissione per singolo biglietto, in euro. */
  commissionePerBiglietto: number
  /** Minuti per cui i posti restano bloccati durante il checkout. */
  minutiBloccoPosti: number
  /** Minuti prima dell'inizio in cui la vendita online si chiude. */
  chiusuraVenditaMinuti: number
  postiMassimiPerOrdine: number
  /** Punti fedeltà accreditati per ogni euro speso. */
  puntiPerEuro: number
  /** Valore in euro di un punto quando viene riscattato. */
  valorePunto: number
  /** Supplemento per formato, in euro. */
  supplementiFormato: Record<Formato, number>
  /** Supplemento per tipo di poltrona, in euro. */
  supplementiPosto: Record<'standard' | 'premium' | 'disabili' | 'accompagnatore', number>
  moduli: {
    loyalty: boolean
    abbonamenti: boolean
    food: boolean
    giftCard: boolean
    registrazione: boolean
  }
}

/* ─────────────────────────────────────────────────────────────────────────
 * Archivio
 * ────────────────────────────────────────────────────────────────────── */

/**
 * Collezioni conservate nel deposito.
 *
 * L'ordine conta solo per la leggibilità del file JSON. Aggiungere una
 * collezione significa aggiungerla qui, al tipo `Archivio` e a `normalizza`
 * in `lib/archivio.ts`: nient'altro.
 */
export const COLLEZIONI = [
  'impostazioni',
  'film',
  'cinema',
  'sale',
  'spettacoli',
  'tipologieBiglietto',
  'prenotazioni',
  'clienti',
  'livelliLoyalty',
  'premiLoyalty',
  'movimentiPunti',
  'piani',
  'sottoscrizioni',
  'promozioni',
  'coupon',
  'giftCard',
  'food',
  'notifiche',
  'registro',
] as const

export type Collezione = (typeof COLLEZIONI)[number]

export type Archivio = {
  /** Unica voce non-elenco dell'archivio. */
  impostazioni: Impostazioni
  film: Film[]
  cinema: Cinema[]
  sale: Sala[]
  spettacoli: Spettacolo[]
  tipologieBiglietto: TipologiaBiglietto[]
  prenotazioni: Prenotazione[]
  clienti: Cliente[]
  livelliLoyalty: LivelloLoyalty[]
  premiLoyalty: PremioLoyalty[]
  movimentiPunti: MovimentoPunti[]
  piani: PianoAbbonamento[]
  sottoscrizioni: Sottoscrizione[]
  promozioni: Promozione[]
  coupon: Coupon[]
  giftCard: GiftCard[]
  food: ProdottoFood[]
  notifiche: Notifica[]
  registro: VoceRegistro[]
}

/* ─────────────────────────────────────────────────────────────────────────
 * Tipi di servizio usati fra client e server
 * ────────────────────────────────────────────────────────────────────── */

/** Cliente come lo vede il browser: senza impronta della password. */
export type ClientePubblico = Omit<Cliente, 'password'>

/** Occupazione di uno spettacolo, restituita dalla rotta `disponibilita`. */
export type Disponibilita = {
  spettacoloId: string
  /** Chiavi `fila-numero` dei posti non più acquistabili. */
  occupati: string[]
  /** Posti liberi residui. */
  liberi: number
  totale: number
  /** La vendita online è chiusa perché lo spettacolo sta per iniziare. */
  venditaChiusa: boolean
}

/** Riga di prezzo calcolata dal motore: è ciò che il riepilogo mostra. */
export type RigaPrezzo = {
  etichetta: string
  dettaglio: string
  importo: number
}

/** Esito completo del calcolo di un ordine. */
export type Conto = {
  righe: RigaPrezzo[]
  importoBiglietti: number
  importoFood: number
  sconto: number
  scontiApplicati: { etichetta: string; importo: number }[]
  commissioni: number
  totale: number
  puntiAccreditati: number
}
