'use client'

import { useConsenso } from '@/componenti/comuni/Consenso'
import { Icona } from '@/componenti/ui/Icona'
import { INDIRIZZO_COMPLETO, LINK_INDICAZIONI, MAPPA_EMBED, RISTORANTE } from '@/dati/ristorante'

/**
 * Mappa di Google incorporata.
 *
 * Il riquadro viene inserito nella pagina solo se l'utente ha accettato i
 * contenuti esterni: fino ad allora al suo posto c'è una scheda con
 * l'indirizzo e il pulsante per aprire le indicazioni in una nuova scheda, che
 * funziona comunque e non fa partire nessuna richiesta verso Google.
 */
export function Mappa() {
  const { consenso, riapri } = useConsenso()

  if (!consenso.esterni) {
    return (
      <div className="flex min-h-[22rem] flex-col items-center justify-center gap-5 border border-bordo bg-superficie-alt p-10 text-center">
        <span className="grid size-14 place-items-center rounded-full border border-bordo text-accento">
          <Icona nome="posizione" className="size-6" />
        </span>

        <div>
          <h3 className="font-titolo text-2xl">{RISTORANTE.nomeCompleto}</h3>
          <p className="mt-2 text-sm text-tenue">{INDIRIZZO_COMPLETO}</p>
        </div>

        <p className="max-w-sm text-sm text-tenue">
          La mappa è un contenuto di Google. Per vederla qui dentro serve il consenso ai contenuti
          esterni; in alternativa potete aprire le indicazioni direttamente.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <a
            href={LINK_INDICAZIONI}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-accento px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-accento-forte scuro:text-notte"
          >
            Come raggiungerci
            <Icona nome="esterno" className="size-4" />
          </a>

          <button
            type="button"
            onClick={riapri}
            className="inline-flex items-center justify-center border border-bordo-forte px-6 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors hover:border-accento hover:text-accento"
          >
            Attiva la mappa
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      <iframe
        src={MAPPA_EMBED}
        title={`Mappa: dove si trova ${RISTORANTE.nomeCompleto}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
        className="h-[22rem] w-full border border-bordo lg:h-[30rem]"
      />

      <a
        href={LINK_INDICAZIONI}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute right-4 bottom-4 inline-flex items-center gap-2 bg-superficie px-5 py-3 text-[0.7rem] font-medium uppercase tracking-[0.16em] shadow-rilievo transition-colors hover:text-accento"
      >
        Come raggiungerci
        <Icona nome="esterno" className="size-4" />
      </a>
    </div>
  )
}
