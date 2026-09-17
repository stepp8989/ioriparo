import { leggi, modifica } from '@/lib/archivio'
import {
  METODI_PAGAMENTO,
  type MetodoPagamento,
} from '@/lib/tipi'
import { confermaPagamento } from '@/lib/prenotazioni'
import { incassaPayPal, metodiDisponibili, preparaPagamento } from '@/lib/pagamenti'
import { inviaConfermaPrenotazione } from '@/lib/posta'
import { chiamante, codicePulito, corpoJson, fraLeVoci, testoPulito, troppeRichieste } from '@/lib/protezione'
import { BASE } from '@/lib/seo'

/**
 * Avvio e chiusura del pagamento.
 *
 *   GET   metodi disponibili con la configurazione attuale
 *   POST  prepara il pagamento e restituisce l'indirizzo a cui andare
 *   PUT   chiude un pagamento PayPal al ritorno del cliente
 *
 * La conferma della prenotazione non avviene mai qui sulla parola del browser.
 * Per Stripe arriva dal riscontro firmato (`/api/pagamento/riscontro`); per
 * PayPal si incassa l'ordine interrogando PayPal e si accetta solo se risponde
 * «completato». Un `POST` che dicesse «ho pagato» e venisse creduto sarebbe un
 * modo per entrare gratis al cinema.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({ metodi: metodiDisponibili() })
}

export async function POST(richiesta: Request) {
  if (troppeRichieste(`pagamento:${chiamante(richiesta)}`, 20, 10)) {
    return Response.json({ errore: 'Troppi tentativi. Riprova fra qualche minuto.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)
  const codice = codicePulito(corpo.codice, 12)
  const metodo: MetodoPagamento = fraLeVoci(corpo.metodo, METODI_PAGAMENTO)
    ? corpo.metodo
    : 'carta'

  if (!metodiDisponibili().includes(metodo)) {
    return Response.json({ errore: 'Metodo di pagamento non disponibile.' }, { status: 400 })
  }

  const archivio = await leggi()
  const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)

  if (!prenotazione) return Response.json({ errore: 'Prenotazione non trovata.' }, { status: 404 })

  if (prenotazione.stato !== 'in-attesa') {
    return Response.json(
      { errore: 'Questa prenotazione non è in attesa di pagamento.' },
      { status: 409 },
    )
  }

  if (new Date(prenotazione.scadenzaBlocco).getTime() <= Date.now()) {
    return Response.json(
      { errore: 'Il tempo per completare il pagamento è scaduto e i posti sono tornati liberi.' },
      { status: 409 },
    )
  }

  const film = archivio.film.find((voce) => voce.id === prenotazione.filmId)
  const base = BASE.toString().replace(/\/$/, '')

  const esito = await preparaPagamento({
    metodo,
    importo: prenotazione.totale,
    descrizione: `${archivio.impostazioni.marchio.nome} — ${film?.titolo ?? 'Biglietti'} · ${prenotazione.data} ${prenotazione.ora}`,
    riferimento: prenotazione.codice,
    email: prenotazione.ospite?.email ?? '',
    urlSuccesso: `${base}/biglietto/${prenotazione.codice}?pagamento=ok`,
    urlAnnullo: `${base}/acquista?spettacolo=${prenotazione.spettacoloId}&annullato=1`,
  })

  if (!esito) {
    return Response.json(
      {
        errore:
          'Il servizio di pagamento non è raggiungibile. La prenotazione resta valida: puoi pagare in cassa mostrando il codice.',
        codice: prenotazione.codice,
      },
      { status: 503 },
    )
  }

  // Si annota il riferimento del fornitore prima di mandare via il cliente:
  // serve a riconoscere il riscontro quando torna.
  await modifica((corrente) => {
    const voce = corrente.prenotazioni.find((riga) => riga.codice === codice)
    if (voce) {
      voce.pagamento.metodo = metodo
      voce.pagamento.riferimento = esito.riferimento
    }
  })

  return Response.json({ url: esito.url, riferimento: esito.riferimento })
}

/** Chiusura del pagamento PayPal al ritorno del cliente sul sito. */
export async function PUT(richiesta: Request) {
  const corpo = await corpoJson(richiesta)
  const codice = codicePulito(corpo.codice, 12)
  const ordine = testoPulito(corpo.ordine, 80)

  if (!codice || !ordine) {
    return Response.json({ errore: 'Dati del pagamento incompleti.' }, { status: 400 })
  }

  const incassato = await incassaPayPal(ordine)
  if (!incassato) {
    return Response.json({ errore: 'Il pagamento non risulta completato.' }, { status: 402 })
  }

  const esito = await modifica((archivio) => {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)
    if (!prenotazione) return { errore: 'Prenotazione non trovata.', stato: 404 } as const

    const { giaConfermata } = confermaPagamento(archivio, prenotazione, 'paypal', ordine)

    return {
      giaConfermata,
      prenotazione,
      film: archivio.film.find((voce) => voce.id === prenotazione.filmId),
      cinema: archivio.cinema.find((voce) => voce.id === prenotazione.cinemaId),
      sala: archivio.sale.find((voce) => voce.id === prenotazione.salaId)?.nome ?? '',
      impostazioni: archivio.impostazioni,
    } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

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

  return Response.json({ codice, stato: 'confermata' })
}
