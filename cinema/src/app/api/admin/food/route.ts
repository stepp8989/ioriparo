import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import {
  colorePulito,
  elencoPulito,
  fraLeVoci,
  numeroDecimale,
  numeroIntero,
  testoPulito,
} from '@/lib/protezione'
import { CATEGORIE_FOOD, type Archivio, type ProdottoFood } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/** Gestione del banco alimentari. */
function costruisci(
  corpo: Record<string, unknown>,
  _archivio: Archivio,
  esistente?: ProdottoFood,
): EsitoCostruzione<ProdottoFood> {
  const nome = testoPulito(corpo.nome, 80) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome del prodotto è obbligatorio.' }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('foo'),
      nome,
      descrizione: testoPulito(corpo.descrizione, 400),
      categoria: fraLeVoci(corpo.categoria, CATEGORIE_FOOD)
        ? corpo.categoria
        : (esistente?.categoria ?? 'Popcorn'),
      prezzo: numeroDecimale(corpo.prezzo, 0, 200, esistente?.prezzo ?? 0),
      immagine: testoPulito(corpo.immagine, 400),
      palette: [
        colorePulito((corpo.palette as string[])?.[0], esistente?.palette[0] ?? '#4a3410'),
        colorePulito((corpo.palette as string[])?.[1], esistente?.palette[1] ?? '#ffd166'),
      ],
      // Gli allergeni non hanno un elenco chiuso: la normativa ne prevede
      // quattordici, ma i fornitori ne dichiarano anche altri e un vincolo
      // troppo stretto porterebbe a ometterli.
      allergeni: elencoPulito(corpo.allergeni, 20, 60),
      contenuto: elencoPulito(corpo.contenuto, 12, 120),
      cinemaIds: elencoPulito(corpo.cinemaIds, 30, 60),
      disponibile: corpo.disponibile !== false,
      inEvidenza: corpo.inEvidenza === true,
      ordine: numeroIntero(corpo.ordine, 0, 999, esistente?.ordine ?? 50),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'food',
  nome: 'prodotto',
  dalCorpo: costruisci,
  campiRapidi: ['disponibile', 'inEvidenza', 'prezzo', 'ordine'],
  percorsiDaRigenerare: () => ['/food'],
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
