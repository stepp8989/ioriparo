'use client'

import { useState, type FormEvent } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta, Spunta } from '@/componenti/ui/campi'
import { AZIENDA } from '@/dati/azienda'
import { emailValida } from '@/lib/utili'

/**
 * Modulo contatti generico.
 *
 * Diverso da `ModuloRichiesta`: qui non c'è un veicolo né una pratica da
 * aprire, solo un messaggio che finisce nella casella dello staff. L'oggetto
 * scelto dal menu serve a smistarlo al reparto giusto senza doverlo leggere.
 */

const OGGETTI = [
  'Informazioni su un veicolo',
  'Noleggio',
  'Detailing e trattamenti',
  'Finanziamento o permuta',
  'Assistenza e officina',
  'Altro',
]

export function ModuloContatti() {
  const [stato, setStato] = useState<'fermo' | 'invio' | 'fatto'>('fermo')
  const [messaggio, setMessaggio] = useState('')

  async function invia(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (stato === 'invio') return

    const modulo = new FormData(evento.currentTarget)
    const valore = (nome: string) => String(modulo.get(nome) ?? '').trim()

    if (!emailValida(valore('email'))) {
      setMessaggio('Controllate l’indirizzo email.')
      return
    }
    if (valore('testo').length < 10) {
      setMessaggio('Scriveteci qualche parola in più: almeno dieci caratteri.')
      return
    }

    setStato('invio')
    setMessaggio('')

    try {
      const risposta = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: valore('nome'),
          email: valore('email'),
          telefono: valore('telefono'),
          oggetto: valore('oggetto'),
          testo: valore('testo'),
        }),
      })

      const dati = (await risposta.json()) as { errore?: string }

      if (!risposta.ok) {
        setStato('fermo')
        setMessaggio(dati.errore ?? 'Invio non riuscito. Riprovate o chiamateci.')
        return
      }

      setStato('fatto')
    } catch {
      setStato('fermo')
      setMessaggio('Connessione non riuscita. Riprovate o chiamateci.')
    }
  }

  if (stato === 'fatto') {
    return (
      <div className="rounded-ampio border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <Icona nome="verifica" className="size-7" />
        </span>
        <h3 className="mt-5 font-titolo text-[1.3rem] font-semibold">Messaggio inviato</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-tenue">
          Grazie: vi rispondiamo entro un giorno lavorativo. Se avete fretta, chiamate lo{' '}
          <a href={`tel:${AZIENDA.telefonoLink}`} className="font-semibold text-accento sottolinea">
            {AZIENDA.telefono}
          </a>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={invia} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etichetta="Nome e cognome" name="nome" required minLength={2} autoComplete="name" />
        <Campo
          etichetta="Email"
          name="email"
          type="email"
          required
          autoComplete="email"
          icona="posta"
        />
        <Campo etichetta="Telefono" name="telefono" type="tel" autoComplete="tel" icona="telefono" />
        <Scelta etichetta="Oggetto" name="oggetto" required defaultValue={OGGETTI[0]}>
          {OGGETTI.map((oggetto) => (
            <option key={oggetto} value={oggetto}>
              {oggetto}
            </option>
          ))}
        </Scelta>
      </div>

      <Area
        etichetta="Messaggio"
        name="testo"
        required
        rows={5}
        minLength={10}
        maxLength={2000}
        placeholder="Scriveteci quello che vi serve sapere."
      />

      <Spunta
        required
        name="privacy"
        etichetta={
          <>
            Ho letto l’
            <a href="/privacy" className="text-accento sottolinea">
              informativa sulla privacy
            </a>{' '}
            e acconsento al trattamento dei dati per ricevere una risposta.
          </>
        }
      />

      <Esito testo={messaggio} tipo="errore" />

      <Bottone type="submit" disabled={stato === 'invio'} className="w-full sm:w-auto">
        {stato === 'invio' ? 'Invio in corso…' : 'Invia il messaggio'}
        {stato !== 'invio' && <Icona nome="freccia" className="size-4" />}
      </Bottone>
    </form>
  )
}
