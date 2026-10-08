import { modifica } from '@/lib/archivio'
import { apriSessioneCliente, impronta, LUNGHEZZA_MINIMA_PASSWORD, senzaPassword } from '@/lib/clienti'
import { livelloPerPunti } from '@/lib/loyalty'
import { chiamante, corpoJson, dataPulita, testoPulito, troppeRichieste } from '@/lib/protezione'
import type { Cliente } from '@/lib/tipi'
import { emailValida, nuovoId, telefonoValido } from '@/lib/utili'

/**
 * Registrazione all'area personale.
 *
 *   POST /api/clienti/registrazione
 *
 * La password non viene mai conservata: si salva solo l'impronta prodotta da
 * scrypt con un sale diverso per ogni utente.
 *
 * Nota sulla risposta quando l'indirizzo è già registrato: qui viene detto
 * esplicitamente, e la scelta è deliberata. Nascondere l'informazione non
 * protegge granché — basta provare il recupero password per scoprirla — mentre
 * lascia chi si sta registrando davanti a un errore incomprensibile.
 */

export const dynamic = 'force-dynamic'

export async function POST(richiesta: Request) {
  if (troppeRichieste(`registrazione:${chiamante(richiesta)}`, 5, 30)) {
    return Response.json(
      { errore: 'Troppe registrazioni da questo dispositivo. Riprova più tardi.' },
      { status: 429 },
    )
  }

  const corpo = await corpoJson(richiesta)

  const nome = testoPulito(corpo.nome, 60)
  const cognome = testoPulito(corpo.cognome, 60)
  const email = testoPulito(corpo.email, 160).toLowerCase()
  const telefono = testoPulito(corpo.telefono, 30)
  const password = typeof corpo.password === 'string' ? corpo.password : ''
  const dataNascita = dataPulita(corpo.dataNascita)

  if (!nome || !cognome) {
    return Response.json({ errore: 'Nome e cognome sono obbligatori.' }, { status: 400 })
  }
  if (!emailValida(email)) {
    return Response.json({ errore: 'Indirizzo email non valido.' }, { status: 400 })
  }
  if (telefono && !telefonoValido(telefono)) {
    return Response.json({ errore: 'Numero di telefono non valido.' }, { status: 400 })
  }
  if (password.length < LUNGHEZZA_MINIMA_PASSWORD) {
    return Response.json(
      { errore: `La password deve avere almeno ${LUNGHEZZA_MINIMA_PASSWORD} caratteri.` },
      { status: 400 },
    )
  }

  const hash = await impronta(password)

  const esito = await modifica((archivio) => {
    if (!archivio.impostazioni.moduli.registrazione) {
      return { errore: 'Le registrazioni sono momentaneamente sospese.', stato: 503 } as const
    }

    if (archivio.clienti.some((voce) => voce.email === email)) {
      return {
        errore: 'Questo indirizzo è già registrato. Prova ad accedere.',
        stato: 409,
      } as const
    }

    const livello = livelloPerPunti(archivio.livelliLoyalty, 0)
    const adesso = new Date().toISOString()

    const cliente: Cliente = {
      id: nuovoId('cli'),
      nome,
      cognome,
      email,
      telefono,
      password: hash,
      dataNascita,
      cinemaPreferitoId: testoPulito(corpo.cinemaPreferitoId, 60),
      preferenze: {
        // L'email è l'unico canale attivo di partenza: serve a mandare i
        // biglietti, e senza non si potrebbe usare il servizio. Push e SMS
        // restano spenti finché non è l'utente a chiederli.
        email: true,
        push: false,
        sms: false,
        generi: [],
      },
      preferiti: [],
      punti: 0,
      puntiStorici: 0,
      livelloId: livello?.id ?? '',
      creatoIl: adesso,
      ultimoAccesso: adesso,
      attivo: true,
    }

    archivio.clienti.unshift(cliente)
    return { cliente } as const
  })

  if ('errore' in esito) return Response.json({ errore: esito.errore }, { status: esito.stato })

  await apriSessioneCliente(esito.cliente.id)
  return Response.json({ cliente: senzaPassword(esito.cliente) }, { status: 201 })
}
