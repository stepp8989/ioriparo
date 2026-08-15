'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Marchio } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA } from '@/dati/azienda'
import { NAVIGAZIONE } from '@/dati/navigazione'
import { classi } from '@/lib/utili'

/**
 * Intestazione fissa.
 *
 * In cima alla pagina è trasparente, così l'apertura a schermo intero resta
 * intera davvero; appena si scorre diventa una barra di vetro smerigliato.
 * Il menu su schermo stretto è un pannello a tutta altezza, chiuso dal tasto
 * Esc e da qualsiasi cambio di pagina.
 */
export function Testata() {
  const percorso = usePathname()
  const [scorsa, setScorsa] = useState(false)
  const [aperto, setAperto] = useState(false)

  // La trasparenza dipende dalla posizione: si ascolta lo scorrimento in modo
  // passivo, senza mai bloccare il thread principale.
  useEffect(() => {
    const aggiorna = () => setScorsa(window.scrollY > 24)
    aggiorna()
    window.addEventListener('scroll', aggiorna, { passive: true })
    return () => window.removeEventListener('scroll', aggiorna)
  }, [])

  // Cambiando pagina il pannello va chiuso, altrimenti resterebbe aperto sopra
  // il contenuto nuovo.
  useEffect(() => setAperto(false), [percorso])

  // Con il pannello aperto la pagina sotto non deve scorrere.
  useEffect(() => {
    if (!aperto) return

    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const allaTastiera = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAperto(false)
    }
    window.addEventListener('keydown', allaTastiera)

    return () => {
      document.body.style.overflow = precedente
      window.removeEventListener('keydown', allaTastiera)
    }
  }, [aperto])

  /** Una voce è attiva anche quando si è dentro una sua sottopagina. */
  const attiva = (destinazione: string) =>
    percorso === destinazione || percorso.startsWith(`${destinazione}/`)

  return (
    <>
      <header
        className={classi(
          'fixed inset-x-0 top-0 z-50 transition-all duration-500',
          scorsa ? 'vetro shadow-morbida' : 'bg-transparent',
        )}
      >
        <div className="contenitore flex h-20 items-center justify-between gap-6">
          <Marchio chiaro={!scorsa} compatto />

          <nav aria-label="Navigazione principale" className="hidden items-center gap-1 lg:flex">
            {NAVIGAZIONE.filter((voce) => voce.principale).map((voce) => (
              <Link
                key={voce.percorso}
                href={voce.percorso}
                aria-current={attiva(voce.percorso) ? 'page' : undefined}
                className={classi(
                  'rounded-full px-4 py-2 text-[0.9rem] font-medium transition-colors duration-300',
                  scorsa ? 'text-tenue hover:text-accento' : 'text-white/75 hover:text-white',
                  attiva(voce.percorso) && (scorsa ? 'text-accento' : 'text-white'),
                )}
              >
                {voce.nome}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${AZIENDA.telefonoLink}`}
              className={classi(
                'hidden size-10 items-center justify-center rounded-full border border-current/20 transition-colors duration-300 hover:border-accento hover:text-accento sm:inline-flex',
                scorsa ? 'text-tenue' : 'text-white/80',
              )}
              aria-label={`Telefona al ${AZIENDA.telefono}`}
            >
              <Icona nome="telefono" className="size-[1.05rem]" />
            </a>

            <TemaToggle className={scorsa ? 'text-tenue' : 'text-white/80'} />

            <Link
              href="/area-clienti"
              className={classi(
                'hidden size-10 items-center justify-center rounded-full border border-current/20 transition-colors duration-300 hover:border-accento hover:text-accento sm:inline-flex',
                scorsa ? 'text-tenue' : 'text-white/80',
              )}
              aria-label="Area clienti"
            >
              <Icona nome="utente" className="size-[1.05rem]" />
            </Link>

            <Bottone
              href="/contatti#preventivo"
              misura="piccola"
              variante={scorsa ? 'pieno' : 'vetro'}
              className="hidden md:inline-flex"
            >
              Richiedi preventivo
            </Bottone>

            <button
              type="button"
              onClick={() => setAperto(true)}
              className={classi(
                'inline-flex size-10 items-center justify-center rounded-full border border-current/20 transition-colors duration-300 lg:hidden',
                scorsa ? 'text-testo' : 'text-white',
              )}
              aria-label="Apri il menu"
              aria-expanded={aperto}
            >
              <Icona nome="menu" />
            </button>
          </div>
        </div>
      </header>

      {/* Pannello di navigazione su schermo stretto. */}
      <div
        className={classi(
          'fixed inset-0 z-[60] lg:hidden',
          aperto ? 'pointer-events-auto' : 'pointer-events-none',
        )}
        aria-hidden={!aperto}
      >
        <button
          type="button"
          tabIndex={aperto ? 0 : -1}
          onClick={() => setAperto(false)}
          className={classi(
            'absolute inset-0 bg-notte/70 backdrop-blur-sm transition-opacity duration-400',
            aperto ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Chiudi il menu"
        />

        <div
          className={classi(
            'absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-sfondo shadow-rilievo transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            aperto ? 'translate-x-0' : 'translate-x-full',
          )}
        >
          <div className="flex h-20 items-center justify-between border-b border-bordo px-6">
            <Marchio compatto />
            <button
              type="button"
              tabIndex={aperto ? 0 : -1}
              onClick={() => setAperto(false)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-bordo text-testo transition-colors hover:border-accento hover:text-accento"
              aria-label="Chiudi il menu"
            >
              <Icona nome="chiudi" />
            </button>
          </div>

          <nav aria-label="Navigazione" className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-1">
              {NAVIGAZIONE.map((voce) => (
                <li key={voce.percorso}>
                  <Link
                    href={voce.percorso}
                    tabIndex={aperto ? 0 : -1}
                    aria-current={attiva(voce.percorso) ? 'page' : undefined}
                    className={classi(
                      'block rounded-morbido px-4 py-3 transition-colors duration-300',
                      attiva(voce.percorso)
                        ? 'bg-accento/10 text-accento'
                        : 'text-testo hover:bg-superficie-alt',
                    )}
                  >
                    <span className="block text-[1.05rem] font-semibold">{voce.nome}</span>
                    <span className="mt-0.5 block text-[0.8rem] text-tenue">{voce.descrizione}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-bordo px-6 py-6">
            <Bottone href="/contatti#preventivo" className="w-full" tabIndex={aperto ? 0 : -1}>
              Richiedi preventivo
            </Bottone>
            <Bottone
              href="/area-clienti"
              variante="contorno"
              className="w-full"
              tabIndex={aperto ? 0 : -1}
            >
              <Icona nome="utente" className="size-4" />
              Area clienti
            </Bottone>
            <a
              href={`tel:${AZIENDA.telefonoLink}`}
              tabIndex={aperto ? 0 : -1}
              className="flex items-center justify-center gap-2 py-2 text-[0.9rem] text-tenue transition-colors hover:text-accento"
            >
              <Icona nome="telefono" className="size-4" />
              {AZIENDA.telefono}
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
