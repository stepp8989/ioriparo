import {
  ARTICOLI_INIZIALI,
  OFFERTE_INIZIALI,
  ORARI_INIZIALI,
  RECENSIONI_INIZIALI,
} from '@/dati/contenuti'
import { VEICOLI_INIZIALI } from '@/dati/veicoli'
import type { Archivio } from '@/lib/tipi'

/**
 * Contenuto dell'archivio al primo avvio.
 *
 * `structuredClone` è indispensabile: senza, l'archivio in memoria terrebbe i
 * riferimenti agli oggetti dei moduli di dati, e la prima modifica fatta dal
 * pannello cambierebbe anche i contenuti iniziali, rendendo impossibile
 * ripartire da zero senza riavviare il processo.
 */
export function archivioIniziale(): Archivio {
  return {
    veicoli: structuredClone(VEICOLI_INIZIALI),
    richieste: [],
    noleggi: [],
    appuntamenti: [],
    clienti: [],
    recensioni: structuredClone(RECENSIONI_INIZIALI),
    articoli: structuredClone(ARTICOLI_INIZIALI),
    offerte: structuredClone(OFFERTE_INIZIALI),
    messaggi: [],
    newsletter: [],
    orari: structuredClone(ORARI_INIZIALI),
  }
}
