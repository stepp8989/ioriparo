import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'

/**
 * Informativa privacy.
 *
 * È scritta sui trattamenti che la piattaforma svolge davvero, non su quelli
 * che un modello generico elencherebbe. Va riletta e adattata dal titolare
 * prima della messa in produzione — in particolare i riferimenti societari, i
 * tempi di conservazione e l'elenco dei responsabili esterni, che dipendono
 * dai fornitori effettivamente attivati.
 */
export const revalidate = 86400

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Informativa sulla privacy',
    descrizione: 'Come trattiamo i dati personali di chi acquista biglietti e usa l’area personale.',
    percorso: '/privacy',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaPrivacy() {
  const { impostazioni } = await datiSito()
  const { marchio } = impostazioni

  return (
    <Documento titolo="Informativa sulla privacy" aggiornamento="settembre 2026">
      <p>
        Questa informativa descrive il trattamento dei dati personali svolto da {marchio.nome} ai
        sensi del Regolamento (UE) 2016/679. I riferimenti societari completi del titolare del
        trattamento vanno inseriti qui prima della pubblicazione.
      </p>

      <h2>Quali dati trattiamo</h2>
      <ul>
        <li>
          <strong>Dati di acquisto:</strong> nome, indirizzo email, numero di telefono, spettacolo,
          posti scelti, importo e metodo di pagamento. Servono a emettere il biglietto e a
          consentirti l’ingresso.
        </li>
        <li>
          <strong>Dati dell’account:</strong> se ti registri, gli stessi dati più le preferenze, i
          film salvati fra i preferiti e lo storico degli acquisti.
        </li>
        <li>
          <strong>Dati del programma fedeltà:</strong> punti maturati e riscattati, livello
          raggiunto, premi utilizzati.
        </li>
        <li>
          <strong>Dati tecnici:</strong> indirizzo IP e informazioni del browser, conservati per il
          tempo necessario a limitare gli abusi delle funzioni pubbliche.
        </li>
      </ul>

      <h3>Quali dati non trattiamo</h3>
      <p>
        <strong>I dati della tua carta di pagamento non transitano mai dai nostri sistemi.</strong>{' '}
        Vengono inseriti sulle pagine del fornitore di pagamento e noi riceviamo soltanto
        l’esito dell’operazione e un identificativo. Non li vediamo, non li registriamo e non
        potremmo recuperarli nemmeno volendo.
      </p>

      <h2>Perché li trattiamo</h2>
      <table>
        <thead>
          <tr>
            <th>Finalità</th>
            <th>Base giuridica</th>
            <th>Conservazione</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Vendita dei biglietti ed emissione del titolo d’ingresso</td>
            <td>Esecuzione del contratto (art. 6.1.b)</td>
            <td>10 anni per gli obblighi fiscali</td>
          </tr>
          <tr>
            <td>Gestione dell’account e dell’area personale</td>
            <td>Esecuzione del contratto (art. 6.1.b)</td>
            <td>Fino alla cancellazione dell’account</td>
          </tr>
          <tr>
            <td>Programma fedeltà e abbonamenti</td>
            <td>Esecuzione del contratto (art. 6.1.b)</td>
            <td>Fino alla chiusura dell’adesione</td>
          </tr>
          <tr>
            <td>Promemoria dello spettacolo</td>
            <td>Legittimo interesse (art. 6.1.f)</td>
            <td>Fino allo spettacolo</td>
          </tr>
          <tr>
            <td>Comunicazioni promozionali</td>
            <td>Consenso (art. 6.1.a), revocabile in qualsiasi momento</td>
            <td>Fino alla revoca</td>
          </tr>
          <tr>
            <td>Prevenzione degli abusi e sicurezza</td>
            <td>Legittimo interesse (art. 6.1.f)</td>
            <td>Massimo 30 giorni</td>
          </tr>
        </tbody>
      </table>

      <h2>A chi li comunichiamo</h2>
      <p>
        Solo ai fornitori necessari al servizio, nominati responsabili del trattamento: il
        fornitore di pagamento, il servizio di invio delle email transazionali e il fornitore
        dell’infrastruttura su cui gira la piattaforma. L’elenco aggiornato con i nomi è
        disponibile su richiesta scrivendo a <a href={`mailto:${marchio.email}`}>{marchio.email}</a>.
      </p>
      <p>
        Non vendiamo dati personali e non li cediamo a terzi per finalità di marketing proprio di
        quei terzi.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Puoi chiedere accesso, rettifica, cancellazione, limitazione e portabilità dei tuoi dati, e
        opporti ai trattamenti fondati sul legittimo interesse. Scrivi a{' '}
        <a href={`mailto:${marchio.email}`}>{marchio.email}</a>: rispondiamo entro trenta giorni.
        Hai inoltre diritto di reclamo al Garante per la protezione dei dati personali.
      </p>
      <p>
        La cancellazione dell’account comporta la perdita dei punti fedeltà e degli abbonamenti
        attivi, e non è reversibile. I dati delle transazioni già concluse restano conservati per
        il tempo imposto dalla normativa fiscale, come indicato nella tabella.
      </p>
    </Documento>
  )
}
