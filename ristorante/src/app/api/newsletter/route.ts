import { modifica } from '@/lib/archivio'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { emailValida, nuovoId } from '@/lib/utili'

/**
 * Iscrizione alla newsletter.
 *
 * Un indirizzo già presente riceve la stessa risposta di uno nuovo: dire
 * «sei già iscritto» permetterebbe a chiunque di verificare se un indirizzo è
 * nel nostro archivio, e non è un'informazione da regalare.
 */
export async function POST(richiesta: Request) {
  if (troppeRichieste(`newsletter:${chiamante(richiesta)}`, 5, 10)) {
    return Response.json({ errore: 'Troppi tentativi. Riprovate fra qualche minuto.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)
  const email = testoPulito(corpo.email, 120).toLowerCase()

  if (!emailValida(email)) {
    return Response.json({ errore: 'Indirizzo email non valido.' }, { status: 400 })
  }

  await modifica((archivio) => {
    const esiste = archivio.newsletter.some((voce) => voce.email === email)
    if (!esiste) {
      archivio.newsletter.push({
        id: nuovoId('news'),
        email,
        iscrittoIl: new Date().toISOString(),
      })
    }
  })

  return Response.json({ messaggio: 'Iscrizione registrata. Grazie!' }, { status: 201 })
}
