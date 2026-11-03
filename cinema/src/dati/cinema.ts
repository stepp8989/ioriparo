import { generaSchema, type ConfigurazioneSala } from '@/lib/posti'
import type { Cinema, Formato, OrarioApertura, Sala } from '@/lib/tipi'

/**
 * Strutture e sale dimostrative.
 *
 * La rete è sarda per coerenza con gli altri progetti di questo repository:
 * cinque multisala fra Cagliari, Sassari, Olbia, Nuoro e Tortolì. Indirizzi e
 * recapiti sono inventati; le coordinate sono quelle reali delle città, perché
 * la ricerca per distanza in «Trova cinema» deve dare risultati sensati anche
 * nella versione dimostrativa.
 *
 * Le sale non sono scritte a mano poltrona per poltrona: si dichiarano i
 * parametri (file, posti, quante file premium, quanti posti riservati) e la
 * pianta la costruisce `generaSchema`, la stessa funzione che sta dietro
 * all'editor grafico del pannello. Così i dati iniziali non possono descrivere
 * una sala che l'editor non saprebbe ricreare.
 */

/** Orario tipo di un multisala: aperto tutti i giorni, riposo mai. */
function orariStandard(apertura = '15:00', chiusura = '00:30'): OrarioApertura[] {
  return Array.from({ length: 7 }, (_, giorno) => ({
    giorno,
    // Nel fine settimana si apre a pranzo: sabato e domenica valgono da soli
    // quasi metà degli incassi di una settimana normale.
    apertura: giorno === 0 || giorno === 6 ? '11:00' : apertura,
    chiusura,
    chiuso: false,
  }))
}

export const CINEMA_INIZIALI: Cinema[] = [
  {
    id: 'cin-cagliari',
    slug: 'cagliari-marina',
    nome: 'Cagliari Marina',
    descrizione:
      'Il multisala principale della rete: otto sale, una delle quali IMAX con schermo da ventidue metri, e la sola sala 4DX dell’isola. Al primo piano di un centro commerciale, con parcheggio coperto gratuito per chi ha un biglietto.',
    indirizzo: 'Viale della Darsena 42',
    citta: 'Cagliari',
    cap: '09123',
    provincia: 'CA',
    telefono: '+39 070 000 0101',
    email: 'cagliari@cinemax.example',
    coordinate: { lat: 39.2238, lng: 9.1217 },
    servizi: [
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
    ],
    orari: orariStandard('14:30'),
    immagine: '',
    palette: ['#2a1040', '#ff4d7d'],
    visibile: true,
    creatoIl: '2026-01-08T09:00:00.000Z',
  },
  {
    id: 'cin-sassari',
    slug: 'sassari-eurospazio',
    nome: 'Sassari Eurospazio',
    descrizione:
      'Sei sale a nord dell’anello, tutte con poltrone reclinabili rinnovate nel 2025. Due sale Dolby Atmos e una programmazione in lingua originale fissa il martedì.',
    indirizzo: 'Via dei Cantieri 7',
    citta: 'Sassari',
    cap: '07100',
    provincia: 'SS',
    telefono: '+39 079 000 0202',
    email: 'sassari@cinemax.example',
    coordinate: { lat: 40.7259, lng: 8.5557 },
    servizi: ['Parcheggio', 'Bar', 'Food', '3D', 'Dolby Atmos', 'Accessibilità', 'Wi-Fi'],
    orari: orariStandard(),
    immagine: '',
    palette: ['#10283a', '#4dd0e1'],
    visibile: true,
    creatoIl: '2026-01-08T09:00:00.000Z',
  },
  {
    id: 'cin-olbia',
    slug: 'olbia-porto',
    nome: 'Olbia Porto',
    descrizione:
      'Cinque sale a due passi dalla stazione marittima. D’estate la sala 1 apre anche alle proiezioni del mattino per chi aspetta l’imbarco.',
    indirizzo: 'Lungomare Isola Bianca 15',
    citta: 'Olbia',
    cap: '07026',
    provincia: 'SS',
    telefono: '+39 0789 000 303',
    email: 'olbia@cinemax.example',
    coordinate: { lat: 40.9236, lng: 9.4983 },
    servizi: ['Bar', 'Food', '3D', 'Dolby Atmos', 'Accessibilità', 'Wi-Fi'],
    orari: orariStandard(),
    immagine: '',
    palette: ['#123326', '#69db7c'],
    visibile: true,
    creatoIl: '2026-01-08T09:00:00.000Z',
  },
  {
    id: 'cin-nuoro',
    slug: 'nuoro-monte-ortobene',
    nome: 'Nuoro Monte Ortobene',
    descrizione:
      'Quattro sale nel vecchio cinema di quartiere, ristrutturato conservando la platea originale della sala 1. Rassegne d’autore il giovedì sera.',
    indirizzo: 'Corso Garibaldi 88',
    citta: 'Nuoro',
    cap: '08100',
    provincia: 'NU',
    telefono: '+39 0784 000 404',
    email: 'nuoro@cinemax.example',
    coordinate: { lat: 40.321, lng: 9.33 },
    servizi: ['Bar', '3D', 'Accessibilità', 'Wi-Fi'],
    orari: orariStandard('16:00', '23:59'),
    immagine: '',
    palette: ['#3b1f12', '#ffa94d'],
    visibile: true,
    creatoIl: '2026-01-08T09:00:00.000Z',
  },
  {
    id: 'cin-tortoli',
    slug: 'tortoli-ogliastra',
    nome: 'Tortolì Ogliastra',
    descrizione:
      'Tre sale piccole e curate, la più recente della rete. Una sala da settanta posti dedicata ai film per ragazzi e alle proiezioni scolastiche.',
    indirizzo: 'Via Monsignor Virgilio 3',
    citta: 'Tortolì',
    cap: '08048',
    provincia: 'NU',
    telefono: '+39 0782 000 505',
    email: 'tortoli@cinemax.example',
    coordinate: { lat: 39.927, lng: 9.657 },
    servizi: ['Parcheggio', 'Bar', 'Food', 'Accessibilità', 'Ricarica elettrica'],
    orari: orariStandard('16:30', '23:30'),
    immagine: '',
    palette: ['#2b1a3d', '#b197fc'],
    visibile: true,
    creatoIl: '2026-01-08T09:00:00.000Z',
  },
]

