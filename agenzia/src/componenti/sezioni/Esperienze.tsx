'use client'

import { useEffect, useState } from 'react'
import { PILASTRI, type Pilastro } from '@/dati/contenuti'
import { useInclinazione, useInVista } from '@/componenti/effetti/ganci'
import { Rivela } from '@/componenti/effetti/Rivela'
import { Icona } from '@/componenti/ui/Icona'
import { cn } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * «Non creo semplici siti web»
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * L'ingresso è in due tempi: la prima riga arriva quando la sezione entra
 * nello schermo, la seconda un secondo dopo. È l'unico punto del sito in cui
 * un temporizzatore governa un'animazione, e la ragione è che qui il ritardo
 * *è* il contenuto: la frase funziona perché la seconda parte arriva dopo.
 *
 * Entrambe le righe sono nel documento fin dall'inizio; il temporizzatore
 * cambia solo l'aspetto. Con movimento ridotto le regole globali le mostrano
 * subito, e la frase resta leggibile — solo, senza pausa a effetto.
 */
export function Esperienze() {
  const [sezione, entrata] = useInVista<HTMLElement>(0.25)
  const [secondaRiga, setSecondaRiga] = useState(false)

  useEffect(() => {
    if (!entrata) return
    const tempo = window.setTimeout(() => setSecondaRiga(true), 950)
    return () => window.clearTimeout(tempo)
  }, [entrata])

  return (
    <section
      ref={sezione}
      id="esperienze"
      className="relative overflow-hidden py-28 sm:py-36"
      aria-labelledby="esperienze-titolo"
    >
      {/* Alone che accompagna il cambio di scena. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-[min(90vw,60rem)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_center,rgb(139_92_246/.16),transparent_70%)] blur-2xl"
      />

      <div className="contenitore relative">
        <h2
          id="esperienze-titolo"
          className="mx-auto max-w-4xl text-center font-titolo text-[clamp(1.9rem,6vw,4rem)] font-semibold leading-[1.05]"
        >
          <span
            className={cn(
              'block transition-all duration-1000 [transition-timing-function:cubic-bezier(.16,1,.3,1)]',
              entrata ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-5 opacity-0 blur-md',
            )}
          >
            Non creo semplici siti web.
          </span>
          <span
            className={cn(
              'testo-neon-vivo mt-2 block transition-all duration-1000 [transition-timing-function:cubic-bezier(.16,1,.3,1)]',
              secondaRiga ? 'translate-y-0 opacity-100 blur-0' : 'translate-y-6 opacity-0 blur-lg',
            )}
          >
            Creo esperienze digitali.
          </span>
        </h2>

        <Rivela
          come="p"
          ritardo={200}
          className="mx-auto mt-8 max-w-2xl text-center text-[1.02rem] leading-relaxed text-tenue"
        >
          Un sito non è una brochure messa online. È il primo posto in cui qualcuno decide se
          fidarsi di te — e quella decisione dura pochi secondi.
        </Rivela>

        <div className="mt-20 grid gap-7 md:grid-cols-3">
          {PILASTRI.map((pilastro, indice) => (
            <CartaPilastro key={pilastro.id} pilastro={pilastro} indice={indice} />
          ))}
        </div>
      </div>
    </section>
  )
}

/** Per ogni tinta: la luce dei bordi, il velo del vetro e il colore dell'icona. */
const TINTE = {
  blu: { luce: 'rgb(59 130 246 / .55)', velo: 'rgb(59 130 246 / .14)', testo: 'text-blu-chiaro' },
  viola: { luce: 'rgb(139 92 246 / .55)', velo: 'rgb(139 92 246 / .14)', testo: 'text-viola-chiaro' },
  ciano: { luce: 'rgb(34 211 238 / .5)', velo: 'rgb(34 211 238 / .14)', testo: 'text-ciano' },
} as const

/**
 * Uno dei tre elementi sospesi.
 *
 * Fluttua piano e si inclina seguendo il puntatore: l'inclinazione arriva dal
 * gancio come due variabili CSS, così la rotazione avviene nel compositore e
 * non costa un ricalcolo di layout.
 *
 * Il testo lungo compare al passaggio del mouse su schermo largo. Su telefono
 * non esiste il passaggio del mouse, e quindi il testo è semplicemente già
 * aperto: nessun contenuto raggiungibile solo con un gesto che il dito non sa
 * fare.
 */
function CartaPilastro({ pilastro, indice }: { pilastro: Pilastro; indice: number }) {
  const riferimento = useInclinazione<HTMLDivElement>(9)
  const tinta = TINTE[pilastro.tinta]

  return (
    <Rivela tipo="scala" ritardo={indice * 140} className="scena">
      <div
        ref={riferimento}
        tabIndex={0}
        data-cursore="pilastro"
        className="piano vetro vetro-luce group relative h-full overflow-hidden rounded-ampio p-8 transition-[box-shadow,border-color] duration-500 hover:border-blu/40 focus-visible:border-blu/40"
        style={{
          transform:
            'rotateX(var(--incl-x, 0deg)) rotateY(var(--incl-y, 0deg)) translateZ(0)',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1), border-color .5s, box-shadow .5s',
          boxShadow: `0 30px 80px -50px ${tinta.luce}`,
        }}
      >
        {/* Riflesso che segue il puntatore. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background: `radial-gradient(320px circle at var(--luce-x, 50%) var(--luce-y, 50%), ${tinta.luce}, transparent 65%)`,
            mixBlendMode: 'plus-lighter',
          }}
        />

        <div className="relative">
          {/* L'oggetto sospeso: una sfera di vetro con l'icona dentro. */}
          <div
            className="anima-fluttua relative grid h-20 w-20 place-items-center rounded-full"
            style={{
              animationDelay: `${indice * 0.7}s`,
              background: `radial-gradient(circle at 35% 30%, rgb(255 255 255 / .16), transparent 60%), ${tinta.velo}`,
              border: `1px solid ${tinta.luce}`,
              boxShadow: `0 0 44px -10px ${tinta.luce}, inset 0 0 30px -12px ${tinta.luce}`,
            }}
          >
            <Icona nome={pilastro.icona} misura={32} className={tinta.testo} spessore={1.2} />
          </div>

          <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.26em] text-fioco">
            {pilastro.sommario}
          </p>
          <h3 className="mt-2 font-titolo text-2xl font-semibold">{pilastro.titolo}</h3>

          {/* Su schermo largo il testo si apre al passaggio; sotto è già aperto. */}
          <div className="grid grid-rows-[1fr] transition-[grid-template-rows] duration-500 md:grid-rows-[0fr] md:group-hover:grid-rows-[1fr] md:group-focus-within:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <p className="pt-4 text-[0.95rem] leading-relaxed text-tenue">{pilastro.testo}</p>
            </div>
          </div>
        </div>
      </div>
    </Rivela>
  )
}
