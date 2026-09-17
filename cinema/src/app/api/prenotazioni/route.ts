import { modifica, leggi } from '@/lib/archivio'
import { clienteCollegatoId } from '@/lib/clienti'
import {
  annullaPrenotazione,
  confermaPagamento,
  creaPrenotazione,
  ripulisciScadute,
  valutaOrdine,
} from '@/lib/prenotazioni'
import { inviaConfermaPrenotazione } from '@/lib/posta'
import { chiamante, codicePulito, corpoJson, troppeRichieste } from '@/lib/protezione'
import { leggiOrdine } from '@/lib/richieste'
import { BASE } from '@/lib/seo'
import { pagamentiOnlineAttivi } from '@/lib/pagamenti'
import { emailValida, telefonoValido } from '@/lib/utili'

/**
 * Prenotazioni.
 *
 *   POST    crea una prenotazione e blocca i posti
 *   GET     recupera una prenotazione dal codice
 *   DELETE  annulla una prenotazione ancora da pagare
 *
 * La creazione avviene dentro `modifica`, che serializza le scritture: due
 * richieste per la stessa poltrona vengono valutate una dopo l'altra, e la
 * seconda trova il posto occupato. È il punto in cui si decide che la
 * biglietteria non vende due volte lo stesso posto, e per questo la verifica
 * di disponibilità e la scrittura devono stare nella stessa operazione — non
 * in due chiamate separate.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  // Una decina di ordini ogni cinque minuti dallo stesso indirizzo: un
  // gruppo numeroso che compra in più riprese ci sta dentro largamente, un
  // programma che prova a bloccare tutta la sala no.
  if (troppeRichieste(`prenotazione:${chiamante(richiesta)}`, 10, 5)) {
    return Response.json(
      { errore: 'Troppi ordini in poco tempo. Riprova fra qualche minuto.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)
  const clienteId = await clienteCollegatoId()
  const ordine = leggiOrdine(corpo, clienteId)

  // Chi non è registrato deve lasciare recapiti validi: il biglietto va
  // comunque consegnato da qualche parte.
  if (!clienteId) {
    const ospite = ordine.ospite
    if (!ospite?.nome) {
      return Response.json({ errore: 'Indica il nome per l’intestazione del biglietto.' }, { status: 400 })
    }
    if (!emailValida(ospite.email)) {
      return Response.json({ errore: 'Indirizzo email non valido.' }, { status: 400 })
    }
    if (ospite.telefono && !telefonoValido(ospite.telefono)) {
      return Response.json({ errore: 'Numero di telefono non valido.' }, { status: 400 })
    }
  }

  const risposta = await modifica((archivio) => {
    // Pulizia opportunistica: si fa qui perché è il momento in cui l'archivio
    // è già aperto in scrittura, e costa meno di un'operazione pianificata.
    ripulisciScadute(archivio)

    const esito = valutaOrdine(archivio, ordine)
    if (!esito.ok) return { errore: esito.errore, stato: esito.stato } as const

    const prenotazione = creaPrenotazione(archivio, ordine, esito)

    // Se non c'è nessun fornitore di pagamento configurato, oppure il totale è
    // già a zero (gift card o punti che coprono tutto), la prenotazione si
    // conferma subito: non c'è nulla da incassare online.
    const daPagare = prenotazione.totale > 0 && pagamentiOnlineAttivi()
    if (!daPagare) {
      confermaPagamento(
        archivio,
        prenotazione,
        prenotazione.totale > 0 ? 'cassa' : 'punti',
        prenotazione.totale > 0 ? 'da-incassare-in-cassa' : 'coperto-da-credito',
      )
    }

    return {
      prenotazione,
      daPagare,
      film: archivio.film.find((voce) => voce.id === prenotazione.filmId),
      cinema: archivio.cinema.find((voce) => voce.id === prenotazione.cinemaId),
      sala: archivio.sale.find((voce) => voce.id === prenotazione.salaId)?.nome ?? '',
      impostazioni: archivio.impostazioni,
    } as const
  })

  if ('errore' in risposta) {
    return Response.json({ errore: risposta.errore }, { status: risposta.stato })
  }

  const { prenotazione, daPagare } = risposta

  // L'email parte fuori dalla coda di scrittura: un servizio di posta lento
  // non deve tenere bloccate le altre prenotazioni. Un invio fallito non
  // annulla l'acquisto — il biglietto è già nell'area personale e alla pagina
  // del codice.
  if (!daPagare && prenotazione.ospite?.email) {
    void inviaConfermaPrenotazione(
      prenotazione,
      risposta.film,
      risposta.cinema,
      risposta.sala,
      risposta.impostazioni,
      BASE.toString().replace(/\/$/, ''),
    )
  }

  return Response.json({
    codice: prenotazione.codice,
    totale: prenotazione.totale,
    stato: prenotazione.stato,
    scadenzaBlocco: prenotazione.scadenzaBlocco,
    daPagare,
  })
}

export async function GET(richiesta: Request) {
  const parametri = new URL(richiesta.url).searchParams
  const codice = codicePulito(parametri.get('codice'), 12)

  if (!codice) return Response.json({ errore: 'Codice non indicato.' }, { status: 400 })

  // Il codice è corto e comunicabile a voce: senza un freno, provarli tutti
  // sarebbe questione di minuti. Venti tentativi ogni dieci minuti rendono la
  // cosa impraticabile senza dare fastidio a chi ricarica la propria pagina.
  if (troppeRichieste(`biglietto:${chiamante(richiesta)}`, 20, 10)) {
    return Response.json({ errore: 'Troppi tentativi. Riprova fra qualche minuto.' }, { status: 429 })
  }

  const archivio = await leggi()
  const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)

  if (!prenotazione) {
    return Response.json({ errore: 'Prenotazione non trovata.' }, { status: 404 })
  }

  return Response.json({ prenotazione }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function DELETE(richiesta: Request) {
  const corpo = await corpoJson(richiesta)
  const codice = codicePulito(corpo.codice, 12)
  const clienteId = await clienteCollegatoId()

  const esito = await modifica((archivio) => {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)
    if (!prenotazione) return { errore: 'Prenotazione non trovata.', stato: 404 } as const

    // Si può annullare da qui solo ciò che non è ancora stato pagato, e solo
    // se è proprio: un rimborso tocca denaro già incassato e passa dal
    // pannello, dove resta traccia di chi lo ha disposto.
    if (prenotazione.stato !== 'in-attesa') {
      return {
        errore: 'Questa prenotazione è già stata pagata: per il rimborso contatta il cinema.',
        stato: 409,
      } as const
    }
    if (prenotazione.clienteId && prenotazione.clienteId !== clienteId) {
      return { errore: 'Prenotazione non tua.', stato: 403 } as const
    }

    annullaPrenotazione(
      archivio,
      prenotazione,
      'Annullata dal cliente prima del pagamento',
      clienteId ?? 'ospite',
    )
    return { esito: 'annullata' } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
