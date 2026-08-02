import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { emailValida, nuovoId } from '@/lib/utili'

/**
 * Modulo contatti.
 *
 *   POST  pubblica  — registra il messaggio
 *   GET   riservata — elenco per il pannello
 */
export async function POST(richiesta: Request) {
  if (troppeRichieste(`contatti:${chiamante(richiesta)}`, 4, 15)) {
    return Response.json(
      { errore: 'Troppi messaggi ravvicinati. Riprovate più tardi o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)

  // Campo esca: è nascosto nel modulo, quindi solo un automatismo lo compila.
  if (testoPulito(corpo.sito, 50) !== '') {
    return Response.json({ messaggio: 'Messaggio inviato.' }, { status: 201 })
  }

  const nome = testoPulito(corpo.nome, 80)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 30)
  const testo = testoPulito(corpo.testo, 2000)

  if (nome.length < 2 || !emailValida(email) || testo.length < 10) {
    return Response.json(
      { errore: 'Compilate nome, email e un messaggio di almeno dieci caratteri.' },
      { status: 400 },
    )
  }

  await modifica((archivio) => {
    archivio.messaggi.unshift({
      id: nuovoId('msg'),
      nome,
      email,
      telefono,
      testo,
      letto: false,
      creatoIl: new Date().toISOString(),
    })
  })

  return Response.json({ messaggio: 'Messaggio inviato. Vi rispondiamo al più presto.' }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { messaggi } = await leggi()
  return Response.json({ messaggi })
}

/** Segna un messaggio come letto. */
export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const trovato = await modifica((archivio) => {
    const messaggio = archivio.messaggi.find((voce) => voce.id === id)
    if (!messaggio) return false
    messaggio.letto = corpo.letto !== false
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
