'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MappaPosti, type PostoScelto } from '@/componenti/prenota/MappaPosti'
import { Riepilogo } from '@/componenti/prenota/Riepilogo'
import { SceltaBiglietti } from '@/componenti/prenota/SceltaBiglietti'
import { SceltaFood } from '@/componenti/prenota/SceltaFood'
import { Pagamento } from '@/componenti/prenota/Pagamento'
import {
  NOMI_PASSO,
  PASSI,
  type CatalogoAcquisto,
  type Passo,
  type RispostaConto,
  type RispostaDisponibilita,
} from '@/componenti/prenota/tipi'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Locandina } from '@/componenti/ui/Poster'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import {
  chiavePosto,
  classi,
  dataBreve,
  durata,
  etichettaGiorno,
  minutiAllInizio,
  prezzo,
} from '@/lib/utili'

/**
 * Motore di prenotazione.
 *
 * Otto passi più la conferma, attraversabili in avanti e all'indietro senza
 * perdere nulla di quello che si è già scelto. Chi arriva da un orario
 * specifico — il caso più frequente, perché gli orari sono collegamenti diretti
 * dalle schede dei film — salta direttamente alla scelta dei posti.
 *
 * Tre meccanismi tengono l'acquisto onesto:
 *
 *   — **Il prezzo lo calcola il server.** Ogni modifica alla selezione
 *     interroga `/api/ordine`, che usa lo stesso motore con cui poi si incassa.
 *     Il browser non somma niente per conto proprio.
 *
 *   — **La disponibilità si aggiorna da sola.** Finché si è sulla mappa, lo
 *     stato dei posti viene riletto ogni venticinque secondi. In una serata di
 *     prima visione una poltrona può sparire mentre la si sta guardando, ed è
 *     meglio vederla diventare grigia che scoprirlo al momento di pagare.
 *
 *   — **I posti si bloccano solo al momento giusto.** La prenotazione nasce
 *     quando si preme «paga», non quando si tocca una poltrona: finché si sta
 *     decidendo, nessun posto viene tolto agli altri.
 */

type Props = {
  catalogo: CatalogoAcquisto
  /** Spettacolo già scelto arrivando da una scheda film o dalla programmazione. */
  spettacoloIniziale: string
  /** Vero quando si torna indietro da un pagamento annullato. */
  annullato: boolean
}

const INTERVALLO_AGGIORNAMENTO = 25_000

