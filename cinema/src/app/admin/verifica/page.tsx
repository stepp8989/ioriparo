'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import { Campo } from '@/componenti/ui/campi'
import { classi, dataEstesa } from '@/lib/utili'

/**
 * Verifica dei biglietti all'ingresso.
 *
 * La lettura usa `BarcodeDetector`, l'API che il browser espone quando il
 * sistema operativo sa già decodificare i QR — su Android e su Chrome da
 * scrivania è disponibile, su iOS no. Dove manca, invece di caricare una
 * libreria di decodifica da mezzo megabyte su un tablet che lavora tutta la
 * sera, si usa il campo di testo: i lettori di codici a barre da banco si
 * comportano come tastiere, digitano il contenuto e premono Invio, e con
 * quelli il campo è anzi più rapido della fotocamera.
 *
 * Due passaggi distinti, e la distinzione conta: prima si *legge* il biglietto
 * — che dice se è valido senza consumarlo — poi si *timbra*, e solo allora il
 * QR diventa inutilizzabile. Serve a poter controllare un codice per un
 * cliente che chiede conferma, senza bruciarlo.
 */

type Biglietto = {
  codice: string
  codiceBiglietto: string
  film: string
  cinema: string
  sala: string
  data: string
  ora: string
  posto: string
  tipologia: string
  documentoRichiesto: boolean
  intestatario: string
  utilizzatoIl: string | null
}

type Esito =
  | { valido: true; giaUsato: boolean; messaggio: string; biglietto: Biglietto }
  | { valido: false; motivo: string }

/** Il tipo non è ancora nelle definizioni standard: si dichiara quel che serve. */
type RilevatoreCodici = {
  detect: (sorgente: CanvasImageSource) => Promise<{ rawValue: string }[]>
}

