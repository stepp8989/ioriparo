'use client'

import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Campo, Esito, Spunta } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import {
  NOMI_STATO_APPUNTAMENTO,
  NOMI_STATO_NOLEGGIO,
  NOMI_TIPO_DOCUMENTO,
  NOMI_TIPO_RICHIESTA,
  type Appuntamento,
  type ClientePubblico,
  type Noleggio,
  type Richiesta,
} from '@/lib/tipi'
import { classi, dataEstesa, emailValida, prezzo } from '@/lib/utili'

/**
 * Area riservata ai clienti.
 *
 * Un solo componente per accesso, registrazione e pannello: sono tre stati
 * della stessa cosa, e tenerli insieme evita di far rimbalzare l'utente fra
 * pagine diverse quando sbaglia la password o quando la sessione scade.
 *
 * La sessione vive in un cookie firmato lato server; qui non si conserva
 * nulla, si chiede semplicemente «chi sono» al caricamento.
 */

type Contenuto = {
  cliente: ClientePubblico
  noleggi: Noleggio[]
  appuntamenti: Appuntamento[]
  richieste: Richiesta[]
}

type Vista = 'caricamento' | 'accesso' | 'registrazione' | 'dentro'

export function AreaClienti() {
  const [vista, setVista] = useState<Vista>('caricamento')
  const [contenuto, setContenuto] = useState<Contenuto | null>(null)
  const [messaggio, setMessaggio] = useState('')
  const [invio, setInvio] = useState(false)

  /** Chiede al server chi è collegato: è anche il modo di validare la sessione. */
  const carica = useCallback(async () => {
    try {
      const risposta = await fetch('/api/clienti/io')
      if (!risposta.ok) {
        setContenuto(null)
        setVista((precedente) => (precedente === 'registrazione' ? 'registrazione' : 'accesso'))
        return
      }
      setContenuto((await risposta.json()) as Contenuto)
      setVista('dentro')
    } catch {
      setVista('accesso')
      setMessaggio('Non riusciamo a contattare il server. Riprovate fra poco.')
    }
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  async function accedi(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (invio) return

    const modulo = new FormData(evento.currentTarget)
    const email = String(modulo.get('email') ?? '').trim()
    const password = String(modulo.get('password') ?? '')

    if (!emailValida(email)) {
      setMessaggio('Controllate l’indirizzo email.')
      return
    }

    setInvio(true)
    setMessaggio('')

    try {
      const risposta = await fetch('/api/clienti/accesso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const dati = (await risposta.json()) as { errore?: string }

      if (!risposta.ok) {
        setMessaggio(dati.errore ?? 'Accesso non riuscito.')
        return
      }

      await carica()
    } catch {
      setMessaggio('Connessione non riuscita. Riprovate fra poco.')
    } finally {
      setInvio(false)
    }
  }

  async function registra(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (invio) return

    const modulo = new FormData(evento.currentTarget)
    const valore = (nome: string) => String(modulo.get(nome) ?? '').trim()

    if (!emailValida(valore('email'))) {
      setMessaggio('Controllate l’indirizzo email.')
      return
    }
    if (String(modulo.get('password') ?? '').length < 8) {
      setMessaggio('La password deve avere almeno otto caratteri.')
      return
    }

    setInvio(true)
    setMessaggio('')

    try {
      const risposta = await fetch('/api/clienti/registrazione', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: valore('nome'),
          cognome: valore('cognome'),
          email: valore('email'),
          telefono: valore('telefono'),
          password: String(modulo.get('password') ?? ''),
        }),
      })

      const dati = (await risposta.json()) as { errore?: string }

      if (!risposta.ok) {
        setMessaggio(dati.errore ?? 'Registrazione non riuscita.')
        return
      }

      await carica()
    } catch {
      setMessaggio('Connessione non riuscita. Riprovate fra poco.')
    } finally {
      setInvio(false)
    }
  }

  async function esci() {
    await fetch('/api/clienti/accesso', { method: 'DELETE' }).catch(() => undefined)
    setContenuto(null)
    setVista('accesso')
  }

  if (vista === 'caricamento') {
    return (
      <div className="flex min-h-[18rem] items-center justify-center text-tenue">
        <span className="inline-flex items-center gap-3 text-[0.9rem]">
          <Icona nome="orologio" className="size-4 animate-spin" />
          Un istante…
        </span>
      </div>
    )
  }

  if (vista === 'dentro' && contenuto) {
    return <Pannello contenuto={contenuto} onEsci={esci} />
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-8 flex rounded-full border border-bordo p-1" role="tablist">
        {(
          [
            { chiave: 'accesso', nome: 'Accedi' },
            { chiave: 'registrazione', nome: 'Registrati' },
          ] as const
        ).map((scheda) => (
          <button
            key={scheda.chiave}
            type="button"
            role="tab"
            aria-selected={vista === scheda.chiave}
            onClick={() => {
              setVista(scheda.chiave)
              setMessaggio('')
            }}
            className={classi(
              'flex-1 rounded-full px-5 py-2.5 text-[0.9rem] font-medium transition-colors duration-300',
              vista === scheda.chiave ? 'bg-accento text-white' : 'text-tenue hover:text-accento',
            )}
          >
            {scheda.nome}
          </button>
        ))}
      </div>

      {vista === 'accesso' ? (
        <form onSubmit={accedi} className="space-y-5" noValidate>
          <Campo
            etichetta="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            icona="posta"
          />
          <Campo
            etichetta="Password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            icona="lucchetto"
          />

          <Esito testo={messaggio} tipo="errore" />

          <Bottone type="submit" className="w-full" disabled={invio}>
            {invio ? 'Accesso in corso…' : 'Accedi'}
          </Bottone>

          <p className="text-center text-[0.82rem] leading-relaxed text-tenue">
            Password dimenticata? Chiamateci allo{' '}
            <a href={`tel:${AZIENDA.telefonoLink}`} className="text-accento sottolinea">
              {AZIENDA.telefono}
            </a>
            : la reimpostiamo noi dal pannello.
          </p>
        </form>
      ) : (
        <form onSubmit={registra} className="space-y-5" noValidate>
          <div className="grid gap-5 sm:grid-cols-2">
            <Campo etichetta="Nome" name="nome" required minLength={2} autoComplete="given-name" />
            <Campo
              etichetta="Cognome"
              name="cognome"
              required
              minLength={2}
              autoComplete="family-name"
            />
          </div>
          <Campo
            etichetta="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
            icona="posta"
          />
          <Campo
            etichetta="Telefono"
            name="telefono"
            type="tel"
            required
            autoComplete="tel"
            icona="telefono"
          />
          <Campo
            etichetta="Password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            icona="lucchetto"
            nota="Almeno otto caratteri."
          />

          <Spunta
            required
            name="privacy"
            etichetta={
              <>
                Ho letto l’
                <a href="/privacy" className="text-accento sottolinea">
                  informativa sulla privacy
                </a>
                .
              </>
            }
          />

          <Esito testo={messaggio} tipo="errore" />

          <Bottone type="submit" className="w-full" disabled={invio}>
            {invio ? 'Creazione in corso…' : 'Crea l’account'}
          </Bottone>
        </form>
      )}
    </div>
  )
}

