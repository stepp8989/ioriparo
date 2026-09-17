import { annota, leggi, modifica } from '@/lib/archivio'
import { codicePulito, corpoJson, dataPulita, numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import type { Coupon } from '@/lib/tipi'
import { nuovoCodice, nuovoId, oggiIso, sommaGiorni } from '@/lib/utili'

/**
 * Coupon personali.
 *
 *   GET     elenco completo
 *   POST    genera uno o più coupon
 *   DELETE  elimina un coupon non ancora usato
 *
 * Non usa il costruttore generico perché la creazione non è di una voce alla
 * volta: servono i lotti. Un gesto commerciale dopo un guasto alla sala
 * significa generare ottanta coupon in un colpo, non compilare ottanta moduli.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const archivio = await leggi()
  return Response.json({ voci: archivio.coupon }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)

  const quantita = numeroIntero(corpo.quantita, 1, 500, 1)
  const tipo = corpo.tipo === 'percentuale' ? 'percentuale' : 'fisso'
  const valore = numeroDecimale(corpo.valore, 0, tipo === 'percentuale' ? 100 : 500, 0)
  const descrizione = testoPulito(corpo.descrizione, 200) || 'Coupon'
  const clienteId = testoPulito(corpo.clienteId, 60)
  const scadenza = dataPulita(corpo.scadenza) || sommaGiorni(oggiIso(), 90)
  // Un codice indicato a mano ha senso solo per un coupon singolo: in un lotto
  // sarebbe lo stesso codice ripetuto, e il primo utilizzo li brucerebbe tutti.
  const codiceRichiesto = quantita === 1 ? codicePulito(corpo.codice, 20) : ''

  if (valore <= 0) return Response.json({ errore: 'Indica il valore del coupon.' }, { status: 400 })

  const esito = await modifica((archivio) => {
    if (clienteId && !archivio.clienti.some((voce) => voce.id === clienteId)) {
      return { errore: 'Cliente non trovato.', stato: 404 } as const
    }

    const occupati = new Set([
      ...archivio.coupon.map((voce) => voce.codice),
      ...archivio.promozioni.map((voce) => voce.codice).filter(Boolean),
    ])

    if (codiceRichiesto && occupati.has(codiceRichiesto)) {
      return { errore: `Il codice ${codiceRichiesto} è già in uso.`, stato: 409 } as const
    }

    const creati: Coupon[] = []

    for (let indice = 0; indice < quantita; indice += 1) {
      let codice = codiceRichiesto || nuovoCodice(8)
      let tentativi = 0
      while (occupati.has(codice) && tentativi < 30) {
        codice = nuovoCodice(8)
        tentativi += 1
      }
      occupati.add(codice)

      creati.push({
        id: nuovoId('cou'),
        codice,
        promozioneId: testoPulito(corpo.promozioneId, 60),
        descrizione,
        tipo,
        valore,
        clienteId,
        scadenza,
        usato: false,
        usatoIl: '',
        prenotazioneId: '',
        creatoIl: new Date().toISOString(),
      })
    }

    archivio.coupon.unshift(...creati)
    annota(archivio, 'gestione', 'coupon-generati', `${creati.length}`, descrizione)

    return { creati } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json({ coupon: esito.creati }, { status: 201 })
}

export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 80)

  const esito = await modifica((archivio) => {
    const indice = archivio.coupon.findIndex((voce) => voce.id === id)
    if (indice < 0) return { errore: 'Coupon non trovato.', stato: 404 } as const

    // Un coupon già speso è la prova di uno sconto applicato: si conserva,
    // altrimenti il conto della prenotazione resterebbe senza giustificazione.
    if (archivio.coupon[indice].usato) {
      return { errore: 'Il coupon è già stato utilizzato e non può essere eliminato.', stato: 409 } as const
    }

    archivio.coupon.splice(indice, 1)
    annota(archivio, 'gestione', 'coupon-eliminato', id)
    return { esito: 'eliminato' } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}
