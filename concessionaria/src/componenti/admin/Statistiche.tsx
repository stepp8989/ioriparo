'use client'

import { useState } from 'react'
import { Caricamento, Errore, Scheda, TestataPagina, useRisorsa } from '@/componenti/admin/comuni'
import { classi, prezzo } from '@/lib/utili'

/**
 * Statistiche del pannello.
 *
 * I grafici sono SVG scritti a mano: per quattro istogrammi e qualche barra
 * orizzontale una libreria di terze parti peserebbe più di tutto il resto del
 * pannello messo insieme. Ogni grafico è accompagnato da una tabella
 * accessibile, che è anche il modo più rapido di leggere i numeri esatti.
 */

type Serie = Array<{ mese: string; valore: number }>
type Ripartizione = Array<{ nome: string; valore: number }>

type Dati = {
  riepilogo: {
    veicoli: number
    valoreCatalogo: number
    incassoNoleggi: number
    noleggiTotali: number
    richiesteTotali: number
    appuntamentiTotali: number
    clienti: number
    valutazioneMedia: number
    recensioni: number
  }
  andamento: {
    richieste: Serie
    noleggi: Serie
    appuntamenti: Serie
    clienti: Serie
  }
  ripartizioni: {
    alimentazione: Ripartizione
    condizione: Ripartizione
    tipoRichiesta: Ripartizione
    servizioDetailing: Ripartizione
  }
}

const MESI_BREVI = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic']

/** «2026-08» → «ago». */
function etichettaMese(mese: string): string {
  const numero = Number(mese.slice(5, 7))
  return MESI_BREVI[numero - 1] ?? mese
}

const SERIE = [
  { chiave: 'richieste', nome: 'Richieste' },
  { chiave: 'noleggi', nome: 'Noleggi' },
  { chiave: 'appuntamenti', nome: 'Appuntamenti' },
  { chiave: 'clienti', nome: 'Registrazioni' },
] as const

export function Statistiche() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<Dati>('/api/statistiche')
  const [serie, setSerie] = useState<(typeof SERIE)[number]['chiave']>('richieste')

  if (caricamento) return <Caricamento />
  if (errore || !dati) return <Errore testo={errore || 'Dati non disponibili.'} onRiprova={ricarica} />

  const valori = dati.andamento[serie]
  const nomeSerie = SERIE.find((voce) => voce.chiave === serie)?.nome ?? ''
  const totaleSerie = valori.reduce((somma, voce) => somma + voce.valore, 0)

  return (
    <>
      <TestataPagina
        titolo="Statistiche"
        descrizione="Andamento degli ultimi dodici mesi e composizione del catalogo."
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Scheda
            titolo="Andamento mensile"
            descrizione={`${totaleSerie} ${nomeSerie.toLowerCase()} negli ultimi dodici mesi.`}
            azione={
              <div className="flex flex-wrap gap-2">
                {SERIE.map((voce) => (
                  <button
                    key={voce.chiave}
                    type="button"
                    onClick={() => setSerie(voce.chiave)}
                    aria-pressed={serie === voce.chiave}
                    className={classi(
                      'rounded-full border px-3.5 py-1.5 text-[0.8rem] font-medium transition-colors',
                      serie === voce.chiave
                        ? 'border-accento bg-accento text-white'
                        : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                    )}
                  >
                    {voce.nome}
                  </button>
                ))}
              </div>
            }
          >
            <Istogramma valori={valori} etichetta={nomeSerie} />
          </Scheda>
        </div>

        <Scheda titolo="In sintesi">
          <dl className="space-y-4">
            {[
              { voce: 'Veicoli in catalogo', valore: String(dati.riepilogo.veicoli) },
              { voce: 'Valore del piazzale', valore: prezzo(dati.riepilogo.valoreCatalogo) },
              { voce: 'Incasso noleggi', valore: prezzo(dati.riepilogo.incassoNoleggi) },
              { voce: 'Noleggi registrati', valore: String(dati.riepilogo.noleggiTotali) },
              { voce: 'Richieste ricevute', valore: String(dati.riepilogo.richiesteTotali) },
              { voce: 'Appuntamenti', valore: String(dati.riepilogo.appuntamentiTotali) },
              { voce: 'Clienti registrati', valore: String(dati.riepilogo.clienti) },
              {
                voce: 'Valutazione media',
                valore: `${dati.riepilogo.valutazioneMedia.toLocaleString('it-IT')} su ${dati.riepilogo.recensioni}`,
              },
            ].map((riga) => (
              <div
                key={riga.voce}
                className="flex items-baseline justify-between gap-4 border-b border-bordo pb-3 last:border-0 last:pb-0"
              >
                <dt className="text-[0.88rem] text-tenue">{riga.voce}</dt>
                <dd className="font-semibold tabellare">{riga.valore}</dd>
              </div>
            ))}
          </dl>
        </Scheda>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Scheda titolo="Catalogo per alimentazione" descrizione="Veicoli visibili sul sito.">
          <Barre voci={dati.ripartizioni.alimentazione} />
        </Scheda>

        <Scheda titolo="Catalogo per condizione" descrizione="Nuovo, km 0, aziendale, usato.">
          <Barre voci={dati.ripartizioni.condizione} />
        </Scheda>

        <Scheda titolo="Richieste per tipo" descrizione="Cosa chiedono di più i visitatori.">
          <Barre voci={dati.ripartizioni.tipoRichiesta} />
        </Scheda>

        <Scheda titolo="Trattamenti più richiesti" descrizione="Appuntamenti del reparto detailing.">
          <Barre voci={dati.ripartizioni.servizioDetailing} />
        </Scheda>
      </div>

      <p className="mt-8 rounded-morbido border border-bordo bg-superficie px-5 py-4 text-[0.85rem] leading-relaxed text-tenue">
        Questi numeri riguardano solo ciò che passa dal sito. Per le visite, le pagine più viste e
        la provenienza del traffico c’è Google Analytics, che si attiva impostando
        <span className="mx-1 font-medium">NEXT_PUBLIC_GA_ID</span>
        e viene caricato soltanto per chi accetta i cookie statistici.
      </p>
    </>
  )
}

