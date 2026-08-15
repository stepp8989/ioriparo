import {
  ALIMENTAZIONI,
  CAMBI,
  CONDIZIONI,
  NOMI_ALIMENTAZIONE,
  NOMI_CAMBIO,
  NOMI_CONDIZIONE,
  NOMI_TIPOLOGIA,
  TIPI_VEICOLO,
  TIPOLOGIE_AUTO,
  TIPOLOGIE_MOTO,
  type Alimentazione,
  type Cambio,
  type Condizione,
  type TipoVeicolo,
  type Tipologia,
  type Veicolo,
} from '@/lib/tipi'

/**
 * Ricerca e filtri del catalogo.
 *
 * Sono funzioni pure, senza dipendenze dal server: le stesse regole valgono per
 * il primo disegno lato server e per l'aggiornamento immediato mentre l'utente
 * muove i cursori. Il filtro non viene mai applicato due volte in modi diversi.
 */

export const ORDINI = [
  'rilevanza',
  'prezzo-crescente',
  'prezzo-decrescente',
  'anno-recente',
  'km-crescente',
  'potenza-decrescente',
] as const

export type Ordine = (typeof ORDINI)[number]

export const NOMI_ORDINE: Record<Ordine, string> = {
  rilevanza: 'Più rilevanti',
  'prezzo-crescente': 'Prezzo crescente',
  'prezzo-decrescente': 'Prezzo decrescente',
  'anno-recente': 'Immatricolazione recente',
  'km-crescente': 'Chilometri crescenti',
  'potenza-decrescente': 'Potenza decrescente',
}

export type Filtri = {
  testo: string
  tipo: TipoVeicolo | 'tutti'
  marca: string
  modello: string
  annoMin: number | null
  prezzoMin: number | null
  prezzoMax: number | null
  kmMax: number | null
  potenzaMin: number | null
  alimentazione: Alimentazione[]
  cambio: Cambio[]
  tipologia: Tipologia[]
  condizione: Condizione[]
  /** Mostra solo i veicoli che hanno tariffe di noleggio. */
  soloNoleggio: boolean
  ordine: Ordine
}

export const FILTRI_VUOTI: Filtri = {
  testo: '',
  tipo: 'tutti',
  marca: '',
  modello: '',
  annoMin: null,
  prezzoMin: null,
  prezzoMax: null,
  kmMax: null,
  potenzaMin: null,
  alimentazione: [],
  cambio: [],
  tipologia: [],
  condizione: [],
  soloNoleggio: false,
  ordine: 'rilevanza',
}

/** Vero quando nessun filtro è attivo: serve a mostrare o meno «Azzera». */
export function filtriAttivi(filtri: Filtri): number {
  let attivi = 0
  if (filtri.testo.trim()) attivi += 1
  if (filtri.tipo !== 'tutti') attivi += 1
  if (filtri.marca) attivi += 1
  if (filtri.modello) attivi += 1
  if (filtri.annoMin !== null) attivi += 1
  if (filtri.prezzoMin !== null) attivi += 1
  if (filtri.prezzoMax !== null) attivi += 1
  if (filtri.kmMax !== null) attivi += 1
  if (filtri.potenzaMin !== null) attivi += 1
  if (filtri.soloNoleggio) attivi += 1
  return (
    attivi +
    filtri.alimentazione.length +
    filtri.cambio.length +
    filtri.tipologia.length +
    filtri.condizione.length
  )
}

