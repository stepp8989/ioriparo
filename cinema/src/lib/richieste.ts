import 'server-only'
import type { RichiestaOrdine } from '@/lib/prenotazioni'
import type { SelezionePosto } from '@/lib/prezzi'
import { codicePulito, numeroIntero, testoPulito } from '@/lib/protezione'

/**
 * Lettura del corpo di un ordine.
 *
 * Sta in un modulo a parte perché lo usano due rotte — il preventivo e la
 * creazione della prenotazione — e devono interpretare il corpo allo stesso
 * identico modo: se il preventivo accettasse un campo che la creazione
 * ignora, il totale mostrato e quello addebitato potrebbero differire.
 *
 * Qui non si valida la sostanza (esistono quei posti? sono liberi? la
 * tipologia è attiva?): tutto questo lo fa `valutaOrdine` con l'archivio in
 * mano. Qui si controlla solo la forma, e si scarta ciò che non ha la forma
 * giusta invece di lasciarlo passare come `undefined`.
 */
export function leggiOrdine(
  corpo: Record<string, unknown>,
  clienteId: string | null,
): RichiestaOrdine {
  const selezioneGrezza = Array.isArray(corpo.selezione) ? corpo.selezione : []

  const selezione: SelezionePosto[] = selezioneGrezza
    .slice(0, 40)
    .map((voce) => {
      const posto = voce as Record<string, unknown>
      return {
        // La fila è una o due lettere maiuscole: «A», «AB». Tutto il resto non
        // esiste in nessuna sala e viene scartato dal controllo successivo.
        fila: testoPulito(posto.fila, 3).toUpperCase(),
        numero: numeroIntero(posto.numero, 1, 200, 0),
        // Il tipo di poltrona lo decide lo schema della sala: quello che
        // arriva dal browser viene sovrascritto da `valutaOrdine`, e qui si
        // mette un valore neutro solo per soddisfare il tipo.
        tipoPosto: 'standard' as const,
        tipologiaId: testoPulito(posto.tipologiaId, 60),
      }
    })
    .filter((posto) => posto.fila.length > 0 && posto.numero > 0 && posto.tipologiaId.length > 0)

  const foodGrezzo = Array.isArray(corpo.food) ? corpo.food : []

  const food = foodGrezzo
    .slice(0, 30)
    .map((voce) => {
      const riga = voce as Record<string, unknown>
      return {
        prodottoId: testoPulito(riga.prodottoId, 60),
        // Nome e prezzo arrivano comunque dal listino in `valutaOrdine`: qui
        // si accettano solo per completare il tipo, e vengono ignorati.
        nome: '',
        quantita: numeroIntero(riga.quantita, 0, 20, 0),
        prezzoUnitario: 0,
      }
    })
    .filter((riga) => riga.prodottoId.length > 0 && riga.quantita > 0)

  const ospiteGrezzo = (corpo.ospite ?? {}) as Record<string, unknown>

  return {
    spettacoloId: testoPulito(corpo.spettacoloId, 60),
    selezione,
    food,
    promoCodice: codicePulito(corpo.promoCodice, 24),
    giftCardCodice: codicePulito(corpo.giftCardCodice, 24),
    puntiDaUsare: numeroIntero(corpo.puntiDaUsare, 0, 1_000_000, 0),
    clienteId,
    // I dati dell'ospite servono solo a chi compra senza registrarsi: per un
    // cliente collegato si usano quelli dell'account, che sono verificati.
    ospite: clienteId
      ? null
      : {
          nome: testoPulito(ospiteGrezzo.nome, 80),
          email: testoPulito(ospiteGrezzo.email, 160).toLowerCase(),
          telefono: testoPulito(ospiteGrezzo.telefono, 30),
        },
  }
}
