'use client'

import { TRAGUARDI } from '@/dati/contenuti'
import { Contatore } from '@/componenti/effetti/Contatore'
import { Rivela } from '@/componenti/effetti/Rivela'
import { useInclinazione } from '@/componenti/effetti/ganci'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Perché scegliermi
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Quattro grandezze, non quattro vanterie: nessuna promette un numero di
 * clienti o una posizione su Google, perché sarebbero promesse che non
 * dipendono da me. Dicono invece cosa riceve chi lavora con me, ed è verificabile.
 *
 * I valori numerici salgono da zero quando entrano nello schermo; i due
 * simboli — il fulmine e l'infinito — non si possono contare, e quindi
 * compaiono con una dissolvenza.
 */
export function Numeri() {
  return (
    <section id="numeri" className="relative py-28 sm:py-36" aria-labelledby="numeri-titolo">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/4 h-80 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgb(59_130_246/.12),transparent_70%)] blur-2xl"
      />

      <div className="contenitore relative">
        <Rivela className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
            Perché scegliermi
          </p>
          <h2
            id="numeri-titolo"
            className="mt-5 font-titolo text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[1.08]"
          >
            Il tuo business, <span className="testo-neon">senza limiti.</span>
          </h2>
        </Rivela>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TRAGUARDI.map((traguardo, indice) => (
            <Rivela key={traguardo.id} tipo="scala" ritardo={indice * 120} className="scena">
              <CartaTraguardo traguardo={traguardo} />
            </Rivela>
          ))}
        </div>
      </div>
    </section>
  )
}

function CartaTraguardo({ traguardo }: { traguardo: (typeof TRAGUARDI)[number] }) {
  const riferimento = useInclinazione<HTMLDivElement>(7)

  return (
    <div
      ref={riferimento}
      className="piano vetro vetro-luce group relative h-full overflow-hidden rounded-ampio p-8 text-center transition-[border-color,box-shadow] duration-500 hover:border-blu/40 hover:shadow-[0_40px_100px_-60px_rgb(59_130_246/.9)]"
      style={{
        transform: 'rotateX(var(--incl-x, 0deg)) rotateY(var(--incl-y, 0deg))',
        transition: 'transform .5s cubic-bezier(.16,1,.3,1), border-color .5s, box-shadow .5s',
      }}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-8 -top-24 h-40 rounded-full bg-[radial-gradient(ellipse,rgb(59_130_246/.35),transparent_70%)] opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
      />

      <p className="relative font-titolo text-[clamp(2.6rem,7vw,3.6rem)] font-semibold leading-none">
        {traguardo.numero !== undefined ? (
          <Contatore
            a={traguardo.numero}
            prefisso={traguardo.prefisso}
            suffisso={traguardo.suffisso}
            className="testo-neon-vivo"
          />
        ) : (
          <span className="testo-neon-vivo">{traguardo.simbolo}</span>
        )}
      </p>

      <p className="relative mt-4 text-[11px] font-semibold uppercase tracking-[0.24em] text-testo">
        {traguardo.etichetta}
      </p>
      <p className="relative mt-3 text-[0.9rem] leading-relaxed text-tenue">{traguardo.testo}</p>
    </div>
  )
}
