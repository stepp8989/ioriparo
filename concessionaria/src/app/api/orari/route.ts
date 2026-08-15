import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { corpoJson, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { OrarioGiorno } from '@/lib/tipi'

/**
 * Orari di apertura.
 *
 * Sono usati dal piè di pagina, dalla pagina Contatti e dai dati strutturati:
 * una modifica qui si riflette ovunque, ed è per questo che dopo il
 * salvataggio si rigenera anche la home.
 *
 *   GET  riservata — orari attuali
 *   PUT  riservata — sostituisce l'intera settimana
 */

const GIORNI = ['Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato', 'Domenica']

/** Accetta solo fasce nella forma «08:30 – 13:00»; altrimenti la considera assente. */
function fasciaPulita(valore: unknown): string | null {
  const testo = testoPulito(valore, 20)
  if (!testo) return null
  const corrispondenza = testo.match(/^(\d{1,2}[:.]\d{2})\s*[–-]\s*(\d{1,2}[:.]\d{2})$/)
  if (!corrispondenza) return null
  return `${corrispondenza[1].replace('.', ':')} – ${corrispondenza[2].replace('.', ':')}`
}

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
  const ricevuti = Array.isArray(corpo.orari) ? (corpo.orari as Record<string, unknown>[]) : []

  /**
   * La settimana viene ricostruita dai sette giorni noti invece che dai dati
   * ricevuti: così l'archivio ha sempre sette righe nell'ordine giusto, anche
   * se il modulo ne manda meno o le manda disordinate.
   */
  const orari: OrarioGiorno[] = GIORNI.map((giorno) => {
    const ricevuto = ricevuti.find((voce) => testoPulito(voce.giorno, 20) === giorno)
    const chiuso = ricevuto?.chiuso === true

    return {
      giorno,
      chiuso,
      mattina: chiuso ? null : fasciaPulita(ricevuto?.mattina),
      pomeriggio: chiuso ? null : fasciaPulita(ricevuto?.pomeriggio),
    }
  })

  await modifica((archivio) => {
    archivio.orari = orari
  })

  revalidatePath('/')
  revalidatePath('/contatti')
  revalidatePath('/admin/orari')

  return Response.json({ orari })
}
