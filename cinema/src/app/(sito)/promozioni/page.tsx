import type { Metadata } from 'next'
import Link from 'next/link'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale } from '@/componenti/ui/Poster'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { datiSito, promozioniVive } from '@/lib/sito'
import { dataEstesa, GIORNI_SETTIMANA, percentuale, prezzo } from '@/lib/utili'

/**
 * Promozioni attive.
 *
 * Ogni promozione dichiara per intero le proprie condizioni: giorni, orari,
 * cinema, film, limiti d'uso. Non è un obbligo di legge scritto così, ma è
 * l'unico modo perché il pubblico non scopra al momento di pagare che lo
 * sconto non si applica — ed è quello che trasforma una promozione in un
 * reclamo.
 */
export const revalidate = 300

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Promozioni e offerte',
    descrizione:
      'Sconti, 2x1, happy hour e giornate speciali nelle sale della rete. Condizioni complete e codici da usare al momento dell’acquisto.',
    percorso: '/promozioni',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaPromozioni() {
  const archivio = await datiSito()
  const promozioni = promozioniVive(archivio)

  const cinemaPerId = new Map(archivio.cinema.map((voce) => [voce.id, voce]))
  const filmPerId = new Map(archivio.film.map((voce) => [voce.id, voce]))
  const livelliPerId = new Map(archivio.livelliLoyalty.map((voce) => [voce.id, voce]))

  /** Riga di condizione, mostrata solo quando la promozione la impone davvero. */
  function condizioni(promozione: (typeof promozioni)[number]): string[] {
    const righe: string[] = []

    if (promozione.giorniValidi.length > 0) {
      righe.push(
        `Valida ${promozione.giorniValidi.map((giorno) => GIORNI_SETTIMANA[giorno]).join(', ').toLowerCase()}`,
      )
    }
    if (promozione.oraDa || promozione.oraA) {
      righe.push(
        `Spettacoli ${promozione.oraDa ? `dalle ${promozione.oraDa}` : ''}${
          promozione.oraDa && promozione.oraA ? ' ' : ''
        }${promozione.oraA ? `fino alle ${promozione.oraA}` : ''}`,
      )
    }
    if (promozione.cinemaIds.length > 0) {
      righe.push(
        `Solo a ${promozione.cinemaIds
          .map((id) => cinemaPerId.get(id)?.nome ?? id)
          .join(', ')}`,
      )
    }
    if (promozione.filmIds.length > 0) {
      righe.push(
        `Solo su ${promozione.filmIds.map((id) => filmPerId.get(id)?.titolo ?? id).join(', ')}`,
      )
    }
    if (promozione.formati.length > 0) {
      righe.push(`Solo in formato ${promozione.formati.join(', ')}`)
    }
    if (promozione.soloAbbonati) righe.push('Riservata agli abbonati')
    if (promozione.livelliRichiesti.length > 0) {
      righe.push(
        `Riservata al livello CLUB ${promozione.livelliRichiesti
          .map((id) => livelliPerId.get(id)?.nome ?? id)
          .join(', ')}`,
      )
    }
    if (promozione.limitePerCliente > 0) {
      righe.push(`Massimo ${promozione.limitePerCliente} utilizzi per cliente`)
    }
    if (promozione.limiteUtilizzi > 0) {
      const residui = Math.max(0, promozione.limiteUtilizzi - promozione.utilizzi)
      righe.push(`${residui} utilizzi ancora disponibili`)
    }
    righe.push(`Fino al ${dataEstesa(promozione.al)}`)

    return righe
  }

  function vantaggio(promozione: (typeof promozioni)[number]): string {
    switch (promozione.tipo) {
      case '2x1':
        return 'Paghi uno'
      case 'percentuale':
        return `−${percentuale(promozione.valore)}`
      case 'fisso':
        return `−${prezzo(promozione.valore)}`
      case 'punti-extra':
        return `Punti ×${promozione.valore}`
      case 'food-omaggio':
        return 'Food omaggio'
      default:
        return 'Promozione'
    }
  }

  return (
    <Sezione spaziatura="testata">
      <TitoloSezione
        soprattitolo="Promozioni"
        titolo="Il cinema costa meno di quanto pensi"
        sottotitolo="Alcune promozioni si applicano da sole al momento dell’acquisto; altre hanno un codice da inserire al pagamento. Qui sotto trovi le condizioni per intero."
        allineamento="sinistra"
      />

      {promozioni.length === 0 ? (
        <Nota className="mt-6 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
          Nessuna promozione attiva in questo momento. Iscriviti al CLUB per ricevere le prossime.
        </Nota>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          {promozioni.map((promozione) => (
            <article
              key={promozione.id}
              id={promozione.slug}
              className="relative flex scroll-mt-28 flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie"
            >
              <div className="relative h-32 overflow-hidden">
                <Fondale chiave={promozione.id} palette={promozione.palette} immagine={promozione.immagine} />
                <div className="absolute inset-0 bg-gradient-to-t from-superficie via-notte/30 to-transparent" aria-hidden />

                <span className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-tenue bg-notte/85 px-4 py-2 font-titolo text-[1.05rem] font-bold text-white">
                  {vantaggio(promozione)}
                </span>

                {promozione.inEvidenza && (
                  <span className="absolute right-5 top-5">
                    <Etichetta tono="pieno">In evidenza</Etichetta>
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-accento">
                  {promozione.sottotitolo}
                </p>
                <h2 className="mt-2 font-titolo text-[1.4rem] font-semibold">{promozione.titolo}</h2>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-tenue">
                  {promozione.descrizione}
                </p>

                <ul className="mt-5 space-y-2 text-[0.84rem] text-tenue">
                  {condizioni(promozione).map((riga) => (
                    <li key={riga} className="flex items-start gap-2">
                      <Icona nome="spunta" className="mt-0.5 size-3.5 shrink-0 text-ok" />
                      {riga}
                    </li>
                  ))}
                </ul>

                <div className="mt-6 flex flex-wrap items-center gap-3 pt-1">
                  {promozione.codice ? (
                    <span className="inline-flex items-center gap-2 rounded-tenue border border-dashed border-accento/50 bg-accento/8 px-4 py-2.5">
                      <Icona nome="biglietto" className="size-4 text-accento" />
                      <span className="tabellare font-titolo text-[1rem] font-bold tracking-[0.18em]">
                        {promozione.codice}
                      </span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-ok">
                      <Icona nome="fulmine" className="size-4" />
                      Sconto automatico, nessun codice
                    </span>
                  )}

                  <Bottone href="/programmazione" variante="tenue" misura="piccola">
                    Scegli un film
                  </Bottone>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Nota className="mt-6 max-w-3xl" icona={<Icona nome="info" className="size-4" />}>
        Le promozioni non sono cumulabili fra loro. Quando più di una è applicabile allo stesso
        ordine, il sistema applica automaticamente quella che ti conviene di più — non serve
        provarle a una a una. I punti CLUB e le gift card si sommano invece a qualsiasi promozione.{' '}
        <Link href="/termini" className="text-accento underline">
          Termini di vendita
        </Link>
        .
      </Nota>
    </Sezione>
  )
}
