'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useElenco } from '@/componenti/admin/dati'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo } from '@/componenti/ui/campi'
import { capienza, conteggioPerTipo, generaSchema, type ConfigurazioneSala } from '@/lib/posti'
import { FORMATI, type Cinema, type Sala, type SchemaSala, type TipoPosto } from '@/lib/tipi'
import { classi, numero, prezzo } from '@/lib/utili'

/**
 * Editor delle sale.
 *
 * Due modi di lavorare, in ordine di frequenza d'uso:
 *
 *   — **Parametri.** File, posti per fila, quante file premium, quanti posti
 *     riservati, quanti corridoi. Copre il novanta per cento delle sale, e
 *     costruire una pianta richiede trenta secondi.
 *
 *   — **Ritocco a mano.** Sulla pianta generata si cambia il tipo di una
 *     singola poltrona: un posto rotto diventa un corridoio, una fila diventa
 *     premium. Da quel momento la sala è descritta dallo schema e non più dai
 *     parametri, e il pannello lo dice invece di sovrascrivere il lavoro
 *     fatto alla prima modifica dei parametri.
 */

const TIPI_MODIFICABILI: { tipo: TipoPosto; etichetta: string; colore: string }[] = [
  { tipo: 'standard', etichetta: 'Standard', colore: 'bg-bordo' },
  { tipo: 'premium', etichetta: 'Premium', colore: 'bg-ambra/40' },
  { tipo: 'disabili', etichetta: 'Riservato', colore: 'bg-ok/35' },
  { tipo: 'accompagnatore', etichetta: 'Accompagnatore', colore: 'bg-ok/20' },
  { tipo: 'vuoto', etichetta: 'Corridoio', colore: 'bg-transparent border border-dashed border-bordo-forte' },
]

