'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { AGENZIA } from '@/dati/agenzia'
import { MENU } from '@/dati/navigazione'
import { Marchio } from '@/componenti/layout/Marchio'
import { Icona } from '@/componenti/ui/Icona'
import { cn } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Testata
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sta sempre in alto, diventa di vetro appena la pagina si muove e mostra sul
 * bordo una riga sottile che avanza con la lettura. Su schermo stretto le voci
 * si raccolgono in un pannello a tutta pagina.
 *
 * La voce corrente non si calcola a ogni scorrimento: un osservatore segue le
 * sezioni e lo stato cambia solo quando cambia davvero la sezione in vista.
 * Il resto — vetro e barra di avanzamento — è scritto direttamente nel DOM
 * dentro un `requestAnimationFrame`, senza passare da React.
 */
export function Testata() {
  const [aperto, setAperto] = useState(false)
  const [corrente, setCorrente] = useState('')
  const testata = useRef<HTMLElement>(null)
  const avanzamento = useRef<HTMLDivElement>(null)

  /* Vetro e barra di avanzamento. */
  useEffect(() => {
    let inCoda = false

    const misura = () => {
      inCoda = false
      const alto = window.scrollY > 24
      testata.current?.classList.toggle('vetro', alto)
      testata.current?.classList.toggle('shadow-alta', alto)

      const percorribile = document.documentElement.scrollHeight - window.innerHeight
      const quota = percorribile > 0 ? window.scrollY / percorribile : 0
      if (avanzamento.current) avanzamento.current.style.transform = `scaleX(${quota.toFixed(4)})`
    }

    const programma = () => {
      if (inCoda) return
      inCoda = true
      requestAnimationFrame(misura)
    }

    misura()
    window.addEventListener('scroll', programma, { passive: true })
    window.addEventListener('resize', programma, { passive: true })
    return () => {
      window.removeEventListener('scroll', programma)
      window.removeEventListener('resize', programma)
    }
  }, [])

  /* Voce evidenziata: segue le sezioni della pagina. */
  useEffect(() => {
    const sezioni = MENU.filter((voce) => voce.ancora)
      .map((voce) => document.getElementById(voce.href.slice(1)))
      .filter((elemento): elemento is HTMLElement => elemento !== null)

    if (sezioni.length === 0 || typeof IntersectionObserver === 'undefined') return

    const osservatore = new IntersectionObserver(
      (voci) => {
        // Fra le sezioni visibili vince quella che occupa più schermo: durante
        // il passaggio fra due sezioni evita il tremolio della voce attiva.
        const visibile = voci
          .filter((voce) => voce.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visibile) setCorrente(`#${visibile.target.id}`)
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.3, 0.6] },
    )

    for (const sezione of sezioni) osservatore.observe(sezione)
    return () => osservatore.disconnect()
  }, [])

  /* Menu aperto: la pagina sotto non deve scorrere, e Esc lo chiude. */
  useEffect(() => {
    if (!aperto) return

    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const tasto = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAperto(false)
    }
    document.addEventListener('keydown', tasto)

    return () => {
      document.body.style.overflow = precedente
      document.removeEventListener('keydown', tasto)
    }
  }, [aperto])

  return (
    <>
      <a
        href="#contenuto"
        className="sr-only fixed left-4 top-4 z-[80] rounded-full bg-blu px-5 py-3 text-sm font-medium text-white focus:not-sr-only"
      >
        Vai al contenuto
      </a>

      <header
        ref={testata}
        className="fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-500"
        style={{ height: 'var(--testata)' }}
      >
        <div className="contenitore flex h-full items-center justify-between gap-6">
          <Link
            href="/#apertura"
            className="shrink-0 rounded-xl transition-opacity hover:opacity-85"
            aria-label={`${AGENZIA.nomeCompleto} — torna all'inizio`}
            data-cursore="marchio"
          >
            <Marchio />
          </Link>

          <nav aria-label="Principale" className="hidden items-center gap-1 lg:flex">
            {MENU.map((voce) => {
              const attiva = corrente === voce.href
              return (
                <a
                  key={voce.href}
                  href={voce.href}
                  aria-current={attiva ? 'true' : undefined}
                  data-cursore="voce"
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm transition-colors duration-300',
                    attiva ? 'text-testo' : 'text-tenue hover:text-testo',
                  )}
                >
                  {voce.etichetta}
                  <span
                    aria-hidden="true"
                    className={cn(
                      'absolute inset-x-3 -bottom-0.5 h-px origin-center bg-[linear-gradient(90deg,transparent,var(--blu-chiaro),var(--viola),transparent)] transition-transform duration-500',
                      attiva ? 'scale-x-100' : 'scale-x-0',
                    )}
                  />
                </a>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${AGENZIA.telefonoLink}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-tenue transition-colors hover:text-testo md:inline-flex"
            >
              <Icona nome="telefono" misura={16} />
              <span className="hidden xl:inline">{AGENZIA.telefono}</span>
              <span className="xl:hidden">Chiama</span>
            </a>

            <a
              href="#contatti"
              data-cursore="pulsante"
              className="group relative hidden overflow-hidden rounded-full px-5 py-2.5 text-sm font-medium text-white shadow-[0_8px_30px_-12px_rgb(59_130_246/.9)] transition-transform duration-300 hover:-translate-y-0.5 sm:inline-flex"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-[linear-gradient(100deg,var(--blu-cupo),var(--blu)_40%,var(--viola))]"
              />
              <span className="relative">Parliamone</span>
            </a>

            <button
              type="button"
              onClick={() => setAperto((precedente) => !precedente)}
              aria-expanded={aperto}
              aria-controls="menu-mobile"
              className="vetro relative grid h-11 w-11 place-items-center rounded-full lg:hidden"
            >
              <span className="sr-only">{aperto ? 'Chiudi il menu' : 'Apri il menu'}</span>
              <span aria-hidden="true" className="relative block h-3.5 w-5">
                <span
                  className={cn(
                    'absolute left-0 h-px w-full bg-testo transition-all duration-300',
                    aperto ? 'top-1.5 rotate-45' : 'top-0',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 top-1.5 h-px w-full bg-testo transition-opacity duration-200',
                    aperto ? 'opacity-0' : 'opacity-100',
                  )}
                />
                <span
                  className={cn(
                    'absolute left-0 h-px w-full bg-testo transition-all duration-300',
                    aperto ? 'top-1.5 -rotate-45' : 'top-3',
                  )}
                />
              </span>
            </button>
          </div>
        </div>

        {/* Avanzamento della lettura. */}
        <div
          ref={avanzamento}
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--blu),var(--viola),var(--ciano))]"
        />
      </header>

      {/* Pannello per schermi stretti. */}
      <div
        id="menu-mobile"
        hidden={!aperto}
        className="fixed inset-0 z-40 lg:hidden"
        onClick={() => setAperto(false)}
      >
        <div className="absolute inset-0 bg-fondo/92 backdrop-blur-2xl" />
        <nav
          aria-label="Menu"
          className="relative flex h-full flex-col justify-center gap-1 px-8"
          onClick={(evento) => evento.stopPropagation()}
        >
          {MENU.map((voce, indice) => (
            <a
              key={voce.href}
              href={voce.href}
              onClick={() => setAperto(false)}
              className="anima-entra group flex items-center justify-between border-b border-bordo/60 py-5 font-titolo text-3xl text-testo"
              style={{ '--ritardo': `${indice * 60}ms` } as React.CSSProperties}
            >
              {voce.etichetta}
              <Icona
                nome="freccia"
                misura={22}
                className="text-fioco transition-transform duration-300 group-hover:translate-x-1"
              />
            </a>
          ))}

          <div
            className="anima-entra mt-10 flex flex-col gap-3"
            style={{ '--ritardo': `${MENU.length * 60}ms` } as React.CSSProperties}
          >
            <a
              href={`tel:${AGENZIA.telefonoLink}`}
              className="vetro inline-flex min-h-[3rem] items-center justify-center gap-2 rounded-full px-6 text-testo"
            >
              <Icona nome="telefono" misura={17} />
              {AGENZIA.telefono}
            </a>
            <a
              href="#contatti"
              onClick={() => setAperto(false)}
              className="inline-flex min-h-[3rem] items-center justify-center rounded-full bg-[linear-gradient(100deg,var(--blu-cupo),var(--viola))] px-6 font-medium text-white"
            >
              Inizia il tuo progetto
            </a>
          </div>
        </nav>
      </div>
    </>
  )
}
