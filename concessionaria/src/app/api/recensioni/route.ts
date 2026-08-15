import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { corpoJson, dataPulita, fraLeVoci, numeroIntero, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { Recensione } from '@/lib/tipi'
import { nuovoId, oggiIso } from '@/lib/utili'

/**
 * Recensioni dei clienti.
 *
 * Non c'è una rotta pubblica di inserimento: le recensioni arrivano da Google
 * e Facebook e vengono trascritte dallo staff. Un modulo aperto a chiunque su
 * un sito di vendita è il posto sbagliato per raccoglierle — nessuno le
 * crederebbe, e andrebbe moderato ogni giorno.
 *
 *   GET    riservata — elenco completo
 *   POST   riservata — aggiunge una recensione trascritta
 *   PUT    riservata — modifica una recensione
 *   PATCH  riservata — pubblica o nasconde
 *   DELETE riservata — elimina definitivamente
 */

const FONTI = ['google', 'facebook', 'diretta'] as const
const SERVIZI = ['vendita', 'noleggio', 'detailing', 'assistenza'] as const

function recensioneDalCorpo(
  corpo: Record<string, unknown>,
  esistente?: Recensione,
): Recensione {
  return {
    id: esistente?.id ?? nuovoId('rec'),
    autore: testoPulito(corpo.autore, 80) || esistente?.autore || 'Cliente',
    testo: testoPulito(corpo.testo, 1_500),
    voto: numeroIntero(corpo.voto, 1, 5, 5) as Recensione['voto'],
    data: dataPulita(corpo.data) || esistente?.data || oggiIso(),
    fonte: fraLeVoci(corpo.fonte, FONTI) ? corpo.fonte : 'google',
    servizio: fraLeVoci(corpo.servizio, SERVIZI) ? corpo.servizio : 'vendita',
    pubblicata: corpo.pubblicata !== false,
  }
}

/** La media in home e nei dati strutturati dipende da queste voci. */
function rigenera() {
  revalidatePath('/')
  revalidatePath('/detailing')
  revalidatePath('/admin/recensioni')
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { recensioni } = await leggi()
  return Response.json({ recensioni })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const recensione = recensioneDalCorpo(await corpoJson(richiesta))

  if (recensione.testo.length < 10) {
    return Response.json({ errore: 'Il testo della recensione è troppo corto.' }, { status: 400 })
  }

  await modifica((archivio) => {
    archivio.recensioni.unshift(recensione)
  })

  rigenera()
  return Response.json({ recensione }, { status: 201 })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornata = await modifica((archivio) => {
    const posizione = archivio.recensioni.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const recensione = recensioneDalCorpo(corpo, archivio.recensioni[posizione])
    archivio.recensioni[posizione] = recensione
    return recensione
  })

  if (!aggiornata) return Response.json({ errore: 'Recensione non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ recensione: aggiornata })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)
  const pubblicata = corpo.pubblicata !== false

  const trovata = await modifica((archivio) => {
    const recensione = archivio.recensioni.find((voce) => voce.id === id)
    if (!recensione) return false
    recensione.pubblicata = pubblicata
    return true
  })

  if (!trovata) return Response.json({ errore: 'Recensione non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ esito: 'aggiornata' })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimossa = await modifica((archivio) => {
    const posizione = archivio.recensioni.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.recensioni.splice(posizione, 1)
    return true
  })

  if (!rimossa) return Response.json({ errore: 'Recensione non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ esito: 'eliminata' })
}
