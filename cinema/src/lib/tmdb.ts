import 'server-only'
import { CLASSIFICAZIONI, type Classificazione, type Film, type VoceCast } from '@/lib/tipi'
import { inSlug, nuovoId } from '@/lib/utili'

/**
 * Importazione del catalogo da The Movie Database.
 *
 * Il catalogo dimostrativo della piattaforma è inventato: titoli, trame e
 * locandine sono originali proprio per non distribuire materiale di cui non
 * abbiamo i diritti. Chi mette in piedi un cinema vero, però, ha bisogno dei
 * film veri, e ricopiarli a mano dal pannello uno per uno è un lavoro che nessuno
 * farà mai per trenta titoli a settimana. Questo modulo colma quel divario.
 *
 * Come è fatto: chiamate HTTP diritte alle API di TMDB, nessun SDK, nessuna
 * dipendenza in più. Lo stesso codice gira su Node e sui runtime serverless.
 *
 * ── La chiave ────────────────────────────────────────────────────────────────
 * La chiave NON sta nel codice e non deve starci mai. Si mette in `.env.local`:
 *
 *   TMDB_API_KEY=...        chiave v3 dal proprio profilo TMDB
 *   TMDB_LINGUA=it-IT       lingua dei testi (predefinita)
 *   TMDB_PAESE=IT           paese per le classificazioni d'età
 *
 * Senza chiave il modulo non si rompe e non rompe il pannello: `tmdbAttivo()`
 * risponde di no, la sezione d'importazione spiega che cosa manca e il sito
 * continua a funzionare con il catalogo inserito a mano. È la stessa logica dei
 * pagamenti: un servizio esterno non configurato è una funzione assente, non un
 * guasto.
 *
 * ── I diritti ────────────────────────────────────────────────────────────────
 * TMDB distribuisce le schede e le immagini alle condizioni scritte nei suoi
 * termini d'uso: l'attribuzione è obbligatoria, e il servizio non è affiliato a
 * TMDB. Il testo dell'attribuzione è in `ATTRIBUZIONE_TMDB` e la pagina
 * d'importazione lo mostra a chi importa. Gli indirizzi delle immagini
 * rimandano ai server di TMDB: la piattaforma non ne fa copia, che è anche il
 * motivo per cui l'host va dichiarato in `next.config.ts`.
 */

const BASE = 'https://api.themoviedb.org/3'

/** Server delle immagini. Le misure sono quelle previste da TMDB. */
const IMMAGINI = 'https://image.tmdb.org/t/p'

const CHIAVE = process.env.TMDB_API_KEY
const LINGUA = process.env.TMDB_LINGUA || 'it-IT'
const PAESE = process.env.TMDB_PAESE || 'IT'

export const ATTRIBUZIONE_TMDB =
  'Dati e immagini dei film forniti da The Movie Database (TMDB). Questo servizio ' +
  'usa le API di TMDB ma non è approvato né certificato da TMDB.'

/** Vero quando la chiave è configurata. Il pannello lo chiede prima di tutto. */
export function tmdbAttivo(): boolean {
  return Boolean(CHIAVE)
}

/**
 * Indirizzo di un'immagine TMDB.
 *
 * `percorso` è il frammento che arriva nelle risposte (`/abc123.jpg`). Torna
 * stringa vuota quando manca, perché è esattamente quello che `<Locandina>` si
 * aspetta per disegnare il manifesto procedurale al suo posto.
 */
export function immagineTmdb(percorso: string | null | undefined, misura = 'w500'): string {
  if (!percorso) return ''
  return `${IMMAGINI}/${misura}${percorso}`
}

/* ── Chiamata ─────────────────────────────────────────────────────────────── */

type Esito<T> = { ok: true; dati: T } | { ok: false; errore: string }

/**
 * Una richiesta a TMDB.
 *
 * Gli errori tornano come valore e non come eccezione: il pannello deve poter
 * dire «la chiave è scaduta» o «TMDB non risponde» senza che una schermata
 * vada in errore. Il `signal` con scadenza serve perché una rotta del pannello
 * appesa a un servizio esterno lento è un problema del pannello, non del
 * servizio.
 */
