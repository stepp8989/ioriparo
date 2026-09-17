import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import { conflittoDiSala, formatoCompatibile, oraLiberazione } from '@/lib/programmazione'
import { dataPulita, fraLeVoci, numeroDecimale, oraPulita, testoPulito } from '@/lib/protezione'
import { FORMATI, type Archivio, type Spettacolo } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/**
 * Gestione della programmazione.
 *
 * Qui vive il vincolo più importante di tutta la sezione: due proiezioni non
 * possono sovrapporsi nella stessa sala. Il controllo tiene conto della durata
 * del film, dei quindici minuti di pubblicità e dei quindici di pulizia — cioè
 * del tempo reale in cui la sala è occupata, non del solo orario d'inizio.
 *
 * È un controllo che si potrebbe lasciare all'attenzione dell'operatore. Non
 * va fatto: una sovrapposizione si scopre quando due gruppi di persone si
 * presentano alla stessa porta, e a quel punto costa due rimborsi e una
 * recensione.
 */

function costruisci(
  corpo: Record<string, unknown>,
  archivio: Archivio,
  esistente?: Spettacolo,
): EsitoCostruzione<Spettacolo> {
  const filmId = testoPulito(corpo.filmId, 60) || esistente?.filmId || ''
  const film = archivio.film.find((voce) => voce.id === filmId)
  if (!film) return { ok: false, errore: 'Film non trovato.' }

  const salaId = testoPulito(corpo.salaId, 60) || esistente?.salaId || ''
  const sala = archivio.sale.find((voce) => voce.id === salaId)
  if (!sala) return { ok: false, errore: 'Sala non trovata.' }
  if (!sala.attiva) return { ok: false, errore: 'La sala non è attiva.' }

  const data = dataPulita(corpo.data) || esistente?.data || ''
  if (!data) return { ok: false, errore: 'Data non valida.' }

  const ora = oraPulita(corpo.ora) || esistente?.ora || ''
  if (!ora) return { ok: false, errore: 'Ora non valida: usa il formato HH:MM.' }

  const formato = fraLeVoci(corpo.formato, FORMATI) ? corpo.formato : (esistente?.formato ?? '2D')

  if (!formatoCompatibile(sala, formato)) {
    return {
      ok: false,
      errore: `La sala «${sala.nome}» non proietta in ${formato}. Scegli un altro formato o un'altra sala.`,
    }
  }

  if (!film.formati.includes(formato)) {
    return {
      ok: false,
      errore: `«${film.titolo}» non è disponibile in ${formato}.`,
    }
  }

  const filmPerId = new Map(archivio.film.map((voce) => [voce.id, voce]))
  const conflitto = conflittoDiSala(
    { salaId, data, ora, id: esistente?.id },
    archivio.spettacoli,
    filmPerId,
    film.durataMinuti,
  )

  if (conflitto) {
    const altro = filmPerId.get(conflitto.filmId)
    const durataAltro = altro?.durataMinuti ?? 120
    return {
      ok: false,
      errore:
        `Sovrapposizione in ${sala.nome}: «${altro?.titolo ?? 'altro spettacolo'}» delle ` +
        `${conflitto.ora} occupa la sala fino alle ${oraLiberazione(conflitto.ora, durataAltro)}. ` +
        `Questa proiezione finirebbe alle ${oraLiberazione(ora, film.durataMinuti)}.`,
    }
  }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('spe'),
      filmId,
      cinemaId: sala.cinemaId,
      salaId,
      data,
      ora,
      formato,
      lingua: corpo.lingua === 'VO' ? 'VO' : 'IT',
      prezzoBase: numeroDecimale(corpo.prezzoBase, 0, 100, esistente?.prezzoBase ?? 9),
      stato: corpo.stato === 'annullato' ? 'annullato' : 'programmato',
      creatoIl: esistente?.creatoIl ?? new Date().toISOString(),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'spettacoli',
  nome: 'spettacolo',
  dalCorpo: costruisci,
  campiRapidi: ['stato', 'prezzoBase'],
  percorsiDaRigenerare: () => ['/', '/programmazione', '/film'],
  bloccoEliminazione: (spettacolo, archivio) => {
    // Uno spettacolo con biglietti venduti non si cancella: si annulla. La
    // differenza non è formale — annullandolo i biglietti restano
    // rintracciabili e rimborsabili, cancellandolo si perde ogni riferimento.
    const vendute = archivio.prenotazioni.filter(
      (voce) =>
        voce.spettacoloId === spettacolo.id &&
        voce.stato !== 'annullata' &&
        voce.stato !== 'rimborsata',
    ).length

    if (vendute > 0) {
      return `Ci sono ${vendute} prenotazioni attive su questo spettacolo: annullalo invece di eliminarlo, così i biglietti restano rimborsabili.`
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
