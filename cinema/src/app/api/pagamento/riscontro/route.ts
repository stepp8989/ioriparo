import { modifica } from '@/lib/archivio'
import { riscontroStripeValido } from '@/lib/pagamenti'
import { confermaPagamento } from '@/lib/prenotazioni'
import { inviaConfermaPrenotazione } from '@/lib/posta'
import { BASE } from '@/lib/seo'

/**
 * Riscontro di pagamento di Stripe (webhook).
 *
 *   POST /api/pagamento/riscontro
 *
 * È l'unico punto in cui una prenotazione pagata con carta diventa confermata.
 * Il ritorno del cliente sul sito non basta: chi paga può chiudere il browser
 * prima di essere rimandato indietro, e chi non paga può comunque digitare a
 * mano l'indirizzo di ritorno.
 *
 * Il corpo grezzo va letto come testo, non come JSON già interpretato: la
 * firma di Stripe è calcolata sui byte esatti che sono stati spediti, e
 * riserializzare l'oggetto cambierebbe spaziature e ordine delle chiavi
 * facendo fallire la verifica.
 *
 * Configurazione: nel cruscotto Stripe si crea un endpoint che punta a questo
 * indirizzo per l'evento `checkout.session.completed`, e il segreto che Stripe
 * mostra va messo in `STRIPE_WEBHOOK_SECRET`.
 */

export const dynamic = 'force-dynamic'

type EventoStripe = {
  type?: string
  data?: {
    object?: {
      id?: string
      client_reference_id?: string
      payment_status?: string
      metadata?: { prenotazione?: string }
    }
  }
}

export async function POST(richiesta: Request) {
  const corpoGrezzo = await richiesta.text()
  const firma = richiesta.headers.get('stripe-signature')

  if (!riscontroStripeValido(corpoGrezzo, firma)) {
    // Senza segreto configurato la verifica fallisce sempre, ed è voluto:
    // accettare riscontri non verificati significherebbe permettere a chiunque
    // di confermare prenotazioni non pagate.
    return Response.json({ errore: 'Firma non valida.' }, { status: 400 })
  }

  let evento: EventoStripe
  try {
    evento = JSON.parse(corpoGrezzo) as EventoStripe
  } catch {
    return Response.json({ errore: 'Corpo non leggibile.' }, { status: 400 })
  }

  if (evento.type !== 'checkout.session.completed') {
    // Gli altri eventi non interessano, ma vanno confermati con un 200:
    // altrimenti Stripe continuerebbe a ritentare per giorni.
    return Response.json({ ricevuto: true })
  }

  const sessione = evento.data?.object
  const codice = sessione?.metadata?.prenotazione ?? sessione?.client_reference_id ?? ''

  if (!codice || sessione?.payment_status !== 'paid') {
    return Response.json({ ricevuto: true })
  }

  const esito = await modifica((archivio) => {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)
    if (!prenotazione) return null

    const { giaConfermata } = confermaPagamento(
      archivio,
      prenotazione,
      prenotazione.pagamento.metodo === 'cassa' ? 'carta' : prenotazione.pagamento.metodo,
      sessione?.id ?? '',
    )

    return {
      giaConfermata,
      prenotazione,
      film: archivio.film.find((voce) => voce.id === prenotazione.filmId),
      cinema: archivio.cinema.find((voce) => voce.id === prenotazione.cinemaId),
      sala: archivio.sale.find((voce) => voce.id === prenotazione.salaId)?.nome ?? '',
      impostazioni: archivio.impostazioni,
    }
  })

  // Anche una prenotazione sconosciuta riceve un 200: se il codice non esiste
  // più, ritentare non servirebbe a nulla.
  if (!esito) return Response.json({ ricevuto: true })

  if (!esito.giaConfermata && esito.prenotazione.ospite?.email) {
    void inviaConfermaPrenotazione(
      esito.prenotazione,
      esito.film,
      esito.cinema,
      esito.sala,
      esito.impostazioni,
      BASE.toString().replace(/\/$/, ''),
    )
  }

  return Response.json({ ricevuto: true })
}
