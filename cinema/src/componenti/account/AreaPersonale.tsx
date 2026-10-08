'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Accesso } from '@/componenti/account/Accesso'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Locandina } from '@/componenti/ui/Poster'
import { Scheletro, ScheletroTesto } from '@/componenti/ui/Scheletro'
import { Schede } from '@/componenti/ui/Schede'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo, Interruttore } from '@/componenti/ui/campi'
import type {
  ClientePubblico,
  Coupon,
  Film,
  Impostazioni,
  LivelloLoyalty,
  MovimentoPunti,
  Notifica,
  PianoAbbonamento,
  PremioLoyalty,
  Prenotazione,
  Sottoscrizione,
} from '@/lib/tipi'
import { classi, dataEstesa, dataOra, elencoPosti, prezzoPieno } from '@/lib/utili'

/**
 * «My Cinema»: la dashboard personale.
 *
 * Tutti i dati arrivano da `/api/clienti/io` in una sola richiesta. È una
 * scelta deliberata contro l'alternativa più di moda — una chiamata per
 * sezione — perché qui le sezioni sono sette e si guardano tutte nello stesso
 * momento: sette richieste in parallelo darebbero sette caricamenti sfalsati e
 * un'interfaccia che continua a muoversi.
 *
 * Il primo pannello è «prossime visioni» e non il profilo, perché il motivo
 * per cui si apre quest'area, nove volte su dieci, è arrivare al proprio QR.
 */

type DatiArea = {
  cliente: ClientePubblico
  progresso: {
    attuale: LivelloLoyalty | null
    prossimo: LivelloLoyalty | null
    mancanti: number
    percentuale: number
  }
  livelli: LivelloLoyalty[]
  premi: PremioLoyalty[]
  movimenti: MovimentoPunti[]
  prossimi: Prenotazione[]
  storico: Prenotazione[]
  coupon: Coupon[]
  abbonamenti: { sottoscrizione: Sottoscrizione; piano: PianoAbbonamento | null }[]
  preferiti: Film[]
  notifiche: Notifica[]
  impostazioni: Impostazioni
}

type Vista = 'prossimi' | 'biglietti' | 'club' | 'coupon' | 'abbonamento' | 'preferiti' | 'profilo'

