import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import { colorePulito, elencoPulito, numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import type { Archivio, LivelloLoyalty } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/**
 * Livelli del programma fedeltà.
 *
 * Non esiste da nessuna parte nel codice un `if` su «Gold» o «Platinum»: i
 * livelli sono dati, e chi gestisce la rete può aggiungerne, rinominarli e
 * spostarne le soglie senza che niente altro debba cambiare.
 */
function costruisci(
  corpo: Record<string, unknown>,
  _archivio: Archivio,
  esistente?: LivelloLoyalty,
): EsitoCostruzione<LivelloLoyalty> {
  const nome = testoPulito(corpo.nome, 40) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome del livello è obbligatorio.' }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('liv'),
      nome,
      puntiMinimi: numeroIntero(corpo.puntiMinimi, 0, 10_000_000, esistente?.puntiMinimi ?? 0),
      colore: colorePulito(corpo.colore, esistente?.colore ?? '#b9c0d4'),
      vantaggi: elencoPulito(corpo.vantaggi, 20, 160),
      // Sotto 1 il livello toglierebbe punti invece di darne: non è un livello
      // fedeltà, è una penale.
      moltiplicatore: numeroDecimale(corpo.moltiplicatore, 1, 10, esistente?.moltiplicatore ?? 1),
      ordine: numeroIntero(corpo.ordine, 0, 999, esistente?.ordine ?? 10),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'livelliLoyalty',
  nome: 'livello',
  dalCorpo: costruisci,
  campiRapidi: ['puntiMinimi', 'moltiplicatore', 'ordine'],
  bloccoEliminazione: (livello, archivio) => {
    if (archivio.livelliLoyalty.length <= 1) {
      return 'È l’unico livello: il programma fedeltà ne richiede almeno uno.'
    }
    const clienti = archivio.clienti.filter((voce) => voce.livelloId === livello.id).length
    if (clienti > 0) {
      return `${clienti} clienti si trovano a questo livello. Spostane prima la soglia o riassegnali, altrimenti resterebbero senza livello.`
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
