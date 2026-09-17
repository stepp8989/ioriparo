import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Illustrazione } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { CATEGORIE_FOOD } from '@/lib/tipi'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'
import { prezzo, raggruppa } from '@/lib/utili'

/**
 * Banco alimentari.
 *
 * È una vetrina, non un carrello: l'ordine si compone dentro il flusso
 * d'acquisto, al passo «Food», quando il cinema è già stato scelto. Farlo
 * qui significherebbe chiedere di scegliere i popcorn prima di sapere in quale
 * sala si va, e i prodotti non sono gli stessi ovunque.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Food & Drink',
    descrizione:
      'Popcorn, nachos, bibite, dolci e combo del banco. Prezzi, allergeni e disponibilità per sala.',
    percorso: '/food',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaFood() {
  const archivio = await datiSito()
  if (!archivio.impostazioni.moduli.food) notFound()

  const prodotti = archivio.food
    .filter((voce) => voce.disponibile)
    .sort((a, b) => a.ordine - b.ordine)

  const perCategoria = raggruppa(prodotti, (voce) => voce.categoria)
  const cinemaPerId = new Map(archivio.cinema.map((voce) => [voce.id, voce]))

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Food & Drink"
        titolo="Il banco, prima della sala"
        sottotitolo="Ordina insieme ai biglietti e ritira senza fila: al banco basta mostrare il QR della prenotazione."
        allineamento="sinistra"
      />

      <div className="mt-12 space-y-14">
        {CATEGORIE_FOOD.filter((categoria) => perCategoria.has(categoria)).map((categoria) => (
          <section key={categoria}>
            <h2 className="font-titolo text-[1.4rem] font-semibold">{categoria}</h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {(perCategoria.get(categoria) ?? []).map((prodotto) => (
                <article
                  key={prodotto.id}
                  className="group flex gap-4 overflow-hidden rounded-morbido border border-bordo bg-superficie p-4 transition-all duration-500 hover:border-accento/40 hover:shadow-morbida"
                >
                  <div className="size-24 shrink-0 overflow-hidden rounded-tenue">
                    <div className="size-full transition-transform duration-700 group-hover:scale-110">
                      <Illustrazione
                        chiave={prodotto.id}
                        palette={prodotto.palette}
                        immagine={prodotto.immagine}
                        alt={prodotto.nome}
                      />
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-titolo text-[1rem] font-semibold leading-tight">
                        {prodotto.nome}
                      </h3>
                      <span className="tabellare shrink-0 font-titolo text-[1rem] font-semibold text-accento">
                        {prezzo(prodotto.prezzo)}
                      </span>
                    </div>

                    <p className="mt-1.5 text-[0.84rem] leading-snug text-tenue">
                      {prodotto.descrizione}
                    </p>

                    {prodotto.contenuto.length > 0 && (
                      <ul className="mt-2.5 space-y-1">
                        {prodotto.contenuto.map((voce) => (
                          <li key={voce} className="flex items-center gap-1.5 text-[0.78rem] text-tenue">
                            <Icona nome="spunta" className="size-3 text-ok" />
                            {voce}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {prodotto.allergeni.length > 0 && (
                        <span className="rounded-tenue bg-attesa/12 px-2.5 py-1 text-[0.68rem] text-attesa">
                          Allergeni: {prodotto.allergeni.join(', ')}
                        </span>
                      )}
                      {prodotto.cinemaIds.length > 0 && (
                        <span className="rounded-tenue bg-superficie-alt px-2.5 py-1 text-[0.68rem] text-tenue">
                          Solo a{' '}
                          {prodotto.cinemaIds
                            .map((id) => cinemaPerId.get(id)?.citta ?? id)
                            .join(', ')}
                        </span>
                      )}
                      {prodotto.inEvidenza && <Etichetta tono="accento" className="px-2 py-0.5 text-[0.6rem]">Consigliato</Etichetta>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>

      <Nota className="mt-12 max-w-3xl" icona={<Icona nome="info" className="size-4" />}>
        Le informazioni sugli allergeni riguardano gli ingredienti dichiarati dai fornitori. I
        prodotti sono preparati in un ambiente in cui si manipolano glutine, latte, uova, soia e
        frutta a guscio: non possiamo garantire l’assenza di contaminazione crociata. Per
        intolleranze gravi chiedi al personale del banco prima dell’acquisto.
      </Nota>

      <div className="mt-8">
        <Bottone href="/programmazione">
          <Icona nome="biglietto" className="size-4" />
          Scegli un film e aggiungi il food
        </Bottone>
      </div>
    </Sezione>
  )
}
