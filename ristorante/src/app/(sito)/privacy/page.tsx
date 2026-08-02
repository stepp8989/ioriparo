import { Documento } from '@/componenti/ui/Documento'
import { INDIRIZZO_COMPLETO, RISTORANTE } from '@/dati/ristorante'
import { metadatiPagina } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Privacy Policy',
  descrizione: `Informativa sul trattamento dei dati personali di ${RISTORANTE.ragioneSociale} ai sensi del Regolamento UE 2016/679.`,
  percorso: '/privacy',
  indicizza: false,
})

/**
 * Informativa privacy.
 *
 * Il testo va riletto e adattato dal titolare del trattamento prima della
 * pubblicazione: qui è già strutturato secondo gli articoli 13 e 14 del
 * Regolamento UE 2016/679, con i trattamenti realmente svolti da questo sito.
 */
export default function PaginaPrivacy() {
  return (
    <Documento titolo="Privacy Policy" aggiornamento="1 agosto 2026">
      <p>
        Questa informativa descrive come {RISTORANTE.ragioneSociale} tratta i dati personali di chi
        visita questo sito, prenota un tavolo, invia un messaggio o si iscrive alla newsletter, ai
        sensi degli articoli 13 e 14 del Regolamento UE 2016/679 («GDPR»).
      </p>

      <h2>Titolare del trattamento</h2>
      <p>
        {RISTORANTE.ragioneSociale} — {INDIRIZZO_COMPLETO} — P. IVA {RISTORANTE.partitaIva}.
        <br />
        Per esercitare i vostri diritti scrivete a{' '}
        <a href={`mailto:${RISTORANTE.emailInfo}`}>{RISTORANTE.emailInfo}</a> o telefonate al{' '}
        {RISTORANTE.telefono}.
      </p>

      <h2>Quali dati raccogliamo e perché</h2>
      <table>
        <thead>
          <tr>
            <th>Trattamento</th>
            <th>Dati</th>
            <th>Base giuridica</th>
            <th>Conservazione</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Prenotazione di un tavolo</td>
            <td>Nome, cognome, telefono, email, numero di persone, data, orario, richieste particolari</td>
            <td>Esecuzione di misure precontrattuali su vostra richiesta (art. 6.1.b)</td>
            <td>24 mesi dalla data della prenotazione</td>
          </tr>
          <tr>
            <td>Modulo contatti</td>
            <td>Nome, email, telefono, testo del messaggio</td>
            <td>Legittimo interesse a rispondere alle richieste (art. 6.1.f)</td>
            <td>12 mesi dall’ultimo contatto</td>
          </tr>
          <tr>
            <td>Newsletter</td>
            <td>Indirizzo email</td>
            <td>Consenso (art. 6.1.a), revocabile in ogni momento</td>
            <td>Fino alla revoca del consenso</td>
          </tr>
          <tr>
            <td>Statistiche di visita</td>
            <td>Pagine viste, dati tecnici del dispositivo in forma aggregata</td>
            <td>Consenso prestato tramite il banner cookie (art. 6.1.a)</td>
            <td>14 mesi</td>
          </tr>
        </tbody>
      </table>

      <h3>Richieste particolari e allergie</h3>
      <p>
        Se nel campo «richieste particolari» indicate un’allergia o un’intolleranza, quel dato può
        rientrare fra le categorie particolari di cui all’art. 9 del GDPR. Lo trattiamo solo per
        prepararvi un piatto adatto, sulla base del consenso che prestate compilando il campo, e lo
        comunichiamo esclusivamente al personale di cucina e di sala coinvolto nel servizio.
      </p>

      <h2>Come trattiamo i dati</h2>
      <p>
        I dati sono trattati con strumenti informatici, da personale autorizzato e istruito, con
        misure tecniche e organizzative adeguate al rischio. Non c’è alcun processo decisionale
        automatizzato né profilazione.
      </p>

      <h2>A chi possono essere comunicati</h2>
      <ul>
        <li>
          fornitori di servizi informatici che ospitano il sito e l’archivio delle prenotazioni,
          nominati responsabili del trattamento ai sensi dell’art. 28 del GDPR;
        </li>
        <li>il fornitore del servizio di invio delle email di conferma;</li>
        <li>consulenti e autorità, nei soli casi previsti dalla legge.</li>
      </ul>
      <p>
        I dati non vengono diffusi né ceduti a terzi per finalità commerciali. Eventuali
        trasferimenti fuori dallo Spazio economico europeo avvengono solo verso Paesi con decisione
        di adeguatezza o sulla base di clausole contrattuali tipo approvate dalla Commissione
        europea.
      </p>

      <h2>I vostri diritti</h2>
      <p>
        Potete chiedere in ogni momento accesso, rettifica, cancellazione, limitazione e portabilità
        dei vostri dati, opporvi al trattamento fondato sul legittimo interesse e revocare i
        consensi prestati, senza che ciò pregiudichi la liceità del trattamento precedente. La
        risposta arriva entro trenta giorni. Se ritenete che il trattamento violi la normativa
        potete rivolgervi al Garante per la protezione dei dati personali (
        <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer">
          garanteprivacy.it
        </a>
        ).
      </p>

      <h2>Cookie</h2>
      <p>
        L’uso dei cookie e degli strumenti analoghi è descritto nella{' '}
        <a href="/cookie-policy">Cookie Policy</a>, dove trovate anche il modo per modificare in
        qualsiasi momento le preferenze espresse.
      </p>
    </Documento>
  )
}
