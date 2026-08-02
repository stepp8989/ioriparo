import { Documento } from '@/componenti/ui/Documento'
import { RiapriPreferenze } from '@/componenti/comuni/BannerCookie'
import { RISTORANTE } from '@/dati/ristorante'
import { metadatiPagina } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Cookie Policy',
  descrizione: `Quali cookie usa il sito di ${RISTORANTE.nomeCompleto} e come gestire le preferenze.`,
  percorso: '/cookie-policy',
  indicizza: false,
})

export default function PaginaCookie() {
  return (
    <Documento titolo="Cookie Policy" aggiornamento="1 agosto 2026">
      <p>
        I cookie sono piccoli file salvati dal browser durante la navigazione. Questo sito ne usa il
        meno possibile: i caratteri tipografici e le immagini sono serviti dal nostro stesso
        dominio, quindi nessuno script pubblicitario o di profilazione viene caricato.
      </p>

      <h2>Cookie tecnici</h2>
      <p>
        Sono necessari al funzionamento del sito e non richiedono consenso (art. 122 del Codice
        privacy). Senza di essi alcune funzioni non sarebbero disponibili.
      </p>
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
            <td>consenso-cookie</td>
            <td>Ricorda le preferenze espresse in questa pagina</td>
            <td>Memoria locale, fino a cancellazione</td>
          </tr>
          <tr>
            <td>tema</td>
            <td>Ricorda la scelta fra tema chiaro e tema scuro</td>
            <td>Memoria locale, fino a cancellazione</td>
          </tr>
          <tr>
            <td>aurea_sessione</td>
            <td>Mantiene l’accesso allo staff nel pannello di amministrazione</td>
            <td>12 ore</td>
          </tr>
        </tbody>
      </table>

      <h2>Cookie di statistica</h2>
      <p>
        Se date il consenso attiviamo Google Analytics 4 con indirizzo IP anonimizzato, per capire
        quali pagine sono più utili e come migliorarle. Le funzioni pubblicitarie del servizio sono
        disattivate. I dati sono conservati per quattordici mesi.
      </p>

      <h2>Contenuti esterni</h2>
      <p>
        La mappa nella pagina Contatti è fornita da Google Maps. Il riquadro viene inserito solo se
        acconsentite ai contenuti esterni: fino ad allora nessuna richiesta parte verso Google, e
        potete comunque aprire le indicazioni stradali con l’apposito pulsante.
      </p>

      <h2>Gestire le preferenze</h2>
      <p>
        Potete cambiare idea quando volete: da qui riaprite il pannello di scelta, oppure potete
        cancellare i cookie dalle impostazioni del browser (Chrome, Firefox, Safari ed Edge hanno
        tutti una sezione dedicata alla privacy).
      </p>

      <div className="mt-8 not-prose">
        <RiapriPreferenze />
      </div>

      <h2>Aggiornamenti</h2>
      <p>
        Se in futuro introdurremo nuovi strumenti aggiorneremo questa pagina e vi chiederemo di
        nuovo il consenso. Per qualsiasi chiarimento scrivete a{' '}
        <a href={`mailto:${RISTORANTE.emailInfo}`}>{RISTORANTE.emailInfo}</a>.
      </p>
    </Documento>
  )
}
