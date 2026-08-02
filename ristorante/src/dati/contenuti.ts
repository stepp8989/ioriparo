import type { Evento, OrarioGiorno, Recensione } from '@/lib/tipi'

/** Recensioni iniziali: dal pannello si pubblicano, si nascondono e si eliminano. */
export const RECENSIONI_INIZIALI: Recensione[] = [
  {
    id: 'rec-1',
    autore: 'Giulia Ferretti',
    testo:
      'Cena impeccabile. Il vitello tonnato è il migliore che abbia mai assaggiato e il servizio ' +
      'sa essere attento senza mai risultare invadente. Torneremo di sicuro.',
    voto: 5,
    data: '2026-06-18',
    fonte: 'google',
    pubblicata: true,
  },
  {
    id: 'rec-2',
    autore: 'Marco Bellini',
    testo:
      'Sala curata nei minimi dettagli e carta dei vini davvero interessante. I tagliolini al ' +
      'tartufo valgono da soli il viaggio.',
    voto: 5,
    data: '2026-05-30',
    fonte: 'google',
    pubblicata: true,
  },
  {
    id: 'rec-3',
    autore: 'Chiara De Santis',
    testo:
      'Abbiamo festeggiato un anniversario: tavolo riservato con cura, dolce a sorpresa e ' +
      'atmosfera perfetta. Rapporto qualità prezzo ottimo per il livello.',
    voto: 5,
    data: '2026-05-11',
    fonte: 'google',
    pubblicata: true,
  },
  {
    id: 'rec-4',
    autore: 'Alessandro Ruggeri',
    testo:
      'La fiorentina è cotta come si deve, croccante fuori e rosata dentro. Unico appunto: ' +
      'nel fine settimana conviene prenotare con largo anticipo.',
    voto: 4,
    data: '2026-04-27',
    fonte: 'tripadvisor',
    pubblicata: true,
  },
  {
    id: 'rec-5',
    autore: 'Federica Landi',
    testo:
      'Personale gentilissimo, hanno gestito senza problemi la mia intolleranza al glutine ' +
      'proponendo alternative per ogni portata. Esperienza da consigliare.',
    voto: 5,
    data: '2026-04-09',
    fonte: 'google',
    pubblicata: true,
  },
  {
    id: 'rec-6',
    autore: 'Tommaso Neri',
    testo:
      'Ambiente elegante e luce curata. Il polpo alla brace è stato la sorpresa della serata, ' +
      'accompagnato da un Vermentino consigliato dal sommelier.',
    voto: 5,
    data: '2026-03-22',
    fonte: 'diretta',
    pubblicata: true,
  },
]

/** Orari di apertura iniziali, modificabili dal pannello. */
export const ORARI_INIZIALI: OrarioGiorno[] = [
  { giorno: 'Lunedì', chiuso: true, pranzo: null, cena: null },
  { giorno: 'Martedì', chiuso: false, pranzo: '12:30 – 14:30', cena: '19:00 – 23:00' },
  { giorno: 'Mercoledì', chiuso: false, pranzo: '12:30 – 14:30', cena: '19:00 – 23:00' },
  { giorno: 'Giovedì', chiuso: false, pranzo: '12:30 – 14:30', cena: '19:00 – 23:00' },
  { giorno: 'Venerdì', chiuso: false, pranzo: '12:30 – 14:30', cena: '19:00 – 23:30' },
  { giorno: 'Sabato', chiuso: false, pranzo: '12:30 – 15:00', cena: '19:00 – 23:30' },
  { giorno: 'Domenica', chiuso: false, pranzo: '12:30 – 15:00', cena: '19:00 – 22:30' },
]

