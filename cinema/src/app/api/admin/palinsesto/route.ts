import { annota, modifica } from '@/lib/archivio'
import { generaPalinsesto } from '@/dati/programmazione'
import { corpoJson, dataPulita, elencoPulito, numeroIntero } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { oggiIso } from '@/lib/utili'

/**
 * Generazione automatica del palinsesto.
 *
 *   POST  propone o applica un palinsesto per i prossimi giorni
 *
 * Con `anteprima: true` restituisce gli spettacoli che verrebbero creati senza
 * salvarli: comporre una settimana di programmazione è un'operazione che si
 * vuole poter guardare prima di confermare.
 *
 * Gli spettacoli già presenti non vengono mai toccati: la generazione riempie
 * i buchi attorno a quello che l'operatore ha già sistemato a mano, e il
 * controllo di sovrapposizione è lo stesso della programmazione manuale.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)

  const da = dataPulita(corpo.da) || oggiIso()
  const giorni = numeroIntero(corpo.giorni, 1, 30, 7)
  const cinemaIds = elencoPulito(corpo.cinemaIds, 20, 60)
  const anteprima = corpo.anteprima === true

  const esito = await modifica((archivio) => {
    const nuovi = generaPalinsesto(
      archivio.film,
      archivio.cinema,
      archivio.sale,
      archivio.spettacoli,
      { da, giorni, cinemaIds, seme: Number(corpo.seme) || undefined },
    )

    if (anteprima) return { creati: nuovi.length, spettacoli: nuovi.slice(0, 60) } as const

    archivio.spettacoli.push(...nuovi)
    annota(
      archivio,
      'gestione',
      'palinsesto-generato',
      `${da}+${giorni}`,
      `${nuovi.length} spettacoli creati${cinemaIds.length > 0 ? ` in ${cinemaIds.length} cinema` : ''}.`,
    )

    return { creati: nuovi.length, spettacoli: [] } as const
  })

  return Response.json(esito)
}
