import type { NomeIcona } from '@/componenti/ui/Icona'

/**
 * I servizi mostrati nella terza sezione.
 *
 * `dettagli` compare quando la carta si apre sotto il puntatore (o al tocco su
 * telefono): sono le tre righe che rispondono al «cosa vuol dire in pratica».
 * Aggiungere o togliere una voce non richiede altro: la griglia si ridispone
 * da sola.
 */
export type Servizio = {
  id: string
  icona: NomeIcona
  titolo: string
  sommario: string
  dettagli: string[]
}

export const SERVIZI: Servizio[] = [
  {
    id: 'siti-web',
    icona: 'globo',
    titolo: 'Siti web',
    sommario: 'Siti professionali completamente personalizzati.',
    dettagli: [
      'Nessun modello preconfezionato: struttura e grafica nascono dalla tua attività',
      'Testi impaginati con cura, pronti a convincere chi legge',
      'Pannello per aggiornare contenuti e fotografie da solo',
    ],
  },
  {
    id: 'ecommerce',
    icona: 'carrello',
    titolo: 'E-commerce',
    sommario: 'Negozi online moderni e progettati per vendere.',
    dettagli: [
      'Catalogo, varianti, magazzino e spedizioni sotto controllo',
      'Pagamenti sicuri con carta, PayPal, Satispay e contrassegno',
      'Percorso d’acquisto breve: meno passaggi, più ordini conclusi',
    ],
  },
  {
    id: 'responsive',
    icona: 'dispositivi',
    titolo: 'Responsive design',
    sommario: 'Perfetti su smartphone, tablet e computer.',
    dettagli: [
      'Progettati prima per il telefono, dove arriva la maggior parte dei visitatori',
      'Pulsanti grandi, testi leggibili, niente zoom per capirci qualcosa',
      'Controllati uno per uno su schermi veri, non solo simulati',
    ],
  },
  {
    id: 'performance',
    icona: 'razzo',
    titolo: 'Performance',
    sommario: 'Siti veloci e ottimizzati.',
    dettagli: [
      'Apertura sotto il secondo anche con la rete mobile',
      'Immagini moderne e leggere, generate nelle misure giuste',
      'Punteggi Core Web Vitals in verde, che Google usa per posizionarti',
    ],
  },
  {
    id: 'brand',
    icona: 'tavolozza',
    titolo: 'Brand & design',
    sommario: 'Grafica moderna e identità visiva.',
    dettagli: [
      'Marchio, colori e caratteri coerenti su sito, stampa e social',
      'Grafica riconoscibile, che non somiglia a quella di nessun altro',
      'Materiali pronti da usare: biglietti, insegne, formati per i social',
    ],
  },
  {
    id: 'seo',
    icona: 'lente',
    titolo: 'SEO',
    sommario: 'Struttura ottimizzata per essere trovati online.',
    dettagli: [
      'Ricerca delle parole che i tuoi clienti digitano davvero',
      'Dati strutturati, sitemap e scheda Google Business curati',
      'Ricerca locale: comparire quando cercano il tuo servizio in zona',
    ],
  },
  {
    id: 'funzioni',
    icona: 'circuito',
    titolo: 'Funzioni intelligenti',
    sommario: 'Formulari, prenotazioni, automazioni, chatbot e strumenti su misura.',
    dettagli: [
      'Prenotazioni e appuntamenti con conferma automatica per email',
      'Preventivi guidati che arrivano già compilati sul tuo telefono',
      'Assistente virtuale che risponde alle domande più frequenti',
    ],
  },
  {
    id: 'assistenza',
    icona: 'chiave',
    titolo: 'Assistenza',
    sommario: 'Supporto e aggiornamenti del sito.',
    dettagli: [
      'Copie di sicurezza quotidiane e certificato sempre valido',
      'Aggiornamenti tecnici senza che tu debba pensarci',
      'Una persona che risponde, non un numero di pratica',
    ],
  },
]
