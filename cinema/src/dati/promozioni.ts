import type { Promozione } from '@/lib/tipi'

/**
 * Promozioni dimostrative.
 *
 * Sono scritte per coprire tutte le meccaniche che il motore dei prezzi sa
 * applicare, così chi prova la piattaforma le vede funzionare davvero invece
 * di leggerne la descrizione:
 *
 *   — due promozioni automatiche, senza codice, che si applicano da sole nel
 *     giorno e nell'orario giusto;
 *   — una con codice, da digitare al checkout;
 *   — una riservata agli abbonati;
 *   — una legata al livello CLUB;
 *   — una che non sconta nulla ma moltiplica i punti.
 *
 * Le date coprono tutto il 2026: in una installazione vera le mette
 * l'amministratore, e scaduta la data la promozione smette di applicarsi da
 * sola senza bisogno di ricordarsi di disattivarla.
 */

/** Riempie i campi che quasi tutte le promozioni lasciano al valore neutro. */
function promozione(dati: Partial<Promozione> & Pick<Promozione, 'id' | 'slug' | 'titolo' | 'tipo'>): Promozione {
  return {
    sottotitolo: '',
    descrizione: '',
    valore: 0,
    codice: '',
    immagine: '',
    palette: ['#2a1040', '#ff4d7d'],
    dal: '2026-01-01',
    al: '2026-12-31',
    giorniValidi: [],
    oraDa: '',
    oraA: '',
    cinemaIds: [],
    filmIds: [],
    formati: [],
    limiteUtilizzi: 0,
    limitePerCliente: 0,
    utilizzi: 0,
    soloAbbonati: false,
    livelliRichiesti: [],
    attiva: true,
    inEvidenza: false,
    creataIl: '2026-01-08T09:00:00.000Z',
    ...dati,
  } as Promozione
}

export const PROMOZIONI_INIZIALI: Promozione[] = [
  promozione({
    id: 'pro-mercoledi',
    slug: 'mercoledi-al-cinema',
    titolo: 'Mercoledì al cinema',
    sottotitolo: 'Tutti i mercoledì, tutto il giorno',
    descrizione:
      'Il mercoledì il biglietto costa il 30% in meno in tutte le sale della rete, su qualsiasi spettacolo e in qualsiasi formato. Non serve nessun codice: lo sconto compare da solo nel riepilogo.',
    tipo: 'percentuale',
    valore: 30,
    // Nessun codice: si applica da sola. È la differenza fra una promozione
    // che il pubblico usa e una che il pubblico scopre dopo aver pagato.
    giorniValidi: [3],
    palette: ['#1b1140', '#a06bff'],
    inEvidenza: true,
  }),

  promozione({
    id: 'pro-happy-hour',
    slug: 'happy-hour',
    titolo: 'Happy hour',
    sottotitolo: 'Dal lunedì al giovedì, spettacoli prima delle 18',
    descrizione:
      'Due euro in meno su ogni biglietto degli spettacoli pomeridiani infrasettimanali. Pensata per chi può permettersi il cinema di pomeriggio: studenti, turni spezzati, pensionati.',
    tipo: 'fisso',
    valore: 2,
    giorniValidi: [1, 2, 4],
    oraA: '17:59',
    palette: ['#3d2a0f', '#ffd166'],
  }),

  promozione({
    id: 'pro-duepertre',
    slug: 'due-al-prezzo-di-uno',
    titolo: '2x1 del fine settimana',
    sottotitolo: 'Sabato e domenica con il codice DUEPOSTI',
    descrizione:
      'Acquista due biglietti per lo stesso spettacolo del fine settimana e paghi solo il più caro. Inserisci il codice DUEPOSTI al momento del pagamento. Con più di due biglietti lo sconto si applica a coppie.',
    tipo: '2x1',
    codice: 'DUEPOSTI',
    giorniValidi: [0, 6],
    limitePerCliente: 2,
    palette: ['#2b0a10', '#ff5252'],
    inEvidenza: true,
  }),

  promozione({
    id: 'pro-abbonati',
    slug: 'imax-abbonati',
    titolo: 'IMAX per abbonati',
    sottotitolo: 'Il supplemento IMAX dimezzato',
    descrizione:
      'Chi ha un abbonamento attivo paga metà del supplemento IMAX su tutti gli spettacoli della sala 1 di Cagliari Marina.',
    tipo: 'fisso',
    valore: 1.75,
    formati: ['IMAX'],
    soloAbbonati: true,
    cinemaIds: ['cin-cagliari'],
    palette: ['#10283a', '#4dd0e1'],
  }),

  promozione({
    id: 'pro-platinum',
    slug: 'anteprima-platinum',
    titolo: 'Anteprime Platinum',
    sottotitolo: 'Riservata al livello CLUB Platinum',
    descrizione:
      'Sconto del 50% sulle anteprime del giovedì sera, riservato a chi ha raggiunto il livello Platinum del programma CLUB.',
    tipo: 'percentuale',
    valore: 50,
    giorniValidi: [4],
    oraDa: '20:00',
    livelliRichiesti: ['liv-platinum'],
    palette: ['#2b1a3d', '#c4b5fd'],
  }),

  promozione({
    id: 'pro-punti-tripli',
    slug: 'punti-tripli',
    titolo: 'Punti tripli sulle prime visioni',
    sottotitolo: 'Nei primi dieci giorni di programmazione',
    descrizione:
      'Non toglie nulla dal conto: moltiplica per tre i punti CLUB guadagnati. Conviene a chi il cinema lo frequenta, che è esattamente il pubblico che un programma fedeltà deve premiare.',
    tipo: 'punti-extra',
    valore: 3,
    filmIds: ['fil-battiti', 'fil-corsa'],
    palette: ['#213a1c', '#b9e06f'],
  }),

  promozione({
    id: 'pro-famiglia',
    slug: 'domenica-in-famiglia',
    titolo: 'Domenica in famiglia',
    sottotitolo: 'Quattro biglietti, uno in omaggio',
    descrizione:
      'La domenica mattina e pomeriggio, sui film per famiglie: con quattro biglietti nello stesso ordine il meno caro è gratis. Codice FAMIGLIA.',
    tipo: '2x1',
    codice: 'FAMIGLIA',
    giorniValidi: [0],
    oraA: '17:59',
    filmIds: ['fil-comete', 'fil-custode'],
    limitePerCliente: 4,
    palette: ['#13263f', '#79c7ff'],
  }),
]
