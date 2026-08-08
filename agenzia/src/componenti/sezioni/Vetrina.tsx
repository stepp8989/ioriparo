'use client'

import { useEffect, useRef, useState } from 'react'
import { PROGETTI, type Progetto } from '@/dati/portfolio'
import { useMovimentoRidotto, useScorrimento } from '@/componenti/effetti/ganci'
import { Rivela } from '@/componenti/effetti/Rivela'
import { MockupSito, altezzaMockup } from '@/componenti/ui/MockupSito'
import { Icona } from '@/componenti/ui/Icona'
import { Pulsante } from '@/componenti/ui/Pulsante'
import { cn } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * La vetrina
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Dieci siti dentro dieci schermi. Ogni schermo è una finestra di browser
 * disegnata con bordi e sfumature, e dentro scorre l'anteprima del sito: non
 * un'immagine ferma, ma la pagina che si muove piano mentre si scorre — l'idea
 * è quella di sbirciare un sito vero mentre qualcuno lo naviga.
 *
 * Lo scorrimento della pagina interna è esatto e non stimato: `altezzaMockup`
 * dice quanto è alta l'anteprima, la finestra sa quanto è alta lei, e la
 * differenza è la corsa disponibile. Così nessuna anteprima si ferma a metà né
 * mostra una striscia vuota in fondo.
 *
 * Al passaggio del mouse lo schermo si solleva e si inclina, e il cursore su
 * misura si allarga mostrando «Vedi progetto». Al clic si apre la scheda
 * completa.
 */
export function Vetrina() {
  const [aperto, setAperto] = useState<Progetto | null>(null)

  return (
    <section id="portfolio" className="relative py-28 sm:py-36" aria-labelledby="portfolio-titolo">
      <div className="contenitore">
        <Rivela className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
            Portfolio
          </p>
          <h2
            id="portfolio-titolo"
            className="mt-5 font-titolo text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[1.08]"
          >
            Guarda cosa <span className="testo-neon">posso creare.</span>
          </h2>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-tenue">
            Dieci attività diverse, dieci siti che non si somigliano. Passa sopra uno schermo per
            guardarci dentro, aprilo per vedere com’è fatto.
          </p>
        </Rivela>
      </div>

      {/* I settori, in una striscia che scorre. */}
      <StrisciaSettori />

      <div className="contenitore">
        <div className="grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {PROGETTI.map((progetto, indice) => (
            <SchermoProgetto
              key={progetto.id}
              progetto={progetto}
              indice={indice}
              alClic={() => setAperto(progetto)}
            />
          ))}
        </div>

        <Rivela className="mt-14 text-center">
          <p className="text-[0.95rem] text-tenue">
            Il tuo settore non è nell’elenco?{' '}
            <span className="text-testo">Va benissimo lo stesso.</span>
          </p>
          <div className="mt-6 flex justify-center">
            <Pulsante
              come="a"
              href="#contatti"
              aspetto="contorno"
              coda={<Icona nome="freccia" misura={17} />}
            >
              Raccontami la tua attività
            </Pulsante>
          </div>
        </Rivela>
      </div>

      {aperto ? <SchedaProgetto progetto={aperto} chiudi={() => setAperto(null)} /> : null}
    </section>
  )
}

/* ── La striscia dei settori ───────────────────────────────────────────────── */

/**
 * Le categorie che scorrono senza fine.
 *
 * L'elenco è scritto due volte e la corsa si ferma a metà: quando
 * l'animazione riparte, la seconda copia si trova esattamente dove stava la
 * prima e la giunzione non si vede. La copia in più è nascosta ai lettori di
 * schermo, che altrimenti leggerebbero tutto due volte.
 */