/* ── Grafici ─────────────────────────────────────────────────────────────── */

/**
 * Istogramma dei dodici mesi.
 *
 * Le barre sono disegnate come percentuali dell'altezza del contenitore invece
 * che in SVG: si adattano alla larghezza disponibile senza dover ricalcolare
 * una viewBox, e restano nitide a qualsiasi risoluzione.
 */
function Istogramma({ valori, etichetta }: { valori: Serie; etichetta: string }) {
  const massimo = Math.max(...valori.map((voce) => voce.valore), 1)

  return (
    <figure>
      <div className="flex h-56 items-end gap-2" role="presentation">
        {valori.map((voce) => (
          <div key={voce.mese} className="flex flex-1 flex-col items-center gap-2">
            <span className="text-[0.72rem] font-semibold text-tenue tabellare">
              {voce.valore > 0 ? voce.valore : ''}
            </span>
            <div
              className="w-full rounded-t-lg bg-accento/85 transition-all duration-500"
              style={{ height: `${Math.max((voce.valore / massimo) * 100, voce.valore > 0 ? 4 : 1)}%` }}
            />
            <span className="text-[0.7rem] text-tenue">{etichettaMese(voce.mese)}</span>
          </div>
        ))}
      </div>

      {/* Gli stessi dati in tabella: è la versione che leggono i lettori di schermo. */}
      <figcaption className="sr-only">
        <table>
          <caption>{etichetta} per mese</caption>
          <tbody>
            {valori.map((voce) => (
              <tr key={voce.mese}>
                <th scope="row">{voce.mese}</th>
                <td>{voce.valore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  )
}

/** Barre orizzontali per le ripartizioni. */
function Barre({ voci }: { voci: Ripartizione }) {
  if (voci.length === 0) {
    return <p className="py-6 text-center text-[0.88rem] text-tenue">Nessun dato.</p>
  }

  const totale = voci.reduce((somma, voce) => somma + voce.valore, 0) || 1

  return (
    <ul className="space-y-4">
      {voci.slice(0, 8).map((voce) => {
        const quota = Math.round((voce.valore / totale) * 100)

        return (
          <li key={voce.nome}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-[0.85rem]">
              <span className="capitalize">{voce.nome.replace(/-/g, ' ')}</span>
              <span className="text-tenue tabellare">
                {voce.valore} · {quota}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-superficie-alt">
              <div
                className="h-full rounded-full bg-accento transition-all duration-500"
                style={{ width: `${Math.max(quota, 2)}%` }}
              />
            </div>
          </li>
        )
      })}
    </ul>
  )
}
