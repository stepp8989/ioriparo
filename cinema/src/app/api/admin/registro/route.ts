import { leggi } from '@/lib/archivio'
import { testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'

/**
 * Registro delle operazioni.
 *
 *   GET /api/admin/registro?q=…
 *
 * È di sola lettura, e non per pigrizia: un registro modificabile dal pannello
 * non è un registro. Le voci si accumulano e vengono troncate automaticamente
 * dall'archivio quando superano le duemila, che coprono mesi di attività
 * normale.
 */

export const dynamic = 'force-dynamic'

export async function GET(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const cerca = testoPulito(new URL(richiesta.url).searchParams.get('q'), 80).toLowerCase()
  const archivio = await leggi()

  const voci = archivio.registro.filter((riga) => {
    if (!cerca) return true
    return `${riga.attore} ${riga.azione} ${riga.oggetto} ${riga.dettaglio}`
      .toLowerCase()
      .includes(cerca)
  })

  return Response.json({ voci: voci.slice(0, 500) }, { headers: { 'Cache-Control': 'no-store' } })
}
