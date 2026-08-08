'use client'

import { useRef } from 'react'
import { AGENZIA } from '@/dati/agenzia'
import { useScorrimento } from '@/componenti/effetti/ganci'
import { Magnetico } from '@/componenti/effetti/Magnetico'
import { Pulsante } from '@/componenti/ui/Pulsante'
import { Icona } from '@/componenti/ui/Icona'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Apertura
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * La scena: buio, una particella che si accende al centro, il portale che si
 * apre in tre anelli e infine il titolo. Tutta la sequenza è scritta in CSS con
 * ritardi crescenti — nessun temporizzatore in JavaScript, nessuno stato — così
 * parte al primo fotogramma utile e non può disallinearsi.
 *
 * Il titolo è nel documento fin dall'inizio: l'animazione riguarda solo il suo
 * aspetto. Un motore di ricerca, o un lettore di schermo, lo trova subito.
 *
 * Durante lo scorrimento il portale si allontana più lentamente del testo — è
 * il parallasse — e la scritta si dissolve prima di uscire. Le due misure sono
 * scritte come variabili CSS sulla sezione, quindi il movimento non fa
 * ridisegnare nulla a React.
 */
export function Apertura() {
  const sezione = useRef<HTMLElement>(null)

  useScorrimento(sezione, ({ uscita }) => {
    const elemento = sezione.current
    if (!elemento) return
    // Vale 0 a pagina ferma e cresce solo mentre l'apertura scorre via.
    elemento.style.setProperty('--uscita', uscita.toFixed(4))
  })

  return (
    <section
      ref={sezione}
      id="apertura"
      className="relative grid min-h-svh place-items-center overflow-hidden px-5 pb-24 pt-[calc(var(--testata)+3rem)]"
    >
      {/* Reticolo tecnico. */}
      <div aria-hidden="true" className="griglia pointer-events-none absolute inset-0" />

      {/* Il portale. */}
      <Portale />

      {/* Velo fra il portale e il titolo: il nucleo è la cosa più luminosa
       * della pagina e cade proprio dietro alla terza riga. Spento al centro
       * quel tanto che basta, il titolo torna nitido e l'alone resta. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_38%_30%_at_50%_50%,rgb(4_6_13/.72),rgb(4_6_13/.35)_55%,transparent_75%)]"
      />

      <div
        className="relative z-10 mx-auto max-w-4xl text-center"
        style={{
          transform: 'translateY(calc(var(--uscita, 0) * 90px))',
          opacity: 'calc(1 - var(--uscita, 0) * 1.6)',
        }}
      >
        <p
          className="anima-entra vetro mx-auto inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.22em] text-tenue"
          style={{ '--ritardo': '900ms' } as React.CSSProperties}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ciano opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ciano" />
          </span>
          Siti web su misura — {AGENZIA.sede.raggio}
        </p>

        <h1 className="mt-8 font-titolo text-[clamp(2.4rem,8.2vw,5.5rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
          <span
            className="anima-entra block"
            style={{ '--ritardo': '1050ms' } as React.CSSProperties}
          >
            Il tuo sito.
          </span>
          <span
            className="anima-entra block"
            style={{ '--ritardo': '1200ms' } as React.CSSProperties}
          >
            La tua immagine.
          </span>
          <span
            className="anima-entra testo-neon-vivo block"
            style={{ '--ritardo': '1350ms' } as React.CSSProperties}
          >
            Il tuo successo.
          </span>
        </h1>

        <p
          className="anima-entra mx-auto mt-8 max-w-2xl text-balance text-[clamp(1rem,2.2vw,1.2rem)] leading-relaxed text-tenue"
          style={{ '--ritardo': '1500ms' } as React.CSSProperties}
        >
          Creo siti web moderni, veloci e progettati per trasformare visitatori in clienti.
        </p>

        <div
          className="anima-entra mt-11 flex flex-col items-center justify-center gap-4 sm:flex-row"
          style={{ '--ritardo': '1650ms' } as React.CSSProperties}
        >
          <Magnetico forza={16}>
            <Pulsante
              come="a"
              href="#contatti"
              className="w-full sm:w-auto"
              coda={<Icona nome="freccia" misura={18} />}
            >
              Creiamo il tuo sito
            </Pulsante>
          </Magnetico>

          <Magnetico forza={10}>
            <Pulsante come="a" href="#portfolio" aspetto="contorno" className="w-full sm:w-auto">
              Guarda cosa posso creare
            </Pulsante>
          </Magnetico>
        </div>

        <ul
          className="anima-entra mt-12 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[0.82rem] text-fioco"
          style={{ '--ritardo': '1800ms' } as React.CSSProperties}
        >
          {[
            `Online in ${AGENZIA.tempi.consegna}`,
            `Risposta entro ${AGENZIA.tempi.risposta}`,
            'Preventivo scritto, senza sorprese',
          ].map((voce) => (
            <li key={voce} className="inline-flex items-center gap-2">
              <Icona nome="spunta" misura={14} className="text-blu-chiaro" spessore={2} />
              {voce}
            </li>
          ))}
        </ul>
      </div>

      {/* Invito a scorrere. */}
      <a
        href="#esperienze"
        aria-label="Scorri alla sezione successiva"
        className="anima-dissolvi absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2.5 text-fioco transition-colors hover:text-testo sm:flex"
        style={{ '--ritardo': '2100ms', opacity: 'calc(1 - var(--uscita, 0) * 3)' } as React.CSSProperties}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scorri</span>
        <span className="relative block h-9 w-5 rounded-full border border-bordo-forte">
          <span className="absolute left-1/2 top-1.5 h-1.5 w-1 -translate-x-1/2 rounded-full bg-blu-chiaro anima-fluttua" />
        </span>
      </a>
    </section>
  )
}

