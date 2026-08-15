import { revalidatePath } from 'next/cache'
import { leggi, modifica } from '@/lib/archivio'
import { clienteCollegatoId } from '@/lib/clienti'
import { avvisaStaffRichiesta, confermaRichiesta } from '@/lib/posta'
import {
  chiamante,
  corpoJson,
  dataPulita,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  testoPulito,
  troppeRichieste,
} from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import {
  STATI_RICHIESTA,
  TIPI_RICHIESTA,
  type DatiFinanziamento,
  type DatiPermuta,
  type Richiesta,
} from '@/lib/tipi'
import { emailValida, nuovoCodice, nuovoId, oggiIso, telefonoValido } from '@/lib/utili'

/**
 * Richieste commerciali: informazioni, test drive, finanziamento, permuta,
 * preventivo.
 *
 *   POST   pubblica  — registra la richiesta e manda le email
 *   GET    riservata — elenco per il pannello
 *   PATCH  riservata — cambia lo stato di lavorazione
 *   DELETE riservata — elimina definitivamente
 */

export async function POST(richiestaHttp: Request) {
  // Un modulo legittimo non viene inviato dieci volte di fila.
  if (troppeRichieste(`richiesta:${chiamante(richiestaHttp)}`, 6, 15)) {
    return Response.json(
      { errore: 'Troppe richieste ravvicinate. Riprovate fra qualche minuto o chiamateci.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiestaHttp)

  const tipo = fraLeVoci(corpo.tipo, TIPI_RICHIESTA) ? corpo.tipo : 'informazioni'
  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const telefono = testoPulito(corpo.telefono, 30)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const messaggio = testoPulito(corpo.messaggio, 1500)

  // Gli stessi controlli del modulo, ripetuti qui: il client non fa testo.
  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (cognome.length < 2) errori.push('cognome')
  if (!telefonoValido(telefono)) errori.push('telefono')
  if (!emailValida(email)) errori.push('email')

  const data = tipo === 'test-drive' ? dataPulita(corpo.data) : ''
  const ora = tipo === 'test-drive' ? testoPulito(corpo.ora, 5) : ''

  if (tipo === 'test-drive') {
    if (!data || data < oggiIso()) errori.push('data')
    if (!/^\d{2}:\d{2}$/.test(ora)) errori.push('ora')
  }

  if (errori.length > 0) {
    return Response.json({ errore: `Controllate questi campi: ${errori.join(', ')}.` }, { status: 400 })
  }

  /**
   * Il veicolo indicato dal client viene sempre riletto dall'archivio: il
   * titolo che finisce nella richiesta e nelle email deve essere quello vero,
   * non quello arrivato dal browser, che è modificabile.
   */
  const veicoloId = testoPulito(corpo.veicoloId, 60) || null
  const { veicoli } = await leggi()
  const veicolo = veicoloId ? (veicoli.find((voce) => voce.id === veicoloId) ?? null) : null

  const finanziamento: DatiFinanziamento | null =
    tipo === 'finanziamento' && typeof corpo.finanziamento === 'object' && corpo.finanziamento
      ? (() => {
          const dati = corpo.finanziamento as Record<string, unknown>
          return {
            importo: numeroDecimale(dati.importo, 0, 500_000, 0),
            anticipo: numeroDecimale(dati.anticipo, 0, 500_000, 0),
            durataMesi: numeroIntero(dati.durataMesi, 6, 120, 60),
            rata: numeroDecimale(dati.rata, 0, 20_000, 0),
            taeg: numeroDecimale(dati.taeg, 0, 30, 0),
          }
        })()
      : null

  const permuta: DatiPermuta | null =
    tipo === 'permuta' && typeof corpo.permuta === 'object' && corpo.permuta
      ? (() => {
          const dati = corpo.permuta as Record<string, unknown>
          return {
            marca: testoPulito(dati.marca, 40),
            modello: testoPulito(dati.modello, 60),
            anno: numeroIntero(dati.anno, 1950, new Date().getFullYear(), new Date().getFullYear()),
            chilometri: numeroIntero(dati.chilometri, 0, 1_500_000, 0),
          }
        })()
      : null

  const nuova: Richiesta = {
    id: nuovoId('ric'),
    codice: nuovoCodice(),
    tipo,
    veicoloId: veicolo?.id ?? null,
    veicoloTitolo: veicolo
      ? `${veicolo.marca} ${veicolo.modello} ${veicolo.allestimento}`.trim()
      : testoPulito(corpo.veicoloTitolo, 120),
    nome,
    cognome,
    telefono,
    email,
    messaggio,
    data: data || null,
    ora: ora || null,
    finanziamento,
    permuta,
    stato: 'nuova',
    clienteId: await clienteCollegatoId(),
    creataIl: new Date().toISOString(),
  }

  await modifica((archivio) => {
    archivio.richieste.unshift(nuova)
  })

  // Le email partono senza bloccare la risposta: la richiesta è già salvata e
  // il cliente vede subito la conferma a schermo.
  void confermaRichiesta(nuova)
  void avvisaStaffRichiesta(nuova)

  return Response.json({ codice: nuova.codice }, { status: 201 })
}

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const { richieste } = await leggi()
  return Response.json({ richieste })
}

export async function PATCH(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiestaHttp)
  const id = testoPulito(corpo.id, 60)

  if (!fraLeVoci(corpo.stato, STATI_RICHIESTA)) {
    return Response.json({ errore: 'Stato non valido.' }, { status: 400 })
  }
  const stato = corpo.stato

  const trovata = await modifica((archivio) => {
    const richiesta = archivio.richieste.find((voce) => voce.id === id)
    if (!richiesta) return false
    richiesta.stato = stato
    return true
  })

  if (!trovata) return Response.json({ errore: 'Richiesta non trovata.' }, { status: 404 })

  revalidatePath('/admin/richieste')
  return Response.json({ esito: 'aggiornata' })
}

export async function DELETE(richiestaHttp: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const id = testoPulito(new URL(richiestaHttp.url).searchParams.get('id'), 60)

  const rimossa = await modifica((archivio) => {
    const posizione = archivio.richieste.findIndex((voce) => voce.id === id)
    if (posizione === -1) return false
    archivio.richieste.splice(posizione, 1)
    return true
  })

  if (!rimossa) return Response.json({ errore: 'Richiesta non trovata.' }, { status: 404 })

  revalidatePath('/admin/richieste')
  return Response.json({ esito: 'eliminata' })
}
