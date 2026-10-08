import { leggi, modifica, annota } from '@/lib/archivio'
import { timbraBiglietto, verificaQr } from '@/lib/biglietti'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { bloccaSeNonStaff, livelloAttivo } from '@/lib/sessione'
import { elencoPosti } from '@/lib/utili'

/**
 * Verifica dei biglietti all'ingresso della sala.
 *
 *   POST  legge un QR e dice se è valido, senza consumarlo
 *   PUT   timbra il biglietto: da qui in poi non è più riutilizzabile
 *
 * Le due operazioni sono separate di proposito. La maschera deve poter
 * controllare un codice — perché un cliente chiede conferma, perché si vuole
 * capire se è la sala giusta — senza bruciarlo. Il biglietto si consuma solo
 * quando la persona entra davvero.
 *
 * È l'unica rotta accessibile anche con la sessione ristretta «maschera»: il
 * tablet alla porta non deve poter vedere l'anagrafica né toccare la
 * programmazione.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonStaff()
  if (blocco) return blocco

  // Una lettura al secondo in media, con picchi: all'ingresso di una sala IMAX
  // si timbrano trecento biglietti in dieci minuti.
  if (troppeRichieste(`verifica:${chiamante(richiesta)}`, 600, 10)) {
    return Response.json({ errore: 'Troppe letture.' }, { status: 429 })
  }

  const corpo = await corpoJson(richiesta)
  const contenuto = testoPulito(corpo.contenuto, 200)

  if (!contenuto) return Response.json({ errore: 'Nessun codice letto.' }, { status: 400 })

  const archivio = await leggi()
  const esito = verificaQr(archivio, contenuto)

  if (!esito.valido) return Response.json(esito, { status: 200 })

  const film = archivio.film.find((voce) => voce.id === esito.prenotazione.filmId)
  const cinema = archivio.cinema.find((voce) => voce.id === esito.prenotazione.cinemaId)
  const sala = archivio.sale.find((voce) => voce.id === esito.prenotazione.salaId)

  return Response.json({
    valido: true,
    giaUsato: esito.giaUsato,
    messaggio: esito.messaggio,
    biglietto: {
      codice: esito.prenotazione.codice,
      codiceBiglietto: esito.posto.codiceBiglietto,
      film: film?.titolo ?? '—',
      cinema: cinema?.nome ?? '—',
      sala: sala?.nome ?? '—',
      data: esito.prenotazione.data,
      ora: esito.prenotazione.ora,
      posto: `${esito.posto.fila}${esito.posto.numero}`,
      tipologia: esito.posto.tipologiaNome,
      // La maschera deve sapere se chiedere un documento: una riduzione
      // studente senza tesserino è la contestazione più frequente all'ingresso.
      documentoRichiesto: archivio.tipologieBiglietto.find(
        (voce) => voce.id === esito.posto.tipologiaId,
      )?.richiedeDocumento ?? false,
      intestatario: esito.prenotazione.ospite?.nome ?? '',
      utilizzatoIl: esito.posto.utilizzatoIl,
    },
  })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonStaff()
  if (blocco) return blocco

  const livello = await livelloAttivo()
  const corpo = await corpoJson(richiesta)
  const contenuto = testoPulito(corpo.contenuto, 200)

  const esito = await modifica((archivio) => {
    const verifica = verificaQr(archivio, contenuto)
    if (!verifica.valido) return { ...verifica, timbrato: false } as const

    const timbrato = timbraBiglietto(verifica.prenotazione, verifica.posto.codiceBiglietto)

    if (timbrato) {
      annota(
        archivio,
        livello ?? 'staff',
        'ingresso',
        verifica.prenotazione.codice,
        `Posto ${elencoPosti([verifica.posto])} — sala ${verifica.prenotazione.salaId}.`,
      )
    }

    return {
      valido: true,
      timbrato,
      messaggio: timbrato
        ? 'Ingresso registrato.'
        : 'Biglietto già utilizzato: verificare con il cliente.',
      posto: `${verifica.posto.fila}${verifica.posto.numero}`,
    } as const
  })

  return Response.json(esito)
}
