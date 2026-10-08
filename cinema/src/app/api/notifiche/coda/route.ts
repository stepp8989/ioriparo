import { modifica } from '@/lib/archivio'
import { inviaGiftCard } from '@/lib/posta'
import { confrontoSicuro } from '@/lib/firma'
import { smaltisciCoda } from '@/lib/notifiche'
import { BASE } from '@/lib/seo'
import { oggiIso } from '@/lib/utili'

/**
 * Smaltimento della coda delle notifiche.
 *
 *   POST /api/notifiche/coda
 *   Authorization: Bearer <NOTIFICHE_SEGRETO>
 *
 * Va chiamata periodicamente da uno schedulatore — Vercel Cron, un servizio di
 * pianificazione, un `curl` dal cron di sistema. Ogni giro spedisce i
 * promemoria dovuti e le gift card programmate per oggi.
 *
 * Senza `NOTIFICHE_SEGRETO` la rotta rifiuta tutto: una rotta che spedisce
 * email e che chiunque può chiamare è un generatore di posta indesiderata a
 * spese di chi la ospita.
 *
 * Il `GET` esiste perché alcuni schedulatori sanno fare solo quello: si
 * comporta esattamente come il `POST`, stesso segreto e stesse conseguenze.
 */

export const dynamic = 'force-dynamic'

const SEGRETO = process.env.NOTIFICHE_SEGRETO ?? ''

function autorizzata(richiesta: Request): boolean {
  if (!SEGRETO) return false

  const intestazione = richiesta.headers.get('authorization') ?? ''
  const ricevuto = intestazione.replace(/^Bearer\s+/i, '').trim()
  if (ricevuto && confrontoSicuro(SEGRETO, ricevuto)) return true

  // Alcuni schedulatori non permettono di aggiungere intestazioni: si accetta
  // anche il segreto nell'indirizzo, che è meno elegante ma altrettanto
  // efficace su una rotta che non compare in nessun collegamento.
  const dallIndirizzo = new URL(richiesta.url).searchParams.get('segreto') ?? ''
  return Boolean(dallIndirizzo) && confrontoSicuro(SEGRETO, dallIndirizzo)
}

async function smaltisci(richiesta: Request) {
  if (!autorizzata(richiesta)) {
    return Response.json({ errore: 'Non autorizzato.' }, { status: 401 })
  }

  const base = BASE.toString().replace(/\/$/, '')

  const esito = await modifica(async (archivio) => {
    /* Gift card programmate per oggi: si attivano e partono. */
    const oggi = oggiIso()
    const daInviare = archivio.giftCard.filter(
      (voce) => voce.stato === 'programmata' && voce.dataInvio <= oggi,
    )

    for (const giftCard of daInviare) {
      giftCard.stato = 'attiva'
      // L'invio non blocca la coda delle notifiche: se fallisce, la carta
      // resta attiva e il codice è comunque recuperabile dal pannello.
      void inviaGiftCard(giftCard, archivio.impostazioni, base)
    }

    const notifiche = await smaltisciCoda(archivio, base)

    return { ...notifiche, giftCardAttivate: daInviare.length }
  })

  return Response.json(esito)
}

export const POST = smaltisci
export const GET = smaltisci
