'use client'

import { useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Interruttore del tema chiaro/scuro.
 *
 * La scelta viene salvata in `localStorage`; senza scelta esplicita si segue
 * l'impostazione del sistema operativo. Lo script inserito nel documento
 * (`ScriptTema`) applica la classe prima del primo disegno, così non si vede
 * il classico lampo bianco al caricamento.
 */
export function TemaToggle({ className }: { className?: string }) {
  const [scuro, setScuro] = useState<boolean | null>(null)

  useEffect(() => {
    setScuro(document.documentElement.classList.contains('scuro'))
  }, [])

  function alterna() {
    const prossimo = !document.documentElement.classList.contains('scuro')
    document.documentElement.classList.toggle('scuro', prossimo)
    try {
      localStorage.setItem('tema', prossimo ? 'scuro' : 'chiaro')
    } catch {
      // Spazio di archiviazione non disponibile: il tema vale per questa visita.
    }
    setScuro(prossimo)
  }

  return (
    <button
      type="button"
      onClick={alterna}
      className={classi(
        'inline-flex size-10 items-center justify-center rounded-full border border-current/25',
        'transition-colors duration-300 hover:border-accento hover:text-accento',
        className,
      )}
      aria-label={scuro ? 'Passa al tema chiaro' : 'Passa al tema scuro'}
      aria-pressed={scuro ?? false}
    >
      {/* Prima dell'idratazione il valore non è noto: si mostra la luna, poi si allinea. */}
      <Icona nome={scuro ? 'sole' : 'luna'} className="size-[1.05rem]" />
    </button>
  )
}

/**
 * Script eseguito prima del disegno della pagina.
 * Va inserito una sola volta nel documento, dentro `<head>`.
 */
export function ScriptTema() {
  const codice = `(function(){try{var s=localStorage.getItem('tema');var m=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='scuro'||(!s&&m)){document.documentElement.classList.add('scuro')}}catch(e){}})()`
  return <script dangerouslySetInnerHTML={{ __html: codice }} />
}
