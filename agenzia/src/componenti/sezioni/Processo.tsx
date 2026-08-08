'use client'

import { useRef } from 'react'
import { FASI } from '@/dati/contenuti'
import { useScorrimento } from '@/componenti/effetti/ganci'
import { Rivela } from '@/componenti/effetti/Rivela'
import { Icona } from '@/componenti/ui/Icona'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Il processo
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Cinque fasi su una linea che si accende man mano che si scorre. Il
 * riempimento della linea è una variabile CSS aggiornata durante lo
 * scorrimento; le fasi compaiono con l'osservatore condiviso, una dopo
 * l'altra.
 *
 * La linea è una decorazione e resta invisibile ai lettori di schermo: la
 * successione delle fasi è già dichiarata dalla lista numerata, che è il modo
 * corretto di dire «questi passaggi hanno un ordine».
 */
export function Processo() {
  const lista = useRef<HTMLOListElement>(null)

  useScorrimento(lista, ({ passaggio }) => {
    const elemento = lista.current
    if (!elemento) return
    // La linea è già a metà quando la lista è a metà schermo: così il
    // riempimento accompagna la lettura invece di rincorrerla.
    const quota = Math.min(Math.max((passaggio - 0.12) / 0.55, 0), 1)
    elemento.style.setProperty('--riempimento', quota.toFixed(4))
  })

  return (
    <section id="processo" className="relative py-28 sm:py-36" aria-labelledby="processo-titolo">
      <div className="contenitore">
        <Rivela className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
            Il processo
          </p>
          <h2
            id="processo-titolo"
            className="mt-5 font-titolo text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[1.08]"
          >
            Dal primo caffè <span className="testo-neon">al sito online.</span>
          </h2>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-tenue">
            Cinque passaggi, sempre gli stessi. Sai in ogni momento a che punto siamo e cosa
            succede dopo.
          </p>
        </Rivela>

        <ol ref={lista} className="relative mx-auto mt-20 max-w-3xl">
          {/* Il binario. */}
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[27px] top-4 w-px bg-bordo sm:left-[35px]"
          />
          <span
            aria-hidden="true"
            className="absolute bottom-8 left-[27px] top-4 w-px origin-top bg-[linear-gradient(180deg,var(--blu),var(--viola),var(--ciano))] shadow-[0_0_14px_1px_rgb(59_130_246/.5)] sm:left-[35px]"
            style={{ transform: 'scaleY(var(--riempimento, 0))' }}
          />

          {FASI.map((fase, indice) => (
            <li key={fase.numero} className="relative pb-12 pl-20 last:pb-0 sm:pl-28">
              <Rivela tipo="sinistra" ritardo={indice * 90}>
                {/* Il nodo. */}
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 grid h-14 w-14 place-items-center rounded-full border border-bordo-forte bg-fondo font-titolo text-sm font-semibold text-tenue transition-colors duration-500 sm:h-[70px] sm:w-[70px] sm:text-base"
                >
                  {fase.numero}
                </span>

                <div className="vetro vetro-luce group rounded-ampio p-6 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-blu/40 sm:p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-titolo text-xl font-semibold sm:text-2xl">
                      <span className="sr-only">Fase {fase.numero}: </span>
                      {fase.titolo}
                    </h3>
                    <span className="inline-flex items-center gap-2 rounded-full border border-bordo-forte px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-fioco transition-colors duration-500 group-hover:border-blu/40 group-hover:text-blu-chiaro">
                      <Icona nome="orologio" misura={13} />
                      {fase.durata}
                    </span>
                  </div>
                  <p className="mt-4 text-[0.97rem] leading-relaxed text-tenue">{fase.testo}</p>
                </div>
              </Rivela>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
