'use client'

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Area, Campo, Scelta, Spunta } from '@/componenti/ui/campi'
import { classi, prezzo } from '@/lib/utili'

/**
 * Gestione generica di una collezione.
 *
 * Quattordici sezioni del pannello fanno la stessa cosa — elenco, ricerca,
 * modulo, salvataggio, eliminazione — su dati diversi. Scriverle una per una
 * significherebbe quattordici moduli da tenere allineati e quattordici
 * occasioni per dimenticare la conferma prima di cancellare.
 *
 * Qui la differenza fra una sezione e l'altra è una descrizione dei campi. Il
 * comportamento è lo stesso ovunque, e migliorarlo in un punto lo migliora in
 * tutti. È lo stesso ragionamento che sta dietro a `lib/rotteAdmin.ts`, dal
 * lato del server.
 *
 * Quando una sezione ha bisogno di un'interfaccia sua — l'editor grafico delle
 * sale, il calendario della programmazione — non si forza qui dentro: si
 * scrive a parte. Un componente generico che accoglie ogni eccezione smette di
 * essere generico e diventa solo complicato.
 */

export type TipoCampo =
  | 'testo'
  | 'area'
  | 'numero'
  | 'decimale'
  | 'booleano'
  | 'scelta'
  | 'multiscelta'
  | 'elenco'
  | 'data'
  | 'ora'
  | 'colore'
  | 'palette'

export type CampoGestione = {
  chiave: string
  etichetta: string
  tipo: TipoCampo
  opzioni?: { valore: string; etichetta: string }[]
  aiuto?: string
  /** Occupa l'intera larghezza del modulo invece di mezza. */
  larga?: boolean
  minimo?: number
  massimo?: number
  /** Nascosto in modifica: per esempio uno slug già pubblicato. */
  soloCreazione?: boolean
}

export type ColonnaGestione<T> = {
  etichetta: string
  /** Contenuto della cella. */
  resa: (voce: T) => ReactNode
  /** Testo su cui cercare, se diverso da quello mostrato. */
  ricerca?: (voce: T) => string
  /** Nascosta sotto una certa larghezza: le tabelle larghe non stanno nel telefono. */
  secondaria?: boolean
}

type Props<T extends { id: string }> = {
  titolo: string
  descrizione: string
  /** Rotta API della collezione, per esempio `/api/admin/film`. */
  endpoint: string
  campi: CampoGestione[]
  colonne: ColonnaGestione<T>[]
  /** Valori di partenza per una voce nuova. */
  vuota: Record<string, unknown>
  /** Nome singolare per i messaggi: «film», «promozione». */
  nomeVoce: string
  /** Etichetta principale della voce, per titoli e conferme. */
  etichettaVoce: (voce: T) => string
  /** Campi booleani modificabili direttamente dall'elenco. */
  interruttori?: { chiave: keyof T & string; etichetta: string }[]
  /** Contenuto aggiuntivo sopra l'elenco. */
  intestazione?: ReactNode
}