export default function PaginaVerificaAdmin() {
  const [contenuto, setContenuto] = useState('')
  const [esito, setEsito] = useState<Esito | null>(null)
  const [inCorso, setInCorso] = useState(false)
  const [timbrato, setTimbrato] = useState(false)
  const [fotocamera, setFotocamera] = useState(false)
  const [supportata, setSupportata] = useState(false)
  const [erroreCamera, setErroreCamera] = useState('')

  const video = useRef<HTMLVideoElement>(null)
  const flusso = useRef<MediaStream | null>(null)

  useEffect(() => {
    setSupportata('BarcodeDetector' in window)
  }, [])

  const leggi = useCallback(async (testo: string) => {
    if (!testo.trim()) return

    setInCorso(true)
    setTimbrato(false)

    try {
      const risposta = await fetch('/api/biglietti/verifica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenuto: testo.trim() }),
      })

      const dati = (await risposta.json()) as Esito
      setEsito(dati)
    } catch {
      setEsito({ valido: false, motivo: 'Connessione non riuscita.' })
    } finally {
      setInCorso(false)
    }
  }, [])

  async function timbra() {
    if (!esito?.valido) return
    setInCorso(true)

    try {
      const risposta = await fetch('/api/biglietti/verifica', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenuto }),
      })

      const dati = (await risposta.json()) as { timbrato: boolean; messaggio: string }
      setTimbrato(dati.timbrato)

      if (!dati.timbrato) {
        setEsito({ valido: false, motivo: dati.messaggio })
      }
    } finally {
      setInCorso(false)
    }
  }

  /* ── Fotocamera ───────────────────────────────────────────────────────── */
  const fermaFotocamera = useCallback(() => {
    flusso.current?.getTracks().forEach((traccia) => traccia.stop())
    flusso.current = null
    setFotocamera(false)
  }, [])

  useEffect(() => () => fermaFotocamera(), [fermaFotocamera])

  async function avviaFotocamera() {
    setErroreCamera('')

    try {
      const sorgente = await navigator.mediaDevices.getUserMedia({
        // `environment` è la fotocamera posteriore: su un telefono è quella
        // che si punta verso il biglietto di qualcun altro.
        video: { facingMode: 'environment' },
      })

      flusso.current = sorgente
      setFotocamera(true)

      if (video.current) {
        video.current.srcObject = sorgente
        await video.current.play()
      }

      const Rilevatore = (
        window as unknown as { BarcodeDetector: new (opzioni: { formats: string[] }) => RilevatoreCodici }
      ).BarcodeDetector

      const rilevatore = new Rilevatore({ formats: ['qr_code'] })

      const cerca = async () => {
        if (!flusso.current || !video.current) return

        try {
          const codici = await rilevatore.detect(video.current)
          if (codici.length > 0) {
            const testo = codici[0].rawValue
            setContenuto(testo)
            fermaFotocamera()
            void leggi(testo)
            return
          }
        } catch {
          // Un fotogramma illeggibile è la normalità: si passa al successivo.
        }

        window.setTimeout(cerca, 350)
      }

      void cerca()
    } catch {
      setErroreCamera(
        'Non riusciamo ad accedere alla fotocamera. Verifica il permesso nel browser, oppure usa il campo qui sotto.',
      )
      setFotocamera(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Verifica biglietti</h1>
        <p className="mt-1.5 text-[0.9rem] text-tenue">
          Leggi il QR, controlla che sia valido e registra l’ingresso. Un biglietto letto non è
          ancora consumato: lo diventa solo premendo «Registra l’ingresso».
        </p>
      </header>

      {/* ── Lettura ─────────────────────────────────────────────────────── */}
      <div className="mt-7 rounded-ampio border border-bordo bg-superficie p-6">
        {fotocamera ? (
          <div>
            <div className="relative overflow-hidden rounded-morbido bg-notte">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption -- flusso della fotocamera, senza audio. */}
              <video ref={video} className="w-full" playsInline muted />
              <div
                className="pointer-events-none absolute inset-[18%] rounded-morbido border-2 border-accento/70"
                aria-hidden
              />
            </div>

            <Bottone variante="tenue" className="mt-4 w-full" onClick={fermaFotocamera}>
              <Icona nome="chiudi" className="size-4" />
              Ferma la fotocamera
            </Bottone>
          </div>
        ) : (
          <div className="space-y-4">
            {supportata ? (
              <Bottone className="w-full" misura="grande" onClick={() => void avviaFotocamera()}>
                <Icona nome="qr" className="size-5" />
                Inquadra il codice
              </Bottone>
            ) : (
              <Nota icona={<Icona nome="info" className="size-4" />}>
                Questo browser non sa decodificare i QR da solo. Usa il campo qui sotto: un lettore
                di codici da banco si comporta come una tastiera e lo riempie da sé.
              </Nota>
            )}

            {erroreCamera && (
              <Nota tono="ambra" icona={<Icona nome="avviso" className="size-4" />}>
                {erroreCamera}
              </Nota>
            )}

            <form
              onSubmit={(evento) => {
                evento.preventDefault()
                void leggi(contenuto)
              }}
              className="flex gap-2"
            >
              <Campo
                etichetta="Contenuto del QR"
                value={contenuto}
                onChange={(evento) => setContenuto(evento.target.value)}
                placeholder="CMX1|…"
                className="flex-1"
                autoFocus
              />
              <Bottone type="submit" className="mt-7 shrink-0" disabled={inCorso}>
                Verifica
              </Bottone>
            </form>
          </div>
        )}
      </div>

      {/* ── Esito ───────────────────────────────────────────────────────── */}
      {esito && (
        <div
          className={classi(
            'mt-6 overflow-hidden rounded-ampio border',
            timbrato
              ? 'border-ok bg-ok/8'
              : esito.valido
                ? esito.giaUsato
                  ? 'border-attesa bg-attesa/8'
                  : 'border-bordo bg-superficie'
                : 'border-errore bg-errore/8',
          )}
          role="status"
          aria-live="assertive"
        >
          <div className="flex items-center gap-4 p-6">
            <span
              className={classi(
                'inline-flex size-14 shrink-0 items-center justify-center rounded-full',
                timbrato
                  ? 'bg-ok/20 text-ok'
                  : esito.valido
                    ? esito.giaUsato
                      ? 'bg-attesa/20 text-attesa'
                      : 'bg-accento/15 text-accento'
                    : 'bg-errore/20 text-errore',
              )}
            >
              <Icona
                nome={timbrato ? 'spunta' : esito.valido ? (esito.giaUsato ? 'avviso' : 'biglietto') : 'chiudi'}
                className="size-7"
                spessore={2.4}
              />
            </span>

            <div className="min-w-0">
              <p className="font-titolo text-[1.2rem] font-semibold">
                {timbrato
                  ? 'Ingresso registrato'
                  : esito.valido
                    ? esito.giaUsato
                      ? 'Biglietto già utilizzato'
                      : 'Biglietto valido'
                    : 'Biglietto non valido'}
              </p>
              <p className="mt-0.5 text-[0.88rem] text-tenue">
                {esito.valido ? esito.messaggio : esito.motivo}
              </p>
            </div>
          </div>

          {esito.valido && (
            <div className="border-t border-bordo p-6">
              <dl className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Film', esito.biglietto.film],
                  ['Cinema', esito.biglietto.cinema],
                  ['Sala', esito.biglietto.sala],
                  ['Spettacolo', `${dataEstesa(esito.biglietto.data)} · ${esito.biglietto.ora}`],
                  ['Posto', esito.biglietto.posto],
                  ['Tipologia', esito.biglietto.tipologia],
                  ['Prenotazione', esito.biglietto.codice],
                  ['Intestatario', esito.biglietto.intestatario || '—'],
                ].map(([etichetta, valore]) => (
                  <div key={etichetta} className="flex justify-between gap-3 text-[0.88rem]">
                    <dt className="text-tenue">{etichetta}</dt>
                    <dd className="text-right font-medium">{valore}</dd>
                  </div>
                ))}
              </dl>

              {esito.biglietto.documentoRichiesto && (
                <Nota tono="ambra" className="mt-5" icona={<Icona nome="info" className="size-4" />}>
                  Tipologia ridotta: <strong className="text-testo">chiedi un documento</strong> che
                  dia diritto alla riduzione. In mancanza, il cliente può integrare fino al prezzo
                  intero.
                </Nota>
              )}

              {esito.biglietto.utilizzatoIl && (
                <Nota tono="ambra" className="mt-4" icona={<Icona nome="orologio" className="size-4" />}>
                  Questo posto risulta già entrato il {dataEstesa(esito.biglietto.utilizzatoIl)}.
                  Verifica con il cliente prima di far entrare.
                </Nota>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                {!timbrato && !esito.giaUsato && (
                  <Bottone onClick={() => void timbra()} disabled={inCorso} misura="grande">
                    <Icona nome="spunta" className="size-4" />
                    Registra l’ingresso
                  </Bottone>
                )}

                <Bottone
                  variante="tenue"
                  onClick={() => {
                    setEsito(null)
                    setContenuto('')
                    setTimbrato(false)
                  }}
                  misura={timbrato || esito.giaUsato ? 'grande' : 'normale'}
                >
                  Biglietto successivo
                </Bottone>
              </div>
            </div>
          )}

          {!esito.valido && (
            <div className="border-t border-bordo p-6">
              <Bottone
                variante="tenue"
                onClick={() => {
                  setEsito(null)
                  setContenuto('')
                }}
              >
                Riprova
              </Bottone>
            </div>
          )}
        </div>
      )}

      {esito?.valido && !esito.giaUsato && !timbrato && (
        <p className="mt-4 text-center text-[0.82rem] text-tenue">
          Finché non registri l’ingresso, il biglietto resta utilizzabile.
        </p>
      )}
    </div>
  )
}
