'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Marchio } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { RISTORANTE } from '@/dati/ristorante'
import { classi } from '@/lib/utili'

/** Voci del menù principale, condivise fra versione desktop e mobile. */
const VOCI = [
  { etichetta: 'Home', percorso: '/' },
  { etichetta: 'Menù', percorso: '/menu' },
  { etichetta: 'Chi siamo', percorso: '/chi-siamo' },
  { etichetta: 'Galleria', percorso: '/galleria' },
  { etichetta: 'Contatti', percorso: '/contatti' },
]

/**
 * Intestazione fissa.
 *
 * Sulla home resta trasparente sopra l'immagine di apertura e diventa opaca
 * appena si scorre; sulle altre pagine è opaca fin da subito, perché sotto non
 * c'è nessuna fotografia a fare da sfondo.
 */
export function Testata() {
  const percorso = usePathname()
  const inHome = percorso === '/'
  const [scorso, setScorso] = useState(false)
  const [apertoMobile, setApertoMobile] = useState(false)
  const menoMovimento = useReducedMotion()

  useEffect(() => {
    const aggiorna = () => setScorso(window.scrollY > 24)
    aggiorna()
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => window.removeEventListener('scroll', aggiorna)
  }, [])

  // Il menù mobile si chiude cambiando pagina.
  useEffect(() => setApertoMobile(false), [percorso])

  // Con il menù mobile aperto la pagina sotto non deve scorrere.
  useEffect(() => {
    document.body.style.overflow = apertoMobile ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [apertoMobile])

  const compatta = scorso || !inHome
  const suFoto = inHome && !scorso

  return (
    <>
      <header
        className={classi(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] no-stampa',
          compatta
            ? 'border-b border-bordo/70 bg-sfondo/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div
          className={classi(
            'contenitore flex items-center justify-between transition-all duration-500',
            compatta ? 'h-[4.5rem]' : 'h-24',
          )}
        >
          <Link
            href="/"
            className={classi('shrink-0 transition-colors', suFoto ? 'text-white' : 'text-testo')}
            aria-label={`${RISTORANTE.nomeCompleto}, torna alla home`}
          >
            <Marchio />
          </Link>

          {/* Navigazione da tablet in su */}
          <nav aria-label="Navigazione principale" className="hidden lg:block">
            <ul className="flex items-center gap-9">
              {VOCI.map((voce) => {
                const attiva =
                  voce.percorso === '/' ? percorso === '/' : percorso.startsWith(voce.percorso)
                return (
                  <li key={voce.percorso}>
                    <Link
                      href={voce.percorso}
                      aria-current={attiva ? 'page' : undefined}
                      className={classi(
                        'sottolinea text-[0.72rem] font-medium uppercase tracking-[0.2em] transition-colors duration-300',
                        suFoto ? 'text-white/85 hover:text-white' : 'text-testo hover:text-accento',
                        attiva && (suFoto ? 'text-white' : 'text-accento'),
                      )}
                    >
                      {voce.etichetta}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`tel:${RISTORANTE.telefonoLink}`}
              className={classi(
                'hidden items-center gap-2 text-[0.72rem] font-medium tracking-[0.12em] transition-colors xl:inline-flex',
                suFoto ? 'text-white/85 hover:text-white' : 'text-tenue hover:text-accento',
              )}
            >
              <Icona nome="telefono" className="size-4" />
              {RISTORANTE.telefono}
            </a>

            <TemaToggle className={suFoto ? 'text-white' : 'text-testo'} />

            {/*
              L'alternanza mostra/nascondi sta sul contenitore, non sul
              pulsante: `Bottone` porta già una classe `display` fra quelle di
              base e due utilità dello stesso gruppo si contenderebbero la
              precedenza a seconda dell'ordine nel foglio di stile.
            */}
            <span className="hidden sm:block">
              <Bottone href="/prenota" variante={suFoto ? 'chiaro' : 'pieno'}>
                Prenota un tavolo
              </Bottone>
            </span>

            <button
              type="button"
              onClick={() => setApertoMobile(true)}
              className={classi(
                'inline-flex size-10 items-center justify-center lg:hidden',
                suFoto ? 'text-white' : 'text-testo',
              )}
              aria-label="Apri il menù di navigazione"
              aria-expanded={apertoMobile}
              aria-controls="menu-mobile"
            >
              <Icona nome="menu" className="size-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Pannello di navigazione a tutto schermo su telefono e tablet */}
      <AnimatePresence>
        {apertoMobile && (
          <motion.div
            id="menu-mobile"
            className="fixed inset-0 z-[60] lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: menoMovimento ? 0.01 : 0.3 }}
          >
            <div
              className="absolute inset-0 bg-notte/70 backdrop-blur-sm"
              onClick={() => setApertoMobile(false)}
              aria-hidden
            />

            <motion.nav
              aria-label="Navigazione principale"
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-sfondo px-7 py-7 shadow-rilievo"
              initial={{ x: menoMovimento ? 0 : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: menoMovimento ? 0 : '100%' }}
              transition={{ duration: menoMovimento ? 0.01 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-center justify-between">
                <Marchio />
                <button
                  type="button"
                  onClick={() => setApertoMobile(false)}
                  className="inline-flex size-10 items-center justify-center text-testo"
                  aria-label="Chiudi il menù"
                  autoFocus
                >
                  <Icona nome="chiudi" className="size-6" />
                </button>
              </div>

              <ul className="mt-12 flex flex-col gap-1">
                {VOCI.map((voce, indice) => (
                  <motion.li
                    key={voce.percorso}
                    initial={menoMovimento ? false : { opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 + indice * 0.06, duration: 0.4 }}
                  >
                    <Link
                      href={voce.percorso}
                      className="block border-b border-bordo py-4 font-titolo text-3xl transition-colors hover:text-accento"
                    >
                      {voce.etichetta}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              <div className="mt-auto space-y-3 pt-8">
                <Bottone href="/prenota" className="w-full" misura="grande">
                  Prenota un tavolo
                </Bottone>
                <a
                  href={`tel:${RISTORANTE.telefonoLink}`}
                  className="flex items-center justify-center gap-2 py-3 text-sm text-tenue transition-colors hover:text-accento"
                >
                  <Icona nome="telefono" className="size-4" />
                  {RISTORANTE.telefono}
                </a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