export function Gestione<T extends { id: string }>({
  titolo,
  descrizione,
  endpoint,
  campi,
  colonne,
  vuota,
  nomeVoce,
  etichettaVoce,
  interruttori = [],
  intestazione,
}: Props<T>) {
  const { mostra } = useAvvisi()

  const [voci, setVoci] = useState<T[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cerca, setCerca] = useState('')
  const [modulo, setModulo] = useState<Record<string, unknown> | null>(null)
  const [inModifica, setInModifica] = useState<T | null>(null)
  const [salvataggio, setSalvataggio] = useState(false)
  const [daEliminare, setDaEliminare] = useState<T | null>(null)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch(endpoint, { cache: 'no-store' })
      if (!risposta.ok) throw new Error('lettura non riuscita')
      const dati = (await risposta.json()) as { voci: T[] }
      setVoci(dati.voci ?? [])
    } catch {
      mostra('Non riusciamo a leggere i dati.', 'errore')
    } finally {
      setCaricamento(false)
    }
  }, [endpoint, mostra])

  useEffect(() => {
    void carica()
  }, [carica])

  const filtrate = useMemo(() => {
    const termine = cerca.trim().toLowerCase()
    if (!termine) return voci

    return voci.filter((voce) => {
      const testo = colonne
        .map((colonna) => colonna.ricerca?.(voce) ?? '')
        .concat(etichettaVoce(voce))
        .join(' ')
        .toLowerCase()
      return testo.includes(termine)
    })
  }, [cerca, colonne, etichettaVoce, voci])

  function apriNuova() {
    setInModifica(null)
    setModulo({ ...vuota })
  }

  function apriModifica(voce: T) {
    setInModifica(voce)
    setModulo({ ...(voce as unknown as Record<string, unknown>) })
  }

  async function salva() {
    if (!modulo) return
    setSalvataggio(true)

    try {
      const risposta = await fetch(endpoint, {
        method: inModifica ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inModifica ? { ...modulo, id: inModifica.id } : modulo),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Salvataggio non riuscito.', 'errore')
        return
      }

      mostra(inModifica ? 'Modifiche salvate.' : `${nomeVoce} creato.`, 'ok')
      setModulo(null)
      setInModifica(null)
      await carica()
    } catch {
      mostra('Connessione non riuscita.', 'errore')
    } finally {
      setSalvataggio(false)
    }
  }

  async function elimina(voce: T) {
    try {
      const risposta = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: voce.id }),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Eliminazione non riuscita.', 'errore')
        return
      }

      mostra('Eliminato.', 'ok')
      await carica()
    } finally {
      setDaEliminare(null)
    }
  }

  async function alterna(voce: T, chiave: string, valore: boolean) {
    // Aggiornamento ottimistico: l'interruttore risponde subito e si corregge
    // da solo se il server rifiuta. Su un elenco di trenta righe, attendere
    // mezzo secondo a ogni clic rende il pannello sgradevole da usare.
    setVoci((precedenti) =>
      precedenti.map((riga) => (riga.id === voce.id ? { ...riga, [chiave]: valore } : riga)),
    )

    try {
      const risposta = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: voce.id, [chiave]: valore }),
      })

      if (!risposta.ok) {
        const esito = await risposta.json()
        mostra(esito.errore ?? 'Modifica non riuscita.', 'errore')
        await carica()
      }
    } catch {
      mostra('Connessione non riuscita.', 'errore')
      await carica()
    }
  }

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-titolo text-[1.8rem] font-semibold">{titolo}</h1>
          <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">{descrizione}</p>
        </div>

        <Bottone onClick={apriNuova}>
          <Icona nome="piu" className="size-4" />
          Aggiungi
        </Bottone>
      </header>

      {intestazione && <div className="mt-6">{intestazione}</div>}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[16rem] flex-1">
          <Icona
            nome="cerca"
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
          />
          <input
            type="search"
            value={cerca}
            onChange={(evento) => setCerca(evento.target.value)}
            placeholder="Cerca…"
            aria-label={`Cerca fra ${titolo.toLowerCase()}`}
            className="w-full rounded-tenue border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem] focus:border-accento focus:outline-none"
          />
        </div>

        <p className="text-[0.84rem] text-tenue" role="status">
          {filtrate.length} di {voci.length}
        </p>

        <button
          type="button"
          onClick={() => void carica()}
          className="inline-flex items-center gap-1.5 rounded-tenue border border-bordo px-3.5 py-2 text-[0.8rem] text-tenue transition-colors hover:border-accento hover:text-accento"
        >
          <Icona nome="aggiorna" className="size-3.5" />
          Ricarica
        </button>
      </div>

      {/* ── Elenco ──────────────────────────────────────────────────────── */}
      <div className="mt-6 overflow-x-auto rounded-ampio border border-bordo bg-superficie">
        {caricamento ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, indice) => (
              <Scheletro key={indice} className="h-10 w-full" />
            ))}
          </div>
        ) : filtrate.length === 0 ? (
          <p className="p-8 text-center text-[0.9rem] text-tenue">
            {voci.length === 0
              ? `Nessun ${nomeVoce} presente. Premi «Aggiungi» per crearne uno.`
              : 'Nessun risultato per questa ricerca.'}
          </p>
        ) : (
          <table className="w-full border-collapse text-[0.88rem]">
            <caption className="sr-only">{titolo}</caption>
            <thead>
              <tr className="border-b border-bordo">
                {colonne.map((colonna) => (
                  <th
                    key={colonna.etichetta}
                    scope="col"
                    className={classi(
                      'p-3.5 text-left font-medium text-tenue',
                      colonna.secondaria && 'hidden lg:table-cell',
                    )}
                  >
                    {colonna.etichetta}
                  </th>
                ))}
                {interruttori.map((interruttore) => (
                  <th
                    key={interruttore.chiave}
                    scope="col"
                    className="p-3.5 text-left font-medium text-tenue"
                  >
                    {interruttore.etichetta}
                  </th>
                ))}
                <th scope="col" className="p-3.5 text-right font-medium text-tenue">
                  Azioni
                </th>
              </tr>
            </thead>
            <tbody>
              {filtrate.map((voce) => (
                <tr key={voce.id} className="border-b border-bordo last:border-0">
                  {colonne.map((colonna) => (
                    <td
                      key={colonna.etichetta}
                      className={classi('p-3.5 align-top', colonna.secondaria && 'hidden lg:table-cell')}
                    >
                      {colonna.resa(voce)}
                    </td>
                  ))}

                  {interruttori.map((interruttore) => (
                    <td key={interruttore.chiave} className="p-3.5 align-top">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={Boolean(voce[interruttore.chiave])}
                        aria-label={`${interruttore.etichetta}: ${etichettaVoce(voce)}`}
                        onClick={() =>
                          alterna(voce, interruttore.chiave, !voce[interruttore.chiave])
                        }
                        className={classi(
                          'relative inline-flex h-5 w-9 rounded-full transition-colors',
                          voce[interruttore.chiave] ? 'bg-accento' : 'bg-bordo-forte',
                        )}
                      >
                        <span
                          className={classi(
                            'absolute top-0.5 size-4 rounded-full bg-white transition-all',
                            voce[interruttore.chiave] ? 'left-[1.125rem]' : 'left-0.5',
                          )}
                        />
                      </button>
                    </td>
                  ))}

                  <td className="p-3.5 text-right align-top">
                    <span className="inline-flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => apriModifica(voce)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
                        aria-label={`Modifica ${etichettaVoce(voce)}`}
                      >
                        <Icona nome="matita" className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDaEliminare(voce)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-errore hover:text-errore"
                        aria-label={`Elimina ${etichettaVoce(voce)}`}
                      >
                        <Icona nome="cestino" className="size-3.5" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Modulo ──────────────────────────────────────────────────────── */}
      <Finestra
        aperta={modulo !== null}
        onChiudi={() => setModulo(null)}
        titolo={inModifica ? `Modifica: ${etichettaVoce(inModifica)}` : `Nuovo ${nomeVoce}`}
      >
        {modulo && (
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              void salva()
            }}
            className="space-y-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {campi
                .filter((campo) => !campo.soloCreazione || !inModifica)
                .map((campo) => (
                  <CampoDinamico
                    key={campo.chiave}
                    campo={campo}
                    valore={modulo[campo.chiave]}
                    onCambia={(valore) =>
                      setModulo((precedente) => ({ ...precedente, [campo.chiave]: valore }))
                    }
                  />
                ))}
            </div>

            <div className="flex justify-end gap-3 border-t border-bordo pt-5">
              <Bottone variante="tenue" onClick={() => setModulo(null)}>
                Annulla
              </Bottone>
              <Bottone type="submit" disabled={salvataggio}>
                {salvataggio ? 'Salvataggio…' : 'Salva'}
              </Bottone>
            </div>
          </form>
        )}
      </Finestra>

      {/* ── Conferma di eliminazione ────────────────────────────────────── */}
      <Finestra
        aperta={daEliminare !== null}
        onChiudi={() => setDaEliminare(null)}
        titolo="Confermi l’eliminazione?"
      >
        {daEliminare && (
          <div>
            <Nota tono="rosso" icona={<Icona nome="avviso" className="size-4" />}>
              Stai per eliminare <strong className="text-testo">{etichettaVoce(daEliminare)}</strong>
              . L’operazione non è reversibile.
            </Nota>

            <div className="mt-6 flex justify-end gap-3">
              <Bottone variante="tenue" onClick={() => setDaEliminare(null)}>
                Annulla
              </Bottone>
              <Bottone onClick={() => void elimina(daEliminare)}>
                <Icona nome="cestino" className="size-4" />
                Elimina
              </Bottone>
            </div>
          </div>
        )}
      </Finestra>
    </div>
  )
}

