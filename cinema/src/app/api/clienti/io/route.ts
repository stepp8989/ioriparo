import { modifica } from '@/lib/archivio'
import { richiediCliente, senzaPassword } from '@/lib/clienti'
import { progressoLivello, riscattaPunti } from '@/lib/loyalty'
import { corpoJson, elencoPulito, testoPulito } from '@/lib/protezione'
import type { Coupon } from '@/lib/tipi'
import { nuovoCodice, nuovoId, sommaGiorni, oggiIso, telefonoValido } from '@/lib/utili'

/**
 * Dati dell'area personale del cliente collegato.
 *
 *   GET    profilo, biglietti, punti, coupon, abbonamenti, notifiche
 *   PATCH  aggiorna profilo, preferenze e film preferiti
 *   POST   riscatta un premio del programma fedeltà
 *
 * Ogni operazione riguarda soltanto il cliente della sessione: l'identificativo
 * non arriva mai dal corpo della richiesta, si legge dal cookie firmato. È una
 * differenza che sembra piccola e non lo è — accettare un `clienteId` dal
 * browser significherebbe lasciar leggere e modificare l'account di chiunque.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const esito = await modifica((archivio) => {
    const prenotazioni = archivio.prenotazioni
      .filter((voce) => voce.clienteId === cliente.id)
      .sort((a, b) => `${b.data}${b.ora}`.localeCompare(`${a.data}${a.ora}`))

    const oggi = oggiIso()
    const adesso = new Date()

    return {
      cliente: senzaPassword(cliente),
      progresso: progressoLivello(cliente, archivio.livelliLoyalty),
      livelli: archivio.livelliLoyalty,
      premi: archivio.premiLoyalty.filter((premio) => premio.attivo),
      movimenti: archivio.movimentiPunti
        .filter((voce) => voce.clienteId === cliente.id)
        .slice(0, 40),
      // I biglietti si dividono in «prossime visioni» e «storico»: sono due
      // esigenze diverse — uno serve per entrare in sala, l'altro per
      // ricordarsi cosa si è visto.
      prossimi: prenotazioni.filter(
        (voce) =>
          voce.stato !== 'annullata' &&
          new Date(`${voce.data}T${voce.ora}:00`).getTime() > adesso.getTime() - 3 * 3_600_000,
      ),
      storico: prenotazioni.filter(
        (voce) =>
          voce.stato === 'annullata' ||
          new Date(`${voce.data}T${voce.ora}:00`).getTime() <= adesso.getTime() - 3 * 3_600_000,
      ),
      coupon: archivio.coupon.filter(
        (voce) => voce.clienteId === cliente.id && !voce.usato && voce.scadenza >= oggi,
      ),
      abbonamenti: archivio.sottoscrizioni
        .filter((voce) => voce.clienteId === cliente.id)
        .map((sottoscrizione) => ({
          sottoscrizione,
          piano: archivio.piani.find((piano) => piano.id === sottoscrizione.pianoId) ?? null,
        })),
      preferiti: archivio.film.filter((film) => cliente.preferiti.includes(film.id)),
      notifiche: archivio.notifiche.filter((voce) => voce.clienteId === cliente.id).slice(0, 20),
      impostazioni: archivio.impostazioni,
    }
  })

  return Response.json(esito, { headers: { 'Cache-Control': 'no-store' } })
}

export async function PATCH(richiesta: Request) {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)

  const esito = await modifica((archivio) => {
    const voce = archivio.clienti.find((riga) => riga.id === cliente.id)
    if (!voce) return { errore: 'Account non trovato.', stato: 404 } as const

    if (typeof corpo.nome === 'string') voce.nome = testoPulito(corpo.nome, 60) || voce.nome
    if (typeof corpo.cognome === 'string') {
      voce.cognome = testoPulito(corpo.cognome, 60) || voce.cognome
    }

    if (typeof corpo.telefono === 'string') {
      const telefono = testoPulito(corpo.telefono, 30)
      if (telefono && !telefonoValido(telefono)) {
        return { errore: 'Numero di telefono non valido.', stato: 400 } as const
      }
      voce.telefono = telefono
    }

    if (typeof corpo.cinemaPreferitoId === 'string') {
      const id = testoPulito(corpo.cinemaPreferitoId, 60)
      // Un cinema inesistente non viene salvato: comparirebbe come preferito
      // e non mostrerebbe mai nulla.
      voce.cinemaPreferitoId = archivio.cinema.some((cinema) => cinema.id === id) ? id : ''
    }

    if (corpo.preferenze && typeof corpo.preferenze === 'object') {
      const preferenze = corpo.preferenze as Record<string, unknown>
      // L'email non è disattivabile: è il canale con cui arrivano i biglietti.
      voce.preferenze = {
        email: true,
        push: preferenze.push === true,
        sms: preferenze.sms === true,
        generi: elencoPulito(preferenze.generi, 12, 40),
      }
    }

    // I preferiti si aggiungono e si tolgono uno alla volta: mandare l'elenco
    // intero renderebbe possibile cancellarlo per sbaglio con una richiesta a
    // metà.
    if (typeof corpo.preferito === 'string') {
      const filmId = testoPulito(corpo.preferito, 60)
      const esiste = archivio.film.some((film) => film.id === filmId)
      if (esiste) {
        voce.preferiti = voce.preferiti.includes(filmId)
          ? voce.preferiti.filter((id) => id !== filmId)
          : [...voce.preferiti, filmId]
      }
    }

    return { cliente: senzaPassword(voce) } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito)
}

/** Riscatto di un premio: i punti diventano un coupon spendibile al checkout. */
export async function POST(richiesta: Request) {
  const { cliente, blocco } = await richiediCliente()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const premioId = testoPulito(corpo.premioId, 60)

  const esito = await modifica((archivio) => {
    if (!archivio.impostazioni.moduli.loyalty) {
      return { errore: 'Il programma fedeltà non è attivo.', stato: 503 } as const
    }

    const premio = archivio.premiLoyalty.find((voce) => voce.id === premioId && voce.attivo)
    if (!premio) return { errore: 'Premio non disponibile.', stato: 404 } as const

    const aggiornato = archivio.clienti.find((voce) => voce.id === cliente.id)
    if (!aggiornato) return { errore: 'Account non trovato.', stato: 404 } as const

    if (aggiornato.punti < premio.puntiRichiesti) {
      return {
        errore: `Ti mancano ${premio.puntiRichiesti - aggiornato.punti} punti per questo premio.`,
        stato: 409,
      } as const
    }

    const riuscito = riscattaPunti(
      archivio,
      aggiornato.id,
      premio.puntiRichiesti,
      `Riscatto premio: ${premio.nome}`,
      premio.id,
    )
    if (!riuscito) return { errore: 'Punti non sufficienti.', stato: 409 } as const

    const coupon: Coupon = {
      id: nuovoId('cou'),
      codice: nuovoCodice(8),
      promozioneId: '',
      descrizione: premio.nome,
      // Tutti i premi diventano uno sconto in euro: un «popcorn omaggio»
      // realizzato come sconto pari al prezzo del popcorn è la stessa cosa per
      // chi lo riceve, ed è molto più semplice da far quadrare in cassa.
      tipo: 'fisso',
      valore: premio.valore,
      clienteId: aggiornato.id,
      // Novanta giorni: abbastanza per trovare l'occasione, non tanto da
      // lasciare in giro buoni dimenticati per anni.
      scadenza: sommaGiorni(oggiIso(), 90),
      usato: false,
      usatoIl: '',
      prenotazioneId: '',
      creatoIl: new Date().toISOString(),
    }

    archivio.coupon.unshift(coupon)
    return { coupon, puntiResidui: aggiornato.punti } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })
  return Response.json(esito, { status: 201 })
}