function StrisciaSettori() {
  const ridotto = useMovimentoRidotto()
  const categorie = PROGETTI.map((progetto) => progetto.categoria)

  return (
    <div
      className="relative my-14 overflow-hidden border-y border-bordo/60 py-4"
      style={{
        maskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
        WebkitMaskImage: 'linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)',
      }}
    >
      <div
        className={cn('flex w-max gap-10', !ridotto && 'motion-safe:[animation:scorri-striscia_44s_linear_infinite]')}
      >
        {[0, 1].map((copia) => (
          <ul
            key={copia}
            aria-hidden={copia === 1}
            className="flex shrink-0 items-center gap-10"
          >
            {categorie.map((categoria) => (
              <li
                key={categoria}
                className="flex items-center gap-10 whitespace-nowrap text-[0.95rem] uppercase tracking-[0.18em] text-fioco"
              >
                {categoria}
                <span className="h-1 w-1 rounded-full bg-blu/70" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  )
}

/* ── Uno schermo ───────────────────────────────────────────────────────────── */

function SchermoProgetto({
  progetto,
  indice,
  alClic,
}: {
  progetto: Progetto
  indice: number
  alClic: () => void
}) {
  const carta = useRef<HTMLDivElement>(null)
  const pagina = useRef<HTMLDivElement>(null)

  /* Corsa disponibile dentro la finestra, in percentuale dell'anteprima.
   * La finestra ha proporzione 16:10, cioè è alta 250 unità delle 400 di
   * larghezza dell'anteprima: quello che avanza è ciò che può scorrere. */
  const corsa = Math.max(0, 1 - 250 / altezzaMockup(progetto))

  useScorrimento(carta, ({ passaggio }) => {
    const elemento = pagina.current
    if (!elemento) return
    // Si comincia a scorrere quando la carta è già ben dentro lo schermo.
    const quota = Math.min(Math.max((passaggio - 0.15) / 0.7, 0), 1)
    elemento.style.transform = `translateY(-${(quota * corsa * 100).toFixed(3)}%)`
  })

  return (
    <Rivela tipo="scala" ritardo={(indice % 3) * 110} className="scena">
      <div ref={carta} className="piano group relative h-full">
        <button
          type="button"
          onClick={alClic}
          data-cursore="progetto"
          data-etichetta="Vedi progetto"
          aria-label={`${progetto.nome} — ${progetto.categoria}: apri la scheda del progetto`}
          className="vetro relative block w-full overflow-hidden rounded-ampio p-3 text-left transition-all duration-500 hover:-translate-y-2 hover:border-blu/45 hover:shadow-[0_50px_120px_-60px_rgb(59_130_246/.95)]"
        >
          {/* Lo schermo. */}
          <span className="relative block overflow-hidden rounded-morbido border border-bordo/80 bg-black/40">
            {/* Barra della finestra. */}
            <span className="flex items-center gap-2 border-b border-bordo/70 bg-white/[.03] px-3.5 py-2.5">
              <span className="flex gap-1.5">
                {['bg-white/25', 'bg-white/18', 'bg-white/12'].map((tinta) => (
                  <span key={tinta} className={cn('h-2 w-2 rounded-full', tinta)} />
                ))}
              </span>
              <span className="ml-1.5 flex-1 truncate rounded-full bg-white/[.05] px-3 py-1 text-[10px] text-fioco">
                {`www.${progetto.nome.toLowerCase().replace(/[^a-z0-9]+/g, '')}.it`}
              </span>
            </span>

            {/* La pagina che scorre dentro la finestra. */}
            <span className="relative block aspect-[16/10] overflow-hidden">
              <span
                ref={pagina}
                className="absolute inset-x-0 top-0 block will-change-transform"
                style={{ transition: 'transform .12s linear' }}
              >
                <MockupSito progetto={progetto} />
              </span>

              {/* Velo che si dirada al passaggio del mouse: sotto, il sito si accende. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgb(4_6_13/.75))] opacity-100 transition-opacity duration-500 group-hover:opacity-40"
              />

              {/* Riga di scansione: passa una volta all'ingresso del puntatore. */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-16 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    'linear-gradient(180deg,transparent,rgb(59 130 246 / .22),transparent)',
                  animation: 'scansione 2.6s ease-in-out infinite',
                }}
              />
            </span>
          </span>

          {/* Didascalia. */}
          <span className="flex items-end justify-between gap-4 px-2 pb-1 pt-5">
            <span className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-blu-chiaro">
                {progetto.categoria}
              </span>
              <span className="mt-2 block font-titolo text-lg font-semibold text-testo">
                {progetto.nome}
              </span>
              <span className="mt-1.5 block text-[0.88rem] leading-relaxed text-tenue">
                {progetto.sommario}
              </span>
            </span>

            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-bordo-forte text-tenue transition-all duration-500 group-hover:border-blu/60 group-hover:bg-blu/10 group-hover:text-blu-chiaro">
              <Icona nome="freccia" misura={17} />
            </span>
          </span>
        </button>
      </div>
    </Rivela>
  )
}

/* ── La scheda completa ────────────────────────────────────────────────────── */

/**
 * La scheda che si apre sul progetto.
 *
 * È una finestra di dialogo vera: chiude con Esc e con il clic fuori, blocca
 * lo scorrimento della pagina sotto, sposta il fuoco sul pulsante di chiusura
 * quando si apre e lo restituisce a chi l'aveva quando si chiude. Sono le
 * quattro cose che distinguono una finestra utilizzabile da tastiera da un
 * riquadro che intrappola chi non usa il mouse.
 */
function SchedaProgetto({ progetto, chiudi }: { progetto: Progetto; chiudi: () => void }) {
  const chiusura = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const attivoPrima = document.activeElement as HTMLElement | null
    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    chiusura.current?.focus()

    const tasto = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') chiudi()
    }
    document.addEventListener('keydown', tasto)

    return () => {
      document.body.style.overflow = precedente
      document.removeEventListener('keydown', tasto)
      attivoPrima?.focus?.()
    }
  }, [chiudi])

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto overscroll-contain bg-fondo/85 p-4 backdrop-blur-xl sm:p-8"
      onClick={chiudi}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheda-progetto-titolo"
        onClick={(evento) => evento.stopPropagation()}
        className="anima-entra vetro relative my-auto w-full max-w-4xl overflow-hidden rounded-enorme"
      >
        <button
          ref={chiusura}
          type="button"
          onClick={chiudi}
          className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-bordo-forte bg-fondo/70 text-tenue transition-colors hover:text-testo"
        >
          <span className="sr-only">Chiudi la scheda</span>
          <Icona nome="chiudi" misura={18} />
        </button>

        <div className="grid gap-0 lg:grid-cols-[1.05fr_1fr]">
          {/* L'anteprima, questa volta per intero e scorrevole. */}
          <div className="relative max-h-[42vh] overflow-y-auto border-b border-bordo/70 bg-black/30 lg:max-h-none lg:border-b-0 lg:border-r">
            <MockupSito progetto={progetto} />
          </div>

          <div className="p-7 sm:p-9">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blu-chiaro">
              {progetto.categoria} — {progetto.anno}
            </p>
            <h3
              id="scheda-progetto-titolo"
              className="mt-3 font-titolo text-3xl font-semibold leading-tight"
            >
              {progetto.nome}
            </h3>
            <p className="mt-5 text-[0.97rem] leading-relaxed text-tenue">{progetto.descrizione}</p>

            <h4 className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-fioco">
              Cosa è stato costruito
            </h4>
            <ul className="mt-4 space-y-2.5">
              {progetto.funzioni.map((funzione) => (
                <li key={funzione} className="flex items-start gap-2.5 text-[0.93rem] text-tenue">
                  <Icona
                    nome="spunta"
                    misura={15}
                    spessore={2}
                    className="mt-1 shrink-0 text-blu-chiaro"
                  />
                  {funzione}
                </li>
              ))}
            </ul>

            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-bordo/70 pt-7">
              {progetto.risultati.map((risultato) => (
                <div key={risultato.etichetta}>
                  <dt className="sr-only">{risultato.etichetta}</dt>
                  <dd>
                    <span className="block font-titolo text-2xl font-semibold testo-neon">
                      {risultato.valore}
                    </span>
                    <span className="mt-1.5 block text-[0.78rem] leading-snug text-fioco">
                      {risultato.etichetta}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-9">
              <Pulsante
                come="a"
                href="#contatti"
                onClick={chiudi}
                className="w-full"
                coda={<Icona nome="freccia" misura={17} />}
              >
                Voglio un sito così
              </Pulsante>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
