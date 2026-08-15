/**
 * Dati dell'attività: unica fonte per intestazione, contatti, piè di pagina,
 * dati strutturati Schema.org e collegamenti rapidi (telefono, WhatsApp, mappa).
 */

export interface FasciaOraria {
  giorno: string
  /** Indice del giorno secondo `Date.getDay()` (0 = domenica) */
  indice: number
  orario: string
  /** Intervalli di apertura in ore decimali, per calcolare "aperto ora" */
  fasce: [number, number][]
}

export const AZIENDA = {
  nome: 'Io Riparo',
  claim: 'come posso aiutare?',
  descrizione:
    'Centro di assistenza tecnica per smartphone, tablet, computer e notebook, recupero dati, videosorveglianza, reti aziendali e impianti Wi-Fi a Tortolì e in tutta l\'Ogliastra.',
  indirizzo: 'Via Campidano 7',
  cap: '08048',
  citta: 'Tortolì',
  provincia: 'NU',
  regione: 'Ogliastra, Sardegna',
  /** Numero fisso del laboratorio, usato dal pulsante "Chiama ora". */
  telefono: '0782 208901',
  /** Cellulare usato per WhatsApp e per i messaggi diretti. */
  cellulare: '338 435 6603',
  email: 'ioriparotortoli@gmail.com',
  emailPrivacy: 'ioriparotortoli@gmail.com',
  partitaIva: '01625710916',
  /** Chi risponde in negozio: usato dalla chat e come profilo del gestionale. */
  titolare: 'Stefano Pes',
  fondata: 2022,
  /**
   * Profili social ufficiali. Finché un indirizzo resta vuoto la relativa icona
   * non viene mostrata: meglio nessun collegamento che un collegamento che porta
   * alla pagina generica del servizio.
   */
  social: {
    // Indirizzi ripuliti dai parametri di tracciamento (`mibextid`, `igsh`,
    // `utm_*`): sono buoni solo per la sessione da cui è stato copiato il link
    // e finirebbero anche nei dati strutturati letti dai motori di ricerca.
    facebook: 'https://www.facebook.com/ioriparotortoli',
    instagram: 'https://www.instagram.com/ioriparo.tortoli/',
  },
} as const

/** Numeri in formato E.164: il fisso per `tel:`, il cellulare per WhatsApp. */
export const TELEFONO_E164 = '+39' + AZIENDA.telefono.replace(/\D/g, '')
export const CELLULARE_E164 = '+39' + AZIENDA.cellulare.replace(/\D/g, '')

/** Messaggio già compilato: chi scrive parte da una richiesta chiara. */
export const messaggioWhatsapp = (testo = 'Buongiorno, vorrei un preventivo per') =>
  `https://wa.me/${CELLULARE_E164.replace('+', '')}?text=${encodeURIComponent(testo)}`

export const WHATSAPP = messaggioWhatsapp()
export const INDIRIZZO_COMPLETO = `${AZIENDA.indirizzo}, ${AZIENDA.cap} ${AZIENDA.citta} (${AZIENDA.provincia})`

/** Ricerca su Google Maps con nome e indirizzo completo dell'attività. */
export const MAPPA = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${AZIENDA.nome}, ${INDIRIZZO_COMPLETO}`,
)}`

/**
 * Scheda Google dell'attività e valutazione pubblica.
 *
 * I due numeri sono quelli che Google mostra sul profilo: vanno tenuti
 * allineati alla realtà, perché finiscono anche nei dati strutturati che i
 * motori di ricerca leggono. Chi legge può verificarli in un clic con il link.
 */
export const GOOGLE = {
  scheda: 'https://share.google/T5zTx3HESxtTSTjuH',
  media: 4.9,
  recensioni: 136,
  /** Data dell'ultimo allineamento con il profilo, per sapere quando aggiornare. */
  aggiornato: '2026-07-28',
}

/**
 * Garanzie, come sono scritte nelle condizioni di servizio che il cliente
 * firma all'accettazione. Stanno qui e non sparse nelle pagine perché sito e
 * foglio firmato devono dire la stessa cosa: se un giorno cambiano, si cambia
 * un punto solo.
 *
 * Riparazione e vendita seguono regole diverse. Sulla riparazione la garanzia
 * copre il componente sostituito e dura pochi mesi; sui prodotti venduti
 * valgono i termini di legge, più lunghi.
 */
export const GARANZIA = {
  riparazioneOriginale: 6,
  riparazioneCompatibile: 3,
  venditaConsumatore: 24,
  venditaFattura: 12,
  /** Per targhette e spazi stretti. */
  breve: '3–6 mesi sulle riparazioni',
  /** Una riga, quando serve la regola completa. */
  riparazioni:
    'Sulle riparazioni la garanzia copre il componente sostituito: 6 mesi con ricambio originale, 3 mesi con ricambio compatibile.',
  vendita:
    'Sui prodotti venduti o installati — telefoni, computer, telecamere, apparati di rete — valgono i termini di legge: 24 mesi con scontrino, 12 mesi con fattura.',
  /** Casi esclusi, come nelle condizioni firmate. */
  esclusioni:
    'Restano esclusi cadute, urti, liquidi, ossidazione, manomissioni e uso improprio. Sui danni da liquidi l’intervento non ha garanzia di durata.',
}

