'use client'

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Avvisi temporanei.
 *
 * Servono per i riscontri brevi: «posti aggiunti», «codice non valido»,
 * «copiato». Non sostituiscono i messaggi di errore dentro i moduli, che
 * devono restare accanto al campo sbagliato: un avviso che scompare dopo
 * quattro secondi è inutilizzabile da chi sta ancora leggendo.
 *
 * La regione ha `aria-live="polite"`: gli screen reader annunciano l'avviso
 * senza interrompere quello che stanno leggendo.
 */

type Tono = 'neutro' | 'ok' | 'errore'

type Avviso = { id: number; testo: string; tono: Tono }

type Contesto = {
  mostra: (testo: string, tono?: Tono) => void
}

const ContestoAvvisi = createContext<Contesto | null>(null)

export function FornitoreAvvisi({ children }: { children: ReactNode }) {
  const [avvisi, setAvvisi] = useState<Avviso[]>([])

  const mostra = useCallback((testo: string, tono: Tono = 'neutro') => {
    const id = Date.now() + Math.random()
    setAvvisi((precedenti) => [...precedenti, { id, testo, tono }])
    // Gli errori restano più a lungo: c'è da leggerli e spesso da agire.
    window.setTimeout(
      () => setAvvisi((precedenti) => precedenti.filter((voce) => voce.id !== id)),
      tono === 'errore' ? 6500 : 4000,
    )
  }, [])

  const valore = useMemo(() => ({ mostra }), [mostra])

  const TONI: Record<Tono, string> = {
    neutro: 'border-bordo-forte bg-superficie text-testo',
    ok: 'border-ok/40 bg-superficie text-testo',
    errore: 'border-errore/50 bg-superficie text-testo',
  }

  const ICONE = { neutro: 'info', ok: 'spunta', errore: 'avviso' } as const

  return (
    <ContestoAvvisi.Provider value={valore}>
      {children}

      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[70] flex flex-col items-center gap-2 p-4 sm:items-end"
        aria-live="polite"
        aria-atomic="false"
      >
        {avvisi.map((avviso) => (
          <div
            key={avviso.id}
            className={classi(
              'avviso pointer-events-auto flex max-w-sm items-start gap-3 rounded-morbido border px-4 py-3 shadow-rilievo',
              TONI[avviso.tono],
            )}
          >
            <Icona
              nome={ICONE[avviso.tono]}
              className={classi(
                'mt-0.5 size-4 shrink-0',
                avviso.tono === 'ok' && 'text-ok',
                avviso.tono === 'errore' && 'text-errore',
              )}
            />
            <p className="text-[0.88rem] leading-snug">{avviso.testo}</p>
          </div>
        ))}
      </div>
    </ContestoAvvisi.Provider>
  )
}

/**
 * Restituisce la funzione per mostrare un avviso.
 *
 * Fuori dal fornitore non solleva un'eccezione: restituisce una funzione che
 * scrive in console. Un componente riusabile non deve rompersi solo perché è
 * stato montato in un contesto — per esempio il pannello — che non ha gli
 * avvisi.
 */
export function useAvvisi(): Contesto {
  const contesto = useContext(ContestoAvvisi)
  return (
    contesto ?? {
      mostra: (testo) => console.info('[avviso]', testo),
    }
  )
}
