'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import { lasciaPostoIsolato, suggerisciPosti } from '@/lib/posti'
import type { SchemaSala, TipoPosto } from '@/lib/tipi'
import { chiavePosto, classi, elencoPosti, etichettaPosto } from '@/lib/utili'

/**
 * Mappa della sala.
 *
 * Tre cose la rendono più laboriosa di una semplice griglia di pulsanti, e
 * tutte e tre sono necessarie:
 *
 *   — **Zoom e trascinamento.** Una sala IMAX ha diciotto file da ventisei
 *     posti: su un telefono, alla dimensione a cui ci sta tutta, ogni poltrona
 *     sarebbe un quadratino da otto pixel. La mappa parte adattata alla
 *     larghezza e si ingrandisce con i pulsanti, con la rotella o con due dita.
 *
 *   — **Navigazione da tastiera.** Le frecce si muovono fra le poltrone
 *     saltando i corridoi, Invio seleziona. Senza, la scelta del posto sarebbe
 *     l'unico passo dell'acquisto impossibile da completare senza puntatore —
 *     e sarebbe proprio quello che tiene fuori chi ne ha più bisogno.
 *
 *   — **Stati leggibili senza colore.** Occupato, selezionato, premium e
 *     riservato si distinguono per forma e simbolo oltre che per tinta. Un
 *     daltonismo sul rosso-verde è comune quanto basta perché affidarsi al solo
 *     colore renda la mappa inservibile a una persona su dodici.
 */

export type PostoScelto = { fila: string; numero: number; tipoPosto: TipoPosto }

type Props = {
  schema: SchemaSala
  /** Chiavi `fila-numero` dei posti già venduti. */
  occupati: string[]
  selezionati: PostoScelto[]
  onCambia: (posti: PostoScelto[]) => void
  massimo: number
  /** Supplementi per tipo di poltrona, per la legenda. */
  supplementi: Record<string, number>
}

const ETICHETTE: Record<TipoPosto, string> = {
  standard: 'Standard',
  premium: 'Premium',
  disabili: 'Riservato',
  accompagnatore: 'Accompagnatore',
  vuoto: '',
}

