'use client'

import type { ReactNode } from 'react'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Elementi di interfaccia del pannello.
 *
 * Sono deliberatamente più sobri di quelli del sito: qui conta leggere in
 * fretta e sbagliare poco, non stupire. Tutti i campi hanno etichetta
 * associata e messaggio d'errore collegato via `aria-describedby`.
 */

const STILE_CAMPO =
  'w-full border border-bordo bg-superficie px-3.5 py-2.5 text-sm transition-colors ' +
  'focus:border-accento focus:outline-none disabled:opacity-50'

export function Etichetta({
  htmlFor,
  children,
  obbligatorio,
}: {
  htmlFor: string
  children: ReactNode
  obbligatorio?: boolean
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-[0.68rem] font-medium uppercase tracking-[0.14em] text-tenue"
    >
      {children}
      {obbligatorio && <span aria-hidden> *</span>}
    </label>
  )
}

export function CampoTesto({
  id,
  etichetta,
  valore,
  onChange,
  tipo = 'text',
  obbligatorio,
  errore,
  suggerimento,
  ...resto
}: {
  id: string
  etichetta: string
  valore: string | number
  onChange: (valore: string) => void
  tipo?: string
  obbligatorio?: boolean
  errore?: string
  suggerimento?: string
} & Omit<React.ComponentProps<'input'>, 'id' | 'value' | 'onChange' | 'type'>) {
  return (
    <div>
      <Etichetta htmlFor={id} obbligatorio={obbligatorio}>
        {etichetta}
      </Etichetta>

      <input
        {...resto}
        id={id}
        type={tipo}
        value={valore}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(errore)}
        aria-describedby={errore ? `${id}-errore` : suggerimento ? `${id}-nota` : undefined}
        className={classi(STILE_CAMPO, errore && 'border-red-500')}
      />

      {errore ? (
        <p id={`${id}-errore`} className="mt-1.5 text-xs text-red-600 scuro:text-red-400">
          {errore}
        </p>
      ) : (
        suggerimento && (
          <p id={`${id}-nota`} className="mt-1.5 text-xs text-tenue">
            {suggerimento}
          </p>
        )
      )}
    </div>
  )
}

export function CampoArea({
  id,
  etichetta,
  valore,
  onChange,
  righe = 4,
  massimo,
  obbligatorio,
  errore,
}: {
  id: string
  etichetta: string
  valore: string
  onChange: (valore: string) => void
  righe?: number
  massimo?: number
  obbligatorio?: boolean
  errore?: string
}) {
  return (
    <div>
      <Etichetta htmlFor={id} obbligatorio={obbligatorio}>
        {etichetta}
      </Etichetta>

      <textarea
        id={id}
        rows={righe}
        value={valore}
        maxLength={massimo}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(errore)}
        aria-describedby={errore ? `${id}-errore` : undefined}
        className={classi(STILE_CAMPO, 'resize-y', errore && 'border-red-500')}
      />

      <div className="mt-1.5 flex justify-between gap-4 text-xs">
        {errore ? (
          <p id={`${id}-errore`} className="text-red-600 scuro:text-red-400">
            {errore}
          </p>
        ) : (
          <span />
        )}
        {massimo && (
          <span className="text-tenue">
            {valore.length}/{massimo}
          </span>
        )}
      </div>
    </div>
  )
}

export function CampoScelta<T extends string>({
  id,
  etichetta,
  valore,
  opzioni,
  onChange,
  obbligatorio,
}: {
  id: string
  etichetta: string
  valore: T
  opzioni: ReadonlyArray<{ valore: T; nome: string }>
  onChange: (valore: T) => void
  obbligatorio?: boolean
}) {
  return (
    <div>
      <Etichetta htmlFor={id} obbligatorio={obbligatorio}>
        {etichetta}
      </Etichetta>

      <select
        id={id}
        value={valore}
        onChange={(evento) => onChange(evento.target.value as T)}
        className={STILE_CAMPO}
      >
        {opzioni.map((opzione) => (
          <option key={opzione.valore} value={opzione.valore}>
            {opzione.nome}
          </option>
        ))}
      </select>
    </div>
  )
}

/** Interruttore acceso/spento con etichetta cliccabile. */
export function Interruttore({
  etichetta,
  descrizione,
  attivo,
  onChange,
}: {
  etichetta: string
  descrizione?: string
  attivo: boolean
  onChange: (valore: boolean) => void
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input
        type="checkbox"
        checked={attivo}
        onChange={(evento) => onChange(evento.target.checked)}
        className="mt-0.5 size-4 shrink-0 accent-[var(--accento)]"
      />
      <span>
        <span className="block text-sm">{etichetta}</span>
        {descrizione && <span className="mt-0.5 block text-xs text-tenue">{descrizione}</span>}
      </span>
    </label>
  )
}

export function Pulsante({
  children,
  variante = 'pieno',
  icona,
  ...resto
}: {
  children: ReactNode
  variante?: 'pieno' | 'contorno' | 'pericolo' | 'silenzioso'
  icona?: NomeIcona
} & React.ComponentProps<'button'>) {
  const stili: Record<string, string> = {
    pieno: 'bg-accento text-white hover:bg-accento-forte scuro:text-notte',
    contorno: 'border border-bordo-forte hover:border-accento hover:text-accento',
    pericolo: 'border border-red-300 text-red-600 hover:bg-red-50 scuro:border-red-900 scuro:text-red-400 scuro:hover:bg-red-950/40',
    silenzioso: 'text-tenue hover:text-accento',
  }

  return (
    <button
      {...resto}
      className={classi(
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.12em] transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50',
        stili[variante],
        resto.className,
      )}
    >
      {icona && <Icona nome={icona} className="size-4" />}
      {children}
    </button>
  )
}

/** Intestazione di pagina del pannello, con azione principale a destra. */
export function TestataPagina({
  titolo,
  descrizione,
  azione,
}: {
  titolo: string
  descrizione?: string
  azione?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-bordo pb-6">
      <div>
        <h1 className="font-titolo text-3xl">{titolo}</h1>
        {descrizione && <p className="mt-1.5 text-sm text-tenue">{descrizione}</p>}
      </div>
      {azione}
    </div>
  )
}

/** Riquadro di stato: conferma o errore dopo un salvataggio. */
export function Avviso({ tipo, testo }: { tipo: 'ok' | 'errore'; testo: string }) {
  if (!testo) return null

  return (
    <p
      role="status"
      aria-live="polite"
      className={classi(
        'mb-6 flex items-center gap-2.5 border p-3.5 text-sm',
        tipo === 'ok'
          ? 'border-accento-tenue bg-accento/10 text-accento'
          : 'border-red-300 bg-red-50 text-red-700 scuro:border-red-900 scuro:bg-red-950/40 scuro:text-red-300',
      )}
    >
      <Icona nome={tipo === 'ok' ? 'spunta' : 'campanella'} className="size-4 shrink-0" />
      {testo}
    </p>
  )
}
