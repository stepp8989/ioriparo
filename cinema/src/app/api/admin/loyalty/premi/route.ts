import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import { numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import type { Archivio, PremioLoyalty } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/** Premi riscattabili con i punti. */
function costruisci(
  corpo: Record<string, unknown>,
  _archivio: Archivio,
  esistente?: PremioLoyalty,
): EsitoCostruzione<PremioLoyalty> {
  const nome = testoPulito(corpo.nome, 80) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome del premio è obbligatorio.' }

  const tipo = testoPulito(corpo.tipo, 20)

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('pre'),
      nome,
      descrizione: testoPulito(corpo.descrizione, 300),
      puntiRichiesti: numeroIntero(corpo.puntiRichiesti, 1, 1_000_000, esistente?.puntiRichiesti ?? 500),
      tipo:
        tipo === 'biglietto' || tipo === 'food' || tipo === 'sconto' || tipo === 'upgrade'
          ? tipo
          : (esistente?.tipo ?? 'sconto'),
      valore: numeroDecimale(corpo.valore, 0, 500, esistente?.valore ?? 0),
      attivo: corpo.attivo !== false,
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'premiLoyalty',
  nome: 'premio',
  dalCorpo: costruisci,
  campiRapidi: ['attivo', 'puntiRichiesti', 'valore'],
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
