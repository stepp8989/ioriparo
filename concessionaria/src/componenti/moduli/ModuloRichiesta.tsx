'use client'

import { useState, type FormEvent } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta, Spunta } from '@/componenti/ui/campi'
import { AZIENDA } from '@/dati/azienda'
import type { TipoRichiesta } from '@/lib/tipi'
import {
  emailValida,
  fraGiorni,
  oggiIso,
  percentuale,
  prezzo,
  rataMensile,
  telefonoValido,
} from '@/lib/utili'

/**
 * Modulo unico per tutte le richieste commerciali.
 *
 * Cambia i campi in base al tipo — informazioni, test drive, finanziamento,
 * permuta, preventivo — ma resta un solo componente e una sola rotta API: le
 * differenze sono poche e tenerle insieme evita cinque moduli quasi identici
 * che poi divergono nel tempo.
 *
 * I controlli qui servono a dare risposta immediata; quelli che contano
 * davvero restano lato server, perché nessun controllo fatto nel browser è
 * garantito.
 */

const INTESTAZIONI: Record<TipoRichiesta, { titolo: string; testo: string }> = {
  informazioni: {
    titolo: 'Richiedi informazioni',
    testo: 'Vi rispondiamo entro un giorno lavorativo, di solito molto prima.',
  },
  'test-drive': {
    titolo: 'Prenota il test drive',
    testo: 'Indicate quando vi fa comodo: confermiamo l’orario per telefono. Servono patente e documento d’identità.',
  },
  finanziamento: {
    titolo: 'Richiedi il finanziamento',
    testo: 'Confrontiamo le proposte di più istituti e vi mandiamo il preventivo firmato entro ventiquattro ore.',
  },
  permuta: {
    titolo: 'Valuta il tuo usato',
    testo: 'Valutazione gratuita entro quarantotto ore, basata sulle quotazioni di mercato.',
  },
  preventivo: {
    titolo: 'Richiedi un preventivo',
    testo: 'Scriveteci cosa cercate: vi facciamo una proposta concreta, senza impegno.',
  },
}