/**
 * Il portale.
 *
 * Un nucleo luminoso e tre anelli inclinati che ruotano su piani diversi: la
 * profondità viene dalla prospettiva del contenitore, non da una libreria 3D.
 * Costa tre elementi e nessun fotogramma calcolato in JavaScript, mentre la
 * stessa scena in WebGL costerebbe centinaia di kilobyte e un ciclo di disegno
 * acceso per tutta la visita.
 */
function Portale() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center"
      style={{
        perspective: '900px',
        transform: 'translateY(calc(var(--uscita, 0) * -140px)) scale(calc(1 + var(--uscita, 0) * .25))',
        opacity: 'calc(1 - var(--uscita, 0) * 1.1)',
      }}
    >
      <div className="relative grid h-[min(78vw,34rem)] w-[min(78vw,34rem)] place-items-center">
        {/* Bagliore di fondo: è la luce che il portale getta sulla scena. */}
        <div
          className="absolute inset-0 rounded-full opacity-70 blur-3xl"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, rgb(59 130 246 / .38), rgb(139 92 246 / .22) 42%, transparent 68%)',
            animation: 'nascita-nucleo 2.4s cubic-bezier(.16,1,.3,1) .2s both',
          }}
        />

        {/* Il disco centrale: la particella che si è aperta. */}
        <div
          className="absolute h-24 w-24 rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 45%, #ffffff, var(--blu-chiaro) 32%, var(--viola) 62%, transparent 74%)',
            filter: 'blur(2px)',
            animation: 'nascita-nucleo 1.8s cubic-bezier(.16,1,.3,1) .15s both',
          }}
        />

        {/* Tre anelli su piani diversi. */}
        {[
          { misura: '100%', durata: '38s', ritardo: '.35s', colore: 'rgb(59 130 246 / .55)', spessore: 1 },
          { misura: '74%', durata: '26s', ritardo: '.5s', colore: 'rgb(139 92 246 / .5)', spessore: 1 },
          { misura: '48%', durata: '18s', ritardo: '.65s', colore: 'rgb(34 211 238 / .45)', spessore: 2 },
        ].map((anello, indice) => (
          <div
            key={anello.misura}
            className="absolute rounded-full"
            style={{
              width: anello.misura,
              height: anello.misura,
              border: `${anello.spessore}px solid ${anello.colore}`,
              boxShadow: `0 0 40px -6px ${anello.colore}`,
              animation: `apri-anello 1.6s cubic-bezier(.16,1,.3,1) ${anello.ritardo} both, gira-anello ${anello.durata} linear ${anello.ritardo} infinite`,
              animationDirection: indice === 1 ? 'normal, reverse' : undefined,
            }}
          />
        ))}

        {/* Anello verticale: chiude la forma del portale. */}
        <div
          className="absolute h-[86%] w-[86%] rounded-full border border-blu/25"
          style={{ animation: 'nascita-nucleo 2s cubic-bezier(.16,1,.3,1) .8s both' }}
        />
      </div>
    </div>
  )
}
