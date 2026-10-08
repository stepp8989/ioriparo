import type { Riparazione } from '@/types'

/**
 * Omaggio della pellicola con la sostituzione del display.
 *
 * Chi ripara da noi lo schermo di uno smartphone Apple o Samsung riceve
 * applicata in omaggio la pellicola ECOSHIELD 7H HD. È di Io Riparo: nella
 * build del solo gestionale, consegnata ad altre attività, resta spenta.
 */
export const PELLICOLA = {
  attiva: import.meta.env.VITE_SOLO_GESTIONALE !== '1',
  prodotto: 'Pellicola ECOSHIELD 7H HD',
  descrizione: 'la protezione rigida ad alta definizione ed eco-progettata',
  condizione: 'con la sostituzione del display di uno smartphone Apple o Samsung',
  /** Descrizione della riga che finisce sulla scheda e sulla ricevuta. */
  riga: 'Pellicola ECOSHIELD 7H HD applicata — omaggio',
}

const MARCHE = /apple|iphone|samsung|galaxy/i
const DISPLAY = /display|lcd|oled|schermo|vetro|touch/i

/** Vero se la riparazione dà diritto alla pellicola in omaggio. */
export function haDirittoPellicola(r: Riparazione): boolean {
  if (!PELLICOLA.attiva || r.tipoDispositivo !== 'smartphone') return false
  if (!MARCHE.test(`${r.marca} ${r.modello}`)) return false
  const lavoro = [r.difettoSegnalato, ...r.interventi.map((i) => i.descrizione)].join(' ')
  return DISPLAY.test(lavoro)
}

/** Vero se l'omaggio è già fra gli interventi. */
export const pellicolaApplicata = (r: Riparazione) => r.interventi.some((i) => i.omaggio)
