import type { Metadata } from 'next'
import Link from 'next/link'
import { AGENZIA } from '@/dati/agenzia'
import { Icona } from '@/componenti/ui/Icona'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: `Come ${AGENZIA.nomeCompleto} tratta i dati personali di chi visita il sito e di chi richiede un preventivo.`,
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

/**
 * Informativa sul trattamento dei dati.
 *
 * ATTENZIONE — testo di partenza, non un documento legale pronto. Descrive
 * fedelmente quello che questo sito fa davvero (un modulo, nessun cookie di
 * profilazione, nessuna statistica di terze parti), ma prima di pubblicare va
 * riletto con i propri dati reali e, se si aggiungono servizi esterni — mappe,
 * statistiche, chat, pixel pubblicitari — va aggiornato di conseguenza.
 */
export default function Privacy() {
  const sezioni = [
    {
      titolo: 'Chi tratta i dati',
      corpo: [
        `Il titolare del trattamento è ${AGENZIA.ragioneSociale}, con sede in ${AGENZIA.sede.citta} (${AGENZIA.sede.provincia}), partita IVA ${AGENZIA.partitaIva}.`,
        `Per qualsiasi domanda su questa informativa si può scrivere a ${AGENZIA.email} o telefonare al ${AGENZIA.telefono}.`,
      ],
    },
    {
      titolo: 'Quali dati raccolgo',
      corpo: [
        'Solo quelli che scrivi nel modulo di richiesta preventivo: nome, eventuale azienda, email, eventuale telefono, il tipo di sito che ti interessa e il messaggio. Nessun altro dato viene raccolto durante la navigazione.',
        'Il server registra, come fa qualsiasi server web, l’indirizzo IP di chi invia il modulo. Serve unicamente a limitare gli invii automatici ripetuti e non viene usato per altro.',
      ],
    },
    {
      titolo: 'Perché li tratto',
      corpo: [
        'Per rispondere alla tua richiesta e, se decidiamo di lavorare insieme, per gestire il progetto. La base giuridica è l’esecuzione di misure precontrattuali richieste da te (art. 6.1.b GDPR) e il legittimo interesse a difendere il sito da invii automatici (art. 6.1.f GDPR).',
        'I dati non vengono usati per invii pubblicitari, non vengono ceduti e non vengono venduti a nessuno.',
      ],
    },
    {
      titolo: 'Per quanto tempo',
      corpo: [
        'Le richieste a cui non segue un incarico vengono conservate per ventiquattro mesi, poi cancellate. Quelle che diventano un progetto seguono i termini fiscali e contrattuali previsti dalla legge.',
      ],
    },
    {
      titolo: 'Chi altro li vede',
      corpo: [
        'Il fornitore che ospita il sito e il servizio che consegna le email di notifica, entrambi in qualità di responsabili del trattamento e nei limiti del servizio che svolgono. L’elenco aggiornato dei fornitori è disponibile su richiesta.',
      ],
    },
    {
      titolo: 'Cookie',
      corpo: [
        'Questo sito non usa cookie di profilazione, non ha pixel pubblicitari e non carica statistiche di terze parti. Non c’è quindi nessun banner da accettare: non ci sarebbe niente da accettare.',
        'Se in futuro venissero aggiunti servizi esterni — una mappa, una chat, uno strumento di analisi — comparirà un banner di consenso e questa informativa verrà aggiornata prima dell’attivazione.',
      ],
    },
    {
      titolo: 'I tuoi diritti',
      corpo: [
        'Puoi chiedere in qualsiasi momento di accedere ai tuoi dati, correggerli, cancellarli, limitarne il trattamento, opporti al trattamento o riceverli in un formato leggibile da un computer (artt. 15-22 GDPR).',
        `Basta scrivere a ${AGENZIA.email}: rispondo entro trenta giorni. Se la risposta non ti soddisfa puoi rivolgerti al Garante per la protezione dei dati personali (www.garanteprivacy.it).`,
      ],
    },
  ]

  return (
    <div className="contenitore py-32 sm:py-40">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[0.88rem] text-tenue transition-colors hover:text-testo"
        >
          <Icona nome="freccia" misura={16} className="rotate-180" />
          Torna al sito
        </Link>

        <h1 className="mt-8 font-titolo text-[clamp(2rem,5vw,3rem)] font-semibold leading-tight">
          Privacy Policy
        </h1>
        <p className="mt-5 text-[1rem] leading-relaxed text-tenue">
          Un’informativa corta, perché i dati trattati sono pochi. Qui c’è tutto quello che succede
          quando compili il modulo di questo sito.
        </p>

        <div className="mt-14 space-y-12">
          {sezioni.map((sezione) => (
            <section key={sezione.titolo}>
              <h2 className="font-titolo text-xl font-semibold text-testo">{sezione.titolo}</h2>
              <div className="mt-4 space-y-4">
                {sezione.corpo.map((paragrafo) => (
                  <p key={paragrafo.slice(0, 26)} className="text-[0.97rem] leading-relaxed text-tenue">
                    {paragrafo}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-16 border-t border-bordo/70 pt-7 text-[0.85rem] text-fioco">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { month: 'long', year: 'numeric' })}.
        </p>
      </div>
    </div>
  )
}
