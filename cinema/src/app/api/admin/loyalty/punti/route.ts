import { modifica } from '@/lib/archivio'
import { rettificaPunti } from '@/lib/loyalty'
import { corpoJson, numeroIntero, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'

/**
 * Rettifica manuale dei punti di un cliente.
 *
 *   POST { clienteId, punti, motivo }
 *
 * Serve per i casi che il sistema non prevede: un ingresso venduto in cassa da
 * accreditare, un errore da correggere, un gesto commerciale dopo un disservizio.
 *
 * Il motivo è obbligatorio. Un movimento punti senza spiegazione è
 * indistinguibile da un abuso, e il registro esiste proprio perché ogni
 * variazione abbia un perché scritto accanto.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)

  const clienteId = testoPulito(corpo.clienteId, 60)
  const punti = numeroIntero(corpo.punti, -1_000_000, 1_000_000, 0)
  const motivo = testoPulito(corpo.motivo, 200)

  if (!clienteId) return Response.json({ errore: 'Cliente non indicato.' }, { status: 400 })
  if (punti === 0) return Response.json({ errore: 'Indica un numero di punti.' }, { status: 400 })
  if (motivo.length < 3) {
    return Response.json({ errore: 'Indica il motivo della rettifica.' }, { status: 400 })
  }

  const esito = await modifica((archivio) => {
    const riuscito = rettificaPunti(archivio, clienteId, punti, motivo)
    if (!riuscito) return { errore: 'Cliente non trovato.', stato: 404 } as const

    const cliente = archivio.clienti.find((voce) => voce.id === clienteId)
    return { punti: cliente?.punti ?? 0, livelloId: cliente?.livelloId ?? '' } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
