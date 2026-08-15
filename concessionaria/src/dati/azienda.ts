/**
 * Scheda anagrafica della concessionaria.
 *
 * È l'unico punto da modificare per adattare il sito a un'altra attività:
 * intestazione, piè di pagina, contatti, SEO, dati strutturati e pannello di
 * amministrazione leggono tutti da qui.
 */
export const AZIENDA = {
  nome: 'Aurora',
  nomeCompleto: 'Aurora Motori',
  claim: 'Concessionaria multiservizi',
  descrizione:
    'Concessionaria multiservizi a Tortolì: vendita di auto e moto nuove e usate, noleggio a breve e ' +
    'lungo termine, detailing e trattamenti ceramici, finanziamenti su misura, permuta e assistenza ' +
    'post vendita.',
  fondata: 1997,

  indirizzo: {
    via: 'Viale Arbatax 118',
    cap: '08048',
    citta: 'Tortolì',
    provincia: 'NU',
    nazione: 'IT',
    latitudine: 39.9264,
    longitudine: 9.657,
  },

  telefono: '+39 0782 012 345',
  /** Versione senza spazi: serve per i link `tel:` e `wa.me`. */
  telefonoLink: '+390782012345',
  whatsapp: '390782012345',
  email: 'info@auroramotori.it',
  emailVendite: 'vendite@auroramotori.it',
  emailNoleggio: 'noleggio@auroramotori.it',

  partitaIva: '01234567890',
  ragioneSociale: 'Aurora Motori S.r.l.',
  rea: 'NU-123456',
  capitaleSociale: '100.000,00 €',

  social: {
    instagram: 'https://www.instagram.com/',
    facebook: 'https://www.facebook.com/',
    youtube: 'https://www.youtube.com/',
    linkedin: 'https://www.linkedin.com/',
  },

  /** Numeri mostrati nella fascia dei traguardi, in home e in «Chi siamo». */
  numeri: {
    anniAttivita: new Date().getFullYear() - 1997,
    veicoliConsegnati: 4200,
    clientiSoddisfatti: 3800,
    veicoliFlotta: 60,
  },

  /** Fascia di prezzo secondo la convenzione di Schema.org / Google. */
  fasciaPrezzo: '€€',

  /** Estremi del finanziamento proposto dal simulatore di rata. */
  finanziamento: {
    taegPredefinito: 6.95,
    tanPredefinito: 5.45,
    durateMesi: [24, 36, 48, 60, 72, 84],
    /** Spese di istruttoria sommate una tantum all'importo finanziato. */
    speseIstruttoria: 350,
    importoMinimo: 3000,
  },

  /** Dominio pubblico: usato per canonical, sitemap e Open Graph. */
  sito: 'https://www.auroramotori.it',
} as const

/** Indirizzo su una riga, per intestazioni e dati strutturati. */
export const INDIRIZZO_COMPLETO = `${AZIENDA.indirizzo.via}, ${AZIENDA.indirizzo.cap} ${AZIENDA.indirizzo.citta} (${AZIENDA.indirizzo.provincia})`

/** Link a Google Maps per il pulsante «Come raggiungerci». */
export const LINK_INDICAZIONI = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  `${AZIENDA.nomeCompleto}, ${INDIRIZZO_COMPLETO}`,
)}`

/** Sorgente della mappa incorporata: caricata solo dopo il consenso cookie. */
export const MAPPA_EMBED = `https://www.google.com/maps?q=${AZIENDA.indirizzo.latitudine},${AZIENDA.indirizzo.longitudine}&hl=it&z=16&output=embed`

/** Apre WhatsApp con un messaggio già scritto. */
export function linkWhatsApp(messaggio: string): string {
  return `https://wa.me/${AZIENDA.whatsapp}?text=${encodeURIComponent(messaggio)}`
}
