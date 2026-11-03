import type { ReactNode } from 'react'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { classi } from '@/lib/utili'

/**
 * Intestazione ricorrente delle sezioni.
 *
 * L'allineamento predefinito è a sinistra, con una barretta rossa verticale:
 * su un portale di biglietteria le intestazioni centrate con il filetto
 * sfumato rallentano la lettura e rubano altezza alle locandine. Il titolo è
 * volutamente contenuto — la riga che conta, in queste pagine, è quella dei
 * manifesti che sta sotto.
 */
export function TitoloSezione({
  soprattitolo,
  titolo,
  sottotitolo,
  allineamento = 'sinistra',
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
    <div
      className={classi(
        centrato ? 'mx-auto max-w-3xl text-center' : 'barretta max-w-4xl text-left',
        className,
      )}
    >
      {soprattitolo && (
        <Rivela da="nessuna">
          <p className="mb-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-accento">
            {soprattitolo}
          </p>
        </Rivela>
      )}

      <Rivela ritardo={0.05}>
        <Titolo className="text-[1.4rem] leading-[1.15] sm:text-[1.7rem] lg:text-[1.95rem]">
          {titolo}
        </Titolo>
      </Rivela>

      {sottotitolo && (
        <Rivela ritardo={0.1}>
          <div className="mt-2 text-[0.92rem] leading-relaxed text-tenue">{sottotitolo}</div>
        </Rivela>
      )}
    </div>
  )

  if (!azione) return intestazione

  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      {intestazione}
      <Rivela da="destra" ritardo={0.08} className="shrink-0">
        {azione}
      </Rivela>
    </div>
  )
}

/**
 * Contenitore di sezione con spaziatura verticale coerente.
 *
 * I valori sono circa la metà di quelli della prima versione: la pagina deve
 * mostrare più titoli per schermata, non più vuoto.
 */
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
  spaziatura?: 'normale' | 'ridotta' | 'nessuna' | 'testata'
}) {
  /*
   * «testata» è la prima sezione di una pagina senza immagine d'apertura:
   * deve scavalcare l'intestazione fissa, che è alta 3,9 rem e sta sopra il
   * contenuto. Vive qui dentro e non come `className="pt-24"` sul chiamante
   * perché due utilità di padding sullo stesso elemento si contendono la
   * precedenza secondo l'ordine del foglio di stile, non quello dell'attributo:
   * `lg:py-13` batte `pt-24` e il titolo finisce sotto l'intestazione.
   */
  const PADDING = {
    normale: 'py-9 sm:py-11 lg:py-13',
    ridotta: 'py-6 sm:py-8',
    testata: 'pb-9 pt-24 sm:pb-11 sm:pt-26 lg:pb-13',
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
            ampiezza === 'larga' && 'max-w-[104rem]',
          )}
        >
          {children}
        </div>
      )}
    </section>
  )
}

/**
 * Etichetta di stato: piccola, squadrata, in sei toni.
 * È il modo in cui il sito segnala «IMAX», «Esaurito», «−30%» e simili.
 * Angoli appena smussati e non pillola, per stare appoggiata all'angolo di una
 * locandina senza staccarsene.
 */
export function Etichetta({
  children,
  tono = 'neutro',
  className,
}: {
  children: ReactNode
  tono?: 'neutro' | 'accento' | 'pieno' | 'ambra' | 'verde' | 'rosso' | 'scuro'
  className?: string
}) {
  const TONI = {
    neutro: 'bg-superficie-alt text-tenue border-bordo',
    accento: 'bg-accento/12 text-accento border-accento/25',
    // Pieno: l'unico leggibile quando l'etichetta sta sopra un'immagine, dove
    // il fondo traslucido non ha un colore su cui contare.
    pieno: 'bg-accento text-white border-accento',
    ambra: 'bg-ambra/14 text-ambra border-ambra/28',
    verde: 'bg-ok/12 text-ok border-ok/28',
    rosso: 'bg-errore/12 text-errore border-errore/28',
    scuro: 'bg-notte/85 text-white border-white/15',
  } as const

  return (
    <span
      className={classi(
        'inline-flex items-center gap-1 rounded-[3px] border px-1.5 py-0.5 font-stretto text-[0.7rem] font-semibold uppercase leading-tight tracking-[0.06em]',
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
    ambra: 'border-ambra/30 bg-ambra/8 text-testo',
    rosso: 'border-errore/35 bg-errore/8 text-testo',
  } as const

  return (
    <div
      className={classi(
        'flex items-start gap-2.5 rounded-morbido border p-3.5 text-[0.88rem] leading-relaxed',
        TONI[tono],
        className,
      )}
    >
      {icona && <span className="mt-0.5 shrink-0">{icona}</span>}
      <div className="min-w-0">{children}</div>
    </div>
  )
}
