'use client'

import { Scorciatoie, Statistica } from '@/componenti/admin/Cruscotto'

/**
 * Cruscotto.
 *
 * Apre sui numeri della settimana e non sulle scorciatoie: chi entra nel
 * pannello la mattina vuole sapere com'è andata ieri, non dove cliccare.
 */
export default function PaginaCruscotto() {
  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Cruscotto</h1>
        <p className="mt-1.5 text-[0.9rem] text-tenue">
          Incassi, occupazione e presenze. Gli importi comprendono solo le prenotazioni
          effettivamente pagate.
        </p>
      </header>

      <div className="mt-7">
        <Statistica />
      </div>

      <section className="mt-10">
        <h2 className="mb-5 font-titolo text-[1.2rem] font-semibold">Operazioni frequenti</h2>
        <Scorciatoie />
      </section>
    </div>
  )
}
