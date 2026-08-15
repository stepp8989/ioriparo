import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { impronta, LUNGHEZZA_MINIMA_PASSWORD, senzaPassword } from '@/lib/clienti'
import {
  corpoJson,
  dataPulita,
  fraLeVoci,
  numeroDecimale,
  testoPulito,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { TIPI_DOCUMENTO, type Acquisto, type Documento } from '@/lib/tipi'
import { nuovoId, oggiIso } from '@/lib/utili'

/**
 * Gestione dei clienti dal pannello.
 *
 * La password non esce mai da queste rotte: l'elenco viene ripulito prima di
 * essere restituito, e l'unica operazione possibile su di essa è la
 * reimpostazione, quando un cliente la dimentica e telefona.
 *
 *   GET    elenco dei clienti, senza password
 *   PATCH  aggiorna anagrafica, aggiunge documenti o acquisti, reimposta la password
 *   DELETE elimina un cliente
 */

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { clienti } = await leggi()
  return Response.json({ clienti: clienti.map(senzaPassword) })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)
  const azione = testoPulito(corpo.azione, 30)

  // La nuova password si calcola prima di entrare nella coda delle modifiche:
  // scrypt è volutamente lento e bloccherebbe le altre scritture.
  const nuovaPassword =
    azione === 'password' && typeof corpo.password === 'string'
      ? corpo.password
      : null

  if (azione === 'password' && (!nuovaPassword || nuovaPassword.length < LUNGHEZZA_MINIMA_PASSWORD)) {
    return Response.json(
      { errore: `La password deve avere almeno ${LUNGHEZZA_MINIMA_PASSWORD} caratteri.` },
      { status: 400 },
    )
  }

  const improntaNuova = nuovaPassword ? await impronta(nuovaPassword) : null

  const aggiornato = await modifica((archivio) => {
    const cliente = archivio.clienti.find((voce) => voce.id === id)
    if (!cliente) return null

    switch (azione) {
      case 'password': {
        if (improntaNuova) cliente.password = improntaNuova
        break
      }

      case 'documento': {
        const documento: Documento = {
          id: nuovoId('doc'),
          titolo: testoPulito(corpo.titolo, 160) || 'Documento',
          tipo: fraLeVoci(corpo.tipo, TIPI_DOCUMENTO) ? corpo.tipo : 'documento',
          data: dataPulita(corpo.data) || oggiIso(),
          importo:
            corpo.importo === null || corpo.importo === ''
              ? null
              : numeroDecimale(corpo.importo, 0, 1_000_000, 0),
          file: testoPulito(corpo.file, 300) || null,
        }
        cliente.documenti.unshift(documento)
        break
      }

      case 'rimuovi-documento': {
        const documentoId = testoPulito(corpo.documentoId, 60)
        cliente.documenti = cliente.documenti.filter((voce) => voce.id !== documentoId)
        break
      }

      case 'acquisto': {
        const acquisto: Acquisto = {
          id: nuovoId('acq'),
          descrizione: testoPulito(corpo.descrizione, 200) || 'Acquisto',
          veicoloId: testoPulito(corpo.veicoloId, 60) || null,
          data: dataPulita(corpo.data) || oggiIso(),
          importo: numeroDecimale(corpo.importo, 0, 2_000_000, 0),
          stato: corpo.stato === 'consegnato' ? 'consegnato' : 'in-lavorazione',
        }
        cliente.acquisti.unshift(acquisto)
        break
      }

      case 'rimuovi-acquisto': {
        const acquistoId = testoPulito(corpo.acquistoId, 60)
        cliente.acquisti = cliente.acquisti.filter((voce) => voce.id !== acquistoId)
        break
      }

      default: {
        // Aggiornamento dell'anagrafica: si toccano solo i campi presenti nel
        // corpo, così un modulo parziale non svuota gli altri.
        if (typeof corpo.nome === 'string') cliente.nome = testoPulito(corpo.nome, 60)
        if (typeof corpo.cognome === 'string') cliente.cognome = testoPulito(corpo.cognome, 60)
        if (typeof corpo.telefono === 'string') cliente.telefono = testoPulito(corpo.telefono, 30)
        if (typeof corpo.codiceFiscale === 'string') {
          cliente.codiceFiscale = testoPulito(corpo.codiceFiscale, 16).toUpperCase()
        }
        if (typeof corpo.indirizzo === 'string') cliente.indirizzo = testoPulito(corpo.indirizzo, 160)
        if (typeof corpo.citta === 'string') cliente.citta = testoPulito(corpo.citta, 80)
        if (typeof corpo.cap === 'string') cliente.cap = testoPulito(corpo.cap, 10)
      }
    }

    return cliente
  })

  if (!aggiornato) return Response.json({ errore: 'Cliente non trovato.' }, { status: 404 })

  revalidatePath('/admin/clienti')
  return Response.json({ cliente: senzaPassword(aggiornato) })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.clienti.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.clienti.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Cliente non trovato.' }, { status: 404 })

  revalidatePath('/admin/clienti')
  return Response.json({ esito: 'eliminato' })
}
