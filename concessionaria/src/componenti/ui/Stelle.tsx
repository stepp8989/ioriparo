import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Valutazione in stelle.
 *
 * Le stelle sono decorative: il voto vero sta nell'etichetta accessibile, così
 * chi usa un lettore di schermo sente «4,8 su 5» invece di cinque icone.
 */
export function Stelle({
  voto,
  className,
  misura = 'size-4',
}: {
  voto: number
  className?: string
  misura?: string
}) {
  const piene = Math.round(voto)

  return (
    <span
      className={classi('inline-flex items-center gap-0.5 text-amber-400', className)}
      role="img"
      aria-label={`${voto.toLocaleString('it-IT')} stelle su 5`}
    >
      {[1, 2, 3, 4, 5].map((posizione) => (
        <Icona
          key={posizione}
          nome={posizione <= piene ? 'stella' : 'stellaVuota'}
          className={classi(misura, posizione > piene && 'opacity-35')}
        />
      ))}
    </span>
  )
}
