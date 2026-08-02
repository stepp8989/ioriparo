import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { corpoJson, testoPulito } from '@/lib/protezione'
import type { Evento } from '@/lib/tipi'
import { nuovoId, oggiIso } from '@/lib/utili'

/** Eventi e promozioni mostrati in home. */

function aggiornaPagine() {
  revalidatePath('/')
  revalidatePath('/admin/eventi')
}

function componiEvento(corpo: Record<string, unknown>, precedente?: Evento): Evento {
  const data = testoPulito(corpo.data, 10)

  return {
    id: precedente?.id ?? nuovoId('evt'),
    titolo: testoPulito(corpo.titolo, 90) || (precedente?.titolo ?? ''),
    sottotitolo: testoPulito(corpo.sottotitolo, 90) || (precedente?.sottotitolo ?? ''),
    descrizione: testoPulito(corpo.descrizione, 600) || (precedente?.descrizione ?? ''),
    data: /^\d{4}-\d{2}-\d{2}$/.test(data) ? data : (precedente?.data ?? oggiIso()),
    immagine:
      testoPulito(corpo.immagine, 200) ||
      precedente?.immagine ||
      '/immagini/eventi/evt-degustazione.jpg',
    attivo: typeof corpo.attivo === 'boolean' ? corpo.attivo : (precedente?.attivo ?? true),
  }
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { eventi } = await leggi()
  return Response.json({ eventi })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const evento = componiEvento(await corpoJson(richiesta))
  if (!evento.titolo) return Response.json({ errore: 'Il titolo è obbligatorio.' }, { status: 400 })

  await modifica((archivio) => {
    archivio.eventi.push(evento)
  })

  aggiornaPagine()
  return Response.json({ evento }, { status: 201 })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const posizione = archivio.eventi.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const evento = componiEvento(corpo, archivio.eventi[posizione])
    archivio.eventi[posizione] = evento
    return evento
  })

  if (!aggiornato) return Response.json({ errore: 'Evento non trovato.' }, { status: 404 })

  aggiornaPagine()
  return Response.json({ evento: aggiornato })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.eventi.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.eventi.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Evento non trovato.' }, { status: 404 })

  aggiornaPagine()
  return Response.json({ esito: 'eliminato' })
}
