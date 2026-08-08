'use client'

import { useRef, useState } from 'react'
import { TAPPE } from '@/dati/contenuti'
import { limita, useScorrimento } from '@/componenti/effetti/ganci'
import { Icona } from '@/componenti/ui/Icona'
import { cn } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Dall'idea al sito online
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * La sezione è alta tre schermate e mezzo, con il contenuto fissato al centro:
 * scorrendo non si scende lungo la pagina, si avanza dentro la scena. Idea,
 * design, sviluppo, online — e alla fine la frase che chiude il ragionamento.
 *
 * Lo scorrimento produce un numero fra 0 e 1. Quel numero governa due cose
 * diverse, in due modi diversi:
 *
 *  * la barra e la dissolvenza finale, scritte come variabili CSS a ogni
 *    fotogramma (nessun render di React);
 *  * la tappa attiva, che è un valore discreto e cambia quattro volte in
 *    tutto: lì lo stato di React è la cosa giusta.
 *
 * È questa divisione che rende una sezione così lunga fluida anche su un
 * telefono di fascia media.
 */
export function Trasformazione() {
  const sezione = useRef<HTMLElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const [tappa, setTappa] = useState(0)

  useScorrimento(sezione, ({ percorso }) => {
    // L'ultimo quinto del percorso è riservato alla frase di chiusura.
    const corsa = limita(percorso / 0.82, 0, 1)
    const indice = limita(Math.floor(corsa * TAPPE.length), 0, TAPPE.length - 1)

    setTappa((precedente) => (precedente === indice ? precedente : indice))

    const elemento = scena.current
    if (!elemento) return
    elemento.style.setProperty('--corsa', corsa.toFixed(4))
    elemento.style.setProperty('--chiusura', limita((percorso - 0.84) / 0.16, 0, 1).toFixed(4))
  })

  const attiva = TAPPE[tappa]

  return (
    <section
      ref={sezione}
      id="trasformazione"
      className="relative h-[340svh]"
      aria-labelledby="trasformazione-titolo"
    >
      <div ref={scena} className="sticky top-0 grid h-svh place-items-center overflow-hidden">
        {/* Alone che cambia posizione con la tappa. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl transition-transform duration-1000"
          style={{
            background:
              'radial-gradient(circle,rgb(59 130 246 / .22),rgb(139 92 246 / .12) 45%,transparent 70%)',
            transform: `translateX(${(tappa - 1.5) * 8}%)`,
          }}
        />

        <div className="contenitore relative flex w-full flex-col items-center">
          <h2
            id="trasformazione-titolo"
            className="text-center text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro"
          >
            Trasformo un’idea in un sito
          </h2>

          {/* La scena: le quattro figure si sostituiscono l'una all'altra. */}
          <div className="relative mt-10 grid h-56 w-full place-items-center sm:h-64">
            {TAPPE.map((voce, indice) => (
              <div
                key={voce.id}
                aria-hidden={indice !== tappa}
                className={cn(
                  'absolute inset-0 grid place-items-center transition-all duration-700 [transition-timing-function:cubic-bezier(.16,1,.3,1)]',
                  indice === tappa
                    ? 'scale-100 opacity-100 blur-0'
                    : 'pointer-events-none scale-90 opacity-0 blur-md',
                )}
              >
                <Figura indice={indice} />
              </div>
            ))}
          </div>

          {/* La parola della tappa. */}
          <p
            key={attiva.id}
            className="anima-entra mt-8 font-titolo text-[clamp(2.2rem,9vw,5.5rem)] font-semibold uppercase leading-none tracking-[-0.03em] testo-neon-vivo"
          >
            {attiva.etichetta}
          </p>
          <p
            key={`${attiva.id}-testo`}
            className="anima-entra mt-5 max-w-lg text-center text-[1rem] leading-relaxed text-tenue"
            style={{ '--ritardo': '90ms' } as React.CSSProperties}
          >
            <span className="block font-medium text-testo">{attiva.titolo}</span>
            <span className="mt-1.5 block">{attiva.testo}</span>
          </p>

          {/* Il binario delle quattro tappe. */}
          <ol className="relative mt-12 flex w-full max-w-2xl items-center justify-between">
            <span
              aria-hidden="true"
              className="absolute inset-x-0 top-[11px] h-px bg-bordo-forte"
            />
            <span
              aria-hidden="true"
              className="absolute left-0 top-[11px] h-px origin-left bg-[linear-gradient(90deg,var(--blu),var(--viola),var(--ciano))]"
              style={{ width: '100%', transform: 'scaleX(var(--corsa, 0))' }}
            />
            {TAPPE.map((voce, indice) => (
              <li key={voce.id} className="relative flex flex-col items-center gap-3">
                <span
                  className={cn(
                    'grid h-[22px] w-[22px] place-items-center rounded-full border transition-all duration-500',
                    indice <= tappa
                      ? 'border-blu bg-fondo shadow-[0_0_18px_-2px_rgb(59_130_246/.9)]'
                      : 'border-bordo-forte bg-fondo',
                  )}
                >
                  <span
                    className={cn(
                      'block rounded-full transition-all duration-500',
                      indice <= tappa ? 'h-2 w-2 bg-blu-chiaro' : 'h-1.5 w-1.5 bg-bordo-forte',
                    )}
                  />
                </span>
                <span
                  className={cn(
                    'text-[10px] font-medium uppercase tracking-[0.16em] transition-colors duration-500 sm:text-[11px]',
                    indice <= tappa ? 'text-testo' : 'text-fioco',
                  )}
                >
                  {voce.etichetta}
                </span>
              </li>
            ))}
          </ol>
        </div>

        {/* La frase di chiusura entra sopra la scena. */}
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center bg-fondo/85 px-6 backdrop-blur-sm"
          style={{ opacity: 'var(--chiusura, 0)' }}
        >
          <p className="max-w-3xl text-center font-titolo text-[clamp(1.8rem,6vw,4rem)] font-semibold leading-[1.06]">
            Dalla tua idea <span className="testo-neon-vivo">al tuo nuovo sito.</span>
          </p>
        </div>
      </div>
    </section>
  )
}

