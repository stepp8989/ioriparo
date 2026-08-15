import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import {
  corpoJson,
  dataPulita,
  elencoPulito,
  fraLeVoci,
  numeroIntero,
  testoPulito,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { CATEGORIE_ARTICOLO, type Articolo } from '@/lib/tipi'
import { inSlug, nuovoId, oggiIso } from '@/lib/utili'

/**
 * Articoli del blog, gestiti dal pannello.
 *
 *   GET    riservata — elenco completo, bozze comprese
 *   POST   riservata — crea un articolo
 *   PUT    riservata — sostituisce un articolo
 *   PATCH  riservata — pubblica, nasconde o mette in evidenza
 *   DELETE riservata — elimina definitivamente
 */

/** Stima dei minuti di lettura: la media di chi legge in italiano è ~200 parole al minuto. */
function minutiDiLettura(testo: string): number {
  const parole = testo.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(parole / 200))
}

function articoloDalCorpo(corpo: Record<string, unknown>, esistente?: Articolo): Articolo {
  const titolo = testoPulito(corpo.titolo, 160) || esistente?.titolo || 'Articolo senza titolo'
  const contenuto = testoPulito(corpo.contenuto, 40_000)

  return {
    id: esistente?.id ?? nuovoId('art'),
    // Come per i veicoli, l'indirizzo di un articolo già pubblicato non cambia.
    slug: esistente?.slug ?? (inSlug(titolo) || nuovoId('articolo')),
    titolo,
    sommario: testoPulito(corpo.sommario, 400),
    contenuto,
    categoria: fraLeVoci(corpo.categoria, CATEGORIE_ARTICOLO) ? corpo.categoria : 'guide',
    autore: testoPulito(corpo.autore, 80) || 'Redazione',
    data: dataPulita(corpo.data) || esistente?.data || oggiIso(),
    immagine: testoPulito(corpo.immagine, 300) || '/immagini/blog/auto-usata-garantita.jpg',
    // Il valore si ricalcola sempre dal testo: un numero scritto a mano e poi
    // dimenticato è peggio di nessun numero.
    minutiLettura: numeroIntero(corpo.minutiLettura, 1, 60, minutiDiLettura(contenuto)),
    tag: elencoPulito(corpo.tag, 12, 40),
    pubblicato: corpo.pubblicato !== false,
    inEvidenza: corpo.inEvidenza === true,
  }
}

function rigenera(slug?: string) {
  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  if (slug) revalidatePath(`/blog/${slug}`)
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { articoli } = await leggi()
  return Response.json({ articoli })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const articolo = articoloDalCorpo(await corpoJson(richiesta))

  const { articoli } = await leggi()
  if (articoli.some((voce) => voce.slug === articolo.slug)) {
    articolo.slug = `${articolo.slug}-${articolo.id.slice(-4)}`
  }

  await modifica((archivio) => {
    archivio.articoli.unshift(articolo)
  })

  rigenera(articolo.slug)
  return Response.json({ articolo }, { status: 201 })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const posizione = archivio.articoli.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const articolo = articoloDalCorpo(corpo, archivio.articoli[posizione])
    archivio.articoli[posizione] = articolo
    return articolo
  })

  if (!aggiornato) return Response.json({ errore: 'Articolo non trovato.' }, { status: 404 })

  rigenera(aggiornato.slug)
  return Response.json({ articolo: aggiornato })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const articolo = archivio.articoli.find((voce) => voce.id === id)
    if (!articolo) return null

    if (typeof corpo.pubblicato === 'boolean') articolo.pubblicato = corpo.pubblicato
    if (typeof corpo.inEvidenza === 'boolean') articolo.inEvidenza = corpo.inEvidenza

    return articolo
  })

  if (!aggiornato) return Response.json({ errore: 'Articolo non trovato.' }, { status: 404 })

  rigenera(aggiornato.slug)
  return Response.json({ articolo: aggiornato })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.articoli.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null
    return archivio.articoli.splice(posizione, 1)[0]
  })

  if (!rimosso) return Response.json({ errore: 'Articolo non trovato.' }, { status: 404 })

  rigenera(rimosso.slug)
  return Response.json({ esito: 'eliminato' })
}
