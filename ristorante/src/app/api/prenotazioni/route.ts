import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { avvisaStaff, confermaPrenotazione } from '@/lib/posta'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { chiamante, corpoJson, numeroIntero, testoPulito, troppeRichieste } from '@/lib/protezione'
import type { Prenotazione } from '@/lib/tipi'
import { emailValida, nuovoCodice, nuovoId, oggiIso, telefonoValido } from '@/lib/utili'
import { RISTORANTE } from '@/dati/ristorante'

/**
 * Prenotazioni.
 *
 *   POST  pubblica  — registra una richiesta e invia la conferma
 *   GET   riservata — elenco completo per il pannello
 */

export async function POST(richiesta: Request) {
  // Un modulo di prenotazione legittimo non viene inviato dieci volte di fila.
  if (troppeRichieste(`prenotazione:${chiamante(richiesta)}`, 5, 15)) {
    return Response.json(
      { errore: 'Troppe richieste ravvicinate. Riprovate fra qualche minuto o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)

  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const telefono = testoPulito(corpo.telefono, 30)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const data = testoPulito(corpo.data, 10)
  const ora = testoPulito(corpo.ora, 5)
  const note = testoPulito(corpo.note, 600)
  const persone = numeroIntero(corpo.persone, 1, RISTORANTE.massimoPersoneOnline, 2)

  // Gli stessi controlli del modulo, ripetuti qui: il client non fa testo.
  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (cognome.length < 2) errori.push('cognome')
  if (!telefonoValido(telefono)) errori.push('telefono')
  if (!emailValida(email)) errori.push('email')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < oggiIso()) errori.push('data')
  if (!/^\d{2}:\d{2}$/.test(ora)) errori.push('ora')

  if (errori.length > 0) {
    return Response.json(
      { errore: `Controllate questi campi: ${errori.join(', ')}.` },
      { status: 400 },
    )
  }

  // Il giorno scelto deve essere di apertura: gli orari possono essere
  // cambiati dal pannello mentre il modulo era già aperto nel browser.
  const { orari } = await leggi()
  const giorni = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  const giorno = orari.find((voce) => voce.giorno === giorni[new Date(`${data}T12:00:00`).getDay()])

  if (!giorno || giorno.chiuso) {
    return Response.json({ errore: 'Quel giorno il ristorante è chiuso.' }, { status: 400 })
  }

  const prenotazione: Prenotazione = {
    id: nuovoId('pre'),
    codice: nuovoCodice(),
    nome,
    cognome,
    telefono,
    email,
    persone,
    data,
    ora,
    note,
    stato: 'confermata',
    creataIl: new Date().toISOString(),
  }

  await modifica((archivio) => {
    archivio.prenotazioni.unshift(prenotazione)
  })

  // Le email partono senza bloccare la risposta: la prenotazione è già salvata
  // e il cliente vede subito la conferma a schermo.
  void confermaPrenotazione(prenotazione)
  void avvisaStaff(prenotazione)

  return Response.json({ codice: prenotazione.codice, stato: prenotazione.stato }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { prenotazioni } = await leggi()
  return Response.json({ prenotazioni })
}

/** Aggiorna lo stato di una prenotazione (conferma o annullamento). */
export async function PATCH(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)
  const id = testoPulito(corpo.id, 60)
  const stato = testoPulito(corpo.stato, 20)

  if (!['in-attesa', 'confermata', 'annullata'].includes(stato)) {
    return Response.json({ errore: 'Stato non valido.' }, { status: 400 })
  }

  const trovata = await modifica((archivio) => {
    const prenotazione = archivio.prenotazioni.find((voce) => voce.id === id)
    if (!prenotazione) return false
    prenotazione.stato = stato as Prenotazione['stato']
    return true
  })

  if (!trovata) return Response.json({ errore: 'Prenotazione non trovata.' }, { status: 404 })

  revalidatePath('/admin/prenotazioni')
  return Response.json({ esito: 'aggiornata' })
}

/** Elimina definitivamente una prenotazione. */
export async function DELETE(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiesta.url).searchParams.get('id'), 60)

  const rimossa = await modifica((archivio) => {
    const posizione = archivio.prenotazioni.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.prenotazioni.splice(posizione, 1)
    return true
  })

  if (!rimossa) return Response.json({ errore: 'Prenotazione non trovata.' }, { status: 404 })

  revalidatePath('/admin/prenotazioni')
  return Response.json({ esito: 'eliminata' })
}
