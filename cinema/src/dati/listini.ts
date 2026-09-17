import type { LivelloLoyalty, PianoAbbonamento, PremioLoyalty, TipologiaBiglietto } from '@/lib/tipi'

/**
 * Listini di partenza: tipologie di biglietto, livelli fedeltà, premi e piani
 * di abbonamento.
 *
 * Nessuno di questi valori è scritto nel codice dell'applicazione: sono dati,
 * e il pannello li modifica. Le soglie dei livelli, in particolare, non
 * compaiono in nessun `if`: chi gestisce la rete può aggiungere un livello
 * «Onyx» sopra Platinum senza toccare una riga di TypeScript.
 */

/* ── Biglietti ───────────────────────────────────────────────────────────
 *
 * `variazione` è la differenza rispetto al prezzo base dello spettacolo.
 * Tenerla come differenza invece che come prezzo assoluto è ciò che permette
 * di alzare il listino di un cinema, o di fare un mercoledì scontato, senza
 * rimettere mano a otto tipologie una per una.
 */
export const TIPOLOGIE_INIZIALI: TipologiaBiglietto[] = [
  {
    id: 'tip-intero',
    nome: 'Intero',
    descrizione: 'Il biglietto standard, senza requisiti.',
    variazione: 0,
    richiedeDocumento: false,
    massimoPerOrdine: 0,
    attiva: true,
    ordine: 1,
  },
  {
    id: 'tip-ridotto',
    nome: 'Ridotto',
    descrizione: 'Convenzioni, tessere associative e accompagnatori di persone con disabilità.',
    variazione: -1.5,
    richiedeDocumento: true,
    massimoPerOrdine: 0,
    attiva: true,
    ordine: 2,
  },
  {
    id: 'tip-studente',
    nome: 'Studente',
    descrizione: 'Con tesserino universitario o scolastico in corso di validità.',
    variazione: -2.5,
    richiedeDocumento: true,
    massimoPerOrdine: 4,
    attiva: true,
    ordine: 3,
  },
  {
    id: 'tip-under18',
    nome: 'Under 18',
    descrizione: 'Fino al compimento del diciottesimo anno.',
    variazione: -3,
    richiedeDocumento: true,
    massimoPerOrdine: 6,
    attiva: true,
    ordine: 4,
  },
  {
    id: 'tip-senior',
    nome: 'Senior',
    descrizione: 'Dai 65 anni compiuti.',
    variazione: -3,
    richiedeDocumento: true,
    massimoPerOrdine: 4,
    attiva: true,
    ordine: 5,
  },
  {
    id: 'tip-vip',
    nome: 'VIP',
    descrizione: 'Poltrona riservata, ingresso prioritario e bevanda inclusa.',
    variazione: 4.5,
    richiedeDocumento: false,
    massimoPerOrdine: 0,
    attiva: true,
    ordine: 6,
  },
]

/* ── Livelli CLUB ─────────────────────────────────────────────────────── */

export const LIVELLI_INIZIALI: LivelloLoyalty[] = [
  {
    id: 'liv-silver',
    nome: 'Silver',
    puntiMinimi: 0,
    colore: '#b9c0d4',
    vantaggi: [
      'Punti su ogni acquisto',
      'Prevendita aperta 48 ore prima',
      'Popcorn piccolo omaggio il giorno del compleanno',
    ],
    moltiplicatore: 1,
    ordine: 1,
  },
  {
    id: 'liv-gold',
    nome: 'Gold',
    puntiMinimi: 1500,
    colore: '#f0b429',
    vantaggi: [
      '+25% punti su ogni acquisto',
      'Un upgrade a poltrona premium al mese',
      'Prevendita aperta 7 giorni prima',
      'Sconto 10% sul banco',
    ],
    moltiplicatore: 1.25,
    ordine: 2,
  },
  {
    id: 'liv-platinum',
    nome: 'Platinum',
    puntiMinimi: 5000,
    colore: '#c4b5fd',
    vantaggi: [
      '+50% punti su ogni acquisto',
      'Upgrade a poltrona premium sempre compreso',
      'Anteprime riservate',
      'Sconto 20% sul banco',
      'Un biglietto omaggio ogni trimestre',
    ],
    moltiplicatore: 1.5,
    ordine: 3,
  },
]

