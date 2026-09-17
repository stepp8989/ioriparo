import { rotteCollezione, type EsitoCostruzione } from '@/lib/rotteAdmin'
import { numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import type { Archivio, TipologiaBiglietto } from '@/lib/tipi'
import { nuovoId } from '@/lib/utili'

/**
 * Tipologie di biglietto.
 *
 * `variazione` è una differenza rispetto al prezzo base dello spettacolo e può
 * essere negativa: è il motivo per cui l'intervallo ammesso parte da −50.
 */
function costruisci(
  corpo: Record<string, unknown>,
  _archivio: Archivio,
  esistente?: TipologiaBiglietto,
): EsitoCostruzione<TipologiaBiglietto> {
  const nome = testoPulito(corpo.nome, 60) || esistente?.nome || ''
  if (!nome) return { ok: false, errore: 'Il nome della tipologia è obbligatorio.' }

  return {
    ok: true,
    voce: {
      id: esistente?.id ?? nuovoId('tip'),
      nome,
      descrizione: testoPulito(corpo.descrizione, 300),
      variazione: numeroDecimale(corpo.variazione, -50, 50, esistente?.variazione ?? 0),
      richiedeDocumento: corpo.richiedeDocumento === true,
      massimoPerOrdine: numeroIntero(corpo.massimoPerOrdine, 0, 50, esistente?.massimoPerOrdine ?? 0),
      attiva: corpo.attiva !== false,
      ordine: numeroIntero(corpo.ordine, 0, 999, esistente?.ordine ?? 10),
    },
  }
}

const rotte = rotteCollezione({
  collezione: 'tipologieBiglietto',
  nome: 'tipologia',
  dalCorpo: costruisci,
  campiRapidi: ['attiva', 'variazione', 'ordine'],
  bloccoEliminazione: (tipologia, archivio) => {
    // I biglietti già venduti conservano il nome della tipologia, quindi la
    // cancellazione non rompe nulla di visibile. Resta però un riferimento
    // nella prenotazione, e toglierla mentre è l'unica attiva bloccherebbe le
    // vendite: meglio disattivarla.
    const attive = archivio.tipologieBiglietto.filter((voce) => voce.attiva).length
    if (tipologia.attiva && attive <= 1) {
      return 'È l’unica tipologia attiva: senza, non si potrebbe più vendere nessun biglietto.'
    }
    return null
  },
})

export const { GET, POST, PUT, PATCH, DELETE } = rotte
export const dynamic = 'force-dynamic'
