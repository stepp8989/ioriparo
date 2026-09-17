'use client'

import { useMemo } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { Illustrazione } from '@/componenti/ui/Poster'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Quantita } from '@/componenti/ui/campi'
import { CATEGORIE_FOOD, type ProdottoFood } from '@/lib/tipi'
import { prezzo, raggruppa } from '@/lib/utili'

/**
 * Banco alimentari dentro il flusso d'acquisto.
 *
 * Compare solo qui, quando il cinema è già scelto: i prodotti non sono gli
 * stessi in tutte le sale — la licenza per gli alcolici, le seadas fatte in
 * loco — e proporre qualcosa che poi al banco non c'è è peggio che non
 * proporlo affatto.
 *
 * Il passo è saltabile: chi vuole solo il biglietto preme «continua» e va
 * avanti. Nessun prodotto è preselezionato.
 */
export function SceltaFood({
  prodotti,
  cinemaId,
  quantita,
  onCambia,
}: {
  prodotti: ProdottoFood[]
  cinemaId: string
  quantita: Record<string, number>
  onCambia: (quantita: Record<string, number>) => void
}) {
  const disponibili = useMemo(
    () =>
      prodotti
        .filter((prodotto) => prodotto.disponibile)
        .filter(
          (prodotto) => prodotto.cinemaIds.length === 0 || prodotto.cinemaIds.includes(cinemaId),
        )
        .sort((a, b) => a.ordine - b.ordine),
    [cinemaId, prodotti],
  )

  const perCategoria = useMemo(
    () => raggruppa(disponibili, (prodotto) => prodotto.categoria),
    [disponibili],
  )

  const totaleArticoli = Object.values(quantita).reduce((somma, valore) => somma + valore, 0)

  return (
    <section>
      <h2 className="font-titolo text-[1.4rem] font-semibold">Aggiungi qualcosa da mangiare</h2>
      <p className="mt-1.5 text-[0.9rem] text-tenue">
        Facoltativo. Ordinando adesso ritiri al banco mostrando il QR, senza fare la fila.
      </p>

      {totaleArticoli > 0 && (
        <p className="mt-3 inline-flex items-center gap-2 rounded-tenue bg-accento/10 px-3.5 py-1.5 text-[0.82rem] text-accento">
          <Icona nome="popcorn" className="size-4" />
          {totaleArticoli} {totaleArticoli === 1 ? 'articolo' : 'articoli'} nel carrello
        </p>
      )}

      <div className="mt-7 space-y-9">
        {CATEGORIE_FOOD.filter((categoria) => perCategoria.has(categoria)).map((categoria) => (
          <div key={categoria}>
            <h3 className="font-titolo text-[1.08rem] font-semibold">{categoria}</h3>

            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {(perCategoria.get(categoria) ?? []).map((prodotto) => (
                <li
                  key={prodotto.id}
                  className="flex gap-3.5 rounded-morbido border border-bordo bg-superficie p-3.5"
                >
                  <div className="size-20 shrink-0 overflow-hidden rounded-tenue">
                    <Illustrazione
                      chiave={prodotto.id}
                      palette={prodotto.palette}
                      immagine={prodotto.immagine}
                      alt={prodotto.nome}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[0.92rem] font-semibold leading-tight">{prodotto.nome}</p>
                      <p className="tabellare shrink-0 text-[0.9rem] font-semibold text-accento">
                        {prezzo(prodotto.prezzo)}
                      </p>
                    </div>

                    <p className="mt-1 line-clamp-2 text-[0.8rem] text-tenue">
                      {prodotto.descrizione}
                    </p>

                    {prodotto.allergeni.length > 0 && (
                      <p className="mt-1.5">
                        <Etichetta tono="ambra" className="px-2 py-0.5 text-[0.58rem]">
                          {prodotto.allergeni.join(', ')}
                        </Etichetta>
                      </p>
                    )}

                    <div className="mt-2.5">
                      <Quantita
                        etichetta={prodotto.nome}
                        valore={quantita[prodotto.id] ?? 0}
                        onCambia={(valore) => onCambia({ ...quantita, [prodotto.id]: valore })}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {disponibili.length === 0 && (
        <p className="mt-6 text-[0.9rem] text-tenue">
          Il banco di questo cinema non ha prodotti ordinabili online.
        </p>
      )}
    </section>
  )
}
