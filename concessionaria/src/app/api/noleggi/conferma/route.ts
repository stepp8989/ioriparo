import { modifica } from '@/lib/archivio'
import { incassaPayPal, stripePagata } from '@/lib/pagamenti'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'

/**
 * Conferma del pagamento al ritorno dal servizio.
 *
 * Il cliente torna sul sito con il codice del noleggio nell'indirizzo. Qui si
 * verifica presso Stripe o PayPal che il pagamento sia davvero avvenuto — mai
 * fidandosi di quello che dice l'indirizzo, che chiunque può scrivere a mano —
 * e solo allora si segna il noleggio come pagato.
 *
 * L'operazione è idempotente: ricaricare la pagina di ritorno non produce un
 * secondo addebito né un secondo cambio di stato.
 */
export async function POST(richiesta: Request) {
  if (troppeRichieste(`conferma:${chiamante(richiesta)}`, 20, 10)) {
    return Response.json({ errore: 'Troppe richieste ravvicinate.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)
  const codice = testoPulito(corpo.codice, 12).toUpperCase()
  // PayPal rimanda l'identificativo dell'ordine nel parametro `token`.
  const tokenPayPal = testoPulito(corpo.token, 80)

  if (!codice) {
    return Response.json({ errore: 'Codice mancante.' }, { status: 400 })
  }

  /**
   * Si legge il noleggio dentro la stessa coda della modifica: fra la lettura
   * e la scrittura non deve inserirsi nessun'altra operazione sull'archivio.
   * La verifica presso il servizio di pagamento avviene però prima, perché è
   * una chiamata di rete e tenerla dentro la coda bloccherebbe le altre
   * scritture per tutta la sua durata.
   */
  const esito = await modifica((archivio) => {
    const noleggio = archivio.noleggi.find((voce) => voce.codice === codice)
    if (!noleggio) return { trovato: false as const }
    return {
      trovato: true as const,
      metodo: noleggio.pagamento.metodo,
      riferimento: noleggio.pagamento.riferimento,
      giaPagato: noleggio.pagamento.stato === 'pagato',
    }
  })

  if (!esito.trovato) {
    return Response.json({ errore: 'Noleggio non trovato.' }, { status: 404 })
  }

  if (esito.giaPagato) {
    return Response.json({ stato: 'pagato' })
  }

  let pagato = false

  if (esito.metodo === 'stripe' && esito.riferimento) {
    pagato = await stripePagata(esito.riferimento)
  } else if (esito.metodo === 'paypal') {
    // Se il token non arriva nell'indirizzo si usa quello salvato alla
    // creazione dell'ordine: sono lo stesso identificativo.
    pagato = await incassaPayPal(tokenPayPal || esito.riferimento || '')
  }

  if (!pagato) {
    return Response.json({ stato: 'in-attesa' })
  }

  await modifica((archivio) => {
    const noleggio = archivio.noleggi.find((voce) => voce.codice === codice)
    if (!noleggio) return
    noleggio.pagamento.stato = 'pagato'
    // Un acconto incassato è anche la conferma della prenotazione.
    if (noleggio.stato === 'in-attesa') noleggio.stato = 'confermato'
    if (tokenPayPal) noleggio.pagamento.riferimento = tokenPayPal
  })

  return Response.json({ stato: 'pagato' })
}
