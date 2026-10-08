import type { Cinema, Film, Formato, Sala, Spettacolo } from '@/lib/tipi'
import { conflittoDiSala } from '@/lib/programmazione'
import { nuovoId, oggiIso, sommaGiorni } from '@/lib/utili'

/**
 * Costruzione automatica del palinsesto.
 *
 * Serve a due cose molto diverse che però hanno lo stesso problema da
 * risolvere. La prima: riempire l'archivio dimostrativo di orari veri al primo
 * avvio, perché una biglietteria senza spettacoli non si può nemmeno guardare.
 * La seconda, che è quella che conta in esercizio: dare all'operatore un punto
 * di partenza per la settimana, da correggere invece che da comporre da zero.
 *
 * Il criterio è quello con cui si programma davvero un multisala:
 *
 *   — i film in evidenza e quelli appena usciti occupano le sale grandi e le
 *     fasce migliori (dalle 19 alle 22), perché sono quelle che vendono;
 *   — i film per famiglie prendono gli orari del pomeriggio, dove il pubblico
 *     c'è, e non quelli di mezzanotte, dove non ci sarebbe;
 *   — un film vietato ai minori di quattordici anni non va nello spettacolo
 *     delle 16:00;
 *   — nessuna sala ospita due proiezioni sovrapposte, e il controllo è quello
 *     vero di `conflittoDiSala`, non una regola semplificata per i dati finti.
 *
 * La funzione non tocca l'archivio: restituisce spettacoli, e chi la chiama
 * decide se aggiungerli o scartarli.
 */

/** Fasce d'inizio, dalla più pomeridiana alla più tarda. */
const FASCE = ['15:00', '16:30', '17:30', '18:45', '20:00', '21:15', '22:30'] as const

/**
 * Generatore pseudocasuale deterministico.
 *
 * Il palinsesto deve essere vario ma riproducibile: due avvii della stessa
 * installazione devono produrre lo stesso listino, altrimenti gli orari
 * cambierebbero a ogni riavvio del processo e nessuna prenotazione
 * dimostrativa resterebbe valida.
 */
function generatore(seme: number) {
  let stato = seme >>> 0
  return () => {
    stato = (stato * 1_664_525 + 1_013_904_223) >>> 0
    return stato / 0x1_0000_0000
  }
}

/** Prezzo base di uno spettacolo secondo giorno e fascia oraria. */
function prezzoBase(data: string, ora: string): number {
  const giorno = new Date(`${data}T12:00:00`).getDay()
  const feriale = giorno >= 1 && giorno <= 4
  const pomeridiano = ora < '18:00'

  // Listino classico: il feriale pomeridiano costa meno del fine settimana
  // serale, che è il momento in cui la sala si riempie da sola.
  if (feriale && pomeridiano) return 6.5
  if (feriale) return 8
  if (pomeridiano) return 7.5
  return 9.5
}

/** Formato da usare in questa sala per questo film: il migliore che entrambi
 *  supportano, perché è quello per cui vale la pena venire al cinema. */
function formatoMigliore(film: Film, sala: Sala): Formato {
  const preferenza: Formato[] = ['IMAX', '4DX', 'Dolby Atmos', '3D', '2D']
  for (const formato of preferenza) {
    if (film.formati.includes(formato) && sala.formati.includes(formato)) return formato
  }
  return '2D'
}

/** Vero se il film è adatto alla fascia oraria. */
function fasciaAmmessa(film: Film, ora: string): boolean {
  if (film.classificazione === 'VM18') return ora >= '20:00'
  if (film.classificazione === 'VM14') return ora >= '17:30'
  // Un film per famiglie alle 22:30 è una sala vuota annunciata.
  if (film.generi.includes('Famiglia') || film.generi.includes('Animazione')) return ora < '20:00'
  return true
}

export type OpzioniPalinsesto = {
  /** Primo giorno da programmare, `AAAA-MM-GG`. */
  da?: string
  giorni?: number
  /** Solo questi cinema; vuoto = tutti. */
  cinemaIds?: string[]
  seme?: number
}

