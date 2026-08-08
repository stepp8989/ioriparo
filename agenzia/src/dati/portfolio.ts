/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Vetrina dei progetti.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ATTENZIONE — contenuto dimostrativo. Nomi, numeri e risultati qui sotto sono
 * inventati e servono a far vedere come si presenta la sezione. Prima di
 * mettere il sito online vanno sostituiti con lavori reali, o rimossi: numeri
 * di crescita attribuiti a clienti che non esistono sono pubblicità
 * ingannevole, non un esempio di stile.
 *
 * Nessuna fotografia: ogni progetto è disegnato dal vivo in SVG da
 * `MockupSito`, che compone l'anteprima con i colori e i blocchi indicati qui.
 * Così la sezione non pesa nulla, resta nitida su ogni schermo e si aggiorna
 * cambiando due righe. Per usare vere schermate basta sostituire il mockup con
 * un `<Image>` dentro `SchermoProgetto`.
 */

/** Blocchi disponibili per comporre l'anteprima di un sito. */
export type Blocco =
  | 'eroe-grande'
  | 'eroe-diviso'
  | 'ricerca'
  | 'griglia-3'
  | 'griglia-4'
  | 'elenco'
  | 'galleria'
  | 'prezzi'
  | 'modulo'
  | 'mappa'
  | 'fascia'

export type Progetto = {
  id: string
  /** Nome dell'attività (fittizio finché non lo si sostituisce). */
  nome: string
  categoria: string
  /** Una riga che dice cos'è il sito. */
  sommario: string
  /** Il racconto del progetto, nella scheda che si apre. */
  descrizione: string
  /** Cosa è stato costruito, in punti. */
  funzioni: string[]
  /** Tre risultati da mostrare nella scheda. Numeri dimostrativi. */
  risultati: { valore: string; etichetta: string }[]
  anno: number
  /** Colori dell'anteprima: due tinte del marchio del cliente. */
  palette: { primario: string; secondario: string; fondo: string; chiaro: boolean }
  /** Struttura dell'anteprima, dall'alto verso il basso. */
  blocchi: Blocco[]
}

