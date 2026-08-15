'use client'

import { useState } from 'react'
import { ModuloRichiesta } from '@/componenti/moduli/ModuloRichiesta'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA, linkWhatsApp } from '@/dati/azienda'
import type { TipoRichiesta } from '@/lib/tipi'

/**
 * Le azioni della scheda veicolo.
 *
 * Aprono la stessa finestra con il modulo giusto: informazioni, finanziamento,
 * test drive. WhatsApp e telefono restano collegamenti diretti, perché chi li
 * sceglie vuole parlare adesso e non compilare un modulo.
 */
export function AzioniVeicolo({
  veicoloId,
  titolo,
  prezzo,
  disponibile,
}: {
  veicoloId: string
  titolo: string
  prezzo: number
  disponibile: boolean
}) {
  const [richiesta, setRichiesta] = useState<TipoRichiesta | null>(null)

  const messaggioWhatsApp = `Buongiorno, sono interessato a ${titolo} che ho visto sul sito. Potete darmi maggiori informazioni?`

  return (
    <>
      <div className="space-y-3">
        <Bottone onClick={() => setRichiesta('informazioni')} className="w-full" misura="grande">
          Richiedi informazioni
          <Icona nome="freccia" className="size-4" />
        </Bottone>

        <div className="grid grid-cols-2 gap-3">
          <Bottone onClick={() => setRichiesta('finanziamento')} variante="contorno">
            <Icona nome="calcolatrice" className="size-4" />
            Finanziamento
          </Bottone>
          <Bottone
            onClick={() => setRichiesta('test-drive')}
            variante="contorno"
            disabled={!disponibile}
            title={disponibile ? undefined : 'Veicolo non più disponibile per la prova'}
          >
            <Icona nome="volante" className="size-4" />
            Test drive
          </Bottone>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Bottone
            href={linkWhatsApp(messaggioWhatsApp)}
            target="_blank"
            rel="noopener noreferrer"
            variante="tenue"
          >
            <Icona nome="whatsapp" className="size-4" />
            WhatsApp
          </Bottone>
          <Bottone href={`tel:${AZIENDA.telefonoLink}`} variante="tenue">
            <Icona nome="telefono" className="size-4" />
            Chiama
          </Bottone>
        </div>

        <button
          type="button"
          onClick={() => setRichiesta('permuta')}
          className="w-full pt-2 text-[0.85rem] text-tenue transition-colors hover:text-accento"
        >
          Hai un usato da permutare? Facciamo la valutazione
        </button>
      </div>

      <Finestra
        aperta={richiesta !== null}
        onChiudi={() => setRichiesta(null)}
        titolo={titolo}
      >
        {richiesta && (
          <ModuloRichiesta
            tipo={richiesta}
            veicoloId={veicoloId}
            veicoloTitolo={titolo}
            prezzoVeicolo={prezzo}
          />
        )}
      </Finestra>
    </>
  )
}
