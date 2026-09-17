import { annota, leggi, modifica } from '@/lib/archivio'
import { senzaPassword } from '@/lib/clienti'
import { progressoLivello } from '@/lib/loyalty'
import { corpoJson, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'

/**
 * Anagrafica clienti.
 *
 *   GET     elenco con punti, livello e spesa complessiva
 *   PATCH   sospende o riattiva un account
 *   DELETE  cancella un account su richiesta dell'interessato
 *
 * Le password non escono mai da qui: `senzaPassword` toglie l'impronta prima
 * che i dati lascino il server. Il pannello non ha nessuna funzione per
 * cambiare la password di un cliente, e non deve averla — chi la dimentica la
 * reimposta dal proprio indirizzo email, non chiedendola allo staff.
 */

export const dynamic = 'force-dynamic'

export async function GET(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const cerca = testoPulito(new URL(richiesta.url).searchParams.get('q'), 80).toLowerCase()
  const archivio = await leggi()

  const voci = archivio.clienti
    .filter((cliente) => {
      if (!cerca) return true
      return `${cliente.nome} ${cliente.cognome} ${cliente.email}`.toLowerCase().includes(cerca)
    })
    .map((cliente) => {
      const prenotazioni = archivio.prenotazioni.filter(
        (voce) => voce.clienteId === cliente.id && voce.stato !== 'annullata',
      )

      return {
        ...senzaPassword(cliente),
        progresso: progressoLivello(cliente, archivio.livelliLoyalty),
        ordini: prenotazioni.length,
        speso: Math.round(prenotazioni.reduce((somma, voce) => somma + voce.totale, 0) * 100) / 100,
        abbonamento:
          archivio.sottoscrizioni.find(
            (voce) => voce.clienteId === cliente.id && voce.stato === 'attiva',
          ) ?? null,
      }
    })

  return Response.json({ voci }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const esito = await modifica((archivio) => {
    const cliente = archivio.clienti.find((voce) => voce.id === id)
    if (!cliente) return { errore: 'Cliente non trovato.', stato: 404 } as const

    if (typeof corpo.attivo === 'boolean') {
      cliente.attivo = corpo.attivo
      annota(
        archivio,
        'gestione',
        corpo.attivo ? 'cliente-riattivato' : 'cliente-sospeso',
        cliente.email,
        testoPulito(corpo.motivo, 200),
      )
    }

    return { cliente: senzaPassword(cliente) } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const esito = await modifica((archivio) => {
    const indice = archivio.clienti.findIndex((voce) => voce.id === id)
    if (indice < 0) return { errore: 'Cliente non trovato.', stato: 404 } as const

    const cliente = archivio.clienti[indice]

    /*
     * Le prenotazioni non si cancellano insieme all'account: sono documenti
     * fiscali e vanno conservate per dieci anni. Si spezza il legame con la
     * persona — via l'identificativo, via i recapiti — e resta il documento
     * con l'importo. È il modo di conciliare il diritto alla cancellazione con
     * l'obbligo di conservazione, ed è quello dichiarato nell'informativa.
     */
    for (const prenotazione of archivio.prenotazioni) {
      if (prenotazione.clienteId !== id) continue
      prenotazione.clienteId = null
      prenotazione.ospite = null
    }

    archivio.movimentiPunti = archivio.movimentiPunti.filter((voce) => voce.clienteId !== id)
    archivio.coupon = archivio.coupon.filter((voce) => voce.clienteId !== id)
    archivio.notifiche = archivio.notifiche.filter((voce) => voce.clienteId !== id)
    archivio.sottoscrizioni = archivio.sottoscrizioni.filter((voce) => voce.clienteId !== id)
    archivio.clienti.splice(indice, 1)

    annota(archivio, 'gestione', 'cliente-cancellato', cliente.email, 'Richiesta dell’interessato')

    return { esito: 'cancellato' } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
