'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pulsante, TestataPagina } from '@/componenti/admin/campi'
import { Icona } from '@/componenti/ui/Icona'
import type { Messaggio } from '@/lib/tipi'
import { classi, dataEstesa } from '@/lib/utili'

/** Messaggi arrivati dal modulo contatti del sito. */
export function GestioneMessaggi({ messaggi }: { messaggi: Messaggio[] }) {
  const router = useRouter()
  const [soloDaLeggere, setSoloDaLeggere] = useState(false)

  const visibili = soloDaLeggere ? messaggi.filter((voce) => !voce.letto) : messaggi

  async function segna(messaggio: Messaggio, letto: boolean) {
    await fetch('/api/contatti', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: messaggio.id, letto }),
    })
    router.refresh()
  }

  async function elimina(messaggio: Messaggio) {
    if (!confirm(`Eliminare il messaggio di ${messaggio.nome}?`)) return

    await fetch(`/api/contatti?id=${encodeURIComponent(messaggio.id)}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TestataPagina
        titolo="Messaggi"
        descrizione={`${messaggi.filter((voce) => !voce.letto).length} da leggere su ${messaggi.length} ricevuti.`}
        azione={
          <Pulsante
            variante="contorno"
            icona={soloDaLeggere ? 'griglia' : 'campanella'}
            onClick={() => setSoloDaLeggere((precedente) => !precedente)}
          >
            {soloDaLeggere ? 'Mostra tutti' : 'Solo da leggere'}
          </Pulsante>
        }
      />

      {visibili.length === 0 ? (
        <p className="border border-bordo bg-superficie py-16 text-center text-sm text-tenue">
          {soloDaLeggere ? 'Nessun messaggio da leggere.' : 'Nessun messaggio ricevuto.'}
        </p>
      ) : (
        <ul className="space-y-3">
          {visibili.map((messaggio) => (
            <li
              key={messaggio.id}
              className={classi(
                'border bg-superficie p-5',
                messaggio.letto ? 'border-bordo opacity-70' : 'border-accento-tenue',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">{messaggio.nome}</p>
                    {!messaggio.letto && (
                      <span className="bg-accento px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-white scuro:text-notte">
                        Nuovo
                      </span>
                    )}
                    <span className="text-xs text-tenue">{dataEstesa(messaggio.creatoIl)}</span>
                  </div>

                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                    <a
                      href={`mailto:${messaggio.email}`}
                      className="flex items-center gap-1.5 text-tenue transition-colors hover:text-accento"
                    >
                      <Icona nome="posta" className="size-3.5" />
                      {messaggio.email}
                    </a>
                    {messaggio.telefono && (
                      <a
                        href={`tel:${messaggio.telefono}`}
                        className="flex items-center gap-1.5 text-tenue transition-colors hover:text-accento"
                      >
                        <Icona nome="telefono" className="size-3.5" />
                        {messaggio.telefono}
                      </a>
                    )}
                  </p>

                  <p className="mt-3 border-l-2 border-accento/40 pl-3 text-sm leading-relaxed whitespace-pre-line text-tenue">
                    {messaggio.testo}
                  </p>
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                  <Pulsante
                    variante="contorno"
                    icona={messaggio.letto ? 'meno' : 'spunta'}
                    onClick={() => segna(messaggio, !messaggio.letto)}
                  >
                    {messaggio.letto ? 'Da leggere' : 'Letto'}
                  </Pulsante>

                  <Pulsante variante="pericolo" icona="cestino" onClick={() => elimina(messaggio)}>
                    <span className="sr-only sm:not-sr-only">Elimina</span>
                  </Pulsante>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
