'use client'

import type { PostoScelto } from '@/componenti/prenota/MappaPosti'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import type { TipologiaBiglietto } from '@/lib/tipi'
import { chiavePosto, classi, etichettaPosto, prezzo } from '@/lib/utili'

/**
 * Scelta della tipologia per ogni poltrona.
 *
 * La tipologia si assegna posto per posto, non «tre ridotti e due interi»: chi
 * entra deve sapere quale biglietto è il suo, perché all'ingresso il documento
 * viene chiesto a quella persona lì, non al gruppo.
 *
 * Le tipologie che richiedono un documento sono contrassegnate in modo
 * esplicito: la sorpresa alla porta è la contestazione più frequente in
 * biglietteria, e si evita scrivendolo prima di incassare.
 */
export function SceltaBiglietti({
  posti,
  tipologie,
  scelte,
  predefinita,
  onCambia,
}: {
  posti: PostoScelto[]
  tipologie: TipologiaBiglietto[]
  scelte: Record<string, string>
  predefinita: string
  onCambia: (scelte: Record<string, string>) => void
}) {
  const attive = tipologie.filter((voce) => voce.attiva).sort((a, b) => a.ordine - b.ordine)

  function assegna(chiave: string, tipologiaId: string) {
    onCambia({ ...scelte, [chiave]: tipologiaId })
  }

  function assegnaATutti(tipologiaId: string) {
    const prossime: Record<string, string> = {}
    for (const posto of posti) prossime[chiavePosto(posto.fila, posto.numero)] = tipologiaId
    onCambia(prossime)
  }

  const conDocumento = posti.some((posto) => {
    const id = scelte[chiavePosto(posto.fila, posto.numero)] ?? predefinita
    return attive.find((voce) => voce.id === id)?.richiedeDocumento
  })

  return (
    <section>
      <h2 className="font-titolo text-[1.4rem] font-semibold">Chi entra?</h2>
      <p className="mt-1.5 text-[0.9rem] text-tenue">
        Assegna una tipologia a ogni posto. I prezzi mostrati comprendono già i supplementi di
        formato e di poltrona.
      </p>

      {posti.length > 1 && (
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-[0.8rem] text-tenue">Applica a tutti:</span>
          {attive.map((tipologia) => (
            <button
              key={tipologia.id}
              type="button"
              onClick={() => assegnaATutti(tipologia.id)}
              className="rounded-full border border-bordo px-3 py-1.5 text-[0.78rem] text-tenue transition-colors hover:border-accento hover:text-accento"
            >
              {tipologia.nome}
            </button>
          ))}
        </div>
      )}

      <ul className="mt-6 space-y-3">
        {posti.map((posto) => {
          const chiave = chiavePosto(posto.fila, posto.numero)
          const scelta = scelte[chiave] ?? predefinita

          return (
            <li
              key={chiave}
              className="rounded-morbido border border-bordo bg-superficie p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2.5">
                  <span className="inline-flex size-9 items-center justify-center rounded-tenue bg-accento/12 font-titolo text-[0.86rem] font-bold text-accento">
                    {etichettaPosto(posto.fila, posto.numero)}
                  </span>
                  <span className="text-[0.88rem] text-tenue">
                    Fila {posto.fila}, posto {posto.numero}
                    {posto.tipoPosto === 'premium' && ' · Premium'}
                    {posto.tipoPosto === 'disabili' && ' · Riservato'}
                  </span>
                </span>
              </div>

              <div className="mt-3.5 flex flex-wrap gap-2">
                {attive.map((tipologia) => {
                  const selezionata = scelta === tipologia.id

                  return (
                    <button
                      key={tipologia.id}
                      type="button"
                      onClick={() => assegna(chiave, tipologia.id)}
                      aria-pressed={selezionata}
                      className={classi(
                        'flex items-center gap-2 rounded-full border px-3.5 py-2 text-[0.82rem] transition-all duration-300',
                        selezionata
                          ? 'border-accento bg-accento text-white'
                          : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                      )}
                    >
                      {tipologia.nome}
                      {tipologia.variazione !== 0 && (
                        <span className="tabellare text-[0.74rem] opacity-80">
                          {tipologia.variazione > 0 ? '+' : '−'}
                          {prezzo(Math.abs(tipologia.variazione))}
                        </span>
                      )}
                      {tipologia.richiedeDocumento && (
                        <Icona nome="info" className="size-3.5 opacity-70" />
                      )}
                    </button>
                  )
                })}
              </div>

              {attive.find((voce) => voce.id === scelta)?.descrizione && (
                <p className="mt-2.5 text-[0.8rem] text-tenue">
                  {attive.find((voce) => voce.id === scelta)?.descrizione}
                </p>
              )}
            </li>
          )
        })}
      </ul>

      {conDocumento && (
        <Nota tono="ambra" className="mt-6" icona={<Icona nome="info" className="size-4" />}>
          Hai scelto almeno una tipologia ridotta. All’ingresso può essere richiesto un documento
          che dia diritto alla riduzione: in mancanza, il personale può chiedere l’integrazione
          fino al prezzo intero.
        </Nota>
      )}
    </section>
  )
}
