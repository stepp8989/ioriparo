'use client'

import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import type { RispostaConto } from '@/componenti/prenota/tipi'
import type { FilmAcquisto, CinemaAcquisto } from '@/componenti/prenota/tipi'
import type { Spettacolo } from '@/lib/tipi'
import { classi, dataBreve, elencoPosti, prezzoPieno } from '@/lib/utili'

/**
 * Riepilogo dell'ordine.
 *
 * Mostra ogni voce separatamente — posti, banco, sconti, commissione — perché
 * un totale senza dettaglio è il modo più rapido per far dubitare del prezzo.
 * Le commissioni in particolare sono sempre visibili e mai incorporate nel
 * prezzo del biglietto: nasconderle le fa scoprire al momento di pagare, che è
 * il momento peggiore.
 *
 * I numeri arrivano dal server: il browser non calcola nulla e non arrotonda
 * nulla per conto proprio.
 */
export function Riepilogo({
  esito,
  caricamento,
  film,
  cinema,
  spettacolo,
  salaNome,
  posti,
  className,
}: {
  esito: RispostaConto | null
  caricamento: boolean
  film: FilmAcquisto | null
  cinema: CinemaAcquisto | null
  spettacolo: Spettacolo | null
  salaNome: string
  posti: { fila: string; numero: number }[]
  className?: string
}) {
  const conto = esito?.conto ?? null

  return (
    <aside
      className={classi('rounded-ampio border border-bordo bg-superficie p-6', className)}
      aria-label="Riepilogo dell’ordine"
    >
      <h2 className="font-titolo text-[1.15rem] font-semibold">Riepilogo</h2>

      {film && spettacolo && (
        <dl className="mt-5 space-y-2.5 border-b border-bordo pb-5 text-[0.88rem]">
          <div className="flex justify-between gap-4">
            <dt className="text-tenue">Film</dt>
            <dd className="text-right font-medium">{film.titolo}</dd>
          </div>
          {cinema && (
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">Cinema</dt>
              <dd className="text-right font-medium">{cinema.nome}</dd>
            </div>
          )}
          {salaNome && (
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">Sala</dt>
              <dd className="text-right font-medium">{salaNome}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4">
            <dt className="text-tenue">Quando</dt>
            <dd className="tabellare text-right font-medium">
              {dataBreve(spettacolo.data)} · {spettacolo.ora}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-tenue">Formato</dt>
            <dd className="text-right font-medium">
              {spettacolo.formato}
              {spettacolo.lingua === 'VO' && ' · lingua originale'}
            </dd>
          </div>
          {posti.length > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">Posti</dt>
              <dd className="text-right font-medium">{elencoPosti(posti)}</dd>
            </div>
          )}
        </dl>
      )}

      {caricamento && !conto && (
        <div className="mt-5 space-y-2.5">
          <Scheletro className="h-4 w-full" />
          <Scheletro className="h-4 w-4/5" />
          <Scheletro className="h-6 w-3/5" />
        </div>
      )}

      {conto && (
        <div className={classi('mt-5', caricamento && 'opacity-50 transition-opacity')}>
          <ul className="space-y-2 text-[0.86rem]">
            {conto.righe.map((riga, indice) => (
              <li key={`${riga.etichetta}-${indice}`} className="flex justify-between gap-4">
                <span className="min-w-0 text-tenue">
                  {riga.etichetta}
                  {riga.dettaglio && (
                    <span className="ml-1.5 text-[0.78rem] opacity-70">{riga.dettaglio}</span>
                  )}
                </span>
                <span className="tabellare shrink-0">{prezzoPieno(riga.importo)}</span>
              </li>
            ))}
          </ul>

          {conto.scontiApplicati.length > 0 && (
            <ul className="mt-3 space-y-2 border-t border-bordo pt-3 text-[0.86rem]">
              {conto.scontiApplicati.map((sconto, indice) => (
                <li key={`${sconto.etichetta}-${indice}`} className="flex justify-between gap-4 text-ok">
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <Icona nome="percento" className="size-3.5 shrink-0" />
                    {sconto.etichetta}
                  </span>
                  <span className="tabellare shrink-0">−{prezzoPieno(sconto.importo)}</span>
                </li>
              ))}
            </ul>
          )}

          {conto.commissioni > 0 && (
            <p className="mt-3 flex justify-between gap-4 border-t border-bordo pt-3 text-[0.86rem]">
              <span className="text-tenue">Commissione di servizio</span>
              <span className="tabellare">{prezzoPieno(conto.commissioni)}</span>
            </p>
          )}

          <p className="mt-4 flex items-baseline justify-between gap-4 border-t border-bordo pt-4">
            <span className="font-titolo text-[1.05rem] font-semibold">Totale</span>
            <span className="tabellare font-titolo text-[1.6rem] font-bold text-accento">
              {prezzoPieno(conto.totale)}
            </span>
          </p>

          {conto.puntiAccreditati > 0 && (
            <p className="mt-3 flex items-center gap-2 rounded-tenue bg-superficie-alt p-3 text-[0.82rem] text-tenue">
              <Icona nome="trofeo" className="size-4 shrink-0 text-accento" />
              Con questo acquisto guadagni{' '}
              <strong className="text-testo">{conto.puntiAccreditati} punti CLUB</strong>.
            </p>
          )}

          {esito?.piano && (
            <p className="mt-2 flex items-center gap-2 text-[0.8rem] text-tenue">
              <Icona nome="tessera" className="size-3.5 shrink-0 text-ambra" />
              Vantaggi dell’abbonamento {esito.piano.nome} applicati.
            </p>
          )}
        </div>
      )}
    </aside>
  )
}
