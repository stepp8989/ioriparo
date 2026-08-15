'use client'

import { useState, type FormEvent } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta, Spunta } from '@/componenti/ui/campi'
import { TRATTAMENTI } from '@/dati/servizi'
import { emailValida, fraGiorni, oggiIso, prezzo, telefonoValido } from '@/lib/utili'

/**
 * Prenotazione di un trattamento in cabina.
 *
 * A differenza del noleggio non c'è un calendario di disponibilità: la cabina
 * lavora un veicolo alla volta e i tempi dipendono dallo stato reale della
 * vernice, che si vede solo dal vivo. Si raccoglie quindi una preferenza e la
 * si conferma per telefono — è più onesto che mostrare slot che poi saltano.
 */
export function PrenotaDetailing({ trattamentoIniziale = '' }: { trattamentoIniziale?: string }) {
  const [servizio, setServizio] = useState(
    () => TRATTAMENTI.find((voce) => voce.id === trattamentoIniziale)?.id ?? TRATTAMENTI[0].id,
  )
  const [stato, setStato] = useState<'fermo' | 'invio' | 'fatto'>('fermo')
  const [messaggio, setMessaggio] = useState('')
  const [codice, setCodice] = useState('')

  const scelto = TRATTAMENTI.find((voce) => voce.id === servizio) ?? TRATTAMENTI[0]

  async function invia(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (stato === 'invio') return

    const modulo = new FormData(evento.currentTarget)
    const valore = (nome: string) => String(modulo.get(nome) ?? '').trim()

    if (!emailValida(valore('email'))) {
      setMessaggio('Controllate l’indirizzo email.')
      return
    }
    if (!telefonoValido(valore('telefono'))) {
      setMessaggio('Controllate il numero di telefono.')
      return
    }

    setStato('invio')
    setMessaggio('')

    try {
      const risposta = await fetch('/api/appuntamenti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          servizio,
          nome: valore('nome'),
          cognome: valore('cognome'),
          telefono: valore('telefono'),
          email: valore('email'),
          veicolo: valore('veicolo'),
          targa: valore('targa'),
          data: valore('data'),
          ora: valore('ora'),
          note: valore('note'),
        }),
      })

      const dati = (await risposta.json()) as { codice?: string; errore?: string }

      if (!risposta.ok) {
        setStato('fermo')
        setMessaggio(dati.errore ?? 'Invio non riuscito. Riprovate o chiamateci.')
        return
      }

      setCodice(dati.codice ?? '')
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
        <h3 className="mt-5 font-titolo text-[1.4rem] font-semibold">Appuntamento richiesto</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-tenue">
          Vi confermiamo l’orario per telefono entro poche ore, dopo aver verificato la
          disponibilità della cabina.
        </p>
        {codice && (
          <p className="mt-6 inline-flex items-center gap-3 rounded-full border border-bordo bg-superficie px-5 py-2.5">
            <span className="text-[0.8rem] text-tenue">Codice</span>
            <span className="font-titolo text-[1.1rem] font-semibold tabellare">{codice}</span>
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={invia} className="grid gap-8 lg:grid-cols-[1fr_20rem]" noValidate>
      <div className="space-y-5">
        <Scelta
          etichetta="Trattamento"
          value={servizio}
          onChange={(evento) => setServizio(evento.target.value)}
          required
        >
          {TRATTAMENTI.map((trattamento) => (
            <option key={trattamento.id} value={trattamento.id}>
              {trattamento.nome} — da {prezzo(trattamento.prezzoDa)}
            </option>
          ))}
        </Scelta>

        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etichetta="Nome" name="nome" required minLength={2} autoComplete="given-name" />
          <Campo
            etichetta="Cognome"
            name="cognome"
            required
            minLength={2}
            autoComplete="family-name"
          />
          <Campo
            etichetta="Telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            icona="telefono"
          />
          <Campo
            etichetta="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            icona="posta"
          />
          <Campo
            etichetta="Veicolo"
            name="veicolo"
            required
            placeholder="Marca e modello"
            icona="auto"
          />
          <Campo etichetta="Targa" name="targa" placeholder="AB123CD" icona="targa" />
          <Campo
            etichetta="Giorno preferito"
            name="data"
            type="date"
            required
            min={oggiIso()}
            max={fraGiorni(120)}
            defaultValue={fraGiorni(3)}
          />
          <Scelta etichetta="Consegna del veicolo" name="ora" required defaultValue="09:00">
            <option value="08:30">08:30</option>
            <option value="09:00">09:00</option>
            <option value="10:00">10:00</option>
            <option value="11:00">11:00</option>
            <option value="16:00">16:00</option>
            <option value="17:00">17:00</option>
          </Scelta>
        </div>

        <Area
          etichetta="Note"
          name="note"
          rows={3}
          maxLength={800}
          placeholder="Colore della vernice, difetti che vi preoccupano, se il veicolo è sempre all’aperto…"
        />

        <Spunta
          required
          name="privacy"
          etichetta={
            <>
              Ho letto l’
              <a href="/privacy" className="text-accento sottolinea">
                informativa sulla privacy
              </a>
              .
            </>
          }
        />

        <Esito testo={messaggio} tipo="errore" />
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-ampio border border-bordo bg-superficie p-6 shadow-morbida">
          <h3 className="font-titolo text-[1.05rem] font-semibold">{scelto.nome}</h3>
          <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">{scelto.descrizione}</p>

          <p className="mt-5 border-t border-bordo pt-5">
            <span className="text-[0.8rem] text-tenue">A partire da</span>
            <span className="mt-1 block font-titolo text-[1.8rem] leading-none font-semibold tabellare">
              {prezzo(scelto.prezzoDa)}
            </span>
          </p>

          <ul className="mt-5 space-y-2 border-t border-bordo pt-5 text-[0.85rem] text-tenue">
            {scelto.comprende.slice(0, 5).map((voce) => (
              <li key={voce} className="flex items-start gap-2.5">
                <Icona nome="spunta" className="mt-0.5 size-3.5 shrink-0 text-accento" />
                {voce}
              </li>
            ))}
          </ul>

          <Bottone type="submit" className="mt-6 w-full" disabled={stato === 'invio'}>
            {stato === 'invio' ? 'Invio in corso…' : 'Richiedi l’appuntamento'}
          </Bottone>

          <p className="mt-4 text-[0.75rem] leading-relaxed text-tenue">
            Il prezzo definitivo dipende dalla dimensione del veicolo e dallo stato della vernice:
            ve lo confermiamo prima di iniziare, mai dopo.
          </p>
        </div>
      </aside>
    </form>
  )
}