/* ── Pannello del cliente ────────────────────────────────────────────────── */

const SEZIONI = [
  { chiave: 'noleggi', nome: 'Noleggi', icona: 'chiave' },
  { chiave: 'appuntamenti', nome: 'Appuntamenti', icona: 'calendario' },
  { chiave: 'richieste', nome: 'Richieste', icona: 'chat' },
  { chiave: 'acquisti', nome: 'Acquisti', icona: 'auto' },
  { chiave: 'documenti', nome: 'Documenti', icona: 'documento' },
] as const

type ChiaveSezione = (typeof SEZIONI)[number]['chiave']

function Pannello({ contenuto, onEsci }: { contenuto: Contenuto; onEsci: () => void }) {
  const [sezione, setSezione] = useState<ChiaveSezione>('noleggi')
  const { cliente, noleggi, appuntamenti, richieste } = contenuto

  const conteggi: Record<ChiaveSezione, number> = {
    noleggi: noleggi.length,
    appuntamenti: appuntamenti.length,
    richieste: richieste.length,
    acquisti: cliente.acquisti.length,
    documenti: cliente.documenti.length,
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[16rem_1fr]">
      <aside>
        <div className="rounded-ampio border border-bordo bg-superficie p-6">
          <p className="text-[0.72rem] tracking-[0.16em] text-tenue uppercase">Ciao</p>
          <p className="mt-1 font-titolo text-[1.2rem] font-semibold">
            {cliente.nome} {cliente.cognome}
          </p>
          <p className="mt-1 text-[0.82rem] break-all text-tenue">{cliente.email}</p>

          <nav className="mt-6 space-y-1" aria-label="Sezioni dell’area clienti">
            {SEZIONI.map((voce) => (
              <button
                key={voce.chiave}
                type="button"
                onClick={() => setSezione(voce.chiave)}
                aria-current={sezione === voce.chiave}
                className={classi(
                  'flex w-full items-center gap-3 rounded-morbido px-4 py-2.5 text-left text-[0.9rem] transition-colors duration-300',
                  sezione === voce.chiave
                    ? 'bg-accento/10 font-semibold text-accento'
                    : 'text-tenue hover:bg-superficie-alt',
                )}
              >
                <Icona nome={voce.icona as NomeIcona} className="size-4 shrink-0" />
                <span className="flex-1">{voce.nome}</span>
                <span className="text-[0.75rem] tabellare">{conteggi[voce.chiave]}</span>
              </button>
            ))}
          </nav>

          <Bottone variante="contorno" misura="piccola" className="mt-6 w-full" onClick={onEsci}>
            <Icona nome="esci" className="size-4" />
            Esci
          </Bottone>
        </div>
      </aside>

      <div className="min-w-0">
        {sezione === 'noleggi' && (
          <Elenco
            titolo="I vostri noleggi"
            vuoto="Non avete ancora noleggiato nessun veicolo."
            voci={noleggi.map((noleggio) => ({
              chiave: noleggio.id,
              titolo: noleggio.veicoloTitolo,
              sottotitolo: `${dataEstesa(noleggio.dal)} → ${dataEstesa(noleggio.al)} · ${noleggio.giorni} giorni`,
              valore: prezzo(noleggio.totale),
              stato: NOMI_STATO_NOLEGGIO[noleggio.stato],
              tono:
                noleggio.stato === 'annullato'
                  ? 'rosso'
                  : noleggio.stato === 'concluso'
                    ? 'neutro'
                    : 'verde',
              nota: `Codice ${noleggio.codice} · ${noleggio.pagamento.stato === 'pagato' ? 'Acconto pagato' : 'Saldo al ritiro'}`,
            }))}
          />
        )}

        {sezione === 'appuntamenti' && (
          <Elenco
            titolo="Appuntamenti in officina e detailing"
            vuoto="Nessun appuntamento registrato."
            voci={appuntamenti.map((appuntamento) => ({
              chiave: appuntamento.id,
              titolo: appuntamento.servizioNome,
              sottotitolo: `${dataEstesa(appuntamento.data)} alle ${appuntamento.ora} · ${appuntamento.veicolo}`,
              valore: `da ${prezzo(appuntamento.prezzo)}`,
              stato: NOMI_STATO_APPUNTAMENTO[appuntamento.stato],
              tono: appuntamento.stato === 'annullato' ? 'rosso' : 'verde',
              nota: `Codice ${appuntamento.codice}`,
            }))}
          />
        )}

        {sezione === 'richieste' && (
          <Elenco
            titolo="Richieste inviate"
            vuoto="Non avete ancora inviato richieste."
            voci={richieste.map((richiesta) => ({
              chiave: richiesta.id,
              titolo: NOMI_TIPO_RICHIESTA[richiesta.tipo],
              sottotitolo: richiesta.veicoloTitolo || 'Richiesta generica',
              valore: dataEstesa(richiesta.creataIl.slice(0, 10)),
              stato: richiesta.stato === 'chiusa' ? 'Chiusa' : 'In lavorazione',
              tono: richiesta.stato === 'chiusa' ? 'neutro' : 'ambra',
              nota: `Codice ${richiesta.codice}`,
            }))}
          />
        )}

        {sezione === 'acquisti' && (
          <Elenco
            titolo="Storico acquisti"
            vuoto="Non risultano acquisti registrati. Se avete comprato da noi prima di registrarvi, scriveteci: colleghiamo la pratica al vostro account."
            voci={cliente.acquisti.map((acquisto) => ({
              chiave: acquisto.id,
              titolo: acquisto.descrizione,
              sottotitolo: dataEstesa(acquisto.data),
              valore: prezzo(acquisto.importo),
              stato: acquisto.stato === 'consegnato' ? 'Consegnato' : 'In lavorazione',
              tono: acquisto.stato === 'consegnato' ? 'verde' : 'ambra',
              nota: '',
            }))}
          />
        )}

        {sezione === 'documenti' && (
          <Elenco
            titolo="Documenti e fatture"
            vuoto="Non ci sono ancora documenti. Li carichiamo noi dal pannello: fatture, contratti e preventivi restano qui, sempre disponibili."
            voci={cliente.documenti.map((documento) => ({
              chiave: documento.id,
              titolo: documento.titolo,
              sottotitolo: `${NOMI_TIPO_DOCUMENTO[documento.tipo]} · ${dataEstesa(documento.data)}`,
              valore: documento.importo !== null ? prezzo(documento.importo) : '',
              stato: '',
              tono: 'neutro',
              nota: '',
              file: documento.file,
            }))}
          />
        )}
      </div>
    </div>
  )
}

