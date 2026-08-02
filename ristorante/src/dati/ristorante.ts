/**
 * Scheda anagrafica del ristorante.
 *
 * È l'unico punto da modificare per adattare il sito a un'altra attività:
 * intestazione, piè di pagina, contatti, SEO, dati strutturati e pannello di
 * amministrazione leggono tutti da qui.
 */
export const RISTORANTE = {
  nome: 'Aurea',
  nomeCompleto: 'Ristorante Aurea',
  claim: 'Cucina italiana contemporanea',
  descrizione:
    'Ristorante di cucina italiana contemporanea nel centro di Firenze: materie prime selezionate, ' +
    'tecnica classica e una sala che unisce eleganza e accoglienza.',
  fondato: 1998,

  indirizzo: {
    via: 'Via de’ Tornabuoni 18',
    cap: '50123',
    citta: 'Firenze',
    provincia: 'FI',
    nazione: 'IT',
    latitudine: 43.7714,
    longitudine: 11.2506,
  },

  telefono: '+39 055 012 3456',
  /** Versione senza spazi: serve per i link `tel:` e `wa.me`. */
  telefonoLink: '+390550123456',
  whatsapp: '390550123456',
  email: 'prenotazioni@ristoranteaurea.it',
  emailInfo: 'info@ristoranteaurea.it',

  partitaIva: '01234567890',
  ragioneSociale: 'Aurea Ristorazione S.r.l.',
  rea: 'FI-1234567',

  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    tripadvisor: 'https://www.tripadvisor.it/',
  },

  /** Fascia di prezzo secondo la convenzione di Schema.org / Google. */
  fasciaPrezzo: '€€€',
  postiSala: 64,
  /** Numero massimo di coperti prenotabili online in un colpo solo. */
  massimoPersoneOnline: 12,

  /** Dominio pubblico: usato per canonical, sitemap e Open Graph. */
  sito: 'https://www.ristoranteaurea.it',
} as const

/** Indirizzo su una riga, per intestazioni e dati strutturati. */
export const INDIRIZZO_COMPLETO = `${RISTORANTE.indirizzo.via}, ${RISTORANTE.indirizzo.cap} ${RISTORANTE.indirizzo.citta} (${RISTORANTE.indirizzo.provincia})`

/** Link a Google Maps per il pulsante "Come raggiungerci". */
export const LINK_INDICAZIONI = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${RISTORANTE.nomeCompleto}, ${INDIRIZZO_COMPLETO}`,
)}`

/** Sorgente della mappa incorporata: caricata solo dopo il consenso cookie. */
export const MAPPA_EMBED = `https://www.google.com/maps?q=${RISTORANTE.indirizzo.latitudine},${RISTORANTE.indirizzo.longitudine}&hl=it&z=16&output=embed`
