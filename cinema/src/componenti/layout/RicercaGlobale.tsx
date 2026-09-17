'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Ricerca globale con suggerimenti.
 *
 * Cerca fra film, persone (registi e interpreti), generi e cinema. I
 * suggerimenti arrivano dalla rotta `/api/ricerca`, che sa dove guardare: qui
 * c'è solo l'interfaccia.
 *
 * Tre accorgimenti che fanno la differenza fra una ricerca usabile e una che
 * infastidisce:
 *
 *   — attesa di 220 ms prima di interrogare il server, così scrivere una
 *     parola di otto lettere non genera otto richieste;
 *   — ogni richiesta annulla la precedente, perché con una rete lenta la
 *     risposta di «ne» può arrivare dopo quella di «nevischio» e sovrascriverla
 *     con risultati vecchi;
 *   — navigazione con le frecce e Invio, con il modello ARIA della casella
 *     combinata, perché una ricerca che si usa solo con il puntatore è una
 *     ricerca a metà.
 */

type Suggerimento = {
  tipo: 'film' | 'persona' | 'genere' | 'cinema'
  titolo: string
  sottotitolo: string
  href: string
}

const ICONE = {
  film: 'ciak',
  persona: 'utente',
  genere: 'elenco',
  cinema: 'posizione',
} as const

export function RicercaGlobale({ compatta = false }: { compatta?: boolean }) {
  const [testo, setTesto] = useState('')
  const [suggerimenti, setSuggerimenti] = useState<Suggerimento[]>([])
  const [aperta, setAperta] = useState(false)
  const [evidenziato, setEvidenziato] = useState(-1)
  const [caricamento, setCaricamento] = useState(false)

  const contenitore = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    const termine = testo.trim()

    if (termine.length < 2) {
      setSuggerimenti([])
      setCaricamento(false)
      return
    }

    const interruttore = new AbortController()
    setCaricamento(true)

    const attesa = window.setTimeout(async () => {
      try {
        const risposta = await fetch(`/api/ricerca?q=${encodeURIComponent(termine)}`, {
          signal: interruttore.signal,
        })
        if (!risposta.ok) throw new Error('ricerca non riuscita')
        const dati = (await risposta.json()) as { risultati: Suggerimento[] }
        setSuggerimenti(dati.risultati ?? [])
        setEvidenziato(-1)
      } catch (errore) {
        // L'annullamento è il funzionamento normale, non un guasto.
        if ((errore as Error).name !== 'AbortError') setSuggerimenti([])
      } finally {
        if (!interruttore.signal.aborted) setCaricamento(false)
      }
    }, 220)

    return () => {
      window.clearTimeout(attesa)
      interruttore.abort()
    }
  }, [testo])

  // Chiusura al clic fuori: il pannello dei suggerimenti non deve restare
  // aperto mentre si legge la pagina sotto.
  useEffect(() => {
    if (!aperta) return
    function fuori(evento: MouseEvent) {
      if (!contenitore.current?.contains(evento.target as Node)) setAperta(false)
    }
    document.addEventListener('mousedown', fuori)
    return () => document.removeEventListener('mousedown', fuori)
  }, [aperta])

  function vai(destinazione: string) {
    setAperta(false)
    setTesto('')
    router.push(destinazione)
  }

  function tastiera(evento: React.KeyboardEvent) {
    if (evento.key === 'Escape') {
      setAperta(false)
      return
    }

    if (evento.key === 'ArrowDown' || evento.key === 'ArrowUp') {
      evento.preventDefault()
      if (suggerimenti.length === 0) return
      const passo = evento.key === 'ArrowDown' ? 1 : -1
      setEvidenziato((precedente) => {
        const prossimo = precedente + passo
        if (prossimo < 0) return suggerimenti.length - 1
        if (prossimo >= suggerimenti.length) return 0
        return prossimo
      })
      return
    }

    if (evento.key === 'Enter') {
      evento.preventDefault()
      const scelto = suggerimenti[evidenziato]
      if (scelto) vai(scelto.href)
      else if (testo.trim()) vai(`/ricerca?q=${encodeURIComponent(testo.trim())}`)
    }
  }

  return (
    <div ref={contenitore} className="relative w-full">
      <div className="relative">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={testo}
          onChange={(evento) => {
            setTesto(evento.target.value)
            setAperta(true)
          }}
          onFocus={() => setAperta(true)}
          onKeyDown={tastiera}
          placeholder="Cerca film, attori, cinema…"
          aria-label="Cerca film, persone o cinema"
          role="combobox"
          aria-expanded={aperta && suggerimenti.length > 0}
          aria-controls="suggerimenti-ricerca"
          aria-autocomplete="list"
          aria-activedescendant={evidenziato >= 0 ? `suggerimento-${evidenziato}` : undefined}
          className={classi(
            'w-full rounded-full border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem]',
            'transition-colors placeholder:text-tenue/70 focus:border-accento focus:outline-none',
            compatta ? 'max-w-full' : 'max-w-md',
          )}
        />
        {caricamento && (
          <span className="absolute right-4 top-1/2 size-3 -translate-y-1/2 animate-pulse rounded-full bg-accento" />
        )}
      </div>

      {aperta && testo.trim().length >= 2 && (
        <div
          id="suggerimenti-ricerca"
          role="listbox"
          aria-label="Suggerimenti di ricerca"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[22rem] overflow-y-auto rounded-morbido border border-bordo bg-sfondo shadow-rilievo"
        >
          {suggerimenti.length === 0 && !caricamento && (
            <p className="px-4 py-5 text-[0.86rem] text-tenue">
              Nessun risultato per «{testo.trim()}».
            </p>
          )}

          {suggerimenti.map((suggerimento, indice) => (
            <Link
              key={`${suggerimento.tipo}-${suggerimento.href}-${indice}`}
              id={`suggerimento-${indice}`}
              href={suggerimento.href}
              role="option"
              aria-selected={indice === evidenziato}
              onClick={() => {
                setAperta(false)
                setTesto('')
              }}
              onMouseEnter={() => setEvidenziato(indice)}
              className={classi(
                'flex items-center gap-3 px-4 py-3 transition-colors',
                indice === evidenziato ? 'bg-superficie-alt' : 'hover:bg-superficie-alt',
              )}
            >
              <Icona nome={ICONE[suggerimento.tipo]} className="size-4 shrink-0 text-accento" />
              <span className="min-w-0">
                <span className="block truncate text-[0.9rem] font-medium">
                  {suggerimento.titolo}
                </span>
                <span className="block truncate text-[0.78rem] text-tenue">
                  {suggerimento.sottotitolo}
                </span>
              </span>
            </Link>
          ))}

          {testo.trim().length >= 2 && (
            <Link
              href={`/ricerca?q=${encodeURIComponent(testo.trim())}`}
              onClick={() => setAperta(false)}
              className="block border-t border-bordo px-4 py-3 text-[0.84rem] font-semibold text-accento hover:bg-superficie-alt"
            >
              Vedi tutti i risultati per «{testo.trim()}»
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
