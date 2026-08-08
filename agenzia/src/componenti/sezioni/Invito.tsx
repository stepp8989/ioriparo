'use client'

import { useEffect, useRef, useState } from 'react'
import { AGENZIA } from '@/dati/agenzia'
import { Magnetico } from '@/componenti/effetti/Magnetico'
import { Rivela } from '@/componenti/effetti/Rivela'
import { ModuloContatto } from '@/componenti/moduli/ModuloContatto'
import { Pulsante } from '@/componenti/ui/Pulsante'
import { Icona } from '@/componenti/ui/Icona'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * L'invito finale
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Quasi tutto nero, una sfera che si accende al centro e una domanda sola. È
 * il punto in cui il sito smette di raccontare e chiede.
 *
 * Il modulo si apre in una finestra, come chiesto: mantiene la scena pulita e
 * concentra l'attenzione. Perché però nessuno resti a mani vuote se qualcosa
 * non funziona — JavaScript disattivato, una rete che cade — sotto al pulsante
 * ci sono sempre i recapiti veri, che sono semplici collegamenti.
 */
export function Invito() {
  const [aperto, setAperto] = useState(false)

  return (
    <section
      id="contatti"
      className="relative overflow-hidden py-32 sm:py-40"
      aria-labelledby="invito-titolo"
    >
      {/* Il fondo si fa più profondo del resto della pagina. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_45%,rgb(4_6_13/0),rgb(2_3_8/.85)_75%)]"
      />

      <Sfera />

      {/* Velo fra la sfera e le parole.
       *
       * La sfera è bella e sta al centro, esattamente dove sta il testo: senza
       * questo strato il sottotitolo finiva sopra la zona più luminosa e
       * diventava illeggibile. Il velo è scuro al centro e trasparente ai
       * bordi, così spegne solo la parte che dà fastidio e lascia intatto
       * l'alone che si vede intorno. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_22%_at_50%_34%,rgb(2_3_8/.7),transparent_78%)] md:bg-[radial-gradient(ellipse_46%_38%_at_50%_50%,rgb(2_3_8/.82),rgb(2_3_8/.45)_60%,transparent_78%)]"
      />

      <div className="contenitore relative">
        <Rivela className="mx-auto max-w-3xl text-center">
          <h2
            id="invito-titolo"
            className="font-titolo text-[clamp(1.9rem,5.6vw,3.9rem)] font-semibold leading-[1.06]"
          >
            Sei pronto a far crescere <span className="testo-neon-vivo">la tua attività online?</span>
          </h2>
          <p className="mx-auto mt-7 max-w-xl text-[1.05rem] leading-relaxed text-tenue">
            Raccontami la tua idea. Al resto penso io.
          </p>

          <div className="mt-12 flex justify-center">
            <Magnetico forza={18} raggio={120}>
              <Pulsante
                onClick={() => setAperto(true)}
                className="px-9 text-base"
                coda={<Icona nome="freccia" misura={19} />}
              >
                Inizia il tuo progetto
              </Pulsante>
            </Magnetico>
          </div>

          {/* I recapiti restano sempre raggiungibili. */}
          <ul className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {[
              {
                href: `mailto:${AGENZIA.email}`,
                icona: 'busta' as const,
                testo: AGENZIA.email,
                esterno: false,
              },
              {
                href: `tel:${AGENZIA.telefonoLink}`,
                icona: 'telefono' as const,
                testo: AGENZIA.telefono,
                esterno: false,
              },
              {
                href: `https://wa.me/${AGENZIA.whatsapp}`,
                icona: 'whatsapp' as const,
                testo: 'WhatsApp',
                esterno: true,
              },
            ].map((recapito) => (
              <li key={recapito.href}>
                <a
                  href={recapito.href}
                  {...(recapito.esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="vetro inline-flex min-h-[3rem] items-center gap-2.5 rounded-full px-5 text-[0.9rem] text-tenue transition-all duration-300 hover:-translate-y-0.5 hover:border-blu/45 hover:text-testo"
                >
                  <Icona nome={recapito.icona} misura={16} className="text-blu-chiaro" />
                  {recapito.testo}
                </a>
              </li>
            ))}
          </ul>
        </Rivela>
      </div>

      {aperto ? <FinestraModulo chiudi={() => setAperto(false)} /> : null}
    </section>
  )
}

/* ── La sfera ──────────────────────────────────────────────────────────────── */

/**
 * Una sfera luminosa, fatta di sfumature.
 *
 * La rotondità viene da una sfumatura radiale spostata verso l'alto a
 * sinistra, come se la luce arrivasse da lì, e da un'ombra interna sul lato
 * opposto. Sopra passa una sfumatura conica in rotazione, che dà l'idea di una
 * superficie che gira. Gli anelli inclinati chiudono la scena.
 *
 * Nessuna libreria 3D, nessuna texture da scaricare: cinque elementi e tre
 * animazioni che il compositore del browser gestisce senza toccare il thread
 * principale.
 */
function Sfera() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 grid place-items-center opacity-80"
      style={{ perspective: '1000px' }}
    >
      <div className="relative grid h-[min(70vw,26rem)] w-[min(70vw,26rem)] place-items-center">
        {/* L'alone. */}
        <div
          className="anima-respiro absolute inset-[-18%] rounded-full blur-3xl"
          style={{
            background:
              'radial-gradient(circle,rgb(59 130 246 / .34),rgb(139 92 246 / .2) 45%,transparent 70%)',
          }}
        />

        {/* Il corpo della sfera. */}
        <div
          className="absolute h-[58%] w-[58%] rounded-full"
          style={{
            background:
              'radial-gradient(circle at 33% 27%, #e8f0ff 0%, #7fb2ff 18%, #3b82f6 42%, #5b21b6 68%, #0b1024 100%)',
            boxShadow:
              'inset -18px -22px 60px rgb(2 3 8 / .75), inset 10px 12px 40px rgb(255 255 255 / .12), 0 0 110px -10px rgb(59 130 246 / .65)',
          }}
        >
          {/* Superficie in rotazione. */}
          <div
            className="anima-orbita absolute inset-0 rounded-full opacity-45 mix-blend-overlay"
            style={{
              background:
                'conic-gradient(from 0deg, transparent, rgb(255 255 255 / .35), transparent 40%, rgb(34 211 238 / .3), transparent 70%)',
            }}
          />
          {/* Riflesso in alto a sinistra. */}
          <div
            className="absolute left-[16%] top-[12%] h-[26%] w-[34%] rounded-full opacity-70 blur-md"
            style={{ background: 'radial-gradient(ellipse,rgb(255 255 255 / .8),transparent 70%)' }}
          />
        </div>

        {/* Anelli inclinati. */}
        {[
          { misura: '86%', durata: '30s', colore: 'rgb(59 130 246 / .45)' },
          { misura: '100%', durata: '46s', colore: 'rgb(139 92 246 / .35)' },
        ].map((anello, indice) => (
          <div
            key={anello.misura}
            className="absolute rounded-full"
            style={{
              width: anello.misura,
              height: anello.misura,
              border: `1px solid ${anello.colore}`,
              boxShadow: `0 0 34px -8px ${anello.colore}`,
              animation: `gira-anello ${anello.durata} linear infinite`,
              animationDirection: indice === 1 ? 'reverse' : 'normal',
            }}
          />
        ))}
      </div>
    </div>
  )
}

