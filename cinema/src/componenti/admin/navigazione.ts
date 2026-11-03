import type { NomeIcona } from '@/componenti/ui/Icona'

/**
 * Voci della barra laterale del pannello.
 *
 * L'ordine non è alfabetico ed è deliberato: segue la frequenza d'uso reale di
 * chi gestisce una sala. La programmazione e le prenotazioni si aprono ogni
 * giorno, le impostazioni una volta l'anno.
 */

export type VoceAdmin = {
  href: string
  etichetta: string
  icona: NomeIcona
  /** Descrizione breve mostrata nel cruscotto. */
  descrizione: string
}

export type GruppoAdmin = {
  titolo: string
  voci: VoceAdmin[]
}

export const NAVIGAZIONE_ADMIN: GruppoAdmin[] = [
  {
    titolo: 'Ogni giorno',
    voci: [
      {
        href: '/admin',
        etichetta: 'Cruscotto',
        icona: 'grafico',
        descrizione: 'Incassi, occupazione e stato della giornata',
      },
      {
        href: '/admin/programmazione',
        etichetta: 'Programmazione',
        icona: 'calendario',
        descrizione: 'Spettacoli, orari e generazione del palinsesto',
      },
      {
        href: '/admin/prenotazioni',
        etichetta: 'Prenotazioni',
        icona: 'biglietto',
        descrizione: 'Ordini, incassi in cassa, annullamenti e rimborsi',
      },
      {
        href: '/admin/verifica',
        etichetta: 'Verifica biglietti',
        icona: 'qr',
        descrizione: 'Lettura dei QR all’ingresso della sala',
      },
    ],
  },
  {
    titolo: 'Catalogo',
    voci: [
      { href: '/admin/film', etichetta: 'Film', icona: 'ciak', descrizione: 'Catalogo, locandine, cast e trailer' },
      { href: '/admin/importa', etichetta: 'Importa film', icona: 'scarica', descrizione: 'Schede, locandine e cast da The Movie Database' },
      { href: '/admin/cinema', etichetta: 'Cinema', icona: 'posizione', descrizione: 'Strutture, indirizzi, orari e servizi' },
      { href: '/admin/sale', etichetta: 'Sale e posti', icona: 'poltrona', descrizione: 'Piante delle sale e tipi di poltrona' },
      { href: '/admin/food', etichetta: 'Food & Drink', icona: 'popcorn', descrizione: 'Banco alimentari, prezzi e allergeni' },
    ],
  },
  {
    titolo: 'Commerciale',
    voci: [
      { href: '/admin/tipologie', etichetta: 'Tipologie biglietto', icona: 'elenco', descrizione: 'Intero, ridotto, studente, VIP' },
      { href: '/admin/promozioni', etichetta: 'Promozioni', icona: 'percento', descrizione: 'Sconti, 2x1, happy hour, giornate speciali' },
      { href: '/admin/coupon', etichetta: 'Coupon', icona: 'regalo', descrizione: 'Codici personali, anche a lotti' },
      { href: '/admin/gift-card', etichetta: 'Gift card', icona: 'carta', descrizione: 'Saldi, movimenti e blocchi' },
      { href: '/admin/abbonamenti', etichetta: 'Abbonamenti', icona: 'tessera', descrizione: 'Piani, prezzi e vantaggi' },
      { href: '/admin/loyalty', etichetta: 'Programma CLUB', icona: 'trofeo', descrizione: 'Livelli, premi e rettifiche punti' },
    ],
  },
  {
    titolo: 'Gestione',
    voci: [
      { href: '/admin/clienti', etichetta: 'Clienti', icona: 'utenti', descrizione: 'Anagrafica, punti e abbonamenti' },
      { href: '/admin/statistiche', etichetta: 'Statistiche', icona: 'grafico', descrizione: 'Vendite, occupazione e presenze' },
      { href: '/admin/registro', etichetta: 'Registro', icona: 'elenco', descrizione: 'Chi ha fatto cosa, e quando' },
      { href: '/admin/impostazioni', etichetta: 'Impostazioni', icona: 'impostazioni', descrizione: 'Marchio, commissioni, moduli attivi' },
    ],
  },
]

/** Tutte le voci in un solo elenco, per la ricerca del titolo di pagina. */
export const VOCI_ADMIN = NAVIGAZIONE_ADMIN.flatMap((gruppo) => gruppo.voci)
