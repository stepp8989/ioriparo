import { leggi } from '@/lib/archivio'
import {
  apriSessioneCliente,
  chiudiSessioneCliente,
  passwordCombacia,
} from '@/lib/clienti'
import { SEGRETO } from '@/lib/firma'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import { emailValida } from '@/lib/utili'

/**
 * Accesso all'area clienti.
 *
 *   POST    verifica le credenziali e apre la sessione
 *   DELETE  chiude la sessione
 */

export async function POST(richiesta: Request) {
  if (troppeRichieste(`cliente-accesso:${chiamante(richiesta)}`, 8, 15)) {
    return Response.json(
      { errore: 'Troppi tentativi. Riprovate fra un quarto d’ora.' },
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
  const email = testoPulito(corpo.email, 120).toLowerCase()
  const password = typeof corpo.password === 'string' ? corpo.password : ''

  if (!emailValida(email) || password.length === 0) {
    return Response.json({ errore: 'Credenziali non valide.' }, { status: 400 })
  }

  const { clienti } = await leggi()
  const cliente = clienti.find((voce) => voce.email === email)

  /**
   * Il confronto della password si esegue anche quando l'account non esiste,
   * su un'impronta fittizia: senza, il tempo di risposta rivelerebbe quali
   * indirizzi sono registrati e quali no.
   */
  const impronta = cliente?.password ?? 'scrypt$c2FsZQ$aW1wcm9udGE'
  const corretta = await passwordCombacia(password, impronta)

  if (!cliente || !corretta) {
    return Response.json({ errore: 'Email o password non corretti.' }, { status: 401 })
  }

  await apriSessioneCliente(cliente.id)
  return Response.json({ esito: 'accesso effettuato' })
}

export async function DELETE() {
  await chiudiSessioneCliente()
  return Response.json({ esito: 'sessione chiusa' })
}
