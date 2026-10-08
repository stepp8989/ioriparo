/**
 * Mappa della sala: generazione, lettura e scelta automatica dei posti.
 *
 * Questo modulo non tocca l'archivio e non è riservato al server: la stessa
 * funzione che l'editor del pannello usa per costruire una sala serve al
 * browser per disegnarla durante l'acquisto, e la scelta automatica dei posti
 * migliori deve poter girare da entrambe le parti.
 */

import type { FilaSala, Posto, SchemaSala, TipoPosto } from '@/lib/tipi'
import { chiavePosto, etichettaFila } from '@/lib/utili'

/** Parametri dell'editor di sala del pannello. */
export type ConfigurazioneSala = {
  file: number
  postiPerFila: number
  /**
   * Quante file in fondo sono premium. In una sala vera i posti migliori sono
   * quelli centrali delle ultime file: da lì lo schermo si guarda senza
   * piegare il collo, ed è il motivo per cui costano di più.
   */
  filePremium: number
  /** Posti riservati a chi usa la sedia a rotelle, ricavati in una fila sola. */
  postiDisabili: number
  /** Fila su cui ricavarli, contata dallo schermo; 0 = automatica (la prima
   *  fila dopo il corridoio centrale, dove l'accesso è in piano). */
  filaDisabili: number
  /** Numero di corridoi verticali: dividono la fila in blocchi. */
  corridoiVerticali: number
  /** Indici delle file dopo le quali lasciare un passaggio orizzontale. */
  corridoiOrizzontali: number[]
  schermo: 'alto' | 'basso'
}

export const CONFIGURAZIONE_PREDEFINITA: ConfigurazioneSala = {
  file: 12,
  postiPerFila: 16,
  filePremium: 3,
  postiDisabili: 2,
  filaDisabili: 0,
  corridoiVerticali: 2,
  corridoiOrizzontali: [],
  schermo: 'alto',
}

/**
 * Costruisce lo schema di una sala a partire dai parametri dell'editor.
 *
 * I corridoi verticali sono caselle `vuoto` inserite nella griglia: occupano
 * spazio ma non ricevono numerazione, così il posto 9 resta il posto 9 anche se
 * graficamente si trova dopo un passaggio. È il modo in cui le sale numerano
 * davvero le poltrone, e l'alternativa — saltare dei numeri — genera reclami
 * alla cassa.
 */
export function generaSchema(configurazione: ConfigurazioneSala): SchemaSala {
  const opzioni = { ...CONFIGURAZIONE_PREDEFINITA, ...configurazione }
  const numeroFile = Math.max(1, Math.min(40, Math.round(opzioni.file)))
  const perFila = Math.max(2, Math.min(60, Math.round(opzioni.postiPerFila)))
  const premium = Math.max(0, Math.min(numeroFile, Math.round(opzioni.filePremium)))
  const corridoi = Math.max(0, Math.min(4, Math.round(opzioni.corridoiVerticali)))

  // Le posizioni dei corridoi verticali dividono la fila in blocchi il più
  // possibile uguali: con due corridoi e sedici posti si ottiene 5 | 6 | 5.
  const posizioniCorridoio = new Set<number>()
  for (let indice = 1; indice <= corridoi; indice += 1) {
    posizioniCorridoio.add(Math.round((perFila * indice) / (corridoi + 1)))
  }

  // Fila dei posti riservati: quella indicata, oppure poco oltre la metà della
  // sala, dove il pavimento è ancora in piano e si entra senza scalini.
  const filaRiservata =
    opzioni.filaDisabili > 0 && opzioni.filaDisabili <= numeroFile
      ? opzioni.filaDisabili - 1
      : Math.min(numeroFile - 1, Math.floor(numeroFile / 2))

  const file: FilaSala[] = []

  for (let indiceFila = 0; indiceFila < numeroFile; indiceFila += 1) {
    const etichetta = etichettaFila(indiceFila)
    const posti: Posto[] = []
    let numero = 0

    // Le file premium si contano dal fondo, cioè dall'ultima verso lo schermo.
    const isPremium = indiceFila >= numeroFile - premium
    const isRiservata = indiceFila === filaRiservata && opzioni.postiDisabili > 0

    for (let colonna = 0; colonna < perFila; colonna += 1) {
      if (posizioniCorridoio.has(colonna)) {
        posti.push({ numero: 0, tipo: 'vuoto' })
      }

      numero += 1

      let tipo: TipoPosto = isPremium ? 'premium' : 'standard'

      if (isRiservata) {
        // I posti riservati stanno a bordo corridoio, dove la sedia arriva
        // senza dover passare davanti a nessuno: si prendono i primi della
        // fila, e accanto a ciascuno si lascia il posto dell'accompagnatore.
        const postiSpeciali = opzioni.postiDisabili * 2
        if (colonna < postiSpeciali) {
          tipo = colonna % 2 === 0 ? 'disabili' : 'accompagnatore'
        }
      }

      posti.push({ numero, tipo })
    }

    file.push({ etichetta, posti })
  }

  return {
    file,
    corridoiOrizzontali: opzioni.corridoiOrizzontali.filter(
      (indice) => indice > 0 && indice < numeroFile,
    ),
    schermo: opzioni.schermo === 'basso' ? 'basso' : 'alto',
  }
}

