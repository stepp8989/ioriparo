import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { TitoloSezione } from '@/componenti/ui/Sezione'
import { SchedaPiatto } from '@/componenti/menu/SchedaPiatto'
import { leggi } from '@/lib/archivio'

/**
 * I piatti più richiesti.
 *
 * L'elenco non è scritto nel codice: mostra i piatti che lo staff ha marcato
 * «in evidenza» dal pannello di amministrazione, quindi cambia con il menù.
 */
export async function PiattiRichiesti() {
  const { piatti } = await leggi()

  const evidenza = piatti
    .filter((piatto) => piatto.visibile && piatto.inEvidenza)
    .sort((primo, secondo) => primo.ordine - secondo.ordine)
    .slice(0, 6)

  if (evidenza.length === 0) return null

  return (
    <section className="bg-sfondo-alt py-24 sm:py-32">
      <div className="contenitore">
        <TitoloSezione
          soprattitolo="Dalla carta"
          titolo={
            <>
              I piatti più <em className="testo-oro not-italic">richiesti</em>
            </>
          }
          sottotitolo="Quelli che tornano su ogni tavolo, sera dopo sera. La carta completa cambia con le stagioni."
        />

        <GruppoRivelato className="mt-16 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {evidenza.map((piatto) => (
            <FiglioRivelato key={piatto.id} come="div">
              <SchedaPiatto piatto={piatto} />
            </FiglioRivelato>
          ))}
        </GruppoRivelato>

        <Rivela ritardo={0.1} className="mt-14 text-center">
          <Bottone href="/menu" variante="contorno" misura="grande">
            Guarda il menù completo
          </Bottone>
        </Rivela>
      </div>
    </section>
  )
}
