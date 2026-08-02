import Image from 'next/image'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { TitoloSezione } from '@/componenti/ui/Sezione'
import { leggi } from '@/lib/archivio'
import { dataEstesa } from '@/lib/utili'

/**
 * Eventi e promozioni in corso.
 *
 * La sezione sparisce del tutto quando non c'è niente di attivo: meglio una
 * pagina più corta che tre riquadri vuoti.
 */
export async function Eventi() {
  const { eventi } = await leggi()
  const attivi = eventi.filter((evento) => evento.attivo)

  if (attivi.length === 0) return null

  return (
    <section className="py-24 sm:py-32">
      <div className="contenitore">
        <TitoloSezione
          soprattitolo="Appuntamenti"
          titolo={
            <>
              Eventi e <em className="testo-oro not-italic">promozioni</em>
            </>
          }
          sottotitolo="Serate a tema, menù di stagione e proposte dedicate. Su prenotazione, fino a esaurimento posti."
        />

        <GruppoRivelato className="mt-16 grid gap-7 md:grid-cols-3">
          {attivi.map((evento) => (
            <FiglioRivelato key={evento.id} come="article">
              <div className="group h-full overflow-hidden border border-bordo bg-superficie transition-all duration-500 hover:-translate-y-1.5 hover:border-accento-tenue hover:shadow-rilievo">
                <div className="relative aspect-3/2 overflow-hidden">
                  <Image
                    src={evento.immagine}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 32vw, 92vw"
                    className="object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-notte/70 to-transparent" aria-hidden />

                  <p className="absolute bottom-4 left-5 text-[0.65rem] font-medium uppercase tracking-[0.22em] text-accento-tenue">
                    {evento.sottotitolo}
                  </p>
                </div>

                <div className="p-6">
                  <h3 className="font-titolo text-2xl leading-tight">{evento.titolo}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-tenue">{evento.descrizione}</p>
                  <p className="mt-5 border-t border-bordo pt-4 text-xs uppercase tracking-[0.14em] text-tenue">
                    <time dateTime={evento.data}>{dataEstesa(evento.data)}</time>
                  </p>
                </div>
              </div>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </div>
    </section>
  )
}
