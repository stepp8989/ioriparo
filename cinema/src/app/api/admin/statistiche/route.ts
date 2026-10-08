import { leggi } from '@/lib/archivio'
import { dataPulita, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { calcolaStatistiche, type Periodo } from '@/lib/statistiche'

/**
 * Statistiche di vendita.
 *
 *   GET /api/admin/statistiche?periodo=settimana&cinema=…&film=…&al=AAAA-MM-GG
 */

export const dynamic = 'force-dynamic'

const PERIODI: Periodo[] = ['giorno', 'settimana', 'mese', 'anno']

export async function GET(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const parametri = new URL(richiesta.url).searchParams
  const richiesto = testoPulito(parametri.get('periodo'), 20) as Periodo

  const archivio = await leggi()

  const statistiche = calcolaStatistiche(archivio, {
    periodo: PERIODI.includes(richiesto) ? richiesto : 'settimana',
    cinemaId: testoPulito(parametri.get('cinema'), 60),
    filmId: testoPulito(parametri.get('film'), 60),
    al: dataPulita(parametri.get('al')) || undefined,
  })

  return Response.json(statistiche, { headers: { 'Cache-Control': 'no-store' } })
}
