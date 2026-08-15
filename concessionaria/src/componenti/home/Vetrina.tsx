import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { SchedaVeicolo } from '@/componenti/veicoli/SchedaVeicolo'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import type { Veicolo } from '@/lib/tipi'

/**
 * Veicoli in evidenza.
 *
 * Mostra fino a sei schede scelte dal pannello con il contrassegno «in
 * vetrina»; se non ne bastano, completa con gli arrivi più recenti, così la
 * sezione non resta mai mezza vuota.
 */
export function Vetrina({ veicoli }: { veicoli: Veicolo[] }) {
  const disponibili = veicoli.filter((veicolo) => veicolo.visibile && veicolo.stato !== 'venduto')
  const inVetrina = disponibili.filter((veicolo) => veicolo.inVetrina)
  const completamento = disponibili
    .filter((veicolo) => !veicolo.inVetrina)
    .sort((a, b) => b.creatoIl.localeCompare(a.creatoIl))

  const scelti = [...inVetrina, ...completamento].slice(0, 6)

  if (scelti.length === 0) return null

  return (
    <Sezione className="bg-sfondo-alt">
      <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        <TitoloSezione
          soprattitolo="In pronta consegna"
          titolo={
            <>
              Le proposte <span className="testo-accento">del momento</span>
            </>
          }
          sottotitolo="Ogni veicolo è controllato in centoventi punti, con chilometraggio certificato e garanzia inclusa."
          allineamento="sinistra"
          className="md:max-w-2xl"
        />

        <Rivela da="sinistra" className="shrink-0">
          <Bottone href="/catalogo" variante="contorno">
            Tutto il catalogo
            <Icona nome="freccia" className="size-4" />
          </Bottone>
        </Rivela>
      </div>

      <GruppoRivelato className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {scelti.map((veicolo, indice) => (
          <FiglioRivelato key={veicolo.id}>
            <SchedaVeicolo veicolo={veicolo} priorita={indice < 3} className="h-full" />
          </FiglioRivelato>
        ))}
      </GruppoRivelato>
    </Sezione>
  )
}
