import type { Impostazioni } from '@/lib/tipi'

/**
 * Identità del marchio: valori di partenza.
 *
 * Sono i predefiniti con cui l'archivio nasce. Una volta avviata la
 * piattaforma, il nome, il claim, i recapiti, i colori e le commissioni si
 * cambiano dal pannello (Impostazioni) e vivono in `archivio.impostazioni`:
 * questo file torna a contare solo quando si riparte da zero.
 *
 * Il nome «CINEMAX» è provvisorio e volutamente neutro. Cambiarlo qui basta a
 * cambiarlo in tutta l'applicazione — intestazione, biglietti, email, titoli
 * delle pagine — perché nessun altro file scrive il nome del marchio in chiaro.
 */
export const MARCHIO = {
  nome: 'CINEMAX',
  claim: 'Il cinema come deve essere',
  descrizione:
    'Biglietti, orari e sale di tutta la rete CINEMAX. Scegli il posto, aggiungi il food, ' +
    'entra con il QR sul telefono.',
  dominio: 'https://www.cinemax.example',
  email: 'info@cinemax.example',
  telefono: '+39 070 000 0000',
  /** Rosso sipario e viola proiezione: gli stessi due di `globals.css`. */
  colore: '#ff3f6c',
  coloreAlt: '#9d6bff',
} as const

/** Impostazioni complete di partenza, copiate nell'archivio al primo avvio. */
export function impostazioniIniziali(): Impostazioni {
  return {
    marchio: { ...MARCHIO },
    social: {
      instagram: 'https://instagram.com/',
      facebook: 'https://facebook.com/',
      tiktok: '',
      youtube: 'https://youtube.com/',
    },
    // Una commissione di servizio per ordine e non per biglietto: chi porta
    // quattro amici non deve pagarla quattro volte. La seconda voce resta
    // disponibile per chi preferisce il modello opposto, ed è a zero.
    commissioneServizio: 0.9,
    commissionePerBiglietto: 0,
    minutiBloccoPosti: 10,
    // Trenta minuti prima dell'inizio la vendita online chiude: oltre non c'è
    // il tempo materiale di arrivare, e il posto va liberato per la cassa.
    chiusuraVenditaMinuti: 30,
    postiMassimiPerOrdine: 10,
    puntiPerEuro: 10,
    // Cento punti valgono un euro: dieci euro di spesa danno cento punti,
    // quindi il ritorno è del dieci per cento in punti, uno per cento in euro.
    valorePunto: 0.01,
    supplementiFormato: {
      '2D': 0,
      '3D': 2,
      IMAX: 3.5,
      '4DX': 5,
      'Dolby Atmos': 2,
      'VO sottotitolato': 0,
    },
    supplementiPosto: {
      standard: 0,
      premium: 2.5,
      // I posti riservati e quelli dell'accompagnatore non hanno supplemento,
      // e non è una svista: farlo pagare sarebbe discriminatorio.
      disabili: 0,
      accompagnatore: 0,
    },
    moduli: {
      loyalty: true,
      abbonamenti: true,
      food: true,
      giftCard: true,
      registrazione: true,
    },
  }
}
