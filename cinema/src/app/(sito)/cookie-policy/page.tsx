import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'

/**
 * Informativa sui cookie.
 *
 * È corta perché il sito installa pochi cookie, e sono tutti tecnici: nessun
 * banner di consenso compare, e non è una dimenticanza — senza cookie di
 * profilazione né script di terze parti al caricamento, il consenso preventivo
 * non è dovuto. Se in produzione si attivano statistiche o pixel pubblicitari,
 * questa pagina e un banner di consenso vanno aggiunti prima.
 */
export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Cookie',
    descrizione: 'Quali cookie usa il sito e a cosa servono.',
    percorso: '/cookie-policy',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaCookie() {
  const { impostazioni } = await datiSito()

  return (
    <Documento titolo="Cookie e tecnologie simili" aggiornamento="settembre 2026">
      <p>
        Questo sito usa soltanto cookie tecnici, cioè quelli indispensabili a far funzionare ciò
        che hai chiesto. Non ci sono cookie di profilazione, non ci sono pixel pubblicitari e
        nessuno script di terze parti viene caricato all’apertura delle pagine.
      </p>
      <p>
        È il motivo per cui non trovi un banner di consenso: per i cookie tecnici la normativa non
        lo richiede, e mostrartelo comunque sarebbe solo un ostacolo in più senza alcun beneficio
        per la tua privacy.
      </p>

      <h2>Cookie utilizzati</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Finalità</th>
            <th>Durata</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>cinemax_cliente</td>
            <td>
              Tiene aperta la sessione dell’area personale. Contiene solo un identificativo firmato
              e una scadenza, mai dati personali.
            </td>
            <td>14 giorni</td>
          </tr>
          <tr>
            <td>cinemax_pannello</td>
            <td>Sessione del pannello di amministrazione, riservato al personale.</td>
            <td>12 ore</td>
          </tr>
          <tr>
            <td>tema</td>
            <td>
              Ricorda se preferisci l’aspetto chiaro o scuro. Non è propriamente un cookie: è una
              voce nella memoria locale del browser e non viene mai inviata al server.
            </td>
            <td>Finché non lo cancelli</td>
          </tr>
        </tbody>
      </table>

      <h2>Contenuti di terze parti</h2>
      <p>
        I trailer sono ospitati su YouTube o Vimeo. Il video <strong>non viene caricato</strong>{' '}
        all’apertura della pagina: finché non premi il pulsante di riproduzione, nessuna richiesta
        parte verso quei servizi e nessun loro cookie viene installato. Avviando il trailer accetti
        che il fornitore del video applichi le proprie regole: usiamo il dominio in modalità
        privacy avanzata, che limita la raccolta ai dati necessari alla riproduzione.
      </p>
      <p>
        Il pagamento avviene sulle pagine del fornitore, che applica la propria informativa. Le
        indicazioni stradali si aprono su una mappa esterna solo se scegli di premere il relativo
        collegamento.
      </p>

      <h2>Come disattivarli</h2>
      <p>
        Puoi cancellare i cookie dalle impostazioni del browser. Cancellando quelli di sessione
        verrai disconnesso dall’area personale e dovrai accedere di nuovo: i biglietti già
        acquistati restano validi e recuperabili con il codice di prenotazione.
      </p>
      <p>
        Per qualsiasi chiarimento scrivi a{' '}
        <a href={`mailto:${impostazioni.marchio.email}`}>{impostazioni.marchio.email}</a>.
      </p>
    </Documento>
  )
}
