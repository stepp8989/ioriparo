import type { Metadata } from 'next'
import Image from 'next/image'
import { Contatore } from '@/componenti/animazioni/Contatore'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Invito } from '@/componenti/home/Offerte'
import { Icona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { SQUADRA, STORIA, VALORI } from '@/dati/contenuti'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Chi siamo',
  descrizione: `Dal ${AZIENDA.fondata} a ${AZIENDA.indirizzo.citta}: la storia, i valori e le persone di ${AZIENDA.nomeCompleto}. Officina, salone e reparto detailing interni, ${AZIENDA.numeri.veicoliConsegnati} veicoli consegnati.`,
  percorso: '/chi-siamo',
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

      <Intestazione
        soprattitolo={`Dal ${AZIENDA.fondata}`}
        titolo={
          <>
            Un’officina diventata
            <br />
            <span className="testo-accento">concessionaria</span>
          </>
        }
        sottotitolo="Abbiamo cominciato con una fossa e un compressore preso a rate. Oggi occupiamo duemila metri quadri fra salone, officina e reparto estetico, ma il modo di lavorare è rimasto quello."
        immagine="/immagini/azienda/officina.jpg"
        briciole={[{ nome: 'Chi siamo', percorso: '/chi-siamo' }]}
      />

      {/* Missione */}
      <Sezione className="bg-sfondo">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Rivela>
            <TitoloSezione
              soprattitolo="La nostra missione"
              titolo={
                <>
                  Vendere veicoli che
                  <br />
                  <span className="testo-accento">terremmo per noi</span>
                </>
              }
              allineamento="sinistra"
            />

            <div className="mt-8 space-y-5 text-[1rem] leading-relaxed text-tenue">
              <p>
                In vent’anni abbiamo imparato che la differenza non la fa il prezzo esposto, ma
                quello che succede dopo: un tagliando saltato, una garanzia che non copre, un
                venditore che sparisce.
              </p>
              <p>
                Per questo ogni veicolo passa dal ponte prima che dal piazzale, ogni usato viene
                consegnato con il fascicolo completo dei controlli, e chi vi vende l’auto è la
                stessa persona che risponde al telefono l’anno dopo.
              </p>
              <p>
                Non è una promessa commerciale: è l’unico modo di lavorare che funziona in un paese
                dove ci si conosce tutti.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-bordo pt-8">
              {[
                { valore: AZIENDA.numeri.anniAttivita, etichetta: 'Anni' },
                { valore: AZIENDA.numeri.veicoliConsegnati, etichetta: 'Veicoli consegnati' },
                { valore: 14, etichetta: 'Persone' },
              ].map((numero) => (
                <div key={numero.etichetta}>
                  <dt className="sr-only">{numero.etichetta}</dt>
                  <dd>
                    <span className="block font-titolo text-[2rem] leading-none font-semibold">
                      <Contatore valore={numero.valore} className="tabellare" />
                    </span>
                    <span className="mt-2 block text-[0.72rem] tracking-[0.16em] text-tenue uppercase">
                      {numero.etichetta}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </Rivela>

          <Rivela da="sinistra" className="grid gap-4 sm:grid-cols-2">
            <div className="relative aspect-[3/4] overflow-hidden rounded-ampio">
              <Image
                src="/immagini/azienda/salone.jpg"
                alt="Il salone"
                fill
                sizes="(min-width: 1024px) 23vw, 46vw"
                className="object-cover"
              />
            </div>
            <div className="relative aspect-[3/4] overflow-hidden rounded-ampio sm:translate-y-10">
              <Image
                src="/immagini/azienda/cabina.jpg"
                alt="La cabina del reparto detailing"
                fill
                sizes="(min-width: 1024px) 23vw, 46vw"
                className="object-cover"
              />
            </div>
          </Rivela>
        </div>
      </Sezione>

      {/* Storia */}
      <Sezione className="relative overflow-hidden border-y border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="La storia"
          titolo="Come siamo arrivati fin qui"
          sottotitolo="Cinque tappe, nessuna delle quali programmata a tavolino."
        />

        <GruppoRivelato className="mx-auto mt-16 max-w-3xl">
          {STORIA.map((tappa, indice) => (
            <FiglioRivelato key={tappa.anno} className="relative flex gap-8 pb-12 last:pb-0">
              {/* Filo verticale che collega le tappe. */}
              {indice < STORIA.length - 1 && (
                <span
                  className="absolute top-14 bottom-0 left-[2.35rem] w-px bg-bordo"
                  aria-hidden
                />
              )}

              <span className="relative z-10 inline-flex size-[4.7rem] shrink-0 items-center justify-center rounded-full border border-bordo bg-superficie font-titolo text-[0.95rem] font-semibold shadow-morbida tabellare">
                {tappa.anno}
              </span>

              <div className="pt-3">
                <h3 className="font-titolo text-[1.25rem] font-semibold">{tappa.titolo}</h3>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-tenue">{tappa.testo}</p>
              </div>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Valori */}
      <Sezione className="relative overflow-hidden bg-notte text-white">
        <div className="griglia-tecnica absolute inset-0" aria-hidden />

        <div className="relative">
          <TitoloSezione
            soprattitolo="I valori"
            titolo="Quattro regole, mai scritte da nessuna parte"
            sottotitolo="Finché non abbiamo dovuto metterle su un sito."
            chiaro
          />

          <GruppoRivelato className="mt-16 grid gap-8 sm:grid-cols-2">
            {VALORI.map((valore) => (
              <FiglioRivelato
                key={valore.titolo}
                className="rounded-ampio border border-white/10 bg-white/5 p-7 backdrop-blur-sm"
              >
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accento/20 text-accento-forte">
                  <Icona nome={valore.icona} className="size-5" />
                </span>
                <h3 className="mt-5 font-titolo text-[1.2rem] font-semibold">{valore.titolo}</h3>
                <p className="mt-3 text-[0.92rem] leading-relaxed text-white/60">{valore.testo}</p>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>
        </div>
      </Sezione>

      {/* Squadra */}
      <Sezione className="bg-sfondo">
        <TitoloSezione
          soprattitolo="La squadra"
          titolo={
            <>
              Le persone che <span className="testo-accento">incontrerete</span>
            </>
          }
          sottotitolo="Quattordici in tutto fra salone, officina, reparto estetico e amministrazione. Questi sono i responsabili."
        />

        <GruppoRivelato className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {SQUADRA.map((persona) => (
            <FiglioRivelato key={persona.nome}>
              <figure className="group overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
                <div className="relative aspect-[4/5] overflow-hidden bg-antracite">
                  <Image
                    src={persona.immagine}
                    alt={persona.nome}
                    fill
                    sizes="(min-width: 1024px) 23vw, (min-width: 640px) 46vw, 92vw"
                    className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                  />
                </div>
                <figcaption className="p-6">
                  <p className="font-titolo text-[1.1rem] font-semibold">{persona.nome}</p>
                  <p className="mt-1 text-[0.8rem] font-medium text-accento">{persona.ruolo}</p>
                  <p className="mt-3 text-[0.86rem] leading-relaxed text-tenue">
                    {persona.descrizione}
                  </p>
                </figcaption>
              </figure>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      <Invito
        titolo="Venite a trovarci"
        testo="Il salone è aperto dal lunedì al sabato. Non serve appuntamento per dare un’occhiata: serve solo per il test drive."
      />
    </>
  )
}