/* ── Le quattro figure ─────────────────────────────────────────────────────── */

/**
 * Ogni tappa ha la sua figura, disegnata con quattro elementi in croce: una
 * lampadina che pulsa, una griglia che si compone, una finestra di codice che
 * si scrive, un sito che va online. Niente immagini, niente librerie: solo
 * bordi, sfumature e le animazioni già dichiarate nel foglio di stile.
 */
function Figura({ indice }: { indice: number }) {
  const tappa = TAPPE[indice]

  if (indice === 0) {
    return (
      <div className="relative grid h-40 w-40 place-items-center">
        <span
          className="absolute inset-0 rounded-full opacity-80 blur-2xl"
          style={{ background: 'radial-gradient(circle,rgb(59 130 246 / .5),transparent 65%)' }}
        />
        {[0, 0.6].map((ritardo) => (
          <span
            key={ritardo}
            className="absolute h-24 w-24 rounded-full border border-blu/40"
            style={{ animation: `pulsa-anello 2.6s ease-out ${ritardo}s infinite` }}
          />
        ))}
        <span className="anima-fluttua relative grid h-24 w-24 place-items-center rounded-full border border-blu/45 bg-blu/10 text-blu-chiaro">
          <Icona nome={tappa.icona} misura={40} spessore={1.2} />
        </span>
      </div>
    )
  }

  if (indice === 1) {
    return (
      <div className="relative h-40 w-64 sm:w-72">
        <span
          className="absolute inset-0 rounded-morbido opacity-70 blur-2xl"
          style={{ background: 'radial-gradient(circle,rgb(139 92 246 / .35),transparent 68%)' }}
        />
        {/* Il progetto che si compone: blocchi tratteggiati che entrano. */}
        <div className="vetro relative grid h-full grid-cols-3 grid-rows-3 gap-2 rounded-morbido p-3">
          {[
            'col-span-3 row-span-1',
            'col-span-2 row-span-2',
            'col-span-1 row-span-1',
            'col-span-1 row-span-1',
          ].map((forma, posizione) => (
            <span
              // Due blocchi hanno la stessa forma: la chiave è la posizione.
              key={posizione}
              className={cn('anima-entra rounded-lg border border-dashed border-viola/45 bg-viola/[.07]', forma)}
              style={{ '--ritardo': `${posizione * 160}ms` } as React.CSSProperties}
            />
          ))}
        </div>
      </div>
    )
  }

  if (indice === 2) {
    return (
      <div className="relative w-72 sm:w-80">
        <span
          className="absolute inset-0 rounded-morbido opacity-70 blur-2xl"
          style={{ background: 'radial-gradient(circle,rgb(34 211 238 / .3),transparent 68%)' }}
        />
        <div className="vetro relative rounded-morbido p-4 font-mono text-[11px] leading-relaxed">
          <span className="mb-3 flex gap-1.5">
            {['bg-red-400/60', 'bg-amber-400/60', 'bg-emerald-400/60'].map((tinta) => (
              <span key={tinta} className={cn('h-2 w-2 rounded-full', tinta)} />
            ))}
          </span>
          {[
            { testo: '<sezione class="apertura">', colore: 'text-viola-chiaro' },
            { testo: '  <h1>La tua attività</h1>', colore: 'text-blu-chiaro' },
            { testo: '  <Prenota disponibile />', colore: 'text-ciano' },
            { testo: '</sezione>', colore: 'text-viola-chiaro' },
          ].map((riga, posizione) => (
            <span
              key={riga.testo}
              className={cn('anima-entra block whitespace-pre', riga.colore)}
              style={{ '--ritardo': `${posizione * 190}ms` } as React.CSSProperties}
            >
              {riga.testo}
            </span>
          ))}
          <span
            className="mt-1 inline-block h-3 w-1.5 bg-blu-chiaro align-middle"
            style={{ animation: 'lampeggia-cursore 1.1s steps(1) infinite' }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-72 sm:w-80">
      <span
        className="absolute inset-0 rounded-morbido opacity-70 blur-2xl"
        style={{ background: 'radial-gradient(circle,rgb(59 130 246 / .4),transparent 68%)' }}
      />
      {/* Il sito pubblicato, con il segnale che si propaga. */}
      <div className="vetro relative overflow-hidden rounded-morbido">
        <span className="flex items-center gap-2 border-b border-bordo/70 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400/70" />
          <span className="flex-1 rounded-full bg-white/[.06] px-2 py-1 text-[9px] text-fioco">
            https://iltuosito.it
          </span>
        </span>
        <span className="relative grid h-28 place-items-center">
          {[0, 0.5, 1].map((ritardo) => (
            <span
              key={ritardo}
              className="absolute h-16 w-16 rounded-full border border-ciano/40"
              style={{ animation: `pulsa-anello 2.4s ease-out ${ritardo}s infinite` }}
            />
          ))}
          <span className="relative grid h-14 w-14 place-items-center rounded-full border border-ciano/50 bg-ciano/10 text-ciano">
            <Icona nome="globo" misura={26} spessore={1.2} />
          </span>
        </span>
      </div>
    </div>
  )
}
