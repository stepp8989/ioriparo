import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione } from '@/componenti/ui/Sezione'
import { AZIENDA, INDIRIZZO_COMPLETO } from '@/dati/azienda'
import { metadatiPagina } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Termini e condizioni',
  descrizione: `Condizioni di vendita, noleggio e servizi di ${AZIENDA.ragioneSociale}: garanzie, prenotazioni, pagamenti, annullamenti e responsabilità.`,
  percorso: '/termini',
})

export default function PaginaTermini() {
  return (
    <>
      <Intestazione
        soprattitolo="Condizioni"
        titolo="Termini e condizioni"
        sottotitolo="Le regole che valgono per la vendita, il noleggio e i servizi prenotati da questo sito."
        briciole={[{ nome: 'Termini e condizioni', percorso: '/termini' }]}
      />

      <Sezione className="bg-sfondo" ampiezza="stretta">
        <Documento aggiornamento="1 agosto 2026">
          <h2>1. Chi siamo</h2>
          <p>
            Il sito è gestito da <strong>{AZIENDA.ragioneSociale}</strong>, sede in{' '}
            {INDIRIZZO_COMPLETO}, partita IVA {AZIENDA.partitaIva}, REA {AZIENDA.rea}, capitale
            sociale {AZIENDA.capitaleSociale}.
          </p>

          <h2>2. Prezzi e disponibilità</h2>
          <p>
            I prezzi dei veicoli sono espressi in euro, comprensivi di IVA e di passaggio di
            proprietà salvo diversa indicazione nella scheda. La disponibilità è aggiornata di
            continuo ma non è garantita in tempo reale: un veicolo può essere venduto o impegnato
            fra la vostra richiesta e la nostra risposta. In quel caso ve lo comunichiamo subito e
            nessun impegno si considera assunto.
          </p>
          <p>
            Le fotografie del catalogo sono indicative. Colori, dotazioni e allestimenti reali
            vengono confermati per iscritto prima della firma.
          </p>

          <h2>3. Richieste e preventivi</h2>
          <p>
            L’invio di un modulo dal sito è una richiesta di informazioni, non un ordine e non un
            contratto. Nessun impegno nasce prima della firma di un contratto scritto. I preventivi
            hanno validità quindici giorni salvo diversa indicazione.
          </p>

          <h2>4. Garanzia sui veicoli</h2>
          <ul>
            <li>
              Sui veicoli usati garantiti applichiamo ventiquattro mesi di garanzia su motore,
              cambio e differenziale, estendibile fino a quarantotto mesi con copertura ampliata.
            </li>
            <li>
              Sui veicoli nuovi vale la garanzia della casa costruttrice, nei termini indicati dal
              libretto.
            </li>
            <li>
              Restano esclusi dalla garanzia i componenti soggetti a usura (pastiglie, dischi,
              frizione, pneumatici, batteria di avviamento, spazzole) e i danni derivanti da uso
              improprio, competizioni o manutenzione non eseguita.
            </li>
            <li>
              Per i consumatori restano impregiudicati i diritti previsti dagli articoli 128 e
              seguenti del Codice del consumo.
            </li>
          </ul>

          <h2>5. Noleggio</h2>
          <h3>Requisiti</h3>
          <ul>
            <li>Età minima indicata nella scheda del veicolo, da 18 a 25 anni secondo il mezzo.</li>
            <li>Patente valida da almeno due anni, categoria adeguata al veicolo.</li>
            <li>Carta di credito intestata al conducente per il deposito cauzionale.</li>
          </ul>

          <h3>Prenotazione e pagamento</h3>
          <p>
            La prenotazione online è una richiesta: diventa vincolante quando la confermiamo per
            email. Se scegliete il pagamento online vi viene addebitato un acconto pari al trenta
            per cento del totale; il saldo si paga al ritiro. Il deposito cauzionale viene bloccato
            sulla carta al ritiro e sbloccato entro sette giorni dalla riconsegna, salvo danni o
            sanzioni.
          </p>

          <h3>Annullamento</h3>
          <ul>
            <li>Fino a quarantotto ore prima del ritiro: annullamento gratuito, acconto restituito per intero.</li>
            <li>Fra quarantotto e ventiquattro ore: trattenuto il cinquanta per cento dell’acconto.</li>
            <li>Meno di ventiquattro ore o mancato ritiro: acconto trattenuto per intero.</li>
          </ul>

          <h3>Uso del veicolo</h3>
          <p>
            Il veicolo va restituito nelle stesse condizioni in cui è stato consegnato, con lo
            stesso livello di carburante. È vietato uscire dal territorio nazionale senza
            autorizzazione scritta, trainare, partecipare a competizioni, subaffittare il mezzo o
            farlo guidare a persone non indicate nel contratto. I chilometri eccedenti quelli
            inclusi sono addebitati a 0,25 € al chilometro. Multe e sanzioni restano a carico del
            conducente, con un contributo di 25 € per le spese di gestione della pratica.
          </p>

          <h2>6. Servizi di detailing e officina</h2>
          <p>
            L’appuntamento prenotato dal sito è una preferenza: viene confermato per telefono dopo
            la verifica della disponibilità. Il prezzo indicato è un minimo, riferito a una vettura
            di segmento medio in condizioni normali; il preventivo definitivo viene comunicato e
            approvato <strong>prima</strong> di iniziare il lavoro, mai dopo.
          </p>
          <p>
            Sui trattamenti di correzione della vernice il risultato dipende dallo spessore
            residuo del trasparente: se la misurazione preliminare indica che l’intervento non è
            eseguibile in sicurezza, ve lo diciamo e non lo facciamo.
          </p>

          <h2>7. Finanziamenti</h2>
          <p>
            Il simulatore di rata presente sul sito ha valore puramente indicativo e non
            costituisce offerta contrattuale né promessa di erogazione. L’approvazione dipende
            esclusivamente dall’istruttoria dell’istituto di credito. Le condizioni economiche
            vincolanti sono quelle riportate nei documenti precontrattuali (SECCI) consegnati prima
            della firma.
          </p>

          <h2>8. Diritto di recesso</h2>
          <p>
            Il diritto di recesso di quattordici giorni previsto per i contratti a distanza non si
            applica ai veicoli venduti in salone con contratto firmato di persona, né ai servizi di
            noleggio con data e periodo determinati (art. 59 del Codice del consumo). Si applica
            invece ai servizi acquistati interamente a distanza, nei limiti di legge.
          </p>

          <h2>9. Responsabilità e contenuti del sito</h2>
          <p>
            Facciamo il possibile perché le informazioni pubblicate siano corrette e aggiornate, ma
            errori materiali restano possibili: in caso di discordanza fra sito e documenti
            contrattuali, valgono i secondi. Gli articoli del blog hanno carattere divulgativo e non
            sostituiscono una diagnosi eseguita sul veicolo.
          </p>

          <h2>10. Legge applicabile e foro</h2>
          <p>
            I rapporti sono regolati dalla legge italiana. Per le controversie con consumatori è
            competente il foro del luogo di residenza o domicilio del consumatore; negli altri casi
            il foro di Nuoro. Prima di andare in giudizio è sempre possibile ricorrere alla
            mediazione o alla piattaforma europea di risoluzione delle controversie online.
          </p>

          <h2>11. Contatti</h2>
          <p>
            Per qualsiasi chiarimento: <a href={`mailto:${AZIENDA.email}`}>{AZIENDA.email}</a> oppure{' '}
            {AZIENDA.telefono}.
          </p>
        </Documento>
      </Sezione>
    </>
  )
}