/* ── La finestra del modulo ────────────────────────────────────────────────── */

function FinestraModulo({ chiudi }: { chiudi: () => void }) {
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
        aria-labelledby="modulo-titolo"
        onClick={(evento) => evento.stopPropagation()}
        className="anima-entra vetro relative my-auto w-full max-w-2xl overflow-hidden rounded-enorme p-7 sm:p-10"
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(59_130_246/.28),transparent_66%)] blur-2xl"
        />

        <button
          ref={chiusura}
          type="button"
          onClick={chiudi}
          className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-full border border-bordo-forte text-tenue transition-colors hover:text-testo"
        >
          <span className="sr-only">Chiudi il modulo</span>
          <Icona nome="chiudi" misura={18} />
        </button>

        <p className="relative text-[11px] font-semibold uppercase tracking-[0.26em] text-blu-chiaro">
          Parliamone
        </p>
        <h2 id="modulo-titolo" className="relative mt-4 font-titolo text-3xl font-semibold">
          Raccontami il tuo progetto.
        </h2>
        <p className="relative mt-3 text-[0.95rem] leading-relaxed text-tenue">
          Rispondo entro {AGENZIA.tempi.risposta} con qualche domanda e una prima idea di percorso.
          Nessun impegno, nessun venditore che richiama.
        </p>

        <div className="relative">
          <ModuloContatto />
        </div>
      </div>
    </div>
  )
}
