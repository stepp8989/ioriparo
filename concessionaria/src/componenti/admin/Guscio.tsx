'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Accesso } from '@/componenti/admin/Accesso'
import { Simbolo } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Struttura del pannello di amministrazione.
 *
 * Controlla la sessione al primo caricamento e mostra la schermata di accesso
 * finché non è valida. La verifica è lato server: qui non si conserva nessuna
 * credenziale, si chiede soltanto «sono ancora dentro?».
 */

const VOCI: Array<{ percorso: string; nome: string; icona: NomeIcona }> = [
  { percorso: '/admin', nome: 'Riepilogo', icona: 'griglia' },
  { percorso: '/admin/veicoli', nome: 'Veicoli', icona: 'auto' },
  { percorso: '/admin/noleggi', nome: 'Noleggi', icona: 'chiave' },
  { percorso: '/admin/richieste', nome: 'Richieste', icona: 'chat' },
  { percorso: '/admin/appuntamenti', nome: 'Appuntamenti', icona: 'calendario' },
  { percorso: '/admin/clienti', nome: 'Clienti', icona: 'persone' },
  { percorso: '/admin/recensioni', nome: 'Recensioni', icona: 'stella' },
  { percorso: '/admin/blog', nome: 'Blog', icona: 'documento' },
  { percorso: '/admin/offerte', nome: 'Offerte', icona: 'euro' },
  { percorso: '/admin/messaggi', nome: 'Messaggi', icona: 'posta' },
  { percorso: '/admin/statistiche', nome: 'Statistiche', icona: 'grafico' },
  { percorso: '/admin/orari', nome: 'Orari', icona: 'orologio' },
]

export function Guscio({ children }: { children: ReactNode }) {
  const percorso = usePathname()
  const [stato, setStato] = useState<'verifica' | 'fuori' | 'dentro'>('verifica')
  const [menuAperto, setMenuAperto] = useState(false)

  const verifica = useCallback(async () => {
    try {
      const risposta = await fetch('/api/accesso')
      const dati = (await risposta.json()) as { autenticato?: boolean }
      setStato(dati.autenticato ? 'dentro' : 'fuori')
    } catch {
      setStato('fuori')
    }
  }, [])

  useEffect(() => {
    void verifica()
  }, [verifica])

  useEffect(() => setMenuAperto(false), [percorso])

  async function esci() {
    await fetch('/api/accesso', { method: 'DELETE' }).catch(() => undefined)
    setStato('fuori')
  }

  if (stato === 'verifica') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-sfondo text-tenue">
        <span className="inline-flex items-center gap-3 text-[0.9rem]">
          <Icona nome="orologio" className="size-4 animate-spin" />
          Un istante…
        </span>
      </div>
    )
  }

  if (stato === 'fuori') {
    return <Accesso onEntrato={() => setStato('dentro')} />
  }

  const attiva = (destinazione: string) =>
    destinazione === '/admin' ? percorso === '/admin' : percorso.startsWith(destinazione)

  const navigazione = (
    <nav aria-label="Sezioni del pannello" className="space-y-1">
      {VOCI.map((voce) => (
        <Link
          key={voce.percorso}
          href={voce.percorso}
          aria-current={attiva(voce.percorso) ? 'page' : undefined}
          className={classi(
            'flex items-center gap-3 rounded-morbido px-4 py-2.5 text-[0.9rem] transition-colors duration-300',
            attiva(voce.percorso)
              ? 'bg-accento/10 font-semibold text-accento'
              : 'text-tenue hover:bg-superficie-alt',
          )}
        >
          <Icona nome={voce.icona} className="size-4 shrink-0" />
          {voce.nome}
        </Link>
      ))}
    </nav>
  )

  return (
    <div className="min-h-screen bg-sfondo-alt">
      {/* Barra superiore */}
      <header className="sticky top-0 z-40 border-b border-bordo bg-superficie">
        <div className="flex h-16 items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMenuAperto((precedente) => !precedente)}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-bordo text-tenue lg:hidden"
              aria-label="Apri il menu"
              aria-expanded={menuAperto}
            >
              <Icona nome={menuAperto ? 'chiudi' : 'menu'} className="size-4" />
            </button>

            <Link href="/admin" className="flex items-center gap-2.5">
              <Simbolo className="size-8" />
              <span className="font-titolo text-[0.95rem] font-semibold tracking-[0.1em] uppercase">
                Pannello
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-2 rounded-full border border-bordo px-4 py-2 text-[0.82rem] text-tenue transition-colors hover:border-accento hover:text-accento sm:inline-flex"
            >
              <Icona nome="esterno" className="size-3.5" />
              Vedi il sito
            </Link>

            <TemaToggle className="size-9 text-tenue" />

            <button
              type="button"
              onClick={esci}
              className="inline-flex items-center gap-2 rounded-full border border-bordo px-4 py-2 text-[0.82rem] text-tenue transition-colors hover:border-red-500 hover:text-red-500"
            >
              <Icona nome="esci" className="size-3.5" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Colonna di navigazione */}
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-bordo bg-superficie p-5 lg:block">
          {navigazione}
        </aside>

        {/* Navigazione su schermo stretto */}
        {menuAperto && (
          <div className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-superficie p-5 lg:hidden">
            {navigazione}
          </div>
        )}

        <main className="min-w-0 flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
