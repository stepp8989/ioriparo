import Link from 'next/link'
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
 * La pastiglia è compatta di proposito: su una scheda film ce ne stanno anche
 * venti, e in quattro righe di dati ciascuna diventavano un muro. L'ora, in
 * condensato, è l'unica cosa che si legge da lontano; formato, sala e prezzo
 * stanno sulla riga sotto, e l'ora di fine — l'informazione che serve a chi
 * deve prendere l'ultimo autobus, e che quasi nessuna biglietteria dichiara —
 * resta nel `title` e nella descrizione accessibile del collegamento.
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
    <ul className={classi('flex flex-wrap gap-1.5', className)}>
      {spettacoli.map((spettacolo) => {
        const sala = salePerId.get(spettacolo.salaId) ?? null
        const mancanti = minutiAllInizio(spettacolo.data, spettacolo.ora)
        // «Fra poco» non è un artificio di vendita: passata la chiusura della
        // prevendita online restano davvero solo i posti in cassa.
        const inPartenza = mancanti < 90 && mancanti >= impostazioni.chiusuraVenditaMinuti
        const da = prezzoDaPartireDa(spettacolo, sala, impostazioni)
        const fine = oraFine(spettacolo.ora, durataFilm, MINUTI_PUBBLICITA)
        // L'italiano è la lingua predefinita del listino: segnalarlo su ogni
        // orario sarebbe rumore, mentre la versione originale va detta sempre.
        const contorno = [
          spettacolo.formato !== '2D' ? spettacolo.formato : '',
          spettacolo.lingua === 'IT' ? '' : spettacolo.lingua,
        ]
          .filter(Boolean)
          .join(' · ')

        return (
          <li key={spettacolo.id}>
            <Link
              href={`/acquista?spettacolo=${spettacolo.id}`}
              title={`${spettacolo.ora} – fine alle ${fine}${sala ? `, ${sala.nome}` : ''}`}
              aria-label={`Spettacolo delle ${spettacolo.ora}, fine alle ${fine}${
                sala ? `, ${sala.nome}` : ''
              }, da ${prezzo(da)}`}
              className={classi(
                'flex min-w-[5.25rem] flex-col items-start gap-0.5 rounded-tenue border px-2.5 py-1.5 transition-colors duration-200',
                inPartenza
                  ? 'border-accento/45 bg-accento/8 hover:border-accento'
                  : 'border-bordo bg-superficie hover:border-accento',
              )}
            >
              <span className="flex w-full items-baseline gap-1.5">
                <span className="tabellare font-stretto text-[1.15rem] font-bold leading-none">
                  {spettacolo.ora}
                </span>
                {inPartenza && (
                  <Icona nome="fuoco" className="size-3 text-accento" aria-hidden />
                )}
                <span className="tabellare ml-auto text-[0.7rem] font-semibold text-accento">
                  {prezzo(da)}
                </span>
              </span>

              <span className="flex w-full items-center gap-1 text-[0.66rem] uppercase tracking-[0.06em] text-tenue">
                {contorno && <span className="font-semibold text-ambra">{contorno}</span>}
                {sala && <span className="truncate normal-case tracking-normal">{sala.nome}</span>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
