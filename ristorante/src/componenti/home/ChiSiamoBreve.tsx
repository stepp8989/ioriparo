import Image from 'next/image'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { Contatore } from '@/componenti/animazioni/Contatore'
import { NUMERI } from '@/dati/contenuti'
import { RISTORANTE } from '@/dati/ristorante'

/**
 * Presentazione breve del ristorante nella home, con due fotografie
 * sovrapposte e i numeri che raccontano l'attività.
 */
export function ChiSiamoBreve() {
  return (
    <section id="chi-siamo" className="scroll-mt-24 py-24 sm:py-32 lg:py-36">
      <div className="contenitore grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        {/* Immagini */}
        <Rivela da="destra" className="relative">
          <div className="relative aspect-[4/5] overflow-hidden">
            <Image
              src="/immagini/ambienti/chi-siamo.jpg"
              alt="Il bancone e la sala di Aurea in penombra"
              fill
              sizes="(min-width: 1024px) 45vw, 90vw"
              className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.04]"
            />
          </div>

          {/* Seconda immagine sfalsata: solo da tablet in su, per non affollare il telefono */}
          <div className="absolute -right-4 -bottom-10 hidden aspect-4/3 w-52 overflow-hidden border-8 border-sfondo shadow-rilievo sm:block lg:w-64">
            <Image
              src="/immagini/ambienti/chi-siamo-storia.jpg"
              alt="Dettaglio di una mise en place"
              fill
              sizes="16rem"
              className="object-cover"
            />
          </div>

          {/* Anno di fondazione */}
          <div className="absolute -top-6 -left-6 hidden size-28 place-items-center rounded-full bg-accento font-titolo text-white shadow-rilievo lg:grid">
            <span className="text-center leading-tight">
              <span className="block text-[0.6rem] uppercase tracking-[0.2em] opacity-80">dal</span>
              <span className="block text-2xl">{RISTORANTE.fondato}</span>
            </span>
          </div>
        </Rivela>

        {/* Testo */}
        <div>
          <Rivela da="nessuna">
            <p className="mb-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento">
              Chi siamo
              <span className="filetto" aria-hidden />
            </p>
          </Rivela>

          <Rivela ritardo={0.05}>
            <h2 className="text-4xl leading-[1.1] sm:text-5xl">
              Ventisette anni nella stessa strada, <em className="testo-oro not-italic">una sola idea</em>
            </h2>
          </Rivela>

          <Rivela ritardo={0.1}>
            <div className="mt-7 space-y-5 text-[1.02rem] leading-relaxed text-tenue">
              <p>
                Aurea nasce nel {RISTORANTE.fondato} come trattoria di famiglia: dodici coperti, un
                forno a legna e la convinzione che una buona cena cominci molto prima del servizio,
                al mercato, la mattina presto.
              </p>
              <p>
                Da allora la sala è cresciuta e la cucina si è aperta al contemporaneo, ma il metodo
                non è cambiato. Scegliamo prima il produttore, poi la ricetta. Facciamo in casa
                fondi, paste e lievitati. E lasciamo che sia il piatto a parlare.
              </p>
            </div>
          </Rivela>

          <Rivela ritardo={0.15}>
            <div className="mt-10">
              <Bottone href="/chi-siamo" variante="contorno">
                La nostra storia
              </Bottone>
            </div>
          </Rivela>

          {/* Numeri */}
          <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-bordo pt-10 sm:grid-cols-4">
            {NUMERI.map((numero, indice) => (
              <Rivela key={numero.etichetta} ritardo={0.05 * indice}>
                <div>
                  <dt className="sr-only">{numero.etichetta}</dt>
                  <dd>
                    <span className="block font-titolo text-4xl text-accento">
                      <Contatore valore={numero.valore} suffisso={numero.suffisso} />
                    </span>
                    <span className="mt-1 block text-xs uppercase tracking-[0.14em] text-tenue">
                      {numero.etichetta}
                    </span>
                  </dd>
                </div>
              </Rivela>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
