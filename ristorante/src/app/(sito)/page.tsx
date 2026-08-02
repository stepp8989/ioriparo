import { Apertura } from '@/componenti/home/Apertura'
import { ChiSiamoBreve } from '@/componenti/home/ChiSiamoBreve'
import { PiattiRichiesti } from '@/componenti/home/PiattiRichiesti'
import { Specialita } from '@/componenti/home/Specialita'
import { GalleriaBreve } from '@/componenti/home/GalleriaBreve'
import { Recensioni } from '@/componenti/home/Recensioni'
import { Eventi } from '@/componenti/home/Eventi'
import { Invito } from '@/componenti/home/Invito'
import { leggi } from '@/lib/archivio'
import { metadatiPagina } from '@/lib/seo'
import { RISTORANTE } from '@/dati/ristorante'

export const metadata = metadatiPagina({
  titolo: `${RISTORANTE.claim} a ${RISTORANTE.indirizzo.citta}`,
  descrizione: RISTORANTE.descrizione,
  percorso: '/',
})

/**
 * Home.
 *
 * Il ritmo alterna sezioni chiare e scure: apertura, racconto, piatti,
 * specialità, galleria, recensioni, eventi, invito. Ogni blocco è un
 * componente a sé, così l'ordine si cambia spostando una riga.
 */
export default async function Home() {
  const { recensioni } = await leggi()
  const pubblicate = recensioni
    .filter((recensione) => recensione.pubblicata)
    .sort((primo, secondo) => secondo.data.localeCompare(primo.data))

  return (
    <>
      <Apertura />
      <ChiSiamoBreve />
      <PiattiRichiesti />
      <Specialita />
      <GalleriaBreve />
      <Recensioni recensioni={pubblicate} />
      <Eventi />
      <Invito />
    </>
  )
}
