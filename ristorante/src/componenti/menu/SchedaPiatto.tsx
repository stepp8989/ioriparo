import Image from 'next/image'
import type { Piatto } from '@/lib/tipi'
import { classi, prezzo } from '@/lib/utili'

/** Etichetta promozionale: dorata per «Consigliato», scura per «Novità». */
export function EtichettaPiatto({ tipo }: { tipo: NonNullable<Piatto['etichetta']> }) {
  const consigliato = tipo === 'consigliato'
  return (
    <span
      className={classi(
        'inline-flex items-center px-3 py-1 text-[0.6rem] font-medium uppercase tracking-[0.18em]',
        consigliato ? 'bg-accento text-white scuro:text-notte' : 'bg-notte text-accento-tenue',
      )}
    >
      {consigliato ? 'Consigliato' : 'Novità'}
    </span>
  )
}

/** Elenco degli allergeni, obbligatorio per legge accanto a ogni preparazione. */
function Allergeni({ elenco }: { elenco: Piatto['allergeni'] }) {
  if (elenco.length === 0) {
    return <p className="text-xs text-tenue">Senza allergeni fra i quattordici principali.</p>
  }

  return (
    <p className="text-xs text-tenue">
      <span className="font-medium">Allergeni:</span> {elenco.join(', ')}
    </p>
  )
}

/**
 * Scheda di un piatto.
 *
 * Due impaginati per lo stesso contenuto:
 *   • `carta` — fotografia grande sopra il testo, per le sezioni in evidenza;
 *   • `riga` — miniatura a sinistra e prezzo a destra, per la carta completa,
 *     dove contano densità e scorrevolezza della lettura.
 */
export function SchedaPiatto({
  piatto,
  formato = 'carta',
  priorita = false,
}: {
  piatto: Piatto
  formato?: 'carta' | 'riga'
  priorita?: boolean
}) {
  if (formato === 'riga') {
    return (
      <article className="group flex gap-5 border-b border-bordo py-6 last:border-b-0">
        <div className="relative size-24 shrink-0 overflow-hidden sm:size-28">
          <Image
            src={piatto.immagine}
            alt={piatto.nome}
            fill
            sizes="7rem"
            loading={priorita ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-[1.2s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
            <h3 className="font-titolo text-2xl leading-tight">{piatto.nome}</h3>
            {piatto.etichetta && <EtichettaPiatto tipo={piatto.etichetta} />}

            {/* Filetto puntinato fra nome e prezzo, come sulle carte stampate */}
            <span
              className="mt-2 hidden h-px min-w-8 flex-1 self-center border-b border-dashed border-bordo-forte sm:block"
              aria-hidden
            />

            <span className="ml-auto font-titolo text-2xl whitespace-nowrap text-accento sm:ml-0">
              {prezzo(piatto.prezzo)}
            </span>
          </div>

          <p className="mt-2 text-sm leading-relaxed text-tenue">{piatto.descrizione}</p>
          <div className="mt-2">
            <Allergeni elenco={piatto.allergeni} />
          </div>
        </div>
      </article>
    )
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden border border-bordo bg-superficie transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-accento-tenue hover:shadow-rilievo">
      <div className="relative aspect-4/3 overflow-hidden">
        <Image
          src={piatto.immagine}
          alt={piatto.nome}
          fill
          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
          priority={priorita}
          className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.07]"
        />

        {/* Sfumatura che compare al passaggio: dà profondità senza pesare sul testo */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-notte/55 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          aria-hidden
        />

        {piatto.etichetta && (
          <span className="absolute top-4 left-4">
            <EtichettaPiatto tipo={piatto.etichetta} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-titolo text-2xl leading-tight">{piatto.nome}</h3>
          <span className="font-titolo text-2xl whitespace-nowrap text-accento">
            {prezzo(piatto.prezzo)}
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-tenue">{piatto.descrizione}</p>

        <div className="mt-5 border-t border-bordo pt-4">
          <Allergeni elenco={piatto.allergeni} />
        </div>
      </div>
    </article>
  )
}
