import { leggi, modifica } from '@/lib/archivio'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { emailValida, nuovoId } from '@/lib/utili'

/**
 * Iscrizioni alla newsletter.
 *
 *   POST   pubblica  — iscrive un indirizzo
 *   GET    riservata — elenco per il pannello
 *   DELETE riservata — cancella un'iscrizione
 */

export async function POST(richiesta: Request) {
  if (troppeRichieste(`newsletter:${chiamante(richiesta)}`, 5, 30)) {
    return Response.json({ errore: 'Troppe richieste ravvicinate.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)
  const email = testoPulito(corpo.email, 120).toLowerCase()

  if (!emailValida(email)) {
    return Response.json({ errore: 'Controllate l’indirizzo email.' }, { status: 400 })
  }

  await modifica((archivio) => {
    // Un doppio invio non deve creare due righe né dare errore: per chi si
    // iscrive il risultato è lo stesso, ed è quello che si aspetta.
    if (archivio.newsletter.some((voce) => voce.email === email)) return
    archivio.newsletter.unshift({
      id: nuovoId('nws'),
      email,
      iscrittoIl: new Date().toISOString(),
    })
  })

  return Response.json({ esito: 'iscritto' }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { newsletter } = await leggi()
  return Response.json({ newsletter })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.newsletter.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.newsletter.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Iscrizione non trovata.' }, { status: 404 })

  return Response.json({ esito: 'eliminata' })
}
