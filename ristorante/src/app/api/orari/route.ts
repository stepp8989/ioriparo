import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { corpoJson, testoPulito } from '@/lib/protezione'
import type { OrarioGiorno } from '@/lib/tipi'

/**
 * Orari di apertura.
 *
 * Si salvano tutti insieme: sono sette righe e modificarle in blocco evita
 * stati intermedi incoerenti, per esempio un sabato aggiornato e una domenica
 * ancora vecchia mentre qualcuno sta prenotando.
 */
export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { orari } = await leggi()
  return Response.json({ orari })
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  if (!Array.isArray(corpo.orari)) {
    return Response.json({ errore: 'Formato degli orari non valido.' }, { status: 400 })
  }

  const orari: OrarioGiorno[] = corpo.orari.map((voce) => {
    const riga = (voce ?? {}) as Record<string, unknown>
    const chiuso = riga.chiuso === true

    return {
      giorno: testoPulito(riga.giorno, 20),
      chiuso,
      // Un giorno di chiusura non può conservare fasce orarie residue.
      pranzo: chiuso ? null : testoPulito(riga.pranzo, 40) || null,
      cena: chiuso ? null : testoPulito(riga.cena, 40) || null,
    }
  })

  if (orari.length !== 7 || orari.some((giorno) => !giorno.giorno)) {
    return Response.json({ errore: 'Servono tutti e sette i giorni.' }, { status: 400 })
  }

  await modifica((archivio) => {
    archivio.orari = orari
  })

  // Gli orari compaiono nel piè di pagina di ogni pagina e nei dati strutturati.
  revalidatePath('/', 'layout')

  return Response.json({ orari })
}
