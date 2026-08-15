import { leggi } from '@/lib/archivio'
import { giorniOccupati } from '@/lib/noleggio'
import { testoPulito } from '@/lib/protezione'

/**
 * Giorni già impegnati per un veicolo.
 *
 * È una rotta pubblica: dice soltanto quali date sono occupate, senza rivelare
 * chi ha prenotato né per quanto. Serve al calendario della pagina Noleggio.
 */
export async function GET(richiesta: Request) {
  const veicoloId = testoPulito(new URL(richiesta.url).searchParams.get('veicolo'), 60)

  if (!veicoloId) {
    return Response.json({ errore: 'Veicolo non indicato.' }, { status: 400 })
  }

  const { veicoli, noleggi } = await leggi()
  const veicolo = veicoli.find((voce) => voce.id === veicoloId)

  if (!veicolo || !veicolo.visibile || !veicolo.noleggio) {
    return Response.json({ errore: 'Veicolo non disponibile a noleggio.' }, { status: 404 })
  }

  return Response.json(
    { occupati: giorniOccupati(noleggi, veicoloId) },
    {
      // Mezzo minuto di cache: alleggerisce i cambi rapidi di veicolo senza
      // rischiare di mostrare a lungo una disponibilità che non c'è più.
      headers: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=60' },
    },
  )
}
