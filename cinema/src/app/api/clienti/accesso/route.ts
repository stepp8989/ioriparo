import { modifica } from '@/lib/archivio'
import {
  apriSessioneCliente,
  chiudiSessioneCliente,
  clienteCollegato,
  passwordCombacia,
  senzaPassword,
} from '@/lib/clienti'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'

/**
 * Accesso e uscita dall'area personale.
 *
 *   GET     dice chi è collegato
 *   POST    verifica le credenziali e apre la sessione
 *   DELETE  chiude la sessione
 *
 * Il messaggio d'errore è sempre lo stesso — «credenziali non corrette» — sia
 * che l'indirizzo non esista, sia che la password sia sbagliata: la differenza
 * fra i due casi è utile solo a chi sta cercando di indovinare.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const cliente = await clienteCollegato()
  return Response.json({ cliente: cliente ? senzaPassword(cliente) : null })
}

export async function POST(richiesta: Request) {
  const chiave = chiamante(richiesta)

  // Dieci tentativi ogni quarto d'ora: una password dimenticata e riprovata
  // qualche volta ci sta, una sequenza automatica no.
  if (troppeRichieste(`accesso-cliente:${chiave}`, 10, 15)) {
    return Response.json(
      { errore: 'Troppi tentativi di accesso. Riprova fra un quarto d’ora.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)
  const email = testoPulito(corpo.email, 160).toLowerCase()
  const password = typeof corpo.password === 'string' ? corpo.password : ''

  const generico = Response.json({ errore: 'Credenziali non corrette.' }, { status: 401 })

  if (!email || !password) return generico

  const esito = await modifica(async (archivio) => {
    const cliente = archivio.clienti.find((voce) => voce.email === email)
    if (!cliente || !cliente.attivo) return null

    const corretta = await passwordCombacia(password, cliente.password)
    if (!corretta) return null

    cliente.ultimoAccesso = new Date().toISOString()
    return cliente
  })

  if (!esito) return generico

  await apriSessioneCliente(esito.id)
  return Response.json({ cliente: senzaPassword(esito) })
}

export async function DELETE() {
  await chiudiSessioneCliente()
  return Response.json({ esito: 'sessione chiusa' })
}
