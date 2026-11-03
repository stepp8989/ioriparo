'use client'

import { useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Interruttore del tema.
 *
 * Qui il tema scuro è il predefinito e il chiaro è la variante — l'opposto
 * degli altri progetti del repository, perché una biglietteria cinematografica
 * si guarda quasi sempre di sera e le locandine sono fatte per il nero. Per
 * questo la classe applicata al documento è `chiaro` e non `scuro`: senza
 * nulla, si è già al buio.
 *
 * La scelta viene salvata in `localStorage` e ricordata. Lo script inserito
 * nel documento (`ScriptTema`) applica la classe prima del primo disegno, così
 * non si vede il lampo chiaro al caricamento.
 */
export function TemaToggle({ className }: { className?: string }) {
  const [chiaro, setChiaro] = useState<boolean | null>(null)

  useEffect(() => {
    setChiaro(document.documentElement.classList.contains('chiaro'))
  }, [])

  function alterna() {
    const prossimo = !document.documentElement.classList.contains('chiaro')
    document.documentElement.classList.toggle('chiaro', prossimo)
    try {
      localStorage.setItem('tema', prossimo ? 'chiaro' : 'scuro')
    } catch {
      // Spazio di archiviazione non disponibile: il tema vale per questa visita.
    }
    setChiaro(prossimo)
  }

  return (
    <button
      type="button"
      onClick={alterna}
      className={classi(
        'inline-flex size-10 items-center justify-center rounded-full border border-current/20',
        'transition-colors duration-300 hover:border-accento hover:text-accento',
        className,
      )}
      aria-label={chiaro ? 'Passa al tema scuro' : 'Passa al tema chiaro'}
      aria-pressed={chiaro ?? false}
    >
      {/* Prima dell'idratazione il valore non è noto: si mostra il sole, poi si allinea. */}
      <Icona nome={chiaro ? 'luna' : 'sole'} className="size-[1.05rem]" />
    </button>
  )
}

/**
 * Script eseguito prima del disegno della pagina.
 * Va inserito una sola volta nel documento, dentro `<head>`.
 *
 * Il tema chiaro si applica solo se qualcuno lo ha scelto esplicitamente con
 * l'interruttore: l'impostazione del sistema operativo non viene consultata.
 * È una deviazione consapevole dalla buona pratica abituale, e vale la pena
 * spiegarla, perché di solito la regola giusta è l'opposta.
 *
 * Qui il buio non è una variante estetica ma il contesto del prodotto: le
 * locandine sono composte per risaltare sul nero, l'apertura è un fondale a
 * tutto schermo, e la maggior parte delle persone consulta gli orari la sera.
 * Seguendo `prefers-color-scheme` la maggioranza — che tiene il sistema in
 * chiaro — vedrebbe la versione secondaria del progetto come se fosse quella
 * principale.
 *
 * La scelta resta comunque di chi legge, ed è per questo che l'interruttore
 * c'è, è sempre raggiungibile e la preferenza viene ricordata.
 */
export function ScriptTema() {
  const codice = `(function(){try{if(localStorage.getItem('tema')==='chiaro'){document.documentElement.classList.add('chiaro')}}catch(e){}})()`
  return <script dangerouslySetInnerHTML={{ __html: codice }} />
}
