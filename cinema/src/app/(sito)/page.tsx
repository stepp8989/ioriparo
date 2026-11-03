import { Apertura } from '@/componenti/home/Apertura'
import {
  Club,
  InSalaOra,
  Invito,
  Prossimamente,
  Strutture,
  VetrinaPromozioni,
  VetrinaTrailer,
} from '@/componenti/home/Sezioni'
import { prezzoDaPartireDa } from '@/lib/prezzi'
import { cinemaVisibili, datiSito, filmVisibili, promozioniVive, spettacoliUtili } from '@/lib/sito'

/**
 * Pagina iniziale.
 *
 * È interamente disegnata dal server: gli unici componenti di client sono
 * l'apertura che ruota e il lettore dei trailer. Il resto arriva come HTML già
 * pronto, e questo è ciò che tiene i Core Web Vitals in ordine su una pagina
 * che mostra una ventina di locandine.
 *
 * `revalidate` a 120 secondi: gli orari e i prezzi cambiano di rado nell'arco
 * di due minuti, e ricostruire la home a ogni visita per aggiornare un prezzo
 * «a partire da» sarebbe lavoro sprecato. Le pagine che devono essere esatte
 * al secondo — mappa dei posti, checkout — non sono memorizzate affatto.
 */
export const revalidate = 120

export default async function Home() {
  const archivio = await datiSito()
  const film = filmVisibili(archivio)
  const risolti = spettacoliUtili(archivio)

  /*
   * Prezzo minimo per film.
   *
   * Si calcola una volta sola qui e si passa alle schede: farlo dentro ogni
   * scheda significherebbe scorrere tutti gli spettacoli una volta per film,
   * che su un listino di qualche migliaio di proiezioni si sente.
   */
  const prezziMinimi = new Map<string, number>()
  for (const { spettacolo, sala } of risolti) {
    const prezzo = prezzoDaPartireDa(spettacolo, sala, archivio.impostazioni)
    const attuale = prezziMinimi.get(spettacolo.filmId)
    if (attuale === undefined || prezzo < attuale) {
      prezziMinimi.set(spettacolo.filmId, prezzo)
    }
  }

  const inSala = film.filter((voce) => voce.stato === 'in-sala')
  const prossimi = film.filter((voce) => voce.stato === 'prossimamente')

  // L'apertura mostra i film in evidenza; se nessuno lo è, i primi in sala.
  const evidenza = film.filter((voce) => voce.inEvidenza)
  const apertura = (evidenza.length > 0 ? evidenza : inSala).slice(0, 5)

  return (
    <>
      <Apertura film={apertura} />

      <InSalaOra film={inSala} prezziMinimi={prezziMinimi} />

      <Prossimamente film={prossimi} />

      <VetrinaTrailer film={[...inSala, ...prossimi]} />

      <VetrinaPromozioni promozioni={promozioniVive(archivio).filter((voce) => voce.inEvidenza || voce.codice === '')} />

      {archivio.impostazioni.moduli.loyalty && (
        <Club
          livelli={[...archivio.livelliLoyalty].sort((a, b) => a.puntiMinimi - b.puntiMinimi)}
          piani={archivio.piani.filter((piano) => piano.attivo)}
          nome={archivio.impostazioni.marchio.nome}
          puntiPerEuro={archivio.impostazioni.puntiPerEuro}
        />
      )}

      <Strutture cinema={cinemaVisibili(archivio)} nome={archivio.impostazioni.marchio.nome} />

      <Invito nome={archivio.impostazioni.marchio.nome} />
    </>
  )
}