/** Numero di poltrone effettivamente vendibili. */
export function capienza(schema: SchemaSala): number {
  return schema.file.reduce(
    (totale, fila) => totale + fila.posti.filter((posto) => posto.tipo !== 'vuoto').length,
    0,
  )
}

/** Conteggio delle poltrone per tipo: serve alla scheda della sala. */
export function conteggioPerTipo(schema: SchemaSala): Record<TipoPosto, number> {
  const conteggio: Record<TipoPosto, number> = {
    standard: 0,
    premium: 0,
    disabili: 0,
    accompagnatore: 0,
    vuoto: 0,
  }
  for (const fila of schema.file) {
    for (const posto of fila.posti) conteggio[posto.tipo] += 1
  }
  return conteggio
}

/** Tutte le poltrone vendibili, con la fila di appartenenza. */
export function postiVendibili(schema: SchemaSala): { fila: string; posto: Posto }[] {
  const elenco: { fila: string; posto: Posto }[] = []
  for (const fila of schema.file) {
    for (const posto of fila.posti) {
      if (posto.tipo !== 'vuoto') elenco.push({ fila: fila.etichetta, posto })
    }
  }
  return elenco
}

/** Trova una poltrona dallo schema, `null` se non esiste o è un corridoio. */
export function trovaPosto(schema: SchemaSala, fila: string, numero: number): Posto | null {
  const riga = schema.file.find((voce) => voce.etichetta === fila)
  if (!riga) return null
  const posto = riga.posti.find((voce) => voce.tipo !== 'vuoto' && voce.numero === numero)
  return posto ?? null
}

/**
 * Sceglie automaticamente i posti migliori ancora liberi.
 *
 * È la funzione dietro al pulsante «scegli tu per me», e il criterio è quello
 * che userebbe una persona alla cassa: posti attaccati fra loro, più vicini
 * possibile al centro della fila, in una fila né troppo avanti né in fondo. Il
 * punteggio più basso vince.
 *
 * Restituisce un elenco vuoto quando non esiste nessun blocco contiguo della
 * dimensione richiesta: in quel caso chi acquista sceglie a mano e accetta di
 * sedersi separato, che è una decisione sua e non del programma.
 */
