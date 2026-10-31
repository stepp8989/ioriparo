import { useState, type FormEvent } from 'react'
import { useGestionale } from '@/data/store'
import { archivioOnline, cercaPratica, type StatoPubblico } from '@/lib/supabase'
import type { Riparazione, StatoRiparazione as Stato, TipoDispositivo } from '@/types'
import { BottoneChiama } from '../componenti/Contatto'
import { useNotifica } from '../componenti/Notifiche'
import { RiquadroApp } from '../componenti/InstallaApp'
import { SchedaPratica } from '../componenti/SchedaPratica'
import { Avviso, Bottone, Intestazione, LinkBottone, Sezione } from '../componenti/base'
import { AZIENDA } from '../dati/azienda'
import { useRivela } from '../lib/hook'
import { briciole, useSeo } from '../lib/seo'

/** Confronto tollerante: `#26-0007-K7M`, `26 0007 K7M` e `260007K7M` coincidono. */
const normalizza = (v: string) => v.toUpperCase().replace(/[^0-9A-Z]/g, '')

/**
 * Adatta la risposta dell'archivio online alla scheda già esistente.
 * Il database restituisce solo i campi non personali: gli altri restano vuoti
 * e la scheda viene mostrata senza importi.
 */
const daArchivio = (p: StatoPubblico): Riparazione => ({
  id: p.codice,
  codice: p.codice,
  clienteId: '',
  tipoDispositivo: p.tipo_dispositivo as TipoDispositivo,
  marca: p.dispositivo.split(' ')[0] ?? '',
  modello: p.dispositivo.split(' ').slice(1).join(' '),
  difettoSegnalato: '',
  accessori: { scatola: false, cover: false, caricabatterie: false, cavoUsb: false },
  stato: p.stato as Stato,
  interventi: [],
  acconto: 0,
  dataAccettazione: p.data_accettazione ?? '',
  consegnaPrevista: p.data_prevista ?? undefined,
  dataConsegna: p.data_consegna ?? undefined,
})

export function StatoRiparazione() {
  const rif = useRivela<HTMLDivElement>()
  const { db } = useGestionale()
  const notifica = useNotifica()

  const [codice, setCodice] = useState('')
  const [inCorso, setInCorso] = useState(false)
  const [risultato, setRisultato] = useState<Riparazione | null>(null)
  const [errore, setErrore] = useState<string | null>(null)

  useSeo({
    titolo: 'Stato riparazione — traccia la tua pratica | Io Riparo',
    descrizione:
      'Inserisci il codice pratica della tua riparazione e scopri a che punto siamo: diagnosi, preventivo, lavorazione, collaudo e ritiro, aggiornati in tempo reale.',
    percorso: '/stato-riparazione',
    datiStrutturati: briciole([
      { nome: 'Home', percorso: '/' },
      { nome: 'Stato riparazione', percorso: '/stato-riparazione' },
    ]),
  })

  const nonTrovata = (valore: string) =>
    `Nessuna pratica trovata con il codice ${valore.toUpperCase()}. Controlla la ricevuta oppure chiamaci al ${AZIENDA.telefono}.`

  const cerca = async (valore: string) => {
    const richiesto = normalizza(valore)
    if (!richiesto) {
      setErrore('Inserisci il codice pratica che trovi sulla ricevuta di accettazione.')
      setRisultato(null)
      return
    }

    // Con l'archivio online la pratica arriva dal laboratorio in tempo reale;
    // senza, si cerca nell'archivio locale del browser.
    if (archivioOnline) {
      setInCorso(true)
      const esito = await cercaPratica(valore)
      setInCorso(false)
      if (esito.trovata) {
        setRisultato(daArchivio(esito.pratica))
        setErrore(null)
        return
      }
      setRisultato(null)
      setErrore(
        esito.motivo === 'errore'
          ? `Non riusciamo a raggiungere l'archivio in questo momento. Riprova fra poco o chiamaci al ${AZIENDA.telefono}.`
          : nonTrovata(valore),
      )
      return
    }

    const trovata = db.riparazioni.find((r) => normalizza(r.codice) === richiesto)
    setRisultato(trovata ?? null)
    setErrore(trovata ? null : nonTrovata(valore))
  }

  const invia = (e: FormEvent) => {
    e.preventDefault()
    void cerca(codice)
  }

  return (
    <div ref={rif}>
      <Sezione griglia>
        <div className="wrap" style={{ maxWidth: 820, padding: 0 }}>
          <Intestazione
            occhiello="Stato riparazione"
            principale
            titolo="Dov'è il mio dispositivo?"
            testo="Inserisci il codice pratica che trovi sulla ricevuta di accettazione o nella e-mail di conferma."
          />

          <div className="card reveal">
            <form onSubmit={invia} noValidate>
              <div className="row" style={{ gap: 10, alignItems: 'flex-end' }}>
                <div className="field" style={{ flex: 1, minWidth: 220, margin: 0 }}>
                  <label htmlFor="codice">Codice pratica</label>
                  <input
                    className="inp mono"
                    id="codice"
                    value={codice}
                    onChange={(e) => setCodice(e.target.value)}
                    placeholder="#26-0001-K7M"
                    autoComplete="off"
                    required
                  />
                </div>
                <Bottone type="submit" disabled={inCorso}>
                  {inCorso ? 'Cerco…' : 'Verifica stato'}
                </Bottone>
              </div>
            </form>

            <p className="faint" style={{ fontSize: '.79rem', marginTop: 12 }}>
              Il codice si trova sulla ricevuta di accettazione, nel formato <span className="mono">#26-0001-K7M</span>.
            </p>
          </div>

          <div style={{ marginTop: 20 }}>
            <Avviso variante="err" visibile={!!errore}>
              {errore}
            </Avviso>

            {risultato && (
              <>
                <SchedaPratica riparazione={risultato} senzaImporti={archivioOnline} />
                <div className="row" style={{ marginTop: 16 }}>
                  <BottoneChiama piccolo>Serve aiuto? Chiamaci</BottoneChiama>
                  <Bottone
                    variante="soft"
                    piccolo
                    onClick={() => notifica('Ti avviseremo via e-mail a ogni cambio di stato.')}
                  >
                    Ricevi aggiornamenti
                  </Bottone>
                  <LinkBottone a={`/tessera?codice=${encodeURIComponent(risultato.codice)}`} variante="ghost" piccolo>
                    I tuoi punti fedeltà
                  </LinkBottone>
                </div>
                <div style={{ marginTop: 16 }}>
                  <RiquadroApp testo="Installa l’app: la prossima volta controlli lo stato con un tocco." />
                </div>
              </>
            )}
          </div>
        </div>
      </Sezione>
    </div>
  )
}