export default function PaginaSaleAdmin() {
  const { mostra } = useAvvisi()
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')

  const [sale, setSale] = useState<Sala[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cinemaId, setCinemaId] = useState('')
  const [inModifica, setInModifica] = useState<Sala | null>(null)
  const [nuova, setNuova] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch('/api/admin/sale', { cache: 'no-store' })
      const dati = (await risposta.json()) as { voci: Sala[] }
      setSale(dati.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  useEffect(() => {
    if (!cinemaId && cinema.length > 0) setCinemaId(cinema[0].id)
  }, [cinema, cinemaId])

  const saleDelCinema = useMemo(
    () => sale.filter((voce) => voce.cinemaId === cinemaId),
    [cinemaId, sale],
  )

  async function elimina(sala: Sala) {
    const risposta = await fetch('/api/admin/sale', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sala.id }),
    })

    const esito = await risposta.json()

    if (!risposta.ok) {
      mostra(esito.errore ?? 'Eliminazione non riuscita.', 'errore')
      return
    }

    mostra('Sala eliminata.', 'ok')
    await carica()
  }

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-titolo text-[1.8rem] font-semibold">Sale e posti</h1>
          <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
            La pianta di ogni sala, con i tipi di poltrona. È lo stesso schema che il pubblico vede
            durante l’acquisto: quello che imposti qui è quello che si può comprare.
          </p>
        </div>

        <Bottone onClick={() => setNuova(true)} disabled={!cinemaId}>
          <Icona nome="piu" className="size-4" />
          Nuova sala
        </Bottone>
      </header>

      <label className="mt-7 block max-w-xs">
        <span className="mb-2 block text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
          Cinema
        </span>
        <select
          value={cinemaId}
          onChange={(evento) => setCinemaId(evento.target.value)}
          className="w-full rounded-tenue border border-bordo bg-superficie px-4 py-2.5 text-[0.88rem] focus:border-accento focus:outline-none"
        >
          {cinema.map((voce) => (
            <option key={voce.id} value={voce.id}>
              {voce.nome}
            </option>
          ))}
        </select>
      </label>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {caricamento ? (
          Array.from({ length: 3 }, (_, indice) => (
            <Scheletro key={indice} className="h-44 rounded-ampio" />
          ))
        ) : saleDelCinema.length === 0 ? (
          <Nota className="sm:col-span-2 lg:col-span-3" icona={<Icona nome="info" className="size-4" />}>
            Nessuna sala in questo cinema.
          </Nota>
        ) : (
          saleDelCinema.map((sala) => {
            const conteggio = conteggioPerTipo(sala.schema)

            return (
              <article key={sala.id} className="rounded-ampio border border-bordo bg-superficie p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="font-titolo text-[1.05rem] font-semibold">{sala.nome}</h2>
                    <p className="mt-1 text-[0.8rem] text-tenue">
                      {numero(capienza(sala.schema))} posti · {sala.schema.file.length} file
                    </p>
                  </div>
                  {!sala.attiva && <Etichetta tono="neutro">Chiusa</Etichetta>}
                </div>

                <Anteprima schema={sala.schema} className="mt-4" />

                <p className="mt-4 flex flex-wrap gap-1.5">
                  {sala.formati.map((formato) => (
                    <Etichetta key={formato} tono="ambra" className="px-2 py-0.5 text-[0.56rem]">
                      {formato}
                    </Etichetta>
                  ))}
                  {conteggio.premium > 0 && (
                    <Etichetta tono="neutro" className="px-2 py-0.5 text-[0.56rem]">
                      {conteggio.premium} premium
                    </Etichetta>
                  )}
                  {conteggio.disabili > 0 && (
                    <Etichetta tono="verde" className="px-2 py-0.5 text-[0.56rem]">
                      {conteggio.disabili} riservati
                    </Etichetta>
                  )}
                  {sala.supplemento > 0 && (
                    <Etichetta tono="accento" className="px-2 py-0.5 text-[0.56rem]">
                      +{prezzo(sala.supplemento)}
                    </Etichetta>
                  )}
                </p>

                <div className="mt-4 flex gap-2">
                  <Bottone variante="tenue" misura="piccola" onClick={() => setInModifica(sala)}>
                    <Icona nome="matita" className="size-3.5" />
                    Modifica
                  </Bottone>
                  <button
                    type="button"
                    onClick={() => void elimina(sala)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-errore hover:text-errore"
                    aria-label={`Elimina ${sala.nome}`}
                  >
                    <Icona nome="cestino" className="size-3.5" />
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      <EditorSala
        aperto={nuova || inModifica !== null}
        sala={inModifica}
        cinemaId={cinemaId}
        onChiudi={() => {
          setNuova(false)
          setInModifica(null)
        }}
        onSalvato={() => {
          setNuova(false)
          setInModifica(null)
          void carica()
        }}
      />
    </div>
  )
}

/* ── Anteprima in miniatura ─────────────────────────────────────────────── */

function Anteprima({ schema, className }: { schema: SchemaSala; className?: string }) {
  return (
    <div className={classi('overflow-x-auto rounded-tenue bg-sfondo-alt p-3', className)}>
      <div className="mx-auto h-0.5 w-2/3 rounded-full bg-accento/60" aria-hidden />
      <div className="mt-2 flex w-fit flex-col gap-[2px]" aria-hidden>
        {schema.file.map((fila) => (
          <div key={fila.etichetta} className="flex gap-[2px]">
            {fila.posti.map((posto, indice) => (
              <span
                key={indice}
                className={classi(
                  'size-[5px] rounded-[1px]',
                  posto.tipo === 'vuoto' && 'bg-transparent',
                  posto.tipo === 'standard' && 'bg-bordo-forte',
                  posto.tipo === 'premium' && 'bg-ambra',
                  (posto.tipo === 'disabili' || posto.tipo === 'accompagnatore') && 'bg-ok',
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Editor ─────────────────────────────────────────────────────────────── */

function EditorSala({
  aperto,
  sala,
  cinemaId,
  onChiudi,
  onSalvato,
}: {
  aperto: boolean
  sala: Sala | null
  cinemaId: string
  onChiudi: () => void
  onSalvato: () => void
}) {
  const { mostra } = useAvvisi()

  const [nome, setNome] = useState('')
  const [formati, setFormati] = useState<string[]>(['2D'])
  const [supplemento, setSupplemento] = useState(0)
  const [attiva, setAttiva] = useState(true)

  const [configurazione, setConfigurazione] = useState<ConfigurazioneSala>({
    file: 12,
    postiPerFila: 16,
    filePremium: 3,
    postiDisabili: 2,
    filaDisabili: 0,
    corridoiVerticali: 2,
    corridoiOrizzontali: [],
    schermo: 'alto',
  })

  const [schema, setSchema] = useState<SchemaSala | null>(null)
  const [ritoccato, setRitoccato] = useState(false)
  const [pennello, setPennello] = useState<TipoPosto>('premium')
  const [salvataggio, setSalvataggio] = useState(false)

  useEffect(() => {
    if (!aperto) return

    if (sala) {
      setNome(sala.nome)
      setFormati(sala.formati)
      setSupplemento(sala.supplemento)
      setAttiva(sala.attiva)
      setSchema(sala.schema)
      // Una sala esistente si apre sempre in modalità «ritoccata»: non
      // sappiamo con quali parametri fu creata, e rigenerarla cancellerebbe
      // ogni modifica fatta a mano nel frattempo.
      setRitoccato(true)
    } else {
      setNome('')
      setFormati(['2D'])
      setSupplemento(0)
      setAttiva(true)
      setSchema(generaSchema(configurazione))
      setRitoccato(false)
    }
    // `configurazione` volutamente fuori: qui si inizializza soltanto.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aperto, sala])

  function rigenera(prossima: ConfigurazioneSala) {
    setConfigurazione(prossima)
    setSchema(generaSchema(prossima))
    setRitoccato(false)
  }

  function ritocca(indiceFila: number, indicePosto: number) {
    if (!schema) return

    const prossimo: SchemaSala = {
      ...schema,
      file: schema.file.map((fila, i) =>
        i !== indiceFila
          ? fila
          : {
              ...fila,
              posti: fila.posti.map((posto, j) =>
                j !== indicePosto ? posto : { ...posto, tipo: pennello },
              ),
            },
      ),
    }

    setSchema(prossimo)
    setRitoccato(true)
  }

  async function salva() {
    if (!schema) return
    setSalvataggio(true)

    try {
      const risposta = await fetch('/api/admin/sale', {
        method: sala ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sala?.id,
          cinemaId: sala?.cinemaId ?? cinemaId,
          nome,
          formati,
          supplemento,
          attiva,
          // Si manda lo schema completo quando è stato ritoccato a mano,
          // altrimenti i parametri: così il server sa quale delle due
          // descrizioni è quella buona.
          ...(ritoccato ? { schema } : { configurazione }),
        }),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Salvataggio non riuscito.', 'errore')
        return
      }

      mostra(sala ? 'Sala aggiornata.' : 'Sala creata.', 'ok')
      onSalvato()
    } finally {
      setSalvataggio(false)
    }
  }

  return (
    <Finestra
      aperta={aperto}
      onChiudi={onChiudi}
      titolo={sala ? `Modifica: ${sala.nome}` : 'Nuova sala'}
      ampia
    >
      <div className="space-y-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etichetta="Nome della sala" value={nome} onChange={(evento) => setNome(evento.target.value)} />
          <Campo
            etichetta="Supplemento di sala (€)"
            type="number"
            step="0.5"
            min={0}
            value={supplemento}
            onChange={(evento) => setSupplemento(Number(evento.target.value))}
            aiuto="Si somma a ogni biglietto venduto in questa sala."
          />
        </div>

        <fieldset>
          <legend className="mb-2 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            Formati proiettabili
          </legend>
          <div className="flex flex-wrap gap-2">
            {FORMATI.map((formato) => {
              const attivo = formati.includes(formato)
              return (
                <button
                  key={formato}
                  type="button"
                  aria-pressed={attivo}
                  onClick={() =>
                    setFormati(
                      attivo ? formati.filter((voce) => voce !== formato) : [...formati, formato],
                    )
                  }
                  className={classi(
                    'rounded-tenue border px-3.5 py-2 text-[0.82rem] transition-colors',
                    attivo
                      ? 'border-accento bg-accento text-white'
                      : 'border-bordo text-tenue hover:border-accento',
                  )}
                >
                  {formato}
                </button>
              )
            })}
          </div>
        </fieldset>

        {/* ── Parametri ─────────────────────────────────────────────────── */}
        <div className="rounded-morbido border border-bordo p-5">
          <h3 className="font-titolo text-[1rem] font-semibold">Genera la pianta</h3>
          <p className="mt-1 text-[0.82rem] text-tenue">
            Rigenerando la pianta si perdono le modifiche fatte a mano sulle singole poltrone.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(
              [
                ['file', 'File', 1, 40],
                ['postiPerFila', 'Posti per fila', 2, 60],
                ['filePremium', 'File premium (dal fondo)', 0, 40],
                ['postiDisabili', 'Posti riservati', 0, 20],
                ['corridoiVerticali', 'Corridoi verticali', 0, 4],
                ['filaDisabili', 'Fila dei riservati (0 = automatica)', 0, 40],
              ] as const
            ).map(([chiave, etichetta, minimo, massimo]) => (
              <Campo
                key={chiave}
                etichetta={etichetta}
                type="number"
                min={minimo}
                max={massimo}
                value={configurazione[chiave] as number}
                onChange={(evento) =>
                  rigenera({ ...configurazione, [chiave]: Number(evento.target.value) })
                }
              />
            ))}
          </div>

          {ritoccato && sala && (
            <Nota tono="ambra" className="mt-4" icona={<Icona nome="info" className="size-4" />}>
              Questa sala è descritta dalla sua pianta, non dai parametri. Toccando i campi qui
              sopra la pianta viene ricostruita da zero.
            </Nota>
          )}
        </div>

        {/* ── Pianta ────────────────────────────────────────────────────── */}
        {schema && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-titolo text-[1rem] font-semibold">
                Pianta
                <span className="ml-2 text-[0.82rem] font-normal text-tenue">
                  {numero(capienza(schema))} posti
                </span>
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[0.78rem] text-tenue">Tocca una poltrona per renderla:</span>
                {TIPI_MODIFICABILI.map((voce) => (
                  <button
                    key={voce.tipo}
                    type="button"
                    aria-pressed={pennello === voce.tipo}
                    onClick={() => setPennello(voce.tipo)}
                    className={classi(
                      'inline-flex items-center gap-1.5 rounded-tenue border px-3 py-1.5 text-[0.76rem] transition-colors',
                      pennello === voce.tipo
                        ? 'border-accento text-accento'
                        : 'border-bordo text-tenue hover:border-accento',
                    )}
                  >
                    <span className={classi('size-3 rounded-sm', voce.colore)} aria-hidden />
                    {voce.etichetta}
                  </button>
                ))}
              </div>
            </div>

            <div className="senza-barra mt-4 overflow-x-auto rounded-morbido border border-bordo bg-sfondo-alt p-4">
              <div className="mx-auto mb-4 h-1 w-2/3 max-w-md rounded-full bg-gradient-to-r from-transparent via-accento to-transparent" />
              <p className="mb-4 text-center text-[0.66rem] font-semibold uppercase tracking-[0.28em] text-tenue">
                Schermo
              </p>

              <div className="mx-auto flex w-fit flex-col gap-1">
                {schema.file.map((fila, indiceFila) => (
                  <div key={fila.etichetta} className="flex items-center gap-1">
                    <span className="tabellare w-5 text-center text-[0.62rem] text-tenue">
                      {fila.etichetta}
                    </span>

                    {fila.posti.map((posto, indicePosto) => (
                      <button
                        key={indicePosto}
                        type="button"
                        onClick={() => ritocca(indiceFila, indicePosto)}
                        aria-label={`Fila ${fila.etichetta}, posizione ${indicePosto + 1}: ${posto.tipo}`}
                        className={classi(
                          'size-5 rounded-t-md rounded-b-sm transition-colors',
                          posto.tipo === 'vuoto' && 'border border-dashed border-bordo-forte bg-transparent',
                          posto.tipo === 'standard' && 'bg-bordo hover:bg-bordo-forte',
                          posto.tipo === 'premium' && 'bg-ambra/45 hover:bg-ambra/65',
                          posto.tipo === 'disabili' && 'bg-ok/45 hover:bg-ok/65',
                          posto.tipo === 'accompagnatore' && 'bg-ok/25 hover:bg-ok/40',
                        )}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-bordo pt-5">
          <label className="inline-flex items-center gap-2 text-[0.88rem]">
            <input
              type="checkbox"
              checked={attiva}
              onChange={(evento) => setAttiva(evento.target.checked)}
              className="size-4 accent-[var(--accento)]"
            />
            Sala attiva
          </label>

          <div className="flex gap-3">
            <Bottone variante="tenue" onClick={onChiudi}>
              Annulla
            </Bottone>
            <Bottone onClick={() => void salva()} disabled={salvataggio || !nome}>
              {salvataggio ? 'Salvataggio…' : 'Salva la sala'}
            </Bottone>
          </div>
        </div>
      </div>
    </Finestra>
  )
}
