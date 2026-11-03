import { leggi } from '@/lib/archivio'
import { disponibilita } from '@/lib/prenotazioni'
import { chiamante, testoPulito, troppeRichieste } from '@/lib/protezione'

/**
 * Disponibilità dei posti di uno spettacolo.
 *
 *   GET /api/disponibilita?spettacolo=spe-xxxx
 *
 * È la rotta che la mappa della sala interroga all'apertura e ogni volta che
 * torna in primo piano. Restituisce le chiavi dei posti occupati, non i nomi
 * di chi li ha prenotati: chi guarda la mappa deve sapere che il posto F8 non
 * è libero, non chi ci sarà seduto.
 *
 * Non è mai memorizzata in cache. È l'unico dato della piattaforma per cui una
 * risposta vecchia di trenta secondi produce un danno concreto — due persone
 * che comprano la stessa poltrona e una delle due in piedi.
 */

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(richiesta: Request) {
  if (troppeRichieste(`disponibilita:${chiamante(richiesta)}`, 240, 1)) {
    return Response.json({ errore: 'Troppe richieste.' }, { status: 429 })
  }

  const id = testoPulito(new URL(richiesta.url).searchParams.get('spettacolo'), 60)
  if (!id) return Response.json({ errore: 'Spettacolo non indicato.' }, { status: 400 })

  const archivio = await leggi()
  const spettacolo = archivio.spettacoli.find((voce) => voce.id === id)

  if (!spettacolo) {
    return Response.json({ errore: 'Spettacolo non trovato.' }, { status: 404 })
  }

  const sala = archivio.sale.find((voce) => voce.id === spettacolo.salaId)

  /*
   * Insieme alla disponibilità viene la pianta della sala.
   *
   * Sono due informazioni diverse — una cambia ogni minuto, l'altra una volta
   * l'anno — ma servono sempre insieme e sempre nello stesso momento.
   * Mandarle in due richieste separate significherebbe disegnare la mappa in
   * due tempi, con le poltrone che compaiono prima e gli stati che arrivano
   * dopo: l'effetto è quello di un'interfaccia che cambia sotto le dita mentre
   * si sta già scegliendo.
   *
   * Le piante di tutte le sale della rete messe insieme sarebbero invece
   * centinaia di chilobyte da mandare al browser per usarne una: è il motivo
   * per cui non viaggiano con la pagina.
   */
  return Response.json(
    {
      ...disponibilita(archivio, spettacolo),
      spettacolo,
      sala: sala
        ? {
            id: sala.id,
            nome: sala.nome,
            schema: sala.schema,
            supplemento: sala.supplemento,
            formati: sala.formati,
          }
        : null,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
