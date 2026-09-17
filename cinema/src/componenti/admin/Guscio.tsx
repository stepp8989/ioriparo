'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { NAVIGAZIONE_ADMIN } from '@/componenti/admin/navigazione'
import { Marchio } from '@/componenti/layout/Marchio'
import { TemaToggle } from '@/componenti/layout/TemaToggle'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Nota } from '@/componenti/ui/Sezione'
import { Campo } from '@/componenti/ui/campi'
import { classi } from '@/lib/utili'

/**
 * Guscio del pannello di amministrazione.
 *
 * Fa da custode: finché la sessione non è verificata non disegna nulla del
 * pannello, nemmeno la struttura. È una difesa di comodo, non di sostanza — la
 * sostanza è che ogni rotta API controlla la sessione per conto proprio — ma
 * evita di mostrare la forma dei dati a chi non deve vederla.
 *
 * Il livello «maschera» vede solo la verifica dei biglietti: è il tablet
 * appoggiato alla porta della sala, e non deve poter arrivare all'anagrafica
 * dei clienti o alla programmazione.
 */

type Stato = {
  livello: 'gestione' | 'maschera' | null
  configurato: boolean
}

export function Guscio({ children }: { children: ReactNode }) {
  const percorso = usePathname()
  const router = useRouter()

  const [stato, setStato] = useState<Stato | null>(null)
  const [apertoMobile, setApertoMobile] = useState(false)

  const controlla = useCallback(async () => {
    try {
      const risposta = await fetch('/api/accesso', { cache: 'no-store' })
      setStato((await risposta.json()) as Stato)
    } catch {
      setStato({ livello: null, configurato: false })
    }
  }, [])

  useEffect(() => {
    void controlla()
  }, [controlla])

  useEffect(() => {
    setApertoMobile(false)
  }, [percorso])

  async function esci() {
    await fetch('/api/accesso', { method: 'DELETE' })
    setStato({ livello: null, configurato: stato?.configurato ?? true })
    router.push('/admin')
  }

  if (!stato) {
    return (
      <div className="contenitore flex min-h-screen items-center justify-center">
        <Scheletro className="h-40 w-full max-w-md rounded-ampio" />
      </div>
    )
  }

  if (!stato.livello) {
    return <Accesso configurato={stato.configurato} onAccesso={controlla} />
  }

  // La maschera non ha una barra laterale: ha una sola schermata, e ogni voce
  // in più sarebbe una porta da tenere chiusa.
  if (stato.livello === 'maschera') {
    return (
      <div className="min-h-screen bg-sfondo">
        <header className="border-b border-bordo px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="inline-flex items-center gap-2 font-titolo font-semibold">
              <Icona nome="qr" className="size-5 text-accento" />
              Verifica biglietti
            </span>
            <Bottone variante="tenue" misura="piccola" onClick={esci}>
              <Icona nome="esci" className="size-4" />
              Esci
            </Bottone>
          </div>
        </header>
        <main className="contenitore py-8">{children}</main>
      </div>
    )
  }

  const gruppi = NAVIGAZIONE_ADMIN

  return (
    <div className="flex min-h-screen bg-sfondo">
      {/* ── Barra laterale ──────────────────────────────────────────────── */}
      <aside
        className={classi(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-bordo bg-superficie',
          'transition-transform duration-300 lg:static lg:translate-x-0',
          apertoMobile ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center justify-between border-b border-bordo px-5 py-4">
          <Marchio nome="Pannello" href="/admin" compatto />
          <button
            type="button"
            onClick={() => setApertoMobile(false)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue lg:hidden"
            aria-label="Chiudi il menu"
          >
            <Icona nome="chiudi" className="size-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3" aria-label="Sezioni del pannello">
          {gruppi.map((gruppo) => (
            <div key={gruppo.titolo} className="mb-5">
              <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-tenue">
                {gruppo.titolo}
              </p>
              <ul className="space-y-0.5">
                {gruppo.voci.map((voce) => {
                  const attiva =
                    voce.href === '/admin' ? percorso === '/admin' : percorso.startsWith(voce.href)

                  return (
                    <li key={voce.href}>
                      <Link
                        href={voce.href}
                        aria-current={attiva ? 'page' : undefined}
                        className={classi(
                          'flex items-center gap-2.5 rounded-tenue px-3 py-2.5 text-[0.88rem] transition-colors',
                          attiva
                            ? 'bg-accento/12 font-medium text-accento'
                            : 'text-tenue hover:bg-superficie-alt hover:text-testo',
                        )}
                      >
                        <Icona nome={voce.icona} className="size-4 shrink-0" />
                        {voce.etichetta}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="space-y-2 border-t border-bordo p-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-tenue px-3 py-2 text-[0.84rem] text-tenue transition-colors hover:text-accento"
          >
            <Icona nome="esterno" className="size-4" />
            Vedi il sito
          </Link>
          <div className="flex items-center justify-between px-3 py-1">
            <span className="text-[0.82rem] text-tenue">Aspetto</span>
            <TemaToggle className="text-tenue" />
          </div>
          <button
            type="button"
            onClick={esci}
            className="flex w-full items-center gap-2 rounded-tenue px-3 py-2 text-[0.84rem] text-tenue transition-colors hover:text-errore"
          >
            <Icona nome="esci" className="size-4" />
            Esci dal pannello
          </button>
        </div>
      </aside>

      {apertoMobile && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          onClick={() => setApertoMobile(false)}
          className="fixed inset-0 z-40 bg-notte/60 lg:hidden"
        />
      )}

      {/* ── Contenuto ───────────────────────────────────────────────────── */}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-bordo bg-sfondo/90 px-5 py-3 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setApertoMobile(true)}
            className="inline-flex size-9 items-center justify-center rounded-full border border-bordo text-tenue"
            aria-label="Apri il menu"
          >
            <Icona nome="menu" className="size-4" />
          </button>
          <span className="font-titolo font-semibold">Pannello</span>
        </header>

        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

/* ── Accesso ─────────────────────────────────────────────────────────────── */

function Accesso({ configurato, onAccesso }: { configurato: boolean; onAccesso: () => void }) {
  const [password, setPassword] = useState('')
  const [errore, setErrore] = useState('')
  const [invio, setInvio] = useState(false)

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    setInvio(true)
    setErrore('')

    try {
      const risposta = await fetch('/api/accesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const esito = await risposta.json()
      if (!risposta.ok) {
        setErrore(esito.errore ?? 'Accesso non riuscito.')
        return
      }

      onAccesso()
    } catch {
      setErrore('Connessione non riuscita.')
    } finally {
      setInvio(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Marchio nome="Pannello" href="/admin" className="justify-center" />
          <p className="mt-3 text-[0.9rem] text-tenue">Accesso riservato al personale.</p>
        </div>

        {!configurato && (
          <Nota tono="ambra" className="mb-6" icona={<Icona nome="avviso" className="size-4" />}>
            Il pannello non è configurato: servono <code>PANNELLO_PASSWORD</code> e{' '}
            <code>PANNELLO_SEGRETO</code> fra le variabili d’ambiente. Vedi{' '}
            <code>.env.example</code>.
          </Nota>
        )}

        {errore && (
          <Nota tono="rosso" className="mb-6" icona={<Icona nome="avviso" className="size-4" />}>
            {errore}
          </Nota>
        )}

        <form onSubmit={invia} className="space-y-5">
          <Campo
            etichetta="Password"
            type="password"
            icona="lucchetto"
            richiesto
            autoFocus
            value={password}
            onChange={(evento) => setPassword(evento.target.value)}
            autoComplete="current-password"
          />

          <Bottone type="submit" disabled={invio || !configurato} className="w-full" misura="grande">
            {invio ? 'Verifica…' : 'Entra'}
          </Bottone>
        </form>

        <p className="mt-6 text-center text-[0.8rem] text-tenue">
          Al personale di sala serve la password ridotta: dà accesso alla sola verifica dei
          biglietti.
        </p>
      </div>
    </div>
  )
}
