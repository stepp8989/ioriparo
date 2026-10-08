import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import {
  colorePulito,
  elencoPulito,
  numeroDecimale,
  oraPulita,
  testoPulito,
} from '@/lib/protezione'
import { SERVIZI_CINEMA, type Cinema, type OrarioApertura } from '@/lib/tipi'
import { inSlug, nuovoId } from '@/lib/utili'

/** Gestione delle strutture. */

function costruisci(
  corpo: Record<string, unknown>,
  _archivio: unknown,
  esistente?: Cinema,
): EsitoCostruzione<Cinema> {
  const nome = testoPulito(corpo.nome, 80) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome del cinema è obbligatorio.' }

  const citta = testoPulito(corpo.citta, 80) || esistente?.citta || ''
  if (!citta) return { ok: false, errore: 'La città è obbligatoria.' }

  const orariGrezzi = Array.isArray(corpo.orari) ? corpo.orari : []
  const orari: OrarioApertura[] = Array.from({ length: 7 }, (_, giorno) => {
    const riga = (orariGrezzi.find(
      (voce) => (voce as Record<string, unknown>)?.giorno === giorno,
    ) ?? {}) as Record<string, unknown>

    const precedente = esistente?.orari.find((voce) => voce.giorno === giorno)

    return {
      giorno,
      apertura: oraPulita(riga.apertura) || precedente?.apertura || '15:00',
      chiusura: oraPulita(riga.chiusura) || precedente?.chiusura || '23:59',
      chiuso: riga.chiuso === true,
    }
  })

  const coordinate = (corpo.coordinate ?? {}) as Record<string, unknown>

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('cin'),
      slug: esistente?.slug ?? inSlug(`${nome} ${citta}`) ?? nuovoId('cinema'),
      nome,
      descrizione: testoPulito(corpo.descrizione, 1200),
      indirizzo: testoPulito(corpo.indirizzo, 160),
      citta,
      cap: testoPulito(corpo.cap, 10),
      provincia: testoPulito(corpo.provincia, 4).toUpperCase(),
      telefono: testoPulito(corpo.telefono, 30),
      email: testoPulito(corpo.email, 160).toLowerCase(),
      coordinate: {
        // Fuori da questi intervalli non è un punto sulla Terra: meglio zero,
        // che la ricerca per distanza sa riconoscere come «non impostato».
        lat: numeroDecimale(coordinate.lat, -90, 90, esistente?.coordinate.lat ?? 0),
        lng: numeroDecimale(coordinate.lng, -180, 180, esistente?.coordinate.lng ?? 0),
      },
      servizi: elencoPulito(corpo.servizi, 16, 40).filter((servizio) =>
        (SERVIZI_CINEMA as readonly string[]).includes(servizio),
      ) as Cinema['servizi'],
      orari,
      immagine: testoPulito(corpo.immagine, 400),
      palette: [
        colorePulito((corpo.palette as string[])?.[0], esistente?.palette[0] ?? '#2a1040'),
        colorePulito((corpo.palette as string[])?.[1], esistente?.palette[1] ?? '#ff4d7d'),
      ],
      visibile: corpo.visibile !== false,
      creatoIl: esistente?.creatoIl ?? new Date().toISOString(),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'cinema',
  nome: 'cinema',
  dalCorpo: costruisci,
  campiRapidi: ['visibile'],
  percorsiDaRigenerare: (cinema) => ['/', '/cinema', `/cinema/${cinema.slug}`, '/programmazione'],
  bloccoEliminazione: (cinema, archivio) => {
    const sale = archivio.sale.filter((voce) => voce.cinemaId === cinema.id).length
    if (sale > 0) {
      return `Questo cinema ha ancora ${sale} sale configurate. Eliminale prima, oppure nascondi il cinema.`
    }
    const spettacoli = archivio.spettacoli.filter((voce) => voce.cinemaId === cinema.id).length
    if (spettacoli > 0) {
      return `Ci sono ${spettacoli} spettacoli programmati in questo cinema.`
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
