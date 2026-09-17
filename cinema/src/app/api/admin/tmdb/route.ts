import { revalidatePath } from 'next/cache'
import { annota, modifica } from '@/lib/archivio'
import { corpoJson, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { cercaFilm, filmInArrivo, filmInSala, schedaFilm, tmdbAttivo } from '@/lib/tmdb'

/**
 * Importazione dei film da The Movie Database.
 *
 *   GET  /api/admin/tmdb?elenco=in-sala|in-arrivo|ricerca&q=…
 *   POST /api/admin/tmdb   { tmdbId }      importa o aggiorna una scheda
 *
 * Riservata alla sessione di gestione: la maschera del lettore di biglietti non
 * ci arriva. Non passa da `rotteCollezione` perché non è una collezione — è
 * un'operazione che *scrive* nella collezione dei film partendo da un servizio
 * esterno, e il corpo della richiesta non contiene la scheda ma solo il numero
 * da cui ricavarla. È deliberato: se il pannello potesse mandare direttamente
 * la scheda, l'origine dei dati smetterebbe di essere verificabile.
 */

export const dynamic = 'force-dynamic'

export async function GET(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  if (!tmdbAttivo()) {
    return Response.json(
      { errore: 'TMDB non è configurato: manca TMDB_API_KEY.', configurato: false },
      { status: 503 },
    )
  }

  const parametri = new URL(richiesta.url).searchParams
  const elenco = testoPulito(parametri.get('elenco'), 20)
  const query = testoPulito(parametri.get('q'), 120)

  const esito =
    elenco === 'ricerca'
      ? await cercaFilm(query)
      : elenco === 'in-arrivo'
        ? await filmInArrivo()
        : await filmInSala()

  if (!esito.ok) return Response.json({ errore: esito.errore }, { status: 502 })

  return Response.json(
    { configurato: true, risultati: esito.dati },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  if (!tmdbAttivo()) {
    return Response.json({ errore: 'TMDB non è configurato: manca TMDB_API_KEY.' }, { status: 503 })
  }

  const corpo = await corpoJson(richiesta)
  if (!corpo) return Response.json({ errore: 'Richiesta non valida.' }, { status: 400 })

  const tmdbId = Number(corpo.tmdbId)
  if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
    return Response.json({ errore: 'Identificativo TMDB non valido.' }, { status: 400 })
  }

  /*
   * Si cerca prima il film già in catalogo, così una seconda importazione
   * aggiorna la scheda invece di crearne una copia. Il riconoscimento passa
   * dallo slug — titolo più anno — perché l'archivio non conserva il numero
   * TMDB: la piattaforma resta indipendente dal servizio da cui i dati sono
   * arrivati, e una scheda importata si può poi modificare a mano senza che
   * nulla la rileghi all'originale.
   */
  const esistenteEsito = await schedaFilm(tmdbId)
  if (!esistenteEsito.ok) {
    return Response.json({ errore: esistenteEsito.errore }, { status: 502 })
  }

  const risultato = await modifica((archivio) => {
    const precedente = archivio.film.find((voce) => voce.slug === esistenteEsito.dati.slug)

    // Rigenerare la scheda con il film esistente conserva ciò che appartiene
    // alla sala e non al film: formati, evidenza, visibilità, identificativo.
    const aggiornato = precedente
      ? { ...esistenteEsito.dati, ...sovrascriviDaTmdb(esistenteEsito.dati, precedente) }
      : esistenteEsito.dati

    if (precedente) {
      const indice = archivio.film.indexOf(precedente)
      archivio.film[indice] = aggiornato
    } else {
      archivio.film.unshift(aggiornato)
    }

    annota(
      archivio,
      'pannello',
      precedente ? 'tmdb-aggiorna' : 'tmdb-importa',
      `film:${aggiornato.id}`,
      `${aggiornato.titolo} (TMDB ${tmdbId})`,
    )

    return { film: aggiornato, aggiornato: Boolean(precedente) }
  })

  try {
    revalidatePath('/film')
    revalidatePath(`/film/${risultato.film.slug}`)
  } catch {
    // Fuori da una richiesta rigenerabile non c'è niente da invalidare.
  }

  return Response.json(risultato, { status: risultato.aggiornato ? 200 : 201 })
}

/**
 * Campi che restano della sala anche dopo un aggiornamento da TMDB.
 *
 * TMDB sa che cos'è il film; non sa in che formato lo proiettiamo, se sta in
 * home o se è già pubblicato. Riscrivere quei campi a ogni aggiornamento
 * significherebbe far sparire dalla home un titolo perché qualcuno ha
 * risincronizzato la trama.
 */
function sovrascriviDaTmdb(
  daTmdb: import('@/lib/tipi').Film,
  precedente: import('@/lib/tipi').Film,
): Partial<import('@/lib/tipi').Film> {
  return {
    id: precedente.id,
    slug: precedente.slug,
    formati: precedente.formati,
    inEvidenza: precedente.inEvidenza,
    visibile: precedente.visibile,
    palette: precedente.palette,
    creatoIl: precedente.creatoIl,
    // Il trailer inserito a mano vince su quello trovato: spesso è la versione
    // italiana, e TMDB propone quasi sempre quella originale.
    trailer: precedente.trailer ?? daTmdb.trailer,
  }
}
