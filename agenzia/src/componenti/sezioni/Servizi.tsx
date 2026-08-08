'use client'

import { useState } from 'react'
import { ASSISTENZA, LISTINO } from '@/dati/agenzia'
import { SERVIZI, type Servizio } from '@/dati/servizi'
import { useInclinazione } from '@/componenti/effetti/ganci'
import { Rivela } from '@/componenti/effetti/Rivela'
import { Icona } from '@/componenti/ui/Icona'
import { Pulsante } from '@/componenti/ui/Pulsante'
import { cn, euro } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * I servizi
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Otto schede che si inclinano sotto il puntatore e si voltano per mostrare il
 * dettaglio. Sotto, il listino: tre prezzi di partenza, perché il visitatore
 * che non trova nessun numero se ne va a cercarlo altrove.
 */
export function Servizi() {
  return (
    <section id="servizi" className="relative py-28 sm:py-36" aria-labelledby="servizi-titolo">
      <div className="contenitore">
        <Rivela className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
            I miei servizi
          </p>
          <h2
            id="servizi-titolo"
            className="mt-5 font-titolo text-[clamp(1.8rem,5vw,3.4rem)] font-semibold leading-[1.08]"
          >
            Tutto quello che serve <span className="testo-neon">alla tua attività.</span>
          </h2>
          <p className="mt-6 text-[1.02rem] leading-relaxed text-tenue">
            Dalla prima riga di codice all’assistenza di due anni dopo. Un interlocutore solo, per
            tutto quello che riguarda la tua presenza online.
          </p>
        </Rivela>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVIZI.map((servizio, indice) => (
            <CartaServizio key={servizio.id} servizio={servizio} indice={indice} />
          ))}
        </div>

        {/* ── Listino ──────────────────────────────────────────────────────── */}

        <Rivela className="mt-24 text-center">
          <h3 className="font-titolo text-[clamp(1.4rem,3.6vw,2.2rem)] font-semibold">
            Quanto costa, in ordine di grandezza
          </h3>
          <p className="mx-auto mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-tenue">
            Il preventivo vero nasce dopo mezz’ora di chiacchierata, perché dipende da quante
            pagine servono e da cosa deve saper fare il sito. Questi sono i punti di partenza.
          </p>
        </Rivela>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {LISTINO.map((voce, indice) => (
            <Rivela key={voce.id} tipo="scala" ritardo={indice * 110}>
              <div
                className={cn(
                  'vetro vetro-luce relative h-full overflow-hidden rounded-ampio p-8 transition-all duration-500 hover:-translate-y-1',
                  'inRisalto' in voce && voce.inRisalto
                    ? 'border-blu/45 shadow-[0_40px_100px_-60px_rgb(59_130_246/.9)]'
                    : 'hover:border-blu/35',
                )}
              >
                {'inRisalto' in voce && voce.inRisalto ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgb(139_92_246/.35),transparent_65%)] blur-xl"
                    />
                    <span className="absolute right-6 top-7 rounded-full border border-blu/40 bg-blu/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-blu-chiaro">
                      Il più scelto
                    </span>
                  </>
                ) : null}

                <h4 className="font-titolo text-xl font-semibold">{voce.nome}</h4>
                <p className="mt-4 flex items-baseline gap-2">
                  <span className="text-[0.8rem] uppercase tracking-[0.2em] text-fioco">da</span>
                  <span className="font-titolo text-4xl font-semibold testo-neon">
                    {euro(voce.da)}
                  </span>
                </p>
                <p className="mt-4 text-[0.95rem] leading-relaxed text-tenue">{voce.descrizione}</p>

                <ul className="mt-6 space-y-2.5 border-t border-bordo/70 pt-6">
                  {voce.incluso.map((riga) => (
                    <li key={riga} className="flex items-start gap-2.5 text-[0.92rem] text-tenue">
                      <Icona
                        nome="spunta"
                        misura={15}
                        spessore={2}
                        className="mt-1 shrink-0 text-blu-chiaro"
                      />
                      {riga}
                    </li>
                  ))}
                </ul>
              </div>
            </Rivela>
          ))}
        </div>

        <Rivela className="mt-10 flex flex-col items-center justify-between gap-6 rounded-ampio border border-bordo/70 bg-superficie/40 p-7 sm:flex-row">
          <p className="text-[0.95rem] leading-relaxed text-tenue">
            <span className="font-medium text-testo">
              Assistenza {euro(ASSISTENZA.canoneMensile)} al mese
            </span>{' '}
            — {ASSISTENZA.descrizione} Facoltativa, disdicibile quando vuoi.
          </p>
          <Pulsante
            come="a"
            href="#contatti"
            aspetto="contorno"
            className="shrink-0"
            coda={<Icona nome="freccia" misura={17} />}
          >
            Chiedi un preventivo
          </Pulsante>
        </Rivela>
      </div>
    </section>
  )
}

