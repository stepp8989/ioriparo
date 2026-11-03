import { annota, leggi, modifica } from '@/lib/archivio'
import { corpoJson, numeroDecimale, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'

/**
 * Gift card dal pannello.
 *
 *   GET    elenco con saldi e movimenti
 *   PATCH  annulla, riattiva o rettifica il saldo
 *
 * Non c'è la creazione: le gift card nascono dall'acquisto, e crearne dal
 * pannello significherebbe emettere credito senza incasso. Se serve — un
 * risarcimento, un omaggio — lo strumento giusto è un coupon, che nasce
 * proprio per quello ed è tracciato come tale.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const archivio = await leggi()
  return Response.json({ voci: archivio.giftCard }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 80)
  const azione = testoPulito(corpo.azione, 20)
  const motivo = testoPulito(corpo.motivo, 200)

  const esito = await modifica((archivio) => {
    const giftCard = archivio.giftCard.find((voce) => voce.id === id)
    if (!giftCard) return { errore: 'Gift card non trovata.', stato: 404 } as const

    switch (azione) {
      case 'annulla':
        if (!motivo) return { errore: 'Indica il motivo dell’annullamento.', stato: 400 } as const
        giftCard.stato = 'annullata'
        annota(archivio, 'gestione', 'gift-card-annullata', giftCard.codice, motivo)
        break

      case 'riattiva':
        giftCard.stato = giftCard.saldo > 0 ? 'attiva' : 'esaurita'
        annota(archivio, 'gestione', 'gift-card-riattivata', giftCard.codice, motivo)
        break

      case 'saldo': {
        const saldo = numeroDecimale(corpo.saldo, 0, 10_000, giftCard.saldo)
        if (!motivo) return { errore: 'Indica il motivo della rettifica.', stato: 400 } as const
        annota(
          archivio,
          'gestione',
          'gift-card-rettificata',
          giftCard.codice,
          `${giftCard.saldo.toFixed(2)} € → ${saldo.toFixed(2)} €. ${motivo}`,
        )
        giftCard.saldo = saldo
        if (giftCard.stato !== 'annullata') {
          giftCard.stato = saldo > 0 ? 'attiva' : 'esaurita'
        }
        break
      }

      default:
        return { errore: 'Azione non riconosciuta.', stato: 400 } as const
    }

    return { giftCard } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