/** Eventi e promozioni in evidenza sul sito. */
export const EVENTI_INIZIALI: Evento[] = [
  {
    id: 'evt-tartufo',
    titolo: 'Settimana del tartufo bianco',
    sottotitolo: 'Dal 12 al 19 novembre',
    descrizione:
      'Sette giorni con un menù dedicato al tartufo bianco di San Miniato, in abbinamento a una ' +
      'selezione di Sangiovese scelti dal nostro sommelier.',
    data: '2026-11-12',
    immagine: '/immagini/eventi/evt-tartufo.jpg',
    attivo: true,
  },
  {
    id: 'evt-degustazione',
    titolo: 'Cena degustazione a quattro mani',
    sottotitolo: 'Ultimo giovedì del mese',
    descrizione:
      'Sei portate firmate dal nostro chef insieme a un ospite diverso ogni mese, con racconto ' +
      'dei piatti in sala e abbinamento al calice.',
    data: '2026-09-24',
    immagine: '/immagini/eventi/evt-degustazione.jpg',
    attivo: true,
  },
  {
    id: 'evt-pranzo-lavoro',
    titolo: 'Pranzo di lavoro',
    sottotitolo: 'Da martedì a venerdì',
    descrizione:
      'Due portate, acqua e caffè a 24 €. Servizio garantito entro un’ora, su prenotazione.',
    data: '2026-01-07',
    immagine: '/immagini/eventi/evt-pranzo-lavoro.jpg',
    attivo: true,
  },
]

/** Squadra mostrata nella pagina "Chi siamo". */
export const SQUADRA = [
  {
    nome: 'Lorenzo Amati',
    ruolo: 'Chef executive',
    biografia:
      'Formato fra Firenze e Copenaghen, guida la cucina dal 2014. La sua idea di piatto parte ' +
      'sempre dal produttore: prima la materia prima, poi la tecnica.',
    immagine: '/immagini/squadra/chef.jpg',
  },
  {
    nome: 'Sara Bonetti',
    ruolo: 'Maître di sala',
    biografia:
      'Vent’anni di sala fra Italia e Francia. Coordina il servizio e cura l’accoglienza, ' +
      'perché una cena riuscita comincia dal modo in cui si viene ricevuti.',
    immagine: '/immagini/squadra/maitre.jpg',
  },
  {
    nome: 'Davide Lucchesi',
    ruolo: 'Sommelier',
    biografia:
      'Seleziona le oltre trecento etichette della carta, con particolare attenzione ai piccoli ' +
      'produttori toscani che lavorano in biologico.',
    immagine: '/immagini/squadra/sommelier.jpg',
  },
  {
    nome: 'Elena Vitali',
    ruolo: 'Pastry chef',
    biografia:
      'Dalla pasticceria classica francese alla rilettura dei dolci della tradizione toscana. ' +
      'Ogni lievitato del ristorante nasce dalle sue mani.',
    immagine: '/immagini/squadra/pastry.jpg',
  },
] as const

/** Valori raccontati nella pagina "Chi siamo". */
export const VALORI = [
  {
    titolo: 'Materia prima',
    testo:
      'Lavoriamo con quaranta piccoli produttori entro cento chilometri. La carta cambia quattro ' +
      'volte l’anno perché segue le stagioni, non il contrario.',
  },
  {
    titolo: 'Tecnica',
    testo:
      'Fondi, paste fresche e lievitati sono fatti in casa ogni giorno. Nessuna scorciatoia: ' +
      'la cucina apre alle sei del mattino.',
  },
  {
    titolo: 'Ospitalità',
    testo:
      'Un tavolo prenotato resta vostro per tutta la sera. Nessun doppio turno, nessuna fretta: ' +
      'il tempo è parte del servizio.',
  },
  {
    titolo: 'Rispetto',
    testo:
      'Riduciamo gli sprechi con un menù a spreco zero, differenziamo il cento per cento dei ' +
      'rifiuti e compensiamo i consumi con energia da fonti rinnovabili.',
  },
] as const

