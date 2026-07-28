import { Illustrazione } from '../componenti/Illustrazione'
import { Recensioni } from '../componenti/Recensioni'
import { Ico, Intestazione, LinkBottone, Sezione } from '../componenti/base'
import { AZIENDA } from '../dati/azienda'
import { MOTIVI, PROCESSO, TAPPE, VALORI } from '../dati/contenuti'
import { useRivela } from '../lib/hook'
import { briciole, useSeo } from '../lib/seo'

export function ChiSiamo() {
  const rif = useRivela<HTMLDivElement>()
  const anni = new Date().getFullYear() - AZIENDA.fondata

  useSeo({
    titolo: 'Chi siamo — il laboratorio Io Riparo | Tortolì',
    descrizione: `Dal ${AZIENDA.fondata} ripariamo smartphone, computer e reti a Tortolì: laboratorio interno, tecnici specializzati, preventivi scritti e garanzia sugli interventi.`,
    percorso: '/chi-siamo',
    datiStrutturati: briciole([
      { nome: 'Home', percorso: '/' },
      { nome: 'Chi siamo', percorso: '/chi-siamo' },
    ]),
  })

  return (
    <div ref={rif}>
      <Sezione griglia>
        <Intestazione
          occhiello="Chi siamo"
          principale
          titolo={
            <>
              Un laboratorio vero,
              <br />
              fatto di persone e strumenti.
            </>
          }
          testo={`Io Riparo nasce nel ${AZIENDA.fondata} da una piccola postazione di microsaldatura e dalla convinzione che un dispositivo rotto quasi sempre si possa salvare. Oggi siamo un centro di assistenza tecnica che segue privati, professionisti e aziende su tutto il ciclo di vita della tecnologia: riparazione, recupero dati, reti e sicurezza.`}
        />

        <div className="split">
          <div className="reveal">
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <Illustrazione scena="team" style={{ width: '100%' }} />
            </div>
          </div>
          <div className="reveal" style={{ display: 'grid', gap: 18 }}>
            <div className="card">
              <h3>La nostra missione</h3>
              <p className="muted" style={{ marginTop: 9, fontSize: '.95rem' }}>
                Rendere la riparazione la prima scelta, non l’ultima. Ogni dispositivo recuperato è denaro risparmiato
                dal cliente e un rifiuto elettronico in meno: nell’ultimo anno abbiamo evitato oltre quattro tonnellate
                di RAEE.
              </p>
            </div>
            <div className="card">
              <h3>Come lavoriamo</h3>
              <p className="muted" style={{ marginTop: 9, fontSize: '.95rem' }}>
                Diagnosi documentata, preventivo scritto prima di toccare qualsiasi cosa, ricambi dichiarati per
                tipologia e origine, collaudo tracciato. Nessuna sorpresa in fattura.
              </p>
            </div>
            <div className="card">
              <h3>Il team</h3>
              <p className="muted" style={{ marginTop: 9, fontSize: '.95rem' }}>
                Tecnici specializzati divisi per area: micro-elettronica e recupero dati, computer e sistemi,
                progettazione di reti e impianti di videosorveglianza.
              </p>
            </div>
          </div>
        </div>
      </Sezione>

      <Sezione tinta>
        <Intestazione
          occhiello="Valori"
          titolo={
            <>
              Quattro regole
              <br />
              che non negoziamo.
            </>
          }
        />
        <div className="why-grid">
          {VALORI.map((v) => (
            <article className="why reveal" key={v.titolo}>
              <Ico nome={v.icona} />
              <div>
                <h3>{v.titolo}</h3>
                <p>{v.testo}</p>
              </div>
            </article>
          ))}
        </div>
      </Sezione>

      <Sezione>
        <Intestazione
          occhiello="Percorso"
          titolo={
            <>
              {anni} anni,
              <br />
              in cinque tappe.
            </>
          }
        />
        <div className="card reveal">
          <div className="steps">
            {TAPPE.map((t, i) => (
              <div className={`step ${i === TAPPE.length - 1 ? 'is-live' : 'is-done'}`} key={t.anno}>
                <span className="step__bullet">
                  <i />
                </span>
                <span>
                  <b>{t.titolo}</b>
                  <small>{t.testo}</small>
                </span>
                <time>{t.anno}</time>
              </div>
            ))}
          </div>
        </div>

        <div className="row" style={{ marginTop: 30 }}>
          <LinkBottone a="/contatti">Vieni a trovarci</LinkBottone>
          <LinkBottone a="/galleria" variante="ghost">
            Guarda i lavori
          </LinkBottone>
        </div>
      </Sezione>
      {/* ── Perché sceglierci ── */}
      <Sezione tinta>
        <Intestazione
          occhiello="Perché Io Riparo"
          titolo={
            <>
              Motivi concreti,
              <br />
              zero promesse generiche.
            </>
          }
        />
        <div className="why-grid">
          {MOTIVI.map((m) => (
            <article className="why reveal" key={m.titolo}>
              <Ico nome={m.icona} />
              <div>
                <h3>{m.titolo}</h3>
                <p>{m.testo}</p>
              </div>
            </article>
          ))}
        </div>
      </Sezione>

      {/* ── Processo ── */}
      <Sezione>
        <Intestazione
          occhiello="Come lavoriamo · 4 passaggi"
          titolo={
            <>
              Dal primo contatto al ritiro,
              <br />
              sempre sotto controllo.
            </>
          }
        />
        <div className="flow">
          {PROCESSO.map((p, i) => (
            <article className="flow__item reveal" key={p.titolo}>
              <span className="flow__n">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3>{p.titolo}</h3>
                <p>{p.testo}</p>
              </div>
            </article>
          ))}
        </div>
      </Sezione>

      {/* ── Recensioni ── */}
      <Sezione tinta>
        <Intestazione
          occhiello="Recensioni · Google"
          titolo="4,9 su 5 da 214 clienti."
          testo="Le opinioni pubblicate sul nostro profilo Google Business, senza filtri."
        />
        <Recensioni />
      </Sezione>

    </div>
  )
}
