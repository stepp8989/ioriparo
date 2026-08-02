'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Avviso, Pulsante, TestataPagina } from '@/componenti/admin/campi'
import { Icona } from '@/componenti/ui/Icona'
import type { Prenotazione, StatoPrenotazione } from '@/lib/tipi'
import { classi, dataBreve, oggiIso } from '@/lib/utili'

const STATI: Record<StatoPrenotazione, { nome: string; stile: string }> = {
  'in-attesa': { nome: 'In attesa', stile: 'border-amber-400 text-amber-700 scuro:text-amber-400' },
  confermata: { nome: 'Confermata', stile: 'border-accento text-accento' },
  annullata: { nome: 'Annullata', stile: 'border-bordo-forte text-tenue line-through' },
}

type Periodo = 'prossime' | 'oggi' | 'passate' | 'tutte'

/**
 * Richieste di prenotazione.
 *
 * L'elenco parte dalle prenotazioni future, che sono quelle su cui si lavora;
 * le passate restano consultabili ma non intralciano. Ogni riga porta con sé
 * telefono ed email cliccabili: dal pannello si richiama un cliente senza
 * copiare numeri a mano.
 */
export function GestionePrenotazioni({ prenotazioni }: { prenotazioni: Prenotazione[] }) {
  const router = useRouter()
  const [periodo, setPeriodo] = useState<Periodo>('prossime')
  const [ricerca, setRicerca] = useState('')
  const [avviso, setAvviso] = useState<{ tipo: 'ok' | 'errore'; testo: string }>({
    tipo: 'ok',
    testo: '',
  })

  const oggi = oggiIso()

  const visibili = useMemo(() => {
    const cercato = ricerca.trim().toLowerCase()

    return prenotazioni
      .filter((voce) => {
        if (periodo === 'oggi') return voce.data === oggi
        if (periodo === 'prossime') return voce.data >= oggi
        if (periodo === 'passate') return voce.data < oggi
        return true
      })
      .filter(
        (voce) =>
          !cercato ||
          `${voce.nome} ${voce.cognome} ${voce.codice} ${voce.telefono} ${voce.email}`
            .toLowerCase()
            .includes(cercato),
      )
      .sort((primo, secondo) => {
        const chiavePrimo = `${primo.data}${primo.ora}`
        const chiaveSecondo = `${secondo.data}${secondo.ora}`
        // Le passate si leggono dalla più recente, le future dalla più vicina.
        return periodo === 'passate'
          ? chiaveSecondo.localeCompare(chiavePrimo)
          : chiavePrimo.localeCompare(chiaveSecondo)
      })
  }, [prenotazioni, periodo, ricerca, oggi])

  const coperti = visibili
    .filter((voce) => voce.stato !== 'annullata')
    .reduce((somma, voce) => somma + voce.persone, 0)

  async function cambiaStato(prenotazione: Prenotazione, stato: StatoPrenotazione) {
    try {
      const risposta = await fetch('/api/prenotazioni', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: prenotazione.id, stato }),
      })
      if (!risposta.ok) throw new Error('Aggiornamento non riuscito.')

      setAvviso({ tipo: 'ok', testo: `Prenotazione ${prenotazione.codice}: ${STATI[stato].nome.toLowerCase()}.` })
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Aggiornamento non riuscito.',
      })
    }
  }

  async function elimina(prenotazione: Prenotazione) {
    if (!confirm(`Eliminare la prenotazione ${prenotazione.codice}?`)) return

    await fetch(`/api/prenotazioni?id=${encodeURIComponent(prenotazione.id)}`, { method: 'DELETE' })
    setAvviso({ tipo: 'ok', testo: 'Prenotazione eliminata.' })
    router.refresh()
  }

  /** Esportazione in CSV: utile per il registro di sala o per il commercialista. */
  function esporta() {
    const intestazioni = ['Codice', 'Data', 'Ora', 'Nome', 'Cognome', 'Persone', 'Telefono', 'Email', 'Stato', 'Note']
    const righe = visibili.map((voce) =>
      [
        voce.codice,
        voce.data,
        voce.ora,
        voce.nome,
        voce.cognome,
        voce.persone,
        voce.telefono,
        voce.email,
        voce.stato,
        voce.note,
      ]
        // Le virgolette interne vanno raddoppiate, altrimenti il CSV si rompe.
        .map((campo) => `"${String(campo).replaceAll('"', '""')}"`)
        .join(';'),
    )

    const contenuto = `﻿${[intestazioni.join(';'), ...righe].join('\n')}`
    const indirizzo = URL.createObjectURL(new Blob([contenuto], { type: 'text/csv;charset=utf-8' }))

    const collegamento = document.createElement('a')
    collegamento.href = indirizzo
    collegamento.download = `prenotazioni-${oggi}.csv`
    collegamento.click()
    URL.revokeObjectURL(indirizzo)
  }

  return (
    <div className="mx-auto max-w-6xl">
      <TestataPagina
        titolo="Prenotazioni"
        descrizione={`${visibili.length} richieste nel periodo scelto, ${coperti} coperti.`}
        azione={
          <Pulsante variante="contorno" icona="documento" onClick={esporta} disabled={visibili.length === 0}>
            Esporta CSV
          </Pulsante>
        }
      />

      <Avviso tipo={avviso.tipo} testo={avviso.testo} />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-2" role="tablist" aria-label="Periodo">
          {(
            [
              ['prossime', 'Da oggi'],
              ['oggi', 'Solo oggi'],
              ['passate', 'Passate'],
              ['tutte', 'Tutte'],
            ] as const
          ).map(([valore, nome]) => (
            <button
              key={valore}
              type="button"
              role="tab"
              aria-selected={periodo === valore}
              onClick={() => setPeriodo(valore)}
              className={classi(
                'border px-4 py-2 text-[0.7rem] font-medium uppercase tracking-[0.12em] transition-colors',
                periodo === valore
                  ? 'border-accento bg-accento text-white scuro:text-notte'
                  : 'border-bordo text-tenue hover:border-accento hover:text-accento',
              )}
            >
              {nome}
            </button>
          ))}
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Icona
            nome="cerca"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tenue"
          />
          <input
            type="search"
            value={ricerca}
            onChange={(evento) => setRicerca(evento.target.value)}
            placeholder="Nome, codice, telefono"
            aria-label="Cerca fra le prenotazioni"
            className="w-full border border-bordo bg-superficie py-2.5 pr-3.5 pl-9 text-sm transition-colors focus:border-accento focus:outline-none"
          />
        </div>
      </div>

      {visibili.length === 0 ? (
        <p className="border border-bordo bg-superficie py-16 text-center text-sm text-tenue">
          Nessuna prenotazione da mostrare.
        </p>
      ) : (
        <ul className="space-y-3">
          {visibili.map((prenotazione) => (
            <li key={prenotazione.id} className="border border-bordo bg-superficie p-4">
              <div className="flex flex-wrap items-start gap-4">
                {/* Data e ora */}
                <div className="w-20 shrink-0">
                  <p className="font-titolo text-xl text-accento">{prenotazione.ora}</p>
                  <p className="mt-0.5 text-xs text-tenue">{dataBreve(prenotazione.data)}</p>
                </div>

                {/* Cliente */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {prenotazione.nome} {prenotazione.cognome}
                    </p>
                    <span
                      className={classi(
                        'border px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em]',
                        STATI[prenotazione.stato].stile,
                      )}
                    >
                      {STATI[prenotazione.stato].nome}
                    </span>
                    <span className="font-mono text-xs text-tenue">{prenotazione.codice}</span>
                  </div>

                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-tenue">
                    <span className="flex items-center gap-1.5">
                      <Icona nome="persone" className="size-3.5" />
                      {prenotazione.persone} {prenotazione.persone === 1 ? 'persona' : 'persone'}
                    </span>
                    <a
                      href={`tel:${prenotazione.telefono}`}
                      className="flex items-center gap-1.5 transition-colors hover:text-accento"
                    >
                      <Icona nome="telefono" className="size-3.5" />
                      {prenotazione.telefono}
                    </a>
                    <a
                      href={`mailto:${prenotazione.email}`}
                      className="flex items-center gap-1.5 transition-colors hover:text-accento"
                    >
                      <Icona nome="posta" className="size-3.5" />
                      {prenotazione.email}
                    </a>
                  </p>

                  {prenotazione.note && (
                    <p className="mt-2 border-l-2 border-accento/40 pl-3 text-xs leading-relaxed text-tenue">
                      {prenotazione.note}
                    </p>
                  )}
                </div>

                {/* Azioni */}
                <div className="flex shrink-0 flex-wrap gap-2">
                  {prenotazione.stato !== 'confermata' && (
                    <Pulsante
                      variante="contorno"
                      icona="spunta"
                      onClick={() => cambiaStato(prenotazione, 'confermata')}
                    >
                      Conferma
                    </Pulsante>
                  )}

                  {prenotazione.stato !== 'annullata' && (
                    <Pulsante
                      variante="contorno"
                      icona="chiudi"
                      onClick={() => cambiaStato(prenotazione, 'annullata')}
                    >
                      Annulla
                    </Pulsante>
                  )}

                  <Pulsante
                    variante="pericolo"
                    icona="cestino"
                    aria-label={`Elimina la prenotazione ${prenotazione.codice}`}
                    onClick={() => elimina(prenotazione)}
                  >
                    <span className="sr-only sm:not-sr-only">Elimina</span>
                  </Pulsante>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