export function suggerisciPosti(
  schema: SchemaSala,
  occupati: ReadonlySet<string>,
  quantita: number,
): { fila: string; numero: number }[] {
  if (quantita < 1) return []

  const numeroFile = schema.file.length
  // La fila ideale è a due terzi della sala partendo dallo schermo: è il punto
  // in cui l'angolo di visione è quello per cui la sala è stata progettata.
  const filaIdeale = (numeroFile - 1) * 0.66

  let migliore: { fila: string; numero: number }[] = []
  let miglioreCosto = Number.POSITIVE_INFINITY

  for (let indiceFila = 0; indiceFila < numeroFile; indiceFila += 1) {
    const fila = schema.file[indiceFila]
    const disponibili = fila.posti.filter(
      (posto) => posto.tipo !== 'vuoto' && !occupati.has(chiavePosto(fila.etichetta, posto.numero)),
    )
    if (disponibili.length < quantita) continue

    const centro = (fila.posti.filter((posto) => posto.tipo !== 'vuoto').length + 1) / 2

    // Si scorrono tutte le finestre contigue di `quantita` poltrone. Sono
    // contigue davvero solo se i numeri si susseguono: un corridoio in mezzo
    // spezza la fila, e due posti ai lati di un passaggio non sono «vicini».
    for (let inizio = 0; inizio + quantita <= disponibili.length; inizio += 1) {
      const blocco = disponibili.slice(inizio, inizio + quantita)
      const contigui = blocco.every(
        (posto, indice) => indice === 0 || posto.numero === blocco[indice - 1].numero + 1,
      )
      if (!contigui) continue

      // Le poltrone riservate non vengono mai assegnate d'ufficio: chi ne ha
      // bisogno le sceglie, e chi non ne ha bisogno non deve occuparle.
      if (blocco.some((posto) => posto.tipo === 'disabili' || posto.tipo === 'accompagnatore')) {
        continue
      }

      const mediaNumeri = blocco.reduce((somma, posto) => somma + posto.numero, 0) / quantita
      const costo =
        Math.abs(mediaNumeri - centro) * 1.4 + Math.abs(indiceFila - filaIdeale) * 2.2

      if (costo < miglioreCosto) {
        miglioreCosto = costo
        migliore = blocco.map((posto) => ({ fila: fila.etichetta, numero: posto.numero }))
      }
    }
  }

  return migliore
}

/**
 * Controlla che una selezione non lasci un posto singolo isolato fra due
 * gruppi occupati.
 *
 * Non blocca l'acquisto — sarebbe irritante — ma permette all'interfaccia di
 * avvisare: «così resta un posto solo fra i tuoi e quelli già occupati». È una
 * cortesia verso chi arriverà dopo, e le sale che la adottano riempiono di più.
 */
export function lasciaPostoIsolato(
  schema: SchemaSala,
  occupati: ReadonlySet<string>,
  selezionati: ReadonlySet<string>,
): boolean {
  for (const fila of schema.file) {
    const vendibili = fila.posti.filter((posto) => posto.tipo !== 'vuoto')

    for (let indice = 0; indice < vendibili.length; indice += 1) {
      const chiave = chiavePosto(fila.etichetta, vendibili[indice].numero)
      if (occupati.has(chiave) || selezionati.has(chiave)) continue

      const precedente = vendibili[indice - 1]
      const successivo = vendibili[indice + 1]
      // Un posto a bordo fila non è isolato: ha un corridoio da un lato.
      if (!precedente || !successivo) continue

      const chiavePrec = chiavePosto(fila.etichetta, precedente.numero)
      const chiaveSucc = chiavePosto(fila.etichetta, successivo.numero)
      const precPreso = occupati.has(chiavePrec) || selezionati.has(chiavePrec)
      const succPreso = occupati.has(chiaveSucc) || selezionati.has(chiaveSucc)

      if (precPreso && succPreso) return true
    }
  }

  return false
}

/** Larghezza massima della griglia, corridoi compresi: serve al disegno. */
export function colonneGriglia(schema: SchemaSala): number {
  return schema.file.reduce((massimo, fila) => Math.max(massimo, fila.posti.length), 0)
}
