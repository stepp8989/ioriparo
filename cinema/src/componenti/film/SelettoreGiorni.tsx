import Link from 'next/link'
import { classi, etichettaGiorno, oggiIso } from '@/lib/utili'

/**
 * Calendario orizzontale dei giorni con spettacoli.
 *
 * Sono collegamenti veri, non pulsanti: la pagina degli orari di un dato
 * giorno ha un proprio indirizzo, si può condividere e viene disegnata dal
 * server. Costa una navigazione invece di un cambio di stato, e in cambio la
 * pagina funziona anche senza JavaScript e ogni giornata è indicizzabile.
 */
export function SelettoreGiorni({
  giorni,
  attivo,
  costruisciHref,
  className,
}: {
  giorni: string[]
  attivo: string
  costruisciHref: (giorno: string) => string
  className?: string
}) {
  if (giorni.length === 0) return null
  const oggi = oggiIso()

  return (
    <nav aria-label="Giorni di programmazione" className={classi('senza-barra overflow-x-auto', className)}>
      <ul className="flex gap-2">
        {giorni.map((giorno) => {
          const selezionato = giorno === attivo
          const data = new Date(`${giorno}T12:00:00`)

          return (
            <li key={giorno}>
              <Link
                href={costruisciHref(giorno)}
                scroll={false}
                aria-current={selezionato ? 'date' : undefined}
                className={classi(
                  'flex min-w-[5.5rem] flex-col items-center gap-0.5 rounded-tenue border px-4 py-3 transition-all duration-300',
                  selezionato
                    ? 'border-accento bg-accento text-white'
                    : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
                )}
              >
                <span className="text-[0.78rem] font-semibold">
                  {etichettaGiorno(giorno, oggi)}
                </span>
                <span className="tabellare text-[0.72rem] opacity-75">
                  {data.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
