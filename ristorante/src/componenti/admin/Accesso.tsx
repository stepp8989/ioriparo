'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Simbolo } from '@/componenti/layout/Marchio'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Accesso al pannello.
 *
 * Un solo campo: la password condivisa dallo staff. Il messaggio d'errore è
 * volutamente generico — non dice se la password è «quasi giusta» — e il
 * server limita comunque il numero di tentativi.
 */
export function Accesso() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [invio, setInvio] = useState(false)

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    setInvio(true)
    setErrore('')

    try {
      const risposta = await fetch('/api/accesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const dati = await risposta.json()

      if (!risposta.ok) throw new Error(dati.errore ?? 'Accesso non riuscito.')

      // `refresh` rilegge il layout lato server, che ora vede la sessione attiva.
      router.refresh()

      // Se dopo l'aggiornamento siamo ancora qui il cookie non è stato
      // accettato dal browser: senza questo controllo il modulo resterebbe
      // fermo su «Verifica…» senza spiegare nulla.
      setTimeout(() => {
        setInvio(false)
        setErrore(
          'Accesso riuscito ma la sessione non è stata memorizzata. Controllate che i cookie ' +
            'siano abilitati per questo sito.',
        )
      }, 4000)
    } catch (problema) {
      setErrore(problema instanceof Error ? problema.message : 'Accesso non riuscito.')
      setInvio(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sfondo px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Simbolo className="mx-auto size-14 text-accento" />
          <h1 className="mt-6 font-titolo text-3xl">Area riservata</h1>
          <p className="mt-2 text-sm text-tenue">
            Pannello di gestione di Aurea. Riservato allo staff.
          </p>
        </div>

        <form onSubmit={invia} className="mt-10 border border-bordo bg-superficie p-7">
          <label
            htmlFor="password"
            className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            autoFocus
            autoComplete="current-password"
            onChange={(evento) => {
              setPassword(evento.target.value)
              setErrore('')
            }}
            aria-invalid={Boolean(errore)}
            aria-describedby={errore ? 'errore-accesso' : undefined}
            className="w-full border-b border-bordo-forte bg-transparent px-1 py-3 transition-colors focus:border-accento focus:outline-none"
          />

          {errore && (
            <p id="errore-accesso" role="alert" className="mt-3 text-sm text-red-600 scuro:text-red-400">
              {errore}
            </p>
          )}

          <button
            type="submit"
            disabled={invio || password.length === 0}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 bg-accento px-6 py-3.5 text-[0.72rem] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-accento-forte disabled:opacity-50 scuro:text-notte"
          >
            {invio ? 'Verifica…' : 'Entra'}
            {!invio && <Icona nome="freccia" className="size-4" />}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-tenue">
          <a href="/" className="underline underline-offset-4 transition-colors hover:text-accento">
            Torna al sito
          </a>
        </p>
      </div>
    </div>
  )
}
