'use client'

import { useId, type ComponentProps, type ReactNode } from 'react'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Campi di modulo condivisi fra sito pubblico e pannello.
 *
 * Ogni campo genera da sé l'identificativo che lega etichetta e controllo: è
 * ciò che permette di attivare il campo toccando l'etichetta e ai lettori di
 * schermo di annunciare a che cosa serve. `useId` produce valori stabili fra
 * server e client, quindi non provoca disallineamenti di idratazione.
 */

const STILE_CONTROLLO =
  'w-full rounded-tenue border border-bordo bg-superficie px-4 py-3 text-[0.95rem] ' +
  'text-testo transition-colors duration-300 placeholder:text-tenue/60 ' +
  'focus:border-accento focus:outline-none disabled:opacity-60'

function Etichetta({
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
      className="mb-2 block text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-tenue"
    >
      {children}
      {obbligatorio && (
        <span className="ml-1 text-accento" aria-hidden>
          *
        </span>
      )}
    </label>
  )
}

/** Riga di aiuto o di errore sotto un campo. */
function Nota({ testo, errore }: { testo?: string; errore?: boolean }) {
  if (!testo) return null
  return (
    <p className={classi('mt-2 text-[0.8rem]', errore ? 'text-red-500' : 'text-tenue')}>{testo}</p>
  )
}

type PropsCampo = Omit<ComponentProps<'input'>, 'className'> & {
  etichetta: string
  nota?: string
  errore?: string
  icona?: NomeIcona
  className?: string
}

export function Campo({ etichetta, nota, errore, icona, className, ...resto }: PropsCampo) {
  const id = useId()

  return (
    <div className={className}>
      <Etichetta htmlFor={id} obbligatorio={resto.required}>
        {etichetta}
      </Etichetta>

      <div className="relative">
        {icona && (
          <Icona
            nome={icona}
            className="pointer-events-none absolute top-1/2 left-4 size-[1.05rem] -translate-y-1/2 text-tenue"
          />
        )}
        <input
          {...resto}
          id={id}
          aria-invalid={errore ? true : undefined}
          className={classi(STILE_CONTROLLO, icona && 'pl-11', errore && 'border-red-500')}
        />
      </div>

      <Nota testo={errore ?? nota} errore={Boolean(errore)} />
    </div>
  )
}

type PropsArea = Omit<ComponentProps<'textarea'>, 'className'> & {
  etichetta: string
  nota?: string
  errore?: string
  className?: string
}

export function Area({ etichetta, nota, errore, className, ...resto }: PropsArea) {
  const id = useId()

  return (
    <div className={className}>
      <Etichetta htmlFor={id} obbligatorio={resto.required}>
        {etichetta}
      </Etichetta>
      <textarea
        {...resto}
        id={id}
        aria-invalid={errore ? true : undefined}
        className={classi(STILE_CONTROLLO, 'min-h-32 resize-y', errore && 'border-red-500')}
      />
      <Nota testo={errore ?? nota} errore={Boolean(errore)} />
    </div>
  )
}

type PropsScelta = Omit<ComponentProps<'select'>, 'className'> & {
  etichetta: string
  nota?: string
  errore?: string
  className?: string
}

export function Scelta({ etichetta, nota, errore, className, children, ...resto }: PropsScelta) {
  const id = useId()

  return (
    <div className={className}>
      <Etichetta htmlFor={id} obbligatorio={resto.required}>
        {etichetta}
      </Etichetta>

      <div className="relative">
        <select
          {...resto}
          id={id}
          aria-invalid={errore ? true : undefined}
          className={classi(STILE_CONTROLLO, 'appearance-none pr-11', errore && 'border-red-500')}
        >
          {children}
        </select>
        <Icona
          nome="chevron"
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-tenue"
        />
      </div>

      <Nota testo={errore ?? nota} errore={Boolean(errore)} />
    </div>
  )
}

