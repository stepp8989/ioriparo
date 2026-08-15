import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { Invito } from '@/componenti/home/Offerte'
import { Icona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { SERVIZI } from '@/dati/servizi'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Tutti i servizi',
  descrizione:
    'Vendita auto e moto, noleggio a breve e lungo termine, car detailing, sanificazione, ' +
    'lucidatura, protezione ceramica, finanziamenti, permuta e assistenza post vendita con ' +
    'officina interna.',
  percorso: '/servizi',
})

export default function PaginaServizi() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Servizi', percorso: '/servizi' }])),
        }}
      />

      <Intestazione
        soprattitolo="I servizi"
        titolo={
          <>
            Dodici servizi,
            <br />
            <span className="testo-accento">un solo interlocutore</span>
          </>
        }
        sottotitolo="Dalla scelta del veicolo alla cura che merita negli anni. Tutto sotto lo stesso tetto significa che chi vi vende l’auto può chiedere a chi ci ha messo le mani, e la risposta arriva nello stesso pomeriggio."
        immagine="/immagini/azienda/salone.jpg"
        briciole={[{ nome: 'Servizi', percorso: '/servizi' }]}
      />

      <Sezione className="bg-sfondo">
        <GruppoRivelato className="space-y-6">
          {SERVIZI.map((servizio, indice) => (
            <FiglioRivelato key={servizio.id}>
              <article
                id={servizio.id}
                className="group grid items-center gap-8 overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-shadow duration-500 hover:shadow-rilievo lg:grid-cols-2"
              >
                <div
                  className={
                    indice % 2 === 0
                      ? 'relative aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[19rem]'
                      : 'relative aspect-[16/10] lg:order-2 lg:aspect-auto lg:h-full lg:min-h-[19rem]'
                  }
                >
                  <Image
                    src={servizio.immagine}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 46vw, 92vw"
                    className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
                  />
                </div>

                <div className="p-7 sm:p-10">
                  <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-accento/10 text-accento">
                    <Icona nome={servizio.icona} className="size-5" />
                  </span>

                  <h2 className="mt-5 font-titolo text-[1.5rem] font-semibold">{servizio.nome}</h2>
                  <p className="mt-1 text-[0.9rem] font-medium text-accento">{servizio.sommario}</p>
                  <p className="mt-4 text-[0.95rem] leading-relaxed text-tenue">
                    {servizio.descrizione}
                  </p>

                  <Link
                    href={servizio.link}
                    className="mt-6 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-accento sottolinea"
                  >
                    Scopri di più
                    <Icona nome="freccia" className="size-4" />
                  </Link>
                </div>
              </article>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      <Sezione className="border-t border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Officina interna"
          titolo="L’assistenza non finisce alla consegna"
          sottotitolo="Tagliandi, revisioni, gomme, diagnosi elettronica e riparazioni senza perdere la garanzia della casa madre. Preventivo sempre approvato prima di mettere le mani sul veicolo."
        />

        <GruppoRivelato className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icona: 'chiaveInglese', titolo: 'Tagliandi', testo: 'Con ricambi originali o equivalenti certificati, a scelta vostra.' },
            { icona: 'motore', titolo: 'Diagnosi', testo: 'Strumenti multimarca, stampa degli errori sempre allegata.' },
            { icona: 'strada', titolo: 'Gomme', testo: 'Montaggio, equilibratura, convergenza e custodia stagionale.' },
            { icona: 'documento', titolo: 'Revisioni', testo: 'Prenotazione, accompagnamento e ritiro del veicolo.' },
          ].map((voce) => (
            <FiglioRivelato
              key={voce.titolo}
              className="rounded-ampio border border-bordo bg-superficie p-6"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accento/10 text-accento">
                <Icona nome={voce.icona as 'chiaveInglese'} className="size-5" />
              </span>
              <h3 className="mt-5 font-titolo text-[1.05rem] font-semibold">{voce.titolo}</h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">{voce.testo}</p>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      <Invito />
    </>
  )
}
