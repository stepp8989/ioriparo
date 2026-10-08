import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import {
  codicePulito,
  colorePulito,
  dataPulita,
  elencoPulito,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  oraPulita,
  testoPulito,
} from '@/lib/protezione'
import { FORMATI, TIPI_PROMOZIONE, type Archivio, type Promozione } from '@/lib/tipi'
import { inSlug, nuovoId, oggiIso, sommaGiorni } from '@/lib/utili'

/**
 * Gestione delle promozioni.
 *
 * Il codice, quando c'è, deve essere unico: due promozioni con lo stesso
 * codice renderebbero imprevedibile quale delle due si applica, e il cliente
 * vedrebbe uno sconto diverso da quello annunciato sul volantino.
 */
function costruisci(
  corpo: Record<string, unknown>,
  archivio: Archivio,
  esistente?: Promozione,
): EsitoCostruzione<Promozione> {
  const titolo = testoPulito(corpo.titolo, 120) || esistente?.titolo || ''
  if (!titolo) return { ok: false, errore: 'Il titolo della promozione è obbligatorio.' }

  const codice = codicePulito(corpo.codice, 20)

  if (codice) {
    const occupato =
      archivio.promozioni.some((voce) => voce.codice === codice && voce.id !== esistente?.id) ||
      archivio.coupon.some((voce) => voce.codice === codice)
    if (occupato) return { ok: false, errore: `Il codice ${codice} è già in uso.` }
  }

  const dal = dataPulita(corpo.dal) || esistente?.dal || oggiIso()
  const al = dataPulita(corpo.al) || esistente?.al || sommaGiorni(oggiIso(), 90)

  if (al < dal) {
    return { ok: false, errore: 'La data di fine non può precedere quella di inizio.' }
  }

  const tipo = fraLeVoci(corpo.tipo, TIPI_PROMOZIONE) ? corpo.tipo : (esistente?.tipo ?? 'percentuale')

  // Una percentuale oltre il cento per cento farebbe pagare il cinema per far
  // entrare la gente; un moltiplicatore di punti sotto uno li toglierebbe.
  const massimo = tipo === 'percentuale' ? 100 : tipo === 'punti-extra' ? 10 : 500
  const minimo = tipo === 'punti-extra' ? 1 : 0

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('pro'),
      slug: esistente?.slug ?? inSlug(titolo) ?? nuovoId('promo'),
      titolo,
      sottotitolo: testoPulito(corpo.sottotitolo, 160),
      descrizione: testoPulito(corpo.descrizione, 1200),
      tipo,
      valore: numeroDecimale(corpo.valore, minimo, massimo, esistente?.valore ?? 0),
      codice,
      immagine: testoPulito(corpo.immagine, 400),
      palette: [
        colorePulito((corpo.palette as string[])?.[0], esistente?.palette[0] ?? '#2a1040'),
        colorePulito((corpo.palette as string[])?.[1], esistente?.palette[1] ?? '#ff4d7d'),
      ],
      dal,
      al,
      giorniValidi: (Array.isArray(corpo.giorniValidi) ? corpo.giorniValidi : [])
        .map((valore) => numeroIntero(valore, 0, 6, -1))
        .filter((valore) => valore >= 0),
      oraDa: oraPulita(corpo.oraDa),
      oraA: oraPulita(corpo.oraA),
      cinemaIds: elencoPulito(corpo.cinemaIds, 30, 60),
      filmIds: elencoPulito(corpo.filmIds, 60, 60),
      formati: elencoPulito(corpo.formati, 6, 20).filter((formato) =>
        (FORMATI as readonly string[]).includes(formato),
      ) as Promozione['formati'],
      limiteUtilizzi: numeroIntero(corpo.limiteUtilizzi, 0, 1_000_000, esistente?.limiteUtilizzi ?? 0),
      limitePerCliente: numeroIntero(corpo.limitePerCliente, 0, 100, esistente?.limitePerCliente ?? 0),
      // Il contatore degli utilizzi non si azzera da un modulo: è il registro
      // di quanto la promozione è costata, e riscriverlo falserebbe i conti.
      utilizzi: esistente?.utilizzi ?? 0,
      soloAbbonati: corpo.soloAbbonati === true,
      livelliRichiesti: elencoPulito(corpo.livelliRichiesti, 10, 60),
      attiva: corpo.attiva !== false,
      inEvidenza: corpo.inEvidenza === true,
      creataIl: esistente?.creataIl ?? new Date().toISOString(),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'promozioni',
  nome: 'promozione',
  dalCorpo: costruisci,
  campiRapidi: ['attiva', 'inEvidenza'],
  percorsiDaRigenerare: () => ['/', '/promozioni'],
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
