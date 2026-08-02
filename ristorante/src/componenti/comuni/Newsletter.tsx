'use client'

import { useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { emailValida } from '@/lib/utili'

type Stato = 'pronto' | 'invio' | 'fatto' | 'errore'

/**
 * Iscrizione alla newsletter.
 *
 * La validazione avviene prima in pagina, per dare una risposta immediata, e
 * poi di nuovo sul server, che è l'unico controllo di cui ci si può fidare.
 */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [stato, setStato] = useState<Stato>('pronto')
  const [messaggio, setMessaggio] = useState('')

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()

    if (!emailValida(email)) {
      setStato('errore')
      setMessaggio('Controlla l’indirizzo email.')
      return
    }

    setStato('invio')
    try {
      const risposta = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const dati = await risposta.json()

      if (!risposta.ok) throw new Error(dati.errore ?? 'Errore imprevisto.')

      setStato('fatto')
      setMessaggio(dati.messaggio ?? 'Iscrizione registrata.')
      setEmail('')
    } catch (errore) {
      setStato('errore')
      setMessaggio(errore instanceof Error ? errore.message : 'Riprova fra qualche istante.')
    }
  }

  return (
    <form onSubmit={invia} className="w-full" noValidate>
      <label htmlFor="newsletter-email" className="mb-3 block text-sm text-white/60">
        Ricevi il menù di stagione e gli inviti alle serate speciali.
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="newsletter-email"
          type="email"
          name="email"
          value={email}
          onChange={(evento) => {
            setEmail(evento.target.value)
            if (stato !== 'pronto') setStato('pronto')
          }}
          placeholder="La tua email"
          autoComplete="email"
          required
          aria-describedby="newsletter-esito"
          aria-invalid={stato === 'errore'}
          className="min-w-0 flex-1 border-b border-white/25 bg-transparent px-1 py-3 text-white placeholder:text-white/35 transition-colors focus:border-accento focus:outline-none"
        />

        <button
          type="submit"
          disabled={stato === 'invio'}
          className="inline-flex items-center justify-center gap-2 border border-accento px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.18em] text-accento transition-all duration-400 hover:bg-accento hover:text-notte disabled:opacity-50"
        >
          {stato === 'invio' ? 'Invio…' : 'Iscriviti'}
          <Icona nome="freccia" className="size-4" />
        </button>
      </div>

      {/* Il messaggio viene annunciato dalle tecnologie assistive senza spostare il fuoco. */}
      <p
        id="newsletter-esito"
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-5 text-sm ${stato === 'errore' ? 'text-red-300' : 'text-accento-tenue'}`}
      >
        {messaggio}
      </p>
    </form>
  )
}
