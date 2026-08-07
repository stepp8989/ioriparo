'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AutoFrontale } from '@/componenti/home/AutoFrontale'
import { creaMotore, type Motore } from '@/componenti/home/motore'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA } from '@/dati/azienda'
import { classi } from '@/lib/utili'

/**
 * Ingresso cinematografico della home.
 *
 * Lo schermo parte buio. In fondo compare un'auto sportiva che si avvicina
 * mentre il motore sale di giri; arrivata davanti si accendono prima gli
 * anabbaglianti, un secondo dopo gli abbaglianti, e la luce riempie lo schermo.
 * Da lì emerge il pulsante ENTRA: al clic l'auto esce di lato e il sito si
 * apre dietro una lama di luce.
 *
 * Tre vincoli hanno guidato il modo in cui è scritto.
 *
 * La prima visita non deve essere un pedaggio. L'introduzione si vede una volta
 * per sessione: il passaggio è segnato in `sessionStorage`, e uno script che
 * gira prima del primo disegno decide se la tenda esiste. Chi torna in home dal
 * catalogo non rivede niente, nemmeno un lampo nero.
 *
 * Si deve poter uscire subito. C'è un pulsante per saltare, il tasto Esc fa lo
 * stesso, e chi ha chiesto meno animazioni al sistema operativo trova ENTRA già
 * pronto senza aspettare nulla.
 *
 * L'audio non parte a sorpresa. I browser tengono muto tutto finché non c'è un
 * gesto dell'utente, ed è giusto così: qui il motore prova a partire, e se il
 * browser dice di no compare un pulsante per accenderlo, invece di insistere.
 */

/** Segna che l'introduzione è già stata vista in questa sessione. */
const CHIAVE = 'aurora:ingresso'

/**
 * Script eseguito prima del primo disegno della pagina.
 *
 * Deve stare in linea nell'HTML e non dentro un `useEffect`: React entra in
 * scena dopo il primo fotogramma, e per quel fotogramma la tenda sarebbe già
 * comparsa a chi l'ha appena chiusa. Scrivendo l'attributo qui, il foglio di
 * stile sa dal primo istante se mostrarla.
 */
export const SCRIPT_INGRESSO = `(function(){var r=document.documentElement;var v='attivo';try{if(sessionStorage.getItem('${CHIAVE}'))v='fatto'}catch(e){}r.setAttribute('data-ingresso',v)})()`

type Fase = 'lontano' | 'avvicina' | 'anabbaglianti' | 'abbaglianti' | 'invito' | 'uscita'

/**
 * Copione, in millisecondi dall'apertura.
 * L'avvicinamento dura 2,7 s; gli anabbaglianti si accendono quando l'auto è
 * arrivata, gli abbaglianti un secondo dopo — come chiesto — e ENTRA compare
 * mentre il lampo si sta spegnendo.
 */
const COPIONE: ReadonlyArray<{ fase: Fase; ritardo: number }> = [
  { fase: 'avvicina', ritardo: 200 },
  { fase: 'anabbaglianti', ritardo: 2700 },
  { fase: 'abbaglianti', ritardo: 3700 },
  { fase: 'invito', ritardo: 4500 },
]

/** Quanta luce emettono i fari in ciascuna fase: 0 spenti, 1 anabbaglianti, 2 abbaglianti. */
const LUCE: Record<Fase, 0 | 1 | 2> = {
  lontano: 0,
  avvicina: 0,
  anabbaglianti: 1,
  abbaglianti: 2,
  invito: 2,
  uscita: 2,
}

