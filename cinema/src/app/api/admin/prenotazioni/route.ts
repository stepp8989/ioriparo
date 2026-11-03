import { annota, leggi, modifica } from '@/lib/archivio'
import { annullaPrenotazione, confermaPagamento } from '@/lib/prenotazioni'
import { codicePulito, corpoJson, dataPulita, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'

/**
 * Prenotazioni dal pannello.
 *
 *   GET    elenco filtrabile per stato, cinema, data
 *   PATCH  conferma un incasso in cassa, annulla o registra un rimborso
 *
 * Le prenotazioni non si creano né si modificano da qui: nascono dal flusso
 * d'acquisto, che è l'unico posto in cui la disponibilità dei posti e il
 * calcolo del prezzo vengono verificati per davvero. Da qui si interviene sul
 * loro stato, ed è tutto ciò che serve a una biglietteria.
 *
 * Il rimborso del denaro non avviene qui: va disposto dal cruscotto del
 * fornitore di pagamento, che è l'unico posto dove può avvenire. Questa rotta
 * registra il fatto, libera i posti e restituisce punti e credito.
 */

export const dynamic = 'force-dynamic'

export async function GET(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const parametri = new URL(richiesta.url).searchParams
  const stato = testoPulito(parametri.get('stato'), 20)
  const cinemaId = testoPulito(parametri.get('cinema'), 60)
  const data = dataPulita(parametri.get('data'))
  const cerca = testoPulito(parametri.get('q'), 80).toLowerCase()

  const archivio = await leggi()

  const voci = archivio.prenotazioni.filter((prenotazione) => {
    if (stato && prenotazione.stato !== stato) return false
    if (cinemaId && prenotazione.cinemaId !== cinemaId) return false
    if (data && prenotazione.data !== data) return false

    if (cerca) {
      const campi = [
        prenotazione.codice,
        prenotazione.ospite?.nome ?? '',
        prenotazione.ospite?.email ?? '',
      ]
        .join(' ')
        .toLowerCase()
      if (!campi.includes(cerca)) return false
    }

    return true
  })

  return Response.json(
    // Un tetto esplicito: senza, il giorno in cui l'archivio contiene
    // centomila prenotazioni questa rotta le manderebbe tutte al browser.
    { voci: voci.slice(0, 500), totale: voci.length },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const codice = codicePulito(corpo.codice, 12)
  const azione = testoPulito(corpo.azione, 20)
  const motivo = testoPulito(corpo.motivo, 200)

  const esito = await modifica((archivio) => {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === codice)
    if (!prenotazione) return { errore: 'Prenotazione non trovata.', stato: 404 } as const

    switch (azione) {
      case 'incassa':
        // Pagamento ricevuto allo sportello: da qui in poi i biglietti sono
        // validi e i punti vengono accreditati come per un acquisto online.
        if (prenotazione.stato !== 'in-attesa') {
          return { errore: 'La prenotazione non è in attesa di pagamento.', stato: 409 } as const
        }
        confermaPagamento(archivio, prenotazione, 'cassa', motivo || 'Incassato in cassa')
        annota(archivio, 'gestione', 'incasso-cassa', prenotazione.codice, motivo)
        break

      case 'annulla':
        if (!motivo) return { errore: 'Indica il motivo dell’annullamento.', stato: 400 } as const
        annullaPrenotazione(archivio, prenotazione, motivo, 'gestione', false)
        break

      case 'rimborsa':
        if (!motivo) return { errore: 'Indica il motivo del rimborso.', stato: 400 } as const
        annullaPrenotazione(archivio, prenotazione, motivo, 'gestione', true)
        break

      default:
        return { errore: 'Azione non riconosciuta.', stato: 400 } as const
    }

    return { prenotazione } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