/** Casella di spunta con etichetta cliccabile. */
export function Spunta({
  etichetta,
  className,
  ...resto
}: Omit<ComponentProps<'input'>, 'className' | 'type'> & { etichetta: ReactNode; className?: string }) {
  const id = useId()

  return (
    <div className={classi('flex items-start gap-3', className)}>
      <input
        {...resto}
        id={id}
        type="checkbox"
        className="mt-0.5 size-4 shrink-0 accent-[var(--accento)]"
      />
      <label htmlFor={id} className="text-[0.88rem] leading-relaxed text-tenue">
        {etichetta}
      </label>
    </div>
  )
}

/**
 * Gruppo di scelte multiple reso come pulsanti.
 * Più comodo delle caselle di spunta quando le voci sono brevi e numerose,
 * come nei filtri del catalogo.
 */
export function GruppoScelte<T extends string>({
  etichetta,
  voci,
  selezionate,
  onCambia,
  className,
}: {
  etichetta: string
  voci: ReadonlyArray<{ valore: T; nome: string }>
  selezionate: T[]
  onCambia: (valori: T[]) => void
  className?: string
}) {
  if (voci.length === 0) return null

  function alterna(valore: T) {
    onCambia(
      selezionate.includes(valore)
        ? selezionate.filter((voce) => voce !== valore)
        : [...selezionate, valore],
    )
  }

  return (
    <fieldset className={className}>
      <legend className="mb-3 text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-tenue">
        {etichetta}
      </legend>
      <div className="flex flex-wrap gap-2">
        {voci.map((voce) => {
          const attiva = selezionate.includes(voce.valore)
          return (
            <button
              key={voce.valore}
              type="button"
              onClick={() => alterna(voce.valore)}
              aria-pressed={attiva}
              className={classi(
                'rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-all duration-300',
                attiva
                  ? 'border-accento bg-accento text-white'
                  : 'border-bordo text-tenue hover:border-accento hover:text-accento',
              )}
            >
              {voce.nome}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Cursore per i valori continui: prezzo massimo, chilometri, potenza. */
export function Cursore({
  etichetta,
  valore,
  minimo,
  massimo,
  passo,
  formato,
  onCambia,
  className,
}: {
  etichetta: string
  /** `null` significa «nessun limite»: il cursore si porta al massimo. */
  valore: number | null
  minimo: number
  massimo: number
  passo: number
  formato: (valore: number) => string
  onCambia: (valore: number | null) => void
  className?: string
}) {
  const id = useId()
  const corrente = valore ?? massimo

  return (
    <div className={className}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label
          htmlFor={id}
          className="text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-tenue"
        >
          {etichetta}
        </label>
        <span className="text-[0.85rem] font-semibold text-testo tabellare">
          {valore === null ? 'Tutti' : formato(corrente)}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={minimo}
        max={massimo}
        step={passo}
        value={corrente}
        onChange={(evento) => {
          const prossimo = Number(evento.target.value)
          // Al massimo il filtro non seleziona nulla: è il modo più naturale
          // per «togliere» il limite senza un pulsante in più.
          onCambia(prossimo >= massimo ? null : prossimo)
        }}
        className="w-full accent-[var(--accento)]"
      />
    </div>
  )
}

/**
 * Riscontro dell'invio di un modulo: una riga sola, con il tono giusto.
 * `role="status"` fa annunciare il messaggio ai lettori di schermo senza
 * rubare il fuoco a chi sta ancora compilando.
 */
export function Esito({ testo, tipo }: { testo: string; tipo: 'ok' | 'errore' }) {
  if (!testo) return null

  return (
    <p
      role="status"
      className={classi(
        'flex items-start gap-2.5 rounded-tenue border px-4 py-3 text-[0.9rem]',
        tipo === 'ok'
          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 scuro:text-emerald-400'
          : 'border-red-500/30 bg-red-500/10 text-red-600 scuro:text-red-400',
      )}
    >
      <Icona nome={tipo === 'ok' ? 'verifica' : 'avviso'} className="mt-0.5 size-4 shrink-0" />
      {testo}
    </p>
  )
}