export function Prenotazione({ catalogo, spettacoloIniziale, annullato }: Props) {
  const router = useRouter()
  const { mostra } = useAvvisi()

  const spettacoloDiPartenza = useMemo(
    () => catalogo.spettacoli.find((voce) => voce.id === spettacoloIniziale) ?? null,
    [catalogo.spettacoli, spettacoloIniziale],
  )

  const [passo, setPasso] = useState<Passo>(spettacoloDiPartenza ? 'posti' : 'cinema')
  const [cinemaId, setCinemaId] = useState(spettacoloDiPartenza?.cinemaId ?? '')
  const [filmId, setFilmId] = useState(spettacoloDiPartenza?.filmId ?? '')
  const [data, setData] = useState(spettacoloDiPartenza?.data ?? '')
  const [spettacoloId, setSpettacoloId] = useState(spettacoloDiPartenza?.id ?? '')

  const [selezione, setSelezione] = useState<PostoScelto[]>([])
  const [tipologiePerPosto, setTipologiePerPosto] = useState<Record<string, string>>({})
  const [quantitaFood, setQuantitaFood] = useState<Record<string, number>>({})

  const [promoCodice, setPromoCodice] = useState('')
  const [giftCardCodice, setGiftCardCodice] = useState('')
  const [puntiDaUsare, setPuntiDaUsare] = useState(0)

  const [ospite, setOspite] = useState({
    nome: catalogo.cliente ? `${catalogo.cliente.nome} ${catalogo.cliente.cognome}` : '',
    email: catalogo.cliente?.email ?? '',
    telefono: catalogo.cliente?.telefono ?? '',
  })

  const [disponibilita, setDisponibilita] = useState<RispostaDisponibilita | null>(null)
  const [caricamentoMappa, setCaricamentoMappa] = useState(false)
  const [esitoConto, setEsitoConto] = useState<RispostaConto | null>(null)
  const [caricamentoConto, setCaricamentoConto] = useState(false)
  const [errore, setErrore] = useState('')
  const [invio, setInvio] = useState(false)

  const spettacolo = useMemo(
    () => catalogo.spettacoli.find((voce) => voce.id === spettacoloId) ?? null,
    [catalogo.spettacoli, spettacoloId],
  )

  const film = useMemo(
    () => catalogo.film.find((voce) => voce.id === (spettacolo?.filmId ?? filmId)) ?? null,
    [catalogo.film, filmId, spettacolo],
  )

  const cinema = useMemo(
    () => catalogo.cinema.find((voce) => voce.id === (spettacolo?.cinemaId ?? cinemaId)) ?? null,
    [catalogo.cinema, cinemaId, spettacolo],
  )

  const tipologiaPredefinita = catalogo.tipologie[0]?.id ?? ''

  /* ── Disponibilità ────────────────────────────────────────────────────── */
  const aggiornaDisponibilita = useCallback(
    async (silenzioso = false) => {
      if (!spettacoloId) return
      if (!silenzioso) setCaricamentoMappa(true)

      try {
        const risposta = await fetch(`/api/disponibilita?spettacolo=${spettacoloId}`, {
          cache: 'no-store',
        })
        if (!risposta.ok) throw new Error('disponibilità non leggibile')
        setDisponibilita((await risposta.json()) as RispostaDisponibilita)
      } catch {
        if (!silenzioso) setErrore('Non riusciamo a leggere la disponibilità dei posti.')
      } finally {
        setCaricamentoMappa(false)
      }
    },
    [spettacoloId],
  )

  useEffect(() => {
    setDisponibilita(null)
    setSelezione([])
    void aggiornaDisponibilita()
  }, [aggiornaDisponibilita])

  // Aggiornamento periodico, ma solo mentre si guarda la mappa: continuare a
  // interrogare il server mentre si scrivono i dati del pagamento sarebbe
  // traffico sprecato.
  useEffect(() => {
    if (passo !== 'posti' || !spettacoloId) return
    const orologio = window.setInterval(
      () => void aggiornaDisponibilita(true),
      INTERVALLO_AGGIORNAMENTO,
    )
    return () => window.clearInterval(orologio)
  }, [aggiornaDisponibilita, passo, spettacoloId])

  /* ── Preventivo ──────────────────────────────────────────────────────── */
  const corpoOrdine = useMemo(
    () => ({
      spettacoloId,
      selezione: selezione.map((posto) => ({
        fila: posto.fila,
        numero: posto.numero,
        tipologiaId:
          tipologiePerPosto[chiavePosto(posto.fila, posto.numero)] ?? tipologiaPredefinita,
      })),
      food: Object.entries(quantitaFood)
        .filter(([, quantita]) => quantita > 0)
        .map(([prodottoId, quantita]) => ({ prodottoId, quantita })),
      promoCodice,
      giftCardCodice,
      puntiDaUsare,
    }),
    [
      giftCardCodice,
      promoCodice,
      puntiDaUsare,
      quantitaFood,
      selezione,
      spettacoloId,
      tipologiaPredefinita,
      tipologiePerPosto,
    ],
  )

  // L'ultimo preventivo chiesto è l'unico che conta: con una rete lenta la
  // risposta di una selezione precedente può arrivare dopo quella attuale e
  // sovrascrivere il totale con un valore già superato.
  const richiestaCorrente = useRef(0)

  useEffect(() => {
    if (selezione.length === 0) {
      setEsitoConto(null)
      return
    }

    const mia = ++richiestaCorrente.current
    setCaricamentoConto(true)

    const attesa = window.setTimeout(async () => {
      try {
        const risposta = await fetch('/api/ordine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(corpoOrdine),
        })

        const dati = await risposta.json()
        if (mia !== richiestaCorrente.current) return

        if (!risposta.ok) {
          setErrore(dati.errore ?? 'Non riusciamo a calcolare il totale.')
          setEsitoConto(null)
          return
        }

        setErrore('')
        setEsitoConto(dati as RispostaConto)
      } catch {
        if (mia === richiestaCorrente.current) setErrore('Connessione non riuscita.')
      } finally {
        if (mia === richiestaCorrente.current) setCaricamentoConto(false)
      }
    }, 280)

    return () => window.clearTimeout(attesa)
  }, [corpoOrdine, selezione.length])

  /* ── Navigazione fra i passi ─────────────────────────────────────────── */
  const passiVisibili = useMemo(
    () =>
      PASSI.filter((voce) => {
        if (voce === 'food') return catalogo.impostazioni.moduli.food && catalogo.food.length > 0
        return true
      }),
    [catalogo.food.length, catalogo.impostazioni.moduli.food],
  )

  const indicePasso = passiVisibili.indexOf(passo)

  const puoAvanzare = useMemo(() => {
    switch (passo) {
      case 'cinema':
        return Boolean(cinemaId)
      case 'film':
        return Boolean(filmId)
      case 'data':
        return Boolean(data)
      case 'orario':
        return Boolean(spettacoloId)
      case 'posti':
        return selezione.length > 0 && !disponibilita?.venditaChiusa
      case 'biglietti':
        return selezione.length > 0
      default:
        return true
    }
  }, [cinemaId, data, disponibilita?.venditaChiusa, filmId, passo, selezione.length, spettacoloId])

  function avanti() {
    const prossimo = passiVisibili[indicePasso + 1]
    if (prossimo) setPasso(prossimo)
  }

  function indietro() {
    const precedente = passiVisibili[indicePasso - 1]
    if (precedente) setPasso(precedente)
  }

  /* ── Scelte a cascata ────────────────────────────────────────────────── */
  const filmDisponibili = useMemo(() => {
    const idFilm = new Set(
      catalogo.spettacoli
        .filter((voce) => !cinemaId || voce.cinemaId === cinemaId)
        .map((voce) => voce.filmId),
    )
    return catalogo.film.filter((voce) => idFilm.has(voce.id))
  }, [catalogo.film, catalogo.spettacoli, cinemaId])

  const dateDisponibili = useMemo(() => {
    const giorni = new Set(
      catalogo.spettacoli
        .filter(
          (voce) =>
            (!cinemaId || voce.cinemaId === cinemaId) && (!filmId || voce.filmId === filmId),
        )
        .map((voce) => voce.data),
    )
    return [...giorni].sort()
  }, [catalogo.spettacoli, cinemaId, filmId])

  const orariDisponibili = useMemo(
    () =>
      catalogo.spettacoli
        .filter(
          (voce) =>
            (!cinemaId || voce.cinemaId === cinemaId) &&
            (!filmId || voce.filmId === filmId) &&
            (!data || voce.data === data),
        )
        .sort((a, b) => a.ora.localeCompare(b.ora)),
    [catalogo.spettacoli, cinemaId, data, filmId],
  )

  /* ── Conferma dell'ordine ────────────────────────────────────────────── */
  async function concludi(metodo: string) {
    setInvio(true)
    setErrore('')

    try {
      const risposta = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...corpoOrdine, ospite }),
      })

      const dati = await risposta.json()

      if (!risposta.ok) {
        setErrore(dati.errore ?? 'Non è stato possibile completare la prenotazione.')
        // Un posto occupato nel frattempo è il caso più frequente: si rilegge
        // la mappa e si riporta l'utente lì, invece di lasciarlo davanti a un
        // errore che non sa come risolvere.
        if (risposta.status === 409) {
          await aggiornaDisponibilita()
          setSelezione([])
          setPasso('posti')
        }
        return
      }

      if (!dati.daPagare) {
        router.push(`/biglietto/${dati.codice}`)
        return
      }

      const pagamento = await fetch('/api/pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codice: dati.codice, metodo }),
      })

      const esitoPagamento = await pagamento.json()

      if (!pagamento.ok || !esitoPagamento.url) {
        // La prenotazione esiste già: si manda comunque al biglietto, dove è
        // scritto come pagare in cassa. Perdere l'ordine sarebbe peggio.
        mostra(
          esitoPagamento.errore ?? 'Pagamento online non disponibile: puoi pagare in cassa.',
          'errore',
        )
        router.push(`/biglietto/${dati.codice}`)
        return
      }

      window.location.href = esitoPagamento.url
    } catch {
      setErrore('Connessione non riuscita. Il tuo ordine non è stato inviato: riprova.')
    } finally {
      setInvio(false)
    }
  }

  /* ── Resa ────────────────────────────────────────────────────────────── */
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem] lg:items-start">
      <div>
        {/* Percorso a passi */}
        <ol className="senza-barra mb-8 flex gap-1 overflow-x-auto" aria-label="Passi dell’acquisto">
          {passiVisibili.map((voce, indice) => {
            const fatto = indice < indicePasso
            const corrente = voce === passo

            return (
              <li key={voce} className="flex shrink-0 items-center">
                <button
                  type="button"
                  // Si può tornare indietro liberamente, ma non saltare avanti
                  // a un passo per cui mancano ancora le scelte precedenti.
                  disabled={indice > indicePasso}
                  onClick={() => setPasso(voce)}
                  aria-current={corrente ? 'step' : undefined}
                  className={classi(
                    'flex items-center gap-2 rounded-tenue px-3 py-2 text-[0.8rem] font-medium transition-colors',
                    corrente && 'bg-accento text-white',
                    fatto && 'text-accento hover:bg-accento/10',
                    !corrente && !fatto && 'text-tenue',
                    indice > indicePasso && 'cursor-default opacity-50',
                  )}
                >
                  <span
                    className={classi(
                      'inline-flex size-5 items-center justify-center rounded-full text-[0.68rem]',
                      corrente ? 'bg-white/25' : fatto ? 'bg-accento/15' : 'bg-superficie-alt',
                    )}
                  >
                    {fatto ? <Icona nome="spunta" className="size-3" spessore={3} /> : indice + 1}
                  </span>
                  {NOMI_PASSO[voce]}
                </button>

                {indice < passiVisibili.length - 1 && (
                  <span className="mx-0.5 text-tenue/40" aria-hidden>
                    ·
                  </span>
                )}
              </li>
            )
          })}
        </ol>

        {annullato && (
          <Nota tono="ambra" className="mb-6" icona={<Icona nome="info" className="size-4" />}>
            Il pagamento è stato annullato e i posti sono tornati liberi. Puoi rifare la scelta da
            qui.
          </Nota>
        )}

        {errore && (
          <Nota tono="rosso" className="mb-6" icona={<Icona nome="avviso" className="size-4" />}>
            {errore}
          </Nota>
        )}

        {/* ── 1. Cinema ───────────────────────────────────────────────── */}
        {passo === 'cinema' && (
          <section>
            <h2 className="font-titolo text-[1.4rem] font-semibold">In quale cinema?</h2>
            <p className="mt-1.5 text-[0.9rem] text-tenue">
              Scegli la sala: i film e gli orari si aggiornano di conseguenza.
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {catalogo.cinema.map((voce) => (
                <button
                  key={voce.id}
                  type="button"
                  onClick={() => {
                    setCinemaId(voce.id)
                    setFilmId('')
                    setData('')
                    setSpettacoloId('')
                    setPasso('film')
                  }}
                  className={classi(
                    'rounded-morbido border p-5 text-left transition-all duration-300',
                    cinemaId === voce.id
                      ? 'border-accento bg-accento/8'
                      : 'border-bordo bg-superficie hover:border-accento/50',
                  )}
                >
                  <span className="block font-titolo text-[1.05rem] font-semibold">{voce.nome}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[0.84rem] text-tenue">
                    <Icona nome="posizione" className="size-3.5" />
                    {voce.citta}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 2. Film ─────────────────────────────────────────────────── */}
        {passo === 'film' && (
          <section>
            <h2 className="font-titolo text-[1.4rem] font-semibold">Quale film?</h2>
            <p className="mt-1.5 text-[0.9rem] text-tenue">
              {filmDisponibili.length} titoli in programmazione{cinema ? ` a ${cinema.nome}` : ''}.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {filmDisponibili.map((voce) => (
                <button
                  key={voce.id}
                  type="button"
                  onClick={() => {
                    setFilmId(voce.id)
                    setData('')
                    setSpettacoloId('')
                    setPasso('data')
                  }}
                  className={classi(
                    'group overflow-hidden rounded-morbido border text-left transition-all duration-300',
                    filmId === voce.id
                      ? 'border-accento shadow-accento'
                      : 'border-bordo hover:border-accento/50',
                  )}
                >
                  <span className="locandina block w-full overflow-hidden">
                    <Locandina
                      titolo={voce.titolo}
                      chiave={voce.id}
                      palette={voce.palette}
                      immagine={voce.locandina}
                    />
                  </span>
                  <span className="block p-3">
                    <span className="block text-[0.88rem] font-semibold leading-tight">
                      {voce.titolo}
                    </span>
                    <span className="mt-1 block text-[0.74rem] text-tenue">
                      {durata(voce.durataMinuti)} · {voce.classificazione}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 3. Data ─────────────────────────────────────────────────── */}
        {passo === 'data' && (
          <section>
            <h2 className="font-titolo text-[1.4rem] font-semibold">Quando?</h2>
            <p className="mt-1.5 text-[0.9rem] text-tenue">
              {film ? `«${film.titolo}»` : 'Il film'} è in programma in questi giorni.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {dateDisponibili.map((giorno) => (
                <button
                  key={giorno}
                  type="button"
                  onClick={() => {
                    setData(giorno)
                    setSpettacoloId('')
                    setPasso('orario')
                  }}
                  className={classi(
                    'flex min-w-[6rem] flex-col items-center gap-0.5 rounded-tenue border px-4 py-3 transition-all duration-300',
                    data === giorno
                      ? 'border-accento bg-accento text-white'
                      : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
                  )}
                >
                  <span className="text-[0.8rem] font-semibold">{etichettaGiorno(giorno)}</span>
                  <span className="tabellare text-[0.72rem] opacity-80">{dataBreve(giorno)}</span>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* ── 4. Orario ───────────────────────────────────────────────── */}
        {passo === 'orario' && (
          <section>
            <h2 className="font-titolo text-[1.4rem] font-semibold">A che ora?</h2>
            <p className="mt-1.5 text-[0.9rem] text-tenue">
              Gli spettacoli già iniziati o troppo vicini non sono acquistabili online.
            </p>

            <div className="mt-6 flex flex-wrap gap-2.5">
              {orariDisponibili.map((voce) => {
                const mancanti = minutiAllInizio(voce.data, voce.ora)
                const chiuso = mancanti < catalogo.impostazioni.chiusuraVenditaMinuti

                return (
                  <button
                    key={voce.id}
                    type="button"
                    disabled={chiuso}
                    onClick={() => {
                      setSpettacoloId(voce.id)
                      setCinemaId(voce.cinemaId)
                      setFilmId(voce.filmId)
                      setPasso('posti')
                    }}
                    className={classi(
                      'flex min-w-[7rem] flex-col gap-1 rounded-tenue border px-4 py-3 text-left transition-all duration-300',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      spettacoloId === voce.id
                        ? 'border-accento bg-accento text-white'
                        : 'border-bordo bg-superficie hover:border-accento',
                    )}
                  >
                    <span className="tabellare font-titolo text-[1.1rem] font-semibold">
                      {voce.ora}
                    </span>
                    <span className="text-[0.72rem] opacity-80">
                      {voce.formato}
                      {voce.lingua === 'VO' && ' · VO'}
                    </span>
                    <span className="tabellare text-[0.72rem] opacity-70">
                      da {prezzo(voce.prezzoBase)}
                    </span>
                  </button>
                )
              })}
            </div>

            {orariDisponibili.length === 0 && (
              <Nota className="mt-6" icona={<Icona nome="info" className="size-4" />}>
                Nessuno spettacolo acquistabile per questa combinazione.
              </Nota>
            )}
          </section>
        )}

        {/* ── 5. Posti ────────────────────────────────────────────────── */}
        {passo === 'posti' && (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-titolo text-[1.4rem] font-semibold">Scegli i posti</h2>
                {disponibilita?.sala && (
                  <p className="mt-1.5 text-[0.9rem] text-tenue">
                    {disponibilita.sala.nome} · {disponibilita.liberi} posti liberi su{' '}
                    {disponibilita.totale}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => void aggiornaDisponibilita()}
                className="inline-flex items-center gap-1.5 rounded-tenue border border-bordo px-3.5 py-2 text-[0.78rem] text-tenue transition-colors hover:border-accento hover:text-accento"
              >
                <Icona nome="aggiorna" className="size-3.5" />
                Aggiorna
              </button>
            </div>

            {disponibilita?.venditaChiusa && (
              <Nota tono="ambra" className="mt-5" icona={<Icona nome="orologio" className="size-4" />}>
                La vendita online per questo spettacolo è chiusa. I posti rimasti sono acquistabili
                alla cassa del cinema.
              </Nota>
            )}

            <div className="mt-6">
              {!disponibilita || caricamentoMappa ? (
                <div className="space-y-2">
                  <Scheletro className="h-6 w-40" />
                  <Scheletro className="h-72 w-full rounded-morbido" />
                </div>
              ) : disponibilita.sala ? (
                <MappaPosti
                  schema={disponibilita.sala.schema}
                  occupati={disponibilita.occupati}
                  selezionati={selezione}
                  onCambia={setSelezione}
                  massimo={catalogo.impostazioni.postiMassimiPerOrdine}
                  supplementi={catalogo.impostazioni.supplementiPosto}
                />
              ) : (
                <Nota tono="rosso" icona={<Icona nome="avviso" className="size-4" />}>
                  La pianta di questa sala non è configurata. Contatta il cinema per acquistare.
                </Nota>
              )}
            </div>
          </section>
        )}

        {/* ── 6. Biglietti ────────────────────────────────────────────── */}
        {passo === 'biglietti' && (
          <SceltaBiglietti
            posti={selezione}
            tipologie={catalogo.tipologie}
            scelte={tipologiePerPosto}
            predefinita={tipologiaPredefinita}
            onCambia={setTipologiePerPosto}
          />
        )}

        {/* ── 7. Food ─────────────────────────────────────────────────── */}
        {passo === 'food' && (
          <SceltaFood
            prodotti={catalogo.food}
            cinemaId={spettacolo?.cinemaId ?? cinemaId}
            quantita={quantitaFood}
            onCambia={setQuantitaFood}
          />
        )}

        {/* ── 8. Pagamento ────────────────────────────────────────────── */}
        {passo === 'pagamento' && (
          <Pagamento
            catalogo={catalogo}
            ospite={ospite}
            onOspite={setOspite}
            promoCodice={promoCodice}
            onPromoCodice={setPromoCodice}
            giftCardCodice={giftCardCodice}
            onGiftCardCodice={setGiftCardCodice}
            puntiDaUsare={puntiDaUsare}
            onPuntiDaUsare={setPuntiDaUsare}
            esito={esitoConto}
            invio={invio}
            onConcludi={concludi}
          />
        )}

        {/* ── Navigazione ─────────────────────────────────────────────── */}
        {passo !== 'pagamento' && (
          <div className="mt-9 flex items-center justify-between gap-4">
            <Bottone
              variante="contorno"
              onClick={indietro}
              disabled={indicePasso === 0}
              className={indicePasso === 0 ? 'invisible' : ''}
            >
              <Icona nome="frecciaIndietro" className="size-4" />
              Indietro
            </Bottone>

            <Bottone onClick={avanti} disabled={!puoAvanzare} misura="grande">
              {passo === 'food' ? 'Vai al pagamento' : 'Continua'}
              <Icona nome="freccia" className="size-4" />
            </Bottone>
          </div>
        )}
      </div>

      <Riepilogo
        esito={esitoConto}
        caricamento={caricamentoConto}
        film={film}
        cinema={cinema}
        spettacolo={spettacolo}
        salaNome={disponibilita?.sala?.nome ?? ''}
        posti={selezione}
        className="lg:sticky lg:top-24"
      />
    </div>
  )
}
