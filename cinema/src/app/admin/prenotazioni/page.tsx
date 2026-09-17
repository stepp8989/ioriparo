'use client'

import { useCallback, useEffect, useState } from 'react'
import { useElenco } from '@/componenti/admin/dati'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Area } from '@/componenti/ui/campi'
import { STATI_PRENOTAZIONE, type Cinema, type Film, type Prenotazione } from '@/lib/tipi'
import { classi, dataBreve, elencoPosti, prezzoPieno } from '@/lib/utili'

/**
 * Prenotazioni.
 *
 * Tre azioni, tutte con conseguenze reali sull'archivio:
 *
 *   — **Incassa in cassa** conferma una prenotazione pagata allo sportello:
 *     emette i biglietti e accredita i punti come un acquisto online.
 *   — **Annulla** libera i posti e restituisce punti e credito gift card, ma
 *     non tocca il denaro.
 *   — **Rimborsa** fa lo stesso e registra che il denaro è stato restituito.
 *
 * Il rimborso vero va disposto dal cruscotto del fornitore di pagamento: è
 * l'unico posto in cui può avvenire, e fingere il contrario nel pannello
 * significherebbe far credere a un operatore di aver restituito dei soldi che
 * sono ancora lì.
 */

const NOMI_STATO: Record<Prenotazione['stato'], string> = {
  'in-attesa': 'Da pagare',
  confermata: 'Confermata',
  annullata: 'Annullata',
  rimborsata: 'Rimborsata',
  utilizzata: 'Utilizzata',
}

const TONI_STATO: Record<Prenotazione['stato'], 'verde' | 'ambra' | 'rosso' | 'neutro'> = {
  'in-attesa': 'ambra',
  confermata: 'verde',
  annullata: 'rosso',
  rimborsata: 'rosso',
  utilizzata: 'neutro',
}

