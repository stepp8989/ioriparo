'use client'

import { useConsenso } from '@/componenti/comuni/Consenso'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA, INDIRIZZO_COMPLETO, LINK_INDICAZIONI, MAPPA_EMBED } from '@/dati/azienda'

/**
 * Mappa incorporata, subordinata al consenso.
 *
 * Il riquadro di Google deposita cookie e comunica l'indirizzo IP del
 * visitatore appena viene inserito nella pagina: per questo, finché il
 * consenso non è stato dato, al suo posto c'è un segnaposto con il pulsante
 * per aprire le indicazioni in una scheda nuova — che funziona sempre, con o
 * senza consenso.
 */
export function Mappa() {
  const { stato, accetta } = useConsenso()

  if (stato === 'accettato') {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-ampio border border-bordo">
        <iframe
          src={MAPPA_EMBED}
          title={`Mappa: ${AZIENDA.nomeCompleto}, ${INDIRIZZO_COMPLETO}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="size-full border-0"
        />
      </div>
    )
  }

  return (
    <div className="flex aspect-[16/10] flex-col items-center justify-center rounded-ampio border border-dashed border-bordo-forte bg-superficie-alt p-8 text-center">
      <Icona nome="posizione" className="size-8 text-tenue" />
      <h3 className="mt-5 font-titolo text-[1.1rem] font-semibold">{INDIRIZZO_COMPLETO}</h3>
      <p className="mx-auto mt-3 max-w-sm text-[0.88rem] leading-relaxed text-tenue">
        La mappa di Google usa cookie di terze parti. Potete attivarla oppure aprire le indicazioni
        direttamente, senza attivare nulla.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Bottone onClick={accetta} misura="piccola">
          Mostra la mappa
        </Bottone>
        <Bottone
          href={LINK_INDICAZIONI}
          target="_blank"
          rel="noopener noreferrer"
          variante="contorno"
          misura="piccola"
        >
          <Icona nome="esterno" className="size-4" />
          Apri le indicazioni
        </Bottone>
      </div>
    </div>
  )
}