export function MappaPosti({
  schema,
  occupati,
  selezionati,
  onCambia,
  massimo,
  supplementi,
}: Props) {
  const [zoom, setZoom] = useState(1)
  const [fuoco, setFuoco] = useState<{ fila: number; posto: number } | null>(null)
  const pista = useRef<HTMLDivElement>(null)

  const insiemeOccupati = useMemo(() => new Set(occupati), [occupati])
  const insiemeSelezionati = useMemo(
    () => new Set(selezionati.map((posto) => chiavePosto(posto.fila, posto.numero))),
    [selezionati],
  )

  const pieno = selezionati.length >= massimo

  const alterna = useCallback(
    (fila: string, numero: number, tipo: TipoPosto) => {
      const chiave = chiavePosto(fila, numero)
      if (insiemeOccupati.has(chiave)) return

      if (insiemeSelezionati.has(chiave)) {
        onCambia(
          selezionati.filter((posto) => chiavePosto(posto.fila, posto.numero) !== chiave),
        )
        return
      }

      if (pieno) return
      onCambia([...selezionati, { fila, numero, tipoPosto: tipo }])
    },
    [insiemeOccupati, insiemeSelezionati, onCambia, pieno, selezionati],
  )

  /* ── Navigazione da tastiera ──────────────────────────────────────────── */
  const muovi = useCallback(
    (evento: React.KeyboardEvent, indiceFila: number, indicePosto: number) => {
      const direzioni: Record<string, [number, number]> = {
        ArrowUp: [-1, 0],
        ArrowDown: [1, 0],
        ArrowLeft: [0, -1],
        ArrowRight: [0, 1],
      }

      const passo = direzioni[evento.key]
      if (!passo) return

      evento.preventDefault()

      let fila = indiceFila
      let posto = indicePosto

      // Si avanza finché non si trova una poltrona vera: i corridoi vengono
      // scavalcati invece di assorbire il fuoco.
      for (let tentativo = 0; tentativo < 200; tentativo += 1) {
        fila += passo[0]
        posto += passo[1]

        if (fila < 0 || fila >= schema.file.length) return
        const riga = schema.file[fila]
        if (posto < 0) posto = riga.posti.length - 1
        if (posto >= riga.posti.length) posto = 0

        if (riga.posti[posto]?.tipo !== 'vuoto') {
          setFuoco({ fila, posto })
          document.getElementById(`posto-${fila}-${posto}`)?.focus()
          return
        }

        // Muovendosi in verticale la colonna resta la stessa: se lì c'è un
        // corridoio si prosegue nella stessa direzione, non di lato.
        if (passo[1] === 0 && riga.posti[posto]?.tipo === 'vuoto') continue
      }
    },
    [schema.file],
  )

  /* ── Zoom con la rotella (solo con Ctrl, come nelle mappe) ────────────── */
  useEffect(() => {
    const elemento = pista.current
    if (!elemento) return

    function rotella(evento: WheelEvent) {
      if (!evento.ctrlKey) return
      evento.preventDefault()
      setZoom((precedente) => Math.min(2.5, Math.max(0.6, precedente - evento.deltaY * 0.002)))
    }

    elemento.addEventListener('wheel', rotella, { passive: false })
    return () => elemento.removeEventListener('wheel', rotella)
  }, [])

  const avvisoIsolato = useMemo(
    () => lasciaPostoIsolato(schema, insiemeOccupati, insiemeSelezionati),
    [schema, insiemeOccupati, insiemeSelezionati],
  )

  function scegliPerMe() {
    const quanti = Math.max(1, selezionati.length || 2)
    const proposta = suggerisciPosti(schema, insiemeOccupati, quanti)

    if (proposta.length === 0) return

    onCambia(
      proposta.map((posto) => {
        const riga = schema.file.find((voce) => voce.etichetta === posto.fila)
        const cella = riga?.posti.find(
          (voce) => voce.tipo !== 'vuoto' && voce.numero === posto.numero,
        )
        return { ...posto, tipoPosto: cella?.tipo ?? 'standard' }
      }),
    )
  }

  const tipiPresenti = useMemo(() => {
    const tipi = new Set<TipoPosto>()
    for (const fila of schema.file) {
      for (const posto of fila.posti) {
        if (posto.tipo !== 'vuoto') tipi.add(posto.tipo)
      }
    }
    return [...tipi]
  }, [schema])

  return (
    <div>
      {/* ── Comandi ─────────────────────────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={scegliPerMe}
          className="inline-flex items-center gap-2 rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.82rem] font-medium text-tenue transition-colors hover:border-accento hover:text-accento"
        >
          <Icona nome="fulmine" className="size-4" />
          Scegli tu i posti migliori
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setZoom((precedente) => Math.max(0.6, precedente - 0.2))}
            disabled={zoom <= 0.6}
            className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento disabled:opacity-35"
            aria-label="Riduci la mappa"
          >
            <Icona nome="meno" className="size-4" />
          </button>
          <span className="tabellare w-12 text-center text-[0.78rem] text-tenue">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((precedente) => Math.min(2.5, precedente + 0.2))}
            disabled={zoom >= 2.5}
            className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento disabled:opacity-35"
            aria-label="Ingrandisci la mappa"
          >
            <Icona nome="piu" className="size-4" />
          </button>
        </div>
      </div>

      {/* ── Schermo ─────────────────────────────────────────────────────── */}
      <div className="mb-6 text-center">
        <div className="mx-auto h-1.5 w-[70%] max-w-lg rounded-full bg-gradient-to-r from-transparent via-accento to-transparent" />
        <p className="mt-2 text-[0.7rem] font-semibold uppercase tracking-[0.3em] text-tenue">
          Schermo
        </p>
      </div>

      {/* ── Griglia ─────────────────────────────────────────────────────── */}
      <div
        ref={pista}
        className="senza-barra overflow-auto overscroll-contain rounded-morbido border border-bordo bg-sfondo-alt p-4"
        role="group"
        aria-label="Mappa della sala: scegli i posti"
      >
        <div
          className="mx-auto flex w-fit flex-col gap-1.5 transition-transform duration-200"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {schema.file.map((fila, indiceFila) => (
            <div key={fila.etichetta}>
              <div className="flex items-center gap-1.5">
                <span className="tabellare w-6 shrink-0 text-center text-[0.68rem] font-semibold text-tenue">
                  {fila.etichetta}
                </span>

                {fila.posti.map((posto, indicePosto) => {
                  if (posto.tipo === 'vuoto') {
                    return <span key={indicePosto} className="w-3 shrink-0" aria-hidden />
                  }

                  const chiave = chiavePosto(fila.etichetta, posto.numero)
                  const occupato = insiemeOccupati.has(chiave)
                  const scelto = insiemeSelezionati.has(chiave)
                  const bloccato = occupato || (pieno && !scelto)

                  return (
                    <button
                      key={indicePosto}
                      id={`posto-${indiceFila}-${indicePosto}`}
                      type="button"
                      disabled={occupato}
                      aria-pressed={scelto}
                      aria-label={`Posto ${etichettaPosto(fila.etichetta, posto.numero)}, ${
                        ETICHETTE[posto.tipo]
                      }${occupato ? ', occupato' : scelto ? ', selezionato' : ', libero'}`}
                      tabIndex={
                        fuoco?.fila === indiceFila && fuoco?.posto === indicePosto
                          ? 0
                          : fuoco === null && indiceFila === 0 && indicePosto === 0
                            ? 0
                            : -1
                      }
                      onFocus={() => setFuoco({ fila: indiceFila, posto: indicePosto })}
                      onKeyDown={(evento) => {
                        if (evento.key === 'Enter' || evento.key === ' ') {
                          evento.preventDefault()
                          alterna(fila.etichetta, posto.numero, posto.tipo)
                          return
                        }
                        muovi(evento, indiceFila, indicePosto)
                      }}
                      onClick={() => alterna(fila.etichetta, posto.numero, posto.tipo)}
                      className={classi(
                        'relative size-6 shrink-0 text-[0.55rem] font-semibold transition-all duration-200',
                        // La forma distingue quanto il colore: gli angoli
                        // arrotondati in alto imitano lo schienale della
                        // poltrona, e il premium è più squadrato.
                        posto.tipo === 'premium' ? 'rounded-t-md rounded-b-sm' : 'rounded-t-lg rounded-b-sm',
                        occupato && 'cursor-not-allowed bg-bordo-forte/50 text-tenue/40',
                        !occupato && scelto && 'bg-accento text-white shadow-accento scale-110',
                        !occupato &&
                          !scelto &&
                          posto.tipo === 'premium' &&
                          'bg-viola/25 text-viola hover:bg-viola/45',
                        !occupato &&
                          !scelto &&
                          (posto.tipo === 'disabili' || posto.tipo === 'accompagnatore') &&
                          'bg-ok/20 text-ok hover:bg-ok/35',
                        !occupato && !scelto && posto.tipo === 'standard' && 'bg-bordo text-tenue hover:bg-bordo-forte',
                        bloccato && !occupato && 'opacity-45',
                      )}
                    >
                      {posto.tipo === 'disabili' ? (
                        <Icona nome="accessibile" className="mx-auto size-3.5" />
                      ) : scelto ? (
                        <Icona nome="spunta" className="mx-auto size-3.5" spessore={3} />
                      ) : occupato ? (
                        <Icona nome="chiudi" className="mx-auto size-2.5" spessore={3} />
                      ) : (
                        posto.numero
                      )}
                    </button>
                  )
                })}

                <span className="tabellare w-6 shrink-0 text-center text-[0.68rem] font-semibold text-tenue">
                  {fila.etichetta}
                </span>
              </div>

              {schema.corridoiOrizzontali.includes(indiceFila + 1) && (
                <div className="h-5" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Legenda ─────────────────────────────────────────────────────── */}
      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2.5 text-[0.78rem] text-tenue">
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-t-lg rounded-b-sm bg-bordo" aria-hidden />
          Libero
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-t-lg rounded-b-sm bg-accento" aria-hidden />
          Selezionato
        </li>
        <li className="flex items-center gap-2">
          <span className="size-4 rounded-t-lg rounded-b-sm bg-bordo-forte/50" aria-hidden />
          Occupato
        </li>
        {tipiPresenti.includes('premium') && (
          <li className="flex items-center gap-2">
            <span className="size-4 rounded-t-md rounded-b-sm bg-viola/25" aria-hidden />
            Premium
            {supplementi.premium > 0 && (
              <span className="tabellare">
                +{supplementi.premium.toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
              </span>
            )}
          </li>
        )}
        {tipiPresenti.includes('disabili') && (
          <li className="flex items-center gap-2">
            <span className="inline-flex size-4 items-center justify-center rounded-t-lg rounded-b-sm bg-ok/20 text-ok" aria-hidden>
              <Icona nome="accessibile" className="size-3" />
            </span>
            Riservato, senza supplemento
          </li>
        )}
      </ul>

      <p className="mt-4 text-[0.78rem] text-tenue">
        Frecce per spostarti fra le poltrone, Invio per scegliere. Con Ctrl e la rotella ingrandisci
        la mappa.
      </p>

      {/* ── Riepilogo della selezione ───────────────────────────────────── */}
      <div className="mt-5" aria-live="polite">
        {selezionati.length === 0 ? (
          <p className="text-[0.9rem] text-tenue">Nessun posto selezionato.</p>
        ) : (
          <p className="text-[0.95rem]">
            <span className="text-tenue">Posti selezionati: </span>
            <span className="font-semibold">{elencoPosti(selezionati)}</span>
            {pieno && (
              <span className="ml-2 text-[0.82rem] text-tenue">
                (massimo {massimo} per ordine)
              </span>
            )}
          </p>
        )}
      </div>

      {avvisoIsolato && (
        <Nota tono="ambra" className="mt-4" icona={<Icona nome="info" className="size-4" />}>
          La tua scelta lascia un posto singolo isolato fra poltrone già occupate. Puoi
          proseguire tranquillamente, ma spostandoti di uno renderesti la fila vendibile a una
          coppia.
        </Nota>
      )}
    </div>
  )
}