async function chiedi<T>(percorso: string, parametri: Record<string, string> = {}): Promise<Esito<T>> {
  if (!CHIAVE) return { ok: false, errore: 'TMDB non è configurato: manca TMDB_API_KEY.' }

  const indirizzo = new URL(`${BASE}${percorso}`)
  indirizzo.searchParams.set('api_key', CHIAVE)
  indirizzo.searchParams.set('language', LINGUA)
  for (const [chiave, valore] of Object.entries(parametri)) {
    indirizzo.searchParams.set(chiave, valore)
  }

  try {
    const risposta = await fetch(indirizzo, {
      signal: AbortSignal.timeout(10_000),
      // Le schede dei film cambiano di rado: un quarto d'ora di cache evita di
      // ripetere la stessa richiesta mentre si sfoglia l'elenco dei risultati.
      next: { revalidate: 900 },
    })

    if (risposta.status === 401) {
      return { ok: false, errore: 'TMDB rifiuta la chiave: controllate TMDB_API_KEY.' }
    }
    if (risposta.status === 429) {
      return { ok: false, errore: 'Troppe richieste a TMDB: riprovate fra qualche secondo.' }
    }
    if (!risposta.ok) {
      return { ok: false, errore: `TMDB ha risposto ${risposta.status}.` }
    }

    return { ok: true, dati: (await risposta.json()) as T }
  } catch (errore) {
    const motivo = errore instanceof Error && errore.name === 'TimeoutError' ? 'non risponde' : 'non è raggiungibile'
    return { ok: false, errore: `TMDB ${motivo}.` }
  }
}

/* ── Forme delle risposte ─────────────────────────────────────────────────── */

type FilmTmdb = {
  id: number
  title?: string
  original_title?: string
  overview?: string
  tagline?: string
  release_date?: string
  runtime?: number
  vote_average?: number
  poster_path?: string | null
  backdrop_path?: string | null
  original_language?: string
  genres?: { id: number; name: string }[]
  production_countries?: { iso_3166_1: string; name: string }[]
  credits?: {
    cast?: { name: string; character?: string; order?: number }[]
    crew?: { name: string; job?: string }[]
  }
  videos?: { results?: { key: string; site?: string; type?: string; official?: boolean }[] }
  release_dates?: {
    results?: { iso_3166_1: string; release_dates?: { certification?: string }[] }[]
  }
}

type Elenco = {
  results?: {
    id: number
    title?: string
    release_date?: string
    poster_path?: string | null
    overview?: string
  }[]
  total_results?: number
}

/** Riga di risultato mostrata nell'elenco del pannello. */
export type RisultatoTmdb = {
  tmdbId: number
  titolo: string
  anno: number
  locandina: string
  sinossi: string
}

function inRisultato(voce: NonNullable<Elenco['results']>[number]): RisultatoTmdb {
  return {
    tmdbId: voce.id,
    titolo: voce.title ?? '',
    anno: Number((voce.release_date ?? '').slice(0, 4)) || 0,
    locandina: immagineTmdb(voce.poster_path, 'w185'),
    sinossi: (voce.overview ?? '').slice(0, 240),
  }
}

/** Ricerca per titolo. */
export async function cercaFilm(query: string): Promise<Esito<RisultatoTmdb[]>> {
  const testo = query.trim()
  if (!testo) return { ok: true, dati: [] }

  const esito = await chiedi<Elenco>('/search/movie', { query: testo, include_adult: 'false' })
  if (!esito.ok) return esito
  return { ok: true, dati: (esito.dati.results ?? []).slice(0, 20).map(inRisultato) }
}

/** Film attualmente nelle sale del paese configurato. */
export async function filmInSala(): Promise<Esito<RisultatoTmdb[]>> {
  const esito = await chiedi<Elenco>('/movie/now_playing', { region: PAESE })
  if (!esito.ok) return esito
  return { ok: true, dati: (esito.dati.results ?? []).slice(0, 20).map(inRisultato) }
}

/** Film in uscita nelle prossime settimane. */
export async function filmInArrivo(): Promise<Esito<RisultatoTmdb[]>> {
  const esito = await chiedi<Elenco>('/movie/upcoming', { region: PAESE })
  if (!esito.ok) return esito
  return { ok: true, dati: (esito.dati.results ?? []).slice(0, 20).map(inRisultato) }
}

/* ── Conversione nella scheda della piattaforma ───────────────────────────── */

/**
 * Classificazione d'età.
 *
 * TMDB restituisce le sigle di ciascun paese, e quelle italiane coincidono con
 * le nostre («T», «VM14», «VM18»). Quando il film non ha ancora un visto — o
 * quando arriva una sigla di un altro sistema — si torna a «T» e si lascia che
 * sia l'esercente a correggere: mettere un VM14 inventato su una scheda
 * pubblica è peggio che non metterne nessuno.
 */
function classificazioneDa(film: FilmTmdb): Classificazione {
  const perPaese = film.release_dates?.results?.find((voce) => voce.iso_3166_1 === PAESE)
  const sigla = perPaese?.release_dates?.find((voce) => voce.certification)?.certification ?? ''
  const pulita = sigla.trim().toUpperCase()
  return (CLASSIFICAZIONI as readonly string[]).includes(pulita)
    ? (pulita as Classificazione)
    : 'T'
}

