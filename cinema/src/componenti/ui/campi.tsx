'use client'

import { useId, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Campi di modulo.
 *
 * Tutti condividono lo stesso impianto: etichetta vera collegata al campo,
 * messaggio d'errore annunciato agli screen reader, stato di errore visibile
 * anche senza colore (bordo più spesso e icona), e nessun `placeholder` usato
 * al posto dell'etichetta — un segnaposto sparisce appena si scrive, e chi
 * torna a controllare il modulo non sa più cosa stava compilando.
 */

const BASE_CAMPO =
  'w-full rounded-tenue border bg-superficie px-4 py-3 text-[0.92rem] text-testo ' +
  'transition-colors duration-200 placeholder:text-tenue/60 ' +
  'focus:border-accento focus:outline-none disabled:opacity-50'

type Comune = {
  etichetta: string
  errore?: string
  aiuto?: string
  richiesto?: boolean
  className?: string
}

function Guscio({
  etichetta,
  errore,
  aiuto,
  richiesto,
  idCampo,
  idAiuto,
  className,
  children,
}: Comune & { idCampo: string; idAiuto: string; children: ReactNode }) {
  return (
    <div className={classi('space-y-2', className)}>
      <label
        htmlFor={idCampo}
        className="block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue"
      >
        {etichetta}
        {richiesto && (
          <span className="ml-1 text-accento" aria-hidden>
            *
          </span>
        )}
      </label>

      {children}

      {(errore || aiuto) && (
        <p
          id={idAiuto}
          className={classi(
            'flex items-start gap-1.5 text-[0.8rem] leading-snug',
            errore ? 'text-errore' : 'text-tenue',
          )}
          role={errore ? 'alert' : undefined}
        >
          {errore && <Icona nome="avviso" className="mt-0.5 size-3.5 shrink-0" />}
          {errore ?? aiuto}
        </p>
      )}
    </div>
  )
}

export function Campo({
  etichetta,
  errore,
  aiuto,
  richiesto,
  className,
  icona,
  ...resto
}: Comune & { icona?: NomeIcona } & React.InputHTMLAttributes<HTMLInputElement>) {
  const generato = useId()
  const idCampo = resto.id ?? generato
  const idAiuto = `${idCampo}-aiuto`

  return (
    <Guscio
      etichetta={etichetta}
      errore={errore}
      aiuto={aiuto}
      richiesto={richiesto}
      idCampo={idCampo}
      idAiuto={idAiuto}
      className={className}
    >
      <div className="relative">
        {icona && (
          <Icona
            nome={icona}
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
          />
        )}
        <input
          {...resto}
          id={idCampo}
          required={richiesto}
          aria-invalid={errore ? true : undefined}
          aria-describedby={errore || aiuto ? idAiuto : undefined}
          className={classi(
            BASE_CAMPO,
            icona && 'pl-10',
            errore ? 'border-errore/70 border-2' : 'border-bordo',
          )}
        />
      </div>
    </Guscio>
  )
}

export function Area({
  etichetta,
  errore,
  aiuto,
  richiesto,
  className,
  ...resto
}: Comune & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const generato = useId()
  const idCampo = resto.id ?? generato
  const idAiuto = `${idCampo}-aiuto`

  return (
    <Guscio
      etichetta={etichetta}
      errore={errore}
      aiuto={aiuto}
      richiesto={richiesto}
      idCampo={idCampo}
      idAiuto={idAiuto}
      className={className}
    >
      <textarea
        {...resto}
        id={idCampo}
        required={richiesto}
        rows={resto.rows ?? 4}
        aria-invalid={errore ? true : undefined}
        aria-describedby={errore || aiuto ? idAiuto : undefined}
        className={classi(
          BASE_CAMPO,
          'resize-y leading-relaxed',
          errore ? 'border-errore/70 border-2' : 'border-bordo',
        )}
      />
    </Guscio>
  )
}

export function Scelta({
  etichetta,
  errore,
  aiuto,
  richiesto,
  className,
  children,
  ...resto
}: Comune & SelectHTMLAttributes<HTMLSelectElement>) {
  const generato = useId()
  const idCampo = resto.id ?? generato
  const idAiuto = `${idCampo}-aiuto`

  return (
    <Guscio
      etichetta={etichetta}
      errore={errore}
      aiuto={aiuto}
      richiesto={richiesto}
      idCampo={idCampo}
      idAiuto={idAiuto}
      className={className}
    >
      <div className="relative">
        <select
          {...resto}
          id={idCampo}
          required={richiesto}
          aria-invalid={errore ? true : undefined}
          aria-describedby={errore || aiuto ? idAiuto : undefined}
          className={classi(
            BASE_CAMPO,
            'appearance-none pr-10',
            errore ? 'border-errore/70 border-2' : 'border-bordo',
          )}
        >
          {children}
        </select>
        <Icona
          nome="chevron"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
      </div>
    </Guscio>
  )
}

/**
 * Casella di spunta con etichetta cliccabile.
 *
 * L'area sensibile comprende il testo: su un telefono centrare il dito su un
 * quadratino di sedici pixel è un esercizio che nessuno dovrebbe dover fare.
 */
export function Spunta({
  etichetta,
  descrizione,
  className,
  ...resto
}: {
  etichetta: ReactNode
  descrizione?: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  const generato = useId()
  const idCampo = resto.id ?? generato

  return (
    <label
      htmlFor={idCampo}
      className={classi(
        'flex cursor-pointer items-start gap-3 rounded-tenue border border-bordo bg-superficie p-3.5',
        'transition-colors duration-200 hover:border-bordo-forte has-checked:border-accento has-checked:bg-accento/6',
        className,
      )}
    >
      <input
        {...resto}
        type="checkbox"
        id={idCampo}
        className="mt-0.5 size-4 shrink-0 accent-[var(--accento)]"
      />
      <span className="min-w-0 text-[0.9rem] leading-snug">
        <span className="font-medium">{etichetta}</span>
        {descrizione && <span className="mt-1 block text-[0.82rem] text-tenue">{descrizione}</span>}
      </span>
    </label>
  )
}

/** Interruttore per le impostazioni: stessa semantica di una casella di spunta. */
export function Interruttore({
  etichetta,
  descrizione,
  attivo,
  onCambia,
  disabilitato = false,
}: {
  etichetta: string
  descrizione?: string
  attivo: boolean
  onCambia: (valore: boolean) => void
  disabilitato?: boolean
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={attivo}
      disabled={disabilitato}
      onClick={() => onCambia(!attivo)}
      className={classi(
        'flex w-full items-center justify-between gap-4 rounded-tenue border border-bordo bg-superficie p-3.5 text-left',
        'transition-colors duration-200 hover:border-bordo-forte disabled:opacity-50',
      )}
    >
      <span className="min-w-0">
        <span className="block text-[0.9rem] font-medium">{etichetta}</span>
        {descrizione && <span className="mt-1 block text-[0.82rem] text-tenue">{descrizione}</span>}
      </span>
      <span
        className={classi(
          'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-300',
          attivo ? 'bg-accento' : 'bg-bordo-forte',
        )}
      >
        <span
          className={classi(
            'absolute top-0.5 size-5 rounded-full bg-white transition-all duration-300',
            attivo ? 'left-[1.375rem]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

/** Gruppo di scelte esclusive mostrate come pulsanti: formati, giorni, filtri. */
export function Gruppo<T extends string>({
  etichetta,
  valore,
  voci,
  onCambia,
  className,
}: {
  etichetta: string
  valore: T
  voci: { valore: T; etichetta: string; disabilitata?: boolean }[]
  onCambia: (valore: T) => void
  className?: string
}) {
  return (
    <div className={className} role="radiogroup" aria-label={etichetta}>
      <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
        {etichetta}
      </p>
      <div className="flex flex-wrap gap-2">
        {voci.map((voce) => (
          <button
            key={voce.valore}
            type="button"
            role="radio"
            aria-checked={valore === voce.valore}
            disabled={voce.disabilitata}
            onClick={() => onCambia(voce.valore)}
            className={classi(
              'rounded-tenue border px-4 py-2 text-[0.82rem] font-medium transition-all duration-300',
              'disabled:cursor-not-allowed disabled:opacity-40',
              valore === voce.valore
                ? 'border-accento bg-accento text-white'
                : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
            )}
          >
            {voce.etichetta}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Selettore di quantità: due pulsanti e un numero, senza campo di testo. */
export function Quantita({
  valore,
  onCambia,
  minimo = 0,
  massimo = 20,
  etichetta,
}: {
  valore: number
  onCambia: (valore: number) => void
  minimo?: number
  massimo?: number
  etichetta: string
}) {
  const stile =
    'inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue ' +
    'transition-colors hover:border-accento hover:text-accento disabled:opacity-35 disabled:hover:border-bordo disabled:hover:text-tenue'

  return (
    <div className="inline-flex items-center gap-3">
      <button
        type="button"
        className={stile}
        onClick={() => onCambia(Math.max(minimo, valore - 1))}
        disabled={valore <= minimo}
        aria-label={`Togli uno: ${etichetta}`}
      >
        <Icona nome="meno" className="size-4" />
      </button>

      <span className="tabellare w-6 text-center text-[0.95rem] font-semibold" aria-live="polite">
        {valore}
      </span>

      <button
        type="button"
        className={stile}
        onClick={() => onCambia(Math.min(massimo, valore + 1))}
        disabled={valore >= massimo}
        aria-label={`Aggiungi uno: ${etichetta}`}
      >
        <Icona nome="piu" className="size-4" />
      </button>
    </div>
  )
}
