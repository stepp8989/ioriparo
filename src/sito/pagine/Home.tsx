import { useGestionale } from '@/data/store'
import { BottoneChiama, BottoneWhatsapp } from '../componenti/Contatto'
import { CampoSegnale } from '../componenti/CampoSegnale'
import { schemaFaq } from '../componenti/Faq'
import { Icona } from '../componenti/Icona'
import { SchedaPratica } from '../componenti/SchedaPratica'
import { GrigliaServizi } from '../componenti/Servizi'
import { Chip, Intestazione, LinkBottone, Sezione } from '../componenti/base'
import { AZIENDA, apertoOra, chiusuraOdierna } from '../dati/azienda'
import { NUMERI } from '../dati/contenuti'
import { useContatore, useRivela } from '../lib/hook'
import { useSeo } from '../lib/seo'
import { numero } from '../lib/utili'


const GARANZIE = [
  'Ricambi originali e compatibili AAA',
  'Riparazioni in giornata',
  'Garanzia 12 mesi sull’intervento',
  'Recupero dati eseguito internamente',
  'Preventivo gratuito e senza impegno',
  'Assistenza aziende con SLA dedicato',
  'Videosorveglianza a norma GDPR',
  'Certificazione degli impianti',
]

function Numero({ valore, suffisso, etichetta }: { valore: number; suffisso: string; etichetta: string }) {
  const [corrente, rif] = useContatore(valore)
  return (
    <div className="stat reveal">
      <b ref={rif}>
        {numero(corrente)}
        {suffisso}
      </b>
      <span>{etichetta}</span>
    </div>
  )
}

export function Home() {
  const rif = useRivela<HTMLDivElement>()
  const { db } = useGestionale()

  useSeo({
    titolo: 'Io Riparo — Riparazioni Smartphone, Computer e Soluzioni Tecnologiche',
    descrizione:
      'Riparazione smartphone, tablet, computer e notebook, recupero dati, videosorveglianza, reti aziendali e impianti Wi-Fi a Tortolì e in tutta l’Ogliastra. Preventivo gratuito, garanzia 12 mesi.',
    percorso: '/',
    datiStrutturati: schemaFaq(),
  })

  const aperto = apertoOra()
  const chiusura = chiusuraOdierna()

  /** In vetrina la pratica aperta più recente: è la stessa del gestionale. */
  const inLavorazione =
    db.riparazioni.find((r) => r.stato === 'in_lavorazione') ??
    db.riparazioni.find((r) => r.stato === 'pronto_per_ritiro') ??
    db.riparazioni[0]

  return (
    <div ref={rif}>
      {/* ── Apertura ── */}
      <div className="hero">
        <CampoSegnale />
        <div className="hero__glow" aria-hidden="true" />
        <div className="wrap">
          <div className="hero__grid">
            <div>
              <div className="hero__badges">
                <Chip variante={aperto ? 'blue' : 'alert'} punto>
                  {aperto && chiusura ? `Aperti oggi fino alle ${chiusura}` : 'Scrivici: rispondiamo domani mattina'}
                </Chip>
                <Chip>
                  <Icona nome="star" dimensione={13} pieno /> 4,9/5 su 214 recensioni
                </Chip>
                <Chip>Garanzia 12 mesi</Chip>
              </div>

              <h1>
                Riparazioni Smartphone, Computer e <span className="grad">Soluzioni Tecnologiche</span>
              </h1>
              <p className="lede">
                Esperienza, qualità e rapidità al servizio dei tuoi dispositivi. Laboratorio interno, ricambi
                certificati e assistenza dedicata ad aziende, hotel e attività commerciali.
              </p>

              <div className="hero__cta">
                <LinkBottone a="/preventivo">
                  Richiedi preventivo <Icona nome="arrow" dimensione={17} />
                </LinkBottone>
                <LinkBottone a="/contatti" variante="ghost">
                  Contattaci
                </LinkBottone>
              </div>

              <div className="hero__meta">
                <div>
                  <b>{new Date().getFullYear() - AZIENDA.fondata}+</b>
                  <span>Anni di attività</span>
                </div>
                <div>
                  <b>24h</b>
                  <span>Riparazioni express</span>
                </div>
                <div>
                  <b>18.400</b>
                  <span>Dispositivi riparati</span>
                </div>
              </div>
            </div>

            <div>
              {inLavorazione && (
                <SchedaPratica
                  riparazione={inLavorazione}
                  vetro
                  azioni={
                    <LinkBottone a="/stato-riparazione" variante="soft" piccolo>
                      Traccia la tua
                    </LinkBottone>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Garanzie ── */}
      <div className="trust">
        <div className="marquee">
          {[0, 1].map((copia) => (
            <div className="marquee__track" key={copia} aria-hidden={copia === 1}>
              {GARANZIE.map((g) => (
                <span key={g}>
                  <Icona nome="check" dimensione={16} /> {g}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Servizi ── */}
      <Sezione id="servizi" griglia>
        <Intestazione
          occhiello="Servizi · 12 specializzazioni"
          titolo={
            <>
              Un unico laboratorio
              <br />
              per dispositivi, reti e sicurezza.
            </>
          }
          testo="Dalla sostituzione di un display alla progettazione della rete di un hotel: stesso team, stessi standard, un solo referente tecnico."
        />
        <GrigliaServizi />
      </Sezione>

      {/* ── Numeri ── */}
      <Sezione tinta>
        <Intestazione
          occhiello="I numeri"
          titolo={
            <>
              Risultati misurati,
              <br />
              non slogan.
            </>
          }
        />
        <div className="stats">
          {NUMERI.map((n) => (
            <Numero key={n.etichetta} valore={n.valore} suffisso={n.suffisso} etichetta={n.etichetta.toUpperCase()} />
          ))}
        </div>
      </Sezione>

      {/* ── Invito finale ── */}
      <Sezione>
        <div
          className="card card--glass reveal"
          style={{ padding: 'clamp(28px,5vw,58px)', textAlign: 'center', display: 'grid', gap: 18, placeItems: 'center' }}
        >
          <div className="blueprint" aria-hidden="true" style={{ opacity: 0.8 }} />
          <span className="eyebrow" style={{ position: 'relative' }}>
            Iniziamo
          </span>
          <h2 style={{ position: 'relative' }}>
            Dicci cosa non funziona.
            <br />
            Al resto pensiamo noi.
          </h2>
          <p className="lede" style={{ position: 'relative', textAlign: 'center' }}>
            Preventivo gratuito in giornata, ritiro e consegna disponibili in zona per aziende e attività commerciali.
          </p>
          <div className="row" style={{ position: 'relative', justifyContent: 'center', marginTop: 6 }}>
            <LinkBottone a="/preventivo">Richiedi preventivo</LinkBottone>
            <LinkBottone a="/prenota" variante="ghost">
              Prenota un appuntamento
            </LinkBottone>
            <BottoneChiama />
            <BottoneWhatsapp />
          </div>
        </div>
      </Sezione>
    </div>
  )
}
