'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Finestra di dialogo.
 *
 * Usa l'elemento nativo `<dialog>`: il browser si occupa da solo del fondale,
 * del confinamento del fuoco dentro la finestra e della chiusura con Esc —
 * tre cose che le finestre costruite a mano quasi sempre sbagliano.
 *
 * L'unico accorgimento necessario è chiudere anche al clic sul fondale, che
 * `<dialog>` non fa da sé: si confronta il punto del clic con il riquadro
 * della finestra, perché l'evento sul fondale ha comunque il dialogo come
 * bersaglio.
 */
export function Finestra({
  aperta,
  onChiudi,
  titolo,
  children,
}: {
  aperta: boolean
  onChiudi: () => void
  titolo: string
  children: ReactNode
}) {
  const riferimento = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialogo = riferimento.current
    if (!dialogo) return

    if (aperta && !dialogo.open) dialogo.showModal()
    if (!aperta && dialogo.open) dialogo.close()
  }, [aperta])

  useEffect(() => {
    if (!aperta) return
    const precedente = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = precedente
    }
  }, [aperta])

  return (
    <dialog
      ref={riferimento}
      onClose={onChiudi}
      onClick={(evento) => {
        const riquadro = evento.currentTarget.getBoundingClientRect()
        const fuori =
          evento.clientX < riquadro.left ||
          evento.clientX > riquadro.right ||
          evento.clientY < riquadro.top ||
          evento.clientY > riquadro.bottom
        if (fuori) onChiudi()
      }}
      aria-label={titolo}
      className="m-auto w-[calc(100vw-2rem)] max-w-2xl rounded-ampio border border-bordo bg-sfondo p-0 text-testo shadow-rilievo backdrop:bg-notte/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex items-center justify-between gap-4 border-b border-bordo px-6 py-5">
        <h2 className="font-titolo text-[1.15rem] font-semibold">{titolo}</h2>
        <button
          type="button"
          onClick={onChiudi}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-accento hover:text-accento"
          aria-label="Chiudi"
        >
          <Icona nome="chiudi" />
        </button>
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-6 py-6">{children}</div>
    </dialog>
  )
}
