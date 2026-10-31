import { Link } from 'react-router-dom'
import { Intestazione, LinkBottone, Sezione } from '../componenti/base'
import { AZIENDA, INDIRIZZO_COMPLETO } from '../dati/azienda'
import { ARTICOLI } from '../dati/blog'
import { SERVIZI } from '../dati/servizi'
import { useRivela } from '../lib/hook'
import { useSeo } from '../lib/seo'

const AGGIORNAMENTO = '1 luglio 2026'

export function Privacy() {
  const rif = useRivela<HTMLDivElement>()
  useSeo({
    titolo: 'Privacy Policy | Io Riparo',
    descrizione:
      'Informativa sul trattamento dei dati personali di Io Riparo ai sensi degli articoli 13 e 14 del Regolamento UE 2016/679.',
    percorso: '/privacy',
  })

  return (
    <div ref={rif}>
      <Sezione>
        <article className="article">
          <span className="eyebrow">Informativa</span>
          <h1 style={{ margin: '14px 0 10px', fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Privacy Policy</h1>
          <p className="faint" style={{ fontSize: '.85rem' }}>
            Ultimo aggiornamento: {AGGIORNAMENTO} · ai sensi degli artt. 13-14 del Regolamento UE 2016/679
          </p>

          <h2>Titolare del trattamento</h2>
          <p>
            {AZIENDA.nome}, con sede in {INDIRIZZO_COMPLETO}, P.IVA {AZIENDA.partitaIva}. Per ogni richiesta relativa ai
            dati personali puoi scrivere a{' '}
            <a className="link" href={`mailto:${AZIENDA.emailPrivacy}`}>
              {AZIENDA.emailPrivacy}
            </a>
            .
          </p>

          <h2>Dati trattati e finalità</h2>
          <p>
            Trattiamo i dati che ci fornisci volontariamente attraverso i moduli del sito, il servizio di assistenza e i
            contratti di manutenzione:
          </p>
          <ul>
            <li>
              <b>Dati di contatto</b> (nome, telefono, e-mail): per rispondere alle richieste di preventivo, gestire gli
              appuntamenti e aggiornarti sullo stato della riparazione.
            </li>
            <li>
              <b>Dati del dispositivo</b> (marca, modello, IMEI o numero di serie, descrizione del guasto): per eseguire
              la diagnosi e documentare l’intervento.
            </li>
            <li>
              <b>Dati di fatturazione</b>: per adempiere agli obblighi fiscali, con conservazione decennale prevista
              dalla legge.
            </li>
            <li>
              <b>Dati di navigazione</b> (indirizzo IP, pagine visitate): per la sicurezza del sito e statistiche
              aggregate.
            </li>
          </ul>

          <h2>Contenuto dei dispositivi</h2>
          <p>
            Durante una riparazione i nostri tecnici possono accedere alla memoria del dispositivo solo per quanto
            strettamente necessario alla verifica del funzionamento. Non copiamo, non conserviamo e non cediamo a terzi
            i contenuti personali. Nelle attività di recupero dati la copia di lavoro viene cancellata in modo sicuro
            entro 30 giorni dalla riconsegna, salvo diversa richiesta scritta.
          </p>

          <h2>Base giuridica e conservazione</h2>
          <p>
            Il trattamento si fonda sull’esecuzione di un contratto o di misure precontrattuali (art. 6.1.b),
            sull’obbligo legale per la documentazione fiscale (art. 6.1.c) e sul consenso per l’invio della newsletter
            (art. 6.1.a), revocabile in qualsiasi momento. I dati di contatto sono conservati per 24 mesi dall’ultimo
            intervento, i documenti fiscali per 10 anni.
          </p>

          <h2>Videosorveglianza</h2>
          <p>
            Gli impianti che installiamo presso i clienti sono configurati secondo le indicazioni del Garante Privacy:
            cartellonistica informativa, tempi di conservazione delle immagini limitati salvo esigenze specifiche,
            accessi nominali e registro dei trattamenti. La titolarità dei dati resta del cliente presso cui l’impianto
            è installato.
          </p>

          <h2>Destinatari</h2>
          <p>
            I dati possono essere trattati da fornitori di servizi nominati responsabili del trattamento: hosting del
            sito, posta elettronica, software gestionale e consulente fiscale. Non trasferiamo dati fuori dallo Spazio
            Economico Europeo.
          </p>

          <h2>I tuoi diritti</h2>
          <p>
            Puoi chiedere in ogni momento accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al
            trattamento, scrivendo a {AZIENDA.emailPrivacy}. Hai inoltre diritto di proporre reclamo al Garante per la
            protezione dei dati personali.
          </p>

          <p className="faint" style={{ fontSize: '.85rem', marginTop: 28 }}>
            Vedi anche la <Link className="link" to="/cookie-policy">Cookie Policy</Link>.
          </p>
        </article>
      </Sezione>
    </div>
  )
}

export function CookiePolicy() {
  const rif = useRivela<HTMLDivElement>()
  useSeo({
    titolo: 'Cookie Policy | Io Riparo',
    descrizione: 'Quali cookie usa il sito di Io Riparo, a cosa servono e come modificare le preferenze in ogni momento.',
    percorso: '/cookie-policy',
  })

  return (
    <div ref={rif}>
      <Sezione>
        <article className="article">
          <span className="eyebrow">Informativa</span>
          <h1 style={{ margin: '14px 0 10px', fontSize: 'clamp(1.8rem,4vw,2.6rem)' }}>Cookie Policy</h1>
          <p className="faint" style={{ fontSize: '.85rem' }}>
            Ultimo aggiornamento: {AGGIORNAMENTO}
          </p>

          <h2>Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti salvano sul dispositivo di chi naviga. Questo sito usa un
            numero volutamente ridotto di cookie e non installa nulla di non necessario prima del tuo consenso.
          </p>

          <h2>Cookie tecnici (sempre attivi)</h2>
          <ul>
            <li>
              <b>ioriparo_consent</b> — memoria della scelta espressa sul banner. Durata 6 mesi.
            </li>
            <li>
              <b>ioriparo_session</b> — sessione dell’area clienti, cifrata e con flag Secure, HttpOnly e SameSite=Lax.
              Durata: sessione.
            </li>
          </ul>

          <h2>Cookie statistici (facoltativi)</h2>
          <p>
            Se acconsenti, raccogliamo statistiche di navigazione anonime e aggregate con indirizzo IP troncato, senza
            profilazione individuale e senza incrocio con altre fonti.
          </p>

          <h2>Cookie di marketing (facoltativi)</h2>
          <p>
            Attivati solo con consenso esplicito, servono a misurare l’efficacia delle campagne pubblicitarie. Se non li
            accetti, il sito funziona esattamente allo stesso modo.
          </p>

          <h2>Servizi di terze parti</h2>
          <p>
            La mappa della pagina Contatti è disegnata da noi e non carica script esterni: nessun cookie di terze parti
            viene installato durante la semplice consultazione del sito.
          </p>

          <h2>Gestione delle preferenze</h2>
          <p>
            Puoi modificare la tua scelta in qualsiasi momento dal pulsante <b>Preferenze cookie</b> presente nel piè di
            pagina, oppure cancellando i cookie dalle impostazioni del browser.
          </p>
        </article>
      </Sezione>
    </div>
  )
}

export function MappaSito() {
  const rif = useRivela<HTMLDivElement>()
  useSeo({
    titolo: 'Mappa del sito | Io Riparo',
    descrizione: 'Tutte le pagine del sito Io Riparo: servizi, preventivi, area clienti, blog e informative.',
    percorso: '/mappa-del-sito',
  })

  const gruppi: [string, [string, string][]][] = [
    [
      'Principali',
      [
        ['Home', '/'],
        ['Chi siamo', '/chi-siamo'],
        ['Servizi', '/servizi'],
        ['Galleria', '/galleria'],
        ['Contatti', '/contatti'],
      ],
    ],
    [
      'Servizi online',
      [
        ['Preventivo online', '/preventivo'],
        ['Prenotazione appuntamenti', '/prenota'],
        ['Stato riparazione', '/stato-riparazione'],
        ['Area clienti', '/area-clienti'],
        ['Tessera fedeltà', '/tessera'],
      ],
    ],
    ['Servizi', SERVIZI.map((s) => [s.titolo, `/servizi/${s.id}`] as [string, string])],
    ['Blog', ARTICOLI.map((a) => [a.titolo, `/blog/${a.slug}`] as [string, string])],
    [
      'Informative',
      [
        ['Privacy Policy', '/privacy'],
        ['Cookie Policy', '/cookie-policy'],
      ],
    ],
  ]

  return (
    <div ref={rif}>
      <Sezione griglia>
        <Intestazione
          occhiello="Mappa del sito"
          principale
          titolo={
            <>
              Tutte le pagine,
              <br />
              in un colpo d’occhio.
            </>
          }
          testo={
            <>
              La stessa struttura è pubblicata in formato XML su <span className="mono">/sitemap.xml</span> per i motori
              di ricerca.
            </>
          }
        />
        <div className="why-grid">
          {gruppi.map(([titolo, voci]) => (
            <div className="card reveal" key={titolo}>
              <h3>{titolo}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0', display: 'grid', gap: 8 }}>
                {voci.map(([etichetta, percorso]) => (
                  <li key={percorso}>
                    <Link className="link" to={percorso} style={{ fontSize: '.88rem' }}>
                      {etichetta.length > 46 ? `${etichetta.slice(0, 46)}…` : etichetta}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Sezione>
    </div>
  )
}

export function NonTrovata() {
  useSeo({
    titolo: 'Pagina non trovata | Io Riparo',
    descrizione: 'La pagina cercata non esiste o è stata spostata.',
    percorso: '/404',
  })

  return (
    <Sezione griglia className="stack" >
      <div style={{ maxWidth: 620, marginInline: 'auto', textAlign: 'center' }}>
        <span className="eyebrow" style={{ justifyContent: 'center' }}>
          Errore 404
        </span>
        <h1 style={{ margin: '16px 0 14px', fontSize: 'clamp(1.9rem,4vw,2.8rem)' }}>Questa pagina non risponde.</h1>
        <p className="lede" style={{ marginInline: 'auto' }}>
          Come certi dispositivi: sembra spenta, ma il resto del sito funziona benissimo.
        </p>
        <div className="row" style={{ justifyContent: 'center', marginTop: 26 }}>
          <LinkBottone a="/">Torna alla home</LinkBottone>
          <LinkBottone a="/contatti" variante="ghost">
            Contattaci
          </LinkBottone>
        </div>
      </div>
    </Sezione>
  )
}