/**
 * Genera il palinsesto di più giorni per una rete di cinema.
 *
 * `esistenti` sono gli spettacoli già in archivio: servono a non creare
 * sovrapposizioni con quello che l'operatore ha già sistemato a mano.
 */
export function generaPalinsesto(
  film: Film[],
  cinema: Cinema[],
  sale: Sala[],
  esistenti: Spettacolo[] = [],
  opzioni: OpzioniPalinsesto = {},
): Spettacolo[] {
  const da = opzioni.da ?? oggiIso()
  const giorni = Math.max(1, Math.min(30, opzioni.giorni ?? 10))
  const casuale = generatore(opzioni.seme ?? 20260908)

  const inSala = film.filter((voce) => voce.visibile && voce.stato === 'in-sala')
  if (inSala.length === 0) return []

  const filmPerId = new Map(film.map((voce) => [voce.id, voce]))

  // I film in evidenza vanno proposti più spesso: l'elenco pesato è il modo
  // più semplice per ottenerlo senza inventare un punteggio.
  const pesati: Film[] = []
  for (const voce of inSala) {
    pesati.push(voce, voce)
    if (voce.inEvidenza) pesati.push(voce, voce)
  }

  const creati: Spettacolo[] = []
  const tutti = () => [...esistenti, ...creati]

  const strutture = opzioni.cinemaIds?.length
    ? cinema.filter((voce) => opzioni.cinemaIds?.includes(voce.id))
    : cinema

  for (let giorno = 0; giorno < giorni; giorno += 1) {
    const data = sommaGiorni(da, giorno)
    const giornoSettimana = new Date(`${data}T12:00:00`).getDay()
    const fineSettimana = giornoSettimana === 0 || giornoSettimana === 5 || giornoSettimana === 6

    for (const struttura of strutture) {
      const saleDelCinema = sale.filter((voce) => voce.cinemaId === struttura.id && voce.attiva)

      for (const [indiceSala, salaCorrente] of saleDelCinema.entries()) {
        // Nei giorni feriali le sale piccole non aprono tutte: tenere accesa
        // una sala da cento posti per otto spettatori costa più del biglietto.
        if (!fineSettimana && indiceSala >= 4 && casuale() < 0.45) continue

        // Le fasce di prima serata si usano sempre; le altre a rotazione, così
        // sale diverse hanno orari diversi e il pubblico può scegliere.
        const fasce = FASCE.filter((ora) => {
          if (ora >= '19:00' && ora <= '22:00') return true
          if (!fineSettimana && ora < '17:00') return casuale() < 0.35
          return casuale() < 0.6
        })

        for (const ora of fasce) {
          // Un film per sala e per giornata resta più a lungo in cartellone:
          // si sceglie una volta e si prova a tenerlo su più fasce.
          const candidati = pesati.filter((voce) => fasciaAmmessa(voce, ora))
          if (candidati.length === 0) continue

          const scelto = candidati[Math.floor(casuale() * candidati.length)]

          const proposta = {
            salaId: salaCorrente.id,
            data,
            ora,
          }

          if (conflittoDiSala(proposta, tutti(), filmPerId, scelto.durataMinuti)) continue

          creati.push({
            id: nuovoId('spe'),
            filmId: scelto.id,
            cinemaId: struttura.id,
            salaId: salaCorrente.id,
            data,
            ora,
            formato: formatoMigliore(scelto, salaCorrente),
            // La lingua originale è una scelta di programmazione, non un
            // ripiego: si mette dove c'è pubblico per farla, cioè nelle sale
            // che la supportano e in prima serata.
            lingua:
              salaCorrente.formati.includes('VO sottotitolato') &&
              scelto.lingua !== 'Italiano' &&
              ora >= '20:00' &&
              casuale() < 0.5
                ? 'VO'
                : 'IT',
            prezzoBase: prezzoBase(data, ora),
            stato: 'programmato',
            creatoIl: new Date().toISOString(),
          })
        }
      }
    }
  }

  return creati
}
