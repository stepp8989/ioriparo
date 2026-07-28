import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AZIENDA, INDIRIZZO_COMPLETO, ORARI, SOCIAL, WHATSAPP } from '../dati/azienda'
import { TEL, useChiamata } from './Contatto'
import { inviaModulo } from '../lib/moduli'
import { emailValida } from '../lib/utili'
import { Icona } from './Icona'
import { Marchio } from './Marchio'
import { useNotifica } from './Notifiche'

const SERVIZI_PIEDE = [
  ['Riparazione smartphone', '/servizi/riparazione-smartphone'],
  ['Riparazione computer', '/servizi/riparazione-computer'],
  ['Riparazione console', '/servizi/riparazione-console'],
  ['Recupero dati', '/servizi/recupero-dati'],
  ['Videosorveglianza', '/servizi/videosorveglianza'],
  ['Reti e Wi-Fi', '/servizi/impianti-wifi'],
]

const AZIENDA_PIEDE = [
  ['Chi siamo', '/chi-siamo'],
  ['Galleria', '/galleria'],
  ['Blog', '/blog'],
  ['Stato riparazione', '/stato-riparazione'],
  ['Area clienti', '/area-clienti'],
  ['Prenota appuntamento', '/prenota'],
]

export function PiePagina({ onPreferenzeCookie }: { onPreferenzeCookie: () => void }) {
  const [email, setEmail] = useState('')
  const notifica = useNotifica()
  const chiama = useChiamata()

  const iscrivi = async (e: FormEvent) => {
    e.preventDefault()
    if (!emailValida(email)) {
      notifica('Inserisci un indirizzo e-mail valido.')
      return
    }
    const esito = await inviaModulo('newsletter', { email, campi: { 'E-mail': email } })
    setEmail('')
    notifica(esito.ok ? 'Iscrizione inviata: ti confermiamo a breve.' : esito.errore)
  }

  return (
    <footer className="ftr">
      <div className="wrap">
        <div className="ftr__grid">
          <div>
            <Marchio altezza={100} senzaLink />
            <p className="muted" style={{ fontSize: '.88rem', maxWidth: '34ch', marginTop: 16 }}>
              Centro di assistenza tecnica per smartphone, computer, reti e videosorveglianza.
              {' '}
              {AZIENDA.citta} e Ogliastra dal {AZIENDA.fondata}.
            </p>
            <div className="social" style={{ marginTop: 18 }}>
              {SOCIAL.map(([rete, url]) => (
                <a key={rete} href={url} aria-label={rete === 'facebook' ? 'Facebook' : 'Instagram'} target="_blank" rel="noopener noreferrer">
                  <Icona nome={rete === 'facebook' ? 'fb' : 'ig'} dimensione={17} />
                </a>
              ))}
              <a href={WHATSAPP} aria-label="WhatsApp" target="_blank" rel="noopener noreferrer">
                <Icona nome="wa" dimensione={17} pieno />
              </a>
              <a href={`mailto:${AZIENDA.email}`} aria-label="E-mail">
                <Icona nome="mail" dimensione={17} />
              </a>
            </div>
          </div>

          <div>
            <h4>Servizi</h4>
            <ul>
              {SERVIZI_PIEDE.map(([etichetta, percorso]) => (
                <li key={percorso}>
                  <Link to={percorso}>{etichetta}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Azienda</h4>
            <ul>
              {AZIENDA_PIEDE.map(([etichetta, percorso]) => (
                <li key={percorso}>
                  <Link to={percorso}>{etichetta}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4>Newsletter</h4>
            <p className="muted" style={{ fontSize: '.86rem' }}>
              Una mail al mese: promozioni, avvisi di sicurezza e guide utili. Niente spam.
            </p>
            <form className="news" onSubmit={iscrivi} noValidate>
              <input
                className="inp"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="La tua e-mail"
                aria-label="Indirizzo e-mail"
                required
              />
              <button className="btn btn--sm" type="submit" aria-label="Iscriviti alla newsletter">
                <Icona nome="arrow" dimensione={17} />
              </button>
            </form>

            <div className="hours" style={{ marginTop: 18 }}>
              <div>
                <b>Lun–Ven</b>
                <span>{ORARI[0].orario}</span>
              </div>
              <div>
                <b>Sabato</b>
                <span>{ORARI[5].orario}</span>
              </div>
              <div>
                <b>Domenica</b>
                <span>Chiuso</span>
              </div>
            </div>

            <div className="hours" style={{ marginTop: 12 }}>
              <div>
                <b>
                  <a href={TEL} onClick={chiama}>
                    {AZIENDA.telefono}
                  </a>
                </b>
                <span>Telefono</span>
              </div>
              <div>
                <b>
                  <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">
                    {AZIENDA.cellulare}
                  </a>
                </b>
                <span>WhatsApp</span>
              </div>
              <div>
                <b>
                  <a href={`mailto:${AZIENDA.email}`}>{AZIENDA.email}</a>
                </b>
                <span>{INDIRIZZO_COMPLETO}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="ftr__bottom">
          <span>
            © {new Date().getFullYear()} {AZIENDA.nome} · P.IVA {AZIENDA.partitaIva} · Tutti i diritti riservati
          </span>
          <div className="row" style={{ gap: 18 }}>
            <Link to="/privacy">Privacy Policy</Link>
            <Link to="/cookie-policy">Cookie Policy</Link>
            <button className="link" onClick={onPreferenzeCookie} style={{ background: 'none', border: 0, cursor: 'pointer', fontSize: '.78rem' }}>
              Preferenze cookie
            </button>
            <Link to="/mappa-del-sito">Mappa del sito</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
