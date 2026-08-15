'use client'

import { useConsenso } from '@/componenti/comuni/Consenso'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'

/**
 * Pulsante che rimette in discussione il consenso ai cookie.
 *
 * Sta nella cookie policy perché è lì che si va a cercarlo. Riporta lo stato a
 * «ignoto», e il banner ricompare da solo.
 */
export function RiapriConsenso() {
  const { stato, riapri, accetta, rifiuta } = useConsenso()

  return (
    <div className="my-6 rounded-morbido border border-bordo bg-superficie-alt p-6">
      <p className="text-[0.9rem] font-medium text-testo">
        Scelta attuale:{' '}
        {stato === 'accettato'
          ? 'tutti i cookie attivi'
          : stato === 'rifiutato'
            ? 'solo cookie necessari'
            : 'nessuna scelta registrata'}
      </p>

      <div className="mt-4 flex flex-wrap gap-3">
        {stato !== 'accettato' && (
          <Bottone misura="piccola" onClick={accetta}>
            Attiva tutti i cookie
          </Bottone>
        )}
        {stato !== 'rifiutato' && (
          <Bottone misura="piccola" variante="contorno" onClick={rifiuta}>
            Solo necessari
          </Bottone>
        )}
        {stato !== 'ignoto' && (
          <Bottone misura="piccola" variante="tenue" onClick={riapri}>
            <Icona nome="campanella" className="size-3.5" />
            Chiedimelo di nuovo
          </Bottone>
        )}
      </div>
    </div>
  )
}
