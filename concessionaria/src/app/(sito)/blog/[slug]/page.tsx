import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { Invito } from '@/componenti/home/Offerte'
import { Icona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaArticolo, schemaBriciole } from '@/lib/seo'
import { NOMI_CATEGORIA_ARTICOLO, type Articolo } from '@/lib/tipi'
import { blocchiDiTesto, dataEstesa } from '@/lib/utili'

/** Gli articoli sono contenuti fissi: si generano tutti in anticipo. */
export async function generateStaticParams() {
  const { articoli } = await leggi()
  return articoli
    .filter((articolo) => articolo.pubblicato)
    .map((articolo) => ({ slug: articolo.slug }))
}

async function trovaArticolo(slug: string): Promise<Articolo | null> {
  const { articoli } = await leggi()
  return articoli.find((articolo) => articolo.slug === slug && articolo.pubblicato) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const articolo = await trovaArticolo(slug)

  if (!articolo) {
    return metadatiPagina({
      titolo: 'Articolo non trovato',
      descrizione: 'L’articolo cercato non esiste o non è più pubblicato.',
      percorso: `/blog/${slug}`,
      indicizza: false,
    })
  }

  return metadatiPagina({
    titolo: articolo.titolo,
    descrizione: articolo.sommario,
    percorso: `/blog/${articolo.slug}`,
    immagine: articolo.immagine,
  })
}

export default async function PaginaArticolo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const articolo = await trovaArticolo(slug)

  if (!articolo) notFound()

  const { articoli } = await leggi()

  // Articoli correlati: stessa categoria, poi il resto per data.
  const correlati = articoli
    .filter((altro) => altro.pubblicato && altro.id !== articolo.id)
    .sort((a, b) => {
      const pesoA = a.categoria === articolo.categoria ? 0 : 1
      const pesoB = b.categoria === articolo.categoria ? 0 : 1
      return pesoA - pesoB || b.data.localeCompare(a.data)
    })
    .slice(0, 3)

  const blocchi = blocchiDiTesto(articolo.contenuto)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaArticolo(articolo)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            schemaBriciole([
              { nome: 'Blog', percorso: '/blog' },
              { nome: articolo.titolo, percorso: `/blog/${articolo.slug}` },
            ]),
          ),
        }}
      />

      <Intestazione
        soprattitolo={NOMI_CATEGORIA_ARTICOLO[articolo.categoria]}
        titolo={articolo.titolo}
        sottotitolo={articolo.sommario}
        immagine={articolo.immagine}
        briciole={[
          { nome: 'Blog', percorso: '/blog' },
          { nome: articolo.titolo, percorso: `/blog/${articolo.slug}` },
        ]}
      >
        <p className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.85rem] text-white/55">
          <span className="inline-flex items-center gap-2">
            <Icona nome="utente" className="size-4" />
            {articolo.autore}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icona nome="calendario" className="size-4" />
            {dataEstesa(articolo.data)}
          </span>
          <span className="inline-flex items-center gap-2">
            <Icona nome="orologio" className="size-4" />
            {articolo.minutiLettura} minuti di lettura
          </span>
        </p>
      </Intestazione>

      <Sezione className="bg-sfondo" ampiezza="stretta">
        <article className="mx-auto max-w-2xl">
          {blocchi.map((blocco, indice) => {
            if (blocco.tipo === 'titolo') {
              return (
                <h2
                  key={indice}
                  className="mt-12 mb-4 font-titolo text-[1.5rem] leading-snug font-semibold first:mt-0"
                >
                  {blocco.testo}
                </h2>
              )
            }

            if (blocco.tipo === 'elenco') {
              return (
                <ul key={indice} className="my-6 space-y-3">
                  {blocco.voci.map((voce) => (
                    <li key={voce} className="flex items-start gap-3 text-[1.02rem] leading-relaxed">
                      <Icona nome="spunta" className="mt-1.5 size-4 shrink-0 text-accento" />
                      <span className="text-tenue">{voce}</span>
                    </li>
                  ))}
                </ul>
              )
            }

            return (
              <p key={indice} className="my-5 text-[1.05rem] leading-relaxed text-tenue">
                {blocco.testo}
              </p>
            )
          })}

          {articolo.tag.length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2 border-t border-bordo pt-8">
              <span className="text-[0.8rem] text-tenue">Argomenti:</span>
              {articolo.tag.map((tag) => (
                <Etichetta key={tag}>{tag}</Etichetta>
              ))}
            </div>
          )}

          <Link
            href="/blog"
            className="mt-10 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-accento sottolinea"
          >
            <Icona nome="chevronSinistra" className="size-4" />
            Tutti gli articoli
          </Link>
        </article>
      </Sezione>

      {correlati.length > 0 && (
        <Sezione className="border-t border-bordo bg-sfondo-alt">
          <TitoloSezione
            soprattitolo="Continuate a leggere"
            titolo="Articoli correlati"
            allineamento="sinistra"
          />

          <GruppoRivelato className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {correlati.map((altro) => (
              <FiglioRivelato key={altro.id}>
                <article className="group relative flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <Image
                      src={altro.immagine}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 30vw, 92vw"
                      className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <p className="text-[0.72rem] font-semibold tracking-[0.16em] text-accento uppercase">
                      {NOMI_CATEGORIA_ARTICOLO[altro.categoria]}
                    </p>
                    <h3 className="mt-3 text-[1.05rem] leading-snug font-semibold">
                      <Link href={`/blog/${altro.slug}`} className="after:absolute after:inset-0">
                        {altro.titolo}
                      </Link>
                    </h3>
                    <p className="mt-auto pt-4 text-[0.78rem] text-tenue">
                      {dataEstesa(altro.data)} · {altro.minutiLettura} min
                    </p>
                  </div>
                </article>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>
        </Sezione>
      )}

      <Invito
        titolo="Un dubbio su cui vorreste una risposta?"
        testo="Scriveteci: se la domanda torna spesso, diventa il prossimo articolo."
      />
    </>
  )
}
