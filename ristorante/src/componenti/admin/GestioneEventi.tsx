'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Avviso,
  CampoArea,
  CampoTesto,
  Interruttore,
  Pulsante,
  TestataPagina,
} from '@/componenti/admin/campi'
import { SceltaImmagine } from '@/componenti/admin/SceltaImmagine'
import { Icona } from '@/componenti/ui/Icona'
import type { Evento } from '@/lib/tipi'
import { classi, dataEstesa, oggiIso } from '@/lib/utili'

function eventoVuoto(): Evento {
  return {
    id: '',
    titolo: '',
    sottotitolo: '',
    descrizione: '',
    data: oggiIso(),
    immagine: '',
    attivo: true,
  }
}

/**
 * Eventi e promozioni.
 *
 * Gli eventi attivi compaiono in home; disattivandone uno lo si toglie dal
 * sito senza perderne il testo, comodo per le iniziative che tornano ogni
 * anno.
 */
export function GestioneEventi({ eventi }: { eventi: Evento[] }) {
  const router = useRouter()
  const [bozza, setBozza] = useState<Evento | null>(null)
  const [nuovo, setNuovo] = useState(false)
  const [avviso, setAvviso] = useState<{ tipo: 'ok' | 'errore'; testo: string }>({
    tipo: 'ok',
    testo: '',
  })

  function apri(evento: Evento | null) {
    setAvviso({ tipo: 'ok', testo: '' })
    setNuovo(!evento)
    setBozza(evento ? { ...evento } : eventoVuoto())
  }

  async function salva() {
    if (!bozza) return

    if (!bozza.titolo.trim()) {
      setAvviso({ tipo: 'errore', testo: 'Il titolo è obbligatorio.' })
      return
    }

    try {
      const risposta = await fetch('/api/eventi', {
        method: nuovo ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bozza),
      })
      if (!risposta.ok) throw new Error('Salvataggio non riuscito.')

      setAvviso({ tipo: 'ok', testo: nuovo ? 'Evento aggiunto.' : 'Modifiche salvate.' })
      setBozza(null)
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Salvataggio non riuscito.',
      })
    }
  }

  async function alternaAttivo(evento: Evento) {
    await fetch('/api/eventi', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...evento, attivo: !evento.attivo }),
    })
    router.refresh()
  }

  async function elimina(evento: Evento) {
    if (!confirm(`Eliminare «${evento.titolo}»?`)) return

    await fetch(`/api/eventi?id=${encodeURIComponent(evento.id)}`, { method: 'DELETE' })
    setAvviso({ tipo: 'ok', testo: 'Evento eliminato.' })
    setBozza(null)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TestataPagina
        titolo="Eventi e promozioni"
        descrizione={`${eventi.filter((voce) => voce.attivo).length} attivi sul sito, ${eventi.length} in archivio.`}
        azione={
          <Pulsante icona="piu" onClick={() => apri(null)}>
            Nuovo evento
          </Pulsante>
        }
      />

      <Avviso tipo={avviso.tipo} testo={avviso.testo} />

      {bozza && (
        <div className="mb-8 border border-accento-tenue bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-2xl">{nuovo ? 'Nuovo evento' : 'Modifica evento'}</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTesto
              id="evt-titolo"
              etichetta="Titolo"
              obbligatorio
              valore={bozza.titolo}
              onChange={(valore) => setBozza({ ...bozza, titolo: valore })}
            />
            <CampoTesto
              id="evt-sottotitolo"
              etichetta="Sottotitolo"
              valore={bozza.sottotitolo}
              onChange={(valore) => setBozza({ ...bozza, sottotitolo: valore })}
              suggerimento="Es. «Dal 12 al 19 novembre»"
            />
          </div>

          <div className="mt-5">
            <CampoArea
              id="evt-descrizione"
              etichetta="Descrizione"
              righe={4}
              massimo={600}
              valore={bozza.descrizione}
              onChange={(valore) => setBozza({ ...bozza, descrizione: valore })}
            />
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <CampoTesto
              id="evt-data"
              etichetta="Data"
              tipo="date"
              valore={bozza.data}
              onChange={(valore) => setBozza({ ...bozza, data: valore })}
            />
          </div>

          <div className="mt-5">
            <SceltaImmagine
              id="evt-immagine"
              valore={bozza.immagine}
              onChange={(percorso) => setBozza({ ...bozza, immagine: percorso })}
            />
          </div>

          <div className="mt-5">
            <Interruttore
              etichetta="Attivo sul sito"
              descrizione="Gli eventi attivi compaiono nella sezione «Eventi e promozioni» della home."
              attivo={bozza.attivo}
              onChange={(valore) => setBozza({ ...bozza, attivo: valore })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Pulsante icona="spunta" onClick={salva}>
              Salva
            </Pulsante>
            <Pulsante variante="contorno" onClick={() => setBozza(null)}>
              Annulla
            </Pulsante>
            {!nuovo && (
              <Pulsante
                variante="pericolo"
                icona="cestino"
                className="ml-auto"
                onClick={() => elimina(bozza)}
              >
                Elimina
              </Pulsante>
            )}
          </div>
        </div>
      )}

      {eventi.length === 0 ? (
        <p className="border border-bordo bg-superficie py-16 text-center text-sm text-tenue">
          Nessun evento in archivio.
        </p>
      ) : (
        <ul className="space-y-3">
          {eventi.map((evento) => (
            <li
              key={evento.id}
              className={classi(
                'flex items-center gap-4 border border-bordo bg-superficie p-4',
                !evento.attivo && 'opacity-55',
              )}
            >
              <div className="relative size-16 shrink-0 overflow-hidden bg-superficie-alt">
                {evento.immagine && (
                  <Image src={evento.immagine} alt="" fill sizes="4rem" className="object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{evento.titolo}</p>
                  {!evento.attivo && (
                    <span className="border border-bordo-forte px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-tenue">
                      Non attivo
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-xs text-tenue">
                  {evento.sottotitolo} · {dataEstesa(evento.data)}
                </p>
              </div>

              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => alternaAttivo(evento)}
                  title={evento.attivo ? 'Disattiva' : 'Attiva'}
                  aria-label={evento.attivo ? 'Disattiva l’evento' : 'Attiva l’evento'}
                  className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
                >
                  <Icona nome={evento.attivo ? 'spunta' : 'meno'} className="size-4" />
                </button>

                <button
                  type="button"
                  onClick={() => apri(evento)}
                  aria-label={`Modifica ${evento.titolo}`}
                  className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
                >
                  <Icona nome="matita" className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
