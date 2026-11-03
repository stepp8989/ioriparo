'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { Campo, Gruppo } from '@/componenti/ui/campi'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { classi } from '@/lib/utili'

/**
 * Importazione dei film da The Movie Database.
 *
 * Il catalogo dimostrativo della piattaforma è inventato, e deve restarlo: le
 * locandine vere sono materiale di altri. Un cinema che apre davvero, però,
 * programma film veri, e trascrivere a mano trenta schede a settimana — trama,
 * durata, cast, regia, classificazione — è il genere di lavoro che si smette di
 * fare dopo la seconda settimana. Questa pagina prende la scheda da TMDB e la
 * mette in catalogo già compilata.
 *
 * Due cose sono deliberate e vanno dette:
 *
 *   — il film importato nasce **non pubblicato**. L'importazione porta dentro la
 *     materia prima; decidere che un titolo compaia sul sito resta un gesto di
 *     chi programma la sala, non l'effetto collaterale di un clic su «importa»;
 *   — reimportare un film già presente lo **aggiorna** invece di duplicarlo, e
 *     l'aggiornamento non tocca i campi che appartengono alla sala: formati di
 *     proiezione, evidenza in home, visibilità, trailer scelto a mano.
 *
 * Senza `TMDB_API_KEY` la pagina non finge: dice che cosa manca e dove
 * metterlo. Il resto del pannello continua a funzionare, e il catalogo si
 * compila a mano come prima.
 */

type Risultato = {
  tmdbId: number
  titolo: string
  anno: number
  locandina: string
  sinossi: string
}

type Elenco = 'in-sala' | 'in-arrivo' | 'ricerca'

