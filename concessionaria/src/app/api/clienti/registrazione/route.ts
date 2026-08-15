import { leggi, modifica } from '@/lib/archivio'
import { apriSessioneCliente, impronta, LUNGHEZZA_MINIMA_PASSWORD } from '@/lib/clienti'
import { SEGRETO } from '@/lib/firma'
import { benvenutoCliente } from '@/lib/posta'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import type { Cliente } from '@/lib/tipi'
import { emailValida, nuovoId, telefonoValido } from '@/lib/utili'

/**
 * Registrazione di un nuovo cliente.
 *
 * Al termine la sessione viene aperta subito: chi si è appena registrato non
 * deve reinserire le stesse credenziali un istante dopo.
 */
export async function POST(richiesta: Request) {
  if (troppeRichieste(`registrazione:${chiamante(richiesta)}`, 4, 30)) {
    return Response.json(
      { errore: 'Troppe registrazioni ravvicinate. Riprovate più tardi.' },
      { status: 429 },
    )
  }

  if (!SEGRETO) {
    return Response.json(
      {
        errore:
          'L’area clienti non è configurata: manca PANNELLO_SEGRETO nelle variabili d’ambiente.',
      },
      { status: 503 },
    )
  }

  const corpo = await corpoJson(richiesta)

  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 30)
  const password = typeof corpo.password === 'string' ? corpo.password : ''

  const errori: string[] = []
  if (nome.length < 2) errori.push('nome')
  if (cognome.length < 2) errori.push('cognome')
  if (!emailValida(email)) errori.push('email')
  if (!telefonoValido(telefono)) errori.push('telefono')
  if (password.length < LUNGHEZZA_MINIMA_PASSWORD) errori.push('password')

  if (errori.length > 0) {
    return Response.json({ errore: `Controllate questi campi: ${errori.join(', ')}.` }, { status: 400 })
  }

  const { clienti } = await leggi()
  if (clienti.some((voce) => voce.email === email)) {
    return Response.json(
      { errore: 'Esiste già un account con questa email. Provate ad accedere.' },
      { status: 409 },
    )
  }

  const cliente: Cliente = {
    id: nuovoId('cli'),
    nome,
    cognome,
    email,
    telefono,
    password: await impronta(password),
    codiceFiscale: '',
    indirizzo: '',
    citta: '',
    cap: '',
    documenti: [],
    acquisti: [],
    creatoIl: new Date().toISOString(),
  }

  /**
   * Il controllo dell'email già esistente si ripete dentro la modifica: fra la
   * lettura di poco fa e la scrittura potrebbe essersi inserita un'altra
   * registrazione con lo stesso indirizzo.
   */
  const creato = await modifica((archivio) => {
    if (archivio.clienti.some((voce) => voce.email === email)) return false
    archivio.clienti.unshift(cliente)
    return true
  })

  if (!creato) {
    return Response.json(
      { errore: 'Esiste già un account con questa email. Provate ad accedere.' },
      { status: 409 },
    )
  }

  await apriSessioneCliente(cliente.id)
  void benvenutoCliente(nome, email)

  return Response.json({ esito: 'registrato' }, { status: 201 })
}
