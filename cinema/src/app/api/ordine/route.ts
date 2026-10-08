import { leggi } from '@/lib/archivio'
import { clienteCollegatoId } from '@/lib/clienti'
import { valutaOrdine } from '@/lib/prenotazioni'
import { corpoJson } from '@/lib/protezione'
import { leggiOrdine } from '@/lib/richieste'

/**
 * Preventivo di un ordine.
 *
 *   POST /api/ordine
 *
 * Restituisce il conto completo — righe, sconti, commissioni, totale, punti
 * guadagnati — senza creare nulla e senza bloccare posti. È ciò che il
 * riepilogo del checkout interroga a ogni modifica della selezione.
 *
 * È la stessa funzione che poi calcola l'importo da incassare: il preventivo e
 * l'addebito non possono divergere perché sono lo stesso codice, con gli
 * stessi dati.
 *
 * Gli errori di validità non sono nascosti dietro un 400 generico: dire «il
 * posto F8 è appena stato occupato» permette all'interfaccia di aggiornare la
 * mappa e far scegliere di nuovo, invece di lasciare l'utente a indovinare.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  const corpo = await corpoJson(richiesta)
  const clienteId = await clienteCollegatoId()

  const archivio = await leggi()
  const esito = valutaOrdine(archivio, leggiOrdine(corpo, clienteId))

  if (!esito.ok) {
    return Response.json({ errore: esito.errore }, { status: esito.stato })
  }

  return Response.json(
    {
      conto: esito.conto,
      promozione: esito.promozione
        ? { titolo: esito.promozione.titolo, codice: esito.promozione.codice }
        : null,
      coupon: esito.coupon ? { codice: esito.coupon.codice } : null,
      giftCard: esito.giftCard
        ? { codice: esito.giftCard.codice, saldo: esito.giftCard.saldo }
        : null,
      piano: esito.piano ? { nome: esito.piano.nome, scontoFood: esito.piano.scontoFood } : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
