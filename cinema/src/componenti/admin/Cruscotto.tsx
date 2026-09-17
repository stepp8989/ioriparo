'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Andamento, Classifica, Riquadro } from '@/componenti/admin/Grafici'
import { NAVIGAZIONE_ADMIN } from '@/componenti/admin/navigazione'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Nota } from '@/componenti/ui/Sezione'
import type { Statistiche } from '@/lib/statistiche'
import { classi, dataBreve, numero, percentuale, prezzo } from '@/lib/utili'

/**
 * Statistiche del pannello.
 *
 * Lo stesso componente serve il cruscotto (con un periodo fisso e senza
 * filtri) e la pagina delle statistiche (con tutti i filtri): cambia solo cosa
 * si mostra attorno, non come si calcola.
 */

const PERIODI = [
  { valore: 'giorno', etichetta: 'Oggi' },
  { valore: 'settimana', etichetta: '7 giorni' },
  { valore: 'mese', etichetta: '30 giorni' },
  { valore: 'anno', etichetta: '12 mesi' },
] as const

export function Statistica({
  conFiltri = false,
  cinema = [],
}: {
  conFiltri?: boolean
  cinema?: { id: string; nome: string }[]
}) {
  const [periodo, setPeriodo] = useState<string>('settimana')
  const [cinemaId, setCinemaId] = useState('')
  const [dati, setDati] = useState<Statistiche | null>(null)
  const [caricamento, setCaricamento] = useState(true)

  useEffect(() => {
    let annullato = false
    setCaricamento(true)

    const parametri = new URLSearchParams({ periodo })
    if (cinemaId) parametri.set('cinema', cinemaId)

    fetch(`/api/admin/statistiche?${parametri}`, { cache: 'no-store' })
      .then((risposta) => (risposta.ok ? risposta.json() : null))
      .then((esito) => {
        if (!annullato) setDati(esito as Statistiche | null)
      })
      .finally(() => {
        if (!annullato) setCaricamento(false)
      })

    return () => {
      annullato = true
    }
  }, [cinemaId, periodo])

  if (caricamento && !dati) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, indice) => (
          <Scheletro key={indice} className="h-28 rounded-morbido" />
        ))}
      </div>
    )
  }

  if (!dati) {
    return (
      <Nota tono="rosso" icona={<Icona nome="avviso" className="size-4" />}>
        Non riusciamo a leggere le statistiche.
      </Nota>
    )
  }

  return (
    <div className={classi(caricamento && 'opacity-60 transition-opacity')}>
      {/* ── Filtri ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-full border border-bordo bg-superficie p-1">
          {PERIODI.map((voce) => (
            <button
              key={voce.valore}
              type="button"
              onClick={() => setPeriodo(voce.valore)}
              aria-pressed={periodo === voce.valore}
              className={classi(
                'rounded-full px-3.5 py-1.5 text-[0.82rem] font-medium transition-colors',
                periodo === voce.valore ? 'bg-accento text-white' : 'text-tenue hover:text-testo',
              )}
            >
              {voce.etichetta}
            </button>
          ))}
        </div>

        {conFiltri && cinema.length > 0 && (
          <label className="inline-flex items-center gap-2">
            <span className="sr-only">Filtra per cinema</span>
            <select
              value={cinemaId}
              onChange={(evento) => setCinemaId(evento.target.value)}
              className="rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.84rem] focus:border-accento focus:outline-none"
            >
              <option value="">Tutta la rete</option>
              {cinema.map((voce) => (
                <option key={voce.id} value={voce.id}>
                  {voce.nome}
                </option>
              ))}
            </select>
          </label>
        )}

        <p className="text-[0.82rem] text-tenue">
          {dataBreve(dati.dal)} → {dataBreve(dati.al)}
        </p>
      </div>

      {/* ── Numeri principali ───────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Riquadro
          etichetta="Incasso"
          valore={prezzo(dati.totali.incasso)}
          dettaglio={`${numero(dati.totali.ordini)} ordini · scontrino medio ${prezzo(dati.totali.scontrinoMedio)}`}
          tono="accento"
        />
        <Riquadro
          etichetta="Biglietti"
          valore={numero(dati.totali.biglietti)}
          dettaglio={`${prezzo(dati.totali.incassoBiglietti)} dai biglietti`}
        />
        <Riquadro
          etichetta="Occupazione"
          valore={percentuale(dati.occupazione.percentuale)}
          dettaglio={`${numero(dati.occupazione.postiVenduti)} su ${numero(dati.occupazione.postiOfferti)} posti offerti`}
          tono={dati.occupazione.percentuale >= 50 ? 'ok' : 'neutro'}
        />
        <Riquadro
          etichetta="Banco"
          valore={prezzo(dati.totali.incassoFood)}
          dettaglio={
            dati.totali.incasso > 0
              ? `${percentuale(Math.round((dati.totali.incassoFood / dati.totali.incasso) * 1000) / 10)} dell’incasso`
              : '—'
          }
        />
      </div>

      {/* ── Andamento ───────────────────────────────────────────────────── */}
      <div className="mt-6 rounded-ampio border border-bordo bg-superficie p-6">
        <h2 className="font-titolo text-[1.1rem] font-semibold">Andamento degli incassi</h2>
        <div className="mt-5">
          <Andamento
            titolo="Incasso giornaliero"
            punti={dati.serie.map((voce) => ({ etichetta: dataBreve(voce.data), valore: voce.incasso }))}
          />
        </div>
      </div>

      {/* ── Classifiche ─────────────────────────────────────────────────── */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-[1.05rem] font-semibold">Film più visti</h2>
          <Classifica
            titolo="Biglietti per film"
            punti={dati.film.map((voce) => ({ etichetta: voce.nome, valore: voce.biglietti }))}
          />
        </div>

        <div className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-[1.05rem] font-semibold">Orari più richiesti</h2>
          <Classifica
            titolo="Biglietti per fascia oraria"
            punti={dati.orari.map((voce) => ({ etichetta: voce.ora, valore: voce.biglietti }))}
          />
        </div>

        <div className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-[1.05rem] font-semibold">Incasso per cinema</h2>
          <Classifica
            titolo="Incasso per cinema"
            formato="euro"
            punti={dati.cinema.map((voce) => ({ etichetta: voce.nome, valore: voce.incasso }))}
          />
        </div>

        <div className="rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-[1.05rem] font-semibold">Banco alimentari</h2>
          <Classifica
            titolo="Prodotti venduti"
            punti={dati.food.map((voce) => ({ etichetta: voce.nome, valore: voce.quantita }))}
          />
        </div>
      </div>

      {/* ── Presenze e pubblico ─────────────────────────────────────────── */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Riquadro
          etichetta="Presenze effettive"
          valore={percentuale(dati.presenze.percentuale)}
          dettaglio={`${numero(dati.presenze.mancatePresenze)} biglietti mai timbrati`}
          tono={dati.presenze.percentuale >= 85 ? 'ok' : 'attesa'}
        />
        <Riquadro
          etichetta="Nuovi clienti"
          valore={numero(dati.pubblico.nuoviClienti)}
          dettaglio={`${numero(dati.pubblico.clientiTotali)} registrati in totale`}
        />
        <Riquadro
          etichetta="Abbonamenti attivi"
          valore={numero(dati.pubblico.abbonamentiAttivi)}
        />
        <Riquadro
          etichetta="Sconti concessi"
          valore={prezzo(dati.totali.sconti)}
          dettaglio={`${numero(dati.coupon.reduce((somma, voce) => somma + voce.utilizzi, 0))} codici usati`}
          tono="attesa"
        />
      </div>

      {(dati.totali.inAttesa > 0 || dati.totali.rimborsate > 0) && (
        <Nota className="mt-6" icona={<Icona nome="info" className="size-4" />}>
          Nel periodo ci sono {dati.totali.inAttesa} prenotazioni ancora da pagare,{' '}
          {dati.totali.annullate} annullate e {dati.totali.rimborsate} rimborsate. Gli importi non
          pagati non entrano in nessuno dei numeri qui sopra.{' '}
          <Link href="/admin/prenotazioni?stato=in-attesa" className="text-accento underline">
            Vedi le prenotazioni in attesa
          </Link>
          .
        </Nota>
      )}
    </div>
  )
}

/** Collegamenti rapidi del cruscotto. */
export function Scorciatoie() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {NAVIGAZIONE_ADMIN[0].voci
        .filter((voce) => voce.href !== '/admin')
        .concat(NAVIGAZIONE_ADMIN[1].voci.slice(0, 2))
        .map((voce) => (
          <Link
            key={voce.href}
            href={voce.href}
            className="group rounded-morbido border border-bordo bg-superficie p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-accento"
          >
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-accento/12 text-accento">
              <Icona nome={voce.icona} className="size-5" />
            </span>
            <span className="mt-3.5 block font-medium">{voce.etichetta}</span>
            <span className="mt-1 block text-[0.8rem] text-tenue">{voce.descrizione}</span>
          </Link>
        ))}
    </div>
  )
}
