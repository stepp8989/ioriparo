'use client'

import { useState, type FormEvent } from 'react'
import { Simbolo } from '@/componenti/layout/Marchio'
import { Bottone } from '@/componenti/ui/Bottone'
import { Campo, Esito } from '@/componenti/ui/campi'
import { AZIENDA } from '@/dati/azienda'

/**
 * Schermata di accesso al pannello.
 *
 * Un solo campo: la password condivisa dello staff. Quando il server risponde
 * che la configurazione manca, lo si dice chiaramente invece di far provare
 * password a vuoto — è l'errore più frequente al primo avvio in produzione.
 */
export function Accesso({ onEntrato }: { onEntrato: () => void }) {
  const [password, setPassword] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [invio, setInvio] = useState(false)

  async function accedi(evento: FormEvent) {
    evento.preventDefault()
    if (invio) return

    setInvio(true)
    setMessaggio('')

    try {
      const risposta = await fetch('/api/accesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const dati = (await risposta.json()) as { errore?: string }

      if (!risposta.ok) {
        setMessaggio(dati.errore ?? 'Accesso non riuscito.')
        return
      }

      onEntrato()
    } catch {
      setMessaggio('Server non raggiungibile.')
    } finally {
      setInvio(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sfondo px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center">
          <Simbolo className="mx-auto size-14" />
          <h1 className="mt-6 font-titolo text-[1.5rem] font-semibold">Pannello di gestione</h1>
          <p className="mt-2 text-[0.9rem] text-tenue">{AZIENDA.nomeCompleto}</p>
        </div>

        <form onSubmit={accedi} className="mt-10 space-y-5">
          <Campo
            etichetta="Password"
            type="password"
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            required
            autoFocus
            autoComplete="current-password"
            icona="lucchetto"
          />

          <Esito testo={messaggio} tipo="errore" />

          <Bottone type="submit" className="w-full" disabled={invio}>
            {invio ? 'Verifica in corso…' : 'Entra'}
          </Bottone>
        </form>

        <p className="mt-8 text-center text-[0.8rem] leading-relaxed text-tenue">
          Area riservata allo staff. Il sito pubblico è{' '}
          <a href="/" className="text-accento sottolinea">
            qui
          </a>
          .
        </p>
      </div>
    </div>
  )
}
