'use client'

import { useMemo, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi, oggiIso } from '@/lib/utili'

/**
 * Calendario di disponibilità.
 *
 * Mostra un mese alla volta, segna i giorni già impegnati e fa scegliere il
 * periodo con due tocchi: il primo fissa il ritiro, il secondo la riconsegna.
 * Un terzo tocco ricomincia.
 *
 * I giorni occupati arrivano dal server come elenco di date `AAAA-MM-GG`: è la
 * forma più semplice da confrontare, non risente dei fusi orari e si presta al
 * confronto lessicografico, che qui è anche il confronto cronologico.
 */

const GIORNI = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

const MESI = [
  'Gennaio',
  'Febbraio',
  'Marzo',
  'Aprile',
  'Maggio',
  'Giugno',
  'Luglio',
  'Agosto',
  'Settembre',
  'Ottobre',
  'Novembre',
  'Dicembre',
]

/** Data locale in formato `AAAA-MM-GG`, senza passare per UTC. */
function iso(anno: number, mese: number, giorno: number): string {
  return `${anno}-${String(mese + 1).padStart(2, '0')}-${String(giorno).padStart(2, '0')}`
}

export function Calendario({
  occupati,
  dal,
  al,
  onCambia,
}: {
  /** Date già impegnate, in formato `AAAA-MM-GG`. */
  occupati: string[]
  dal: string
  al: string
  onCambia: (dal: string, al: string) => void
}) {
  const oggi = oggiIso()
  const [mostrato, setMostrato] = useState(() => {
    const partenza = dal ? new Date(`${dal}T12:00:00`) : new Date()
    return { anno: partenza.getFullYear(), mese: partenza.getMonth() }
  })

  const impegnati = useMemo(() => new Set(occupati), [occupati])

  const celle = useMemo(() => {
    const { anno, mese } = mostrato
    const primo = new Date(anno, mese, 1)
    // `getDay()` conta da domenica: qui la settimana comincia di lunedì.
    const scarto = (primo.getDay() + 6) % 7
    const giorniNelMese = new Date(anno, mese + 1, 0).getDate()

    return [
      ...Array.from({ length: scarto }, () => null),
      ...Array.from({ length: giorniNelMese }, (_, indice) => indice + 1),
    ]
  }, [mostrato])

  function sposta(passo: number) {
    setMostrato((precedente) => {
      const data = new Date(precedente.anno, precedente.mese + passo, 1)
      return { anno: data.getFullYear(), mese: data.getMonth() }
    })
  }

  /**
   * Un periodo è valido solo se nessun giorno al suo interno è impegnato:
   * scegliere «dal 3 al 10» quando il 6 è occupato significherebbe promettere
   * un veicolo che non c'è.
   */
  function periodoLibero(inizio: string, fine: string): boolean {
    const corrente = new Date(`${inizio}T12:00:00`)
    const ultimo = new Date(`${fine}T12:00:00`)

    while (corrente <= ultimo) {
      const giorno = iso(corrente.getFullYear(), corrente.getMonth(), corrente.getDate())
      if (impegnati.has(giorno)) return false
      corrente.setDate(corrente.getDate() + 1)
    }
    return true
  }

  function scegli(giorno: string) {
    // Nessuna data, oppure periodo già completo: si ricomincia dal ritiro.
    if (!dal || (dal && al)) {
      onCambia(giorno, '')
      return
    }

    // Data anteriore al ritiro: diventa il nuovo ritiro.
    if (giorno < dal) {
      onCambia(giorno, '')
      return
    }

    if (!periodoLibero(dal, giorno)) {
      // Nel mezzo c'è un giorno occupato: si riparte da quello scelto ora.
      onCambia(giorno, '')
      return
    }

    onCambia(dal, giorno)
  }

  const { anno, mese } = mostrato
  const meseCorrente = `${anno}-${String(mese + 1).padStart(2, '0')}`
  const indietroPossibile = meseCorrente > oggi.slice(0, 7)

  return (
    <div className="rounded-morbido border border-bordo bg-superficie p-5">
      <div className="mb-5 flex items-center justify-between">
        <button
          type="button"
          onClick={() => sposta(-1)}
          disabled={!indietroPossibile}
          className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento disabled:opacity-30"
          aria-label="Mese precedente"
        >
          <Icona nome="chevronSinistra" className="size-4" />
        </button>

        <p className="font-titolo text-[1.05rem] font-semibold" aria-live="polite">
          {MESI[mese]} {anno}
        </p>

        <button
          type="button"
          onClick={() => sposta(1)}
          className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
          aria-label="Mese successivo"
        >
          <Icona nome="chevronDestra" className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {GIORNI.map((giorno) => (
          <span key={giorno} className="pb-2 text-[0.68rem] tracking-[0.1em] text-tenue uppercase">
            {giorno}
          </span>
        ))}

        {celle.map((giorno, indice) => {
          if (giorno === null) return <span key={`vuoto-${indice}`} />

          const data = iso(anno, mese, giorno)
          const passato = data < oggi
          const occupato = impegnati.has(data)
          const inizio = data === dal
          const fine = data === al
          const dentro = Boolean(dal && al && data > dal && data < al)

          return (
            <button
              key={data}
              type="button"
              disabled={passato || occupato}
              onClick={() => scegli(data)}
              aria-label={`${giorno} ${MESI[mese]}${occupato ? ' — non disponibile' : ''}`}
              aria-pressed={inizio || fine || dentro}
              className={classi(
                'relative aspect-square rounded-lg text-[0.85rem] font-medium transition-colors duration-200 tabellare',
                (passato || occupato) && 'cursor-not-allowed text-tenue/35',
                occupato && 'line-through',
                !passato && !occupato && !inizio && !fine && !dentro && 'hover:bg-superficie-alt',
                dentro && 'bg-accento/15 text-accento',
                (inizio || fine) && 'bg-accento text-white',
              )}
            >
              {giorno}
            </button>
          )
        })}
      </div>

      <p className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-bordo pt-4 text-[0.75rem] text-tenue">
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-accento" aria-hidden />
          Periodo scelto
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="size-3 rounded bg-bordo-forte" aria-hidden />
          Già impegnato
        </span>
      </p>
    </div>
  )
}