export function Ingresso() {
  const [montato, setMontato] = useState(true)
  const [fase, setFase] = useState<Fase>('lontano')
  const [audioMuto, setAudioMuto] = useState(false)

  const motore = useRef<Motore | null>(null)
  const tenda = useRef<HTMLDivElement>(null)
  const pulsanteEntra = useRef<HTMLButtonElement>(null)
  const uscito = useRef(false)

  /** Chiude la tenda e apre il sito. Idempotente: Esc e clic possono arrivare insieme. */
  const entra = useCallback(() => {
    if (uscito.current) return
    uscito.current = true

    try {
      sessionStorage.setItem(CHIAVE, '1')
    } catch {
      // Navigazione privata con archiviazione negata: l'introduzione si
      // rivedrà, ma non è una ragione per fermare l'uscita.
    }

    motore.current?.spegni()
    setFase('uscita')
    document.documentElement.setAttribute('data-ingresso', 'uscita')

    window.setTimeout(() => {
      document.documentElement.removeAttribute('data-ingresso')
      setMontato(false)
      // Chi naviga da tastiera deve ritrovarsi all'inizio del contenuto, non
      // su un pulsante che nel frattempo è sparito dalla pagina.
      document.getElementById('contenuto')?.focus()
    }, 1400)
  }, [])

  /* Avvio: decide se la tenda va mostrata e fa partire il copione. */
  useEffect(() => {
    if (document.documentElement.getAttribute('data-ingresso') !== 'attivo') {
      setMontato(false)
      return
    }

    // Meno animazioni: niente avvicinamento, niente motore. L'auto è già
    // arrivata con i fari accesi e ENTRA è subito lì.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFase('invito')
      return
    }

    const suono = creaMotore()
    motore.current = suono

    if (suono) {
      void suono.avvia().then((partito) => {
        if (!partito) {
          setAudioMuto(true)
          return
        }
        // Sale di giri per tutta la durata dell'avvicinamento.
        suono.accelera(2.9)
      })
    }

    const attese = COPIONE.map(({ fase: prossima, ritardo }) =>
      window.setTimeout(() => setFase(prossima), ritardo),
    )

    return () => {
      attese.forEach(window.clearTimeout)
      motore.current?.spegni()
    }
  }, [])

  /* Colpo di gas sull'accensione degli abbaglianti. */
  useEffect(() => {
    if (fase === 'abbaglianti') motore.current?.sgassata()
  }, [fase])

  /* Il pulsante ENTRA prende il fuoco appena compare. */
  useEffect(() => {
    if (fase === 'invito') pulsanteEntra.current?.focus()
  }, [fase])

  /* Esc esce, e il tabulatore resta dentro la tenda: sotto c'è un sito intero
     che per ora non deve essere raggiungibile. */
  useEffect(() => {
    if (!montato) return

    function tasti(evento: KeyboardEvent) {
      if (evento.key === 'Escape') {
        evento.preventDefault()
        entra()
        return
      }

      if (evento.key !== 'Tab' || !tenda.current) return

      const raggiungibili = tenda.current.querySelectorAll<HTMLElement>('button:not([disabled])')
      if (raggiungibili.length === 0) return

      const primo = raggiungibili[0]
      const ultimo = raggiungibili[raggiungibili.length - 1]
      const attivo = document.activeElement

      if (evento.shiftKey && (attivo === primo || !tenda.current.contains(attivo))) {
        evento.preventDefault()
        ultimo.focus()
      } else if (!evento.shiftKey && attivo === ultimo) {
        evento.preventDefault()
        primo.focus()
      }
    }

    document.addEventListener('keydown', tasti)
    return () => document.removeEventListener('keydown', tasti)
  }, [montato, entra])

  async function accendiAudio() {
    const suono = motore.current
    if (!suono) return

    const partito = await suono.avvia()
    if (!partito) return

    setAudioMuto(false)
    suono.accelera(fase === 'lontano' || fase === 'avvicina' ? 2 : 0.6)
  }

  if (!montato) return null

  return (
    <div
      ref={tenda}
      className="ingresso fixed inset-0 z-[200] items-center justify-center overflow-hidden bg-notte"
      data-luce={LUCE[fase]}
      data-fase={fase}
      role="dialog"
      aria-modal="true"
      aria-label="Ingresso al sito"
    >
      {/* ── Fondale ── */}
      <div aria-hidden className="absolute inset-0">
        {/* Asfalto: una velatura che sale dal basso e chiude la scena. */}
        <div className="absolute inset-x-0 bottom-0 h-[42vh] bg-gradient-to-t from-[#0a0f1a] to-transparent" />
        <div className="griglia-tecnica absolute inset-0 opacity-40" />
        {/* Punto di fuga: l'unico chiarore prima che l'auto arrivi. */}
        <div className="absolute top-1/2 left-1/2 size-[46vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#12203c] opacity-70 blur-[90px]" />
        {/* Vignettatura: tiene l'occhio al centro. */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#05070b_92%)]" />
      </div>

      {/* ── L'auto ── */}
      <div aria-hidden className="ingresso-sospensione relative z-10 flex w-full justify-center">
        <div className={classi('ingresso-auto relative', fase !== 'lontano' && 'avvicina')}>
          <AutoFrontale className="h-auto w-full" />

          {/* Fasci puntati verso chi guarda e riflesso allungato sull'obiettivo. */}
          <div className="ingresso-fascio left-[30.4%]" />
          <div className="ingresso-fascio left-[69.6%]" />
          <div className="ingresso-riga" />
        </div>
      </div>

      {/* ── Il lampo degli abbaglianti ──
          Compare solo quando serve: montarlo dopo garantisce che l'animazione
          parta esattamente all'accensione e non un istante prima. */}
      {LUCE[fase] === 2 && (
        <>
          <div
            aria-hidden
            className="ingresso-lampo pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,#ffffff_0%,#dbe9ff_28%,#4d8dff_58%,transparent_86%)]"
          />
          {/* Foschia che resta nell'aria dopo il lampo. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(ellipse_at_center,rgba(134,179,255,0.16),transparent_65%)]"
          />
        </>
      )}

      {/* ── ENTRA ── */}
      {(fase === 'invito' || fase === 'uscita') && (
        <div className="ingresso-invito absolute inset-x-0 bottom-[7vh] z-30 flex flex-col items-center gap-7 px-6 text-center">
          {/* Alone allungato come il pulsante: un alone tondo dietro una pastiglia
              larga si legge come un anello, non come luce. */}
          <div
            aria-hidden
            className="absolute -z-10 h-[20vmin] w-[54vmin] rounded-full bg-accento opacity-30 blur-[70px]"
          />

          <button
            ref={pulsanteEntra}
            type="button"
            onClick={entra}
            className="group relative overflow-hidden rounded-full border border-white/25 bg-white/10 px-14 py-6 font-titolo text-[1.35rem] font-semibold tracking-[0.42em] text-white uppercase shadow-[0_20px_70px_-20px_rgba(77,141,255,0.9)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:border-white/55 hover:bg-white/20 sm:px-20 sm:py-7 sm:text-[1.7rem]"
            style={{ textIndent: '0.42em' }}
          >
            <span className="relative z-10">Entra</span>
            {/* Riflesso che scorre sul vetro. */}
            <span
              aria-hidden
              className="ingresso-riflesso absolute inset-y-0 -left-1/3 z-0 w-1/3 bg-gradient-to-r from-transparent via-white/45 to-transparent"
            />
            {/* Filo di luce sul bordo alto: il taglio che rende il vetro spesso. */}
            <span
              aria-hidden
              className="absolute inset-x-8 top-0 z-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
            />
          </button>

          <p className="text-[0.68rem] tracking-[0.32em] text-white/45 uppercase">
            {AZIENDA.nome} · {AZIENDA.indirizzo.citta}
          </p>
        </div>
      )}

      {/* ── Comandi di servizio ── */}
      {fase !== 'invito' && fase !== 'uscita' && (
        <button
          type="button"
          onClick={entra}
          className="absolute top-6 right-6 z-40 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-[0.7rem] tracking-[0.18em] text-white/60 uppercase backdrop-blur-md transition-colors hover:border-white/40 hover:text-white sm:top-8 sm:right-8"
        >
          Salta
          <Icona nome="freccia" className="size-3.5" />
        </button>
      )}

      {audioMuto && (
        <button
          type="button"
          onClick={accendiAudio}
          className="absolute bottom-6 left-6 z-40 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-[0.7rem] tracking-[0.16em] text-white/70 uppercase backdrop-blur-md transition-colors hover:border-white/40 hover:text-white sm:bottom-8 sm:left-8"
        >
          <Icona nome="audioMuto" className="size-4" />
          Attiva audio
        </button>
      )}

      {/* Lama di luce che apre il sito. */}
      {fase === 'uscita' && (
        <div
          aria-hidden
          className="ingresso-sipario pointer-events-none absolute inset-0 z-50 bg-[linear-gradient(to_bottom,transparent,#ffffff_45%,#dbe9ff_55%,transparent)]"
        />
      )}
    </div>
  )
}