/** Scorciatoia per dichiarare una sala senza ripetere lo schema ogni volta. */
function sala(
  id: string,
  cinemaId: string,
  nome: string,
  formati: Formato[],
  configurazione: Partial<ConfigurazioneSala>,
  supplemento = 0,
): Sala {
  return {
    id,
    cinemaId,
    nome,
    formati,
    schema: generaSchema({
      file: 12,
      postiPerFila: 16,
      filePremium: 3,
      postiDisabili: 2,
      filaDisabili: 0,
      corridoiVerticali: 2,
      corridoiOrizzontali: [],
      schermo: 'alto',
      ...configurazione,
    }),
    supplemento,
    attiva: true,
    creataIl: '2026-01-08T09:00:00.000Z',
  }
}

export const SALE_INIZIALI: Sala[] = [
  /* ── Cagliari Marina: otto sale ──────────────────────────────────────── */
  sala('sal-ca-1', 'cin-cagliari', 'Sala 1 — IMAX', ['2D', '3D', 'IMAX', 'Dolby Atmos'], {
    file: 18,
    postiPerFila: 26,
    filePremium: 5,
    postiDisabili: 4,
    corridoiVerticali: 2,
    corridoiOrizzontali: [8],
  }),
  sala('sal-ca-2', 'cin-cagliari', 'Sala 2 — 4DX', ['2D', '3D', '4DX'], {
    file: 9,
    postiPerFila: 12,
    filePremium: 0,
    postiDisabili: 1,
    corridoiVerticali: 1,
  }),
  sala('sal-ca-3', 'cin-cagliari', 'Sala 3', ['2D', '3D', 'Dolby Atmos', 'VO sottotitolato'], {
    file: 14,
    postiPerFila: 20,
    filePremium: 4,
  }),
  sala('sal-ca-4', 'cin-cagliari', 'Sala 4', ['2D', '3D'], { file: 13, postiPerFila: 18 }),
  sala('sal-ca-5', 'cin-cagliari', 'Sala 5', ['2D', 'VO sottotitolato'], {
    file: 11,
    postiPerFila: 16,
  }),
  sala('sal-ca-6', 'cin-cagliari', 'Sala 6', ['2D'], { file: 10, postiPerFila: 14 }),
  sala(
    'sal-ca-7',
    'cin-cagliari',
    'Sala 7 — VIP',
    ['2D', 'Dolby Atmos'],
    { file: 7, postiPerFila: 10, filePremium: 7, postiDisabili: 1, corridoiVerticali: 1 },
    // La sala VIP ha poltrone singole reclinabili e servizio al posto: il
    // supplemento è della sala, non del formato, e vale anche se ci si
    // proietta un film senza alcun supplemento tecnico.
    4,
  ),
  sala('sal-ca-8', 'cin-cagliari', 'Sala 8', ['2D'], { file: 9, postiPerFila: 12 }),

  /* ── Sassari Eurospazio: sei sale ────────────────────────────────────── */
  sala('sal-ss-1', 'cin-sassari', 'Sala 1', ['2D', '3D', 'Dolby Atmos'], {
    file: 15,
    postiPerFila: 22,
    filePremium: 4,
    postiDisabili: 3,
    corridoiOrizzontali: [7],
  }),
  sala('sal-ss-2', 'cin-sassari', 'Sala 2', ['2D', '3D', 'Dolby Atmos'], {
    file: 13,
    postiPerFila: 18,
  }),
  sala('sal-ss-3', 'cin-sassari', 'Sala 3', ['2D', 'VO sottotitolato'], {
    file: 12,
    postiPerFila: 16,
  }),
  sala('sal-ss-4', 'cin-sassari', 'Sala 4', ['2D', '3D'], { file: 11, postiPerFila: 16 }),
  sala('sal-ss-5', 'cin-sassari', 'Sala 5', ['2D'], { file: 10, postiPerFila: 14 }),
  sala('sal-ss-6', 'cin-sassari', 'Sala 6', ['2D'], { file: 8, postiPerFila: 12 }),

  /* ── Olbia Porto: cinque sale ────────────────────────────────────────── */
  sala('sal-ol-1', 'cin-olbia', 'Sala 1', ['2D', '3D', 'Dolby Atmos'], {
    file: 14,
    postiPerFila: 20,
    filePremium: 4,
    postiDisabili: 3,
  }),
  sala('sal-ol-2', 'cin-olbia', 'Sala 2', ['2D', '3D'], { file: 12, postiPerFila: 18 }),
  sala('sal-ol-3', 'cin-olbia', 'Sala 3', ['2D', 'VO sottotitolato'], {
    file: 11,
    postiPerFila: 15,
  }),
  sala('sal-ol-4', 'cin-olbia', 'Sala 4', ['2D'], { file: 9, postiPerFila: 14 }),
  sala('sal-ol-5', 'cin-olbia', 'Sala 5', ['2D'], { file: 8, postiPerFila: 12 }),

  /* ── Nuoro Monte Ortobene: quattro sale ──────────────────────────────── */
  sala('sal-nu-1', 'cin-nuoro', 'Sala 1 — Storica', ['2D', '3D'], {
    file: 16,
    postiPerFila: 20,
    filePremium: 3,
    postiDisabili: 2,
    corridoiVerticali: 1,
    corridoiOrizzontali: [9],
  }),
  sala('sal-nu-2', 'cin-nuoro', 'Sala 2', ['2D', 'VO sottotitolato'], {
    file: 10,
    postiPerFila: 14,
  }),
  sala('sal-nu-3', 'cin-nuoro', 'Sala 3', ['2D'], { file: 9, postiPerFila: 12 }),
  sala('sal-nu-4', 'cin-nuoro', 'Sala 4', ['2D'], { file: 7, postiPerFila: 10, filePremium: 0 }),

  /* ── Tortolì Ogliastra: tre sale ─────────────────────────────────────── */
  sala('sal-to-1', 'cin-tortoli', 'Sala 1', ['2D', '3D'], {
    file: 12,
    postiPerFila: 16,
    postiDisabili: 2,
  }),
  sala('sal-to-2', 'cin-tortoli', 'Sala 2', ['2D'], { file: 9, postiPerFila: 12 }),
  sala('sal-to-3', 'cin-tortoli', 'Sala 3 — Ragazzi', ['2D'], {
    file: 7,
    postiPerFila: 12,
    filePremium: 0,
    postiDisabili: 2,
    corridoiVerticali: 1,
  }),
]
