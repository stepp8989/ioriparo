import Image from 'next/image'
import Link from 'next/link'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Icona } from '@/componenti/ui/Icona'
import {
  NOMI_ALIMENTAZIONE,
  NOMI_CAMBIO,
  NOMI_CONDIZIONE,
  type Veicolo,
} from '@/lib/tipi'
import { chilometri, classi, prezzo, titoloVeicolo } from '@/lib/utili'

/**
 * Scheda di un veicolo nella griglia del catalogo.
 *
 * Le tre informazioni che decidono un clic — anno, chilometri, alimentazione —
 * stanno sempre nello stesso posto, così l'occhio le confronta scorrendo la
 * griglia senza doverle cercare scheda per scheda.
 */
export function SchedaVeicolo({
  veicolo,
  priorita = false,
  className,
}: {
  veicolo: Veicolo
  /** Da attivare sulle prime schede visibili: evita il ritardo dell'immagine. */
  priorita?: boolean
  className?: string
}) {
  const titolo = titoloVeicolo(veicolo)
  const sconto =
    veicolo.prezzoPrecedente && veicolo.prezzoPrecedente > veicolo.prezzo
      ? Math.round((1 - veicolo.prezzo / veicolo.prezzoPrecedente) * 100)
      : null

  return (
    <article
      className={classi(
        'group relative flex flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo',
        className,
      )}
    >
      <div className="relative aspect-[3/2] overflow-hidden bg-antracite">
        <Image
          src={veicolo.immagini[0]}
          alt={titolo}
          fill
          sizes="(min-width: 1280px) 30vw, (min-width: 768px) 45vw, 92vw"
          priority={priorita}
          className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />

        <div className="absolute inset-x-3 top-3 flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <Etichetta tono="scuro">{NOMI_CONDIZIONE[veicolo.condizione]}</Etichetta>
            {sconto && <Etichetta tono="pieno">−{sconto}%</Etichetta>}
          </div>

          {veicolo.stato !== 'disponibile' && (
            <Etichetta tono={veicolo.stato === 'venduto' ? 'rosso' : 'ambra'}>
              {veicolo.stato === 'venduto' ? 'Venduto' : 'Prenotato'}
            </Etichetta>
          )}
        </div>

        {veicolo.noleggio && (
          <div className="absolute right-3 bottom-3">
            <Etichetta tono="scuro">
              <Icona nome="chiave" className="size-3" />
              Anche a noleggio
            </Etichetta>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-accento uppercase">
          {veicolo.marca}
        </p>

        <h3 className="mt-2 text-[1.15rem] leading-snug font-semibold">
          <Link href={`/catalogo/${veicolo.slug}`} className="after:absolute after:inset-0">
            {veicolo.modello} {veicolo.allestimento}
          </Link>
        </h3>

        <dl className="mt-5 grid grid-cols-3 gap-3 border-y border-bordo py-4 text-center">
          <div>
            <dt className="text-[0.68rem] tracking-[0.1em] text-tenue uppercase">Anno</dt>
            <dd className="mt-1 text-[0.9rem] font-semibold tabellare">{veicolo.anno}</dd>
          </div>
          <div className="border-x border-bordo">
            <dt className="text-[0.68rem] tracking-[0.1em] text-tenue uppercase">Km</dt>
            <dd className="mt-1 text-[0.9rem] font-semibold tabellare">
              {veicolo.chilometri === 0 ? '0' : chilometri(veicolo.chilometri).replace(' km', '')}
            </dd>
          </div>
          <div>
            <dt className="text-[0.68rem] tracking-[0.1em] text-tenue uppercase">Cambio</dt>
            <dd className="mt-1 text-[0.9rem] font-semibold">
              {NOMI_CAMBIO[veicolo.cambio].slice(0, 4)}.
            </dd>
          </div>
        </dl>

        <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.82rem] text-tenue">
          <span className="inline-flex items-center gap-1.5">
            <Icona nome="benzina" className="size-3.5" />
            {NOMI_ALIMENTAZIONE[veicolo.alimentazione]}
          </span>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1.5">
            <Icona nome="fulmine" className="size-3.5" />
            {veicolo.potenzaCv} CV
          </span>
        </p>

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          <div>
            {veicolo.prezzoPrecedente && (
              <p className="text-[0.85rem] text-tenue line-through tabellare">
                {prezzo(veicolo.prezzoPrecedente)}
              </p>
            )}
            <p className="font-titolo text-[1.5rem] leading-none font-semibold tabellare">
              {prezzo(veicolo.prezzo)}
            </p>
          </div>

          <span className="inline-flex size-11 items-center justify-center rounded-full border border-bordo text-tenue transition-all duration-400 group-hover:border-accento group-hover:bg-accento group-hover:text-white">
            <Icona nome="freccia" className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
