import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import {
  corpoJson,
  elencoPulito,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  testoPulito,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import {
  ALIMENTAZIONI,
  CAMBI,
  CONDIZIONI,
  STATI_VEICOLO,
  TIPI_VEICOLO,
  TIPOLOGIE_AUTO,
  TIPOLOGIE_MOTO,
  type TariffeNoleggio,
  type Veicolo,
} from '@/lib/tipi'
import { inSlug, nuovoId } from '@/lib/utili'

/**
 * Gestione del catalogo dal pannello.
 *
 * Tutte le operazioni sono riservate: il catalogo pubblico si legge dalle
 * pagine, che pescano direttamente dall'archivio senza passare da qui.
 *
 *   GET    elenco completo, compresi i veicoli nascosti
 *   POST   crea un veicolo
 *   PUT    sostituisce un veicolo esistente
 *   PATCH  modifica al volo visibilità, vetrina o stato
 *   DELETE elimina definitivamente
 */

const TIPOLOGIE = [...TIPOLOGIE_AUTO, ...TIPOLOGIE_MOTO]

/**
 * Costruisce un veicolo valido a partire dai dati del modulo.
 *
 * Ogni campo passa da un controllo di tipo e di intervallo: il pannello è
 * protetto da password, ma un errore di battitura non deve poter salvare una
 * potenza negativa o un anno a quattro cifre sbagliate.
 */
function veicoloDalCorpo(corpo: Record<string, unknown>, esistente?: Veicolo): Veicolo {
  const tipo = fraLeVoci(corpo.tipo, TIPI_VEICOLO) ? corpo.tipo : (esistente?.tipo ?? 'auto')
  const marca = testoPulito(corpo.marca, 40) || esistente?.marca || 'Senza marca'
  const modello = testoPulito(corpo.modello, 60) || esistente?.modello || 'Senza modello'
  const allestimento = testoPulito(corpo.allestimento, 80)
  const anno = numeroIntero(corpo.anno, 1950, new Date().getFullYear() + 2, new Date().getFullYear())

  // Lo slug si ricalcola dal titolo, ma solo se non ne esiste già uno: gli
  // indirizzi delle schede già pubblicate non devono cambiare da sotto i piedi
  // a chi le ha salvate o condivise.
  const slug =
    esistente?.slug ?? inSlug(`${marca} ${modello} ${allestimento} ${anno}`) ?? nuovoId('veicolo')

  const tariffe = corpo.noleggio as Record<string, unknown> | null | undefined

  const noleggio: TariffeNoleggio | null =
    tariffe && typeof tariffe === 'object'
      ? {
          giornaliera: numeroDecimale(tariffe.giornaliera, 0, 5_000, 0),
          settimanale: numeroDecimale(tariffe.settimanale, 0, 30_000, 0),
          mensile: numeroDecimale(tariffe.mensile, 0, 100_000, 0),
          cauzione: numeroDecimale(tariffe.cauzione, 0, 20_000, 0),
          kmInclusiGiorno: numeroIntero(tariffe.kmInclusiGiorno, 0, 2_000, 150),
          etaMinima: numeroIntero(tariffe.etaMinima, 18, 80, 21),
          consegnaDomicilio: tariffe.consegnaDomicilio === true,
        }
      : null

  return {
    id: esistente?.id ?? nuovoId('vei'),
    slug,
    tipo,
    marca,
    modello,
    allestimento,
    anno,
    chilometri: numeroIntero(corpo.chilometri, 0, 2_000_000, 0),
    prezzo: numeroDecimale(corpo.prezzo, 0, 2_000_000, 0),
    prezzoPrecedente:
      corpo.prezzoPrecedente === null || corpo.prezzoPrecedente === ''
        ? null
        : numeroDecimale(corpo.prezzoPrecedente, 0, 2_000_000, 0) || null,
    condizione: fraLeVoci(corpo.condizione, CONDIZIONI) ? corpo.condizione : 'usato',
    alimentazione: fraLeVoci(corpo.alimentazione, ALIMENTAZIONI) ? corpo.alimentazione : 'benzina',
    cambio: fraLeVoci(corpo.cambio, CAMBI) ? corpo.cambio : 'manuale',
    tipologia: fraLeVoci(corpo.tipologia, TIPOLOGIE)
      ? corpo.tipologia
      : tipo === 'moto'
        ? 'naked'
        : 'berlina',
    potenzaCv: numeroIntero(corpo.potenzaCv, 0, 2_000, 0),
    potenzaKw: numeroDecimale(corpo.potenzaKw, 0, 1_500, 0),
    cilindrata: numeroIntero(corpo.cilindrata, 0, 10_000, 0),
    posti: numeroIntero(corpo.posti, 1, 9, tipo === 'moto' ? 2 : 5),
    porte: numeroIntero(corpo.porte, 0, 7, tipo === 'moto' ? 0 : 5),
    colore: testoPulito(corpo.colore, 60),
    consumoMisto: numeroDecimale(corpo.consumoMisto, 0, 100, 0),
    emissioniCo2: numeroIntero(corpo.emissioniCo2, 0, 1_000, 0),
    classeEmissioni: testoPulito(corpo.classeEmissioni, 30) || 'Euro 6',
    autonomiaKm:
      corpo.autonomiaKm === null || corpo.autonomiaKm === ''
        ? null
        : numeroIntero(corpo.autonomiaKm, 0, 2_000, 0) || null,
    garanziaMesi: numeroIntero(corpo.garanziaMesi, 0, 120, 24),
    descrizione: testoPulito(corpo.descrizione, 4_000),
    dotazioni: elencoPulito(corpo.dotazioni, 60, 120),
    immagini: elencoPulito(corpo.immagini, 12, 300),
    video: testoPulito(corpo.video, 300) || null,
    stato: fraLeVoci(corpo.stato, STATI_VEICOLO) ? corpo.stato : 'disponibile',
    inVetrina: corpo.inVetrina === true,
    visibile: corpo.visibile !== false,
    noleggio,
    creatoIl: esistente?.creatoIl ?? new Date().toISOString(),
  }
}

/** Le pagine che mostrano il catalogo vanno rigenerate dopo ogni modifica. */
function rigenera(slug?: string) {
  revalidatePath('/')
  revalidatePath('/catalogo')
  revalidatePath('/noleggio')
  revalidatePath('/admin/veicoli')
  if (slug) revalidatePath(`/catalogo/${slug}`)
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { veicoli } = await leggi()
  return Response.json({ veicoli })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const veicolo = veicoloDalCorpo(corpo)

  // Due veicoli non possono condividere lo stesso indirizzo: si aggiunge un
  // suffisso invece di rifiutare il salvataggio, perché due allestimenti
  // identici in piazzale capitano davvero.
  const { veicoli } = await leggi()
  if (veicoli.some((voce) => voce.slug === veicolo.slug)) {
    veicolo.slug = `${veicolo.slug}-${veicolo.id.slice(-4)}`
  }

  await modifica((archivio) => {
    archivio.veicoli.unshift(veicolo)
  })

  rigenera(veicolo.slug)
  return Response.json({ veicolo }, { status: 201 })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const posizione = archivio.veicoli.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const veicolo = veicoloDalCorpo(corpo, archivio.veicoli[posizione])
    archivio.veicoli[posizione] = veicolo
    return veicolo
  })

  if (!aggiornato) return Response.json({ errore: 'Veicolo non trovato.' }, { status: 404 })

  rigenera(aggiornato.slug)
  return Response.json({ veicolo: aggiornato })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const veicolo = archivio.veicoli.find((voce) => voce.id === id)
    if (!veicolo) return null

    if (typeof corpo.visibile === 'boolean') veicolo.visibile = corpo.visibile
    if (typeof corpo.inVetrina === 'boolean') veicolo.inVetrina = corpo.inVetrina
    if (fraLeVoci(corpo.stato, STATI_VEICOLO)) veicolo.stato = corpo.stato

    return veicolo
  })

  if (!aggiornato) return Response.json({ errore: 'Veicolo non trovato.' }, { status: 404 })

  rigenera(aggiornato.slug)
  return Response.json({ veicolo: aggiornato })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.veicoli.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null
    return archivio.veicoli.splice(posizione, 1)[0]
  })

  if (!rimosso) return Response.json({ errore: 'Veicolo non trovato.' }, { status: 404 })

  rigenera(rimosso.slug)
  return Response.json({ esito: 'eliminato' })
}
