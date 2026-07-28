import { Faq, schemaFaq } from '../componenti/Faq'
import { Illustrazione } from '../componenti/Illustrazione'
import { GrigliaServizi } from '../componenti/Servizi'
import { Chip, Intestazione, LinkBottone, LinkTesto, Sezione, Tabella } from '../componenti/base'
import { LISTINO, SERVIZI } from '../dati/servizi'
import { SETTORI } from '../dati/contenuti'
import { useRivela } from '../lib/hook'
import { SITO_URL, briciole, useSeo } from '../lib/seo'
import { euro } from '../lib/utili'
import { AZIENDA } from '../dati/azienda'

export function Servizi() {
  const rif = useRivela<HTMLDivElement>()

  useSeo({
    titolo: 'Servizi — riparazioni, reti e videosorveglianza | Io Riparo',
    descrizione:
      'Riparazione di smartphone, tablet, computer e notebook, recupero dati, videosorveglianza, impianti Wi-Fi, access point, cablaggio e assistenza alle aziende. Prezzi indicativi e tempi di intervento.',
    percorso: '/servizi',
    datiStrutturati: [
      schemaFaq(),
      briciole([
        { nome: 'Home', percorso: '/' },
        { nome: 'Servizi', percorso: '/servizi' },
      ]),
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: SERVIZI.map((s, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Service',
            name: s.titolo,
            description: s.descrizione,
            serviceType: s.titolo,
            provider: { '@type': 'LocalBusiness', name: AZIENDA.nome },
            areaServed: `${AZIENDA.citta} (${AZIENDA.provincia})`,
            url: `${SITO_URL}/servizi#${s.id}`,
          },
        })),
      },
    ],
  })

  return (
    <div ref={rif}>
      <Sezione griglia>
        <Intestazione
          occhiello="Servizi"
          principale
          titolo={
            <>
              Tutto quello che facciamo,
              <br />
              spiegato senza giri di parole.
            </>
          }
          testo="Prezzi indicativi IVA inclusa: il preventivo definitivo arriva sempre dopo la diagnosi, gratuita e senza impegno."
        />
        <GrigliaServizi />
      </Sezione>

      <Sezione tinta>
        <Intestazione occhiello="Listino orientativo" titolo="Gli interventi più richiesti." />
        <div className="reveal">
          <Tabella
            colonne={[
              { testo: 'Intervento' },
              { testo: 'Dispositivo' },
              { testo: 'Tempi' },
              { testo: 'Da', num: true },
              { testo: 'Garanzia' },
            ]}
          >
            {LISTINO.map((v) => (
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
        <p className="faint" style={{ fontSize: '.8rem', marginTop: 12 }}>
          I prezzi variano in base al modello e alla disponibilità dei ricambi. La diagnosi è sempre gratuita e non
          impegna al preventivo.
        </p>
        <div className="row" style={{ marginTop: 26 }}>
          <LinkBottone a="/preventivo">Calcola il tuo preventivo</LinkBottone>
          <LinkBottone a="/prenota" variante="ghost">
            Prenota un appuntamento
          </LinkBottone>
        </div>
      </Sezione>

      <Sezione id="domande">
        <div className="split" style={{ alignItems: 'start' }}>
          <div className="reveal">
            <span className="eyebrow">Domande frequenti</span>
            <h2 style={{ marginBlock: '14px 16px' }}>
              Prima di portarci
              <br />
              il dispositivo.
            </h2>
            <p className="lede">
              Tempi, garanzie, ricambi e riservatezza dei dati: le risposte che diamo ogni giorno al banco.
            </p>
          </div>
          <Faq />
        </div>
      </Sezione>
      {/* ── Aziende ── */}
      <Sezione>
        <div className="split">
          <div className="reveal">
            <span className="eyebrow">Aziende e attività</span>
            <h2 style={{ marginBlock: '14px 16px' }}>
              Tecnologia che non
              <br />
              può permettersi fermi.
            </h2>
            <p className="lede">
              Progettiamo, installiamo e manuteniamo l’infrastruttura tecnologica di hotel, B&amp;B, ristoranti, negozi
              e uffici: Wi-Fi che copre davvero ogni camera, videosorveglianza a norma e un numero solo da chiamare
              quando qualcosa si ferma.
            </p>
            <div className="row" style={{ marginTop: 24 }}>
              {SETTORI.map((s) => (
                <Chip key={s}>{s}</Chip>
              ))}
            </div>
            <div className="row" style={{ marginTop: 26 }}>
              <LinkBottone a="/servizi">Soluzioni per aziende</LinkBottone>
              <LinkTesto a="/contatti">Parla con un tecnico</LinkTesto>
            </div>
          </div>

          <div className="reveal">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Illustrazione scena="shop" style={{ width: '100%' }} />
              <div style={{ padding: 20, display: 'grid', gap: 14 }}>
                <div className="row" style={{ justifyContent: 'space-between' }}>
                  <Chip variante="ok" punto>
                    Contratto attivo
                  </Chip>
                  <span className="mono faint" style={{ fontSize: '.76rem' }}>
                    SLA 4 ORE
                  </span>
                </div>
                <div className="hours">
                  <div>
                    <b>Hotel Federico II · 48 camere</b>
                    <span>Wi-Fi + TVCC</span>
                  </div>
                  <div>
                    <b>Uptime rete 12 mesi</b>
                    <span style={{ color: 'var(--ok)' }}>99,94%</span>
                  </div>
                  <div>
                    <b>Interventi nell’ultimo anno</b>
                    <span>17 · nessun disservizio</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Sezione>

    </div>
  )
}
