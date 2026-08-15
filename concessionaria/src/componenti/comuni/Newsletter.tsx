'use client'

import { useState, type FormEvent } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { emailValida } from '@/lib/utili'

/**
 * Iscrizione alla newsletter.
 *
 * Il controllo dell'indirizzo avviene anche qui, prima di partire: evita un
 * viaggio inutile al server e dà una risposta immediata a chi ha sbagliato a
 * digitare. Il controllo vero resta comunque quello della rotta API.
 */
export function Newsletter({ chiaro = false }: { chiaro?: boolean }) {
  const [email, setEmail] = useState('')
  const [stato, setStato] = useState<'fermo' | 'invio' | 'fatto' | 'errore'>('fermo')
  const [messaggio, setMessaggio] = useState('')

  async function invia(evento: FormEvent) {
    evento.preventDefault()

    if (!emailValida(email)) {
      setStato('errore')
      setMessaggio('Controllate l’indirizzo email.')
      return
    }

    setStato('invio')

    try {
      const risposta = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const dati = (await risposta.json()) as { errore?: string }

      if (!risposta.ok) {
        setStato('errore')
        setMessaggio(dati.errore ?? 'Iscrizione non riuscita. Riprovate più tardi.')
        return
      }

      setStato('fatto')
      setMessaggio('Iscrizione registrata. Grazie!')
      setEmail('')
    } catch {
      setStato('errore')
      setMessaggio('Connessione non riuscita. Riprovate più tardi.')
    }
  }

  const testoTenue = chiaro ? 'text-white/55' : 'text-tenue'

  return (
    <div>
      <form onSubmit={invia} className="flex gap-2" noValidate>
        <label htmlFor="newsletter-email" className="sr-only">
          Il vostro indirizzo email
        </label>
        <input
          id="newsletter-email"
          type="email"
          value={email}
          onChange={(evento) => setEmail(evento.target.value)}
          placeholder="La vostra email"
          autoComplete="email"
          disabled={stato === 'invio'}
          className={
            chiaro
              ? 'min-w-0 flex-1 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-[0.9rem] text-white placeholder:text-white/40 focus:border-accento focus:outline-none'
              : 'min-w-0 flex-1 rounded-full border border-bordo bg-superficie px-5 py-3 text-[0.9rem] focus:border-accento focus:outline-none'
          }
        />
        <button
          type="submit"
          disabled={stato === 'invio'}
          className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-accento text-white transition-all duration-300 hover:bg-accento-forte disabled:opacity-50"
          aria-label="Iscrivetemi alla newsletter"
        >
          <Icona nome={stato === 'fatto' ? 'spunta' : 'freccia'} className="size-[1.1rem]" />
        </button>
      </form>

      <p
        role="status"
        className={`mt-3 text-[0.78rem] leading-relaxed ${
          stato === 'errore' ? 'text-red-400' : stato === 'fatto' ? 'text-emerald-400' : testoTenue
        }`}
      >
        {messaggio ||
          'Novità, offerte e consigli di manutenzione. Un messaggio al mese, niente di più.'}
      </p>
    </div>
  )
}