/** Profili social effettivamente configurati: gli altri non vengono mostrati. */
export const SOCIAL = (
  Object.entries(AZIENDA.social) as [keyof typeof AZIENDA.social, string][]
).filter(([, url]) => url.trim() !== '')

export const ORARI: FasciaOraria[] = [
  { giorno: 'Lunedì', indice: 1, orario: '09:00–13:00 · 16:00–19:30', fasce: [[9, 13], [16, 19.5]] },
  { giorno: 'Martedì', indice: 2, orario: '09:00–13:00 · 16:00–19:30', fasce: [[9, 13], [16, 19.5]] },
  { giorno: 'Mercoledì', indice: 3, orario: '09:00–13:00 · 16:00–19:30', fasce: [[9, 13], [16, 19.5]] },
  { giorno: 'Giovedì', indice: 4, orario: '09:00–13:00 · 16:00–19:30', fasce: [[9, 13], [16, 19.5]] },
  { giorno: 'Venerdì', indice: 5, orario: '09:00–13:00 · 16:00–19:30', fasce: [[9, 13], [16, 19.5]] },
  { giorno: 'Sabato', indice: 6, orario: '09:00–13:00', fasce: [[9, 13]] },
  { giorno: 'Domenica', indice: 0, orario: 'Chiuso', fasce: [] },
]

/**
 * Chiusure straordinarie: ferie e festività.
 *
 * Gli orari settimanali da soli non bastano — il 15 agosto cade di sabato e
 * il sito lo darebbe come giorno di apertura normale, mandando gente davanti
 * alla saracinesca. Estremi compresi, in formato AAAA-MM-GG.
 */
export const CHIUSURE: { dal: string; al: string; motivo: string }[] = [
  { dal: '2026-08-13', al: '2026-08-15', motivo: 'Ferie di Ferragosto' },
  { dal: '2026-12-23', al: '2026-12-27', motivo: 'Chiusura natalizia' },
]

const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/**
 * Auguri che compaiono nell'apertura del sito per un giorno solo.
 *
 * La data sta scritta qui: passata la mezzanotte spariscono da soli. Un
 * augurio rimasto su il giorno dopo fa più brutta figura di uno non fatto.
 */
export const AUGURI: { giorno: string; testo: string }[] = [
  { giorno: '2026-08-15', testo: 'Buon Ferragosto da Io Riparo' },
]

/** Gli auguri di oggi, se ce ne sono. */
export function auguriDiOggi(adesso = new Date()): string | null {
  const giorno = iso(adesso)
  return AUGURI.find((a) => a.giorno === giorno)?.testo ?? null
}

/** La chiusura in corso nel giorno indicato, se ce n'è una. */
export function chiusuraDi(adesso = new Date()) {
  const giorno = iso(adesso)
  return CHIUSURE.find((c) => giorno >= c.dal && giorno <= c.al) ?? null
}

/** Primo giorno di riapertura: salta ferie e giorni di riposo settimanale. */
export function prossimaApertura(adesso = new Date()): Date | null {
  const giorno = new Date(adesso)
  // Un anno di margine: oltre, vuol dire che gli orari sono tutti vuoti.
  for (let i = 0; i < 365; i++) {
    giorno.setDate(giorno.getDate() + 1)
    const orari = ORARI.find((o) => o.indice === giorno.getDay())
    if (orari?.fasce.length && !chiusuraDi(giorno)) return new Date(giorno)
  }
  return null
}

/** Vero se l'attività è aperta nell'istante indicato. */
export function apertoOra(adesso = new Date()): boolean {
  if (chiusuraDi(adesso)) return false
  const oggi = ORARI.find((o) => o.indice === adesso.getDay())
  if (!oggi) return false
  const ora = adesso.getHours() + adesso.getMinutes() / 60
  return oggi.fasce.some(([da, a]) => ora >= da && ora < a)
}

/** Orario di chiusura successivo, per il messaggio "aperti fino alle …". */
export function chiusuraOdierna(adesso = new Date()): string | null {
  if (chiusuraDi(adesso)) return null
  const oggi = ORARI.find((o) => o.indice === adesso.getDay())
  if (!oggi || !oggi.fasce.length) return null
  const ora = adesso.getHours() + adesso.getMinutes() / 60
  const fascia = oggi.fasce.find(([, a]) => ora < a)
  if (!fascia) return null
  const ore = Math.floor(fascia[1])
  const minuti = Math.round((fascia[1] - ore) * 60)
  return `${String(ore).padStart(2, '0')}:${String(minuti).padStart(2, '0')}`
}
