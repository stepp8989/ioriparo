import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import {
  colorePulito,
  dataPulita,
  elencoPulito,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  testoPulito,
} from '@/lib/protezione'
import { CLASSIFICAZIONI, FORMATI, STATI_FILM, type Film, type VoceCast } from '@/lib/tipi'
import { inSlug, nuovoId } from '@/lib/utili'

/**
 * Gestione del catalogo film.
 *
 * Il catalogo pubblico non passa di qui: le pagine leggono direttamente
 * dall'archivio. Queste rotte servono solo al pannello.
 */

function costruisci(
  corpo: Record<string, unknown>,
  _archivio: unknown,
  esistente?: Film,
): EsitoCostruzione<Film> {
  const titolo = testoPulito(corpo.titolo, 120) || esistente?.titolo || ''
  if (!titolo) return { ok: false, errore: 'Il titolo è obbligatorio.' }

  const anno = numeroIntero(
    corpo.anno,
    1890,
    new Date().getFullYear() + 5,
    esistente?.anno ?? new Date().getFullYear(),
  )

  // Lo slug si calcola solo alla creazione: gli indirizzi delle schede già
  // pubblicate non devono cambiare da sotto i piedi a chi le ha condivise o
  // salvate, e ai motori di ricerca che le hanno indicizzate.
  const slug = esistente?.slug ?? inSlug(`${titolo} ${anno}`) ?? nuovoId('film')

  /*
   * Il cast arriva in due forme: come oggetti `{nome, ruolo}` da un editor
   * strutturato, oppure come righe di testo «Nome — Ruolo» dal modulo del
   * pannello, che per un elenco di quattro nomi è molto più rapido da
   * compilare di quattro coppie di campi. Accettarle entrambe costa cinque
   * righe e risparmia un componente.
   */
  const castGrezzo = Array.isArray(corpo.cast) ? corpo.cast : []
  const cast: VoceCast[] = castGrezzo
    .slice(0, 40)
    .map((voce): VoceCast => {
      if (typeof voce === 'string') {
        const [nome, ruolo] = voce.split(/\s+[—–-]\s+/)
        return { nome: testoPulito(nome, 80), ruolo: testoPulito(ruolo ?? '', 80) }
      }
      const riga = voce as Record<string, unknown>
      return { nome: testoPulito(riga.nome, 80), ruolo: testoPulito(riga.ruolo, 80) }
    })
    .filter((voce) => voce.nome.length > 0)

  // Anche il trailer accetta sia l'oggetto annidato sia i tre campi piatti che
  // il modulo del pannello manda.
  const trailerGrezzo = (corpo.trailer as Record<string, unknown> | null | undefined) ?? {
    piattaforma: corpo.trailerPiattaforma,
    riferimento: corpo.trailerRiferimento,
    durataSecondi: corpo.trailerDurata,
  }
  const piattaforma = testoPulito(trailerGrezzo?.piattaforma, 12)

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('fil'),
      slug,
      titolo,
      titoloOriginale: testoPulito(corpo.titoloOriginale, 120) || titolo,
      sottotitolo: testoPulito(corpo.sottotitolo, 200),
      sinossi: testoPulito(corpo.sinossi, 600),
      trama: testoPulito(corpo.trama, 6000),
      generi: elencoPulito(corpo.generi, 8, 40),
      durataMinuti: numeroIntero(corpo.durataMinuti, 1, 600, esistente?.durataMinuti ?? 100),
      anno,
      classificazione: fraLeVoci(corpo.classificazione, CLASSIFICAZIONI)
        ? corpo.classificazione
        : (esistente?.classificazione ?? 'T'),
      lingua: testoPulito(corpo.lingua, 40) || esistente?.lingua || 'Italiano',
      paese: testoPulito(corpo.paese, 60) || esistente?.paese || 'Italia',
      regista: testoPulito(corpo.regista, 80),
      cast,
      formati: elencoPulito(corpo.formati, 6, 20).filter((formato) =>
        (FORMATI as readonly string[]).includes(formato),
      ) as Film['formati'],
      trailer:
        piattaforma === 'youtube' || piattaforma === 'vimeo' || piattaforma === 'file'
          ? {
              piattaforma,
              riferimento: testoPulito(trailerGrezzo?.riferimento, 200),
              durataSecondi: numeroIntero(trailerGrezzo?.durataSecondi, 0, 3600, 0),
            }
          : null,
      locandina: testoPulito(corpo.locandina, 400),
      backdrop: testoPulito(corpo.backdrop, 400),
      palette: [
        colorePulito((corpo.palette as string[])?.[0], esistente?.palette[0] ?? '#1b1140'),
        colorePulito((corpo.palette as string[])?.[1], esistente?.palette[1] ?? '#a06bff'),
      ],
      valutazione: numeroDecimale(corpo.valutazione, 0, 10, esistente?.valutazione ?? 0),
      stato: fraLeVoci(corpo.stato, STATI_FILM) ? corpo.stato : (esistente?.stato ?? 'prossimamente'),
      dataUscita: dataPulita(corpo.dataUscita) || esistente?.dataUscita || '',
      inEvidenza: corpo.inEvidenza === true,
      visibile: corpo.visibile !== false,
      creatoIl: esistente?.creatoIl ?? new Date().toISOString(),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'film',
  nome: 'film',
  dalCorpo: costruisci,
  campiRapidi: ['visibile', 'inEvidenza', 'stato', 'valutazione'],
  percorsiDaRigenerare: (film) => ['/', '/film', `/film/${film.slug}`, '/programmazione'],
  bloccoEliminazione: (film, archivio) => {
    // Un film con spettacoli in calendario non si cancella: sparirebbe il
    // titolo dagli orari e dai biglietti già venduti. Prima si tolgono gli
    // spettacoli, oppure lo si rende invisibile — che è quasi sempre ciò che
    // si voleva fare davvero.
    const spettacoli = archivio.spettacoli.filter((voce) => voce.filmId === film.id).length
    if (spettacoli > 0) {
      return `Ci sono ancora ${spettacoli} spettacoli programmati per questo film. Eliminali prima, oppure nascondi il film invece di cancellarlo.`
    }

    const prenotazioni = archivio.prenotazioni.filter((voce) => voce.filmId === film.id).length
    if (prenotazioni > 0) {
      return `Esistono ${prenotazioni} prenotazioni legate a questo film: non può essere eliminato. Rendilo invisibile per toglierlo dal sito.`
    }

    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
