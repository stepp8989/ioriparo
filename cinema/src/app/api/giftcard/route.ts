import { annota, leggi, modifica } from '@/lib/archivio'
import { inviaGiftCard } from '@/lib/posta'
import {
  chiamante,
  codicePulito,
  corpoJson,
  dataPulita,
  numeroDecimale,
  testoPulito,
  troppeRichieste,
} from '@/lib/protezione'
import { BASE } from '@/lib/seo'
import type { GiftCard } from '@/lib/tipi'
import { emailValida, nuovoCodice, nuovoId, oggiIso } from '@/lib/utili'

/**
 * Gift card.
 *
 *   GET   verifica un codice e ne restituisce il saldo
 *   POST  crea una gift card
 *
 * Il codice lo genera il server e ha dodici caratteri dell'alfabeto senza
 * vocali: è un titolo al portatore, chi lo conosce può spenderlo, e deve
 * essere impraticabile da indovinare. Il controllo del saldo è limitato per
 * indirizzo proprio per questo — senza freno, provare codici a raffica sarebbe
 * un modo per trovarne uno valido.
 *
 * Il pagamento della gift card in questa versione non passa da un fornitore:
 * la carta nasce attiva. Prima della produzione va collegato allo stesso
 * flusso delle prenotazioni — creare la carta in stato `programmata`,
 * attivarla al riscontro di pagamento — altrimenti chiunque potrebbe
 * emettersi credito da solo.
 */

export const dynamic = 'force-dynamic'

const VALORE_MINIMO = 5
const VALORE_MASSIMO = 500

export async function GET(richiesta: Request) {
  if (troppeRichieste(`giftcard:${chiamante(richiesta)}`, 15, 10)) {
    return Response.json({ errore: 'Troppi tentativi. Riprova fra qualche minuto.' }, { status: 429 })
  }

  const codice = codicePulito(new URL(richiesta.url).searchParams.get('codice'), 16)
  if (!codice) return Response.json({ errore: 'Codice non indicato.' }, { status: 400 })

  const archivio = await leggi()
  const giftCard = archivio.giftCard.find((voce) => voce.codice === codice)

  if (!giftCard || giftCard.stato === 'annullata') {
    return Response.json({ errore: 'Gift card non riconosciuta.' }, { status: 404 })
  }
  if (giftCard.stato === 'programmata') {
    return Response.json({ errore: 'Gift card non ancora attiva.' }, { status: 409 })
  }

  // Si restituisce il saldo, non i dati di chi l'ha comprata o ricevuta.
  return Response.json({
    codice: giftCard.codice,
    saldo: giftCard.saldo,
    valoreIniziale: giftCard.valoreIniziale,
    stato: giftCard.stato,
  })
}

export async function POST(richiesta: Request) {
  if (troppeRichieste(`giftcard-nuova:${chiamante(richiesta)}`, 5, 30)) {
    return Response.json({ errore: 'Troppe richieste. Riprova più tardi.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)

  const valore = numeroDecimale(corpo.valore, VALORE_MINIMO, VALORE_MASSIMO, 0)
  if (valore < VALORE_MINIMO) {
    return Response.json(
      { errore: `L’importo deve essere compreso fra ${VALORE_MINIMO} € e ${VALORE_MASSIMO} €.` },
      { status: 400 },
    )
  }

  const mittenteGrezzo = (corpo.mittente ?? {}) as Record<string, unknown>
  const destinatarioGrezzo = (corpo.destinatario ?? {}) as Record<string, unknown>

  const mittente = {
    nome: testoPulito(mittenteGrezzo.nome, 80),
    email: testoPulito(mittenteGrezzo.email, 160).toLowerCase(),
  }
  const destinatario = {
    nome: testoPulito(destinatarioGrezzo.nome, 80),
    email: testoPulito(destinatarioGrezzo.email, 160).toLowerCase(),
  }

  if (!mittente.nome || !emailValida(mittente.email)) {
    return Response.json({ errore: 'Dati del mittente non validi.' }, { status: 400 })
  }
  if (!destinatario.nome || !emailValida(destinatario.email)) {
    return Response.json({ errore: 'Dati del destinatario non validi.' }, { status: 400 })
  }

  const dataInvio = dataPulita(corpo.dataInvio) || oggiIso()
  if (dataInvio < oggiIso()) {
    return Response.json({ errore: 'La data di invio non può essere nel passato.' }, { status: 400 })
  }

  const esito = await modifica((archivio) => {
    if (!archivio.impostazioni.moduli.giftCard) {
      return { errore: 'Le gift card non sono attive.', stato: 503 } as const
    }

    // Dodici caratteri: il codice non viene dettato a voce come quello di
    // prenotazione, quindi può permettersi di essere lungo.
    let codice = nuovoCodice(12)
    for (let tentativo = 0; tentativo < 20; tentativo += 1) {
      if (!archivio.giftCard.some((voce) => voce.codice === codice)) break
      codice = nuovoCodice(12)
    }

    const giftCard: GiftCard = {
      id: nuovoId('gif'),
      codice,
      valoreIniziale: valore,
      saldo: valore,
      mittente,
      destinatario,
      messaggio: testoPulito(corpo.messaggio, 400),
      dataInvio,
      stato: dataInvio > oggiIso() ? 'programmata' : 'attiva',
      movimenti: [],
      creataIl: new Date().toISOString(),
    }

    archivio.giftCard.unshift(giftCard)
    annota(archivio, mittente.email, 'gift-card-emessa', codice, `${valore.toFixed(2)} €`)

    return { giftCard, impostazioni: archivio.impostazioni } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

  if (esito.giftCard.stato === 'attiva') {
    void inviaGiftCard(
      esito.giftCard,
      esito.impostazioni,
      BASE.toString().replace(/\/$/, ''),
    )
  }

  return Response.json(
    { codice: esito.giftCard.codice, valore: esito.giftCard.valoreIniziale, stato: esito.giftCard.stato },
    { status: 201 },
  )
}