type VoceElenco = {
  chiave: string
  titolo: string
  sottotitolo: string
  valore: string
  stato: string
  tono: 'neutro' | 'verde' | 'ambra' | 'rosso'
  nota: string
  file?: string | null
}

function Elenco({
  titolo,
  vuoto,
  voci,
}: {
  titolo: string
  vuoto: string
  voci: VoceElenco[]
}) {
  return (
    <section>
      <h2 className="mb-6 font-titolo text-[1.4rem] font-semibold">{titolo}</h2>

      {voci.length === 0 ? (
        <p className="rounded-ampio border border-dashed border-bordo-forte p-8 text-center text-[0.92rem] leading-relaxed text-tenue">
          {vuoto}
        </p>
      ) : (
        <ul className="space-y-3">
          {voci.map((voce) => (
            <li
              key={voce.chiave}
              className="flex flex-wrap items-start justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5"
            >
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{voce.titolo}</p>
                <p className="mt-1 text-[0.85rem] text-tenue">{voce.sottotitolo}</p>
                {voce.nota && <p className="mt-2 text-[0.78rem] text-tenue">{voce.nota}</p>}
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                {voce.valore && <p className="font-semibold tabellare">{voce.valore}</p>}
                {voce.stato && <Etichetta tono={voce.tono}>{voce.stato}</Etichetta>}
                {voce.file && (
                  <a
                    href={voce.file}
                    download
                    className="inline-flex items-center gap-1.5 text-[0.82rem] font-semibold text-accento sottolinea"
                  >
                    <Icona nome="scarica" className="size-3.5" />
                    Scarica
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
