import Image from 'next/image'
import Link from 'next/link'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { Icona } from '@/componenti/ui/Icona'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { SERVIZI } from '@/dati/servizi'

/**
 * I dodici servizi, in griglia.
 *
 * Le prime quattro schede sono più grandi: sono i reparti che portano la
 * maggior parte del fatturato, e la gerarchia visiva lo rispecchia invece di
 * trattare tutto allo stesso modo.
 */
export function Servizi() {
  const principali = SERVIZI.slice(0, 4)
  const altri = SERVIZI.slice(4)

  return (
    <Sezione id="servizi" className="bg-sfondo">
      <TitoloSezione
        soprattitolo="Cosa facciamo"
        titolo={
          <>
            Un solo interlocutore,
            <br />
            <span className="testo-accento">dodici servizi</span>
          </>
        }
        sottotitolo="Dalla scelta del veicolo alla cura che merita negli anni: vendita, noleggio, detailing, finanziamenti e officina sotto lo stesso tetto."
      />

      <GruppoRivelato className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {principali.map((servizio) => (
          <FiglioRivelato key={servizio.id}>
            <Link
              href={servizio.link}
              className="group relative flex h-full min-h-[22rem] flex-col justify-end overflow-hidden rounded-ampio border border-bordo shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo"
            >
              <Image
                src={servizio.immagine}
                alt=""
                fill
                sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-notte via-notte/55 to-transparent" />

              <div className="relative p-7">
                <span className="mb-5 inline-flex size-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur-sm transition-colors duration-500 group-hover:border-accento group-hover:bg-accento">
                  <Icona nome={servizio.icona} className="size-5" />
                </span>
                <h3 className="font-titolo text-[1.25rem] font-semibold text-white">
                  {servizio.nome}
                </h3>
                <p className="mt-2 text-[0.88rem] text-white/65">{servizio.sommario}</p>
              </div>
            </Link>
          </FiglioRivelato>
        ))}
      </GruppoRivelato>

      <GruppoRivelato className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {altri.map((servizio) => (
          <FiglioRivelato key={servizio.id}>
            <Link
              href={servizio.link}
              className="group flex h-full items-start gap-4 rounded-morbido border border-bordo bg-superficie p-5 transition-all duration-400 hover:-translate-y-0.5 hover:border-accento/40 hover:shadow-morbida"
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accento/10 text-accento transition-colors duration-400 group-hover:bg-accento group-hover:text-white">
                <Icona nome={servizio.icona} className="size-[1.1rem]" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.98rem] font-semibold">{servizio.nome}</span>
                <span className="mt-1 block text-[0.8rem] leading-snug text-tenue">
                  {servizio.sommario}
                </span>
              </span>
            </Link>
          </FiglioRivelato>
        ))}
      </GruppoRivelato>
    </Sezione>
  )
}
