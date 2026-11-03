import 'server-only'
import { cache } from 'react'
import { leggi } from '@/lib/archivio'
import { clienteCollegato } from '@/lib/clienti'
import type { Archivio, Cinema, Film, Sala, Spettacolo } from '@/lib/tipi'
import { orariUtili } from '@/lib/programmazione'

/**
 * Letture condivise dalle pagine pubbliche.
 *
 * `cache` di React memorizza il risultato per la durata della singola
 * richiesta: il layout, la pagina e i componenti annidati chiamano tutti
 * `datiSito()` e l'archivio viene letto una volta sola. Senza, una pagina con
 * intestazione, contenuto e piè di pagina farebbe tre letture identiche del
 * deposito per disegnare una schermata.
 */
export const datiSito = cache(async (): Promise<Archivio> => leggi())

/** Cliente collegato, letto una volta per richiesta. */
export const clienteDellaSessione = cache(clienteCollegato)

/** Solo i film pubblicati, nell'ordine in cui il pubblico se li aspetta. */
export function filmVisibili(archivio: Archivio): Film[] {
  return archivio.film
    .filter((film) => film.visibile && film.stato !== 'archivio')
    .sort((a, b) => {
      // Prima quelli in sala, poi i prossimi; dentro ciascun gruppo, i più
      // recenti in cima: è l'ordine con cui si guarda una locandina esposta.
      if (a.stato !== b.stato) return a.stato === 'in-sala' ? -1 : 1
      return b.dataUscita.localeCompare(a.dataUscita)
    })
}

/** Cinema pubblicati. */
export function cinemaVisibili(archivio: Archivio): Cinema[] {
  return archivio.cinema.filter((cinema) => cinema.visibile)
}

/**
 * Spettacoli ancora acquistabili, con i riferimenti già risolti.
 *
 * Le pagine hanno quasi sempre bisogno di film, cinema e sala insieme
 * all'orario: risolverli qui una volta evita che ogni componente si costruisca
 * la propria mappa e che qualcuno dimentichi di escludere i cinema nascosti.
 */
export type SpettacoloRisolto = {
  spettacolo: Spettacolo
  film: Film
  cinema: Cinema
  sala: Sala | null
}

export function spettacoliUtili(
  archivio: Archivio,
  filtro: { filmId?: string; cinemaId?: string; data?: string } = {},
  adesso = new Date(),
): SpettacoloRisolto[] {
  const filmPerId = new Map(filmVisibili(archivio).map((film) => [film.id, film]))
  const cinemaPerId = new Map(cinemaVisibili(archivio).map((cinema) => [cinema.id, cinema]))
  const salePerId = new Map(archivio.sale.map((sala) => [sala.id, sala]))

  const candidati = archivio.spettacoli.filter((spettacolo) => {
    if (filtro.filmId && spettacolo.filmId !== filtro.filmId) return false
    if (filtro.cinemaId && spettacolo.cinemaId !== filtro.cinemaId) return false
    if (filtro.data && spettacolo.data !== filtro.data) return false
    return filmPerId.has(spettacolo.filmId) && cinemaPerId.has(spettacolo.cinemaId)
  })

  return orariUtili(candidati, archivio.impostazioni.chiusuraVenditaMinuti, adesso).map(
    (spettacolo) => ({
      spettacolo,
      // Le presenze nelle mappe sono già garantite dal filtro qui sopra.
      film: filmPerId.get(spettacolo.filmId) as Film,
      cinema: cinemaPerId.get(spettacolo.cinemaId) as Cinema,
      sala: salePerId.get(spettacolo.salaId) ?? null,
    }),
  )
}

/** Giorni in cui esiste almeno uno spettacolo acquistabile. */
export function giorniConSpettacoli(risolti: SpettacoloRisolto[], massimo = 8): string[] {
  const giorni = new Set(risolti.map((voce) => voce.spettacolo.data))
  return [...giorni].sort().slice(0, massimo)
}

/** Promozioni da mostrare nelle vetrine: attive e non scadute. */
export function promozioniVive(archivio: Archivio, adesso = new Date()) {
  const oggi = adesso.toISOString().slice(0, 10)
  return archivio.promozioni.filter(
    (promozione) =>
      promozione.attiva &&
      (!promozione.dal || promozione.dal <= oggi) &&
      (!promozione.al || promozione.al >= oggi),
  )
}
