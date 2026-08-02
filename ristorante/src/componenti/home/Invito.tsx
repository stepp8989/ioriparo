import Image from 'next/image'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { RISTORANTE } from '@/dati/ristorante'

/**
 * Invito finale alla prenotazione.
 *
 * È l'ultima cosa che si legge prima del piè di pagina: propone i tre modi di
 * prenotare — modulo, telefono e WhatsApp — perché non tutti gli ospiti hanno
 * la stessa abitudine.
 */
export function Invito() {
  return (
    <section className="relative overflow-hidden bg-notte text-white">
      <Image
        src="/immagini/ambienti/invito.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-30"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-notte via-notte/85 to-notte/60" aria-hidden />

      <div className="contenitore relative py-24 text-center sm:py-32">
        <Rivela da="nessuna">
          <p className="mb-6 flex items-center justify-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em] text-accento-tenue">
            <span className="filetto rotate-180" aria-hidden />
            Vi aspettiamo
            <span className="filetto" aria-hidden />
          </p>
        </Rivela>

        <Rivela ritardo={0.05}>
          <h2 className="mx-auto max-w-3xl text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Il vostro tavolo è pronto, <em className="testo-oro not-italic">manca solo la data</em>
          </h2>
        </Rivela>

        <Rivela ritardo={0.1}>
          <p className="mx-auto mt-7 max-w-xl leading-relaxed text-white/65">
            Prenotate in meno di un minuto: la conferma arriva subito. Per gruppi oltre i{' '}
            {RISTORANTE.massimoPersoneOnline} coperti e per le cene private in cantina, scriveteci.
          </p>
        </Rivela>

        <Rivela ritardo={0.15}>
          <div className="mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Bottone href="/prenota" misura="grande" className="w-full sm:w-auto">
              Prenota un tavolo
              <Icona
                nome="freccia"
                className="size-4 transition-transform duration-500 group-hover:translate-x-1"
              />
            </Bottone>

            <Bottone
              href={`tel:${RISTORANTE.telefonoLink}`}
              variante="chiaro"
              misura="grande"
              className="w-full sm:w-auto"
            >
              <Icona nome="telefono" className="size-4" />
              {RISTORANTE.telefono}
            </Bottone>
          </div>
        </Rivela>
      </div>
    </section>
  )
}
