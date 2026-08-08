/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Scheda del marchio.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * È il primo file da modificare per far diventare questo sito il proprio:
 * nome, recapiti, social, listino e dominio si cambiano solo qui. Testata, piè
 * di pagina, modulo contatti, metadati, sitemap e dati strutturati leggono
 * tutti da questo oggetto, quindi non resta niente di sparso nel codice.
 *
 * Il marchio grafico non è un file immagine ma un disegno vettoriale in
 * `src/componenti/layout/Marchio.tsx`: si adatta a ogni dimensione, non pesa
 * nulla e cambia colore con il tema. Per usare un proprio logo basta
 * sostituire quel componente con un `<Image>`.
 */
export const AGENZIA = {
  /** Nome breve, quello che compare accanto al simbolo. */
  nome: 'Orbita',
  /** Nome per esteso, per metadati e documenti. */
  nomeCompleto: 'Orbita Studio',
  /** Una riga sotto il nome, nel piè di pagina e nei social. */
  motto: 'Web design. Tecnologia. Idee che diventano realtà.',
  /** Come ci si presenta in una frase, per la SEO e per i social. */
  descrizione:
    'Studio di progettazione digitale: siti web su misura, e-commerce e identità visiva per ' +
    'aziende, negozi, professionisti e attività commerciali. Veloci, accessibili e costruiti ' +
    'per trasformare i visitatori in clienti.',
  /** Chi firma il lavoro, nel piè di pagina e nei dati strutturati. */
  ragioneSociale: 'Orbita Studio di Mario Rossi',
  fondato: 2016,

  /* ── Recapiti ─────────────────────────────────────────────────────────── */
  email: 'ciao@orbitastudio.it',
  telefono: '+39 340 123 4567',
  /** Senza spazi: serve ai link `tel:` e `wa.me`. */
  telefonoLink: '+393401234567',
  whatsapp: '393401234567',

  /* Studio senza sportello al pubblico: la sede serve ai dati fiscali e alla
   * ricerca locale, non a ricevere clienti senza appuntamento. */
  sede: {
    citta: 'Tortolì',
    provincia: 'NU',
    regione: 'Sardegna',
    nazione: 'IT',
    /** Area effettivamente servita: di persona qui, da remoto ovunque. */
    raggio: 'In tutta Italia, da remoto',
  },

  partitaIva: '01234567890',

  /* ── Social ───────────────────────────────────────────────────────────── */
  social: {
    instagram: 'https://www.instagram.com/',
    linkedin: 'https://www.linkedin.com/',
    behance: 'https://www.behance.net/',
    github: 'https://github.com/',
  },

  /* ── Dominio pubblico ─────────────────────────────────────────────────── */
  sito: 'https://www.orbitastudio.it',

  /* ── Tempi dichiarati ─────────────────────────────────────────────────── */
  tempi: {
    /** Entro quanto si risponde a una richiesta di preventivo. */
    risposta: '24 ore',
    /** Durata tipica di un progetto vetrina, dalla firma alla pubblicazione. */
    consegna: '2-4 settimane',
  },
} as const

/**
 * Listino di partenza.
 *
 * I prezzi sono indicativi e servono a dare un ordine di grandezza a chi
 * chiede; il preventivo vero nasce dopo la prima chiacchierata. Si modificano
 * qui e cambiano ovunque compaiano, modulo compreso.
 */
export const LISTINO = [
  {
    id: 'vetrina',
    nome: 'Sito vetrina',
    da: 890,
    descrizione: 'Fino a sei pagine, modulo contatti, ottimizzazione SEO di base e pubblicazione.',
    incluso: ['Progetto grafico su misura', 'Testi impaginati', 'Modulo contatti', 'SEO di base'],
  },
  {
    id: 'professionale',
    nome: 'Sito professionale',
    da: 1690,
    descrizione: 'Più pagine, blog, prenotazioni o preventivi, area riservata e statistiche.',
    incluso: ['Tutto del vetrina', 'Blog e novità', 'Prenotazioni o preventivi', 'Pannello di gestione'],
    /** Evidenziato nel listino come scelta consigliata. */
    inRisalto: true,
  },
  {
    id: 'ecommerce',
    nome: 'E-commerce',
    da: 2490,
    descrizione: 'Catalogo, carrello, pagamenti, spedizioni e gestione degli ordini.',
    incluso: ['Catalogo e carrello', 'Pagamenti sicuri', 'Spedizioni e magazzino', 'Formazione all’uso'],
  },
] as const

/** Canone facoltativo di assistenza, citato nella scheda del servizio. */
export const ASSISTENZA = {
  canoneMensile: 39,
  descrizione:
    'Dominio, certificato, copie di sicurezza, aggiornamenti tecnici e piccole modifiche ai contenuti.',
} as const

/** Indirizzo pubblico del sito, con la variabile d’ambiente che ha la precedenza. */
export const DOMINIO = process.env.NEXT_PUBLIC_SITO?.replace(/\/$/, '') || AGENZIA.sito
