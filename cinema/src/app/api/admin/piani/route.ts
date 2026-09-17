import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import {
  colorePulito,
  elencoPulito,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  testoPulito,
} from '@/lib/protezione'
import { FORMATI, PERIODI_ABBONAMENTO, type Archivio, type PianoAbbonamento } from '@/lib/tipi'
import { inSlug, nuovoId } from '@/lib/utili'

/** Gestione dei piani di abbonamento. */
function costruisci(
  corpo: Record<string, unknown>,
  _archivio: Archivio,
  esistente?: PianoAbbonamento,
): EsitoCostruzione<PianoAbbonamento> {
  const nome = testoPulito(corpo.nome, 60) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome del piano è obbligatorio.' }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('pia'),
      slug: esistente?.slug ?? inSlug(nome) ?? nuovoId('piano'),
      nome,
      descrizione: testoPulito(corpo.descrizione, 600),
      prezzo: numeroDecimale(corpo.prezzo, 0, 5000, esistente?.prezzo ?? 0),
      periodo: fraLeVoci(corpo.periodo, PERIODI_ABBONAMENTO)
        ? corpo.periodo
        : (esistente?.periodo ?? 'mensile'),
      // Zero significa «illimitati»: è la convenzione usata anche per i limiti
      // delle promozioni, e vale la pena che sia la stessa ovunque.
      ingressiInclusi: numeroIntero(corpo.ingressiInclusi, 0, 3650, esistente?.ingressiInclusi ?? 0),
      vantaggi: elencoPulito(corpo.vantaggi, 20, 160),
      limitazioni: elencoPulito(corpo.limitazioni, 20, 160),
      scontoFood: numeroDecimale(corpo.scontoFood, 0, 100, esistente?.scontoFood ?? 0),
      formatiInclusi: elencoPulito(corpo.formatiInclusi, 6, 20).filter((formato) =>
        (FORMATI as readonly string[]).includes(formato),
      ) as PianoAbbonamento['formatiInclusi'],
      colore: colorePulito(corpo.colore, esistente?.colore ?? '#9d6bff'),
      attivo: corpo.attivo !== false,
      inEvidenza: corpo.inEvidenza === true,
      ordine: numeroIntero(corpo.ordine, 0, 999, esistente?.ordine ?? 10),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'piani',
  nome: 'piano',
  dalCorpo: costruisci,
  campiRapidi: ['attivo', 'inEvidenza', 'prezzo', 'ordine'],
  percorsiDaRigenerare: () => ['/', '/abbonamenti'],
  bloccoEliminazione: (piano, archivio) => {
    const attive = archivio.sottoscrizioni.filter(
      (voce) => voce.pianoId === piano.id && voce.stato === 'attiva',
    ).length
    if (attive > 0) {
      return `Ci sono ${attive} abbonamenti attivi su questo piano: disattivalo invece di eliminarlo, così chi lo ha sottoscritto conserva i propri diritti fino alla scadenza.`
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
