import type { NomeIcona } from '@/componenti/ui/Icona'

/**
 * I testi delle sezioni della home.
 *
 * Stanno tutti qui perché cambiare una frase non debba significare aprire un
 * componente e cercarla in mezzo al codice. Ogni gruppo corrisponde a una
 * fascia della pagina, nell'ordine in cui si incontra scorrendo.
 */

/* ── Sezione 2 — «Non creo semplici siti web» ──────────────────────────────── */

export type Pilastro = {
  id: string
  icona: NomeIcona
  titolo: string
  sommario: string
  testo: string
  /** Tinta dominante dell'elemento sospeso. */
  tinta: 'blu' | 'viola' | 'ciano'
}

export const PILASTRI: Pilastro[] = [
  {
    id: 'website',
    icona: 'globo',
    titolo: 'Website',
    sommario: 'La tua vetrina, aperta sempre',
    testo:
      'Un sito costruito attorno a quello che fai, non attorno a un modello comprato. ' +
      'Ogni pagina ha uno scopo: far capire chi sei e far compiere il passo successivo.',
    tinta: 'blu',
  },
  {
    id: 'performance',
    icona: 'razzo',
    titolo: 'Performance',
    sommario: 'Veloce, o non è moderno',
    testo:
      'Metà dei visitatori se ne va se la pagina impiega più di tre secondi. I miei siti si ' +
      'aprono in meno di uno, anche sotto rete mobile e anche pieni di fotografie.',
    tinta: 'ciano',
  },
  {
    id: 'design',
    icona: 'tavolozza',
    titolo: 'Design',
    sommario: 'Bello, ma soprattutto chiaro',
    testo:
      'La grafica non è decorazione: guida l’occhio, costruisce fiducia e porta al pulsante ' +
      'giusto. Un sito bello e confuso non vende; uno bello e chiaro sì.',
    tinta: 'viola',
  },
]

/* ── Sezione 4 — Dall'idea al sito online ──────────────────────────────────── */

export type Tappa = {
  id: string
  etichetta: string
  titolo: string
  testo: string
  icona: NomeIcona
}

export const TAPPE: Tappa[] = [
  {
    id: 'idea',
    etichetta: 'Idea',
    titolo: 'Tutto parte da quello che hai in testa',
    testo: 'Anche solo una frase: «voglio che la gente prenoti dal telefono».',
    icona: 'lampadina',
  },
  {
    id: 'design',
    etichetta: 'Design',
    titolo: 'Prende una forma che puoi vedere',
    testo: 'Colori, caratteri e disposizione delle pagine, prima di scrivere una riga di codice.',
    icona: 'tavolozza',
  },
  {
    id: 'sviluppo',
    etichetta: 'Sviluppo',
    titolo: 'Diventa un sito che funziona',
    testo: 'Codice scritto a mano, veloce e accessibile, con il pannello per gestirlo da solo.',
    icona: 'codice',
  },
  {
    id: 'online',
    etichetta: 'Online',
    titolo: 'E il mondo lo può vedere',
    testo: 'Dominio, certificato, Google e statistiche: pubblicato e già indicizzato.',
    icona: 'razzo',
  },
]

/* ── Sezione 7 — Perché sceglermi ──────────────────────────────────────────── */

export type Traguardo = {
  id: string
  /** Valore numerico da animare. Assente quando il valore è un simbolo. */
  numero?: number
  /** Testo mostrato al posto del numero: «⚡», «∞». */
  simbolo?: string
  prefisso?: string
  suffisso?: string
  etichetta: string
  testo: string
}

export const TRAGUARDI: Traguardo[] = [
  {
    id: 'personalizzato',
    numero: 100,
    suffisso: '%',
    etichetta: 'Personalizzato',
    testo: 'Nessun tema comprato, nessun sito uguale a un altro.',
  },
  {
    id: 'presenza',
    simbolo: '24/7',
    etichetta: 'Presenza online',
    testo: 'La tua attività resta aperta anche quando la saracinesca è giù.',
  },
  {
    id: 'performance',
    simbolo: '⚡',
    etichetta: 'Performance',
    testo: 'Punteggi in verde su velocità, accessibilità e buone pratiche.',
  },
  {
    id: 'possibilita',
    simbolo: '∞',
    etichetta: 'Possibilità',
    testo: 'Il sito cresce con te: nuove funzioni quando servono, non prima.',
  },
]

/* ── Sezione 8 — Il processo ───────────────────────────────────────────────── */

export type Fase = {
  numero: string
  titolo: string
  testo: string
  durata: string
}

