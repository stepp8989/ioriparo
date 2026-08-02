import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { corpoJson, numeroIntero, testoPulito } from '@/lib/protezione'
import { ALLERGENI, CATEGORIE, type Allergene, type Categoria, type Piatto } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/**
 * Gestione del menù dal pannello.
 *
 *   GET     elenco completo (anche i piatti nascosti)
 *   POST    nuovo piatto
 *   PATCH   modifica di un piatto esistente
 *   DELETE  eliminazione
 *
 * Dopo ogni modifica si invalidano le pagine che mostrano il menù, così il
 * sito pubblico — che è statico, e quindi velocissimo — si aggiorna subito
 * senza aspettare una nuova compilazione.
 */

/** Pagine che dipendono dal menù. */
function aggiornaPagine() {
  revalidatePath('/')
  revalidatePath('/menu')
  revalidatePath('/admin/menu')
}

/** Prezzo in euro con due decimali, entro limiti ragionevoli per un menù. */
function prezzoValido(valore: unknown, ripiego: number): number {
  const numero = Number(valore)
  if (!Number.isFinite(numero) || numero < 0) return ripiego
  return Math.round(Math.min(numero, 1000) * 100) / 100
}

/** Ricava un piatto valido dai dati ricevuti, appoggiandosi ai valori esistenti. */
function componiPiatto(corpo: Record<string, unknown>, precedente?: Piatto): Piatto {
  const categoria = testoPulito(corpo.categoria, 20)
  const etichetta = testoPulito(corpo.etichetta, 20)

  const allergeni = Array.isArray(corpo.allergeni)
    ? (corpo.allergeni
        .map((voce) => testoPulito(voce, 30))
        .filter((voce): voce is Allergene =>
          (ALLERGENI as readonly string[]).includes(voce),
        ) as Allergene[])
    : (precedente?.allergeni ?? [])

  return {
    id: precedente?.id ?? nuovoId('piatto'),
    nome: testoPulito(corpo.nome, 80) || (precedente?.nome ?? ''),
    descrizione: testoPulito(corpo.descrizione, 400) || (precedente?.descrizione ?? ''),
    prezzo: prezzoValido(corpo.prezzo, precedente?.prezzo ?? 0),
    categoria: (CATEGORIE as readonly string[]).includes(categoria)
      ? (categoria as Categoria)
      : (precedente?.categoria ?? 'antipasti'),
    allergeni,
    etichetta:
      etichetta === 'novita' || etichetta === 'consigliato'
        ? etichetta
        : etichetta === ''
          ? null
          : (precedente?.etichetta ?? null),
    immagine:
      testoPulito(corpo.immagine, 200) ||
      precedente?.immagine ||
      '/immagini/ambienti/menu-copertina.jpg',
    visibile: typeof corpo.visibile === 'boolean' ? corpo.visibile : (precedente?.visibile ?? true),
    inEvidenza:
      typeof corpo.inEvidenza === 'boolean' ? corpo.inEvidenza : (precedente?.inEvidenza ?? false),
    ordine: numeroIntero(corpo.ordine, 0, 999, precedente?.ordine ?? 99),
  }
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { piatti } = await leggi()
  return Response.json({ piatti })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const piatto = componiPiatto(corpo)

  if (!piatto.nome) return Response.json({ errore: 'Il nome è obbligatorio.' }, { status: 400 })

  await modifica((archivio) => {
    archivio.piatti.push(piatto)
  })

  aggiornaPagine()
  return Response.json({ piatto }, { status: 201 })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornato = await modifica((archivio) => {
    const posizione = archivio.piatti.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const piatto = componiPiatto(corpo, archivio.piatti[posizione])
    archivio.piatti[posizione] = piatto
    return piatto
  })

  if (!aggiornato) return Response.json({ errore: 'Piatto non trovato.' }, { status: 404 })

  aggiornaPagine()
  return Response.json({ piatto: aggiornato })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.piatti.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.piatti.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Piatto non trovato.' }, { status: 404 })

  aggiornaPagine()
  return Response.json({ esito: 'eliminato' })
}