/** Tappe della storia del ristorante. */
export const STORIA = [
  {
    anno: '1998',
    titolo: 'La prima sala',
    testo:
      'Aurea nasce come trattoria di famiglia con dodici coperti, un forno a legna e la ricetta ' +
      'del ragù della nonna Rosa.',
  },
  {
    anno: '2006',
    titolo: 'La cantina',
    testo:
      'Recuperiamo le volte in mattoni del piano interrato e nasce la cantina: oggi custodisce ' +
      'oltre trecento etichette.',
  },
  {
    anno: '2014',
    titolo: 'La nuova cucina',
    testo:
      'Arriva lo chef Lorenzo Amati. La carta si apre alla cucina contemporanea mantenendo ' +
      'salde le radici toscane.',
  },
  {
    anno: '2023',
    titolo: 'Il riconoscimento',
    testo:
      'Entriamo nelle guide nazionali e la sala viene ripensata: materiali caldi, luce bassa, ' +
      'sessantaquattro coperti.',
  },
] as const

/** Numeri mostrati nella sezione "Chi siamo" della home. */
export const NUMERI = [
  { valore: 27, suffisso: '', etichetta: 'Anni di attività' },
  { valore: 40, suffisso: '', etichetta: 'Produttori selezionati' },
  { valore: 300, suffisso: '+', etichetta: 'Etichette in cantina' },
  { valore: 64, suffisso: '', etichetta: 'Coperti in sala' },
] as const

/** Fotografie della galleria. */
export const GALLERIA = [
  { file: 'sala-principale', titolo: 'La sala principale', formato: 'verticale' },
  { file: 'brace', titolo: 'La brace di leccio', formato: 'orizzontale' },
  { file: 'mise-en-place', titolo: 'Mise en place', formato: 'quadrato' },
  { file: 'cantina', titolo: 'La cantina storica', formato: 'verticale' },
  { file: 'pasta-fresca', titolo: 'Pasta tirata a mano', formato: 'orizzontale' },
  { file: 'dettaglio-tavolo', titolo: 'Dettaglio di tavolo', formato: 'quadrato' },
  { file: 'cucina', titolo: 'La cucina a vista', formato: 'orizzontale' },
  { file: 'dehors', titolo: 'Il dehors sul cortile', formato: 'verticale' },
  { file: 'bancone', titolo: 'Il bancone dei cocktail', formato: 'quadrato' },
  { file: 'dessert', titolo: 'Il carrello dei dolci', formato: 'orizzontale' },
  { file: 'ingresso', titolo: 'L’ingresso su strada', formato: 'verticale' },
  { file: 'brindisi', titolo: 'Brindisi in cantina', formato: 'quadrato' },
] as const

/** Domande frequenti: alimentano anche i dati strutturati `FAQPage`. */
export const FAQ = [
  {
    domanda: 'Serve prenotare?',
    risposta:
      'È consigliato, soprattutto nel fine settimana. Potete prenotare dal sito in meno di un ' +
      'minuto, per telefono o su WhatsApp: la conferma arriva subito via email.',
  },
  {
    domanda: 'Gestite intolleranze e allergie?',
    risposta:
      'Sì. Ogni piatto del menù riporta gli allergeni presenti e la cucina prepara alternative ' +
      'senza glutine e senza lattosio. Segnalatecelo nelle richieste particolari.',
  },
  {
    domanda: 'C’è un menù vegetariano?',
    risposta:
      'Ogni sezione della carta contiene almeno una proposta vegetariana e su richiesta lo chef ' +
      'compone un percorso degustazione completamente vegetale.',
  },
  {
    domanda: 'Si può parcheggiare vicino?',
    risposta:
      'Il ristorante si trova in zona a traffico limitato. Il parcheggio convenzionato più ' +
      'vicino è a duecento metri e per gli ospiti la prima ora è gratuita.',
  },
  {
    domanda: 'Organizzate eventi privati?',
    risposta:
      'La cantina ospita fino a venti persone per cene private, aziendali o ricorrenze. ' +
      'Scriveteci e prepariamo una proposta su misura.',
  },
] as const
