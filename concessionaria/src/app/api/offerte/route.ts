import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { corpoJson, dataPulita, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { Offerta } from '@/lib/tipi'
import { fraGiorni, nuovoId } from '@/lib/utili'

/**
 * Promozioni mostrate in home.
 *
 *   GET    riservata — elenco completo, scadute comprese
 *   POST   riservata — crea un'offerta
 *   PUT    riservata — sostituisce un'offerta
 *   PATCH  riservata — attiva o disattiva
 *   DELETE riservata — elimina definitivamente
 */

function offertaDalCorpo(corpo: Record<string, unknown>, esistente?: Offerta): Offerta {
  return {
    id: esistente?.id ?? nuovoId('off'),
    titolo: testoPulito(corpo.titolo, 120) || esistente?.titolo || 'Offerta',
    sottotitolo: testoPulito(corpo.sottotitolo, 160),
    descrizione: testoPulito(corpo.descrizione, 1_200),
    veicoloId: testoPulito(corpo.veicoloId, 60) || null,
    etichetta: testoPulito(corpo.etichetta, 30) || 'Promozione',
    // Senza scadenza indicata si mette un mese: un'offerta senza fine non è
    // un'offerta, ed è il modo più comune di lasciare online promozioni morte.
    scadenza: dataPulita(corpo.scadenza) || esistente?.scadenza || fraGiorni(30),
    immagine: testoPulito(corpo.immagine, 300) || '/immagini/offerte/ceramica-omaggio.jpg',
    attiva: corpo.attiva !== false,
  }
}

function rigenera() {
  revalidatePath('/')
  revalidatePath('/admin/offerte')
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { offerte } = await leggi()
  return Response.json({ offerte })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const offerta = offertaDalCorpo(await corpoJson(richiesta))

  await modifica((archivio) => {
    archivio.offerte.unshift(offerta)
  })

  rigenera()
  return Response.json({ offerta }, { status: 201 })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)

  const aggiornata = await modifica((archivio) => {
    const posizione = archivio.offerte.findIndex((voce) => voce.id === id)
    if (posizione === -1) return null

    const offerta = offertaDalCorpo(corpo, archivio.offerte[posizione])
    archivio.offerte[posizione] = offerta
    return offerta
  })

  if (!aggiornata) return Response.json({ errore: 'Offerta non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ offerta: aggiornata })
}

export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)
  const attiva = corpo.attiva !== false

  const trovata = await modifica((archivio) => {
    const offerta = archivio.offerte.find((voce) => voce.id === id)
    if (!offerta) return false
    offerta.attiva = attiva
    return true
  })

  if (!trovata) return Response.json({ errore: 'Offerta non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ esito: 'aggiornata' })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimossa = await modifica((archivio) => {
    const posizione = archivio.offerte.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.offerte.splice(posizione, 1)
    return true
  })

  if (!rimossa) return Response.json({ errore: 'Offerta non trovata.' }, { status: 404 })

  rigenera()
  return Response.json({ esito: 'eliminata' })
}
