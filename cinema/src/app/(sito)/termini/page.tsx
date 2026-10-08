import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'
import { prezzo } from '@/lib/utili'

/**
 * Termini di vendita.
 *
 * I valori numerici — commissione, minuti di blocco dei posti, chiusura della
 * prevendita — sono letti dalle impostazioni, non scritti nel testo: un
 * documento contrattuale che dichiara una commissione diversa da quella
 * effettivamente addebitata è un problema serio, e l'unico modo per evitarlo è
 * non scriverla due volte.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Termini di vendita',
    descrizione:
      'Condizioni di acquisto dei biglietti: prezzi, commissioni, rimborsi, cambi e regole di accesso in sala.',
    percorso: '/termini',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaTermini() {
  const { impostazioni } = await datiSito()
  const { marchio } = impostazioni

  return (
    <Documento titolo="Termini di vendita" aggiornamento="settembre 2026">
      <p>
        Queste condizioni regolano l’acquisto di biglietti, abbonamenti, gift card e prodotti del
        banco alimentari sul sito di {marchio.nome}.
      </p>

      <h2>Prezzi e commissioni</h2>
      <p>
        Il prezzo del biglietto dipende dallo spettacolo, dalla tipologia scelta, dal formato di
        proiezione e dal tipo di poltrona. Il riepilogo prima del pagamento mostra ogni voce nel
        dettaglio: quello che vedi è quello che paghi.
      </p>
      <p>
        Alla vendita online si applica una commissione di servizio di{' '}
        <strong>{prezzo(impostazioni.commissioneServizio)} per ordine</strong> — non per biglietto.
        {impostazioni.commissionePerBiglietto > 0 && (
          <> È inoltre prevista una commissione di {prezzo(impostazioni.commissionePerBiglietto)} per biglietto.</>
        )}{' '}
        La commissione non è scontabile dalle promozioni e non viene rimborsata in caso di
        annullamento volontario.
      </p>

      <h2>Blocco dei posti e conclusione dell’acquisto</h2>
      <p>
        I posti selezionati restano riservati per{' '}
        <strong>{impostazioni.minutiBloccoPosti} minuti</strong>, il tempo di completare il
        pagamento. Trascorso quel termine tornano disponibili per gli altri clienti e l’ordine va
        rifatto. L’acquisto si considera concluso solo quando ricevi il codice di prenotazione: un
        pagamento avviato ma non completato non dà diritto al posto.
      </p>
      <p>
        La vendita online si chiude{' '}
        <strong>{impostazioni.chiusuraVenditaMinuti} minuti prima</strong> dell’inizio dello
        spettacolo. Da quel momento i posti residui sono acquistabili solo in cassa.
      </p>

      <h2>Biglietti e accesso in sala</h2>
      <ul>
        <li>
          Ogni posto corrisponde a un biglietto con il proprio codice QR. Se entrate in momenti
          diversi, ciascuno deve mostrare il proprio.
        </li>
        <li>Il QR è valido una sola volta: una volta timbrato all’ingresso non è riutilizzabile.</li>
        <li>
          Le tipologie ridotte (studente, under 18, senior, convenzioni) richiedono un documento
          valido all’ingresso. In mancanza, il personale può richiedere l’integrazione fino al
          prezzo intero.
        </li>
        <li>
          Per i film con limiti di età il personale può richiedere un documento e negare l’accesso
          a chi non abbia l’età prevista, senza rimborso.
        </li>
      </ul>

      <h2>Annullamenti, cambi e rimborsi</h2>
      <p>
        Trattandosi di servizi di intrattenimento legati a una data determinata, il diritto di
        recesso previsto per gli acquisti a distanza non si applica (art. 59, lett. n, del Codice
        del consumo).
      </p>
      <ul>
        <li>
          <strong>Annullamento da parte nostra:</strong> se lo spettacolo viene annullato, il
          biglietto è rimborsato per intero, commissione compresa, sullo stesso metodo di
          pagamento usato.
        </li>
        <li>
          <strong>Cambio a richiesta:</strong> fino a quattro ore prima dello spettacolo puoi
          chiedere lo spostamento a un’altra proiezione dello stesso film, compatibilmente con la
          disponibilità, scrivendo a <a href={`mailto:${marchio.email}`}>{marchio.email}</a>.
        </li>
        <li>
          <strong>Interruzione della proiezione:</strong> in caso di guasto che impedisca la
          visione di oltre metà del film, il biglietto viene sostituito con un ingresso valido per
          un’altra data.
        </li>
      </ul>

      <h2>Abbonamenti</h2>
      <p>
        Gli abbonamenti sono personali e non cedibili. Gli ingressi non utilizzati non si
        accumulano da un periodo al successivo. La disdetta si effettua dall’area personale e ha
        effetto alla scadenza del periodo già pagato, senza rimborsi parziali.
      </p>

      <h2>Gift card e programma fedeltà</h2>
      <p>
        Le gift card non sono rimborsabili né convertibili in denaro e possono essere utilizzate in
        più volte finché resta credito. I punti del programma fedeltà non hanno valore monetario,
        non sono cedibili e si azzerano con la chiusura dell’account.
      </p>

      <h2>Reclami</h2>
      <p>
        Per qualsiasi contestazione scrivi a <a href={`mailto:${marchio.email}`}>{marchio.email}</a>{' '}
        o chiama il {marchio.telefono}. Se non trovi soddisfazione puoi rivolgerti agli organismi
        di risoluzione alternativa delle controversie o alla piattaforma europea ODR.
      </p>
    </Documento>
  )
}
