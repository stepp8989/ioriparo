import { Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { TitoloSezione } from '@/componenti/ui/Sezione'
import { Mosaico } from '@/componenti/galleria/Mosaico'
import { GALLERIA } from '@/dati/contenuti'

/** Anteprima della galleria: sei scatti, poi il rimando alla pagina completa. */
export function GalleriaBreve() {
  return (
    <section className="py-24 sm:py-32">
      <div className="contenitore">
        <TitoloSezione
          soprattitolo="Galleria"
          titolo={
            <>
              La sala, la cucina, <em className="testo-oro not-italic">le mani</em>
            </>
          }
          sottotitolo="Qualche scatto per capire dove state per sedervi."
        />

        <div className="mt-16">
          <Mosaico scatti={GALLERIA.slice(0, 6)} />
        </div>

        <Rivela ritardo={0.1} className="mt-12 text-center">
          <Bottone href="/galleria" variante="contorno" misura="grande">
            Tutte le fotografie
          </Bottone>
        </Rivela>
      </div>
    </section>
  )
}
