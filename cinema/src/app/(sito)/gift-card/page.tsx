import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ModuloGiftCard } from '@/componenti/account/ModuloGiftCard'
import { Icona } from '@/componenti/ui/Icona'
import { Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'

/**
 * Gift card.
 *
 * Il taglio, il messaggio e la data di invio si scelgono qui; il codice lo
 * genera il server e resta valido finché ha credito. Il regalo è utilizzabile
 * in più volte, e questo va detto in pagina: una gift card che si consuma
 * tutta al primo utilizzo è una fregatura che le persone ricordano.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Regala il cinema',
    descrizione:
      'Gift card da 10, 25, 50 o 100 euro, con messaggio personalizzato e data di invio a scelta. Spendibile in tutte le sale della rete.',
    percorso: '/gift-card',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaGiftCard() {
  const archivio = await datiSito()
  if (!archivio.impostazioni.moduli.giftCard) notFound()

  const { marchio } = archivio.impostazioni

  return (
    <Sezione className="pt-32">
      <div className="grid gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <TitoloSezione
            soprattitolo="Gift card"
            titolo="Regala il cinema"
            sottotitolo="Un regalo che non si sbaglia mai: sceglie il film chi lo riceve."
            allineamento="sinistra"
          />

          <div
            className="relative mt-10 aspect-[16/10] overflow-hidden rounded-ampio p-8 text-white shadow-rilievo"
            style={{
              backgroundImage: `linear-gradient(135deg, ${marchio.colore}, ${marchio.coloreAlt})`,
            }}
          >
            <div className="grana pointer-events-none absolute inset-0" aria-hidden />

            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] opacity-80">
              Gift card
            </p>
            <p className="mt-2 font-titolo text-[1.6rem] font-bold tracking-[0.2em]">
              {marchio.nome}
            </p>

            <div className="absolute bottom-8 left-8 right-8">
              <p className="tabellare font-titolo text-[1.3rem] font-bold tracking-[0.3em] opacity-90">
                •••• •••• ••
              </p>
              <p className="mt-2 text-[0.78rem] opacity-75">
                Spendibile in tutte le sale · Nessuna scadenza sul credito
              </p>
            </div>

            <Icona
              nome="regalo"
              className="absolute right-8 top-8 size-12 opacity-40"
            />
          </div>

          <ul className="mt-9 space-y-3.5">
            {[
              {
                icona: 'posta' as const,
                titolo: 'Arriva via email',
                testo: 'Nel giorno che scegli tu, con il tuo messaggio.',
              },
              {
                icona: 'portafoglio' as const,
                titolo: 'Si usa in più volte',
                testo: 'Il credito residuo resta sulla carta finché non finisce.',
              },
              {
                icona: 'schermo' as const,
                titolo: 'Vale su tutto',
                testo: 'Biglietti, supplementi e banco alimentari, in ogni sala della rete.',
              },
            ].map((voce) => (
              <li key={voce.titolo} className="flex items-start gap-3.5">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accento/12 text-accento">
                  <Icona nome={voce.icona} className="size-5" />
                </span>
                <span>
                  <span className="block font-medium">{voce.titolo}</span>
                  <span className="mt-0.5 block text-[0.86rem] text-tenue">{voce.testo}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-ampio border border-bordo bg-superficie p-7 sm:p-9">
          <h2 className="font-titolo text-[1.3rem] font-semibold">Componi il regalo</h2>
          <p className="mt-1.5 text-[0.88rem] text-tenue">
            Tutti i campi contrassegnati sono obbligatori.
          </p>

          <div className="mt-7">
            <ModuloGiftCard />
          </div>
        </div>
      </div>

      <Nota className="mt-12 max-w-3xl" icona={<Icona nome="info" className="size-4" />}>
        Le gift card non sono rimborsabili né convertibili in denaro e non possono essere usate per
        acquistare altre gift card. In caso di smarrimento del codice, contattaci: possiamo
        riemetterlo a chi risulta averlo acquistato.
      </Nota>
    </Sezione>
  )
}
