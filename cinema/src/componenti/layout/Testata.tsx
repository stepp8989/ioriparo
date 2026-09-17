'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Marchio } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { RicercaGlobale } from '@/componenti/layout/RicercaGlobale'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import type { VoceMenu } from '@/dati/navigazione'
import { classi } from '@/lib/utili'

/**
 * Intestazione fissa.
 *
 * Tre comportamenti che vale la pena guardare da vicino:
 *
 *   — il fondo diventa opaco dopo i primi pixel di scorrimento, perché sopra
 *     l'apertura a tutta pagina l'intestazione deve sparire dentro
 *     l'immagine, e sul resto del sito deve invece staccarsi dal contenuto;
 *   — il menu mobile blocca lo scorrimento del corpo mentre è aperto, e lo
 *     ripristina al valore che aveva prima, non a `visible`: se la pagina
 *     sotto aveva già un vincolo, deve riaverlo;
 *   — la voce corrente è marcata con `aria-current`, non solo con un colore:
 *     è l'unico modo perché chi non vede il colore sappia dov'è.
 */
export function Testata({
  nome,
  claim,
  menu,
  collegato,
}: {
  nome: string
  claim: string
  menu: VoceMenu[]
  /** Vero quando c'è una sessione cliente attiva: cambia l'ultimo pulsante. */
  collegato: boolean
}) {
  const [scorso, setScorso] = useState(false)
  const [apertoMobile, setApertoMobile] = useState(false)
  const [ricercaAperta, setRicercaAperta] = useState(false)
  const percorso = usePathname()

  useEffect(() => {
    const allo = () => setScorso(window.scrollY > 24)
    allo()
    window.addEventListener('scroll', allo, { passive: true })
    return () => window.removeEventListener('scroll', allo)
  }, [])

  // Cambio pagina: il menu mobile va chiuso, altrimenti resta aperto sopra la
  // pagina nuova.
  useEffect(() => {
    setApertoMobile(false)
    setRicercaAperta(false)
  }, [percorso])

  useEffect(() => {
    if (!apertoMobile) return
    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = precedente
    }
  }, [apertoMobile])

  const attiva = (href: string) =>
    href === '/' ? percorso === '/' : percorso.startsWith(href.split('?')[0])

  return (
    <>
      {/* Salto al contenuto: la prima cosa che incontra chi naviga da tastiera. */}
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accento focus:px-5 focus:py-3 focus:text-white"
      >
        Salta al contenuto
      </a>

      <header
        className={classi(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scorso ? 'vetro shadow-morbida' : 'bg-transparent',
        )}
      >
        <div className="contenitore flex h-[4.5rem] items-center justify-between gap-4">
          <Marchio nome={nome} claim={claim} compatto={scorso} />

          <nav aria-label="Navigazione principale" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {menu.map((voce) => (
                <li key={voce.href}>
                  <Link
                    href={voce.href}
                    aria-current={attiva(voce.href) ? 'page' : undefined}
                    className={classi(
                      'rounded-full px-3.5 py-2 text-[0.85rem] font-medium transition-colors duration-300',
                      attiva(voce.href)
                        ? 'text-accento'
                        : 'text-tenue hover:bg-superficie-alt hover:text-testo',
                    )}
                  >
                    {voce.etichetta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden w-64 2xl:block">
              <RicercaGlobale compatta />
            </div>

            <button
              type="button"
              onClick={() => setRicercaAperta((precedente) => !precedente)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-current/20 text-tenue transition-colors hover:border-accento hover:text-accento 2xl:hidden"
              aria-label="Apri la ricerca"
              aria-expanded={ricercaAperta}
            >
              <Icona nome="cerca" className="size-[1.05rem]" />
            </button>

            <TemaToggle className="hidden text-tenue sm:inline-flex" />

            <Bottone
              href="/area-personale"
              variante={collegato ? 'tenue' : 'pieno'}
              misura="piccola"
              className="hidden sm:inline-flex"
            >
              <Icona nome="utente" className="size-4" />
              {collegato ? 'My Cinema' : 'Accedi'}
            </Bottone>

            <button
              type="button"
              onClick={() => setApertoMobile(true)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-current/20 text-tenue transition-colors hover:border-accento hover:text-accento xl:hidden"
              aria-label="Apri il menu"
              aria-expanded={apertoMobile}
            >
              <Icona nome="menu" className="size-5" />
            </button>
          </div>
        </div>

        {ricercaAperta && (
          <div className="border-t border-bordo bg-sfondo px-5 py-3 2xl:hidden">
            <RicercaGlobale compatta />
          </div>
        )}
      </header>

      {/* ── Menu mobile ───────────────────────────────────────────────────── */}
      <div
        className={classi(
          'fixed inset-0 z-[60] xl:hidden',
          apertoMobile ? 'visible' : 'invisible pointer-events-none',
        )}
        aria-hidden={!apertoMobile}
      >
        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          onClick={() => setApertoMobile(false)}
          className={classi(
            'absolute inset-0 bg-notte/75 backdrop-blur-sm transition-opacity duration-400',
            apertoMobile ? 'opacity-100' : 'opacity-0',
          )}
        />

        <nav
          aria-label="Navigazione principale"
          className={classi(
            'absolute inset-y-0 right-0 flex w-[min(24rem,88vw)] flex-col bg-sfondo shadow-rilievo',
            'transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            apertoMobile ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-bordo px-5 py-4">
            <Marchio nome={nome} compatto />
            <button
              type="button"
              onClick={() => setApertoMobile(false)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
              aria-label="Chiudi il menu"
            >
              <Icona nome="chiudi" />
            </button>
          </div>

          <ul className="flex-1 overflow-y-auto p-3">
            {menu.map((voce) => (
              <li key={voce.href}>
                <Link
                  href={voce.href}
                  aria-current={attiva(voce.href) ? 'page' : undefined}
                  className={classi(
                    'block rounded-tenue px-4 py-3.5 transition-colors',
                    attiva(voce.href) ? 'bg-accento/10 text-accento' : 'hover:bg-superficie-alt',
                  )}
                >
                  <span className="block text-[0.98rem] font-medium">{voce.etichetta}</span>
                  {voce.descrizione && (
                    <span className="mt-0.5 block text-[0.8rem] text-tenue">
                      {voce.descrizione}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-bordo p-5">
            <Bottone href="/area-personale" className="w-full" misura="normale">
              <Icona nome="utente" className="size-4" />
              {collegato ? 'La mia area personale' : 'Accedi o registrati'}
            </Bottone>
            <div className="flex items-center justify-between">
              <span className="text-[0.82rem] text-tenue">Aspetto</span>
              <TemaToggle className="text-tenue" />
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}
