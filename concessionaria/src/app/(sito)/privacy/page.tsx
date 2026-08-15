import type { Metadata } from 'next'
import { Documento } from '@/componenti/ui/Documento'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione } from '@/componenti/ui/Sezione'
import { AZIENDA, INDIRIZZO_COMPLETO } from '@/dati/azienda'
import { metadatiPagina } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Privacy Policy',
  descrizione: `Informativa sul trattamento dei dati personali di ${AZIENDA.ragioneSociale} ai sensi del Regolamento UE 2016/679.`,
  percorso: '/privacy',
})

export default function PaginaPrivacy() {
  return (
    <>
      <Intestazione
        soprattitolo="Informativa"
        titolo="Privacy Policy"
        sottotitolo="Come trattiamo i dati personali che ci affidate, ai sensi del Regolamento UE 2016/679."
        briciole={[{ nome: 'Privacy Policy', percorso: '/privacy' }]}
      />

      <Sezione className="bg-sfondo" ampiezza="stretta">
        <Documento aggiornamento="1 agosto 2026">
          <h2>Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento è <strong>{AZIENDA.ragioneSociale}</strong>, con sede in{' '}
            {INDIRIZZO_COMPLETO}, partita IVA {AZIENDA.partitaIva}. Per qualsiasi questione relativa
            ai vostri dati potete scrivere a{' '}
            <a href={`mailto:${AZIENDA.email}`}>{AZIENDA.email}</a> o telefonare allo{' '}
            {AZIENDA.telefono}.
          </p>

          <h2>Quali dati raccogliamo</h2>
          <p>Raccogliamo soltanto i dati che ci servono per rispondervi e per lavorare:</p>
          <ul>
            <li>
              <strong>Dati di contatto</strong> — nome, cognome, telefono ed email, quando compilate
              un modulo di richiesta, prenotate un noleggio o un appuntamento, o ci scrivete in chat.
            </li>
            <li>
              <strong>Dati del veicolo</strong> — marca, modello, targa e chilometraggio, quando
              chiedete una valutazione in permuta o prenotate un intervento.
            </li>
            <li>
              <strong>Dati dell’account</strong> — se vi registrate nell’area clienti, gli stessi
              dati di contatto più un’impronta crittografica della password. La password in chiaro
              non viene mai salvata né è a noi conoscibile.
            </li>
            <li>
              <strong>Dati di navigazione</strong> — indirizzo IP e informazioni tecniche registrate
              dal server, necessarie al funzionamento e alla sicurezza del sito.
            </li>
          </ul>

          <h2>Perché li trattiamo e su quale base</h2>
          <ul>
            <li>
              <strong>Rispondere alle vostre richieste</strong> e gestire preventivi, prenotazioni e
              appuntamenti — base giuridica: esecuzione di misure precontrattuali e contrattuali
              (art. 6.1.b GDPR).
            </li>
            <li>
              <strong>Adempiere agli obblighi di legge</strong>, in particolare fiscali e
              amministrativi — base giuridica: obbligo legale (art. 6.1.c GDPR).
            </li>
            <li>
              <strong>Inviare la newsletter</strong>, se vi siete iscritti — base giuridica:
              consenso, revocabile in qualsiasi momento (art. 6.1.a GDPR).
            </li>
            <li>
              <strong>Statistiche di navigazione anonime</strong>, solo dopo il vostro consenso nel
              banner cookie — base giuridica: consenso.
            </li>
          </ul>

          <h2>Per quanto tempo li conserviamo</h2>
          <ul>
            <li>Richieste e preventivi senza seguito: ventiquattro mesi.</li>
            <li>
              Contratti di vendita, noleggio e relativi documenti fiscali: dieci anni, come impone
              la normativa.
            </li>
            <li>Account dell’area clienti: finché resta attivo, e per ventiquattro mesi dopo l’ultimo accesso.</li>
            <li>Iscrizione alla newsletter: fino alla revoca del consenso.</li>
          </ul>

          <h2>A chi li comunichiamo</h2>
          <p>
            I dati non vengono ceduti né venduti a terzi. Possono essere comunicati soltanto ai
            soggetti che ci aiutano a erogare il servizio, ciascuno nominato responsabile del
            trattamento: il fornitore dell’infrastruttura che ospita il sito, il servizio di invio
            delle email di conferma, i servizi di pagamento (Stripe e PayPal) quando scegliete di
            pagare online, gli istituti di credito quando chiedete un finanziamento, il consulente
            fiscale e le compagnie assicurative per i noleggi.
          </p>
          <p>
            Alcuni di questi fornitori possono trattare dati fuori dallo Spazio economico europeo:
            in quel caso il trasferimento avviene sulla base delle clausole contrattuali tipo
            approvate dalla Commissione europea.
          </p>

          <h2>I vostri diritti</h2>
          <p>
            Potete chiederci in qualsiasi momento l’accesso ai vostri dati, la rettifica, la
            cancellazione, la limitazione del trattamento, la portabilità, e potete opporvi al
            trattamento fondato sul legittimo interesse. Se il trattamento si basa sul consenso,
            potete revocarlo in qualsiasi momento senza che questo pregiudichi la liceità del
            trattamento fatto prima della revoca.
          </p>
          <p>
            Per esercitare questi diritti scrivete a{' '}
            <a href={`mailto:${AZIENDA.email}`}>{AZIENDA.email}</a>. Vi rispondiamo entro trenta
            giorni. Se ritenete che il trattamento violi il Regolamento, potete proporre reclamo al
            Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it">
              garanteprivacy.it
            </a>
            ).
          </p>

          <h2>Sicurezza</h2>
          <p>
            Il sito è servito esclusivamente su connessione cifrata. Le password dell’area clienti
            sono conservate come impronte crittografiche calcolate con l’algoritmo scrypt e un sale
            casuale diverso per ogni utente. L’accesso ai dati è limitato al personale che ne ha
            bisogno per lavorare.
          </p>

          <h2>Modifiche</h2>
          <p>
            Questa informativa può essere aggiornata. La data in cima alla pagina indica sempre
            l’ultima revisione; le modifiche sostanziali vengono segnalate sul sito.
          </p>
        </Documento>
      </Sezione>
    </>
  )
}
