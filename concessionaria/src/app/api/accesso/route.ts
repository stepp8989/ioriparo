import {
  apriSessione,
  chiudiSessione,
  configurazioneCompleta,
  passwordCorretta,
  sessioneAttiva,
} from '@/lib/sessione'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'

/**
 * Accesso al pannello di amministrazione.
 *
 *   GET     dice se la sessione è ancora valida
 *   POST    verifica la password e apre la sessione
 *   DELETE  chiude la sessione
 */

export async function GET() {
  return Response.json({
    autenticato: await sessioneAttiva(),
    configurato: configurazioneCompleta(),
  })
}

export async function POST(richiesta: Request) {
  // Cinque tentativi ogni quarto d'ora: una password sbagliata capita, cento
  // tentativi in un minuto no.
  if (troppeRichieste(`accesso:${chiamante(richiesta)}`, 5, 15)) {
    return Response.json(
      { errore: 'Troppi tentativi. Riprovate fra un quarto d’ora.' },
      { status: 429 },
    )
  }

  if (!configurazioneCompleta()) {
    return Response.json(
      {
        errore:
          'Il pannello non è configurato: mancano PANNELLO_PASSWORD e PANNELLO_SEGRETO nelle variabili d’ambiente.',
      },
      { status: 503 },
    )
  }

  const corpo = await corpoJson(richiesta)
  const password = testoPulito(corpo.password, 200)

  if (!passwordCorretta(password)) {
    // Nessun dettaglio su cosa fosse sbagliato: è un'informazione utile solo a
    // chi sta tentando di indovinare.
    return Response.json({ errore: 'Password non corretta.' }, { status: 401 })
  }

  await apriSessione()
  return Response.json({ esito: 'accesso effettuato' })
}

export async function DELETE() {
  await chiudiSessione()
  return Response.json({ esito: 'sessione chiusa' })
}
