'use client'

import { useRef } from 'react'
import { PROGETTI } from '@/dati/portfolio'
import { limita } from '@/componenti/effetti/ganci'
import { Rivela } from '@/componenti/effetti/Rivela'
import { MockupSito } from '@/componenti/ui/MockupSito'
import { MockupVecchio } from '@/componenti/ui/MockupVecchio'
import { Icona } from '@/componenti/ui/Icona'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Prima / dopo
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Due siti sovrapposti e una linea da trascinare. È il pezzo che convince più
 * di qualunque frase, perché non chiede di credere a niente: si vede.
 *
 * La posizione della linea vive in una variabile CSS scritta direttamente sul
 * contenitore. Non passa da React di proposito: trascinando si generano
 * decine di eventi al secondo, e ognuno farebbe ridisegnare due anteprime
 * intere. Così invece si aggiorna una sola proprietà, e il ritaglio avviene
 * nel compositore.
 *
 * Accessibilità: sotto la linea c'è un vero cursore di scorrimento. Chi naviga
 * da tastiera lo raggiunge con Tab e lo muove con le frecce, con tanto di
 * percentuale annunciata; chi usa il mouse o il dito trascina la maniglia e
 * non lo vede nemmeno.
 */

/** Il progetto usato come «dopo». Basta cambiare identificativo. */
const ESEMPIO = PROGETTI.find((progetto) => progetto.id === 'ristorante') ?? PROGETTI[0]