export function ModuloRichiesta({
  tipo,
  veicoloId = null,
  veicoloTitolo = '',
  prezzoVeicolo = 0,
  conIntestazione = true,
}: {
  tipo: TipoRichiesta
  veicoloId?: string | null
  veicoloTitolo?: string
  /** Serve a proporre un anticipo e una rata sensati sul finanziamento. */
  prezzoVeicolo?: number
  conIntestazione?: boolean
}) {
  const [stato, setStato] = useState<'fermo' | 'invio' | 'fatto'>('fermo')
  const [messaggio, setMessaggio] = useState('')
  const [codice, setCodice] = useState('')

  // Finanziamento: anticipo e durata sono gli unici due valori che il cliente
  // sceglie qui; la rata si aggiorna sotto mentre li muove.
  const [anticipo, setAnticipo] = useState(() => Math.round((prezzoVeicolo * 0.2) / 100) * 100)
  const [durata, setDurata] = useState(60)

  const importo = Math.max(prezzoVeicolo - anticipo, 0)
  const rata = rataMensile(
    importo + AZIENDA.finanziamento.speseIstruttoria,
    AZIENDA.finanziamento.tanPredefinito,
    durata,
  )

  const intestazione = INTESTAZIONI[tipo]

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

    const corpo: Record<string, unknown> = {
      tipo,
      veicoloId,
      veicoloTitolo,
      nome: valore('nome'),
      cognome: valore('cognome'),
      telefono: valore('telefono'),
      email: valore('email'),
      messaggio: valore('messaggio'),
    }

    if (tipo === 'test-drive') {
      corpo.data = valore('data')
      corpo.ora = valore('ora')
    }

    if (tipo === 'finanziamento') {
      corpo.finanziamento = {
        importo,
        anticipo,
        durataMesi: durata,
        rata: Math.round(rata * 100) / 100,
        taeg: AZIENDA.finanziamento.taegPredefinito,
      }
    }

    if (tipo === 'permuta') {
      corpo.permuta = {
        marca: valore('permutaMarca'),
        modello: valore('permutaModello'),
        anno: Number(valore('permutaAnno')),
        chilometri: Number(valore('permutaKm')),
      }
    }

    try {
      const risposta = await fetch('/api/richieste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo),
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
      <div className="rounded-ampio border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
        <span className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
          <Icona nome="verifica" className="size-7" />
        </span>
        <h3 className="mt-5 font-titolo text-[1.3rem] font-semibold">Richiesta ricevuta</h3>
        <p className="mx-auto mt-3 max-w-md text-[0.95rem] leading-relaxed text-tenue">
          Vi abbiamo mandato una conferma per email. Un consulente vi risponde entro un giorno
          lavorativo.
        </p>
        {codice && (
          <p className="mt-5 text-[0.85rem] text-tenue">
            Codice della pratica:{' '}
            <span className="font-semibold text-testo tabellare">{codice}</span>
          </p>
        )}
        <p className="mt-6 text-[0.85rem] text-tenue">
          Per parlarne subito:{' '}
          <a href={`tel:${AZIENDA.telefonoLink}`} className="font-semibold text-accento sottolinea">
            {AZIENDA.telefono}
          </a>
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={invia} className="space-y-5" noValidate>
      {conIntestazione && (
        <div>
          <h3 className="font-titolo text-[1.35rem] font-semibold">{intestazione.titolo}</h3>
          <p className="mt-2 text-[0.9rem] leading-relaxed text-tenue">{intestazione.testo}</p>
        </div>
      )}

      {veicoloTitolo && (
        <p className="flex items-center gap-2.5 rounded-tenue border border-bordo bg-superficie-alt px-4 py-3 text-[0.88rem]">
          <Icona nome="auto" className="size-4 shrink-0 text-accento" />
          <span className="text-tenue">Veicolo:</span>
          <span className="font-semibold">{veicoloTitolo}</span>
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etichetta="Nome" name="nome" required minLength={2} autoComplete="given-name" />
        <Campo etichetta="Cognome" name="cognome" required minLength={2} autoComplete="family-name" />
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
      </div>

      {tipo === 'test-drive' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo
            etichetta="Giorno preferito"
            name="data"
            type="date"
            required
            min={oggiIso()}
            max={fraGiorni(90)}
            defaultValue={fraGiorni(2)}
          />
          <Scelta etichetta="Fascia oraria" name="ora" required defaultValue="10:00">
            <option value="09:00">Mattina — 09:00</option>
            <option value="10:00">Mattina — 10:00</option>
            <option value="11:00">Mattina — 11:00</option>
            <option value="12:00">Mattina — 12:00</option>
            <option value="16:00">Pomeriggio — 16:00</option>
            <option value="17:00">Pomeriggio — 17:00</option>
            <option value="18:00">Pomeriggio — 18:00</option>
          </Scelta>
        </div>
      )}

      {tipo === 'finanziamento' && prezzoVeicolo > 0 && (
        <div className="rounded-morbido border border-bordo bg-superficie-alt p-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="anticipo"
                className="mb-2 block text-[0.75rem] font-semibold tracking-[0.14em] text-tenue uppercase"
              >
                Anticipo
              </label>
              <input
                id="anticipo"
                type="range"
                min={0}
                max={Math.round(prezzoVeicolo * 0.6)}
                step={500}
                value={anticipo}
                onChange={(evento) => setAnticipo(Number(evento.target.value))}
                className="w-full accent-[var(--accento)]"
              />
              <p className="mt-1 text-[0.9rem] font-semibold tabellare">{prezzo(anticipo)}</p>
            </div>

            <Scelta
              etichetta="Durata"
              value={durata}
              onChange={(evento) => setDurata(Number(evento.target.value))}
            >
              {AZIENDA.finanziamento.durateMesi.map((mesi) => (
                <option key={mesi} value={mesi}>
                  {mesi} mesi
                </option>
              ))}
            </Scelta>
          </div>

          <p className="mt-5 border-t border-bordo pt-4 text-[0.9rem] text-tenue">
            Rata indicativa:{' '}
            <span className="font-titolo text-[1.25rem] font-semibold text-accento tabellare">
              {prezzo(Math.round(rata))}
            </span>{' '}
            al mese · TAN {percentuale(AZIENDA.finanziamento.tanPredefinito)} · TAEG{' '}
            {percentuale(AZIENDA.finanziamento.taegPredefinito)}
          </p>
          <p className="mt-2 text-[0.75rem] leading-relaxed text-tenue">
            Calcolo indicativo, non è un’offerta contrattuale. Il preventivo definitivo dipende
            dall’istruttoria dell’istituto di credito.
          </p>
        </div>
      )}

      {tipo === 'permuta' && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Campo etichetta="Marca del vostro veicolo" name="permutaMarca" required />
          <Campo etichetta="Modello" name="permutaModello" required />
          <Campo
            etichetta="Anno di immatricolazione"
            name="permutaAnno"
            type="number"
            min={1970}
            max={new Date().getFullYear()}
            required
          />
          <Campo
            etichetta="Chilometri"
            name="permutaKm"
            type="number"
            min={0}
            max={999_999}
            required
          />
        </div>
      )}

      <Area
        etichetta="Messaggio"
        name="messaggio"
        rows={4}
        maxLength={1200}
        placeholder={
          tipo === 'permuta'
            ? 'Stato del veicolo, tagliandi, eventuali danni…'
            : 'Scriveteci pure quello che vi serve sapere.'
        }
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
            e acconsento al trattamento dei dati per rispondere alla mia richiesta.
          </>
        }
      />

      <Esito testo={messaggio} tipo="errore" />

      <Bottone type="submit" disabled={stato === 'invio'} className="w-full sm:w-auto">
        {stato === 'invio' ? 'Invio in corso…' : intestazione.titolo}
        {stato !== 'invio' && <Icona nome="freccia" className="size-4" />}
      </Bottone>
    </form>
  )
}
