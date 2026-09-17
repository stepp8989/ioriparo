'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useElenco } from '@/componenti/admin/dati'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo, Scelta } from '@/componenti/ui/campi'
import { oraLiberazione } from '@/lib/programmazione'
import { FORMATI, type Cinema, type Film, type Sala, type Spettacolo } from '@/lib/tipi'
import { classi, dataBreve, etichettaGiorno, oggiIso, prezzo, prossimiGiorni, raggruppa } from '@/lib/utili'

/**
 * Programmazione.
 *
 * La vista è per giornata e per sala, che è il modo in cui si ragiona davvero
 * quando si compone un palinsesto: non «tutti gli spettacoli di questo film»
 * ma «cosa c'è in sala 3 giovedì».
 *
 * Il controllo di sovrapposizione sta sul server e non qui: duplicarlo nel
 * browser darebbe due regole da tenere allineate, e quella che conta è
 * comunque l'altra. Il pannello si limita a mostrare bene l'errore che torna,
 * con l'orario esatto del conflitto.
 */

export default function PaginaProgrammazioneAdmin() {
  const { mostra } = useAvvisi()

  const { voci: film } = useElenco<Film>('/api/admin/film')
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')
  const { voci: sale } = useElenco<Sala>('/api/admin/sale')

  const [spettacoli, setSpettacoli] = useState<Spettacolo[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [giorno, setGiorno] = useState(oggiIso())
  const [cinemaId, setCinemaId] = useState('')

  const [modulo, setModulo] = useState<Partial<Spettacolo> | null>(null)
  const [errore, setErrore] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)
  const [generatore, setGeneratore] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch('/api/admin/spettacoli', { cache: 'no-store' })
      const dati = (await risposta.json()) as { voci: Spettacolo[] }
      setSpettacoli(dati.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  // Il primo cinema viene selezionato da solo: una pagina che mostra tutte le
  // sale di cinque strutture insieme non si legge.
  useEffect(() => {
    if (!cinemaId && cinema.length > 0) setCinemaId(cinema[0].id)
  }, [cinema, cinemaId])

  const filmPerId = useMemo(() => new Map(film.map((voce) => [voce.id, voce])), [film])
  const saleDelCinema = useMemo(
    () => sale.filter((voce) => voce.cinemaId === cinemaId),
    [cinemaId, sale],
  )

  const delGiorno = useMemo(
    () =>
      spettacoli
        .filter((voce) => voce.data === giorno && voce.cinemaId === cinemaId)
        .sort((a, b) => a.ora.localeCompare(b.ora)),
    [cinemaId, giorno, spettacoli],
  )

  const perSala = useMemo(() => raggruppa(delGiorno, (voce) => voce.salaId), [delGiorno])

  async function salva() {
    if (!modulo) return
    setSalvataggio(true)
    setErrore('')

    try {
      const risposta = await fetch('/api/admin/spettacoli', {
        method: modulo.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(modulo),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        setErrore(esito.errore ?? 'Salvataggio non riuscito.')
        return
      }

      mostra(modulo.id ? 'Spettacolo aggiornato.' : 'Spettacolo aggiunto.', 'ok')
      setModulo(null)
      await carica()
    } finally {
      setSalvataggio(false)
    }
  }

  async function cambiaStato(spettacolo: Spettacolo, stato: 'programmato' | 'annullato') {
    const risposta = await fetch('/api/admin/spettacoli', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: spettacolo.id, stato }),
    })

    if (!risposta.ok) {
      const esito = await risposta.json()
      mostra(esito.errore ?? 'Modifica non riuscita.', 'errore')
      return
    }

    mostra(stato === 'annullato' ? 'Spettacolo annullato.' : 'Spettacolo ripristinato.', 'ok')
    await carica()
  }

  async function elimina(spettacolo: Spettacolo) {
    const risposta = await fetch('/api/admin/spettacoli', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: spettacolo.id }),
    })

    const esito = await risposta.json()

    if (!risposta.ok) {
      mostra(esito.errore ?? 'Eliminazione non riuscita.', 'errore')
      return
    }

    mostra('Spettacolo eliminato.', 'ok')
    await carica()
  }

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-titolo text-[1.8rem] font-semibold">Programmazione</h1>
          <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
            Una giornata alla volta, sala per sala. Il sistema impedisce due proiezioni
            sovrapposte tenendo conto della durata del film, della pubblicità e del tempo di
            pulizia.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Bottone variante="tenue" onClick={() => setGeneratore(true)}>
            <Icona nome="fulmine" className="size-4" />
            Genera palinsesto
          </Bottone>
          <Bottone
            onClick={() =>
              setModulo({
                data: giorno,
                ora: '20:00',
                formato: '2D',
                lingua: 'IT',
                prezzoBase: 9,
                salaId: saleDelCinema[0]?.id ?? '',
                filmId: film[0]?.id ?? '',
              })
            }
          >
            <Icona nome="piu" className="size-4" />
            Aggiungi
          </Bottone>
        </div>
      </header>

      {/* ── Selettori ───────────────────────────────────────────────────── */}
      <div className="mt-7 flex flex-wrap items-end gap-4">
        <label className="min-w-[14rem]">
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

        <div className="senza-barra flex gap-2 overflow-x-auto">
          {prossimiGiorni(10).map((data) => (
            <button
              key={data}
              type="button"
              onClick={() => setGiorno(data)}
              aria-pressed={giorno === data}
              className={classi(
                'flex min-w-[5.5rem] shrink-0 flex-col items-center rounded-tenue border px-3 py-2.5 transition-colors',
                giorno === data
                  ? 'border-accento bg-accento text-white'
                  : 'border-bordo bg-superficie text-tenue hover:border-accento',
              )}
            >
              <span className="text-[0.76rem] font-semibold">{etichettaGiorno(data)}</span>
              <span className="tabellare text-[0.7rem] opacity-80">{dataBreve(data)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Sale ────────────────────────────────────────────────────────── */}
      <div className="mt-7 space-y-5">
        {caricamento ? (
          Array.from({ length: 3 }, (_, indice) => (
            <Scheletro key={indice} className="h-32 rounded-ampio" />
          ))
        ) : saleDelCinema.length === 0 ? (
          <Nota icona={<Icona nome="info" className="size-4" />}>
            Questo cinema non ha sale configurate.
          </Nota>
        ) : (
          saleDelCinema.map((sala) => {
            const voci = perSala.get(sala.id) ?? []

            return (
              <section key={sala.id} className="rounded-ampio border border-bordo bg-superficie p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-titolo text-[1.05rem] font-semibold">
                    {sala.nome}
                    <span className="ml-2 text-[0.8rem] font-normal text-tenue">
                      {voci.length} {voci.length === 1 ? 'spettacolo' : 'spettacoli'}
                    </span>
                  </h2>

                  <button
                    type="button"
                    onClick={() =>
                      setModulo({
                        data: giorno,
                        ora: '20:00',
                        formato: sala.formati[0] ?? '2D',
                        lingua: 'IT',
                        prezzoBase: 9,
                        salaId: sala.id,
                        filmId: film[0]?.id ?? '',
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-tenue border border-bordo px-3 py-1.5 text-[0.78rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                  >
                    <Icona nome="piu" className="size-3.5" />
                    In questa sala
                  </button>
                </div>

                {voci.length === 0 ? (
                  <p className="mt-4 text-[0.86rem] text-tenue">Sala libera per tutta la giornata.</p>
                ) : (
                  <ul className="mt-4 space-y-2">
                    {voci.map((spettacolo) => {
                      const titolo = filmPerId.get(spettacolo.filmId)
                      const durataFilm = titolo?.durataMinuti ?? 120

                      return (
                        <li
                          key={spettacolo.id}
                          className={classi(
                            'flex flex-wrap items-center gap-3 rounded-tenue border border-bordo p-3',
                            spettacolo.stato === 'annullato' && 'opacity-55',
                          )}
                        >
                          <span className="tabellare w-14 shrink-0 font-titolo text-[1.05rem] font-semibold">
                            {spettacolo.ora}
                          </span>

                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-medium">
                              {titolo?.titolo ?? 'Film non trovato'}
                            </span>
                            <span className="block text-[0.76rem] text-tenue">
                              libera alle {oraLiberazione(spettacolo.ora, durataFilm)} ·{' '}
                              {spettacolo.formato}
                              {spettacolo.lingua === 'VO' && ' · VO'} · {prezzo(spettacolo.prezzoBase)}
                            </span>
                          </span>

                          {spettacolo.stato === 'annullato' && <Etichetta tono="rosso">Annullato</Etichetta>}

                          <span className="flex shrink-0 gap-1.5">
                            <button
                              type="button"
                              onClick={() => setModulo(spettacolo)}
                              className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
                              aria-label="Modifica"
                            >
                              <Icona nome="matita" className="size-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                cambiaStato(
                                  spettacolo,
                                  spettacolo.stato === 'annullato' ? 'programmato' : 'annullato',
                                )
                              }
                              className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-attesa hover:text-attesa"
                              aria-label={
                                spettacolo.stato === 'annullato' ? 'Ripristina' : 'Annulla'
                              }
                            >
                              <Icona
                                nome={spettacolo.stato === 'annullato' ? 'aggiorna' : 'chiudi'}
                                className="size-3.5"
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => void elimina(spettacolo)}
                              className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-errore hover:text-errore"
                              aria-label="Elimina"
                            >
                              <Icona nome="cestino" className="size-3.5" />
                            </button>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            )
          })
        )}
      </div>

      {/* ── Modulo dello spettacolo ─────────────────────────────────────── */}
      <Finestra
        aperta={modulo !== null}
        onChiudi={() => {
          setModulo(null)
          setErrore('')
        }}
        titolo={modulo?.id ? 'Modifica spettacolo' : 'Nuovo spettacolo'}
      >
        {modulo && (
          <form
            onSubmit={(evento) => {
              evento.preventDefault()
              void salva()
            }}
            className="space-y-5"
          >
            {errore && (
              <Nota tono="rosso" icona={<Icona nome="avviso" className="size-4" />}>
                {errore}
              </Nota>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Scelta
                etichetta="Film"
                value={modulo.filmId ?? ''}
                onChange={(evento) => setModulo({ ...modulo, filmId: evento.target.value })}
                className="sm:col-span-2"
              >
                <option value="">— scegli —</option>
                {film.map((voce) => (
                  <option key={voce.id} value={voce.id}>
                    {voce.titolo} ({voce.durataMinuti} min)
                  </option>
                ))}
              </Scelta>

              <Scelta
                etichetta="Sala"
                value={modulo.salaId ?? ''}
                onChange={(evento) => setModulo({ ...modulo, salaId: evento.target.value })}
              >
                <option value="">— scegli —</option>
                {saleDelCinema.map((voce) => (
                  <option key={voce.id} value={voce.id}>
                    {voce.nome}
                  </option>
                ))}
              </Scelta>

              <Scelta
                etichetta="Formato"
                value={modulo.formato ?? '2D'}
                onChange={(evento) =>
                  setModulo({ ...modulo, formato: evento.target.value as Spettacolo['formato'] })
                }
                aiuto="Deve essere supportato sia dal film sia dalla sala."
              >
                {FORMATI.map((voce) => (
                  <option key={voce} value={voce}>
                    {voce}
                  </option>
                ))}
              </Scelta>

              <Campo
                etichetta="Data"
                type="date"
                value={modulo.data ?? ''}
                onChange={(evento) => setModulo({ ...modulo, data: evento.target.value })}
              />

              <Campo
                etichetta="Ora"
                type="time"
                value={modulo.ora ?? ''}
                onChange={(evento) => setModulo({ ...modulo, ora: evento.target.value })}
              />

              <Scelta
                etichetta="Lingua"
                value={modulo.lingua ?? 'IT'}
                onChange={(evento) =>
                  setModulo({ ...modulo, lingua: evento.target.value as 'IT' | 'VO' })
                }
              >
                <option value="IT">Doppiato in italiano</option>
                <option value="VO">Lingua originale sottotitolata</option>
              </Scelta>

              <Campo
                etichetta="Prezzo base (€)"
                type="number"
                step="0.5"
                min={0}
                value={modulo.prezzoBase ?? 0}
                onChange={(evento) =>
                  setModulo({ ...modulo, prezzoBase: Number(evento.target.value) })
                }
                aiuto="Supplementi di formato e poltrona si sommano a questo."
              />
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

      <GeneratorePalinsesto
        aperto={generatore}
        onChiudi={() => setGeneratore(false)}
        cinema={cinema}
        onFatto={carica}
      />
    </div>
  )
}

/* ── Generatore ─────────────────────────────────────────────────────────── */

function GeneratorePalinsesto({
  aperto,
  onChiudi,
  cinema,
  onFatto,
}: {
  aperto: boolean
  onChiudi: () => void
  cinema: Cinema[]
  onFatto: () => void
}) {
  const { mostra } = useAvvisi()
  const [da, setDa] = useState(oggiIso())
  const [giorni, setGiorni] = useState(7)
  const [cinemaId, setCinemaId] = useState('')
  const [anteprima, setAnteprima] = useState<number | null>(null)
  const [inCorso, setInCorso] = useState(false)

  async function esegui(soloAnteprima: boolean) {
    setInCorso(true)
    try {
      const risposta = await fetch('/api/admin/palinsesto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          da,
          giorni,
          cinemaIds: cinemaId ? [cinemaId] : [],
          anteprima: soloAnteprima,
        }),
      })

      const esito = (await risposta.json()) as { creati: number }

      if (soloAnteprima) {
        setAnteprima(esito.creati)
        return
      }

      mostra(`${esito.creati} spettacoli aggiunti.`, 'ok')
      setAnteprima(null)
      onFatto()
      onChiudi()
    } finally {
      setInCorso(false)
    }
  }

  return (
    <Finestra aperta={aperto} onChiudi={onChiudi} titolo="Genera il palinsesto">
      <div className="space-y-5">
        <Nota icona={<Icona nome="info" className="size-4" />}>
          Riempie le sale libere con i film in programmazione, rispettando classificazioni, formati
          della sala e fasce orarie sensate. Gli spettacoli già inseriti non vengono toccati: la
          generazione lavora attorno a quello che c’è.
        </Nota>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo
            etichetta="A partire dal"
            type="date"
            value={da}
            onChange={(evento) => {
              setDa(evento.target.value)
              setAnteprima(null)
            }}
          />
          <Campo
            etichetta="Per quanti giorni"
            type="number"
            min={1}
            max={30}
            value={giorni}
            onChange={(evento) => {
              setGiorni(Number(evento.target.value))
              setAnteprima(null)
            }}
          />
          <Scelta
            etichetta="Cinema"
            value={cinemaId}
            onChange={(evento) => {
              setCinemaId(evento.target.value)
              setAnteprima(null)
            }}
            className="sm:col-span-2"
          >
            <option value="">Tutta la rete</option>
            {cinema.map((voce) => (
              <option key={voce.id} value={voce.id}>
                {voce.nome}
              </option>
            ))}
          </Scelta>
        </div>

        {anteprima !== null && (
          <Nota tono={anteprima > 0 ? 'verde' : 'ambra'} icona={<Icona nome="spunta" className="size-4" />}>
            Verrebbero creati <strong className="text-testo">{anteprima}</strong> spettacoli.
          </Nota>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-bordo pt-5">
          <Bottone variante="tenue" onClick={onChiudi}>
            Annulla
          </Bottone>
          <Bottone variante="contorno" onClick={() => esegui(true)} disabled={inCorso}>
            Anteprima
          </Bottone>
          <Bottone onClick={() => esegui(false)} disabled={inCorso}>
            {inCorso ? 'Un momento…' : 'Genera e salva'}
          </Bottone>
        </div>
      </div>
    </Finestra>
  )
}
