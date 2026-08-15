'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Mattoni comuni del pannello di amministrazione.
 *
 * Le schermate di gestione fanno tutte la stessa cosa — caricano un elenco, lo
 * mostrano, ne modificano una voce — quindi il grosso del lavoro sta qui e
 * ciascuna schermata si limita a dire quali colonne mostrare e cosa fanno i
 * pulsanti.
 */

/* ── Recupero dei dati ───────────────────────────────────────────────────── */

type StatoRisorsa<T> = {
  dati: T | null
  caricamento: boolean
  errore: string
  ricarica: () => Promise<void>
}

/**
 * Carica una risorsa dalle rotte API del pannello.
 *
 * Un 401 non è un errore da mostrare: significa che la sessione è scaduta, e
 * la pagina va semplicemente ricaricata perché il guscio riproponga l'accesso.
 */
export function useRisorsa<T>(percorso: string): StatoRisorsa<T> {
  const [dati, setDati] = useState<T | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')

  const ricarica = useCallback(async () => {
    setCaricamento(true)
    setErrore('')

    try {
      const risposta = await fetch(percorso)

      if (risposta.status === 401) {
        window.location.reload()
        return
      }

      if (!risposta.ok) {
        setErrore('Caricamento non riuscito.')
        return
      }

      setDati((await risposta.json()) as T)
    } catch {
      setErrore('Server non raggiungibile.')
    } finally {
      setCaricamento(false)
    }
  }, [percorso])

  useEffect(() => {
    void ricarica()
  }, [ricarica])

  return { dati, caricamento, errore, ricarica }
}

/** Invia una modifica e riporta l'esito, senza far cadere la schermata. */
export async function invia(
  percorso: string,
  metodo: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  corpo?: unknown,
): Promise<{ ok: boolean; errore: string; dati: unknown }> {
  try {
    const risposta = await fetch(percorso, {
      method: metodo,
      ...(corpo !== undefined
        ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) }
        : {}),
    })

    const dati = await risposta.json().catch(() => ({}))

    if (risposta.status === 401) {
      window.location.reload()
      return { ok: false, errore: 'Sessione scaduta.', dati }
    }

    return {
      ok: risposta.ok,
      errore: risposta.ok ? '' : ((dati as { errore?: string }).errore ?? 'Operazione non riuscita.'),
      dati,
    }
  } catch {
    return { ok: false, errore: 'Server non raggiungibile.', dati: null }
  }
}

/* ── Impaginazione ───────────────────────────────────────────────────────── */

export function Scheda({
  titolo,
  descrizione,
  azione,
  children,
}: {
  titolo: string
  descrizione?: string
  azione?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-ampio border border-bordo bg-superficie p-6 shadow-morbida sm:p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-titolo text-[1.25rem] font-semibold">{titolo}</h2>
          {descrizione && <p className="mt-1.5 text-[0.88rem] text-tenue">{descrizione}</p>}
        </div>
        {azione}
      </div>
      {children}
    </section>
  )
}

/** Intestazione di pagina del pannello. */
export function TestataPagina({
  titolo,
  descrizione,
  azione,
}: {
  titolo: string
  descrizione: string
  azione?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-titolo text-[1.8rem] font-semibold">{titolo}</h1>
        <p className="mt-2 text-[0.95rem] text-tenue">{descrizione}</p>
      </div>
      {azione}
    </div>
  )
}

/** Riquadro numerico della pagina iniziale. */
export function Riquadro({
  etichetta,
  valore,
  nota,
  icona,
  tono = 'neutro',
}: {
  etichetta: string
  valore: string | number
  nota?: string
  icona: NomeIcona
  tono?: 'neutro' | 'accento' | 'verde' | 'ambra'
}) {
  const TONI = {
    neutro: 'bg-superficie-alt text-tenue',
    accento: 'bg-accento/10 text-accento',
    verde: 'bg-emerald-500/10 text-emerald-500',
    ambra: 'bg-amber-500/10 text-amber-500',
  } as const

  return (
    <div className="rounded-ampio border border-bordo bg-superficie p-6">
      <span className={classi('inline-flex size-10 items-center justify-center rounded-xl', TONI[tono])}>
        <Icona nome={icona} className="size-[1.1rem]" />
      </span>
      <p className="mt-4 font-titolo text-[1.9rem] leading-none font-semibold tabellare">{valore}</p>
      <p className="mt-2 text-[0.8rem] tracking-[0.12em] text-tenue uppercase">{etichetta}</p>
      {nota && <p className="mt-1.5 text-[0.8rem] text-tenue">{nota}</p>}
    </div>
  )
}

