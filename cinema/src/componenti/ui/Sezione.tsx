import type { ReactNode } from 'react'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { classi } from '@/lib/utili'

/**
 * Intestazione ricorrente delle sezioni: soprattitolo, titolo e sottotitolo.
 * Averla in un solo posto tiene allineati spaziatura e ritmo tipografico in
 * tutte le pagine.
 */
export function TitoloSezione({
  soprattitolo,
  titolo,
  sottotitolo,
  allineamento = 'centro',
  className,
  livello = 2,
  azione,
}: {
  soprattitolo?: string
  titolo: ReactNode
  sottotitolo?: ReactNode
  allineamento?: 'centro' | 'sinistra'
  className?: string
  livello?: 1 | 2 | 3
  /** Collegamento o pulsante allineato a destra del titolo. */
  azione?: ReactNode
}) {
  const Titolo = `h${livello}` as 'h2'
  const centrato = allineamento === 'centro'

  const intestazione = (
    <div className={classi('max-w-3xl', centrato ? 'mx-auto text-center' : 'text-left', className)}>
      {soprattitolo && (
        <Rivela da="nessuna">
          <p
            className={classi(
              'mb-5 flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-accento',
              centrato && 'justify-center',
            )}
          >
            {centrato && <span className="filetto rotate-180" aria-hidden />}
            {soprattitolo}
            <span className="filetto" aria-hidden />
          </p>
        </Rivela>
      )}

      <Rivela ritardo={0.06}>
        <Titolo className="text-balance text-[2rem] leading-[1.1] sm:text-[2.6rem] lg:text-[3.1rem]">
          {titolo}
        </Titolo>
      </Rivela>

      {sottotitolo && (
        <Rivela ritardo={0.12}>
          <div className="mt-5 text-[1.02rem] leading-relaxed text-tenue">{sottotitolo}</div>
        </Rivela>
      )}
    </div>
  )

  if (!azione) return intestazione

  return (
    <div className="flex flex-wrap items-end justify-between gap-6">
      {intestazione}
      <Rivela da="destra" ritardo={0.1} className="shrink-0">
        {azione}
      </Rivela>
    </div>
  )
}

/** Contenitore di sezione con spaziatura verticale coerente. */
export function Sezione({
  children,
  id,
  className,
  ampiezza = 'normale',
  spaziatura = 'normale',
}: {
  children: ReactNode
  id?: string
  className?: string
  ampiezza?: 'normale' | 'stretta' | 'larga' | 'piena'
  spaziatura?: 'normale' | 'ridotta' | 'nessuna'
}) {
  const PADDING = {
    normale: 'py-18 sm:py-22 lg:py-26',
    ridotta: 'py-12 sm:py-14',
    nessuna: '',
  } as const

  return (
    <section id={id} className={classi(PADDING[spaziatura], className)}>
      {ampiezza === 'piena' ? (
        children
      ) : (
        <div
          className={classi(
            'contenitore',
            ampiezza === 'stretta' && 'max-w-4xl',
            ampiezza === 'larga' && 'max-w-[96rem]',
          )}
        >
          {children}
        </div>
      )}
    </section>
  )
}

/**
 * Etichetta di stato: piccola, arrotondata, in sette toni.
 * È il modo in cui il sito segnala «IMAX», «Esaurito», «−30%» e simili.
 */
export function Etichetta({
  children,
  tono = 'neutro',
  className,
}: {
  children: ReactNode
  tono?: 'neutro' | 'accento' | 'pieno' | 'viola' | 'verde' | 'ambra' | 'rosso' | 'scuro'
  className?: string
}) {
  const TONI = {
    neutro: 'bg-superficie-alt text-tenue border-bordo',
    accento: 'bg-accento/12 text-accento border-accento/25',
    // Pieno: l'unico leggibile quando l'etichetta sta sopra un'immagine, dove
    // il fondo traslucido non ha un colore su cui contare.
    pieno: 'bg-accento text-white border-accento',
    viola: 'bg-viola/14 text-viola border-viola/28',
    verde: 'bg-ok/12 text-ok border-ok/28',
    ambra: 'bg-attesa/14 text-attesa border-attesa/28',
    rosso: 'bg-errore/12 text-errore border-errore/28',
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

/** Riquadro informativo neutro: avvisi, note, stati vuoti. */
export function Nota({
  children,
  tono = 'neutro',
  icona,
  className,
}: {
  children: ReactNode
  tono?: 'neutro' | 'accento' | 'verde' | 'ambra' | 'rosso'
  icona?: ReactNode
  className?: string
}) {
  const TONI = {
    neutro: 'border-bordo bg-superficie text-tenue',
    accento: 'border-accento/30 bg-accento/8 text-testo',
    verde: 'border-ok/30 bg-ok/8 text-testo',
    ambra: 'border-attesa/30 bg-attesa/8 text-testo',
    rosso: 'border-errore/35 bg-errore/8 text-testo',
  } as const

  return (
    <div
      className={classi(
        'flex items-start gap-3 rounded-morbido border p-4 text-[0.9rem] leading-relaxed',
        TONI[tono],
        className,
      )}
    >
      {icona && <span className="mt-0.5 shrink-0">{icona}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  )
}
