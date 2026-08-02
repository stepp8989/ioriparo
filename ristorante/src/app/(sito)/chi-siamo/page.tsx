import Image from 'next/image'
import { Copertina } from '@/componenti/ui/Copertina'
import { Invito } from '@/componenti/home/Invito'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { TitoloSezione } from '@/componenti/ui/Sezione'
import { SQUADRA, STORIA, VALORI } from '@/dati/contenuti'
import { RISTORANTE } from '@/dati/ristorante'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Chi siamo',
  descrizione:
    `La storia di ${RISTORANTE.nomeCompleto} dal ${RISTORANTE.fondato}: la missione, i valori, ` +
    'lo chef e la squadra che ogni giorno porta i piatti in sala.',
  percorso: '/chi-siamo',
  immagine: '/immagini/ambienti/chi-siamo-copertina.jpg',
})

export default function PaginaChiSiamo() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Chi siamo', percorso: '/chi-siamo' }])),
        }}
      />

      <Copertina
        soprattitolo={`Dal ${RISTORANTE.fondato}`}
        titolo="Chi siamo"
        sottotitolo="Una famiglia, una strada, ventisette anni di servizio. E l’idea che la cucina cominci molto prima del fornello."
        immagine="/immagini/ambienti/chi-siamo-copertina.jpg"
        briciole={[{ nome: 'Chi siamo', percorso: '/chi-siamo' }]}
      />

      {/* ── Missione ─────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="contenitore grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Rivela da="destra">
            <div className="relative aspect-4/5 overflow-hidden">
              <Image
                src="/immagini/ambienti/chi-siamo.jpg"
                alt="La sala di Aurea al momento dell’apertura"
                fill
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover"
              />
            </div>
          </Rivela>

          <div>
            <Rivela da="nessuna">
              <p className="mb-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento">
                La missione
                <span className="filetto" aria-hidden />
              </p>
            </Rivela>

            <Rivela ritardo={0.05}>
              <h2 className="text-4xl leading-[1.12] sm:text-5xl">
                Far mangiare bene le persone, <em className="testo-oro not-italic">senza cerimonie</em>
              </h2>
            </Rivela>

            <Rivela ritardo={0.1}>
              <div className="mt-7 space-y-5 text-[1.02rem] leading-relaxed text-tenue">
                <p>
                  Un ristorante non è un museo. Si viene per stare bene: per un compleanno, per
                  chiudere un contratto, per una sera qualunque in cui non si aveva voglia di
                  cucinare. Il nostro mestiere è fare in modo che, qualunque sia il motivo, quella
                  sera valga la pena di essere ricordata.
                </p>
                <p>
                  Perciò curiamo tanto la brace quanto il modo in cui vi accogliamo alla porta. Il
                  piatto è metà del lavoro; l’altra metà è il tempo che vi lasciamo per goderlo.
                </p>
              </div>
            </Rivela>
          </div>
        </div>
      </section>

      {/* ── Storia ───────────────────────────────────────────────────────── */}
      <section className="bg-sfondo-alt py-24 sm:py-32">
        <div className="contenitore">
          <TitoloSezione
            soprattitolo="La storia"
            titolo={
              <>
                Quattro passaggi, <em className="testo-oro not-italic">una direzione</em>
              </>
            }
          />

          <ol className="relative mx-auto mt-16 max-w-3xl">
            {/* Filo verticale che unisce le tappe */}
            <span
              className="absolute top-2 bottom-2 left-[7.5rem] hidden w-px bg-bordo-forte sm:block"
              aria-hidden
            />

            {STORIA.map((tappa, indice) => (
              <Rivela key={tappa.anno} da="sinistra" ritardo={indice * 0.08} come="li">
                <div className="relative flex flex-col gap-4 pb-12 last:pb-0 sm:flex-row sm:gap-12">
                  <span className="shrink-0 font-titolo text-3xl text-accento sm:w-24 sm:text-right">
                    {tappa.anno}
                  </span>

                  <span
                    className="absolute top-3 left-[7.5rem] hidden size-2.5 -translate-x-1/2 rounded-full bg-accento sm:block"
                    aria-hidden
                  />

                  <div className="sm:pl-8">
                    <h3 className="font-titolo text-2xl">{tappa.titolo}</h3>
                    <p className="mt-2 leading-relaxed text-tenue">{tappa.testo}</p>
                  </div>
                </div>
              </Rivela>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Valori ───────────────────────────────────────────────────────── */}
      <section className="py-24 sm:py-32">
        <div className="contenitore">
          <TitoloSezione
            soprattitolo="I valori"
            titolo={
              <>
                Quattro regole che non <em className="testo-oro not-italic">negoziamo</em>
              </>
            }
          />

          <GruppoRivelato className="mt-16 grid gap-px border border-bordo bg-bordo sm:grid-cols-2">
            {VALORI.map((valore, indice) => (
              <FiglioRivelato key={valore.titolo} come="article">
                <div className="h-full bg-sfondo p-8 transition-colors duration-500 hover:bg-superficie-alt sm:p-10">
                  <span className="font-titolo text-5xl text-accento/25">
                    {String(indice + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-4 font-titolo text-2xl">{valore.titolo}</h3>
                  <p className="mt-3 leading-relaxed text-tenue">{valore.testo}</p>
                </div>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>
        </div>
      </section>

      {/* ── Squadra ──────────────────────────────────────────────────────── */}
      <section className="bg-notte py-24 text-white sm:py-32">
        <div className="contenitore">
          <TitoloSezione
            chiaro
            soprattitolo="La squadra"
            titolo={
              <>
                Le persone <em className="testo-oro not-italic">dietro ai piatti</em>
              </>
            }
            sottotitolo="Diciotto persone fra cucina e sala. Questi sono i quattro che tengono il ritmo."
          />

          <GruppoRivelato className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {SQUADRA.map((persona) => (
              <FiglioRivelato key={persona.nome} come="article">
                <div className="group">
                  <div className="relative aspect-3/4 overflow-hidden">
                    <Image
                      src={persona.immagine}
                      alt={`${persona.nome}, ${persona.ruolo}`}
                      fill
                      sizes="(min-width: 1024px) 23vw, (min-width: 640px) 45vw, 90vw"
                      className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                    />
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-notte/85 via-transparent to-transparent"
                      aria-hidden
                    />
                  </div>

                  <h3 className="mt-5 font-titolo text-2xl">{persona.nome}</h3>
                  <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-accento">
                    {persona.ruolo}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-white/55">{persona.biografia}</p>
                </div>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>
        </div>
      </section>

      <Invito />
    </>
  )
}
