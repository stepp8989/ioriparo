'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { RISTORANTE } from '@/dati/ristorante'
import type { OrarioGiorno } from '@/lib/tipi'
import { classi, dataBreve, emailValida, fraGiorni, oggiIso, telefonoValido } from '@/lib/utili'

/** Campi del modulo, così come viaggiano verso il server. */
type Campi = {
  nome: string
  cognome: string
  telefono: string
  email: string
  persone: number
  data: string
  ora: string
  note: string
}

const VUOTO: Campi = {
  nome: '',
  cognome: '',
  telefono: '',
  email: '',
  persone: 2,
  data: '',
  ora: '',
  note: '',
}

/** Ordine dei giorni come sono salvati negli orari. */
const GIORNI = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']

/**
 * Trasforma una fascia oraria («19:00 – 23:00») nell'elenco degli orari
 * prenotabili, ogni trenta minuti. L'ultimo turno si ferma un'ora prima della
 * chiusura: nessuno si siede a tavola mentre la cucina chiude.
 */
function turni(fascia: string | null): string[] {
  if (!fascia) return []

  const parti = fascia.split(/[–-]/).map((valore) => valore.trim())
  if (parti.length !== 2) return []

  const inMinuti = (orario: string) => {
    const [ore, minuti] = orario.split(':').map(Number)
    return Number.isFinite(ore) && Number.isFinite(minuti) ? ore * 60 + minuti : null
  }

  const inizio = inMinuti(parti[0])
  const fine = inMinuti(parti[1])
  if (inizio === null || fine === null) return []

  const elenco: string[] = []
  for (let minuto = inizio; minuto <= fine - 60; minuto += 30) {
    elenco.push(
      `${String(Math.floor(minuto / 60)).padStart(2, '0')}:${String(minuto % 60).padStart(2, '0')}`,
    )
  }
  return elenco
}

/**
 * Modulo di prenotazione.
 *
 * Gli orari proposti dipendono dal giorno scelto e vengono ricavati dagli
 * stessi orari di apertura che lo staff aggiorna dal pannello: se il lunedì è
 * chiuso, il lunedì non è selezionabile.
 */
