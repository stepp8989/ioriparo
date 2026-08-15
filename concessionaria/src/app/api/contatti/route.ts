import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { Messaggio } from '@/lib/tipi'
import { emailValida, nuovoId } from '@/lib/utili'

/**
 * Messaggi dal modulo contatti e dalla chat del sito.
 *
 *   POST   pubblica  — registra il messaggio
 *   GET    riservata — elenco per il pannello
 *   PATCH  riservata — segna come letto o da rileggere
 *   DELETE riservata — elimina definitivamente
 */

export async function POST(richiesta: Request) {
  if (troppeRichieste(`contatto:${chiamante(richiesta)}`, 8, 15)) {
    return Response.json(
      { errore: 'Troppi messaggi ravvicinati. Riprovate fra qualche minuto o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)

  const nome = testoPulito(corpo.nome, 80)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 30)
  const oggetto = testoPulito(corpo.oggetto, 120) || 'Messaggio dal sito'
  const testo = testoPulito(corpo.testo, 2500)

  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (!emailValida(email)) errori.push('email')
  if (testo.length < 10) errori.push('messaggio')

  if (errori.length > 0) {
    return Response.json({ errore: `Controllate questi campi: ${errori.join(', ')}.` }, { status: 400 })
  }

  const messaggio: Messaggio = {
    id: nuovoId('msg'),
    nome,
    email,
    telefono,
    oggetto,
    testo,
    letto: false,
    creatoIl: new Date().toISOString(),
  }

  await modifica((archivio) => {
    archivio.messaggi.unshift(messaggio)
  })

  return Response.json({ esito: 'ricevuto' }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { messaggi } = await leggi()
  return Response.json({ messaggi })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)
  const letto = corpo.letto !== false

  const trovato = await modifica((archivio) => {
    const messaggio = archivio.messaggi.find((voce) => voce.id === id)
    if (!messaggio) return false
    messaggio.letto = letto
    return true
  })

  if (!trovato) return Response.json({ errore: 'Messaggio non trovato.' }, { status: 404 })

  revalidatePath('/admin/messaggi')
  return Response.json({ esito: 'aggiornato' })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.messaggi.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.messaggi.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Messaggio non trovato.' }, { status: 404 })

  revalidatePath('/admin/messaggi')
  return Response.json({ esito: 'eliminato' })
}