/** Minuscolo, senza accenti: la forma in cui si confrontano i testi. */
function normalizza(valore: string): string {
  return valore
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/**
 * Sinonimi della ricerca libera.
 *
 * Chi cerca «automatica» o «cambio auto» intende lo stesso filtro, e «km0»
 * si scrive in almeno quattro modi. Tradurre le parole comuni nei valori
 * interni evita che una ricerca ragionevole non dia risultati.
 */
const SINONIMI: Record<string, string[]> = {
  automatica: ['automatico'],
  automatic: ['automatico'],
  auto: ['automatico'],
  manuale: ['manuale'],
  gasolio: ['diesel'],
  elettrica: ['elettrica'],
  elettrico: ['elettrica'],
  ev: ['elettrica'],
  full: ['ibrida'],
  hybrid: ['ibrida'],
  ibrido: ['ibrida'],
  plugin: ['ibrida-plug-in'],
  phev: ['ibrida-plug-in'],
  km0: ['km-0'],
  kmzero: ['km-0'],
  'chilometri-zero': ['km-0'],
  nuova: ['nuovo'],
  usata: ['usato'],
  familiare: ['station-wagon'],
  sw: ['station-wagon'],
  wagon: ['station-wagon'],
  fuoristrada: ['suv'],
  crossover: ['suv'],
  citycar: ['city-car'],
  utilitaria: ['city-car'],
  decappottabile: ['cabrio'],
  spider: ['cabrio'],
  scooterone: ['scooter'],
  maxienduro: ['enduro'],
  adventure: ['enduro'],
}

/**
 * Testo su cui la ricerca libera confronta le parole: tutto ciò che descrive
 * il veicolo, comprese le etichette leggibili dei valori interni.
 */
function indice(veicolo: Veicolo): string {
  return normalizza(
    [
      veicolo.marca,
      veicolo.modello,
      veicolo.allestimento,
      veicolo.colore,
      String(veicolo.anno),
      veicolo.tipo,
      veicolo.alimentazione,
      NOMI_ALIMENTAZIONE[veicolo.alimentazione],
      veicolo.cambio,
      NOMI_CAMBIO[veicolo.cambio],
      veicolo.condizione,
      NOMI_CONDIZIONE[veicolo.condizione],
      veicolo.tipologia,
      NOMI_TIPOLOGIA[veicolo.tipologia],
      veicolo.dotazioni.join(' '),
    ].join(' '),
  )
}

/**
 * Ricerca libera: tutte le parole digitate devono comparire nella scheda.
 *
 * Un numero grande viene interpretato come tetto di prezzo — «suv 30000»
 * significa un SUV entro trentamila euro — perché è il modo in cui le persone
 * scrivono davvero nella casella di ricerca.
 */
function corrispondeAlTesto(veicolo: Veicolo, testo: string): boolean {
  const parole = normalizza(testo)
    .split(/[^a-z0-9-]+/)
    .filter((parola) => parola.length > 1)

  if (parole.length === 0) return true

  const contenuto = indice(veicolo)

  return parole.every((parola) => {
    // Numero sopra il migliaio: è un prezzo massimo, non una parola.
    const numero = Number(parola)
    if (Number.isFinite(numero) && numero >= 1000) return veicolo.prezzo <= numero

    if (contenuto.includes(parola)) return true
    return (SINONIMI[parola] ?? []).some((sinonimo) => contenuto.includes(sinonimo))
  })
}

/** Applica i filtri e restituisce i veicoli ordinati. */
export function applicaFiltri(veicoli: Veicolo[], filtri: Filtri): Veicolo[] {
  const trovati = veicoli.filter((veicolo) => {
    if (!veicolo.visibile) return false
    if (filtri.tipo !== 'tutti' && veicolo.tipo !== filtri.tipo) return false
    if (filtri.marca && veicolo.marca !== filtri.marca) return false
    if (filtri.modello && veicolo.modello !== filtri.modello) return false
    if (filtri.annoMin !== null && veicolo.anno < filtri.annoMin) return false
    if (filtri.prezzoMin !== null && veicolo.prezzo < filtri.prezzoMin) return false
    if (filtri.prezzoMax !== null && veicolo.prezzo > filtri.prezzoMax) return false
    if (filtri.kmMax !== null && veicolo.chilometri > filtri.kmMax) return false
    if (filtri.potenzaMin !== null && veicolo.potenzaCv < filtri.potenzaMin) return false
    if (filtri.soloNoleggio && !veicolo.noleggio) return false
    if (filtri.alimentazione.length && !filtri.alimentazione.includes(veicolo.alimentazione)) {
      return false
    }
    if (filtri.cambio.length && !filtri.cambio.includes(veicolo.cambio)) return false
    if (filtri.tipologia.length && !filtri.tipologia.includes(veicolo.tipologia)) return false
    if (filtri.condizione.length && !filtri.condizione.includes(veicolo.condizione)) return false
    if (filtri.testo.trim() && !corrispondeAlTesto(veicolo, filtri.testo)) return false
    return true
  })

  return ordina(trovati, filtri.ordine)
}

/** Ordina una copia dell'elenco: l'originale non viene toccato. */
export function ordina(veicoli: Veicolo[], ordine: Ordine): Veicolo[] {
  const elenco = [...veicoli]

  switch (ordine) {
    case 'prezzo-crescente':
      return elenco.sort((a, b) => a.prezzo - b.prezzo)
    case 'prezzo-decrescente':
      return elenco.sort((a, b) => b.prezzo - a.prezzo)
    case 'anno-recente':
      return elenco.sort((a, b) => b.anno - a.anno || a.chilometri - b.chilometri)
    case 'km-crescente':
      return elenco.sort((a, b) => a.chilometri - b.chilometri)
    case 'potenza-decrescente':
      return elenco.sort((a, b) => b.potenzaCv - a.potenzaCv)
    default:
      // Rilevanza: prima la vetrina, poi i disponibili, poi gli arrivi recenti.
      return elenco.sort((a, b) => {
        if (a.inVetrina !== b.inVetrina) return a.inVetrina ? -1 : 1
        const disponibileA = a.stato === 'disponibile'
        const disponibileB = b.stato === 'disponibile'
        if (disponibileA !== disponibileB) return disponibileA ? -1 : 1
        return b.creatoIl.localeCompare(a.creatoIl)
      })
  }
}

/**
 * Valori selezionabili nei filtri, ricavati dal catalogo reale: non si offre
 * mai una marca che non è in piazzale.
 */
export type OpzioniFiltri = {
  marche: string[]
  modelli: string[]
  tipologie: Tipologia[]
  alimentazioni: Alimentazione[]
  cambi: Cambio[]
  condizioni: Condizione[]
  prezzoMinimo: number
  prezzoMassimo: number
  annoMinimo: number
  kmMassimo: number
  potenzaMassima: number
}

export function opzioniFiltri(veicoli: Veicolo[], filtri: Filtri): OpzioniFiltri {
  // Le opzioni si calcolano sui veicoli del tipo scelto: fra le moto non ha
  // senso proporre «monovolume», e viceversa.
  const pertinenti = veicoli.filter(
    (veicolo) => veicolo.visibile && (filtri.tipo === 'tutti' || veicolo.tipo === filtri.tipo),
  )

  const prezzi = pertinenti.map((veicolo) => veicolo.prezzo)
  const anni = pertinenti.map((veicolo) => veicolo.anno)
  const km = pertinenti.map((veicolo) => veicolo.chilometri)
  const potenze = pertinenti.map((veicolo) => veicolo.potenzaCv)

  const tipologieAmmesse: readonly Tipologia[] =
    filtri.tipo === 'moto' ? TIPOLOGIE_MOTO : filtri.tipo === 'auto' ? TIPOLOGIE_AUTO : [...TIPOLOGIE_AUTO, ...TIPOLOGIE_MOTO]

  return {
    marche: [...new Set(pertinenti.map((veicolo) => veicolo.marca))].sort((a, b) =>
      a.localeCompare(b, 'it'),
    ),
    // I modelli hanno senso solo dopo aver scelto la marca: altrimenti sarebbe
    // un elenco lunghissimo di nomi che non dicono nulla.
    modelli: filtri.marca
      ? [
          ...new Set(
            pertinenti
              .filter((veicolo) => veicolo.marca === filtri.marca)
              .map((veicolo) => veicolo.modello),
          ),
        ].sort((a, b) => a.localeCompare(b, 'it'))
      : [],
    tipologie: tipologieAmmesse.filter((tipologia) =>
      pertinenti.some((veicolo) => veicolo.tipologia === tipologia),
    ),
    alimentazioni: ALIMENTAZIONI.filter((alimentazione) =>
      pertinenti.some((veicolo) => veicolo.alimentazione === alimentazione),
    ),
    cambi: CAMBI.filter((cambio) => pertinenti.some((veicolo) => veicolo.cambio === cambio)),
    condizioni: CONDIZIONI.filter((condizione) =>
      pertinenti.some((veicolo) => veicolo.condizione === condizione),
    ),
    prezzoMinimo: prezzi.length ? Math.min(...prezzi) : 0,
    prezzoMassimo: prezzi.length ? Math.max(...prezzi) : 100_000,
    annoMinimo: anni.length ? Math.min(...anni) : 2000,
    kmMassimo: km.length ? Math.max(...km) : 200_000,
    potenzaMassima: potenze.length ? Math.max(...potenze) : 500,
  }
}

/* ── Traduzione da e verso l'indirizzo ───────────────────────────────────── */

/**
 * I filtri viaggiano nell'indirizzo: così una ricerca si può salvare fra i
 * preferiti, mandare a un amico o ritrovare col tasto «indietro».
 */
export function daiParametri(parametri: URLSearchParams): Filtri {
  const numeroDa = (chiave: string): number | null => {
    const valore = Number(parametri.get(chiave))
    return parametri.has(chiave) && Number.isFinite(valore) ? valore : null
  }

  const elencoDa = <T extends string>(chiave: string, ammessi: readonly T[]): T[] => {
    const grezzo = parametri.get(chiave)
    if (!grezzo) return []
    return grezzo.split(',').filter((voce): voce is T => (ammessi as readonly string[]).includes(voce))
  }

  const tipo = parametri.get('tipo')
  const ordine = parametri.get('ordine')

  return {
    testo: parametri.get('q') ?? '',
    tipo: (TIPI_VEICOLO as readonly string[]).includes(tipo ?? '') ? (tipo as TipoVeicolo) : 'tutti',
    marca: parametri.get('marca') ?? '',
    modello: parametri.get('modello') ?? '',
    annoMin: numeroDa('anno'),
    prezzoMin: numeroDa('prezzoMin'),
    prezzoMax: numeroDa('prezzoMax'),
    kmMax: numeroDa('km'),
    potenzaMin: numeroDa('potenza'),
    alimentazione: elencoDa('alimentazione', ALIMENTAZIONI),
    cambio: elencoDa('cambio', CAMBI),
    tipologia: elencoDa('tipologia', [...TIPOLOGIE_AUTO, ...TIPOLOGIE_MOTO]),
    condizione: elencoDa('condizione', CONDIZIONI),
    soloNoleggio: parametri.get('noleggio') === '1',
    ordine: (ORDINI as readonly string[]).includes(ordine ?? '') ? (ordine as Ordine) : 'rilevanza',
  }
}

/** Scrive i filtri nell'indirizzo, omettendo tutto ciò che è al valore di partenza. */
export function aiParametri(filtri: Filtri): URLSearchParams {
  const parametri = new URLSearchParams()

  if (filtri.testo.trim()) parametri.set('q', filtri.testo.trim())
  if (filtri.tipo !== 'tutti') parametri.set('tipo', filtri.tipo)
  if (filtri.marca) parametri.set('marca', filtri.marca)
  if (filtri.modello) parametri.set('modello', filtri.modello)
  if (filtri.annoMin !== null) parametri.set('anno', String(filtri.annoMin))
  if (filtri.prezzoMin !== null) parametri.set('prezzoMin', String(filtri.prezzoMin))
  if (filtri.prezzoMax !== null) parametri.set('prezzoMax', String(filtri.prezzoMax))
  if (filtri.kmMax !== null) parametri.set('km', String(filtri.kmMax))
  if (filtri.potenzaMin !== null) parametri.set('potenza', String(filtri.potenzaMin))
  if (filtri.alimentazione.length) parametri.set('alimentazione', filtri.alimentazione.join(','))
  if (filtri.cambio.length) parametri.set('cambio', filtri.cambio.join(','))
  if (filtri.tipologia.length) parametri.set('tipologia', filtri.tipologia.join(','))
  if (filtri.condizione.length) parametri.set('condizione', filtri.condizione.join(','))
  if (filtri.soloNoleggio) parametri.set('noleggio', '1')
  if (filtri.ordine !== 'rilevanza') parametri.set('ordine', filtri.ordine)

  return parametri
}
