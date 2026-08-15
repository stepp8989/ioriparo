import type { FormulaNoleggio, Noleggio, TariffeNoleggio } from '@/lib/tipi'

/**
 * Regole del noleggio, condivise fra modulo di prenotazione e rotta API.
 *
 * Stanno qui e non nel componente perché il totale mostrato al cliente e quello
 * salvato nell'archivio devono essere calcolati dalla stessa funzione: due
 * implementazioni parallele divergono al primo cambio di listino, e la
 * differenza la scopre il cliente alla cassa.
 */

/**
 * Costo di un periodo con la combinazione più conveniente di formule.
 *
 * Con tariffe mensili molto più basse di trenta giornaliere, chi noleggia
 * trentacinque giorni deve pagare un mese più cinque giorni, non trentacinque
 * giorni singoli. E se una settimana intera costa meno di sei giorni sciolti,
 * si applica la settimana: nessuno deve pagare di più per aver noleggiato di
 * meno.
 */
export function calcolaTotale(tariffe: TariffeNoleggio, giorni: number): number {
  if (giorni <= 0) return 0

  const mesi = Math.floor(giorni / 30)
  let restanti = giorni - mesi * 30
  const settimane = Math.floor(restanti / 7)
  restanti -= settimane * 7

  const composto =
    mesi * tariffe.mensile + settimane * tariffe.settimanale + restanti * tariffe.giornaliera

  const alternative = [composto]
  if (giorni <= 7) alternative.push(tariffe.settimanale)
  if (giorni <= 30) alternative.push(tariffe.mensile)

  return Math.min(...alternative)
}

/** Formula prevalente del periodo: serve solo come etichetta nel riepilogo. */
export function formulaApplicata(giorni: number): FormulaNoleggio {
  if (giorni >= 30) return 'mensile'
  if (giorni >= 7) return 'settimanale'
  return 'giornaliera'
}

/** Stati che tengono davvero fermo il veicolo: gli annullati liberano le date. */
const STATI_IMPEGNATIVI = new Set(['in-attesa', 'confermato', 'in-corso'])

/**
 * Giorni già impegnati per un veicolo, in formato `AAAA-MM-GG`.
 *
 * Vengono restituiti come elenco di singole date invece che come intervalli:
 * il calendario deve poter dire «questo giorno è occupato» senza attraversare
 * ogni volta tutti i periodi, e per una flotta di questa dimensione l'elenco
 * resta di poche centinaia di stringhe.
 */
export function giorniOccupati(noleggi: Noleggio[], veicoloId: string): string[] {
  const giorni = new Set<string>()

  for (const noleggio of noleggi) {
    if (noleggio.veicoloId !== veicoloId) continue
    if (!STATI_IMPEGNATIVI.has(noleggio.stato)) continue

    const corrente = new Date(`${noleggio.dal}T12:00:00`)
    const ultimo = new Date(`${noleggio.al}T12:00:00`)
    if (Number.isNaN(corrente.getTime()) || Number.isNaN(ultimo.getTime())) continue

    // Un noleggio malformato non deve mandare in ciclo infinito la rotta:
    // il numero di passi è limitato a un anno.
    let passi = 0
    while (corrente <= ultimo && passi < 400) {
      giorni.add(
        `${corrente.getFullYear()}-${String(corrente.getMonth() + 1).padStart(2, '0')}-${String(
          corrente.getDate(),
        ).padStart(2, '0')}`,
      )
      corrente.setDate(corrente.getDate() + 1)
      passi += 1
    }
  }

  return [...giorni].sort()
}

/** Vero se nessun giorno del periodo richiesto è già impegnato. */
export function periodoDisponibile(
  noleggi: Noleggio[],
  veicoloId: string,
  dal: string,
  al: string,
): boolean {
  const occupati = new Set(giorniOccupati(noleggi, veicoloId))
  const corrente = new Date(`${dal}T12:00:00`)
  const ultimo = new Date(`${al}T12:00:00`)

  let passi = 0
  while (corrente <= ultimo && passi < 400) {
    const giorno = `${corrente.getFullYear()}-${String(corrente.getMonth() + 1).padStart(
      2,
      '0',
    )}-${String(corrente.getDate()).padStart(2, '0')}`
    if (occupati.has(giorno)) return false
    corrente.setDate(corrente.getDate() + 1)
    passi += 1
  }

  return true
}

/**
 * Acconto richiesto per il pagamento online.
 *
 * Si chiede il 30% del totale, non l'intera somma: è la prassi del settore e
 * limita l'importo da rimborsare se il noleggio viene annullato.
 */
export function acconto(totale: number): number {
  return Math.round(totale * 0.3 * 100) / 100
}
