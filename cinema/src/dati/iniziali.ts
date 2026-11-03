import { CINEMA_INIZIALI, SALE_INIZIALI } from '@/dati/cinema'
import { FILM_INIZIALI } from '@/dati/film'
import { FOOD_INIZIALE } from '@/dati/food'
import { LIVELLI_INIZIALI, PIANI_INIZIALI, PREMI_INIZIALI, TIPOLOGIE_INIZIALI } from '@/dati/listini'
import { impostazioniIniziali } from '@/dati/marchio'
import { generaPalinsesto } from '@/dati/programmazione'
import { PROMOZIONI_INIZIALI } from '@/dati/promozioni'
import type { Archivio } from '@/lib/tipi'

/**
 * Contenuto dell'archivio al primo avvio.
 *
 * `structuredClone` è indispensabile: senza, l'archivio in memoria terrebbe i
 * riferimenti agli oggetti dei moduli di dati, e la prima modifica fatta dal
 * pannello cambierebbe anche i contenuti iniziali, rendendo impossibile
 * ripartire da zero senza riavviare il processo.
 *
 * Il palinsesto è l'unica parte calcolata invece che scritta: si genera a
 * partire dalla data del primo avvio, per dieci giorni. È la scelta giusta per
 * una versione dimostrativa — un listino di orari fissi sarebbe già scaduto il
 * giorno dopo — e va tenuta presente in produzione: appena si comincia a
 * programmare sul serio dal pannello, questi spettacoli vanno sostituiti.
 * Il pulsante «Genera palinsesto» nella pagina Programmazione usa la stessa
 * funzione, e serve proprio a questo.
 */
export function archivioIniziale(): Archivio {
  const film = structuredClone(FILM_INIZIALI)
  const cinema = structuredClone(CINEMA_INIZIALI)
  const sale = structuredClone(SALE_INIZIALI)

  return {
    impostazioni: impostazioniIniziali(),
    film,
    cinema,
    sale,
    spettacoli: generaPalinsesto(film, cinema, sale, [], { giorni: 10 }),
    tipologieBiglietto: structuredClone(TIPOLOGIE_INIZIALI),
    prenotazioni: [],
    clienti: [],
    livelliLoyalty: structuredClone(LIVELLI_INIZIALI),
    premiLoyalty: structuredClone(PREMI_INIZIALI),
    movimentiPunti: [],
    piani: structuredClone(PIANI_INIZIALI),
    sottoscrizioni: [],
    promozioni: structuredClone(PROMOZIONI_INIZIALI),
    coupon: [],
    giftCard: [],
    food: structuredClone(FOOD_INIZIALE),
    notifiche: [],
    registro: [],
  }
}
