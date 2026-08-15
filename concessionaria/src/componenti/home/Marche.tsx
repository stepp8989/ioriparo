import type { Veicolo } from '@/lib/tipi'

/**
 * Fascia dei marchi trattati.
 *
 * L'elenco si ricava dai veicoli realmente in catalogo: non promettiamo marchi
 * che non abbiamo. La striscia scorre in continuo e si ferma al passaggio del
 * puntatore; il contenuto è duplicato perché lo scorrimento del 50% torni al
 * punto di partenza senza salti.
 */
export function Marche({ veicoli }: { veicoli: Veicolo[] }) {
  const marche = [...new Set(veicoli.filter((veicolo) => veicolo.visibile).map((v) => v.marca))].sort(
    (a, b) => a.localeCompare(b, 'it'),
  )

  if (marche.length < 4) return null

  return (
    <section className="overflow-hidden border-b border-bordo bg-sfondo py-10" aria-label="Marchi trattati">
      <p className="contenitore mb-7 text-center text-[0.68rem] tracking-[0.3em] text-tenue uppercase">
        Marchi trattati e assistiti
      </p>

      <div className="relative">
        {/* Sfumature laterali: la striscia entra ed esce senza tagli netti. */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-sfondo"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-sfondo"
          aria-hidden
        />

        <div className="scorrimento flex w-max gap-14">
          {[...marche, ...marche].map((marca, indice) => (
            <span
              key={`${marca}-${indice}`}
              // La seconda metà è una copia per la continuità: va nascosta ai
              // lettori di schermo, che altrimenti leggerebbero tutto due volte.
              aria-hidden={indice >= marche.length}
              className="font-titolo text-[1.25rem] font-semibold tracking-[0.14em] whitespace-nowrap text-tenue/55 uppercase"
            >
              {marca}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
