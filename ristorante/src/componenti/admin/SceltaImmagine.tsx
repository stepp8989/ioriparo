'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Etichetta, Pulsante } from '@/componenti/admin/campi'
import { Icona } from '@/componenti/ui/Icona'
import { classi } from '@/lib/utili'

/**
 * Scelta della fotografia.
 *
 * Tre strade, in ordine di comodità: caricare un file dal dispositivo,
 * scegliere fra le immagini già presenti nel sito, oppure incollare un
 * percorso. L'anteprima è sempre visibile, così si vede subito cosa si sta
 * salvando.
 */
export function SceltaImmagine({
  valore,
  onChange,
  id = 'immagine',
}: {
  valore: string
  onChange: (percorso: string) => void
  id?: string
}) {
  const [disponibili, setDisponibili] = useState<string[]>([])
  const [aperto, setAperto] = useState(false)
  const [caricamento, setCaricamento] = useState(false)
  const [errore, setErrore] = useState('')
  const campoFile = useRef<HTMLInputElement>(null)

  // L'elenco si scarica solo quando serve davvero.
  useEffect(() => {
    if (!aperto || disponibili.length > 0) return

    fetch('/api/immagini')
      .then((risposta) => risposta.json())
      .then((dati) => setDisponibili(dati.immagini ?? []))
      .catch(() => setErrore('Non è stato possibile leggere l’elenco delle immagini.'))
  }, [aperto, disponibili.length])

  async function carica(file: File) {
    setCaricamento(true)
    setErrore('')

    try {
      const corpo = new FormData()
      corpo.append('file', file)

      const risposta = await fetch('/api/immagini', { method: 'POST', body: corpo })
      const dati = await risposta.json()

      if (!risposta.ok) throw new Error(dati.errore ?? 'Caricamento non riuscito.')

      onChange(dati.percorso)
      setDisponibili((elenco) => [dati.percorso, ...elenco])
    } catch (problema) {
      setErrore(problema instanceof Error ? problema.message : 'Caricamento non riuscito.')
    } finally {
      setCaricamento(false)
      if (campoFile.current) campoFile.current.value = ''
    }
  }

  return (
    <div>
      <Etichetta htmlFor={id}>Fotografia</Etichetta>

      <div className="flex gap-4">
        {/* Anteprima */}
        <div className="relative size-24 shrink-0 overflow-hidden border border-bordo bg-superficie-alt">
          {valore ? (
            <Image src={valore} alt="" fill sizes="6rem" className="object-cover" />
          ) : (
            <span className="grid h-full place-items-center text-tenue">
              <Icona nome="fotocamera" className="size-6" />
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <input
            id={id}
            type="text"
            value={valore}
            onChange={(evento) => onChange(evento.target.value)}
            placeholder="/immagini/piatti/nome-file.jpg"
            className="w-full border border-bordo bg-superficie px-3.5 py-2.5 text-sm transition-colors focus:border-accento focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap gap-2">
            <input
              ref={campoFile}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              className="sr-only"
              onChange={(evento) => {
                const file = evento.target.files?.[0]
                if (file) void carica(file)
              }}
              id={`${id}-file`}
            />

            <Pulsante
              type="button"
              variante="contorno"
              icona="fotocamera"
              disabled={caricamento}
              onClick={() => campoFile.current?.click()}
            >
              {caricamento ? 'Caricamento…' : 'Carica'}
            </Pulsante>

            <Pulsante
              type="button"
              variante="contorno"
              icona="griglia"
              onClick={() => setAperto((precedente) => !precedente)}
            >
              {aperto ? 'Chiudi elenco' : 'Scegli'}
            </Pulsante>
          </div>

          {errore && <p className="mt-2 text-xs text-red-600 scuro:text-red-400">{errore}</p>}
        </div>
      </div>

      {/* Elenco delle immagini già presenti */}
      {aperto && (
        <div className="mt-4 max-h-72 overflow-y-auto border border-bordo bg-superficie-alt p-3">
          {disponibili.length === 0 ? (
            <p className="py-6 text-center text-xs text-tenue">Nessuna immagine disponibile.</p>
          ) : (
            <ul className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {disponibili.map((percorso) => (
                <li key={percorso}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(percorso)
                      setAperto(false)
                    }}
                    title={percorso}
                    className={classi(
                      'relative block aspect-square w-full overflow-hidden border transition-colors',
                      percorso === valore ? 'border-accento' : 'border-transparent hover:border-accento',
                    )}
                  >
                    <Image src={percorso} alt="" fill sizes="6rem" className="object-cover" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
