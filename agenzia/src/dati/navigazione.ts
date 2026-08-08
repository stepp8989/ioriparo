/**
 * Voci di menu.
 *
 * Il sito è una pagina sola: le voci puntano ad ancore dentro la home, tranne
 * le informative che hanno una pagina propria. `ancora` dice al menu se
 * evidenziare la voce mentre si scorre.
 */
export type Voce = {
  etichetta: string
  href: string
  /** Vero quando il collegamento porta a una sezione della home. */
  ancora: boolean
}

export const MENU: Voce[] = [
  { etichetta: 'Servizi', href: '#servizi', ancora: true },
  { etichetta: 'Portfolio', href: '#portfolio', ancora: true },
  { etichetta: 'Processo', href: '#processo', ancora: true },
  { etichetta: 'Chi sono', href: '#chi-sono', ancora: true },
  { etichetta: 'Contatti', href: '#contatti', ancora: true },
]

/** Colonna dei collegamenti nel piè di pagina. */
export const MENU_PIEDE: Voce[] = [
  { etichetta: 'Home', href: '#apertura', ancora: true },
  ...MENU,
  { etichetta: 'Privacy Policy', href: '/privacy', ancora: false },
]