/* ── Campo dinamico ─────────────────────────────────────────────────────── */

function CampoDinamico({
  campo,
  valore,
  onCambia,
}: {
  campo: CampoGestione
  valore: unknown
  onCambia: (valore: unknown) => void
}) {
  const larghezza = campo.larga ? 'sm:col-span-2' : ''

  switch (campo.tipo) {
    case 'area':
      return (
        <Area
          etichetta={campo.etichetta}
          aiuto={campo.aiuto}
          value={String(valore ?? '')}
          onChange={(evento) => onCambia(evento.target.value)}
          className="sm:col-span-2"
          rows={6}
        />
      )

    case 'booleano':
      return (
        <Spunta
          etichetta={campo.etichetta}
          descrizione={campo.aiuto}
          checked={Boolean(valore)}
          onChange={(evento) => onCambia(evento.target.checked)}
          className={larghezza}
        />
      )

    case 'scelta':
      return (
        <Scelta
          etichetta={campo.etichetta}
          aiuto={campo.aiuto}
          value={String(valore ?? '')}
          onChange={(evento) => onCambia(evento.target.value)}
          className={larghezza}
        >
          <option value="">— nessuno —</option>
          {campo.opzioni?.map((opzione) => (
            <option key={opzione.valore} value={opzione.valore}>
              {opzione.etichetta}
            </option>
          ))}
        </Scelta>
      )

    case 'multiscelta': {
      const scelti = Array.isArray(valore) ? (valore as string[]) : []
      return (
        <fieldset className={classi('sm:col-span-2', larghezza)}>
          <legend className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            {campo.etichetta}
          </legend>
          <div className="flex flex-wrap gap-2">
            {campo.opzioni?.map((opzione) => {
              const attivo = scelti.includes(opzione.valore)
              return (
                <button
                  key={opzione.valore}
                  type="button"
                  aria-pressed={attivo}
                  onClick={() =>
                    onCambia(
                      attivo
                        ? scelti.filter((voce) => voce !== opzione.valore)
                        : [...scelti, opzione.valore],
                    )
                  }
                  className={classi(
                    'rounded-tenue border px-3.5 py-2 text-[0.82rem] transition-colors',
                    attivo
                      ? 'border-accento bg-accento text-white'
                      : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                  )}
                >
                  {opzione.etichetta}
                </button>
              )
            })}
          </div>
          {campo.aiuto && <p className="mt-2 text-[0.8rem] text-tenue">{campo.aiuto}</p>}
        </fieldset>
      )
    }

    case 'elenco': {
      // Le voci possono essere testi semplici oppure oggetti con `nome` e
      // `ruolo`, come il cast di un film: in quel caso si mostrano nella forma
      // «Nome — Ruolo», che è anche quella che la rotta API sa rileggere.
      const righe = (Array.isArray(valore) ? valore : []).map((voce) =>
        typeof voce === 'string'
          ? voce
          : [
              (voce as { nome?: string })?.nome ?? '',
              (voce as { ruolo?: string })?.ruolo ?? '',
            ]
              .filter(Boolean)
              .join(' — '),
      )
      return (
        <Area
          etichetta={campo.etichetta}
          aiuto={campo.aiuto ?? 'Una voce per riga.'}
          value={righe.join('\n')}
          onChange={(evento) =>
            onCambia(
              evento.target.value
                .split('\n')
                .map((riga) => riga.trim())
                .filter(Boolean),
            )
          }
          className="sm:col-span-2"
          rows={4}
        />
      )
    }

    case 'palette': {
      const colori = Array.isArray(valore) ? (valore as string[]) : ['#1b1140', '#a06bff']
      return (
        <div className={classi('sm:col-span-2', larghezza)}>
          <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            {campo.etichetta}
          </p>
          <div className="flex items-center gap-4">
            {[0, 1].map((indice) => (
              <label key={indice} className="flex items-center gap-2">
                <span className="text-[0.82rem] text-tenue">
                  {indice === 0 ? 'Fondo' : 'Accento'}
                </span>
                <input
                  type="color"
                  value={colori[indice] ?? '#000000'}
                  onChange={(evento) => {
                    const prossimi = [...colori]
                    prossimi[indice] = evento.target.value
                    onCambia(prossimi)
                  }}
                  className="size-9 cursor-pointer rounded border border-bordo bg-transparent"
                  aria-label={`${campo.etichetta}: colore ${indice + 1}`}
                />
              </label>
            ))}
            <span
              className="h-9 flex-1 rounded-tenue"
              style={{
                backgroundImage: `linear-gradient(120deg, ${colori[0]}, ${colori[1]})`,
              }}
              aria-hidden
            />
          </div>
          {campo.aiuto && <p className="mt-2 text-[0.8rem] text-tenue">{campo.aiuto}</p>}
        </div>
      )
    }

    case 'colore':
      return (
        <div className={larghezza}>
          <p className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            {campo.etichetta}
          </p>
          <input
            type="color"
            value={String(valore ?? '#000000')}
            onChange={(evento) => onCambia(evento.target.value)}
            className="h-10 w-20 cursor-pointer rounded border border-bordo bg-transparent"
            aria-label={campo.etichetta}
          />
          {campo.aiuto && <p className="mt-2 text-[0.8rem] text-tenue">{campo.aiuto}</p>}
        </div>
      )

    default: {
      const tipiInput: Record<string, string> = {
        testo: 'text',
        numero: 'number',
        decimale: 'number',
        data: 'date',
        ora: 'time',
      }

      return (
        <Campo
          etichetta={campo.etichetta}
          aiuto={campo.aiuto}
          type={tipiInput[campo.tipo] ?? 'text'}
          step={campo.tipo === 'decimale' ? '0.01' : undefined}
          min={campo.minimo}
          max={campo.massimo}
          value={String(valore ?? '')}
          onChange={(evento) =>
            onCambia(
              campo.tipo === 'numero' || campo.tipo === 'decimale'
                ? evento.target.value === ''
                  ? ''
                  : Number(evento.target.value)
                : evento.target.value,
            )
          }
          className={larghezza}
        />
      )
    }
  }
}

/** Scorciatoia usata dalle colonne che mostrano un importo. */
export function cellaPrezzo(valore: number) {
  return <span className="tabellare">{prezzo(valore)}</span>
}

/** Scorciatoia per una colonna di stato con etichetta colorata. */
export function cellaStato(attivo: boolean, testoAttivo: string, testoSpento: string) {
  return (
    <Etichetta tono={attivo ? 'verde' : 'neutro'}>{attivo ? testoAttivo : testoSpento}</Etichetta>
  )
}
