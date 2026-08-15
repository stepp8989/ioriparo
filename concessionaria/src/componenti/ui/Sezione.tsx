import type { ReactNode } from 'react'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { classi } from '@/lib/utili'

/**
 * Intestazione ricorrente delle sezioni: soprattitolo blu, titolo e
 * sottotitolo. Averla in un solo posto tiene allineati spaziatura e ritmo
 * tipografico in tutte le pagine.
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
              'mb-5 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em]',
              centrato && 'justify-center',
              chiaro ? 'text-accento-forte' : 'text-accento',
            )}
          >
            {centrato && <span className="filetto rotate-180" aria-hidden />}
            {soprattitolo}
            <span className="filetto" aria-hidden />
          </p>
        </Rivela>
      )}

      <Rivela ritardo={0.06}>
        <Titolo className="text-balance text-[2.1rem] leading-[1.1] sm:text-5xl lg:text-[3.3rem]">
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
    <section id={id} className={classi('py-20 sm:py-24 lg:py-28', className)}>
      {ampiezza === 'piena' ? (
        children
      ) : (
        <div className={classi('contenitore', ampiezza === 'stretta' && 'max-w-4xl')}>{children}</div>
      )}
    </section>
  )
}

/**
 * Etichetta di stato: piccola, arrotondata, in cinque toni.
 * È il modo in cui il sito segnala «Nuovo», «Venduto», «-12%» e simili.
 */
export function Etichetta({
  children,
  tono = 'neutro',
  className,
}: {
  children: ReactNode
  tono?: 'neutro' | 'accento' | 'pieno' | 'verde' | 'ambra' | 'rosso' | 'scuro'
  className?: string
}) {
  const TONI = {
    neutro: 'bg-superficie-alt text-tenue border-bordo',
    accento: 'bg-accento/12 text-accento border-accento/25',
    // Blu pieno: l'unico leggibile quando l'etichetta sta sopra una fotografia,
    // dove il fondo traslucido non ha un colore su cui contare.
    pieno: 'bg-accento text-white border-accento',
    verde: 'bg-emerald-500/12 text-emerald-600 border-emerald-500/25 scuro:text-emerald-400',
    ambra: 'bg-amber-500/12 text-amber-600 border-amber-500/25 scuro:text-amber-400',
    rosso: 'bg-red-500/12 text-red-600 border-red-500/25 scuro:text-red-400',
    scuro: 'bg-notte/85 text-white border-white/15',
  } as const

  return (
    <span
      className={classi(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em]',
        TONI[tono],
        className,
      )}
    >
      {children}
    </span>
  )
}