/* ── Stati generici ──────────────────────────────────────────────────────── */

export function Caricamento() {
  return (
    <p className="flex items-center justify-center gap-3 py-16 text-[0.9rem] text-tenue">
      <Icona nome="orologio" className="size-4 animate-spin" />
      Caricamento…
    </p>
  )
}

export function Vuoto({ testo }: { testo: string }) {
  return (
    <p className="rounded-morbido border border-dashed border-bordo-forte p-10 text-center text-[0.92rem] text-tenue">
      {testo}
    </p>
  )
}

export function Errore({ testo, onRiprova }: { testo: string; onRiprova?: () => void }) {
  if (!testo) return null

  return (
    <p className="flex flex-wrap items-center gap-3 rounded-morbido border border-red-500/30 bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-600 scuro:text-red-400">
      <Icona nome="avviso" className="size-4 shrink-0" />
      {testo}
      {onRiprova && (
        <button type="button" onClick={onRiprova} className="font-semibold underline">
          Riprova
        </button>
      )}
    </p>
  )
}

/* ── Comandi ─────────────────────────────────────────────────────────────── */

/** Pulsante compatto per le azioni di riga. */
export function Azione({
  icona,
  etichetta,
  onClick,
  tono = 'neutro',
  attivo = false,
}: {
  icona: NomeIcona
  etichetta: string
  onClick: () => void
  tono?: 'neutro' | 'accento' | 'rosso'
  attivo?: boolean
}) {
  const TONI = {
    neutro: 'text-tenue hover:border-accento hover:text-accento',
    accento: 'text-accento hover:bg-accento hover:text-white',
    rosso: 'text-red-500 hover:border-red-500 hover:bg-red-500 hover:text-white',
  } as const

  return (
    <button
      type="button"
      onClick={onClick}
      title={etichetta}
      aria-label={etichetta}
      aria-pressed={attivo}
      className={classi(
        'inline-flex size-9 items-center justify-center rounded-lg border border-bordo transition-colors duration-300',
        attivo ? 'border-accento bg-accento text-white' : TONI[tono],
      )}
    >
      <Icona nome={icona} className="size-4" />
    </button>
  )
}

/**
 * Conferma prima di un'azione irreversibile.
 *
 * Usa `confirm` del browser: in un pannello interno usato da poche persone
 * vale più la certezza che il messaggio compaia sempre, che l'eleganza di una
 * finestra costruita a mano.
 */
export function conferma(domanda: string): boolean {
  return window.confirm(domanda)
}

/* ── Esportazione ────────────────────────────────────────────────────────── */

/**
 * Scarica un elenco in formato CSV.
 *
 * I valori vengono racchiusi fra virgolette e le virgolette interne
 * raddoppiate: è la regola del formato, e senza di essa un indirizzo con una
 * virgola manderebbe fuori posto tutte le colonne successive.
 *
 * Il BOM iniziale serve a Excel, che senza interpreta i file come ASCII e
 * mostra le lettere accentate sbagliate.
 */
export function esportaCsv(nomeFile: string, righe: Array<Record<string, string | number>>) {
  if (righe.length === 0) return

  const colonne = Object.keys(righe[0])
  const cella = (valore: string | number) => `"${String(valore).replace(/"/g, '""')}"`

  const contenuto = [
    colonne.map(cella).join(','),
    ...righe.map((riga) => colonne.map((colonna) => cella(riga[colonna] ?? '')).join(',')),
  ].join('\n')

  const collegamento = document.createElement('a')
  collegamento.href = URL.createObjectURL(
    new Blob([`﻿${contenuto}`], { type: 'text/csv;charset=utf-8' }),
  )
  collegamento.download = `${nomeFile}-${new Date().toISOString().slice(0, 10)}.csv`
  collegamento.click()
  URL.revokeObjectURL(collegamento.href)
}
