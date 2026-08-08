'use client'

import { useId, useState } from 'react'
import { AGENZIA } from '@/dati/agenzia'
import { TIPI_SITO } from '@/dati/contenuti'
import { Pulsante } from '@/componenti/ui/Pulsante'
import { Icona } from '@/componenti/ui/Icona'
import { cn, emailValida } from '@/lib/utili'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Richiesta di preventivo
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Sei campi, di cui tre obbligatori: nome, email e due righe su cosa serve.
 * Ogni campo in più è gente che rinuncia a metà strada, e il telefono si può
 * sempre chiedere rispondendo.
 *
 * I controlli stanno da entrambe le parti. Qui davanti servono a dare una
 * risposta immediata e comprensibile; quelli veri sono nella rotta
 * `/api/contatti`, perché un controllo scritto nel browser è un suggerimento,
 * non una difesa.
 *
 * Il campo «sito» in fondo è un'esca: è nascosto e nessuno lo vede, quindi se
 * arriva compilato la richiesta è di un automatismo. Viene accettata con un
 * sorriso e buttata via, così chi la manda non impara nulla.
 */

type Stato = 'compilazione' | 'invio' | 'inviato' | 'errore'

export function ModuloContatto({ compatto = false }: { compatto?: boolean }) {
  const idBase = useId()
  const [stato, setStato] = useState<Stato>('compilazione')
  const [errori, setErrori] = useState<Record<string, string>>({})
  const [messaggioServer, setMessaggioServer] = useState('')

  async function invia(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    const modulo = new FormData(evento.currentTarget)
    const dati = {
      nome: String(modulo.get('nome') ?? '').trim(),
      azienda: String(modulo.get('azienda') ?? '').trim(),
      email: String(modulo.get('email') ?? '').trim(),
      telefono: String(modulo.get('telefono') ?? '').trim(),
      tipoSito: String(modulo.get('tipoSito') ?? ''),
      messaggio: String(modulo.get('messaggio') ?? '').trim(),
      sito: String(modulo.get('sito') ?? ''),
    }

    const trovati: Record<string, string> = {}
    if (dati.nome.length < 2) trovati.nome = 'Scrivi il tuo nome.'
    if (!emailValida(dati.email)) trovati.email = 'Controlla l’indirizzo email.'
    if (dati.messaggio.length < 10) {
      trovati.messaggio = 'Bastano due righe su cosa ti serve.'
    }

    setErrori(trovati)
    if (Object.keys(trovati).length > 0) {
      // Il fuoco va sul primo campo sbagliato: chi usa la tastiera non deve
      // andare a cercarselo.
      document.getElementById(`${idBase}-${Object.keys(trovati)[0]}`)?.focus()
      return
    }

    setStato('invio')

    try {
      const risposta = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dati),
      })

      const corpo = (await risposta.json().catch(() => ({}))) as {
        messaggio?: string
        errore?: string
      }

      if (!risposta.ok) {
        setMessaggioServer(corpo.errore ?? 'Qualcosa non ha funzionato. Riprova fra poco.')
        setStato('errore')
        return
      }

      setMessaggioServer(corpo.messaggio ?? 'Richiesta inviata.')
      setStato('inviato')
    } catch {
      setMessaggioServer(
        'Non sono riuscito a inviare la richiesta. Controlla la connessione, oppure scrivimi direttamente.',
      )
      setStato('errore')
    }
  }

  if (stato === 'inviato') {
    return (
      <div className="anima-entra py-10 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-blu/40 bg-blu/10 text-blu-chiaro">
          <Icona nome="spunta" misura={30} spessore={2} />
        </span>
        <h3 className="mt-6 font-titolo text-2xl font-semibold">Richiesta ricevuta.</h3>
        <p className="mx-auto mt-3 max-w-sm text-[0.95rem] leading-relaxed text-tenue">
          {messaggioServer} Ti rispondo entro {AGENZIA.tempi.risposta}. Se hai fretta, chiamami
          pure.
        </p>
        <a
          href={`tel:${AGENZIA.telefonoLink}`}
          className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-bordo-forte px-5 py-3 text-[0.9rem] text-tenue transition-colors hover:border-blu/50 hover:text-testo"
        >
          <Icona nome="telefono" misura={16} />
          {AGENZIA.telefono}
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={invia} noValidate className={cn('grid gap-5', compatto ? 'mt-0' : 'mt-8')}>
      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id={`${idBase}-nome`}
          nome="nome"
          etichetta="Nome"
          obbligatorio
          autoComplete="name"
          errore={errori.nome}
        />
        <Campo
          id={`${idBase}-azienda`}
          nome="azienda"
          etichetta="Azienda"
          autoComplete="organization"
          suggerimento="Facoltativo"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          id={`${idBase}-email`}
          nome="email"
          tipo="email"
          etichetta="Email"
          obbligatorio
          autoComplete="email"
          errore={errori.email}
        />
        <Campo
          id={`${idBase}-telefono`}
          nome="telefono"
          tipo="tel"
          etichetta="Telefono"
          autoComplete="tel"
          suggerimento="Facoltativo"
        />
      </div>

      <div>
        <label
          htmlFor={`${idBase}-tipoSito`}
          className="block text-[0.82rem] font-medium uppercase tracking-[0.14em] text-fioco"
        >
          Tipo di sito
        </label>
        <select
          id={`${idBase}-tipoSito`}
          name="tipoSito"
          defaultValue={TIPI_SITO[0]}
          className="mt-2.5 h-12 w-full rounded-tenue border border-bordo-forte bg-superficie/60 px-4 text-[0.95rem] text-testo transition-colors focus:border-blu/60 focus:outline-none focus:ring-2 focus:ring-blu/30"
        >
          {TIPI_SITO.map((tipo) => (
            <option key={tipo} value={tipo} className="bg-superficie text-testo">
              {tipo}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor={`${idBase}-messaggio`}
          className="flex items-baseline justify-between text-[0.82rem] font-medium uppercase tracking-[0.14em] text-fioco"
        >
          <span>
            Messaggio <span className="text-blu-chiaro">*</span>
          </span>
        </label>
        <textarea
          id={`${idBase}-messaggio`}
          name="messaggio"
          rows={compatto ? 3 : 4}
          placeholder="Che attività hai e cosa vorresti ottenere dal sito?"
          aria-invalid={errori.messaggio ? true : undefined}
          aria-describedby={errori.messaggio ? `${idBase}-messaggio-errore` : undefined}
          className={cn(
            'mt-2.5 w-full resize-y rounded-tenue border bg-superficie/60 px-4 py-3 text-[0.95rem] text-testo transition-colors placeholder:text-fioco/70 focus:outline-none focus:ring-2 focus:ring-blu/30',
            errori.messaggio ? 'border-red-400/70' : 'border-bordo-forte focus:border-blu/60',
          )}
        />
        {errori.messaggio ? (
          <p id={`${idBase}-messaggio-errore`} role="alert" className="mt-2 text-[0.82rem] text-red-300">
            {errori.messaggio}
          </p>
        ) : null}
      </div>

      {/* Esca per gli automatismi: fuori dal flusso e fuori dalla tastiera. */}
      <div aria-hidden="true" className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden">
        <label htmlFor={`${idBase}-sito`}>Non compilare questo campo</label>
        <input id={`${idBase}-sito`} name="sito" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {stato === 'errore' ? (
        <p role="alert" className="rounded-tenue border border-red-400/40 bg-red-500/10 px-4 py-3 text-[0.9rem] text-red-200">
          {messaggioServer}{' '}
          <a href={`mailto:${AGENZIA.email}`} className="underline">
            {AGENZIA.email}
          </a>
        </p>
      ) : null}

      <div className="mt-2 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Pulsante
          type="submit"
          disabled={stato === 'invio'}
          coda={stato === 'invio' ? undefined : <Icona nome="freccia" misura={17} />}
        >
          {stato === 'invio' ? 'Invio in corso…' : 'Richiedi un preventivo'}
        </Pulsante>

        <p className="text-[0.78rem] leading-relaxed text-fioco">
          Ti rispondo entro {AGENZIA.tempi.risposta}. I dati servono solo a risponderti — vedi la{' '}
          <a href="/privacy" className="underline underline-offset-2 transition-colors hover:text-tenue">
            privacy policy
          </a>
          .
        </p>
      </div>
    </form>
  )
}

/* ── Un campo di testo ─────────────────────────────────────────────────────── */

function Campo({
  id,
  nome,
  etichetta,
  tipo = 'text',
  obbligatorio = false,
  autoComplete,
  suggerimento,
  errore,
}: {
  id: string
  nome: string
  etichetta: string
  tipo?: string
  obbligatorio?: boolean
  autoComplete?: string
  suggerimento?: string
  errore?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="flex items-baseline justify-between gap-3 text-[0.82rem] font-medium uppercase tracking-[0.14em] text-fioco"
      >
        <span>
          {etichetta}
          {obbligatorio ? <span className="text-blu-chiaro"> *</span> : null}
        </span>
        {suggerimento ? <span className="text-[0.7rem] normal-case tracking-normal">{suggerimento}</span> : null}
      </label>
      <input
        id={id}
        name={nome}
        type={tipo}
        autoComplete={autoComplete}
        aria-invalid={errore ? true : undefined}
        aria-describedby={errore ? `${id}-errore` : undefined}
        className={cn(
          'mt-2.5 h-12 w-full rounded-tenue border bg-superficie/60 px-4 text-[0.95rem] text-testo transition-colors focus:outline-none focus:ring-2 focus:ring-blu/30',
          errore ? 'border-red-400/70' : 'border-bordo-forte focus:border-blu/60',
        )}
      />
      {errore ? (
        <p id={`${id}-errore`} role="alert" className="mt-2 text-[0.82rem] text-red-300">
          {errore}
        </p>
      ) : null}
    </div>
  )
}
