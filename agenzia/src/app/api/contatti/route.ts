import { TIPI_SITO } from '@/dati/contenuti'
import { registra } from '@/lib/archivio'
import { avvisaNuovaRichiesta, confermaAlCliente } from '@/lib/posta'
import { chiamante, corpoJson, testoPulito, troppeRichieste } from '@/lib/protezione'
import type { Richiesta } from '@/lib/tipi'
import { emailValida, nuovoId } from '@/lib/utili'

/**
 * Richieste di preventivo.
 *
 * Unica rotta pubblica del sito, e l'unica che scrive qualcosa: merita quindi
 * di essere trattata come se qualcuno ci provasse davvero. In ordine:
 *
 *  1. un tetto agli invii ravvicinati dallo stesso indirizzo;
 *  2. il campo esca, che intercetta i moduli compilati da un automatismo;
 *  3. la ripulitura di ogni testo, con una lunghezza massima per campo;
 *  4. i controlli veri, ripetuti qui anche se il modulo li ha già fatti,
 *     perché quelli del browser non contano nulla per chi non usa il browser;
 *  5. la registrazione, che avviene *prima* dell'invio delle email: se il
 *     servizio di posta è spento o non risponde, la richiesta non si perde.
 *
 * Le due email partono in parallelo e un loro fallimento non fa fallire la
 * risposta: chi ha scritto ha comunque compiuto la sua parte, e vedersi un
 * errore rosso dopo aver compilato tutto sarebbe ingiusto oltre che inutile.
 */
export async function POST(richiesta: Request) {
  if (troppeRichieste(`contatti:${chiamante(richiesta)}`, 4, 15)) {
    return Response.json(
      { errore: 'Troppe richieste ravvicinate. Riprova fra qualche minuto, o chiamami pure.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)

  // Campo esca: nascosto nel modulo, quindi solo un automatismo lo compila.
  // Si risponde come se fosse andato tutto bene, per non insegnargli niente.
  if (testoPulito(corpo.sito, 60) !== '') {
    return Response.json({ messaggio: 'Richiesta inviata.' }, { status: 201 })
  }

  const nome = testoPulito(corpo.nome, 80)
  const azienda = testoPulito(corpo.azienda, 120)
  const email = testoPulito(corpo.email, 160).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 40)
  const messaggio = testoPulito(corpo.messaggio, 4000)

  // Il tipo di sito deve essere una delle voci del menu: qualsiasi altra cosa
  // arrivi, si ricade sull'ultima («Non lo so ancora»).
  const proposto = testoPulito(corpo.tipoSito, 60)
  const tipoSito = (TIPI_SITO as readonly string[]).includes(proposto)
    ? proposto
    : TIPI_SITO[TIPI_SITO.length - 1]

  if (nome.length < 2 || !emailValida(email) || messaggio.length < 10) {
    return Response.json(
      { errore: 'Servono il nome, un indirizzo email valido e due righe su cosa ti serve.' },
      { status: 400 },
    )
  }

  const nuova: Richiesta = {
    id: nuovoId('req'),
    nome,
    azienda,
    email,
    telefono,
    tipoSito,
    messaggio,
    creataIl: new Date().toISOString(),
  }

  await registra(nuova)

  // `allSettled`: la conferma al cliente non deve dipendere dalla notifica
  // interna, né viceversa.
  await Promise.allSettled([avvisaNuovaRichiesta(nuova), confermaAlCliente(nuova)])

  return Response.json(
    { messaggio: 'Richiesta ricevuta, grazie.' },
    { status: 201 },
  )
}
