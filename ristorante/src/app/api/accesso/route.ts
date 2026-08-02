import {
  apriSessione,
  chiudiSessione,
  configurazioneCompleta,
  passwordCorretta,
} from '@/lib/sessione'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'

/**
 * Accesso al pannello.
 *
 *   POST    verifica la password e apre la sessione
 *   DELETE  chiude la sessione
 *
 * Il limite sui tentativi vale per indirizzo di provenienza: dieci prove ogni
 * quarto d'ora sono più che sufficienti per chi la password ce l'ha davvero.
 */
export async function POST(richiesta: Request) {
  if (!configurazioneCompleta()) {
    return Response.json(
      {
        errore:
          'Pannello non configurato: impostate PANNELLO_PASSWORD e PANNELLO_SEGRETO fra le ' +
          'variabili d’ambiente e riavviate il sito.',
      },
      { status: 503 },
    )
  }

  if (troppeRichieste(`accesso:${chiamante(richiesta)}`, 10, 15)) {
    return Response.json(
      { errore: 'Troppi tentativi di accesso. Riprovate fra un quarto d’ora.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)
  const password = testoPulito(corpo.password, 200)

  if (!passwordCorretta(password)) {
    return Response.json({ errore: 'Password non corretta.' }, { status: 401 })
  }

  await apriSessione()
  return Response.json({ esito: 'accesso effettuato' })
}

export async function DELETE() {
  await chiudiSessione()
  return Response.json({ esito: 'uscita effettuata' })
}