export function PrimaDopo() {
  const contenitore = useRef<HTMLDivElement>(null)
  const cursore = useRef<HTMLInputElement>(null)
  const trascina = useRef(false)

  function imposta(percentuale: number) {
    const valore = limita(percentuale, 2, 98)
    contenitore.current?.style.setProperty('--taglio', `${valore.toFixed(2)}%`)
    if (cursore.current) cursore.current.value = String(Math.round(valore))
  }

  function daEvento(evento: { clientX: number }) {
    const misura = contenitore.current?.getBoundingClientRect()
    if (!misura) return
    imposta(((evento.clientX - misura.left) / misura.width) * 100)
  }

  return (
    <section id="prima-dopo" className="relative py-28 sm:py-36" aria-labelledby="prima-dopo-titolo">
      <div className="contenitore">
        <Rivela className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
            Prima / dopo
          </p>
          <h2
            id="prima-dopo-titolo"
            className="mt-5 font-titolo text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[1.08]"
          >
            La differenza <span className="testo-neon">si vede.</span>
          </h2>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-tenue">
            La tua attività merita una presenza online all’altezza. Trascina la linea e guarda cosa
            cambia.
          </p>
        </Rivela>

        <Rivela tipo="scala" ritardo={120} className="mt-14">
          <div
            ref={contenitore}
            className="vetro relative overflow-hidden rounded-enorme p-3 select-none"
            style={{ '--taglio': '50%' } as React.CSSProperties}
            onPointerDown={(evento) => {
              // Con il mouse si può cliccare ovunque; con il dito solo la
              // maniglia trascina, altrimenti si perderebbe lo scorrimento
              // verticale della pagina proprio dentro a questa sezione.
              if (evento.pointerType !== 'mouse') return
              trascina.current = true
              daEvento(evento)
            }}
            onPointerMove={(evento) => {
              if (!trascina.current) return
              daEvento(evento)
            }}
            onPointerUp={() => {
              trascina.current = false
            }}
            onPointerLeave={() => {
              trascina.current = false
            }}
          >
            <div className="relative overflow-hidden rounded-ampio border border-bordo/80 bg-black/40">
              {/* Barra della finestra, comune ai due lati. */}
              <div className="flex items-center gap-2 border-b border-bordo/70 bg-white/[.03] px-4 py-2.5">
                <div className="flex gap-1.5">
                  {['bg-white/25', 'bg-white/18', 'bg-white/12'].map((tinta) => (
                    <span key={tinta} className={`h-2 w-2 rounded-full ${tinta}`} />
                  ))}
                </div>
                <span className="ml-1.5 flex-1 truncate rounded-full bg-white/[.05] px-3 py-1 text-[10px] text-fioco">
                  www.latuaattivita.it
                </span>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden">
                {/* Sotto: il sito vecchio.
                 *
                 * I due contenitori sono ancorati in alto e larghi quanto il
                 * riquadro, ma senza altezza propria: un `<svg>` senza
                 * attributo `height` vale `100%`, e dentro un contenitore di
                 * altezza definita si stirerebbe fino a riempirlo — con
                 * `preserveAspectRatio="slice"` significa ingrandire
                 * l'anteprima di tre volte. Lasciando l'altezza indefinita,
                 * l'SVG prende quella naturale del suo `viewBox` e il
                 * riquadro ne mostra la parte alta. */}
                <div className="absolute inset-x-0 top-0">
                  <MockupVecchio />
                </div>

                {/* Sopra: il sito nuovo, ritagliato dalla linea in poi. */}
                <div
                  className="absolute inset-x-0 top-0"
                  style={{ clipPath: 'inset(0 0 0 var(--taglio))' }}
                >
                  <MockupSito progetto={ESEMPIO} />
                  {/* Un velo appena percettibile, per staccare i due mondi. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_60%,rgb(4_6_13/.35))]"
                  />
                </div>

                {/* Etichette. */}
                <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm">
                  Sito vecchio
                </span>
                <span className="pointer-events-none absolute right-4 top-4 rounded-full border border-blu/40 bg-blu/15 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-blu-chiaro backdrop-blur-sm">
                  Sito moderno
                </span>

                {/* La linea di confronto. */}
                <div
                  className="pointer-events-none absolute inset-y-0 w-px bg-[linear-gradient(180deg,transparent,var(--blu-chiaro),var(--viola),transparent)] shadow-[0_0_18px_2px_rgb(59_130_246/.6)]"
                  style={{ left: 'var(--taglio)' }}
                >
                  {/* La maniglia. */}
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden="true"
                    onPointerDown={(evento) => {
                      trascina.current = true
                      evento.currentTarget.setPointerCapture(evento.pointerId)
                    }}
                    onPointerMove={(evento) => {
                      if (!trascina.current) return
                      daEvento(evento)
                    }}
                    onPointerUp={() => {
                      trascina.current = false
                    }}
                    className="pointer-events-auto absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center rounded-full border border-white/20 bg-fondo/80 text-blu-chiaro shadow-[0_0_30px_-4px_rgb(59_130_246/.9)] backdrop-blur-md transition-transform duration-200 hover:scale-110"
                    style={{ touchAction: 'none' }}
                  >
                    <span className="flex items-center gap-0.5">
                      <Icona nome="freccia" misura={14} className="rotate-180" spessore={2} />
                      <Icona nome="freccia" misura={14} spessore={2} />
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Il cursore vero, per chi naviga da tastiera. */}
            <label className="sr-only" htmlFor="confronto">
              Posizione del confronto fra il sito vecchio e quello moderno
            </label>
            <input
              ref={cursore}
              id="confronto"
              type="range"
              min={2}
              max={98}
              defaultValue={50}
              onChange={(evento) => imposta(Number(evento.target.value))}
              className="sr-only"
            />
          </div>
        </Rivela>

        {/* Le tre differenze che contano davvero. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              icona: 'razzo' as const,
              titolo: 'Da 6 secondi a meno di 1',
              testo: 'Il tempo di apertura è la prima cosa che il visitatore giudica, senza saperlo.',
            },
            {
              icona: 'dispositivi' as const,
              titolo: 'Finalmente leggibile dal telefono',
              testo: 'Sette visitatori su dieci arrivano dallo smartphone. Il vecchio sito li perdeva.',
            },
            {
              icona: 'lente' as const,
              titolo: 'Trovabile su Google',
              testo: 'Struttura, titoli e dati corretti: il sito comincia a comparire dove lo cercano.',
            },
          ].map((voce, indice) => (
            <Rivela key={voce.titolo} ritardo={indice * 110}>
              <div className="vetro h-full rounded-ampio p-6">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-blu/30 bg-blu/10 text-blu-chiaro">
                  <Icona nome={voce.icona} misura={19} />
                </span>
                <h3 className="mt-5 font-titolo text-base font-semibold">{voce.titolo}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-tenue">{voce.testo}</p>
              </div>
            </Rivela>
          ))}
        </div>
      </div>
    </section>
  )
}
