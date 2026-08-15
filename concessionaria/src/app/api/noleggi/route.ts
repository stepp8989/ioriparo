import { revalidatePath } from 'next/cache'
import { AZIENDA } from '@/dati/azienda'
import { leggi, modifica } from '@/lib/archivio'
import { clienteCollegatoId } from '@/lib/clienti'
import { acconto, calcolaTotale, formulaApplicata, periodoDisponibile } from '@/lib/noleggio'
import { metodiDisponibili, preparaPagamento } from '@/lib/pagamenti'
import { avvisaStaffNoleggio, confermaNoleggio } from '@/lib/posta'
import {
  chiamante,
  corpoJson,
  dataPulita,
  fraLeVoci,
  testoPulito,
  troppeRichieste,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { smsNoleggioConfermato } from '@/lib/sms'
import { BASE } from '@/lib/seo'
import { METODI_PAGAMENTO, STATI_NOLEGGIO, type Noleggio } from '@/lib/tipi'
import {
  emailValida,
  fraGiorni,
  giorniFra,
  nuovoCodice,
  nuovoId,
  oggiIso,
  telefonoValido,
  titoloVeicolo,
} from '@/lib/utili'

/**
 * Noleggi.
 *
 *   POST   pubblica  — registra il noleggio, verifica la disponibilità e
 *                      prepara l'eventuale pagamento online
 *   GET    riservata — elenco per il pannello
 *   PATCH  riservata — cambia stato del noleggio o del pagamento
 *   DELETE riservata — elimina definitivamente
 */

/** Durata massima prenotabile online: oltre si passa dal contratto scritto. */
const GIORNI_MASSIMI = 180

export async function POST(richiestaHttp: Request) {
  if (troppeRichieste(`noleggio:${chiamante(richiestaHttp)}`, 5, 15)) {
    return Response.json(
      { errore: 'Troppe richieste ravvicinate. Riprovate fra qualche minuto o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiestaHttp)

  const veicoloId = testoPulito(corpo.veicoloId, 60)
  const dal = dataPulita(corpo.dal)
  const al = dataPulita(corpo.al)
  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 30)
  const note = testoPulito(corpo.note, 800)
  const consegnaDomicilio = corpo.consegnaDomicilio === true
  const indirizzoConsegna = consegnaDomicilio ? testoPulito(corpo.indirizzoConsegna, 200) : ''

  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (cognome.length < 2) errori.push('cognome')
  if (!emailValida(email)) errori.push('email')
  if (!telefonoValido(telefono)) errori.push('telefono')
  if (!dal || dal < oggiIso()) errori.push('data di ritiro')
  if (!al || al < dal) errori.push('data di riconsegna')
  if (consegnaDomicilio && indirizzoConsegna.length < 6) errori.push('indirizzo di consegna')

  if (errori.length > 0) {
    return Response.json({ errore: `Controllate questi campi: ${errori.join(', ')}.` }, { status: 400 })
  }

  const giorni = giorniFra(dal, al)
  if (giorni < 1 || giorni > GIORNI_MASSIMI) {
    return Response.json(
      {
        errore: `Online si prenota da 1 a ${GIORNI_MASSIMI} giorni. Per periodi più lunghi chiamateci: facciamo un contratto su misura.`,
      },
      { status: 400 },
    )
  }

  // Non si prenota troppo in anticipo: la flotta cambia e il listino pure.
  if (dal > fraGiorni(365)) {
    return Response.json(
      { errore: 'Si prenota fino a un anno di anticipo. Per date più lontane scriveteci.' },
      { status: 400 },
    )
  }

  const { veicoli, noleggi } = await leggi()
  const veicolo = veicoli.find((voce) => voce.id === veicoloId)

  if (!veicolo || !veicolo.visibile || !veicolo.noleggio) {
    return Response.json({ errore: 'Veicolo non disponibile a noleggio.' }, { status: 400 })
  }

  // La disponibilità si verifica adesso, non quando è stato disegnato il
  // calendario: fra i due momenti può essere arrivata un'altra prenotazione.
  if (!periodoDisponibile(noleggi, veicolo.id, dal, al)) {
    return Response.json(
      { errore: 'Il veicolo è già impegnato in quelle date. Provate un altro periodo.' },
      { status: 409 },
    )
  }

  if (consegnaDomicilio && !veicolo.noleggio.consegnaDomicilio) {
    return Response.json(
      { errore: 'Questo veicolo non è disponibile con consegna a domicilio.' },
      { status: 400 },
    )
  }

  // Il totale si ricalcola sempre lato server: quello arrivato dal browser è
  // solo un'anteprima e non viene mai considerato.
  const totale = calcolaTotale(veicolo.noleggio, giorni)

  const metodoRichiesto = fraLeVoci(corpo.pagamento, METODI_PAGAMENTO) ? corpo.pagamento : 'in-sede'
  const metodo = metodiDisponibili().includes(metodoRichiesto) ? metodoRichiesto : 'in-sede'

  const noleggio: Noleggio = {
    id: nuovoId('nol'),
    codice: nuovoCodice(),
    veicoloId: veicolo.id,
    veicoloTitolo: titoloVeicolo(veicolo),
    nome,
    cognome,
    email,
    telefono,
    dal,
    al,
    giorni,
    formula: formulaApplicata(giorni),
    consegnaDomicilio,
    indirizzoConsegna,
    totale,
    cauzione: veicolo.noleggio.cauzione,
    pagamento: {
      metodo,
      stato: 'in-attesa',
      riferimento: null,
      importo: metodo === 'in-sede' ? 0 : acconto(totale),
    },
    stato: 'in-attesa',
    note,
    clienteId: await clienteCollegatoId(),
    creatoIl: new Date().toISOString(),
  }

  // Pagamento online: si prepara la sessione presso il servizio scelto. Se il
  // servizio non risponde, il noleggio resta valido con pagamento al ritiro —
  // meglio una prenotazione da incassare in sede che una persa.
  let urlPagamento: string | null = null

  if (metodo !== 'in-sede') {
    const esito = await preparaPagamento({
      metodo,
      importo: noleggio.pagamento.importo,
      descrizione: `Acconto noleggio ${noleggio.veicoloTitolo} (${dal} → ${al})`,
      riferimento: noleggio.codice,
      email,
      urlSuccesso: new URL(`/noleggio/esito?codice=${noleggio.codice}&stato=ok`, BASE).toString(),
      urlAnnullo: new URL(`/noleggio/esito?codice=${noleggio.codice}&stato=annullato`, BASE).toString(),
    })

    if (esito) {
      urlPagamento = esito.url
      noleggio.pagamento.riferimento = esito.riferimento
    } else {
      noleggio.pagamento.metodo = 'in-sede'
      noleggio.pagamento.importo = 0
    }
  }

  await modifica((archivio) => {
    archivio.noleggi.unshift(noleggio)
  })

  void confermaNoleggio(noleggio)
  void avvisaStaffNoleggio(noleggio)
  void smsNoleggioConfermato(telefono, noleggio.codice, dal)

  return Response.json(
    { codice: noleggio.codice, totale, urlPagamento },
    { status: 201 },
  )
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { noleggi } = await leggi()
  return Response.json({ noleggi, telefono: AZIENDA.telefono })
}

export async function PATCH(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiestaHttp)
  const id = testoPulito(corpo.id, 60)

  const stato = fraLeVoci(corpo.stato, STATI_NOLEGGIO) ? corpo.stato : null
  const statoPagamento = fraLeVoci(corpo.statoPagamento, ['in-attesa', 'pagato', 'rimborsato'])
    ? corpo.statoPagamento
    : null

  if (!stato && !statoPagamento) {
    return Response.json({ errore: 'Nessuna modifica indicata.' }, { status: 400 })
  }

  const trovato = await modifica((archivio) => {
    const noleggio = archivio.noleggi.find((voce) => voce.id === id)
    if (!noleggio) return false
    if (stato) noleggio.stato = stato
    if (statoPagamento) noleggio.pagamento.stato = statoPagamento
    return true
  })

  if (!trovato) return Response.json({ errore: 'Noleggio non trovato.' }, { status: 404 })

  revalidatePath('/admin/noleggi')
  return Response.json({ esito: 'aggiornato' })
}

export async function DELETE(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiestaHttp.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.noleggi.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.noleggi.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Noleggio non trovato.' }, { status: 404 })

  revalidatePath('/admin/noleggi')
  return Response.json({ esito: 'eliminato' })
}
