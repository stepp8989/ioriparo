/**
 * Voci di navigazione dell'intestazione e del piè di pagina.
 *
 * Stanno qui e non dentro i componenti perché la stessa struttura serve al
 * menu da scrivania, a quello mobile, al piè di pagina e alla mappa del sito:
 * quattro copie da tenere allineate a mano sono quattro occasioni di
 * dimenticarsene una.
 */

export type VoceMenu = {
  etichetta: string
  href: string
  descrizione?: string
}

/** Menu principale, nell'ordine in cui compare nell'intestazione. */
export const MENU: VoceMenu[] = [
  { etichetta: 'Film', href: '/film', descrizione: 'Tutto quello che c’è in sala' },
  { etichetta: 'Cinema', href: '/cinema', descrizione: 'Trova la sala più vicina' },
  { etichetta: 'Programmazione', href: '/programmazione', descrizione: 'Orari di tutta la rete' },
  { etichetta: 'Trailer', href: '/trailer', descrizione: 'Le anteprime da vedere' },
  { etichetta: 'Promozioni', href: '/promozioni', descrizione: 'Offerte e giornate speciali' },
  { etichetta: 'Abbonamenti', href: '/abbonamenti', descrizione: 'Vai al cinema tutto l’anno' },
  { etichetta: 'Food & Drink', href: '/food', descrizione: 'Il banco, prima della sala' },
]

/** Colonne del piè di pagina. */
export const PIEDE: { titolo: string; voci: VoceMenu[] }[] = [
  {
    titolo: 'Il cinema',
    voci: [
      { etichetta: 'Film in sala', href: '/film' },
      { etichetta: 'Prossimamente', href: '/film?stato=prossimamente' },
      { etichetta: 'Programmazione', href: '/programmazione' },
      { etichetta: 'Trailer', href: '/trailer' },
    ],
  },
  {
    titolo: 'Servizi',
    voci: [
      { etichetta: 'Trova cinema', href: '/cinema' },
      { etichetta: 'Abbonamenti', href: '/abbonamenti' },
      { etichetta: 'Gift card', href: '/gift-card' },
      { etichetta: 'Food & Drink', href: '/food' },
    ],
  },
  {
    titolo: 'Il tuo account',
    voci: [
      { etichetta: 'Area personale', href: '/area-personale' },
      { etichetta: 'I miei biglietti', href: '/area-personale?vista=biglietti' },
      { etichetta: 'CINEMAX Club', href: '/area-personale?vista=club' },
      { etichetta: 'Promozioni', href: '/promozioni' },
    ],
  },
  {
    titolo: 'Informazioni',
    voci: [
      { etichetta: 'Privacy', href: '/privacy' },
      { etichetta: 'Termini di vendita', href: '/termini' },
      { etichetta: 'Cookie', href: '/cookie-policy' },
      { etichetta: 'Accessibilità', href: '/accessibilita' },
    ],
  },
]
