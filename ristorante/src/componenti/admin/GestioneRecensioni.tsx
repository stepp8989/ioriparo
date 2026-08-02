'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  Avviso,
  CampoArea,
  CampoScelta,
  CampoTesto,
  Interruttore,
  Pulsante,
  TestataPagina,
} from '@/componenti/admin/campi'
import { Icona } from '@/componenti/ui/Icona'
import { Stelle } from '@/componenti/ui/Stelle'
import type { Recensione } from '@/lib/tipi'
import { classi, dataEstesa, media, oggiIso } from '@/lib/utili'

function recensioneVuota(): Recensione {
  return {
    id: '',
    autore: '',
    testo: '',
    voto: 5,
    data: oggiIso(),
    fonte: 'google',
    pubblicata: true,
  }
}

/**
 * Gestione delle recensioni.
 *
 * Servono a raccogliere quanto arriva da Google e Tripadvisor per mostrarlo in
 * home e nei dati strutturati. Trascrivete il testo così com'è: la valutazione
 * media che compare sul sito e nei risultati di ricerca si calcola da qui, e
 * gonfiarla è una cattiva idea oltre che una pratica scorretta.
 */
export function GestioneRecensioni({ recensioni }: { recensioni: Recensione[] }) {
  const router = useRouter()
  const [bozza, setBozza] = useState<Recensione | null>(null)
  const [nuova, setNuova] = useState(false)
  const [avviso, setAvviso] = useState<{ tipo: 'ok' | 'errore'; testo: string }>({
    tipo: 'ok',
    testo: '',
  })

  const pubblicate = recensioni.filter((voce) => voce.pubblicata)

  function apri(recensione: Recensione | null) {
    setAvviso({ tipo: 'ok', testo: '' })
    setNuova(!recensione)
    setBozza(recensione ? { ...recensione } : recensioneVuota())
  }

  async function salva() {
    if (!bozza) return

    if (!bozza.autore.trim() || !bozza.testo.trim()) {
      setAvviso({ tipo: 'errore', testo: 'Autore e testo sono obbligatori.' })
      return
    }

    try {
      const risposta = await fetch('/api/recensioni', {
        method: nuova ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bozza),
      })
      if (!risposta.ok) throw new Error('Salvataggio non riuscito.')

      setAvviso({ tipo: 'ok', testo: nuova ? 'Recensione aggiunta.' : 'Modifiche salvate.' })
      setBozza(null)
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Salvataggio non riuscito.',
      })
    }
  }

  async function alternaPubblicazione(recensione: Recensione) {
    await fetch('/api/recensioni', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...recensione, pubblicata: !recensione.pubblicata }),
    })
    router.refresh()
  }

  async function elimina(recensione: Recensione) {
    if (!confirm(`Eliminare la recensione di ${recensione.autore}?`)) return

    await fetch(`/api/recensioni?id=${encodeURIComponent(recensione.id)}`, { method: 'DELETE' })
    setAvviso({ tipo: 'ok', testo: 'Recensione eliminata.' })
    setBozza(null)
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-4xl">
      <TestataPagina
        titolo="Recensioni"
        descrizione={
          pubblicate.length > 0
            ? `Media ${media(pubblicate.map((voce) => voce.voto)).toLocaleString('it-IT', { minimumFractionDigits: 1 })} su ${pubblicate.length} recensioni pubblicate.`
            : 'Nessuna recensione pubblicata.'
        }
        azione={
          <Pulsante icona="piu" onClick={() => apri(null)}>
            Nuova recensione
          </Pulsante>
        }
      />

      <Avviso tipo={avviso.tipo} testo={avviso.testo} />

      {/* Scheda di modifica */}
      {bozza && (
        <div className="mb-8 border border-accento-tenue bg-superficie p-6">
          <h2 className="mb-5 font-titolo text-2xl">
            {nuova ? 'Nuova recensione' : 'Modifica recensione'}
          </h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <CampoTesto
              id="rec-autore"
              etichetta="Autore"
              obbligatorio
              valore={bozza.autore}
              onChange={(valore) => setBozza({ ...bozza, autore: valore })}
            />

            <CampoTesto
              id="rec-data"
              etichetta="Data"
              tipo="date"
              valore={bozza.data}
              onChange={(valore) => setBozza({ ...bozza, data: valore })}
            />

            <CampoScelta
              id="rec-voto"
              etichetta="Voto"
              valore={String(bozza.voto)}
              onChange={(valore) => setBozza({ ...bozza, voto: Number(valore) as Recensione['voto'] })}
              opzioni={[5, 4, 3, 2, 1].map((voto) => ({
                valore: String(voto),
                nome: `${voto} ${voto === 1 ? 'stella' : 'stelle'}`,
              }))}
            />

            <CampoScelta
              id="rec-fonte"
              etichetta="Provenienza"
              valore={bozza.fonte}
              onChange={(valore) => setBozza({ ...bozza, fonte: valore })}
              opzioni={[
                { valore: 'google', nome: 'Google' },
                { valore: 'tripadvisor', nome: 'Tripadvisor' },
                { valore: 'diretta', nome: 'Diretta (in sala o via email)' },
              ]}
            />
          </div>

          <div className="mt-5">
            <CampoArea
              id="rec-testo"
              etichetta="Testo"
              obbligatorio
              righe={5}
              massimo={800}
              valore={bozza.testo}
              onChange={(valore) => setBozza({ ...bozza, testo: valore })}
            />
          </div>

          <div className="mt-5">
            <Interruttore
              etichetta="Pubblicata sul sito"
              descrizione="Le recensioni non pubblicate restano in archivio ma non compaiono in home né nei dati strutturati."
              attivo={bozza.pubblicata}
              onChange={(valore) => setBozza({ ...bozza, pubblicata: valore })}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Pulsante icona="spunta" onClick={salva}>
              Salva
            </Pulsante>
            <Pulsante variante="contorno" onClick={() => setBozza(null)}>
              Annulla
            </Pulsante>
            {!nuova && (
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

      {/* Elenco */}
      {recensioni.length === 0 ? (
        <p className="border border-bordo bg-superficie py-16 text-center text-sm text-tenue">
          Nessuna recensione in archivio.
        </p>
      ) : (
        <ul className="space-y-3">
          {recensioni.map((recensione) => (
            <li
              key={recensione.id}
              className={classi(
                'border border-bordo bg-superficie p-5',
                !recensione.pubblicata && 'opacity-55',
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="font-medium">{recensione.autore}</p>
                    <Stelle voto={recensione.voto} dimensione="size-3.5" animate={false} />
                    <span className="text-xs text-tenue capitalize">{recensione.fonte}</span>
                    <span className="text-xs text-tenue">{dataEstesa(recensione.data)}</span>
                    {!recensione.pubblicata && (
                      <span className="border border-bordo-forte px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-tenue">
                        Nascosta
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm leading-relaxed text-tenue">{recensione.testo}</p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => alternaPubblicazione(recensione)}
                    title={recensione.pubblicata ? 'Nascondi dal sito' : 'Pubblica sul sito'}
                    aria-label={recensione.pubblicata ? 'Nascondi dal sito' : 'Pubblica sul sito'}
                    className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
                  >
                    <Icona nome={recensione.pubblicata ? 'spunta' : 'meno'} className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => apri(recensione)}
                    aria-label={`Modifica la recensione di ${recensione.autore}`}
                    className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
                  >
                    <Icona nome="matita" className="size-4" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
