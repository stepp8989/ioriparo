import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useGestionale } from '@/data/store'
import {
  calcolaTessera,
  codiceInvito,
  movimentiCliente,
  normalizzaInvito,
  type Movimenti,
  type Tessera as DatiTessera,
} from '@/lib/fedelta'
import { archivioOnline, cercaTessera } from '@/lib/supabase'
import type { RegoleFedelta } from '@/types'
import { RiquadroApp } from '../componenti/InstallaApp'
import { Icona } from '../componenti/Icona'
import { useNotifica } from '../componenti/Notifiche'
import { Avviso, Bottone, Chip, Intestazione, LinkBottone, Sezione } from '../componenti/base'
import { AZIENDA } from '../dati/azienda'
import { CHIAVE_TESSERA, ricordaInvito, useRegoleFedelta } from '../lib/fedelta'
import { useMemoria, useRivela } from '../lib/hook'
import { segnaAzione } from '../lib/misure'
import { briciole, SITO_URL, useSeo } from '../lib/seo'
import { euroBreve, numero } from '../lib/utili'

const normalizza = (v: string) => v.toUpperCase().replace(/[^0-9A-Z]/g, '')

/** Le tre regole del programma, scritte per il cliente. */
function ComeFunziona({ regole }: { regole: RegoleFedelta }) {
  const passi = [
    {
      titolo: 'Accumuli punti',
      testo:
        regole.euroPerPunto === 1
          ? 'Un punto per ogni euro speso in riparazioni, registrato da noi alla consegna. Non devi fare niente.'
          : `Un punto ogni ${euroBreve(regole.euroPerPunto)} spesi in riparazioni, registrato da noi alla consegna.`,
    },
    {
      titolo: `${numero(regole.puntiPremio)} punti = buono da ${euroBreve(regole.valorePremio)}`,
      testo: 'Il buono si scala dalla riparazione successiva: basta dirlo in negozio quando lasci il dispositivo.',
    },
    {
      titolo: 'Porta un amico',
      testo: `Condividi il tuo codice: l’amico ha ${euroBreve(regole.scontoAmico)} di sconto sulla prima riparazione e tu ricevi ${numero(regole.puntiPresentatore)} punti quando la ritira.`,
    },
  ]
  return (
    <div className="flow">
      {passi.map((p, i) => (
        <div key={p.titolo} className="flow__item reveal">
          <span className="flow__n">{i + 1}</span>
          <div>
            <h3 style={{ fontSize: '1.02rem' }}>{p.titolo}</h3>
            <p>{p.testo}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Testo del messaggio con cui il cliente invita un amico. */
const messaggioInvito = (codice: string, regole: RegoleFedelta) =>
  `Ti consiglio ${AZIENDA.nome} a ${AZIENDA.citta} per riparare telefono e computer. ` +
  `Con il mio codice ${codice} hai ${euroBreve(regole.scontoAmico)} di sconto sulla prima riparazione: ` +
  `${SITO_URL}/invito/${codice}`

function Condividi({ codice, regole }: { codice: string; regole: RegoleFedelta }) {
  const notifica = useNotifica()
  const testo = messaggioInvito(codice, regole)

  const condividi = async () => {
    segnaAzione('invito')
    if (navigator.share) {
      try {
        await navigator.share({ title: `Invito ${AZIENDA.nome}`, text: testo })
        return
      } catch {
        // Annullato dal cliente o non permesso: si ripiega su WhatsApp.
      }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(testo)}`, '_blank', 'noopener')
  }

  const copia = async () => {
    try {
      await navigator.clipboard.writeText(testo)
      notifica('Messaggio d’invito copiato: incollalo dove vuoi.')
    } catch {
      notifica(`Il tuo codice è ${codice}.`)
    }
  }

  return (
    <div className="tessera__codice">
      <div>
        <span className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
          Il tuo codice invito
        </span>
        <br />
        <b>{codice}</b>
      </div>
      <div className="row" style={{ gap: 8 }}>
        <Bottone piccolo onClick={() => void condividi()}>
          Invita un amico
        </Bottone>
        <Bottone piccolo variante="ghost" onClick={() => void copia()}>
          Copia
        </Bottone>
      </div>
    </div>
  )
}

function Scheda({ dati, codice, regole }: { dati: DatiTessera; codice: string; regole: RegoleFedelta }) {
  return (
    <div className="tessera reveal in">
      <div className="tessera__top">
        <img src="/marchio/logo-chiaro.png" alt={AZIENDA.nome} style={{ height: 34 }} />
        {dati.buoni > 0 ? (
          <Chip variante="ok" punto>
            {dati.buoni === 1 ? '1 buono pronto' : `${dati.buoni} buoni pronti`}
          </Chip>
        ) : (
          <Chip variante="blue">Tessera fedeltà</Chip>
        )}
      </div>

      <div className="tessera__punti">
        {numero(dati.punti)}
        <small>punti</small>
      </div>

      <div className="tessera__barra" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(dati.avanzamento * 100)}>
        <div style={{ width: `${Math.max(2, dati.avanzamento * 100)}%` }} />
      </div>
      <p className="muted" style={{ fontSize: '.86rem', marginTop: 8 }}>
        {dati.buoni > 0
          ? `Hai ${dati.buoni === 1 ? 'un buono' : `${dati.buoni} buoni`} da ${euroBreve(regole.valorePremio)}: chiedi di usarlo alla prossima riparazione. `
          : ''}
        Ancora {numero(dati.mancano)} punti per {dati.buoni > 0 ? 'il prossimo' : 'un buono da'}{' '}
        {euroBreve(regole.valorePremio)}.
      </p>

      {dati.daAmici > 0 && (
        <p className="faint" style={{ fontSize: '.8rem', marginTop: 6 }}>
          Di cui {numero(dati.daAmici)} punti dagli amici che hai portato. Grazie!
        </p>
      )}

      <Condividi codice={codice} regole={regole} />
    </div>
  )
}

export function Tessera() {
  const rif = useRivela<HTMLDivElement>()
  const { db } = useGestionale()
  const regole = useRegoleFedelta()

  const [salvato, setSalvato] = useMemoria(CHIAVE_TESSERA, '')
  // Dalla pagina «Stato riparazione» il codice arriva già nell'indirizzo.
  const [parametri] = useSearchParams()
  const [codice, setCodice] = useState(parametri.get('codice') || salvato)
  const [inCorso, setInCorso] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)
  const [trovata, setTrovata] = useState<{ clienteId: string; movimenti: Movimenti } | null>(null)

  useSeo({
    titolo: 'Tessera fedeltà e Porta un amico | Io Riparo',
    descrizione: `Con la tessera Io Riparo ogni riparazione accumula punti che diventano buoni sconto, e chi porta un amico gli regala ${euroBreve(regole.scontoAmico)} di sconto.`,
    percorso: '/tessera',
    datiStrutturati: briciole([
      { nome: 'Home', percorso: '/' },
      { nome: 'Tessera fedeltà', percorso: '/tessera' },
    ]),
  })

  const cerca = async (valore: string) => {
    if (!normalizza(valore)) {
      setErrore('Inserisci il codice di una tua pratica: lo trovi sulla ricevuta di accettazione.')
      return
    }
    const nonTrovata = `Nessuna pratica con il codice ${valore.toUpperCase()}. Controlla la ricevuta oppure chiamaci al ${AZIENDA.telefono}.`

    if (archivioOnline) {
      setInCorso(true)
      const esito = await cercaTessera(valore)
      setInCorso(false)
      if (!esito.trovata) {
        setTrovata(null)
        setErrore(
          esito.motivo === 'errore'
            ? `Non riusciamo a raggiungere l'archivio in questo momento. Riprova fra poco o chiamaci al ${AZIENDA.telefono}.`
            : nonTrovata,
        )
        return
      }
      setTrovata({ clienteId: esito.clienteId, movimenti: esito })
    } else {
      const pratica = db.riparazioni.find((r) => normalizza(r.codice) === normalizza(valore))
      if (!pratica) {
        setTrovata(null)
        setErrore(nonTrovata)
        return
      }
      setTrovata({ clienteId: pratica.clienteId, movimenti: movimentiCliente(db, pratica.clienteId) })
    }
    setErrore(null)
    // Ricordato su questo dispositivo: dall'app la tessera si apre da sola.
    setSalvato(valore.trim())
  }

  // La tessera già aperta su questo dispositivo si ricarica da sola.
  const avviata = useRef(false)
  useEffect(() => {
    if (avviata.current || !codice) return
    avviata.current = true
    void cerca(codice)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calcolato a ogni giro e non salvato: le regole online arrivano dopo la
  // tessera, e il saldo deve seguire quelle vere.
  const dati = trovata ? calcolaTessera(trovata.movimenti, regole) : null

  const invia = (e: FormEvent) => {
    e.preventDefault()
    void cerca(codice)
  }

  const esci = () => {
    setSalvato('')
    setCodice('')
    setTrovata(null)
  }

  return (
    <div ref={rif}>
      <Sezione griglia>
        <div className="wrap" style={{ maxWidth: 820, padding: 0 }}>
          <Intestazione
            occhiello="Tessera fedeltà"
            principale
            titolo="Ogni riparazione ti fa risparmiare sulla prossima"
            testo={`Punti a ogni riparazione, buoni da ${euroBreve(regole.valorePremio)} e ${euroBreve(regole.scontoAmico)} di sconto per ogni amico che porti. Nessuna registrazione: basta il codice della tua ricevuta.`}
          />

          {!regole.attivo ? (
            <Avviso variante="info" visibile>
              Il programma fedeltà al momento è sospeso. I punti già accumulati restano validi: chiedi in negozio.
            </Avviso>
          ) : trovata && dati ? (
            <div className="stack" style={{ gap: 16 }}>
              <Scheda dati={dati} codice={codiceInvito(trovata.clienteId)} regole={regole} />
              <RiquadroApp testo="Installa l’app e la tessera è sempre a portata di mano, anche senza rete." />
              <p className="faint" style={{ fontSize: '.8rem' }}>
                Non è la tua tessera?{' '}
                <button className="link" onClick={esci} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }}>
                  Apri con un altro codice
                </button>
              </p>
            </div>
          ) : (
            <div className="card reveal">
              <form onSubmit={invia} noValidate>
                <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
                  <div className="field" style={{ flex: 1, minWidth: 220, margin: 0 }}>
                    <label htmlFor="codice-tessera">Codice di una tua pratica</label>
                    <input
                      className="inp mono"
                      id="codice-tessera"
                      value={codice}
                      onChange={(e) => setCodice(e.target.value)}
                      placeholder="#26-0001-K7M"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <Bottone type="submit" disabled={inCorso}>
                    {inCorso ? 'Apro…' : 'Apri la tessera'}
                  </Bottone>
                </div>
              </form>
              <p className="faint" style={{ fontSize: '.79rem', marginTop: 12 }}>
                Va bene il codice di qualsiasi riparazione, anche vecchia: la tessera è unica per cliente.
              </p>
              <div style={{ marginTop: 12 }}>
                <Avviso variante="err" visibile={!!errore}>
                  {errore}
                </Avviso>
              </div>
            </div>
          )}
        </div>
      </Sezione>

      <Sezione tinta>
        <div className="wrap" style={{ maxWidth: 820, padding: 0 }}>
          <Intestazione occhiello="Come funziona" titolo="Tre regole, nessuna sorpresa" />
          <ComeFunziona regole={regole} />
          <p className="faint" style={{ fontSize: '.8rem', marginTop: 16 }}>
            I punti si calcolano sulle riparazioni ritirate. I buoni non sono convertibili in denaro e non si
            cumulano con lo sconto di benvenuto sulla stessa riparazione.
          </p>
        </div>
      </Sezione>
    </div>
  )
}

/**
 * Pagina d'arrivo del link d'invito: `/invito/IR-K7M2Q`.
 *
 * Ricorda il codice su questo dispositivo, così la prima richiesta di
 * preventivo o appuntamento lo porta con sé anche se arriva fra una settimana.
 */
export function Invito() {
  const rif = useRivela<HTMLDivElement>()
  const regole = useRegoleFedelta()
  const { codice = '' } = useParams()
  const valido = normalizzaInvito(codice).length === 7
  const leggibile = valido ? `IR-${normalizzaInvito(codice).slice(2)}` : ''

  useEffect(() => {
    if (valido) ricordaInvito(leggibile)
  }, [valido, leggibile])

  useSeo({
    titolo: `Un amico ti regala ${euroBreve(regole.scontoAmico)} di sconto | Io Riparo`,
    descrizione: `Sei stato invitato da un cliente Io Riparo: ${euroBreve(regole.scontoAmico)} di sconto sulla tua prima riparazione a Tortolì.`,
    percorso: '/tessera',
  })

  return (
    <div ref={rif}>
      <Sezione griglia>
        <div className="wrap" style={{ maxWidth: 760, padding: 0, textAlign: 'center' }}>
          <Intestazione
            occhiello="Invito"
            principale
            titolo={valido ? `Un amico ti regala ${euroBreve(regole.scontoAmico)}` : 'Codice invito non valido'}
            testo={
              valido
                ? `Sconto di ${euroBreve(regole.scontoAmico)} sulla tua prima riparazione da ${AZIENDA.nome}. Il codice è già salvato: richiedi un preventivo o prenota, lo applichiamo noi.`
                : 'Il link sembra incompleto. Chiedi di nuovo il codice a chi ti ha invitato, oppure dillo direttamente in negozio.'
            }
          />
          {valido && (
            <div className="card reveal" style={{ display: 'inline-block', marginBottom: 24 }}>
              <span className="faint" style={{ fontSize: '.74rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                Codice invito
              </span>
              <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '.12em', marginTop: 4 }}>
                {leggibile}
              </div>
            </div>
          )}
          <div className="row" style={{ justifyContent: 'center' }}>
            <LinkBottone a="/preventivo">
              <Icona nome="doc" dimensione={18} />
              Richiedi un preventivo
            </LinkBottone>
            <LinkBottone a="/prenota" variante="ghost">
              <Icona nome="calendar" dimensione={18} />
              Prenota un appuntamento
            </LinkBottone>
          </div>
          <p className="faint" style={{ fontSize: '.8rem', marginTop: 18 }}>
            Passi direttamente in negozio? Mostra questa pagina o comunica il codice all’accettazione.
          </p>
        </div>
      </Sezione>
    </div>
  )
}
