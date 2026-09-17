import type { Metadata } from 'next'
import { Prenotazione } from '@/componenti/prenota/Prenotazione'
import type { CatalogoAcquisto } from '@/componenti/prenota/tipi'
import { Sezione } from '@/componenti/ui/Sezione'
import { metodiDisponibili } from '@/lib/pagamenti'
import { orariUtili } from '@/lib/programmazione'
import { metadatiPagina } from '@/lib/seo'
import { cinemaVisibili, clienteDellaSessione, datiSito, filmVisibili } from '@/lib/sito'
import { sommaGiorni, oggiIso } from '@/lib/utili'

/**
 * Flusso d'acquisto.
 *
 * La pagina è dinamica e non viene mai memorizzata in cache: mostra prezzi,
 * disponibilità e punti di un cliente specifico in un momento specifico, e una
 * versione conservata sarebbe sbagliata per chiunque la ricevesse.
 *
 * Al browser arriva un catalogo ridotto all'osso: gli spettacoli dei prossimi
 * sette giorni con i soli campi che servono a sceglierne uno, e nessuna pianta
 * di sala — quella la chiede il flusso quando sa di quale sala ha bisogno.
 */
export const dynamic = 'force-dynamic'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Acquista i biglietti',
  descrizione: 'Scegli cinema, film, orario e posti. Pagamento sicuro e biglietto con QR.',
  percorso: '/acquista',
  indicizza: false,
})

export default async function PaginaAcquista({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [parametri, archivio, cliente] = await Promise.all([
    searchParams,
    datiSito(),
    clienteDellaSessione(),
  ])

  const leggi = (chiave: string) => {
    const valore = parametri[chiave]
    return (Array.isArray(valore) ? valore[0] : valore) ?? ''
  }

  // Sette giorni: è la finestra in cui si vendono i biglietti, e tenerla
  // stretta è ciò che permette di mandare gli spettacoli insieme alla pagina
  // invece di farli chiedere uno alla volta.
  const limite = sommaGiorni(oggiIso(), 7)

  const cinemaAperti = cinemaVisibili(archivio)
  const idCinema = new Set(cinemaAperti.map((voce) => voce.id))

  const film = filmVisibili(archivio).filter((voce) => voce.stato === 'in-sala')
  const idFilm = new Set(film.map((voce) => voce.id))

  const spettacoli = orariUtili(
    archivio.spettacoli.filter(
      (voce) =>
        voce.data <= limite && idCinema.has(voce.cinemaId) && idFilm.has(voce.filmId),
    ),
    archivio.impostazioni.chiusuraVenditaMinuti,
  )

  const catalogo: CatalogoAcquisto = {
    impostazioni: archivio.impostazioni,
    cinema: cinemaAperti.map((voce) => ({
      id: voce.id,
      slug: voce.slug,
      nome: voce.nome,
      citta: voce.citta,
    })),
    film: film.map((voce) => ({
      id: voce.id,
      slug: voce.slug,
      titolo: voce.titolo,
      durataMinuti: voce.durataMinuti,
      classificazione: voce.classificazione,
      generi: voce.generi,
      palette: voce.palette,
      locandina: voce.locandina,
    })),
    spettacoli,
    tipologie: archivio.tipologieBiglietto.filter((voce) => voce.attiva),
    food: archivio.impostazioni.moduli.food ? archivio.food.filter((voce) => voce.disponibile) : [],
    cliente: cliente
      ? {
          id: cliente.id,
          nome: cliente.nome,
          cognome: cliente.cognome,
          email: cliente.email,
          telefono: cliente.telefono,
          punti: cliente.punti,
        }
      : null,
    metodi: metodiDisponibili(),
  }

  return (
    <Sezione className="pt-32" ampiezza="larga">
      <h1 className="sr-only">Acquisto dei biglietti</h1>

      <Prenotazione
        catalogo={catalogo}
        spettacoloIniziale={leggi('spettacolo')}
        annullato={leggi('annullato') === '1'}
      />
    </Sezione>
  )
}
