import { Navigate, useParams } from 'react-router-dom'
import { BottoneChiama, BottoneWhatsapp } from '../componenti/Contatto'
import { Faq, schemaFaq } from '../componenti/Faq'
import { Icona } from '../componenti/Icona'
import { Illustrazione } from '../componenti/Illustrazione'
import { SchedaServizio } from '../componenti/Servizi'
import { Chip, Intestazione, LinkBottone, LinkTesto, Sezione, Tabella } from '../componenti/base'
import { AZIENDA, TELEFONO_E164 } from '../dati/azienda'
import { DETTAGLI } from '../dati/dettagli-servizi'
import { LISTINO, SERVIZI } from '../dati/servizi'
import { useRivela } from '../lib/hook'
import { SITO_URL, briciole, useSeo } from '../lib/seo'
import { euro } from '../lib/utili'
import { PromoPellicola } from '../componenti/PromoPellicola'

/** Voci di listino che riguardano il servizio mostrato. */
function listinoDelServizio(id: string) {
  const perServizio: Record<string, string[]> = {
    'riparazione-smartphone': ['Sostituzione display', 'Sostituzione batteria', 'Riparazione connettore di ricarica', 'Trattamento ossido da liquidi'],
    'riparazione-tablet': ['Sostituzione batteria', 'Trattamento ossido da liquidi'],
    'riparazione-computer': ['Upgrade SSD + clonazione'],
    'assistenza-notebook': ['Upgrade SSD + clonazione', 'Sostituzione tastiera o cerniere'],
    'recupero-dati': ['Recupero dati logico'],
    videosorveglianza: ['Impianto TVCC 4 telecamere'],
    'impianti-wifi': ['Access point Wi-Fi 6 + configurazione'],
    'access-point': ['Access point Wi-Fi 6 + configurazione'],
    'cablaggio-rete': ['Punto rete certificato Cat.6'],
  }
  const voci = perServizio[id]
  return voci ? LISTINO.filter((v) => voci.includes(v.intervento)) : []
}

