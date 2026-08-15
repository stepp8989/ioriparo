import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Icona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Etichetta, Sezione } from '@/componenti/ui/Sezione'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'
import { NOMI_CATEGORIA_ARTICOLO } from '@/lib/tipi'
import { dataEstesa } from '@/lib/utili'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Blog',
  descrizione:
    'Guide all’acquisto, consigli di manutenzione, cura del veicolo e novità automotive, scritte ' +
    'da chi ci mette le mani ogni giorno.',
  percorso: '/blog',
})

export default async function PaginaBlog() {
  const { articoli } = await leggi()

  const pubblicati = [...articoli]
    .filter((articolo) => articolo.pubblicato)
    .sort((a, b) => b.data.localeCompare(a.data))

  const [primo, ...altri] = pubblicati

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Blog', percorso: '/blog' }])),
        }}
      />

      <Intestazione
        soprattitolo="Blog"
        titolo={
          <>
            Guide, consigli e
            <br />
            <span className="testo-accento">novità automotive</span>
          </>
        }
        sottotitolo="Quello che spieghiamo ogni giorno di persona, scritto una volta per tutte. Nessun contenuto sponsorizzato."
        briciole={[{ nome: 'Blog', percorso: '/blog' }]}
      />

      <Sezione className="bg-sfondo">
        {pubblicati.length === 0 ? (
          <p className="rounded-ampio border border-dashed border-bordo-forte p-12 text-center text-tenue">
            Non ci sono ancora articoli pubblicati.
          </p>
        ) : (
          <>
            {/* Articolo di apertura, a tutta larghezza. */}
            <Rivela>
              <article className="group grid overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-shadow duration-500 hover:shadow-rilievo lg:grid-cols-2">
                <div className="relative aspect-[16/10] lg:aspect-auto lg:min-h-[24rem]">
                  <Image
                    src={primo.immagine}
                    alt=""
                    fill
                    priority
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                  />
                </div>

                <div className="flex flex-col justify-center p-8 sm:p-12">
                  <div className="flex flex-wrap items-center gap-3">
                    <Etichetta tono="accento">
                      {NOMI_CATEGORIA_ARTICOLO[primo.categoria]}
                    </Etichetta>
                    <span className="text-[0.8rem] text-tenue">
                      {dataEstesa(primo.data)} · {primo.minutiLettura} min di lettura
                    </span>
                  </div>

                  <h2 className="mt-5 font-titolo text-[1.7rem] leading-tight font-semibold sm:text-[2rem]">
                    <Link href={`/blog/${primo.slug}`} className="transition-colors hover:text-accento">
                      {primo.titolo}
                    </Link>
                  </h2>

                  <p className="mt-4 text-[0.98rem] leading-relaxed text-tenue">{primo.sommario}</p>

                  <Link
                    href={`/blog/${primo.slug}`}
                    className="mt-7 inline-flex items-center gap-2 self-start text-[0.9rem] font-semibold text-accento sottolinea"
                  >
                    Leggi l’articolo
                    <Icona nome="freccia" className="size-4" />
                  </Link>
                </div>
              </article>
            </Rivela>

            <GruppoRivelato className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {altri.map((articolo) => (
                <FiglioRivelato key={articolo.id}>
                  <article className="group relative flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={articolo.immagine}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                        className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                      />
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-accento uppercase">
                        {NOMI_CATEGORIA_ARTICOLO[articolo.categoria]}
                      </p>

                      <h3 className="mt-3 text-[1.1rem] leading-snug font-semibold">
                        <Link href={`/blog/${articolo.slug}`} className="after:absolute after:inset-0">
                          {articolo.titolo}
                        </Link>
                      </h3>

                      <p className="mt-3 text-[0.88rem] leading-relaxed text-tenue">
                        {articolo.sommario}
                      </p>

                      <p className="mt-auto pt-5 text-[0.78rem] text-tenue">
                        {dataEstesa(articolo.data)} · {articolo.minutiLettura} min
                      </p>
                    </div>
                  </article>
                </FiglioRivelato>
              ))}
            </GruppoRivelato>
          </>
        )}
      </Sezione>
    </>
  )
}