/**
 * Due colori per il manifesto procedurale, ricavati dal titolo.
 *
 * Servono solo come rete: se la locandina di TMDB c'è, non si vedono mai. Ma
 * un film senza `poster_path` — e ce ne sono — deve comunque avere una scheda
 * presentabile, e quei due colori sono ciò che la rende tale.
 */
function paletteDa(titolo: string): [string, string] {
  let valore = 0x811c9dc5
  for (const carattere of titolo) {
    valore ^= carattere.charCodeAt(0)
    valore = Math.imul(valore, 0x01000193) >>> 0
  }
  const tinta = valore % 360
  return [`hsl(${tinta} 42% 16%)`, `hsl(${(tinta + 28) % 360} 68% 58%)`]
}

/**
 * Scheda della piattaforma a partire da una scheda TMDB.
 *
 * Quello che TMDB non sa non viene inventato: i formati di proiezione (IMAX,
 * 4DX, Dolby Atmos) dipendono dalla sala e non dal film, la frase d'effetto
 * resta quella di TMDB solo se esiste, e il film nasce **non visibile**. È una
 * scelta: l'importazione porta dentro la materia prima, la pubblicazione resta
 * un gesto di chi programma la sala.
 */
export function inFilm(scheda: FilmTmdb, esistente?: Film): Film {
  const titolo = scheda.title || scheda.original_title || 'Senza titolo'
  const dataUscita = scheda.release_date || ''
  const anno = Number(dataUscita.slice(0, 4)) || new Date().getFullYear()

  const cast: VoceCast[] = (scheda.credits?.cast ?? [])
    .slice(0, 12)
    .map((voce) => ({ nome: voce.name, ruolo: voce.character ?? '' }))

  const regista =
    (scheda.credits?.crew ?? []).find((voce) => voce.job === 'Director')?.name ?? ''

  // Fra i video si prende il primo trailer ufficiale su YouTube: gli altri
  // sono scene tagliate, spot televisivi e dietro le quinte.
  const video = (scheda.videos?.results ?? []).find(
    (voce) => voce.site === 'YouTube' && voce.type === 'Trailer',
  )

  const oggi = new Date().toISOString().slice(0, 10)

  return {
    id: esistente?.id ?? nuovoId('film'),
    slug: esistente?.slug ?? inSlug(`${titolo} ${anno}`) ?? nuovoId('film'),
    titolo,
    titoloOriginale: scheda.original_title ?? titolo,
    sottotitolo: scheda.tagline ?? '',
    sinossi: (scheda.overview ?? '').slice(0, 320),
    trama: scheda.overview ?? '',
    generi: (scheda.genres ?? []).map((voce) => voce.name).slice(0, 4),
    durataMinuti: scheda.runtime && scheda.runtime > 0 ? scheda.runtime : 100,
    anno,
    classificazione: classificazioneDa(scheda),
    lingua: (scheda.original_language ?? '').toUpperCase(),
    paese: scheda.production_countries?.[0]?.name ?? '',
    regista,
    cast,
    // I formati dipendono dalla sala, non dal film: li sceglie chi programma.
    formati: esistente?.formati ?? ['2D'],
    trailer: video
      ? { piattaforma: 'youtube' as const, riferimento: video.key, durataSecondi: 0 }
      : (esistente?.trailer ?? null),
    locandina: immagineTmdb(scheda.poster_path, 'w500'),
    backdrop: immagineTmdb(scheda.backdrop_path, 'w1280'),
    palette: esistente?.palette ?? paletteDa(titolo),
    valutazione: Number((scheda.vote_average ?? 0).toFixed(1)),
    stato: dataUscita && dataUscita > oggi ? 'prossimamente' : 'in-sala',
    dataUscita: dataUscita || oggi,
    inEvidenza: esistente?.inEvidenza ?? false,
    // Nasce nascosto: chi importa decide quando e se pubblicarlo.
    visibile: esistente?.visibile ?? false,
    creatoIl: esistente?.creatoIl ?? new Date().toISOString(),
  }
}

/**
 * Scheda completa di un film, pronta da salvare.
 *
 * `append_to_response` fa arrivare interpreti, troupe, video e classificazioni
 * nella stessa richiesta: quattro chiamate diventano una, e su un'importazione
 * di venti titoli la differenza si sente.
 */
export async function schedaFilm(tmdbId: number, esistente?: Film): Promise<Esito<Film>> {
  const esito = await chiedi<FilmTmdb>(`/movie/${tmdbId}`, {
    append_to_response: 'credits,videos,release_dates',
  })
  if (!esito.ok) return esito
  return { ok: true, dati: inFilm(esito.dati, esistente) }
}