/**
 * Una scheda servizio.
 *
 * Il dettaglio è un pannello che sale a coprire la scheda. Su schermo largo
 * basta passarci sopra; dove il passaggio del mouse non esiste, la scheda è un
 * pulsante che lo apre e lo chiude — con `aria-expanded`, così anche chi
 * naviga da tastiera o con un lettore di schermo sa che c'è dell'altro.
 */
function CartaServizio({ servizio, indice }: { servizio: Servizio; indice: number }) {
  const riferimento = useInclinazione<HTMLDivElement>(8)
  const [aperta, setAperta] = useState(false)

  return (
    <Rivela tipo="scala" ritardo={(indice % 4) * 90} className="scena h-full">
      <div
        ref={riferimento}
        className="piano group relative h-full"
        style={{
          transform: 'rotateX(var(--incl-x, 0deg)) rotateY(var(--incl-y, 0deg))',
          transition: 'transform .5s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <button
          type="button"
          onClick={() => setAperta((precedente) => !precedente)}
          aria-expanded={aperta}
          data-cursore="servizio"
          className="vetro vetro-luce relative flex h-full min-h-[15.5rem] w-full flex-col overflow-hidden rounded-ampio p-7 text-left transition-[border-color,box-shadow] duration-500 hover:border-blu/40 hover:shadow-[0_40px_90px_-60px_rgb(59_130_246/.9)]"
        >
          {/* Riflesso sotto il puntatore. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background:
                'radial-gradient(260px circle at var(--luce-x, 50%) var(--luce-y, 50%), rgb(99 130 246 / .16), transparent 62%)',
            }}
          />

          <span className="relative grid h-12 w-12 place-items-center rounded-2xl border border-blu/30 bg-blu/10 text-blu-chiaro transition-colors duration-500 group-hover:border-viola/40 group-hover:text-viola-chiaro">
            <Icona nome={servizio.icona} misura={22} />
          </span>

          <h3 className="relative mt-6 font-titolo text-lg font-semibold">{servizio.titolo}</h3>
          <p className="relative mt-2.5 text-[0.92rem] leading-relaxed text-tenue">
            {servizio.sommario}
          </p>

          <span className="relative mt-auto inline-flex items-center gap-2 pt-6 text-[0.82rem] text-fioco transition-colors duration-300 group-hover:text-blu-chiaro">
            {aperta ? 'Chiudi' : 'Cosa vuol dire'}
            <Icona
              nome="freccia"
              misura={15}
              className={cn('transition-transform duration-300', aperta && 'rotate-90')}
            />
          </span>

          {/* Il dettaglio: sale dal basso e copre la scheda. */}
          <span
            className={cn(
              'absolute inset-0 flex flex-col justify-center gap-3.5 rounded-ampio p-7 transition-transform duration-500 [transition-timing-function:cubic-bezier(.16,1,.3,1)]',
              'bg-[linear-gradient(160deg,rgb(17_23_41/.97),rgb(11_15_28/.99))]',
              aperta ? 'translate-y-0' : 'translate-y-full group-hover:translate-y-0',
            )}
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blu-chiaro">
              {servizio.titolo}
            </span>
            {servizio.dettagli.map((riga) => (
              <span key={riga} className="flex items-start gap-2.5 text-[0.88rem] leading-relaxed text-tenue">
                <Icona
                  nome="spunta"
                  misura={14}
                  spessore={2}
                  className="mt-1 shrink-0 text-viola-chiaro"
                />
                {riga}
              </span>
            ))}
          </span>
        </button>
      </div>
    </Rivela>
  )
}
