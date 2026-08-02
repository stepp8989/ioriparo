import type { ReactNode } from 'react'
import { classi } from '@/lib/utili'
import { Rivela } from '@/componenti/animazioni/Rivela'

/**
 * Intestazione ricorrente delle sezioni: soprattitolo dorato, titolo in
 * carattere graziato e sottotitolo. Averla in un solo posto tiene allineati
 * spaziatura e ritmo tipografico in tutte le pagine.
 */
export function TitoloSezione({
  soprattitolo,
  titolo,
  sottotitolo,
  allineamento = 'centro',
  chiaro = false,
  className,
  livello = 2,
}: {
  soprattitolo?: string
  titolo: ReactNode
  sottotitolo?: ReactNode
  allineamento?: 'centro' | 'sinistra'
  /** Da attivare quando l'intestazione sta su un fondo scuro. */
  chiaro?: boolean
  className?: string
  livello?: 1 | 2 | 3
}) {
  const Titolo = `h${livello}` as 'h2'
  const centrato = allineamento === 'centro'

  return (
    <div
      className={classi(
        'max-w-3xl',
        centrato ? 'mx-auto text-center' : 'text-left',
        chiaro && 'text-white',
        className,
      )}
    >
      {soprattitolo && (
        <Rivela da="nessuna">
          <p
            className={classi(
              'mb-5 flex items-center gap-3 text-[0.7rem] font-medium uppercase tracking-[0.32em]',
              centrato && 'justify-center',
              chiaro ? 'text-accento-tenue' : 'text-accento',
            )}
          >
            {centrato && <span className="filetto rotate-180" aria-hidden />}
            {soprattitolo}
            <span className="filetto" aria-hidden />
          </p>
        </Rivela>
      )}

      <Rivela ritardo={0.06}>
        <Titolo className="text-balance text-4xl leading-[1.12] sm:text-5xl lg:text-[3.4rem]">
          {titolo}
        </Titolo>
      </Rivela>

      {sottotitolo && (
        <Rivela ritardo={0.12}>
          <div
            className={classi(
              'mt-6 text-[1.02rem] leading-relaxed',
              chiaro ? 'text-white/70' : 'text-tenue',
            )}
          >
            {sottotitolo}
          </div>
        </Rivela>
      )}
    </div>
  )
}

/** Contenitore di sezione con spaziatura verticale coerente. */
export function Sezione({
  children,
  id,
  className,
  ampiezza = 'normale',
}: {
  children: ReactNode
  id?: string
  className?: string
  ampiezza?: 'normale' | 'stretta' | 'piena'
}) {
  return (
    <section id={id} className={classi('py-20 sm:py-28 lg:py-32', className)}>
      {ampiezza === 'piena' ? (
        children
      ) : (
        <div className={classi('contenitore', ampiezza === 'stretta' && 'max-w-4xl')}>{children}</div>
      )}
    </section>
  )
}
