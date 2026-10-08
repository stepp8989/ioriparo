'use client'

import { Statistica } from '@/componenti/admin/Cruscotto'
import { useElenco } from '@/componenti/admin/dati'
import type { Cinema } from '@/lib/tipi'

/**
 * Statistiche complete.
 *
 * Stesso motore del cruscotto, con il filtro per cinema in più. Tutti i numeri
 * si ricalcolano dalle prenotazioni a ogni richiesta: non esistono riepiloghi
 * precalcolati da tenere allineati, e quindi non possono essere sbagliati.
 */
export default function PaginaStatisticheAdmin() {
  const { voci: cinema } = useElenco<Cinema>('/api/admin/cinema')

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Statistiche</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Vendite, occupazione delle sale e presenze effettive. La differenza fra biglietti venduti
          e biglietti timbrati all’ingresso è il tasso di mancata presenza: è uno dei pochi numeri
          su cui si può davvero intervenire.
        </p>
      </header>

      <div className="mt-7">
        <Statistica conFiltri cinema={cinema.map((voce) => ({ id: voce.id, nome: voce.nome }))} />
      </div>
    </div>
  )
}