export function ModuloPrenotazione({ orari }: { orari: OrarioGiorno[] }) {
  const [campi, setCampi] = useState<Campi>(VUOTO)
  const [errori, setErrori] = useState<Partial<Record<keyof Campi, string>>>({})
  const [invio, setInvio] = useState(false)
  const [esito, setEsito] = useState<{ codice: string } | null>(null)
  const [erroreGenerale, setErroreGenerale] = useState('')
  const menoMovimento = useReducedMotion()

  /** Orari disponibili per la data scelta. */
  const orariDisponibili = useMemo(() => {
    if (!campi.data) return { pranzo: [] as string[], cena: [] as string[], chiuso: false }

    const giorno = GIORNI[new Date(`${campi.data}T12:00:00`).getDay()]
    const orario = orari.find((voce) => voce.giorno === giorno)

    if (!orario || orario.chiuso) return { pranzo: [], cena: [], chiuso: true }
    return { pranzo: turni(orario.pranzo), cena: turni(orario.cena), chiuso: false }
  }, [campi.data, orari])

  function aggiorna<C extends keyof Campi>(campo: C, valore: Campi[C]) {
    setCampi((precedenti) => ({ ...precedenti, [campo]: valore }))
    setErrori((precedenti) => ({ ...precedenti, [campo]: undefined }))
    setErroreGenerale('')
  }

  /** Controlli in pagina: gli stessi che il server ripete prima di salvare. */
  function verifica(): boolean {
    const nuovi: Partial<Record<keyof Campi, string>> = {}

    if (campi.nome.trim().length < 2) nuovi.nome = 'Inserisci il nome.'
    if (campi.cognome.trim().length < 2) nuovi.cognome = 'Inserisci il cognome.'
    if (!telefonoValido(campi.telefono)) nuovi.telefono = 'Inserisci un numero di telefono valido.'
    if (!emailValida(campi.email)) nuovi.email = 'Inserisci un indirizzo email valido.'
    if (!campi.data) nuovi.data = 'Scegli la data.'
    else if (campi.data < oggiIso()) nuovi.data = 'La data è già passata.'
    else if (orariDisponibili.chiuso) nuovi.data = 'Quel giorno siamo chiusi.'
    if (!campi.ora) nuovi.ora = 'Scegli l’orario.'
    if (campi.persone < 1 || campi.persone > RISTORANTE.massimoPersoneOnline) {
      nuovi.persone = `Da 1 a ${RISTORANTE.massimoPersoneOnline} persone.`
    }

    setErrori(nuovi)
    return Object.keys(nuovi).length === 0
  }

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    if (!verifica()) return

    setInvio(true)
    setErroreGenerale('')

    try {
      const risposta = await fetch('/api/prenotazioni', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campi),
      })
      const dati = await risposta.json()

      if (!risposta.ok) throw new Error(dati.errore ?? 'Non è stato possibile registrare la richiesta.')

      setEsito({ codice: dati.codice })
    } catch (errore) {
      setErroreGenerale(errore instanceof Error ? errore.message : 'Riprova fra qualche istante.')
    } finally {
      setInvio(false)
    }
  }

  // ── Conferma ──────────────────────────────────────────────────────────────
  if (esito) {
    return (
      <motion.div
        initial={{ opacity: 0, y: menoMovimento ? 0 : 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: menoMovimento ? 0.01 : 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="border border-accento-tenue bg-superficie p-8 text-center sm:p-12"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto grid size-16 place-items-center rounded-full bg-accento text-white scuro:text-notte">
          <Icona nome="spunta" className="size-8" />
        </span>

        <h2 className="mt-7 font-titolo text-3xl sm:text-4xl">Prenotazione confermata</h2>

        <p className="mx-auto mt-4 max-w-md leading-relaxed text-tenue">
          Grazie {campi.nome}. Vi aspettiamo{' '}
          <strong className="text-testo">{dataBreve(campi.data)}</strong> alle{' '}
          <strong className="text-testo">{campi.ora}</strong> per {campi.persone}{' '}
          {campi.persone === 1 ? 'persona' : 'persone'}. Abbiamo inviato il riepilogo a{' '}
          {campi.email}.
        </p>

        <p className="mt-8 text-xs uppercase tracking-[0.24em] text-tenue">Codice prenotazione</p>
        <p className="mt-2 font-titolo text-4xl tracking-[0.2em] text-accento">{esito.codice}</p>

        <p className="mx-auto mt-8 max-w-md text-sm text-tenue">
          Per modificare o annullare, chiamateci al{' '}
          <a href={`tel:${RISTORANTE.telefonoLink}`} className="text-accento underline underline-offset-4">
            {RISTORANTE.telefono}
          </a>{' '}
          indicando il codice.
        </p>

        <button
          type="button"
          onClick={() => {
            setEsito(null)
            setCampi(VUOTO)
          }}
          className="mt-9 text-sm text-tenue underline underline-offset-4 transition-colors hover:text-accento"
        >
          Prenota un altro tavolo
        </button>
      </motion.div>
    )
  }

  // ── Modulo ────────────────────────────────────────────────────────────────
  return (
    <form
      onSubmit={invia}
      noValidate
      className="border border-bordo bg-superficie p-7 sm:p-10"
      aria-labelledby="titolo-modulo"
    >
      <h2 id="titolo-modulo" className="font-titolo text-3xl">
        I vostri dati
      </h2>
      <p className="mt-2 text-sm text-tenue">
        I campi contrassegnati con <span aria-hidden>*</span> sono obbligatori.
      </p>

      <div className="mt-9 grid gap-6 sm:grid-cols-2">
        <Campo
          id="nome"
          etichetta="Nome"
          obbligatorio
          errore={errori.nome}
          autoComplete="given-name"
          valore={campi.nome}
          onChange={(valore) => aggiorna('nome', valore)}
        />
        <Campo
          id="cognome"
          etichetta="Cognome"
          obbligatorio
          errore={errori.cognome}
          autoComplete="family-name"
          valore={campi.cognome}
          onChange={(valore) => aggiorna('cognome', valore)}
        />
        <Campo
          id="telefono"
          etichetta="Telefono"
          tipo="tel"
          obbligatorio
          errore={errori.telefono}
          autoComplete="tel"
          valore={campi.telefono}
          onChange={(valore) => aggiorna('telefono', valore)}
        />
        <Campo
          id="email"
          etichetta="Email"
          tipo="email"
          obbligatorio
          errore={errori.email}
          autoComplete="email"
          valore={campi.email}
          onChange={(valore) => aggiorna('email', valore)}
        />
      </div>

      {/* Numero di persone */}
      <fieldset className="mt-8">
        <legend className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue">
          Numero di persone <span aria-hidden>*</span>
        </legend>

        <div className="flex flex-wrap gap-2">
          {Array.from({ length: RISTORANTE.massimoPersoneOnline }, (_, indice) => indice + 1).map(
            (numero) => (
              <button
                key={numero}
                type="button"
                onClick={() => aggiorna('persone', numero)}
                aria-pressed={campi.persone === numero}
                className={classi(
                  'size-11 border text-sm tabular-nums transition-all duration-300',
                  campi.persone === numero
                    ? 'border-accento bg-accento text-white scuro:text-notte'
                    : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                )}
              >
                {numero}
              </button>
            ),
          )}
        </div>

        {errori.persone && <Errore testo={errori.persone} />}

        <p className="mt-3 text-xs text-tenue">
          Per gruppi oltre {RISTORANTE.massimoPersoneOnline} persone chiamateci: organizziamo la
          sala su misura.
        </p>
      </fieldset>

      {/* Data */}
      <div className="mt-8">
        <label
          htmlFor="data"
          className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
        >
          Data <span aria-hidden>*</span>
        </label>

        <input
          id="data"
          type="date"
          value={campi.data}
          min={oggiIso()}
          max={fraGiorni(120)}
          onChange={(evento) => {
            aggiorna('data', evento.target.value)
            aggiorna('ora', '')
          }}
          aria-invalid={Boolean(errori.data)}
          aria-describedby={errori.data ? 'errore-data' : undefined}
          className="w-full border-b border-bordo-forte bg-transparent px-1 py-3 transition-colors focus:border-accento focus:outline-none sm:w-auto"
        />

        {errori.data && <Errore testo={errori.data} id="errore-data" />}
      </div>

      {/* Orari */}
      <AnimatePresence initial={false}>
        {campi.data && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: menoMovimento ? 0.01 : 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <fieldset className="mt-8">
              <legend className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue">
                Orario <span aria-hidden>*</span>
              </legend>

              {orariDisponibili.chiuso ? (
                <p className="text-sm text-tenue">
                  Quel giorno il ristorante è chiuso. Scegliete un’altra data.
                </p>
              ) : (
                <div className="space-y-5">
                  {(
                    [
                      ['Pranzo', orariDisponibili.pranzo],
                      ['Cena', orariDisponibili.cena],
                    ] as const
                  )
                    .filter(([, elenco]) => elenco.length > 0)
                    .map(([servizio, elenco]) => (
                      <div key={servizio}>
                        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-tenue">
                          {servizio}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {elenco.map((ora) => (
                            <button
                              key={ora}
                              type="button"
                              onClick={() => aggiorna('ora', ora)}
                              aria-pressed={campi.ora === ora}
                              className={classi(
                                'border px-4 py-2.5 text-sm tabular-nums transition-all duration-300',
                                campi.ora === ora
                                  ? 'border-accento bg-accento text-white scuro:text-notte'
                                  : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                              )}
                            >
                              {ora}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {errori.ora && <Errore testo={errori.ora} />}
            </fieldset>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Richieste particolari */}
      <div className="mt-8">
        <label
          htmlFor="note"
          className="mb-3 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
        >
          Richieste particolari
        </label>

        <textarea
          id="note"
          rows={4}
          value={campi.note}
          maxLength={600}
          onChange={(evento) => aggiorna('note', evento.target.value)}
          placeholder="Allergie, intolleranze, ricorrenze, seggiolone, preferenze di tavolo…"
          className="w-full resize-y border border-bordo bg-superficie-alt p-4 text-sm transition-colors focus:border-accento focus:outline-none"
        />

        <p className="mt-1.5 text-right text-xs text-tenue">{campi.note.length}/600</p>
      </div>

      {erroreGenerale && (
        <p role="alert" className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700 scuro:bg-red-950/40 scuro:text-red-300">
          {erroreGenerale}
        </p>
      )}

      <button
        type="submit"
        disabled={invio}
        className="mt-9 inline-flex w-full items-center justify-center gap-3 bg-accento px-8 py-4 text-[0.78rem] font-medium uppercase tracking-[0.16em] text-white transition-all duration-500 hover:bg-accento-forte disabled:opacity-60 scuro:text-notte sm:w-auto"
      >
        {invio ? 'Invio in corso…' : 'Conferma la prenotazione'}
        {!invio && <Icona nome="freccia" className="size-4" />}
      </button>

      <p className="mt-5 text-xs leading-relaxed text-tenue">
        Inviando la richiesta accettate il trattamento dei dati per la sola gestione della
        prenotazione, come descritto nella{' '}
        <a href="/privacy" className="text-accento underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}

/** Campo di testo con etichetta, messaggio d'errore e collegamenti ARIA corretti. */
function Campo({
  id,
  etichetta,
  valore,
  onChange,
  tipo = 'text',
  obbligatorio = false,
  errore,
  autoComplete,
}: {
  id: string
  etichetta: string
  valore: string
  onChange: (valore: string) => void
  tipo?: string
  obbligatorio?: boolean
  errore?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
      >
        {etichetta} {obbligatorio && <span aria-hidden>*</span>}
      </label>

      <input
        id={id}
        type={tipo}
        value={valore}
        required={obbligatorio}
        autoComplete={autoComplete}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(errore)}
        aria-describedby={errore ? `errore-${id}` : undefined}
        className={classi(
          'w-full border-b bg-transparent px-1 py-3 transition-colors focus:outline-none',
          errore ? 'border-red-500' : 'border-bordo-forte focus:border-accento',
        )}
      />

      {errore && <Errore testo={errore} id={`errore-${id}`} />}
    </div>
  )
}

function Errore({ testo, id }: { testo: string; id?: string }) {
  return (
    <p id={id} className="mt-2 text-sm text-red-600 scuro:text-red-400">
      {testo}
    </p>
  )
}
