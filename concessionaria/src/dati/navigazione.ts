/**
 * Voci di navigazione del sito.
 *
 * Un unico elenco serve intestazione, menu su schermo stretto e piè di pagina:
 * aggiungere una pagina significa aggiungere una riga qui, non tre.
 */

export type VoceNavigazione = {
  nome: string
  percorso: string
  /** Le voci principali compaiono nella barra su schermi larghi. */
  principale: boolean
  descrizione: string
}

export const NAVIGAZIONE: VoceNavigazione[] = [
  {
    nome: 'Catalogo',
    percorso: '/catalogo',
    principale: true,
    descrizione: 'Auto e moto disponibili, con ricerca e filtri',
  },
  {
    nome: 'Noleggio',
    percorso: '/noleggio',
    principale: true,
    descrizione: 'Tariffe giornaliere, settimanali e mensili',
  },
  {
    nome: 'Detailing',
    percorso: '/detailing',
    principale: true,
    descrizione: 'Lavaggio, lucidatura, ceramica e sanificazione',
  },
  {
    nome: 'Servizi',
    percorso: '/servizi',
    principale: true,
    descrizione: 'Tutto quello di cui ci occupiamo',
  },
  {
    nome: 'Finanziamenti',
    percorso: '/finanziamenti',
    principale: true,
    descrizione: 'Simulatore di rata, preventivo e permuta',
  },
  {
    nome: 'Chi siamo',
    percorso: '/chi-siamo',
    principale: false,
    descrizione: 'Storia, valori e squadra',
  },
  {
    nome: 'Blog',
    percorso: '/blog',
    principale: false,
    descrizione: 'Guide, manutenzione e novità',
  },
  {
    nome: 'Contatti',
    percorso: '/contatti',
    principale: true,
    descrizione: 'Dove siamo, orari e modulo contatti',
  },
]

/** Pagine informative, elencate solo nel piè di pagina. */
export const NAVIGAZIONE_LEGALE = [
  { nome: 'Privacy Policy', percorso: '/privacy' },
  { nome: 'Cookie Policy', percorso: '/cookie-policy' },
  { nome: 'Termini e condizioni', percorso: '/termini' },
]