export function Servizio() {
  const { id } = useParams()
  const rif = useRivela<HTMLDivElement>()

  const servizio = SERVIZI.find((s) => s.id === id)
  const dettaglio = id ? DETTAGLI[id] : undefined

  useSeo({
    titolo: dettaglio ? `${dettaglio.titolo} | Io Riparo` : 'Servizio | Io Riparo',
    descrizione: servizio?.descrizione ?? '',
    percorso: `/servizi/${id ?? ''}`,
    datiStrutturati:
      servizio && dettaglio
        ? [
            {
              '@context': 'https://schema.org',
              '@type': 'Service',
              name: servizio.titolo,
              description: servizio.descrizione,
              serviceType: servizio.titolo,
              url: `${SITO_URL}/servizi/${servizio.id}`,
              provider: { '@type': 'LocalBusiness', name: AZIENDA.nome, telephone: TELEFONO_E164 },
              areaServed: [AZIENDA.citta, 'Ogliastra', 'Provincia di Nuoro'],
              offers: { '@type': 'Offer', priceCurrency: 'EUR', description: `Prezzi ${servizio.prezzo}` },
            },
            schemaFaq(dettaglio.domande),
            briciole([
              { nome: 'Home', percorso: '/' },
              { nome: 'Servizi', percorso: '/servizi' },
              { nome: servizio.titolo, percorso: `/servizi/${servizio.id}` },
            ]),
          ]
        : undefined,
  })

  if (!servizio || !dettaglio) return <Navigate to="/servizi" replace />

  const listino = listinoDelServizio(servizio.id)
  const correlati = SERVIZI.filter((s) => s.id !== servizio.id && s.famiglia === servizio.famiglia).slice(0, 3)

  return (
    <div ref={rif}>
      {/* ── Apertura ── */}
      <Sezione griglia>
        <div className="split">
          <div className="reveal">
            <LinkTesto a="/servizi">Tutti i servizi</LinkTesto>
            <h1 style={{ fontSize: 'clamp(2rem,4.4vw,3rem)', margin: '18px 0 16px', letterSpacing: '-.035em', lineHeight: 1.06 }}>
              {dettaglio.titolo}
            </h1>
            <p className="lede">{dettaglio.intro}</p>

            <div className="row" style={{ marginTop: 22 }}>
              <Chip variante="blue">Prezzi {servizio.prezzo}</Chip>
              <Chip>
                <Icona nome="clock" dimensione={13} /> {servizio.tempo}
              </Chip>
              <Chip variante="ok">Diagnosi gratuita</Chip>
            </div>

            <div className="row" style={{ marginTop: 26 }}>
              <LinkBottone a={`/preventivo?servizio=${servizio.id}`}>
                Richiedi preventivo <Icona nome="arrow" dimensione={17} />
              </LinkBottone>
              <BottoneChiama />
              <BottoneWhatsapp testo={`Buongiorno, avrei bisogno di: ${servizio.titolo}.`} />
            </div>

            {servizio.id === 'riparazione-smartphone' && (
              <div style={{ marginTop: 22 }}>
                <PromoPellicola />
              </div>
            )}
          </div>

          <div className="reveal">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Illustrazione scena={servizio.scena} style={{ width: '100%' }} />
            </div>
          </div>
        </div>
      </Sezione>

      {/* ── Cosa comprende ── */}
      <Sezione tinta>
        <div className="split" style={{ alignItems: 'start' }}>
          <div className="reveal">
            <span className="eyebrow">Cosa comprende</span>
            <h2 style={{ marginBlock: '14px 16px' }}>Gli interventi che facciamo.</h2>
            <p className="lede">
              Se il tuo caso non è in elenco chiamaci: quasi sempre rientra in una di queste lavorazioni, e comunque la
              diagnosi non si paga.
            </p>
          </div>

          <ul className="reveal" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 12 }}>
            {dettaglio.interventi.map((voce) => (
              <li className="row" style={{ gap: 12, flexWrap: 'nowrap', alignItems: 'flex-start' }} key={voce}>
                <span className="ico" style={{ width: 30, height: 30, borderRadius: 9 }}>
                  <Icona nome="check" dimensione={15} />
                </span>
                <span className="muted" style={{ fontSize: '.95rem', lineHeight: 1.55 }}>
                  {voce}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Sezione>

      {/* ── Come si svolge ── */}
      <Sezione>
        <Intestazione occhiello={`Come lavoriamo · ${dettaglio.fasi.length} passaggi`} titolo="Dalla diagnosi alla consegna." />
        <div className="flow">
          {dettaglio.fasi.map((f, i) => (
            <article className="flow__item reveal" key={f.titolo}>
              <span className="flow__n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{f.titolo}</h3>
                <p>{f.testo}</p>
              </div>
            </article>
          ))}
        </div>
      </Sezione>

      {/* ── Prezzi indicativi ── */}
      {listino.length > 0 && (
        <Sezione tinta>
          <Intestazione
            occhiello="Prezzi indicativi"
            titolo="Quanto costa, all'incirca."
            testo="Cifre IVA inclusa che valgono per i modelli più comuni. Il preventivo definitivo arriva dopo la diagnosi ed è sempre gratuito."
          />
          <div className="reveal">
            <Tabella
              colonne={[{ testo: 'Intervento' }, { testo: 'Dispositivo' }, { testo: 'Tempi' }, { testo: 'Da', num: true }, { testo: 'Garanzia' }]}
            >
              {listino.map((v) => (
                <tr key={v.intervento}>
                  <td>
                    <b>{v.intervento}</b>
                  </td>
                  <td>{v.dispositivo}</td>
                  <td>{v.tempi}</td>
                  <td className="num">{euro(v.da)}</td>
                  <td>{v.garanzia}</td>
                </tr>
              ))}
            </Tabella>
          </div>
        </Sezione>
      )}

      {/* ── Domande frequenti ── */}
      <Sezione>
        <div className="split" style={{ alignItems: 'start' }}>
          <div className="reveal">
            <span className="eyebrow">Domande frequenti</span>
            <h2 style={{ marginBlock: '14px 16px' }}>Quello che ci chiedete su questo servizio.</h2>
            <p className="lede">Hai un dubbio diverso? Scrivici su WhatsApp: rispondiamo in orario di apertura entro pochi minuti.</p>
            <div className="row" style={{ marginTop: 22 }}>
              <LinkBottone a="/contatti" variante="ghost">
                Fai una domanda
              </LinkBottone>
            </div>
          </div>
          <Faq voci={dettaglio.domande} />
        </div>
      </Sezione>

      {/* ── Servizi collegati ── */}
      {correlati.length > 0 && (
        <Sezione tinta>
          <Intestazione occhiello="Ti serve anche" titolo="Altri servizi della stessa area." />
          <div className="svc-grid">
            {correlati.map((s) => (
              <SchedaServizio key={s.id} servizio={s} />
            ))}
          </div>
        </Sezione>
      )}
    </div>
  )
}
