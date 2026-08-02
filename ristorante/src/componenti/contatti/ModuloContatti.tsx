'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { classi, emailValida } from '@/lib/utili'

type Campi = { nome: string; email: string; telefono: string; testo: string; sito: string }

const VUOTO: Campi = { nome: '', email: '', telefono: '', testo: '', sito: '' }

/**
 * Modulo contatti.
 *
 * Il campo `sito` è un'esca invisibile: gli invii automatici lo compilano,
 * le persone no. Serve a filtrare la posta indesiderata senza mettere davanti
 * all'utente un test da risolvere.
 */
export function ModuloContatti() {
  const [campi, setCampi] = useState<Campi>(VUOTO)
  const [errori, setErrori] = useState<Partial<Record<keyof Campi, string>>>({})
  const [invio, setInvio] = useState(false)
  const [fatto, setFatto] = useState(false)
  const [erroreGenerale, setErroreGenerale] = useState('')

  function aggiorna<C extends keyof Campi>(campo: C, valore: string) {
    setCampi((precedenti) => ({ ...precedenti, [campo]: valore }))
    setErrori((precedenti) => ({ ...precedenti, [campo]: undefined }))
    setErroreGenerale('')
  }

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()

    const nuovi: Partial<Record<keyof Campi, string>> = {}
    if (campi.nome.trim().length < 2) nuovi.nome = 'Inserisci il tuo nome.'
    if (!emailValida(campi.email)) nuovi.email = 'Inserisci un indirizzo email valido.'
    if (campi.testo.trim().length < 10) nuovi.testo = 'Scrivi almeno dieci caratteri.'

    setErrori(nuovi)
    if (Object.keys(nuovi).length > 0) return

    setInvio(true)
    try {
      const risposta = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campi),
      })
      const dati = await risposta.json()
      if (!risposta.ok) throw new Error(dati.errore ?? 'Invio non riuscito.')

      setFatto(true)
      setCampi(VUOTO)
    } catch (errore) {
      setErroreGenerale(errore instanceof Error ? errore.message : 'Riprova fra qualche istante.')
    } finally {
      setInvio(false)
    }
  }

  if (fatto) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="border border-accento-tenue bg-superficie p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-accento text-white scuro:text-notte">
          <Icona nome="spunta" className="size-7" />
        </span>

        <h3 className="mt-6 font-titolo text-2xl">Messaggio inviato</h3>
        <p className="mt-2 text-sm text-tenue">
          Grazie per averci scritto. Vi rispondiamo entro ventiquattro ore.
        </p>

        <button
          type="button"
          onClick={() => setFatto(false)}
          className="mt-6 text-sm text-tenue underline underline-offset-4 transition-colors hover:text-accento"
        >
          Scrivi un altro messaggio
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={invia} noValidate className="border border-bordo bg-superficie p-7 sm:p-9">
      <h2 className="font-titolo text-2xl">Scriveteci</h2>
      <p className="mt-2 text-sm text-tenue">
        Per informazioni, eventi privati e collaborazioni. Per prenotare un tavolo usate il modulo
        dedicato, è più rapido.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <Campo
          id="contatto-nome"
          etichetta="Nome"
          valore={campi.nome}
          errore={errori.nome}
          autoComplete="name"
          onChange={(valore) => aggiorna('nome', valore)}
        />
        <Campo
          id="contatto-email"
          etichetta="Email"
          tipo="email"
          valore={campi.email}
          errore={errori.email}
          autoComplete="email"
          onChange={(valore) => aggiorna('email', valore)}
        />
      </div>

      <div className="mt-6">
        <Campo
          id="contatto-telefono"
          etichetta="Telefono (facoltativo)"
          tipo="tel"
          valore={campi.telefono}
          autoComplete="tel"
          onChange={(valore) => aggiorna('telefono', valore)}
        />
      </div>

      <div className="mt-6">
        <label
          htmlFor="contatto-testo"
          className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
        >
          Messaggio
        </label>
        <textarea
          id="contatto-testo"
          rows={5}
          value={campi.testo}
          maxLength={2000}
          onChange={(evento) => aggiorna('testo', evento.target.value)}
          aria-invalid={Boolean(errori.testo)}
          aria-describedby={errori.testo ? 'errore-contatto-testo' : undefined}
          className={classi(
            'w-full resize-y border bg-superficie-alt p-4 text-sm transition-colors focus:outline-none',
            errori.testo ? 'border-red-500' : 'border-bordo focus:border-accento',
          )}
        />
        {errori.testo && (
          <p id="errore-contatto-testo" className="mt-2 text-sm text-red-600 scuro:text-red-400">
            {errori.testo}
          </p>
        )}
      </div>

      {/* Esca antispam: nascosta alla vista e agli screen reader */}
      <div className="absolute -left-[9999px]" aria-hidden>
        <label htmlFor="contatto-sito">Non compilare</label>
        <input
          id="contatto-sito"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={campi.sito}
          onChange={(evento) => aggiorna('sito', evento.target.value)}
        />
      </div>

      {erroreGenerale && (
        <p role="alert" className="mt-6 border border-red-300 bg-red-50 p-4 text-sm text-red-700 scuro:bg-red-950/40 scuro:text-red-300">
          {erroreGenerale}
        </p>
      )}

      <button
        type="submit"
        disabled={invio}
        className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-accento px-8 py-4 text-[0.75rem] font-medium uppercase tracking-[0.16em] text-white transition-colors hover:bg-accento-forte disabled:opacity-60 scuro:text-notte sm:w-auto"
      >
        {invio ? 'Invio in corso…' : 'Invia il messaggio'}
        {!invio && <Icona nome="freccia" className="size-4" />}
      </button>

      <p className="mt-5 text-xs leading-relaxed text-tenue">
        I dati sono usati solo per rispondervi, come descritto nella{' '}
        <a href="/privacy" className="text-accento underline underline-offset-4">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}

function Campo({
  id,
  etichetta,
  valore,
  onChange,
  tipo = 'text',
  errore,
  autoComplete,
}: {
  id: string
  etichetta: string
  valore: string
  onChange: (valore: string) => void
  tipo?: string
  errore?: string
  autoComplete?: string
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-tenue"
      >
        {etichetta}
      </label>
      <input
        id={id}
        type={tipo}
        value={valore}
        autoComplete={autoComplete}
        onChange={(evento) => onChange(evento.target.value)}
        aria-invalid={Boolean(errore)}
        aria-describedby={errore ? `errore-${id}` : undefined}
        className={classi(
          'w-full border-b bg-transparent px-1 py-3 transition-colors focus:outline-none',
          errore ? 'border-red-500' : 'border-bordo-forte focus:border-accento',
        )}
      />
      {errore && (
        <p id={`errore-${id}`} className="mt-2 text-sm text-red-600 scuro:text-red-400">
          {errore}
        </p>
      )}
    </div>
  )
}
