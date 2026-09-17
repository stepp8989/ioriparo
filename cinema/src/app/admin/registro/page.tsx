'use client'

import { useCallback, useEffect, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import type { VoceRegistro } from '@/lib/tipi'
import { dataOra } from '@/lib/utili'

/**
 * Registro delle operazioni.
 *
 * Risponde alla domanda che prima o poi qualcuno fa: «chi ha annullato questa
 * prenotazione, e quando». È di sola lettura — un registro modificabile non è
 * un registro — e conserva le ultime duemila voci.
 */

/** Le azioni che toccano denaro o dati personali si distinguono a colpo d'occhio. */
const AZIONI_DELICATE = [
  'rimborso',
  'annullamento',
  'cliente-cancellato',
  'gift-card-annullata',
  'gift-card-rettificata',
  'punti-insufficienti',
]

export default function PaginaRegistroAdmin() {
  const [voci, setVoci] = useState<VoceRegistro[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cerca, setCerca] = useState('')

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const parametri = cerca.trim() ? `?q=${encodeURIComponent(cerca.trim())}` : ''
      const risposta = await fetch(`/api/admin/registro${parametri}`, { cache: 'no-store' })
      const dati = (await risposta.json()) as { voci: VoceRegistro[] }
      setVoci(dati.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [cerca])

  useEffect(() => {
    const attesa = window.setTimeout(() => void carica(), 250)
    return () => window.clearTimeout(attesa)
  }, [carica])

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Registro</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Accessi al pannello, modifiche al catalogo, incassi, annullamenti, rimborsi e ingressi in
          sala. Sola lettura: si conservano le ultime duemila voci.
        </p>
      </header>

      <div className="relative mt-7 max-w-md">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={cerca}
          onChange={(evento) => setCerca(evento.target.value)}
          placeholder="Azione, oggetto o autore…"
          aria-label="Cerca nel registro"
          className="w-full rounded-full border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem] focus:border-accento focus:outline-none"
        />
      </div>

      <div className="mt-6 rounded-ampio border border-bordo bg-superficie">
        {caricamento ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }, (_, indice) => (
              <Scheletro key={indice} className="h-8 w-full" />
            ))}
          </div>
        ) : voci.length === 0 ? (
          <Nota className="m-5" icona={<Icona nome="info" className="size-4" />}>
            Nessuna voce nel registro.
          </Nota>
        ) : (
          <ul className="divide-y divide-bordo">
            {voci.map((voce) => (
              <li key={voce.id} className="flex flex-wrap items-start gap-3 p-4">
                <span className="tabellare w-32 shrink-0 text-[0.78rem] text-tenue">
                  {dataOra(voce.quando)}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <Etichetta tono={AZIONI_DELICATE.includes(voce.azione) ? 'ambra' : 'neutro'}>
                      {voce.azione}
                    </Etichetta>
                    <span className="tabellare text-[0.84rem] font-medium">{voce.oggetto}</span>
                  </span>
                  {voce.dettaglio && (
                    <span className="mt-1 block text-[0.82rem] text-tenue">{voce.dettaglio}</span>
                  )}
                </span>

                <span className="shrink-0 text-[0.78rem] text-tenue">{voce.attore}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
