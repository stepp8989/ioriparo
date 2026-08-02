'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Simbolo } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/** Voci del menù laterale, raggruppate per area di lavoro. */
const AREE: Array<{
  titolo: string
  voci: Array<{ etichetta: string; percorso: string; icona: NomeIcona }>
}> = [
  {
    titolo: 'Sala',
    voci: [
      { etichetta: 'Riepilogo', percorso: '/admin', icona: 'griglia' },
      { etichetta: 'Prenotazioni', percorso: '/admin/prenotazioni', icona: 'calendario' },
      { etichetta: 'Messaggi', percorso: '/admin/messaggi', icona: 'posta' },
    ],
  },
  {
    titolo: 'Contenuti',
    voci: [
      { etichetta: 'Menù', percorso: '/admin/menu', icona: 'posate' },
      { etichetta: 'Eventi', percorso: '/admin/eventi', icona: 'campanella' },
      { etichetta: 'Recensioni', percorso: '/admin/recensioni', icona: 'stellaVuota' },
    ],
  },
  {
    titolo: 'Impostazioni',
    voci: [{ etichetta: 'Orari', percorso: '/admin/orari', icona: 'orologio' }],
  },
]

/**
 * Struttura del pannello: menù laterale fisso su schermi grandi, a scomparsa
 * su telefono. Non riusa l'intestazione del sito perché qui servono densità e
 * navigazione rapida, non l'effetto scenico.
 */
export function Guscio({
  children,
  contatori,
}: {
  children: React.ReactNode
  /** Numeri mostrati accanto alle voci: prenotazioni e messaggi da vedere. */
  contatori: { prenotazioni: number; messaggi: number }
}) {
  const percorso = usePathname()
  const router = useRouter()
  const [aperto, setAperto] = useState(false)

  async function esci() {
    await fetch('/api/accesso', { method: 'DELETE' })
    router.refresh()
  }

  const badge: Record<string, number> = {
    '/admin/prenotazioni': contatori.prenotazioni,
    '/admin/messaggi': contatori.messaggi,
  }

  const navigazione = (
    <nav aria-label="Sezioni del pannello" className="flex-1 overflow-y-auto px-4 py-6">
      {AREE.map((area) => (
        <div key={area.titolo} className="mb-7 last:mb-0">
          <p className="mb-2 px-3 text-[0.6rem] font-medium uppercase tracking-[0.24em] text-tenue">
            {area.titolo}
          </p>

          <ul className="space-y-0.5">
            {area.voci.map((voce) => {
              const attiva =
                voce.percorso === '/admin' ? percorso === '/admin' : percorso.startsWith(voce.percorso)
              const conteggio = badge[voce.percorso] ?? 0

              return (
                <li key={voce.percorso}>
                  <Link
                    href={voce.percorso}
                    onClick={() => setAperto(false)}
                    aria-current={attiva ? 'page' : undefined}
                    className={classi(
                      'flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors duration-200',
                      attiva
                        ? 'bg-accento/12 font-medium text-accento'
                        : 'text-tenue hover:bg-superficie-alt hover:text-testo',
                    )}
                  >
                    <Icona nome={voce.icona} className="size-[1.05rem] shrink-0" />
                    {voce.etichetta}

                    {conteggio > 0 && (
                      <span className="ml-auto grid min-w-6 place-items-center rounded-full bg-accento px-1.5 py-0.5 text-[0.65rem] font-medium text-white scuro:text-notte">
                        {conteggio}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )

  return (
    <div className="flex min-h-screen bg-sfondo">
      {/* Menù laterale su schermi grandi */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-bordo bg-superficie lg:flex">
        <Intestazione />
        {navigazione}
        <PiedeLaterale onEsci={esci} />
      </aside>

      {/* Menù a scomparsa su telefono e tablet */}
      {aperto && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-notte/60" onClick={() => setAperto(false)} aria-hidden />
          <aside className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-bordo bg-superficie">
            <Intestazione />
            {navigazione}
            <PiedeLaterale onEsci={esci} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:ml-64">
        {/* Barra superiore */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-bordo bg-sfondo/90 px-5 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setAperto(true)}
            className="lg:hidden"
            aria-label="Apri il menù del pannello"
          >
            <Icona nome="menu" className="size-6" />
          </button>

          <p className="font-titolo text-xl">Pannello di gestione</p>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-tenue transition-colors hover:text-accento"
            >
              <Icona nome="esterno" className="size-4" />
              <span className="hidden sm:inline">Vedi il sito</span>
            </a>
            <TemaToggle />
          </div>
        </header>

        <main className="flex-1 px-5 py-8 sm:px-8">{children}</main>
      </div>
    </div>
  )
}

function Intestazione() {
  return (
    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-bordo px-6">
      <Simbolo className="size-7 text-accento" />
      <span className="font-titolo text-lg tracking-[0.18em] uppercase">Aurea</span>
    </div>
  )
}

function PiedeLaterale({ onEsci }: { onEsci: () => void }) {
  return (
    <div className="shrink-0 border-t border-bordo p-4">
      <button
        type="button"
        onClick={onEsci}
        className="flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm text-tenue transition-colors hover:bg-superficie-alt hover:text-testo"
      >
        <Icona nome="esci" className="size-[1.05rem]" />
        Esci dal pannello
      </button>
    </div>
  )
}