export const PROGETTI: Progetto[] = [
  {
    id: 'ristorante',
    nome: 'Osteria del Faro',
    categoria: 'Ristoranti',
    sommario: 'Menu digitale, prenotazione del tavolo e serate a tema.',
    descrizione:
      'Il menu cambiava ogni settimana e finiva sempre in un PDF che nessuno apriva dal telefono. ' +
      'Ora il menu è una pagina vera, aggiornabile dalla cucina in trenta secondi, e la ' +
      'prenotazione arriva sul telefono della sala con il numero di coperti già dentro.',
    funzioni: [
      'Menu con allergeni, aggiornabile dal pannello',
      'Prenotazione del tavolo con conferma automatica',
      'Calendario delle serate a tema e dei menu degustazione',
      'Galleria dei piatti e recensioni raccolte da Google',
    ],
    risultati: [
      { valore: '+68%', etichetta: 'prenotazioni dal sito' },
      { valore: '0,9 s', etichetta: 'apertura da telefono' },
      { valore: '4,9★', etichetta: 'media recensioni' },
    ],
    anno: 2025,
    palette: { primario: '#e0a94a', secondario: '#7b2d26', fondo: '#141013', chiaro: false },
    blocchi: ['eroe-grande', 'elenco', 'galleria', 'modulo'],
  },
  {
    id: 'hotel',
    nome: 'Hotel Marea',
    categoria: 'Hotel',
    sommario: 'Camere, disponibilità in tempo reale e prenotazione diretta.',
    descrizione:
      'Ogni prenotazione passava da un portale che si prendeva il quindici per cento. Il sito ' +
      'nuovo mostra la disponibilità reale e permette di prenotare direttamente, con il ' +
      'confronto onesto fra il prezzo del portale e quello della struttura.',
    funzioni: [
      'Calendario delle disponibilità e tariffe per periodo',
      'Prenotazione diretta con caparra online',
      'Schede camera con galleria e servizi',
      'Pagine in italiano, inglese e tedesco',
    ],
    risultati: [
      { valore: '+41%', etichetta: 'prenotazioni dirette' },
      { valore: '-15%', etichetta: 'commissioni ai portali' },
      { valore: '3', etichetta: 'lingue attive' },
    ],
    anno: 2025,
    palette: { primario: '#4fb3c9', secondario: '#0f4c5c', fondo: '#f4f8f9', chiaro: true },
    blocchi: ['eroe-diviso', 'ricerca', 'griglia-3', 'prezzi', 'mappa'],
  },
  {
    id: 'negozio',
    nome: 'Bottega Nord',
    categoria: 'Negozi',
    sommario: 'Vetrina del negozio, arrivi della settimana e ritiro in sede.',
    descrizione:
      'Un negozio di quartiere che vendeva già bene di persona ma online non esisteva. Il sito ' +
      'porta in vetrina gli arrivi della settimana e chi guarda entra a ritirarli: niente ' +
      'spedizioni, solo traffico vero verso la porta del negozio.',
    funzioni: [
      'Vetrina degli arrivi, aggiornata dal telefono',
      'Prenota e ritira in negozio',
      'Orari, indirizzo e percorso in un tocco',
      'Collegamento con la scheda Google Business',
    ],
    risultati: [
      { valore: '+120%', etichetta: 'visite alla scheda Google' },
      { valore: '+34%', etichetta: 'ingressi in negozio' },
      { valore: '5 min', etichetta: 'per aggiornare la vetrina' },
    ],
    anno: 2024,
    palette: { primario: '#f0653f', secondario: '#2a2118', fondo: '#fdf7f2', chiaro: true },
    blocchi: ['eroe-grande', 'griglia-4', 'fascia', 'mappa'],
  },
  {
    id: 'officina',
    nome: 'Officina Bruni',
    categoria: 'Officine',
    sommario: 'Prenotazione del tagliando e preventivo guidato.',
    descrizione:
      'Il telefono squillava tutto il giorno per fissare tagliandi. Adesso il sito raccoglie ' +
      'targa, modello e intervento richiesto, propone gli slot liberi e manda tutto in officina ' +
      'già ordinato. Il telefono resta libero per chi ha un problema vero.',
    funzioni: [
      'Prenotazione dell’appuntamento con slot disponibili',
      'Preventivo guidato per gomme, tagliando e revisione',
      'Promemoria della scadenza revisione via email',
      'Storico degli interventi per ogni veicolo',
    ],
    risultati: [
      { valore: '-60%', etichetta: 'telefonate per appuntamenti' },
      { valore: '+27%', etichetta: 'tagliandi prenotati' },
      { valore: '24/7', etichetta: 'agenda sempre aperta' },
    ],
    anno: 2024,
    palette: { primario: '#3ba3ff', secondario: '#12202f', fondo: '#0f141c', chiaro: false },
    blocchi: ['eroe-diviso', 'griglia-3', 'modulo', 'fascia'],
  },
  {
    id: 'concessionaria',
    nome: 'Aurora Motori',
    categoria: 'Concessionarie',
    sommario: 'Catalogo con filtri, rata calcolata e test drive.',
    descrizione:
      'Il parco veicoli viveva su un portale di annunci. Oggi vive sul sito della ' +
      'concessionaria: filtri per marca, alimentazione e chilometri, rata calcolata sotto ogni ' +
      'prezzo e prenotazione del test drive senza passare da nessuno.',
    funzioni: [
      'Catalogo con nove filtri e ordinamento',
      'Scheda veicolo con galleria, dotazioni e video',
      'Simulatore di rata e valutazione della permuta',
      'Prenotazione del test drive e area clienti',
    ],
    risultati: [
      { valore: '+52%', etichetta: 'richieste di contatto' },
      { valore: '9', etichetta: 'filtri di ricerca' },
      { valore: '-70%', etichetta: 'spesa in annunci' },
    ],
    anno: 2025,
    palette: { primario: '#e59243', secondario: '#1f170f', fondo: '#0a0705', chiaro: false },
    blocchi: ['eroe-grande', 'ricerca', 'griglia-3', 'prezzi', 'modulo'],
  },
  {
    id: 'immobiliare',
    nome: 'Studio Immobiliare Sole',
    categoria: 'Agenzie immobiliari',
    sommario: 'Ricerca immobili, visite guidate e valutazione online.',
    descrizione:
      'Chi cerca casa guarda cinquanta annunci prima di alzare il telefono. Il sito rende quei ' +
      'cinquanta minuti piacevoli: ricerca sulla mappa, planimetrie, giro virtuale e un modulo ' +
      'di valutazione che porta in agenzia chi vuole vendere.',
    funzioni: [
      'Ricerca su mappa con filtri per zona, prezzo e metratura',
      'Scheda immobile con planimetria e giro virtuale',
      'Valutazione gratuita del proprio immobile',
      'Richiesta di visita con scelta del giorno',
    ],
    risultati: [
      { valore: '+83%', etichetta: 'richieste di visita' },
      { valore: '+45', etichetta: 'valutazioni al mese' },
      { valore: '2,1 min', etichetta: 'tempo medio sul sito' },
    ],
    anno: 2024,
    palette: { primario: '#2f855a', secondario: '#1a3c30', fondo: '#f6faf7', chiaro: true },
    blocchi: ['eroe-diviso', 'ricerca', 'griglia-4', 'mappa', 'modulo'],
  },
  {
    id: 'assicurazioni',
    nome: 'Assicura Più',
    categoria: 'Assicurazioni',
    sommario: 'Preventivi guidati, area cliente e polizze sempre a portata.',
    descrizione:
      'Un’agenzia assicurativa vive di fiducia e di documenti. Il sito mette le polizze in ' +
      'un’area riservata, i preventivi in un percorso di quattro domande e le scadenze in un ' +
      'promemoria automatico: meno carta, più rinnovi.',
    funzioni: [
      'Preventivo guidato per auto, casa, salute e attività',
      'Area cliente con polizze, scadenze e documenti',
      'Denuncia sinistro con caricamento delle foto',
      'Promemoria automatico dei rinnovi',
    ],
    risultati: [
      { valore: '+58%', etichetta: 'preventivi richiesti' },
      { valore: '94%', etichetta: 'rinnovi confermati' },
      { valore: '4', etichetta: 'rami gestiti online' },
    ],
    anno: 2025,
    palette: { primario: '#3757d8', secondario: '#101a3a', fondo: '#f5f7fe', chiaro: true },
    blocchi: ['eroe-diviso', 'griglia-4', 'prezzi', 'modulo'],
  },
  {
    id: 'professionisti',
    nome: 'Studio Legale Ferri',
    categoria: 'Professionisti',
    sommario: 'Aree di competenza, appuntamenti e articoli di approfondimento.',
    descrizione:
      'Per un professionista il sito è il primo colloquio. Questo racconta le aree di ' +
      'competenza con parole comprensibili, mostra il volto dello studio e permette di fissare ' +
      'un primo appuntamento senza la soggezione della telefonata.',
    funzioni: [
      'Schede delle aree di competenza',
      'Prenotazione del primo appuntamento, anche in video',
      'Approfondimenti e aggiornamenti normativi',
      'Modulo riservato per l’invio dei documenti',
    ],
    risultati: [
      { valore: '+37%', etichetta: 'primi appuntamenti' },
      { valore: '1ª', etichetta: 'pagina su Google in zona' },
      { valore: '100%', etichetta: 'accessibilità AA' },
    ],
    anno: 2024,
    palette: { primario: '#8a6d3b', secondario: '#1b1a17', fondo: '#faf8f4', chiaro: true },
    blocchi: ['eroe-grande', 'griglia-3', 'elenco', 'modulo'],
  },
  {
    id: 'ecommerce',
    nome: 'Sale & Fieno',
    categoria: 'E-commerce',
    sommario: 'Negozio online di prodotti tipici, con spedizioni in tutta Italia.',
    descrizione:
      'Un piccolo produttore con un magazzino pieno e nessun modo di venderlo fuori dall’isola. ' +
      'Il negozio online gestisce varianti, scorte e spedizioni, e i pacchi partono con ' +
      'l’etichetta già stampata dal pannello.',
    funzioni: [
      'Catalogo con varianti, scorte e confezioni regalo',
      'Pagamenti con carta, PayPal e Satispay',
      'Spedizioni calcolate per peso e destinazione',
      'Codici sconto, recupero carrelli e newsletter',
    ],
    risultati: [
      { valore: '+215%', etichetta: 'fatturato online' },
      { valore: '2,4%', etichetta: 'tasso di conversione' },
      { valore: '48 h', etichetta: 'dalla spesa alla spedizione' },
    ],
    anno: 2025,
    palette: { primario: '#c2410c', secondario: '#2b1a10', fondo: '#fffaf5', chiaro: true },
    blocchi: ['eroe-grande', 'ricerca', 'griglia-4', 'fascia', 'prezzi'],
  },
  {
    id: 'azienda',
    nome: 'Nordest Costruzioni',
    categoria: 'Aziende',
    sommario: 'Presentazione aziendale, cantieri realizzati e lavora con noi.',
    descrizione:
      'Un’impresa da quaranta dipendenti che si presentava con un profilo su un portale di ' +
      'settore. Ora ha un sito che racconta i cantieri, le certificazioni e le persone, e che ' +
      'raccoglie candidature senza passare dalle agenzie.',
    funzioni: [
      'Racconto dei cantieri realizzati per settore',
      'Certificazioni, sicurezza e bilancio di sostenibilità',
      'Lavora con noi con invio del curriculum',
      'Area riservata per fornitori e capicantiere',
    ],
    risultati: [
      { valore: '+29', etichetta: 'candidature spontanee' },
      { valore: '+64%', etichetta: 'richieste da nuovi settori' },
      { valore: '12', etichetta: 'cantieri raccontati' },
    ],
    anno: 2023,
    palette: { primario: '#0ea5e9', secondario: '#0c2337', fondo: '#f4f9fc', chiaro: true },
    blocchi: ['eroe-diviso', 'fascia', 'griglia-3', 'galleria', 'modulo'],
  },
]
