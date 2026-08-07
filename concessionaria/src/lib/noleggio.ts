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
 * Vero se il periodo è un fine settimana: ritiro venerdì o sabato e riconsegna
 * entro il lunedì.
 *
 * Serve la data di partenza, non solo la durata: due giorni di martedì non sono
 * un fine settimana, e il pacchetto weekend non deve applicarsi a un noleggio
 * infrasettimanale che finirebbe per costare meno del listino ordinario.
 */
function eFineSettimana(dal: string | undefined, giorni: number): boolean {
  if (!dal || giorni < 2 || giorni > 3) return false

  const partenza = new Date(`${dal}T12:00:00`)
  if (Number.isNaN(partenza.getTime())) return false

  const giornoSettimana = partenza.getDay()
  return giornoSettimana === 5 || giornoSettimana === 6
}

/**
 * Costo di un periodo con la combinazione più conveniente di formule.
 *
 * Con tariffe mensili molto più basse di trenta giornaliere, chi noleggia
 * trentacinque giorni deve pagare un mese più cinque giorni, non trentacinque
 * giorni singoli. E se una settimana intera costa meno di sei giorni sciolti,
 * si applica la settimana: nessuno deve pagare di più per aver noleggiato di
 * meno.
 *
 * `dal` è facoltativo perché serve a una sola formula, quella del fine
 * settimana: senza la data di partenza il calcolo resta corretto, semplicemente
 * non può accorgersi che quei tre giorni cadono da venerdì a domenica.
 */
export function calcolaTotale(tariffe: TariffeNoleggio, giorni: number, dal?: string): number {
  if (giorni <= 0) return 0

  const mesi = Math.floor(giorni / 30)
  let restanti = giorni - mesi * 30
  const settimane = Math.floor(restanti / 7)
  restanti -= settimane * 7

  const composto =
    mesi * tariffe.mensile + settimane * tariffe.settimanale + restanti * tariffe.giornaliera

  const alternative = [composto]
  if (eFineSettimana(dal, giorni) && tariffe.weekend > 0) alternative.push(tariffe.weekend)
  if (giorni <= 7) alternative.push(tariffe.settimanale)
  if (giorni <= 30) alternative.push(tariffe.mensile)

  return Math.min(...alternative)
}

/** Formula prevalente del periodo: serve solo come etichetta nel riepilogo. */
export function formulaApplicata(giorni: number, dal?: string): FormulaNoleggio {
  if (giorni >= 30) return 'mensile'
  if (giorni >= 7) return 'settimanale'
  if (eFineSettimana(dal, giorni)) return 'weekend'
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