export const FASI: Fase[] = [
  {
    numero: '01',
    titolo: 'Parliamo',
    testo:
      'Mezz’ora, di persona o in videochiamata. Mi racconti l’attività, i clienti che vuoi ' +
      'raggiungere e cosa non funziona oggi. Da lì esce il preventivo, senza sorprese.',
    durata: 'Giorno 1',
  },
  {
    numero: '02',
    titolo: 'Progettiamo',
    testo:
      'Struttura delle pagine, testi e grafica. Vedi il progetto prima che esista il sito, e ' +
      'possiamo cambiarlo quando costa ancora poco cambiarlo.',
    durata: 'Settimana 1',
  },
  {
    numero: '03',
    titolo: 'Sviluppiamo',
    testo:
      'Il progetto diventa un sito vero: veloce, accessibile, aggiornabile. Segui i lavori da ' +
      'un indirizzo di anteprima, giorno per giorno.',
    durata: 'Settimane 2-3',
  },
  {
    numero: '04',
    titolo: 'Pubblichiamo',
    testo:
      'Dominio, certificato, email, Google Search Console e statistiche. Metto tutto online io ' +
      'e ti consegno le chiavi, con mezz’ora di formazione registrata.',
    durata: 'Settimana 4',
  },
  {
    numero: '05',
    titolo: 'Cresciamo',
    testo:
      'Guardiamo i numeri veri: da dove arrivano i visitatori, cosa cercano, dove si fermano. ' +
      'E il sito cambia di conseguenza, un pezzo alla volta.',
    durata: 'Da lì in poi',
  },
]

/* ── Sezione 9 — Modulo di contatto ────────────────────────────────────────── */

/** Voci del menu «Tipo di sito» nel modulo. */
export const TIPI_SITO = [
  'Sito vetrina',
  'Sito professionale',
  'E-commerce',
  'Rifacimento di un sito esistente',
  'Landing page o campagna',
  'Non lo so ancora',
] as const

/* ── Sezione «Chi sono» ────────────────────────────────────────────────────── */

export const CHI_SONO = {
  soprattitolo: 'Chi sono',
  titolo: 'Una persona sola, che risponde al telefono.',
  paragrafi: [
    'Progetto e costruisco siti dal 2016. Prima in agenzia, poi da solo, perché il pezzo che ' +
      'mi piace davvero è quello in cui si capisce un mestiere e lo si traduce in pagine.',
    'Non c’è un reparto commerciale, un project manager e poi qualcuno che scrive il codice: ' +
      'chi ti ascolta al primo incontro è la stessa persona che pubblica il sito e che ti ' +
      'risponde due anni dopo, quando serve cambiare gli orari di apertura.',
    'Lavoro con poche attività per volta. È il motivo per cui i progetti finiscono nei tempi ' +
      'e il motivo per cui, ogni tanto, dico di no.',
  ],
  /** Competenze citate accanto al testo. */
  competenze: [
    'Progettazione dell’interfaccia',
    'Sviluppo su misura',
    'E-commerce e pagamenti',
    'SEO e ricerca locale',
    'Accessibilità WCAG',
    'Performance e Core Web Vitals',
  ],
}

/* ── Domande frequenti ─────────────────────────────────────────────────────── */

export const DOMANDE = [
  {
    domanda: 'Quanto costa un sito?',
    risposta:
      'Un sito vetrina parte da 890 €, uno professionale da 1.690 €, un e-commerce da 2.490 €. ' +
      'Il prezzo dipende dal numero di pagine e dalle funzioni: dopo la prima chiacchierata ' +
      'ricevi un preventivo scritto con tutto dentro, senza voci a sorpresa.',
  },
  {
    domanda: 'In quanto tempo è online?',
    risposta:
      'Un sito vetrina richiede due settimane, uno professionale tre o quattro, un e-commerce ' +
      'circa sei. I tempi dipendono soprattutto da quanto in fretta arrivano testi e ' +
      'fotografie: se ci sono già, si va più veloci.',
  },
  {
    domanda: 'Posso aggiornarlo da solo?',
    risposta:
      'Sì. Ogni sito ha un pannello pensato per chi non è del mestiere: cambiare un prezzo, ' +
      'aggiungere una foto o pubblicare una novità richiede meno di un minuto. La formazione ' +
      'è inclusa e resta registrata, così puoi riguardarla quando serve.',
  },
  {
    domanda: 'Chi si occupa di dominio e hosting?',
    risposta:
      'Me ne occupo io: registro il dominio a tuo nome, configuro il certificato e pubblico ' +
      'tutto. Il dominio resta di tua proprietà, e se un giorno vorrai andare altrove porti ' +
      'via il sito senza chiedere il permesso a nessuno.',
  },
  {
    domanda: 'Il sito comparirà su Google?',
    risposta:
      'Il sito nasce con la struttura giusta per essere indicizzato: titoli, dati strutturati, ' +
      'sitemap e scheda Google Business. Comparire fra i primi per una ricerca molto ' +
      'contesa è un lavoro continuativo, e in quel caso ne parliamo a parte.',
  },
  {
    domanda: 'Lavori solo in zona?',
    risposta:
      'Ho sede in Ogliastra e lavoro in tutta Italia da remoto. La videochiamata funziona bene: ' +
      'di persona ci si vede volentieri, ma non è mai stata una condizione per lavorare insieme.',
  },
]
