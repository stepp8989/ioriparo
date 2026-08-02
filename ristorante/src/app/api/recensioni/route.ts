import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { corpoJson, numeroIntero, testoPulito } from '@/lib/protezione'
import type { Recensione } from '@/lib/tipi'
import { nuovoId, oggiIso } from '@/lib/utili'

/**
 * Gestione delle recensioni dal pannello.
 *
 * Le recensioni non arrivano dal sito: vengono trascritte dallo staff da
 * Google o Tripadvisor, oppure inserite dopo un riscontro diretto in sala.
 * Il campo `pubblicata` permette di toglierne una dalla vista senza perderla.
 */

function aggiornaPagine() {
  revalidatePath('/')
  revalidatePath('/admin/recensioni')
}

function componiRecensione(corpo: Record<string, unknown>, precedente?: Recensione): Recensione {
  const fonte = testoPulito(corpo.fonte, 20)
  const data = testoPulito(corpo.data, 10)

  return {
    id: precedente?.id ?? nuovoId('rec'),
    autore: testoPulito(corpo.autore, 60) || (precedente?.autore ?? ''),
    testo: testoPulito(corpo.testo, 800) || (precedente?.testo ?? ''),
    voto: numeroIntero(corpo.voto, 1, 5, precedente?.voto ?? 5) as Recensione['voto'],
    data: /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : (precedente?.data ?? oggiIso()),
    fonte:
      fonte === 'google' || fonte === 'tripadvisor' || fonte === 'diretta'
        ? fonte
        : (precedente?.fonte ?? 'google'),
    pubblicata:
      typeof corpo.pubblicata === 'boolean' ? corpo.pubblicata : (precedente?.pubblicata ?? true),
  }
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

  const recensione = componiRecensione(await corpoJson(richiesta))

  if (!recensione.autore || !recensione.testo) {
    return Response.json({ errore: 'Autore e testo sono obbligatori.' }, { status: 400 })
  }

  await modifica((archivio) => {
    archivio.recensioni.unshift(recensione)
  })

  aggiornaPagine()
  return Response.json({ recensione }, { status: 201 })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornata = await modifica((archivio) => {
    const posizione = archivio.recensioni.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const recensione = componiRecensione(corpo, archivio.recensioni[posizione])
    archivio.recensioni[posizione] = recensione
    return recensione
  })

  if (!aggiornata) return Response.json({ errore: 'Recensione non trovata.' }, { status: 404 })

  aggiornaPagine()
  return Response.json({ recensione: aggiornata })
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

  aggiornaPagine()
  return Response.json({ esito: 'eliminata' })
}
