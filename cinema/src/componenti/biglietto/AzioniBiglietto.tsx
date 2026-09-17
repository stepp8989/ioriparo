'use client'

import { useAvvisi } from '@/componenti/ui/Avviso'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Azioni sul biglietto: stampa, condivisione, copia del codice, wallet.
 *
 * Il pulsante «aggiungi al wallet» è predisposto ma non collegato, e lo dice.
 * Apple Wallet richiede un certificato di firma dei pass rilasciato da Apple e
 * un endpoint che generi il file `.pkpass`; Google Wallet richiede un account
 * di servizio e la creazione della classe del pass. Nessuna delle due si può
 * simulare: un pulsante che promette e non fa è peggio di un pulsante che
 * spiega cosa manca.
 */
export function AzioniBiglietto({ codice, className }: { codice: string; className?: string }) {
  const { mostra } = useAvvisi()

  async function copia() {
    try {
      await navigator.clipboard.writeText(codice)
      mostra('Codice copiato.', 'ok')
    } catch {
      mostra('Non è stato possibile copiare il codice.', 'errore')
    }
  }

  async function condividi() {
    const indirizzo = window.location.href

    // `navigator.share` esiste quasi solo sui telefoni, ed è proprio lì che
    // serve: mandare il biglietto a chi viene con te.
    if (navigator.share) {
      try {
        await navigator.share({ title: `Biglietto ${codice}`, url: indirizzo })
        return
      } catch {
        // Condivisione annullata: non è un errore da segnalare.
        return
      }
    }

    try {
      await navigator.clipboard.writeText(indirizzo)
      mostra('Collegamento copiato.', 'ok')
    } catch {
      mostra('Non è stato possibile copiare il collegamento.', 'errore')
    }
  }

  return (
    <div className={classi('flex flex-wrap gap-2.5', className)}>
      <Bottone variante="tenue" misura="piccola" onClick={() => window.print()}>
        <Icona nome="scarica" className="size-4" />
        Stampa o salva in PDF
      </Bottone>

      <Bottone variante="tenue" misura="piccola" onClick={copia}>
        <Icona nome="copia" className="size-4" />
        Copia il codice
      </Bottone>

      <Bottone variante="tenue" misura="piccola" onClick={condividi}>
        <Icona nome="esterno" className="size-4" />
        Condividi
      </Bottone>

      <button
        type="button"
        disabled
        title="Apple Wallet e Google Wallet richiedono certificati rilasciati dai rispettivi fornitori: l’integrazione è predisposta ma non ancora attiva."
        className="inline-flex cursor-not-allowed items-center gap-2 rounded-full border border-bordo px-4 py-2 text-[0.8rem] text-tenue opacity-50"
      >
        <Icona nome="portafoglio" className="size-4" />
        Aggiungi al Wallet
        <span className="text-[0.68rem]">(in arrivo)</span>
      </button>
    </div>
  )
}
