import { annota, modifica } from '@/lib/archivio'
import { richiediCliente } from '@/lib/clienti'
import { corpoJson, testoPulito } from '@/lib/protezione'
import type { Sottoscrizione } from '@/lib/tipi'
import { nuovoId, oggiIso, sommaGiorni } from '@/lib/utili'

/**
 * Sottoscrizione e disdetta di un abbonamento.
 *
 *   POST    attiva un piano per il cliente collegato
 *   DELETE  disdice l'abbonamento in corso
 *
 * La disdetta non interrompe subito il servizio: l'abbonamento resta valido
 * fino alla scadenza del periodo già pagato, si ferma solo il rinnovo
 * automatico. È quello che dicono i termini di vendita, e disattivare all'istante
 * qualcosa che il cliente ha pagato per intero sarebbe scorretto oltre che
 * sbagliato.
 *
 * In questa versione l'addebito non passa da un fornitore di pagamento: il
 * piano si attiva subito. Prima della produzione va collegato allo stesso
 * flusso delle prenotazioni — sottoscrizione `sospesa` finché non arriva il
 * riscontro di pagamento, poi `attiva` — e va aggiunto il rinnovo ricorrente,
 * che con Stripe significa usare gli abbonamenti invece dei pagamenti singoli.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const pianoId = testoPulito(corpo.pianoId, 60)

  const esito = await modifica((archivio) => {
    if (!archivio.impostazioni.moduli.abbonamenti) {
      return { errore: 'Gli abbonamenti non sono attivi.', stato: 503 } as const
    }

    const piano = archivio.piani.find((voce) => voce.id === pianoId && voce.attivo)
    if (!piano) return { errore: 'Piano non disponibile.', stato: 404 } as const

    const giaAttivo = archivio.sottoscrizioni.find(
      (voce) => voce.clienteId === cliente.id && voce.stato === 'attiva',
    )
    if (giaAttivo) {
      return {
        errore: 'Hai già un abbonamento attivo. Disdici quello in corso prima di sottoscriverne un altro.',
        stato: 409,
      } as const
    }

    const dal = oggiIso()
    const sottoscrizione: Sottoscrizione = {
      id: nuovoId('sot'),
      clienteId: cliente.id,
      pianoId: piano.id,
      stato: 'attiva',
      dal,
      al: sommaGiorni(dal, piano.periodo === 'mensile' ? 30 : 365),
      ingressiUsati: 0,
      rinnovoAutomatico: true,
      creataIl: new Date().toISOString(),
    }

    archivio.sottoscrizioni.unshift(sottoscrizione)
    annota(archivio, cliente.email, 'abbonamento-sottoscritto', piano.nome)

    return { sottoscrizione, piano } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito, { status: 201 })
}

export async function DELETE() {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const esito = await modifica((archivio) => {
    const sottoscrizione = archivio.sottoscrizioni.find(
      (voce) => voce.clienteId === cliente.id && voce.stato === 'attiva',
    )
    if (!sottoscrizione) return { errore: 'Nessun abbonamento attivo.', stato: 404 } as const

    sottoscrizione.rinnovoAutomatico = false
    annota(archivio, cliente.email, 'abbonamento-disdetto', sottoscrizione.pianoId)

    return { sottoscrizione } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json({
    ...esito,
    messaggio: `L’abbonamento resta valido fino al ${esito.sottoscrizione.al}. Il rinnovo automatico è disattivato.`,
  })
}
