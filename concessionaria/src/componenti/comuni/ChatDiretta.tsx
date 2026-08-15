'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA, linkWhatsApp } from '@/dati/azienda'
import { classi, emailValida } from '@/lib/utili'

/**
 * Chat con il salone.
 *
 * Non è un servizio esterno: i messaggi finiscono nella stessa casella del
 * modulo contatti e lo staff li legge dal pannello. È una scelta deliberata —
 * una chat di terze parti costerebbe uno script pesante, cookie da dichiarare
 * e dati dei visitatori consegnati a un fornitore, per un'attività che riceve
 * qualche messaggio al giorno.
 *
 * Chi ha bisogno di una risposta immediata trova in cima il collegamento a
 * WhatsApp e il numero di telefono: sono i canali su cui la concessionaria
 * risponde davvero in tempo reale.
 */

type Messaggio = { da: 'noi' | 'cliente'; testo: string }

const DOMANDE_RAPIDE = [
  'Vorrei prenotare un test drive',
  'Quanto vale il mio usato in permuta?',
  'Avete un’auto a noleggio per domani?',
  'Quanto costa il trattamento ceramico?',
]

const BENVENUTO: Messaggio = {
  da: 'noi',
  testo:
    'Buongiorno! Scriveteci pure: rispondiamo negli orari di apertura, di solito entro un’ora. ' +
    'Se avete fretta, WhatsApp e telefono sono qui sopra.',
}

export function ChatDiretta() {
  const [aperta, setAperta] = useState(false)
  const [messaggi, setMessaggi] = useState<Messaggio[]>([BENVENUTO])
  const [testo, setTesto] = useState('')
  const [email, setEmail] = useState('')
  const [invio, setInvio] = useState(false)
  const fondo = useRef<HTMLDivElement>(null)

  // Ogni messaggio nuovo porta la conversazione in fondo, come in una chat vera.
  useEffect(() => {
    fondo.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messaggi])

  useEffect(() => {
    if (!aperta) return
    const allaTastiera = (evento: KeyboardEvent) => {
      if (evento.key === 'Escape') setAperta(false)
    }
    window.addEventListener('keydown', allaTastiera)
    return () => window.removeEventListener('keydown', allaTastiera)
  }, [aperta])

  async function invia(evento: FormEvent) {
    evento.preventDefault()

    const contenuto = testo.trim()
    if (contenuto.length < 2 || invio) return

    if (!emailValida(email)) {
      setMessaggi((precedenti) => [
        ...precedenti,
        { da: 'cliente', testo: contenuto },
        {
          da: 'noi',
          testo: 'Lasciateci un indirizzo email valido: è l’unico modo che abbiamo per rispondervi.',
        },
      ])
      setTesto('')
      return
    }

    setMessaggi((precedenti) => [...precedenti, { da: 'cliente', testo: contenuto }])
    setTesto('')
    setInvio(true)

    try {
      const risposta = await fetch('/api/contatti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: 'Chat sito',
          email,
          telefono: '',
          oggetto: 'Messaggio dalla chat',
          testo: contenuto,
        }),
      })

      setMessaggi((precedenti) => [
        ...precedenti,
        {
          da: 'noi',
          testo: risposta.ok
            ? 'Messaggio ricevuto: vi rispondiamo a questo indirizzo entro poche ore. Grazie!'
            : 'Non siamo riusciti a registrare il messaggio. Provate su WhatsApp o chiamateci.',
        },
      ])
    } catch {
      setMessaggi((precedenti) => [
        ...precedenti,
        {
          da: 'noi',
          testo: 'Connessione non riuscita. Scriveteci su WhatsApp: è il canale più rapido.',
        },
      ])
    } finally {
      setInvio(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAperta((precedente) => !precedente)}
        aria-label={aperta ? 'Chiudi la chat' : 'Apri la chat'}
        aria-expanded={aperta}
        className="inline-flex items-center justify-center rounded-full bg-accento text-white shadow-accento transition-transform duration-300 hover:-translate-y-0.5"
        style={{ width: '3.25rem', height: '3.25rem' }}
      >
        <Icona nome={aperta ? 'chiudi' : 'chat'} className="size-6" />
      </button>

      <div
        className={classi(
          'fixed right-4 bottom-24 w-[calc(100vw-2rem)] max-w-sm transition-all duration-400 sm:right-6 sm:bottom-28',
          aperta ? 'pointer-events-auto opacity-100' : 'pointer-events-none translate-y-4 opacity-0',
        )}
        aria-hidden={!aperta}
      >
        <div className="vetro flex max-h-[70vh] flex-col overflow-hidden rounded-ampio shadow-rilievo">
          <div className="flex items-center gap-3 border-b border-bordo px-5 py-4">
            <span className="relative flex size-2.5">
              <span className="pulsa absolute inline-flex size-full rounded-full bg-emerald-400" />
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.92rem] font-semibold">{AZIENDA.nomeCompleto}</p>
              <p className="text-[0.75rem] text-tenue">Rispondiamo negli orari di apertura</p>
            </div>
            <a
              href={linkWhatsApp('Buongiorno, vorrei un’informazione.')}
              target="_blank"
              rel="noopener noreferrer"
              className="text-tenue transition-colors hover:text-[#25d366]"
              aria-label="Continua su WhatsApp"
            >
              <Icona nome="whatsapp" className="size-5" />
            </a>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {messaggi.map((messaggio, indice) => (
              <p
                key={indice}
                className={classi(
                  'max-w-[85%] rounded-morbido px-4 py-2.5 text-[0.88rem] leading-relaxed',
                  messaggio.da === 'noi'
                    ? 'bg-superficie-alt text-testo'
                    : 'ml-auto bg-accento text-white',
                )}
              >
                {messaggio.testo}
              </p>
            ))}

            {messaggi.length === 1 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {DOMANDE_RAPIDE.map((domanda) => (
                  <button
                    key={domanda}
                    type="button"
                    onClick={() => setTesto(domanda)}
                    className="rounded-full border border-bordo px-3 py-1.5 text-[0.78rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                  >
                    {domanda}
                  </button>
                ))}
              </div>
            )}

            <div ref={fondo} />
          </div>

          <form onSubmit={invia} className="space-y-2 border-t border-bordo px-5 py-4">
            <label htmlFor="chat-email" className="sr-only">
              La vostra email
            </label>
            <input
              id="chat-email"
              type="email"
              value={email}
              onChange={(evento) => setEmail(evento.target.value)}
              placeholder="La vostra email"
              autoComplete="email"
              className="w-full rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.85rem] focus:border-accento focus:outline-none"
            />

            <div className="flex gap-2">
              <label htmlFor="chat-testo" className="sr-only">
                Il vostro messaggio
              </label>
              <input
                id="chat-testo"
                value={testo}
                onChange={(evento) => setTesto(evento.target.value)}
                placeholder="Scrivete qui…"
                maxLength={600}
                className="min-w-0 flex-1 rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.88rem] focus:border-accento focus:outline-none"
              />
              <button
                type="submit"
                disabled={invio || testo.trim().length < 2}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-accento text-white transition-colors hover:bg-accento-forte disabled:opacity-40"
                aria-label="Invia il messaggio"
              >
                <Icona nome="freccia" className="size-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
