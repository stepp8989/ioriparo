import { leggi } from '@/lib/archivio'
import { richiediCliente, senzaPassword } from '@/lib/clienti'

/**
 * Contenuto dell'area riservata del cliente collegato.
 *
 * Restituisce l'anagrafica senza password e tutto ciò che lo riguarda:
 * noleggi, appuntamenti e richieste. Il collegamento avviene sull'identificativo
 * del cliente salvato al momento dell'operazione — e, per chi ha prenotato
 * prima di registrarsi, anche sull'indirizzo email, che è il modo in cui le
 * persone si aspettano di ritrovare le proprie pratiche.
 */
export async function GET() {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const { noleggi, appuntamenti, richieste } = await leggi()

  const suo = <T extends { clienteId: string | null; email: string }>(voci: T[]): T[] =>
    voci.filter((voce) => voce.clienteId === cliente.id || voce.email === cliente.email)

  return Response.json(
    {
      cliente: senzaPassword(cliente),
      noleggi: suo(noleggi),
      appuntamenti: suo(appuntamenti),
      richieste: suo(richieste),
    },
    // Contenuto personale: non deve finire in nessuna cache condivisa.
    { headers: { 'Cache-Control': 'private, no-store' } },
  )
}