export default function PaginaPrenotazioniAdmin() {
  const { mostra } = useAvvisi()
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')
  const { voci: film } = useElenco<Film>('/api/admin/film')

  const [voci, setVoci] = useState<Prenotazione[]>([])
  const [totale, setTotale] = useState(0)
  const [caricamento, setCaricamento] = useState(true)
  const [stato, setStato] = useState('')
  const [cinemaId, setCinemaId] = useState('')
  const [cerca, setCerca] = useState('')
  const [azione, setAzione] = useState<{ prenotazione: Prenotazione; tipo: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [inCorso, setInCorso] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const parametri = new URLSearchParams()
      if (stato) parametri.set('stato', stato)
      if (cinemaId) parametri.set('cinema', cinemaId)
      if (cerca.trim()) parametri.set('q', cerca.trim())

      const risposta = await fetch(`/api/admin/prenotazioni?${parametri}`, { cache: 'no-store' })
      const dati = (await risposta.json()) as { voci: Prenotazione[]; totale: number }
      setVoci(dati.voci ?? [])
      setTotale(dati.totale ?? 0)
    } finally {
      setCaricamento(false)
    }
  }, [cerca, cinemaId, stato])

  useEffect(() => {
    const attesa = window.setTimeout(() => void carica(), 250)
    return () => window.clearTimeout(attesa)
  }, [carica])

  const titoloFilm = (id: string) => film.find((voce) => voce.id === id)?.titolo ?? '—'
  const nomeCinema = (id: string) => cinema.find((voce) => voce.id === id)?.nome ?? '—'

  async function esegui() {
    if (!azione) return
    setInCorso(true)

    try {
      const risposta = await fetch('/api/admin/prenotazioni', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          codice: azione.prenotazione.codice,
          azione: azione.tipo,
          motivo,
        }),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Operazione non riuscita.', 'errore')
        return
      }

      mostra('Fatto.', 'ok')
      setAzione(null)
      setMotivo('')
      await carica()
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Prenotazioni</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Ordini di tutta la rete. Le prenotazioni non si creano da qui: nascono dal flusso
          d’acquisto, che è l’unico posto in cui disponibilità e prezzo vengono verificati.
        </p>
      </header>

      {/* ── Filtri ──────────────────────────────────────────────────────── */}
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Icona
            nome="cerca"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
          />
          <input
            type="search"
            value={cerca}
            onChange={(evento) => setCerca(evento.target.value)}
            placeholder="Codice, nome o email…"
            aria-label="Cerca fra le prenotazioni"
            className="w-full rounded-full border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem] focus:border-accento focus:outline-none"
          />
        </div>

        <select
          value={stato}
          onChange={(evento) => setStato(evento.target.value)}
          aria-label="Filtra per stato"
          className="rounded-full border border-bordo bg-superficie px-4 py-2.5 text-[0.84rem] focus:border-accento focus:outline-none"
        >
          <option value="">Tutti gli stati</option>
          {STATI_PRENOTAZIONE.map((voce) => (
            <option key={voce} value={voce}>
              {NOMI_STATO[voce]}
            </option>
          ))}
        </select>

        <select
          value={cinemaId}
          onChange={(evento) => setCinemaId(evento.target.value)}
          aria-label="Filtra per cinema"
          className="rounded-full border border-bordo bg-superficie px-4 py-2.5 text-[0.84rem] focus:border-accento focus:outline-none"
        >
          <option value="">Tutti i cinema</option>
          {cinema.map((voce) => (
            <option key={voce.id} value={voce.id}>
              {voce.nome}
            </option>
          ))}
        </select>

        <p className="text-[0.84rem] text-tenue" role="status">
          {voci.length} mostrate su {totale}
        </p>
      </div>

      {/* ── Elenco ──────────────────────────────────────────────────────── */}
      <div className="mt-6 overflow-x-auto rounded-ampio border border-bordo bg-superficie">
        {caricamento ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }, (_, indice) => (
              <Scheletro key={indice} className="h-10 w-full" />
            ))}
          </div>
        ) : voci.length === 0 ? (
          <p className="p-8 text-center text-[0.9rem] text-tenue">
            Nessuna prenotazione con questi filtri.
          </p>
        ) : (
          <table className="w-full border-collapse text-[0.86rem]">
            <caption className="sr-only">Elenco delle prenotazioni</caption>
            <thead>
              <tr className="border-b border-bordo">
                {['Codice', 'Cliente', 'Spettacolo', 'Posti', 'Totale', 'Stato', 'Azioni'].map(
                  (titolo) => (
                    <th
                      key={titolo}
                      scope="col"
                      className={classi(
                        'p-3.5 text-left font-medium text-tenue',
                        titolo === 'Azioni' && 'text-right',
                        (titolo === 'Cliente' || titolo === 'Posti') && 'hidden lg:table-cell',
                      )}
                    >
                      {titolo}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {voci.map((prenotazione) => (
                <tr key={prenotazione.id} className="border-b border-bordo last:border-0">
                  <td className="p-3.5 align-top">
                    <a
                      href={`/biglietto/${prenotazione.codice}`}
                      target="_blank"
                      rel="noreferrer"
                      className="tabellare font-semibold tracking-[0.1em] text-accento hover:underline"
                    >
                      {prenotazione.codice}
                    </a>
                    <span className="block text-[0.74rem] text-tenue">
                      {dataBreve(prenotazione.creataIl)}
                    </span>
                  </td>

                  <td className="hidden p-3.5 align-top lg:table-cell">
                    <span className="block">{prenotazione.ospite?.nome ?? '—'}</span>
                    <span className="block text-[0.74rem] text-tenue">
                      {prenotazione.ospite?.email ?? (prenotazione.clienteId ? 'Account registrato' : '—')}
                    </span>
                  </td>

                  <td className="p-3.5 align-top">
                    <span className="block">{titoloFilm(prenotazione.filmId)}</span>
                    <span className="block text-[0.74rem] text-tenue">
                      {nomeCinema(prenotazione.cinemaId)} · {dataBreve(prenotazione.data)}{' '}
                      {prenotazione.ora}
                    </span>
                  </td>

                  <td className="hidden p-3.5 align-top lg:table-cell">
                    <span className="text-[0.82rem]">{elencoPosti(prenotazione.posti)}</span>
                  </td>

                  <td className="tabellare p-3.5 align-top font-medium">
                    {prezzoPieno(prenotazione.totale)}
                  </td>

                  <td className="p-3.5 align-top">
                    <Etichetta tono={TONI_STATO[prenotazione.stato]}>
                      {NOMI_STATO[prenotazione.stato]}
                    </Etichetta>
                  </td>

                  <td className="p-3.5 text-right align-top">
                    <span className="inline-flex flex-wrap justify-end gap-1.5">
                      {prenotazione.stato === 'in-attesa' && (
                        <button
                          type="button"
                          onClick={() => setAzione({ prenotazione, tipo: 'incassa' })}
                          className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-ok hover:text-ok"
                        >
                          Incassa
                        </button>
                      )}
                      {prenotazione.stato !== 'annullata' && prenotazione.stato !== 'rimborsata' && (
                        <>
                          <button
                            type="button"
                            onClick={() => setAzione({ prenotazione, tipo: 'annulla' })}
                            className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-attesa hover:text-attesa"
                          >
                            Annulla
                          </button>
                          {prenotazione.stato !== 'in-attesa' && (
                            <button
                              type="button"
                              onClick={() => setAzione({ prenotazione, tipo: 'rimborsa' })}
                              className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-errore hover:text-errore"
                            >
                              Rimborsa
                            </button>
                          )}
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Conferma dell'azione ────────────────────────────────────────── */}
      <Finestra
        aperta={azione !== null}
        onChiudi={() => {
          setAzione(null)
          setMotivo('')
        }}
        titolo={
          azione?.tipo === 'incassa'
            ? 'Registra l’incasso in cassa'
            : azione?.tipo === 'rimborsa'
              ? 'Registra il rimborso'
              : 'Annulla la prenotazione'
        }
      >
        {azione && (
          <div className="space-y-5">
            <p className="text-[0.92rem]">
              Prenotazione <strong className="tabellare">{azione.prenotazione.codice}</strong> —{' '}
              {elencoPosti(azione.prenotazione.posti)} ·{' '}
              {prezzoPieno(azione.prenotazione.totale)}
            </p>

            {azione.tipo === 'incassa' && (
              <Nota tono="verde" icona={<Icona nome="spunta" className="size-4" />}>
                I biglietti diventano validi e i punti vengono accreditati come per un acquisto
                online.
              </Nota>
            )}

            {azione.tipo === 'rimborsa' && (
              <Nota tono="ambra" icona={<Icona nome="avviso" className="size-4" />}>
                Questa operazione registra il rimborso e libera i posti, ma{' '}
                <strong className="text-testo">non restituisce il denaro</strong>: quello va
                disposto dal cruscotto del fornitore di pagamento. Punti e credito gift card
                tornano invece al cliente automaticamente.
              </Nota>
            )}

            {azione.tipo === 'annulla' && (
              <Nota tono="ambra" icona={<Icona nome="avviso" className="size-4" />}>
                I posti tornano liberi. Punti e credito gift card usati vengono restituiti; i punti
                guadagnati con l’acquisto vengono stornati.
              </Nota>
            )}

            <Area
              etichetta="Motivo"
              richiesto={azione.tipo !== 'incassa'}
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              aiuto="Finisce nel registro delle operazioni, accanto a chi l’ha disposta."
              rows={3}
            />

            <div className="flex justify-end gap-3 border-t border-bordo pt-5">
              <Bottone variante="tenue" onClick={() => setAzione(null)}>
                Annulla
              </Bottone>
              <Bottone
                onClick={() => void esegui()}
                disabled={inCorso || (azione.tipo !== 'incassa' && motivo.trim().length < 3)}
              >
                {inCorso ? 'Un momento…' : 'Conferma'}
              </Bottone>
            </div>
          </div>
        )}
      </Finestra>
    </div>
  )
}
