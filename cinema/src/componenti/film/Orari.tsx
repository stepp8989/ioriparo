import Link from 'next/link'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Icona } from '@/componenti/ui/Icona'
import type { Impostazioni, Sala, Spettacolo } from '@/lib/tipi'
import { classi, minutiAllInizio, oraFine, prezzo } from '@/lib/utili'
import { prezzoDaPartireDa } from '@/lib/prezzi'
import { MINUTI_PUBBLICITA } from '@/lib/programmazione'

/**
 * Fila di orari acquistabili.
 *
 * Ogni orario è un collegamento diretto all'acquisto con lo spettacolo già
 * scelto: chi ha deciso quando andare non deve ripetere la scelta dentro il
 * flusso. È la ragione per cui il motore di prenotazione accetta uno
 * spettacolo nell'indirizzo invece di partire sempre dal primo passo.
 *
 * L'ora mostrata è quella d'ingresso; sotto, in piccolo, l'ora di fine
 * proiezione — l'informazione che serve davvero a chi deve prendere l'ultimo
 * autobus, e che quasi nessuna biglietteria dichiara.
 */
export function Orari({
  spettacoli,
  sale,
  impostazioni,
  durataFilm,
  className,
}: {
  spettacoli: Spettacolo[]
  sale: Sala[]
  impostazioni: Impostazioni
  durataFilm: number
  className?: string
}) {
  if (spettacoli.length === 0) {
    return (
      <p className={classi('text-[0.9rem] text-tenue', className)}>
        Nessuno spettacolo in programma per questa selezione.
      </p>
    )
  }

  const salePerId = new Map(sale.map((sala) => [sala.id, sala]))

  return (
    <ul className={classi('flex flex-wrap gap-2.5', className)}>
      {spettacoli.map((spettacolo) => {
        const sala = salePerId.get(spettacolo.salaId) ?? null
        const mancanti = minutiAllInizio(spettacolo.data, spettacolo.ora)
        // «Ultimi posti» non è un artificio di vendita: passata la chiusura
        // della prevendita online restano davvero solo i posti in cassa.
        const inPartenza = mancanti < 90 && mancanti >= impostazioni.chiusuraVenditaMinuti
        const da = prezzoDaPartireDa(spettacolo, sala, impostazioni)

        return (
          <li key={spettacolo.id}>
            <Link
              href={`/acquista?spettacolo=${spettacolo.id}`}
              className={classi(
                'group flex min-w-[6.5rem] flex-col gap-0.5 rounded-tenue border px-3.5 py-2.5 transition-all duration-300',
                'border-bordo bg-superficie hover:-translate-y-0.5 hover:border-accento hover:shadow-morbida',
              )}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="tabellare font-titolo text-[1.05rem] font-semibold group-hover:text-accento">
                  {spettacolo.ora}
                </span>
                <span className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-tenue">
                  {spettacolo.lingua === 'VO' ? 'VO' : ''}
                </span>
              </span>

              <span className="tabellare text-[0.7rem] text-tenue">
                fino alle {oraFine(spettacolo.ora, durataFilm, MINUTI_PUBBLICITA)}
              </span>

              <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {spettacolo.formato !== '2D' && (
                  <Etichetta tono="viola" className="px-2 py-0.5 text-[0.6rem]">
                    {spettacolo.formato}
                  </Etichetta>
                )}
                {sala && (
                  <span className="text-[0.7rem] text-tenue">{sala.nome}</span>
                )}
              </span>

              <span className="mt-1 flex items-center justify-between gap-2">
                <span className="tabellare text-[0.72rem] text-tenue">da {prezzo(da)}</span>
                {inPartenza && (
                  <span className="inline-flex items-center gap-1 text-[0.66rem] font-semibold text-attesa">
                    <Icona nome="fuoco" className="size-3" />
                    fra poco
                  </span>
                )}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
