import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Valutazione da 0 a 10, mostrata su cinque stelle.
 *
 * La stella parziale è ottenuta sovrapponendo la versione piena ritagliata a
 * quella vuota: niente mezze stelle disegnate a parte, e la precisione resta
 * al decimo anche a dimensioni piccole.
 */
export function Stelle({
  valore,
  className,
  mostraNumero = true,
}: {
  /** Valutazione in decimi, come nel catalogo. */
  valore: number
  className?: string
  mostraNumero?: boolean
}) {
  const suCinque = Math.max(0, Math.min(5, valore / 2))

  return (
    <span className={classi('inline-flex items-center gap-2', className)}>
      <span className="relative inline-flex" aria-hidden>
        <span className="inline-flex text-bordo-forte">
          {Array.from({ length: 5 }, (_, indice) => (
            <Icona key={indice} nome="stella" className="size-4" pieno />
          ))}
        </span>
        <span
          className="absolute inset-0 inline-flex overflow-hidden text-attesa"
          style={{ width: `${(suCinque / 5) * 100}%` }}
        >
          {Array.from({ length: 5 }, (_, indice) => (
            <Icona key={indice} nome="stella" className="size-4 shrink-0" pieno />
          ))}
        </span>
      </span>

      {mostraNumero && (
        <span className="tabellare text-[0.82rem] font-semibold text-tenue">
          {valore.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
      )}

      <span className="sr-only">Valutazione {valore} su 10</span>
    </span>
  )
}
