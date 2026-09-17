import type { Metadata } from 'next'
import { TrovaCinema } from '@/componenti/cinema/TrovaCinema'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { cinemaVisibili, datiSito } from '@/lib/sito'

/**
 * Trova il tuo cinema.
 *
 * L'elenco completo arriva dal server — è indicizzabile e visibile senza
 * JavaScript — mentre ordinamento per distanza, ricerca e filtri avvengono nel
 * browser su dati già presenti nella pagina. Con cinque sale non ha senso
 * interrogare il server a ogni tasto premuto, e la posizione non deve uscire
 * dal dispositivo.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Trova il tuo cinema',
    descrizione:
      'Le sale della rete: indirizzi, servizi, numero di sale e programmazione. Cerca per città, CAP o posizione.',
    percorso: '/cinema',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaCinema() {
  const archivio = await datiSito()
  const strutture = cinemaVisibili(archivio)

  const saleConteggio: Record<string, number> = {}
  for (const sala of archivio.sale) {
    if (!sala.attiva) continue
    saleConteggio[sala.cinemaId] = (saleConteggio[sala.cinemaId] ?? 0) + 1
  }

  return (
    <Sezione className="pt-32">
      <TitoloSezione
        soprattitolo="Trova cinema"
        titolo="Trova il tuo cinema"
        sottotitolo="Cerca per città, CAP o nome, oppure lascia che sia il telefono a dirci dove sei."
        allineamento="sinistra"
      />

      <div className="mt-10">
        <TrovaCinema
          cinema={strutture}
          nomeMarchio={archivio.impostazioni.marchio.nome}
          saleConteggio={saleConteggio}
        />
      </div>
    </Sezione>
  )
}