export default function PaginaImporta() {
  const { mostra } = useAvvisi()

  const [elenco, setElenco] = useState<Elenco>('in-sala')
  const [query, setQuery] = useState('')
  const [risultati, setRisultati] = useState<Risultato[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')
  const [configurato, setConfigurato] = useState(true)
  const [inCorso, setInCorso] = useState<number | null>(null)
  const [importati, setImportati] = useState<Record<number, 'nuovo' | 'aggiornato'>>({})

  const carica = useCallback(
    async (quale: Elenco, testo: string) => {
      setCaricamento(true)
      setErrore('')
      try {
        const indirizzo = new URL('/api/admin/tmdb', window.location.origin)
        indirizzo.searchParams.set('elenco', quale)
        if (quale === 'ricerca') indirizzo.searchParams.set('q', testo)

        const risposta = await fetch(indirizzo, { cache: 'no-store' })
        const dati = await risposta.json()

        if (!risposta.ok) {
          setConfigurato(dati.configurato !== false)
          setErrore(dati.errore ?? 'Non è stato possibile interrogare TMDB.')
          setRisultati([])
          return
        }

        setConfigurato(true)
        setRisultati(dati.risultati ?? [])
      } catch {
        setErrore('Non è stato possibile raggiungere il server.')
        setRisultati([])
      } finally {
        setCaricamento(false)
      }
    },
    [],
  )

  // Elenco iniziale: i film in sala nel paese configurato, che è quello che
  // serve nove volte su dieci a chi apre questa pagina il lunedì mattina.
  useEffect(() => {
    if (elenco !== 'ricerca') void carica(elenco, '')
  }, [elenco, carica])

  async function importa(voce: Risultato) {
    setInCorso(voce.tmdbId)
    try {
      const risposta = await fetch('/api/admin/tmdb', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId: voce.tmdbId }),
      })
      const dati = await risposta.json()

      if (!risposta.ok) {
        mostra(dati.errore ?? 'Importazione non riuscita.', 'errore')
        return
      }

      setImportati((precedenti) => ({
        ...precedenti,
        [voce.tmdbId]: dati.aggiornato ? 'aggiornato' : 'nuovo',
      }))
      mostra(
        dati.aggiornato
          ? `«${voce.titolo}» aggiornato in catalogo.`
          : `«${voce.titolo}» aggiunto al catalogo, non ancora pubblicato.`,
        'ok',
      )
    } catch {
      mostra('Non è stato possibile raggiungere il server.', 'errore')
    } finally {
      setInCorso(null)
    }
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-titolo text-[1.6rem] font-bold">Importa film</h1>
        <p className="mt-1 max-w-2xl text-[0.9rem] leading-relaxed text-tenue">
          Schede, locandine, cast e trailer da The Movie Database. Il film arriva in catalogo{' '}
          <strong className="font-semibold text-testo">non pubblicato</strong>: formati di
          proiezione e visibilità restano da decidere dalla scheda del film.
        </p>
      </header>

      {!configurato && (
        <Nota tono="ambra" className="mb-5" icona={<Icona nome="avviso" className="size-4" />}>
          <p className="font-semibold text-testo">TMDB non è configurato.</p>
          <p className="mt-1">
            Serve una chiave v3 dal proprio profilo TMDB, scritta in{' '}
            <code className="rounded-[3px] bg-superficie-alt px-1.5 py-0.5 text-[0.82rem]">
              .env.local
            </code>{' '}
            come{' '}
            <code className="rounded-[3px] bg-superficie-alt px-1.5 py-0.5 text-[0.82rem]">
              TMDB_API_KEY
            </code>
            . La chiave non va mai messa nel codice né in un file versionato. Dopo averla aggiunta,
            riavviate il server.
          </p>
        </Nota>
      )}

      <div className="mb-5 flex flex-wrap items-end gap-4">
        <Gruppo
          etichetta="Elenco"
          valore={elenco}
          onCambia={(valore) => setElenco(valore)}
          voci={[
            { valore: 'in-sala', etichetta: 'In sala ora' },
            { valore: 'in-arrivo', etichetta: 'In arrivo' },
            { valore: 'ricerca', etichetta: 'Cerca per titolo' },
          ]}
        />

        {elenco === 'ricerca' && (
          <form
            className="flex items-end gap-2"
            onSubmit={(evento) => {
              evento.preventDefault()
              void carica('ricerca', query)
            }}
          >
            <Campo
              etichetta="Titolo"
              icona="cerca"
              value={query}
              onChange={(evento) => setQuery(evento.target.value)}
              placeholder="Per esempio: Dune"
              className="w-72"
            />
            <Bottone misura="normale" type="submit">
              Cerca
            </Bottone>
          </form>
        )}
      </div>

      {errore && configurato && (
        <Nota tono="rosso" className="mb-5" icona={<Icona nome="avviso" className="size-4" />}>
          {errore}
        </Nota>
      )}

      {caricamento ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, indice) => (
            <div key={indice} className="scheletro h-32 rounded-morbido" />
          ))}
        </div>
      ) : risultati.length === 0 ? (
        // Quando TMDB ha già dato un errore, il riquadro qui sopra lo dice:
        // aggiungere «nessun risultato» sarebbe ripetere la stessa notizia.
        errore ? null : (
          <Nota icona={<Icona nome="info" className="size-4" />}>
            {elenco === 'ricerca' && query
              ? 'Nessun film trovato con questo titolo.'
              : 'Nessun risultato da mostrare.'}
          </Nota>
        )
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {risultati.map((voce) => {
            const stato = importati[voce.tmdbId]
            return (
              <li
                key={voce.tmdbId}
                className={classi(
                  'flex gap-3 rounded-morbido border bg-superficie p-3 transition-colors',
                  stato ? 'border-ok/45' : 'border-bordo',
                )}
              >
                <div className="locandina w-[4.5rem] shrink-0 overflow-hidden rounded-tenue bg-superficie-alt">
                  {voce.locandina ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- immagine
                       remota di TMDB, fuori dall'ottimizzatore di Next. */
                    <img
                      src={voce.locandina}
                      alt=""
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  ) : (
                    <span className="flex size-full items-center justify-center text-tenue">
                      <Icona nome="ciak" className="size-5" />
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <p className="flex items-start gap-2">
                    <span className="min-w-0 flex-1 font-titolo text-[0.95rem] font-semibold leading-tight">
                      {voce.titolo}
                    </span>
                    {voce.anno > 0 && (
                      <span className="tabellare shrink-0 text-[0.78rem] text-tenue">
                        {voce.anno}
                      </span>
                    )}
                  </p>

                  <p className="mt-1 line-clamp-3 flex-1 text-[0.8rem] leading-relaxed text-tenue">
                    {voce.sinossi || 'Nessuna sinossi su TMDB.'}
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    {stato ? (
                      <Etichetta tono="verde">
                        <Icona nome="spunta" className="size-3" />
                        {stato === 'nuovo' ? 'In catalogo' : 'Aggiornato'}
                      </Etichetta>
                    ) : (
                      <Bottone
                        variante="tenue"
                        misura="piccola"
                        disabled={inCorso === voce.tmdbId}
                        onClick={() => void importa(voce)}
                      >
                        <Icona nome="scarica" className="size-3.5" />
                        {inCorso === voce.tmdbId ? 'Importo…' : 'Importa'}
                      </Bottone>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/*
        * Attribuzione: TMDB la richiede a chi usa le sue API, e il posto giusto
        * è sotto i dati che ne arrivano, non nascosta in una pagina di crediti.
        */}
      <p className="mt-8 border-t border-bordo pt-4 text-[0.78rem] leading-relaxed text-tenue">
        Dati e immagini dei film forniti da The Movie Database (TMDB). Questo servizio usa le API di
        TMDB ma non è approvato né certificato da TMDB.
      </p>
    </div>
  )
}
