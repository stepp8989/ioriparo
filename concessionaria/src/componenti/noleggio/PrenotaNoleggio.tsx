'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Calendario } from '@/componenti/noleggio/Calendario'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta, Spunta } from '@/componenti/ui/campi'
import { AZIENDA } from '@/dati/azienda'
import { calcolaTotale, formulaApplicata } from '@/lib/noleggio'
import {
  NOMI_METODO_PAGAMENTO,
  type MetodoPagamento,
  type Veicolo,
} from '@/lib/tipi'
import {
  classi,
  emailValida,
  giorniFra,
  prezzo,
  telefonoValido,
  titoloVeicolo,
} from '@/lib/utili'

/**
 * Prenotazione del noleggio.
 *
 * Tre passaggi: veicolo, periodo, dati e pagamento. Il totale si aggiorna a
 * ogni scelta ed è calcolato con le stesse regole del server — la formula più
 * conveniente fra giornaliera, settimanale e mensile viene applicata
 * automaticamente, senza che il cliente debba indovinare quale scegliere.
 *
 * Il prezzo mostrato qui resta comunque indicativo: quello che vale è il
 * totale ricalcolato dalla rotta API al momento della conferma, perché i dati
 * nel browser sono modificabili.
 */

export function PrenotaNoleggio({
  veicoli,
  veicoloIniziale = '',
  metodiPagamento,
}: {
  veicoli: Veicolo[]
  veicoloIniziale?: string
  /** Metodi realmente configurati sul server. */
  metodiPagamento: MetodoPagamento[]
}) {
  const [veicoloId, setVeicoloId] = useState(
    () => veicoli.find((veicolo) => veicolo.slug === veicoloIniziale)?.id ?? veicoli[0]?.id ?? '',
  )
  const [dal, setDal] = useState('')
  const [al, setAl] = useState('')
  const [occupati, setOccupati] = useState<string[]>([])
  const [domicilio, setDomicilio] = useState(false)
  const [pagamento, setPagamento] = useState<MetodoPagamento>(metodiPagamento[0] ?? 'in-sede')
  const [stato, setStato] = useState<'fermo' | 'invio' | 'fatto'>('fermo')
  const [messaggio, setMessaggio] = useState('')
  const [codice, setCodice] = useState('')

  const veicolo = useMemo(
    () => veicoli.find((voce) => voce.id === veicoloId) ?? null,
    [veicoli, veicoloId],
  )

  const giorni = dal && al ? giorniFra(dal, al) : 0
  const totale = veicolo?.noleggio ? calcolaTotale(veicolo.noleggio, giorni) : 0

  /**
   * Le date già impegnate si chiedono al server a ogni cambio di veicolo.
   * `annullato` evita che una risposta lenta sul veicolo precedente arrivi dopo
   * quella del veicolo nuovo e sovrascriva il calendario giusto.
   */
  useEffect(() => {
    if (!veicoloId) return

    let annullato = false
    setOccupati([])

    fetch(`/api/noleggi/disponibilita?veicolo=${encodeURIComponent(veicoloId)}`)
      .then((risposta) => (risposta.ok ? risposta.json() : { occupati: [] }))
      .then((dati: { occupati?: string[] }) => {
        if (!annullato) setOccupati(dati.occupati ?? [])
      })
      .catch(() => undefined)

    return () => {
      annullato = true
    }
  }, [veicoloId])

  // Cambiando veicolo il periodo scelto potrebbe non essere più libero.
  useEffect(() => {
    setDal('')
    setAl('')
  }, [veicoloId])

  async function invia(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (stato === 'invio' || !veicolo) return

    const modulo = new FormData(evento.currentTarget)
    const valore = (nome: string) => String(modulo.get(nome) ?? '').trim()

    if (!dal || !al) {
      setMessaggio('Scegliete il periodo sul calendario.')
      return
    }
    if (!emailValida(valore('email'))) {
      setMessaggio('Controllate l’indirizzo email.')
      return
    }
    if (!telefonoValido(valore('telefono'))) {
      setMessaggio('Controllate il numero di telefono.')
      return
    }
    if (domicilio && valore('indirizzoConsegna').length < 6) {
      setMessaggio('Indicate l’indirizzo per la consegna a domicilio.')
      return
    }

    setStato('invio')
    setMessaggio('')

    try {
      const risposta = await fetch('/api/noleggi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          veicoloId,
          dal,
          al,
          nome: valore('nome'),
          cognome: valore('cognome'),
          email: valore('email'),
          telefono: valore('telefono'),
          consegnaDomicilio: domicilio,
          indirizzoConsegna: valore('indirizzoConsegna'),
          note: valore('note'),
          pagamento,
        }),
      })

      const dati = (await risposta.json()) as {
        codice?: string
        urlPagamento?: string
        errore?: string
      }

      if (!risposta.ok) {
        setStato('fermo')
        setMessaggio(dati.errore ?? 'Prenotazione non riuscita. Riprovate o chiamateci.')
        return
      }

      // Pagamento online: si prosegue sul servizio scelto. Il noleggio è già
      // registrato, quindi anche se il cliente abbandona il pagamento la
      // richiesta resta visibile nel pannello.
      if (dati.urlPagamento) {
        window.location.href = dati.urlPagamento
        return
      }

      setCodice(dati.codice ?? '')
      setStato('fatto')
    } catch {
      setStato('fermo')
      setMessaggio('Connessione non riuscita. Riprovate o chiamateci.')
    }
  }

  if (veicoli.length === 0) {
    return (
      <p className="rounded-ampio border border-dashed border-bordo-forte p-10 text-center text-tenue">
        Al momento non ci sono veicoli disponibili a noleggio. Chiamateci allo {AZIENDA.telefono}:
        la flotta cambia di continuo.
      </p>
    )
  }

  if (stato === 'fatto') {
    return (
      <div className="rounded-ampio border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <Icona nome="verifica" className="size-7" />
        </span>
        <h3 className="mt-5 font-titolo text-[1.4rem] font-semibold">Noleggio registrato</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-tenue">
          Vi abbiamo mandato la conferma per email con tutti i dettagli. Al ritiro servono patente
          e documento d’identità in corso di validità.
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
    <form onSubmit={invia} className="grid gap-10 lg:grid-cols-[1fr_22rem]" noValidate>
      <div className="space-y-10">
        <div>
          <h3 className="mb-5 flex items-center gap-3 font-titolo text-[1.2rem] font-semibold">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-accento text-[0.8rem] text-white">
              1
            </span>
            Scegliete il veicolo
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {veicoli.map((voce) => (
              <button
                key={voce.id}
                type="button"
                onClick={() => setVeicoloId(voce.id)}
                aria-pressed={voce.id === veicoloId}
                className={classi(
                  'rounded-morbido border p-4 text-left transition-all duration-300',
                  voce.id === veicoloId
                    ? 'border-accento bg-accento/5 shadow-morbida'
                    : 'border-bordo hover:border-bordo-forte',
                )}
              >
                <span className="block text-[0.7rem] tracking-[0.16em] text-accento uppercase">
                  {voce.marca}
                </span>
                <span className="mt-1 block font-semibold">{voce.modello}</span>
                <span className="mt-2 block text-[0.85rem] text-tenue tabellare">
                  da {prezzo(voce.noleggio?.giornaliera ?? 0)} al giorno
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-5 flex items-center gap-3 font-titolo text-[1.2rem] font-semibold">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-accento text-[0.8rem] text-white">
              2
            </span>
            Scegliete il periodo
          </h3>

          <Calendario
            occupati={occupati}
            dal={dal}
            al={al}
            onCambia={(nuovoDal, nuovoAl) => {
              setDal(nuovoDal)
              setAl(nuovoAl)
            }}
          />

          <p className="mt-3 text-[0.82rem] text-tenue">
            {!dal
              ? 'Toccate il giorno di ritiro.'
              : !al
                ? 'Ora toccate il giorno di riconsegna.'
                : `Dal ${dal} al ${al} — ${giorni} ${giorni === 1 ? 'giorno' : 'giorni'}.`}
          </p>
        </div>

        <div>
          <h3 className="mb-5 flex items-center gap-3 font-titolo text-[1.2rem] font-semibold">
            <span className="inline-flex size-7 items-center justify-center rounded-full bg-accento text-[0.8rem] text-white">
              3
            </span>
            I vostri dati
          </h3>

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
              etichetta="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              icona="posta"
            />
            <Campo
              etichetta="Telefono"
              name="telefono"
              type="tel"
              required
              autoComplete="tel"
              icona="telefono"
            />
          </div>

          {veicolo?.noleggio?.consegnaDomicilio && (
            <div className="mt-5 space-y-4">
              <Spunta
                etichetta="Voglio la consegna a domicilio (gratuita entro 30 km da Tortolì, da 3 giorni di noleggio)"
                checked={domicilio}
                onChange={(evento) => setDomicilio(evento.target.checked)}
              />
              {domicilio && (
                <Campo
                  etichetta="Indirizzo di consegna"
                  name="indirizzoConsegna"
                  required
                  icona="posizione"
                  placeholder="Via, numero civico, città"
                />
              )}
            </div>
          )}

          <Area
            etichetta="Note"
            name="note"
            rows={3}
            maxLength={600}
            className="mt-5"
            placeholder="Orario di ritiro preferito, seggiolino, secondo conducente…"
          />

          <Scelta
            etichetta="Pagamento"
            className="mt-5"
            value={pagamento}
            onChange={(evento) => setPagamento(evento.target.value as MetodoPagamento)}
          >
            {metodiPagamento.map((metodo) => (
              <option key={metodo} value={metodo}>
                {NOMI_METODO_PAGAMENTO[metodo]}
              </option>
            ))}
          </Scelta>

          <Spunta
            required
            name="privacy"
            className="mt-5"
            etichetta={
              <>
                Ho letto l’
                <a href="/privacy" className="text-accento sottolinea">
                  informativa sulla privacy
                </a>{' '}
                e i{' '}
                <a href="/termini" className="text-accento sottolinea">
                  termini di noleggio
                </a>
                .
              </>
            }
          />
        </div>
      </div>

      {/* Riepilogo: resta visibile mentre si compila. */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-ampio border border-bordo bg-superficie p-6 shadow-morbida">
          <h3 className="font-titolo text-[1.1rem] font-semibold">Riepilogo</h3>

          {veicolo ? (
            <>
              <p className="mt-4 text-[0.95rem] font-semibold">{titoloVeicolo(veicolo)}</p>

              <dl className="mt-5 space-y-3 border-t border-bordo pt-5 text-[0.88rem]">
                <div className="flex justify-between gap-4">
                  <dt className="text-tenue">Periodo</dt>
                  <dd className="text-right font-medium">
                    {dal && al ? `${dal} → ${al}` : 'da scegliere'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-tenue">Giorni</dt>
                  <dd className="font-medium tabellare">{giorni || '—'}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-tenue">Formula</dt>
                  <dd className="font-medium">
                    {giorni > 0 ? formulaApplicata(giorni) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-tenue">Km inclusi</dt>
                  <dd className="font-medium tabellare">
                    {veicolo.noleggio ? `${veicolo.noleggio.kmInclusiGiorno * (giorni || 1)}` : '—'}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 border-t border-bordo pt-5">
                <div className="flex items-baseline justify-between gap-4">
                  <span className="text-[0.9rem] text-tenue">Totale</span>
                  <span className="font-titolo text-[1.8rem] leading-none font-semibold tabellare">
                    {prezzo(totale)}
                  </span>
                </div>
                <p className="mt-2 text-[0.78rem] text-tenue">
                  Cauzione {prezzo(veicolo.noleggio?.cauzione ?? 0)}, restituita alla riconsegna.
                  Assicurazione kasko e soccorso stradale inclusi.
                </p>
              </div>

              <Bottone
                type="submit"
                className="mt-6 w-full"
                disabled={stato === 'invio' || giorni === 0}
              >
                {stato === 'invio' ? 'Invio in corso…' : 'Conferma il noleggio'}
              </Bottone>

              <Esito testo={messaggio} tipo="errore" />

              <p className="mt-4 text-[0.75rem] leading-relaxed text-tenue">
                Età minima {veicolo.noleggio?.etaMinima} anni, patente da almeno due anni. Nessun
                addebito finché non confermiamo la disponibilità.
              </p>
            </>
          ) : (
            <p className="mt-4 text-[0.9rem] text-tenue">Scegliete un veicolo per continuare.</p>
          )}
        </div>
      </aside>
    </form>
  )
}
