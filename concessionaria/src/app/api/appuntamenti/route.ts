import { revalidatePath } from 'next/cache'
import { TRATTAMENTI } from '@/dati/servizi'
import { leggi, modifica } from '@/lib/archivio'
import { clienteCollegatoId } from '@/lib/clienti'
import { avvisaStaffAppuntamento, confermaAppuntamento } from '@/lib/posta'
import {
  chiamante,
  corpoJson,
  dataPulita,
  fraLeVoci,
  testoPulito,
  troppeRichieste,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { STATI_APPUNTAMENTO, type Appuntamento } from '@/lib/tipi'
import { emailValida, fraGiorni, nuovoCodice, nuovoId, oggiIso, telefonoValido } from '@/lib/utili'

/**
 * Appuntamenti del reparto detailing e dell'officina.
 *
 *   POST   pubblica  — registra la richiesta di appuntamento
 *   GET    riservata — elenco per il pannello
 *   PATCH  riservata — conferma, conclude o annulla
 *   DELETE riservata — elimina definitivamente
 */

export async function POST(richiestaHttp: Request) {
  if (troppeRichieste(`appuntamento:${chiamante(richiestaHttp)}`, 5, 15)) {
    return Response.json(
      { errore: 'Troppe richieste ravvicinate. Riprovate fra qualche minuto o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiestaHttp)

  // Il trattamento deve esistere davvero: nome e prezzo si leggono dal
  // listino, non da quello che arriva dal browser.
  const identificativo = testoPulito(corpo.servizio, 60)
  const trattamento = TRATTAMENTI.find((voce) => voce.id === identificativo)

  if (!trattamento) {
    return Response.json({ errore: 'Trattamento non riconosciuto.' }, { status: 400 })
  }

  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const telefono = testoPulito(corpo.telefono, 30)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const veicolo = testoPulito(corpo.veicolo, 80)
  const targa = testoPulito(corpo.targa, 12).toUpperCase()
  const data = dataPulita(corpo.data)
  const ora = testoPulito(corpo.ora, 5)
  const note = testoPulito(corpo.note, 800)

  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (cognome.length < 2) errori.push('cognome')
  if (!telefonoValido(telefono)) errori.push('telefono')
  if (!emailValida(email)) errori.push('email')
  if (veicolo.length < 2) errori.push('veicolo')
  if (!data || data < oggiIso() || data > fraGiorni(180)) errori.push('data')
  if (!/^\d{2}:\d{2}$/.test(ora)) errori.push('ora')

  if (errori.length > 0) {
    return Response.json({ errore: `Controllate questi campi: ${errori.join(', ')}.` }, { status: 400 })
  }

  const appuntamento: Appuntamento = {
    id: nuovoId('app'),
    codice: nuovoCodice(),
    servizio: trattamento.id,
    servizioNome: trattamento.nome,
    prezzo: trattamento.prezzoDa,
    nome,
    cognome,
    telefono,
    email,
    veicolo,
    targa,
    data,
    ora,
    note,
    stato: 'in-attesa',
    clienteId: await clienteCollegatoId(),
    creatoIl: new Date().toISOString(),
  }

  await modifica((archivio) => {
    archivio.appuntamenti.unshift(appuntamento)
  })

  void confermaAppuntamento(appuntamento)
  void avvisaStaffAppuntamento(appuntamento)

  return Response.json({ codice: appuntamento.codice }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { appuntamenti } = await leggi()
  return Response.json({ appuntamenti })
}

export async function PATCH(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiestaHttp)
  const id = testoPulito(corpo.id, 60)

  if (!fraLeVoci(corpo.stato, STATI_APPUNTAMENTO)) {
    return Response.json({ errore: 'Stato non valido.' }, { status: 400 })
  }
  const stato = corpo.stato

  const trovato = await modifica((archivio) => {
    const appuntamento = archivio.appuntamenti.find((voce) => voce.id === id)
    if (!appuntamento) return false
    appuntamento.stato = stato
    return true
  })

  if (!trovato) return Response.json({ errore: 'Appuntamento non trovato.' }, { status: 404 })

  revalidatePath('/admin/appuntamenti')
  return Response.json({ esito: 'aggiornato' })
}

export async function DELETE(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiestaHttp.url).searchParams.get('id'), 60)

  const rimosso = await modifica((archivio) => {
    const posizione = archivio.appuntamenti.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.appuntamenti.splice(posizione, 1)
    return true
  })

  if (!rimosso) return Response.json({ errore: 'Appuntamento non trovato.' }, { status: 404 })

  revalidatePath('/admin/appuntamenti')
  return Response.json({ esito: 'eliminato' })
}