export function AreaPersonale({ vistaIniziale }: { vistaIniziale: string }) {
  const { mostra } = useAvvisi()

  const [dati, setDati] = useState<DatiArea | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const [collegato, setCollegato] = useState<boolean | null>(null)
  const [vista, setVista] = useState<Vista>(
    (['prossimi', 'biglietti', 'club', 'coupon', 'abbonamento', 'preferiti', 'profilo'] as const).includes(
      vistaIniziale as Vista,
    )
      ? (vistaIniziale as Vista)
      : 'prossimi',
  )

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch('/api/clienti/io', { cache: 'no-store' })
      if (risposta.status === 401) {
        setCollegato(false)
        return
      }
      if (!risposta.ok) throw new Error('lettura non riuscita')

      setDati((await risposta.json()) as DatiArea)
      setCollegato(true)
    } catch {
      mostra('Non riusciamo a leggere i tuoi dati. Riprova fra poco.', 'errore')
    } finally {
      setCaricamento(false)
    }
  }, [mostra])

  useEffect(() => {
    void carica()
  }, [carica])

  async function esci() {
    await fetch('/api/clienti/accesso', { method: 'DELETE' })
    setCollegato(false)
    setDati(null)
    mostra('Sei uscito dal tuo account.')
  }

  /* ── Non collegato ────────────────────────────────────────────────────── */
  if (collegato === false) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="text-center font-titolo text-[2rem] font-semibold">My Cinema</h1>
        <p className="mt-3 text-center text-[0.95rem] text-tenue">
          Biglietti, punti, coupon e abbonamento in un posto solo.
        </p>

        <div className="mt-5">
          <Accesso registrazioneAperta onAccesso={carica} />
        </div>
      </div>
    )
  }

  if (caricamento || !dati) {
    return (
      <div className="space-y-6">
        <Scheletro className="h-10 w-64" />
        <Scheletro className="h-32 w-full rounded-ampio" />
        <ScheletroTesto righe={5} />
      </div>
    )
  }

  const { cliente, progresso } = dati

  return (
    <div>
      {/* ── Intestazione ────────────────────────────────────────────────── */}
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-accento">
            My Cinema
          </p>
          <h1 className="mt-2 font-titolo text-[2rem] font-semibold">
            Ciao {cliente.nome}
          </h1>
          <p className="mt-1.5 text-[0.9rem] text-tenue">{cliente.email}</p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Bottone href="/programmazione" misura="piccola">
            <Icona nome="biglietto" className="size-4" />
            Compra biglietti
          </Bottone>
          <Bottone variante="tenue" misura="piccola" onClick={esci}>
            <Icona nome="esci" className="size-4" />
            Esci
          </Bottone>
        </div>
      </header>

      {/* ── Riquadro CLUB ───────────────────────────────────────────────── */}
      {dati.impostazioni.moduli.loyalty && progresso.attuale && (
        <div className="mt-8 rounded-ampio border border-bordo bg-superficie p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <span
                className="inline-flex size-12 items-center justify-center rounded-full"
                style={{
                  backgroundColor: `${progresso.attuale.colore}22`,
                  color: progresso.attuale.colore,
                }}
              >
                <Icona nome="trofeo" className="size-6" />
              </span>
              <div>
                <p className="font-titolo text-[1.2rem] font-semibold">
                  {dati.impostazioni.marchio.nome} CLUB {progresso.attuale.nome}
                </p>
                <p className="text-[0.86rem] text-tenue">
                  {cliente.punti.toLocaleString('it-IT')} punti disponibili
                </p>
              </div>
            </div>

            <p className="tabellare text-right">
              <span className="block font-titolo text-[2rem] font-bold text-accento">
                {cliente.punti.toLocaleString('it-IT')}
              </span>
              <span className="text-[0.78rem] text-tenue">
                valgono {prezzoPieno(cliente.punti * dati.impostazioni.valorePunto)}
              </span>
            </p>
          </div>

          {progresso.prossimo && (
            <div className="mt-6">
              <div className="flex justify-between text-[0.8rem] text-tenue">
                <span>{progresso.attuale.nome}</span>
                <span>{progresso.prossimo.nome}</span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-superficie-alt"
                role="progressbar"
                aria-valuenow={progresso.percentuale}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Avanzamento verso il livello ${progresso.prossimo.nome}`}
              >
                <div
                  className="h-full rounded-full bg-accento transition-all duration-700"
                  style={{ width: `${progresso.percentuale}%` }}
                />
              </div>
              <p className="mt-2 text-[0.84rem] text-tenue">
                <strong className="text-testo">{progresso.mancanti} punti</strong> al livello{' '}
                {progresso.prossimo.nome}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Schede ──────────────────────────────────────────────────────── */}
      <Schede
        className="mt-8"
        etichetta="Sezioni dell’area personale"
        attiva={vista}
        onCambia={setVista}
        schede={[
          {
            id: 'prossimi',
            etichetta: 'Prossime visioni',
            conteggio: dati.prossimi.length,
            contenuto: <ElencoPrenotazioni voci={dati.prossimi} vuoto="Non hai biglietti per i prossimi giorni." />,
          },
          {
            id: 'biglietti',
            etichetta: 'Storico',
            conteggio: dati.storico.length,
            contenuto: <ElencoPrenotazioni voci={dati.storico} vuoto="Il tuo storico è ancora vuoto." storico />,
          },
          ...(dati.impostazioni.moduli.loyalty
            ? [
                {
                  id: 'club' as const,
                  etichetta: 'CLUB',
                  contenuto: <SezioneClub dati={dati} onAggiorna={carica} />,
                },
              ]
            : []),
          {
            id: 'coupon',
            etichetta: 'Coupon',
            conteggio: dati.coupon.length,
            contenuto: <SezioneCoupon coupon={dati.coupon} />,
          },
          ...(dati.impostazioni.moduli.abbonamenti
            ? [
                {
                  id: 'abbonamento' as const,
                  etichetta: 'Abbonamento',
                  contenuto: <SezioneAbbonamento dati={dati} onAggiorna={carica} />,
                },
              ]
            : []),
          {
            id: 'preferiti',
            etichetta: 'Preferiti',
            conteggio: dati.preferiti.length,
            contenuto: <SezionePreferiti film={dati.preferiti} />,
          },
          {
            id: 'profilo',
            etichetta: 'Profilo',
            contenuto: <SezioneProfilo dati={dati} onAggiorna={carica} />,
          },
        ]}
      />
    </div>
  )
}

/* ── Prenotazioni ───────────────────────────────────────────────────────── */

function ElencoPrenotazioni({
  voci,
  vuoto,
  storico = false,
}: {
  voci: Prenotazione[]
  vuoto: string
  storico?: boolean
}) {
  if (voci.length === 0) {
    return (
      <Nota icona={<Icona nome="biglietto" className="size-4" />}>
        {vuoto}{' '}
        <Link href="/programmazione" className="text-accento underline">
          Guarda cosa c’è in sala
        </Link>
        .
      </Nota>
    )
  }

  return (
    <ul className="space-y-3">
      {voci.map((prenotazione) => (
        <li key={prenotazione.id}>
          <Link
            href={`/biglietto/${prenotazione.codice}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-morbido border border-bordo bg-superficie p-4 transition-colors hover:border-accento"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2">
                <span className="tabellare font-titolo text-[1rem] font-bold tracking-[0.12em]">
                  {prenotazione.codice}
                </span>
                {prenotazione.stato === 'in-attesa' && <Etichetta tono="ambra">Da pagare</Etichetta>}
                {prenotazione.stato === 'annullata' && <Etichetta tono="rosso">Annullata</Etichetta>}
                {prenotazione.stato === 'rimborsata' && <Etichetta tono="rosso">Rimborsata</Etichetta>}
                {prenotazione.stato === 'utilizzata' && <Etichetta tono="neutro">Utilizzata</Etichetta>}
              </p>
              <p className="mt-1.5 text-[0.86rem] text-tenue">
                {dataEstesa(prenotazione.data)} alle {prenotazione.ora} ·{' '}
                {elencoPosti(prenotazione.posti)}
              </p>
            </div>

            <div className="flex items-center gap-4">
              <span className="tabellare text-[0.95rem] font-semibold">
                {prezzoPieno(prenotazione.totale)}
              </span>
              {!storico && <Icona nome="qr" className="size-6 text-accento" />}
              <Icona nome="chevronDestra" className="size-4 text-tenue" />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  )
}

/* ── CLUB ───────────────────────────────────────────────────────────────── */

function SezioneClub({ dati, onAggiorna }: { dati: DatiArea; onAggiorna: () => void }) {
  const { mostra } = useAvvisi()
  const [inCorso, setInCorso] = useState('')

  async function riscatta(premioId: string) {
    setInCorso(premioId)
    try {
      const risposta = await fetch('/api/clienti/io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premioId }),
      })
      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Riscatto non riuscito.', 'errore')
        return
      }

      mostra(`Premio riscattato: usa il codice ${esito.coupon.codice} al prossimo acquisto.`, 'ok')
      onAggiorna()
    } catch {
      mostra('Connessione non riuscita.', 'errore')
    } finally {
      setInCorso('')
    }
  }

  return (
    <div className="space-y-6">
      <section>
        <h3 className="font-titolo text-[1.15rem] font-semibold">Premi disponibili</h3>
        <p className="mt-1.5 text-[0.86rem] text-tenue">
          Riscattando un premio ricevi un codice da usare al prossimo acquisto. Vale 90 giorni.
        </p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {dati.premi.map((premio) => {
            const raggiungibile = dati.cliente.punti >= premio.puntiRichiesti

            return (
              <li
                key={premio.id}
                className={classi(
                  'rounded-morbido border p-4',
                  raggiungibile ? 'border-accento/40 bg-superficie' : 'border-bordo bg-superficie opacity-70',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{premio.nome}</p>
                    <p className="mt-1 text-[0.82rem] text-tenue">{premio.descrizione}</p>
                  </div>
                  <span className="tabellare shrink-0 text-[0.88rem] font-semibold text-accento">
                    {premio.puntiRichiesti}
                  </span>
                </div>

                <Bottone
                  misura="piccola"
                  variante={raggiungibile ? 'pieno' : 'tenue'}
                  className="mt-4 w-full"
                  disabled={!raggiungibile || inCorso === premio.id}
                  onClick={() => riscatta(premio.id)}
                >
                  {inCorso === premio.id
                    ? 'Un momento…'
                    : raggiungibile
                      ? 'Riscatta'
                      : `Ti mancano ${premio.puntiRichiesti - dati.cliente.punti} punti`}
                </Bottone>
              </li>
            )
          })}
        </ul>
      </section>

      <section>
        <h3 className="font-titolo text-[1.15rem] font-semibold">Movimenti</h3>

        {dati.movimenti.length === 0 ? (
          <p className="mt-3 text-[0.88rem] text-tenue">Nessun movimento registrato.</p>
        ) : (
          <ul className="mt-4 divide-y divide-bordo">
            {dati.movimenti.map((movimento) => (
              <li key={movimento.id} className="flex items-center justify-between gap-4 py-3">
                <div className="min-w-0">
                  <p className="text-[0.88rem]">{movimento.motivo}</p>
                  <p className="text-[0.78rem] text-tenue">
                    {dataOra(movimento.creatoIl)}
                    {movimento.riferimento && ` · ${movimento.riferimento}`}
                  </p>
                </div>
                <span
                  className={classi(
                    'tabellare shrink-0 text-[0.92rem] font-semibold',
                    movimento.punti >= 0 ? 'text-ok' : 'text-tenue',
                  )}
                >
                  {movimento.punti >= 0 ? '+' : ''}
                  {movimento.punti}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h3 className="font-titolo text-[1.15rem] font-semibold">I livelli</h3>
        <ul className="mt-4 space-y-2.5">
          {[...dati.livelli]
            .sort((a, b) => a.puntiMinimi - b.puntiMinimi)
            .map((livello) => (
              <li
                key={livello.id}
                className={classi(
                  'rounded-morbido border p-4',
                  livello.id === dati.cliente.livelloId
                    ? 'border-accento bg-accento/6'
                    : 'border-bordo bg-superficie',
                )}
              >
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-titolo font-semibold" style={{ color: livello.colore }}>
                    {livello.nome}
                  </span>
                  <span className="tabellare text-[0.8rem] text-tenue">
                    da {livello.puntiMinimi.toLocaleString('it-IT')} punti
                  </span>
                  {livello.id === dati.cliente.livelloId && (
                    <Etichetta tono="accento" className="px-2 py-0.5 text-[0.58rem]">
                      Il tuo livello
                    </Etichetta>
                  )}
                </p>
                <p className="mt-2 text-[0.84rem] text-tenue">{livello.vantaggi.join(' · ')}</p>
              </li>
            ))}
        </ul>
      </section>
    </div>
  )
}

/* ── Coupon ─────────────────────────────────────────────────────────────── */

function SezioneCoupon({ coupon }: { coupon: Coupon[] }) {
  if (coupon.length === 0) {
    return (
      <Nota icona={<Icona nome="percento" className="size-4" />}>
        Non hai coupon attivi. Ne ricevi riscattando i premi del CLUB o dalle promozioni riservate.
      </Nota>
    )
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {coupon.map((voce) => (
        <li
          key={voce.id}
          className="rounded-morbido border border-dashed border-accento/50 bg-accento/5 p-5"
        >
          <p className="text-[0.82rem] text-tenue">{voce.descrizione}</p>
          <p className="tabellare mt-2 font-titolo text-[1.35rem] font-bold tracking-[0.16em]">
            {voce.codice}
          </p>
          <p className="mt-2 text-[0.84rem]">
            <strong>
              {voce.tipo === 'percentuale' ? `−${voce.valore}%` : `−${prezzoPieno(voce.valore)}`}
            </strong>
            <span className="ml-2 text-tenue">entro il {dataEstesa(voce.scadenza)}</span>
          </p>
        </li>
      ))}
    </ul>
  )
}

/* ── Abbonamento ────────────────────────────────────────────────────────── */

function SezioneAbbonamento({ dati, onAggiorna }: { dati: DatiArea; onAggiorna: () => void }) {
  const { mostra } = useAvvisi()
  const [inCorso, setInCorso] = useState(false)

  const attivo = dati.abbonamenti.find((voce) => voce.sottoscrizione.stato === 'attiva')

  async function disdici() {
    setInCorso(true)
    try {
      const risposta = await fetch('/api/abbonamenti', { method: 'DELETE' })
      const esito = await risposta.json()
      if (!risposta.ok) {
        mostra(esito.errore ?? 'Disdetta non riuscita.', 'errore')
        return
      }
      mostra(esito.messaggio ?? 'Rinnovo automatico disattivato.', 'ok')
      onAggiorna()
    } finally {
      setInCorso(false)
    }
  }

  if (!attivo) {
    return (
      <Nota icona={<Icona nome="tessera" className="size-4" />}>
        Non hai un abbonamento attivo.{' '}
        <Link href="/abbonamenti" className="text-accento underline">
          Guarda i piani disponibili
        </Link>
        .
      </Nota>
    )
  }

  const { sottoscrizione, piano } = attivo

  return (
    <div className="rounded-ampio border border-bordo bg-superficie p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Etichetta tono="verde">Attivo</Etichetta>
          <h3 className="mt-3 font-titolo text-[1.5rem] font-semibold">
            {piano?.nome ?? 'Abbonamento'}
          </h3>
          <p className="mt-1.5 text-[0.88rem] text-tenue">
            Valido fino al {dataEstesa(sottoscrizione.al)}
          </p>
        </div>

        {piano && (
          <p className="tabellare text-right">
            <span className="block font-titolo text-[1.6rem] font-bold">
              {prezzoPieno(piano.prezzo)}
            </span>
            <span className="text-[0.78rem] text-tenue">
              /{piano.periodo === 'mensile' ? 'mese' : 'anno'}
            </span>
          </p>
        )}
      </div>

      {piano && piano.ingressiInclusi > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-[0.84rem] text-tenue">
            <span>Ingressi usati</span>
            <span className="tabellare">
              {sottoscrizione.ingressiUsati} di {piano.ingressiInclusi}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-superficie-alt">
            <div
              className="h-full rounded-full bg-ambra transition-all duration-700"
              style={{
                width: `${Math.min(100, (sottoscrizione.ingressiUsati / piano.ingressiInclusi) * 100)}%`,
              }}
            />
          </div>
        </div>
      )}

      {piano && (
        <ul className="mt-6 space-y-2">
          {piano.vantaggi.map((vantaggio) => (
            <li key={vantaggio} className="flex items-start gap-2.5 text-[0.88rem]">
              <Icona nome="spunta" className="mt-0.5 size-4 shrink-0 text-ok" />
              {vantaggio}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-7">
        {sottoscrizione.rinnovoAutomatico ? (
          <Bottone variante="tenue" misura="piccola" onClick={disdici} disabled={inCorso}>
            {inCorso ? 'Un momento…' : 'Disdici il rinnovo automatico'}
          </Bottone>
        ) : (
          <Nota tono="ambra" icona={<Icona nome="info" className="size-4" />}>
            Il rinnovo automatico è disattivato. L’abbonamento resta valido fino al{' '}
            {dataEstesa(sottoscrizione.al)}, poi si chiude senza ulteriori addebiti.
          </Nota>
        )}
      </div>
    </div>
  )
}

/* ── Preferiti ──────────────────────────────────────────────────────────── */

function SezionePreferiti({ film }: { film: Film[] }) {
  if (film.length === 0) {
    return (
      <Nota icona={<Icona nome="cuore" className="size-4" />}>
        Nessun film fra i preferiti. Aggiungili dalla scheda di un film per ricevere l’avviso
        quando apre la prevendita.
      </Nota>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
      {film.map((voce) => (
        <Link key={voce.id} href={`/film/${voce.slug}`} className="group">
          <div className="locandina overflow-hidden rounded-morbido">
            <Locandina
              titolo={voce.titolo}
              chiave={voce.id}
              palette={voce.palette}
              immagine={voce.locandina}
            />
          </div>
          <p className="mt-2.5 text-[0.88rem] font-medium transition-colors group-hover:text-accento">
            {voce.titolo}
          </p>
        </Link>
      ))}
    </div>
  )
}

/* ── Profilo ────────────────────────────────────────────────────────────── */

function SezioneProfilo({ dati, onAggiorna }: { dati: DatiArea; onAggiorna: () => void }) {
  const { mostra } = useAvvisi()
  const [modulo, setModulo] = useState({
    nome: dati.cliente.nome,
    cognome: dati.cliente.cognome,
    telefono: dati.cliente.telefono,
  })
  const [preferenze, setPreferenze] = useState(dati.cliente.preferenze)
  const [invio, setInvio] = useState(false)

  async function salva() {
    setInvio(true)
    try {
      const risposta = await fetch('/api/clienti/io', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...modulo, preferenze }),
      })
      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Salvataggio non riuscito.', 'errore')
        return
      }

      mostra('Profilo aggiornato.', 'ok')
      onAggiorna()
    } finally {
      setInvio(false)
    }
  }

  return (
    <div className="max-w-xl space-y-7">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etichetta="Nome"
          value={modulo.nome}
          onChange={(evento) => setModulo({ ...modulo, nome: evento.target.value })}
        />
        <Campo
          etichetta="Cognome"
          value={modulo.cognome}
          onChange={(evento) => setModulo({ ...modulo, cognome: evento.target.value })}
        />
        <Campo
          etichetta="Telefono"
          type="tel"
          value={modulo.telefono}
          onChange={(evento) => setModulo({ ...modulo, telefono: evento.target.value })}
          className="sm:col-span-2"
        />
      </div>

      <div className="space-y-2.5">
        <h3 className="text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
          Come vuoi essere avvisato
        </h3>

        <Interruttore
          etichetta="Email"
          descrizione="Biglietti, conferme e promemoria. Non è disattivabile: è il canale con cui arrivano i biglietti."
          attivo
          disabilitato
          onCambia={() => undefined}
        />
        <Interruttore
          etichetta="Notifiche push"
          descrizione="Promemoria mezz’ora prima dello spettacolo, direttamente sul telefono."
          attivo={preferenze.push}
          onCambia={(valore) => setPreferenze({ ...preferenze, push: valore })}
        />
        <Interruttore
          etichetta="SMS"
          descrizione="Solo per i promemoria, mai per le promozioni."
          attivo={preferenze.sms}
          onCambia={(valore) => setPreferenze({ ...preferenze, sms: valore })}
        />
      </div>

      <Bottone onClick={salva} disabled={invio}>
        {invio ? 'Salvataggio…' : 'Salva le modifiche'}
      </Bottone>

      <Nota icona={<Icona nome="lucchetto" className="size-4" />}>
        Per cancellare l’account e i dati collegati scrivi a{' '}
        <a href={`mailto:${dati.impostazioni.marchio.email}`} className="text-accento underline">
          {dati.impostazioni.marchio.email}
        </a>
        . La cancellazione comporta la perdita dei punti e degli abbonamenti attivi, e non è
        reversibile.
      </Nota>
    </div>
  )
}