export const PREMI_INIZIALI: PremioLoyalty[] = [
  {
    id: 'pre-popcorn',
    nome: 'Popcorn medio',
    descrizione: 'Un popcorn medio al banco, in qualsiasi cinema della rete.',
    puntiRichiesti: 450,
    tipo: 'food',
    valore: 4.5,
    attivo: true,
  },
  {
    id: 'pre-bibita',
    nome: 'Bibita grande',
    descrizione: 'Una bibita grande a scelta.',
    puntiRichiesti: 400,
    tipo: 'food',
    valore: 4,
    attivo: true,
  },
  {
    id: 'pre-upgrade',
    nome: 'Upgrade a poltrona premium',
    descrizione: 'Passa a una poltrona premium senza supplemento, sullo stesso spettacolo.',
    puntiRichiesti: 250,
    tipo: 'upgrade',
    valore: 2.5,
    attivo: true,
  },
  {
    id: 'pre-sconto5',
    nome: 'Buono da 5 €',
    descrizione: 'Cinque euro di sconto sul prossimo ordine.',
    puntiRichiesti: 500,
    tipo: 'sconto',
    valore: 5,
    attivo: true,
  },
  {
    id: 'pre-biglietto',
    nome: 'Biglietto omaggio',
    descrizione: 'Un ingresso intero 2D in qualsiasi cinema della rete.',
    puntiRichiesti: 950,
    tipo: 'biglietto',
    valore: 9.5,
    attivo: true,
  },
]

/* ── Abbonamenti ─────────────────────────────────────────────────────── */

export const PIANI_INIZIALI: PianoAbbonamento[] = [
  {
    id: 'pia-mensile',
    slug: 'mensile',
    nome: 'Mensile',
    descrizione: 'Il cinema quando capita, senza impegno. Si disdice quando si vuole.',
    prezzo: 14.9,
    periodo: 'mensile',
    ingressiInclusi: 4,
    vantaggi: [
      '4 ingressi al mese in tutta la rete',
      'Sconto 10% sul banco',
      'Nessun costo di prevendita',
      'Disdetta in qualsiasi momento',
    ],
    limitazioni: ['Formati speciali con supplemento', 'Gli ingressi non usati non si accumulano'],
    scontoFood: 10,
    formatiInclusi: ['2D'],
    colore: '#7f8bb5',
    attivo: true,
    inEvidenza: false,
    ordine: 1,
  },
  {
    id: 'pia-annuale',
    slug: 'annuale',
    nome: 'Annuale',
    descrizione: 'Due film a settimana per dodici mesi, in ogni sala e in ogni formato standard.',
    prezzo: 129,
    periodo: 'annuale',
    ingressiInclusi: 104,
    vantaggi: [
      '104 ingressi all’anno (due a settimana)',
      '3D e Dolby Atmos compresi',
      'Sconto 15% sul banco',
      'Prevendita anticipata su tutte le uscite',
      'Punti CLUB raddoppiati nel mese del compleanno',
    ],
    limitazioni: ['IMAX e 4DX con supplemento ridotto', 'Non cedibile'],
    scontoFood: 15,
    formatiInclusi: ['2D', '3D', 'Dolby Atmos'],
    colore: '#ff3f6c',
    attivo: true,
    inEvidenza: true,
    ordine: 2,
  },
  {
    id: 'pia-studenti',
    slug: 'studenti',
    nome: 'Studenti',
    descrizione: 'Per chi ha un tesserino valido: lo stesso cinema, a metà prezzo.',
    prezzo: 8.9,
    periodo: 'mensile',
    ingressiInclusi: 4,
    vantaggi: [
      '4 ingressi al mese',
      'Sconto 10% sul banco',
      'Rassegne e anteprime comprese',
      'Verifica del tesserino una volta l’anno',
    ],
    limitazioni: [
      'Riservato a studenti con tesserino in corso di validità',
      'Dal lunedì al giovedì',
      'Formati speciali con supplemento',
    ],
    scontoFood: 10,
    formatiInclusi: ['2D'],
    colore: '#4dd0e1',
    attivo: true,
    inEvidenza: false,
    ordine: 3,
  },
  {
    id: 'pia-premium',
    slug: 'premium',
    nome: 'Premium',
    descrizione: 'Tutto compreso, senza supplementi e senza contare gli ingressi.',
    prezzo: 279,
    periodo: 'annuale',
    ingressiInclusi: 0,
    vantaggi: [
      'Ingressi illimitati',
      'Tutti i formati compresi, IMAX e 4DX inclusi',
      'Poltrona premium sempre compresa',
      'Sconto 25% sul banco',
      'Due inviti per accompagnatore al mese',
      'Livello CLUB Gold garantito',
    ],
    limitazioni: ['Non cedibile', 'Massimo due spettacoli al giorno'],
    scontoFood: 25,
    formatiInclusi: ['2D', '3D', 'IMAX', '4DX', 'Dolby Atmos', 'VO sottotitolato'],
    colore: '#9d6bff',
    attivo: true,
    inEvidenza: false,
    ordine: 4,
  },
]
