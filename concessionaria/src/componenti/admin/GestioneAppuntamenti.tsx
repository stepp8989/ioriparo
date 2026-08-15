'use client'

import { useMemo, useState } from 'react'
import {
  Azione,
  Caricamento,
  conferma,
  Errore,
  esportaCsv,
  invia,
  TestataPagina,
  useRisorsa,
  Vuoto,
} from '@/componenti/admin/comuni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Etichetta } from '@/componenti/ui/Sezione'
import {
  NOMI_STATO_APPUNTAMENTO,
  STATI_APPUNTAMENTO,
  type Appuntamento,
  type StatoAppuntamento,
} from '@/lib/tipi'
import { classi, dataBreve, oggiIso, prezzo } from '@/lib/utili'

/**
 * Appuntamenti del reparto detailing e dell'officina.
 *
 * Ordinati per data di consegna del veicolo: è il calendario di lavoro della
 * cabina, non un registro di quando sono arrivate le richieste.
 */

const TONI: Record<StatoAppuntamento, 'ambra' | 'accento' | 'neutro' | 'rosso'> = {
  'in-attesa': 'ambra',
  confermato: 'accento',
  concluso: 'neutro',
  annullato: 'rosso',
}

export function GestioneAppuntamenti() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ appuntamenti: Appuntamento[] }>(
    '/api/appuntamenti',
  )
  const [soloProssimi, setSoloProssimi] = useState(true)
  const [avviso, setAvviso] = useState('')

  const oggi = oggiIso()

  const appuntamenti = useMemo(() => {
    let elenco = [...(dati?.appuntamenti ?? [])].sort(
      (a, b) => a.data.localeCompare(b.data) || a.ora.localeCompare(b.ora),
    )
    if (soloProssimi) {
      elenco = elenco.filter(
        (appuntamento) => appuntamento.data >= oggi && appuntamento.stato !== 'annullato',
      )
    }
    return elenco
  }, [dati, soloProssimi, oggi])

  async function cambiaStato(appuntamento: Appuntamento, stato: StatoAppuntamento) {
    const esito = await invia('/api/appuntamenti', 'PATCH', { id: appuntamento.id, stato })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(appuntamento: Appuntamento) {
    if (!conferma(`Eliminare l’appuntamento ${appuntamento.codice}?`)) return
    const esito = await invia(
      `/api/appuntamenti?id=${encodeURIComponent(appuntamento.id)}`,
      'DELETE',
    )
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Appuntamenti"
        descrizione="Detailing e officina, in ordine di consegna del veicolo."
        azione={
          <Bottone
            variante="contorno"
            misura="piccola"
            onClick={() =>
              esportaCsv(
                'appuntamenti',
                (dati?.appuntamenti ?? []).map((appuntamento) => ({
                  codice: appuntamento.codice,
                  data: appuntamento.data,
                  ora: appuntamento.ora,
                  trattamento: appuntamento.servizioNome,
                  cliente: `${appuntamento.nome} ${appuntamento.cognome}`,
                  telefono: appuntamento.telefono,
                  veicolo: appuntamento.veicolo,
                  targa: appuntamento.targa,
                  stato: appuntamento.stato,
                })),
              )
            }
          >
            <Icona nome="scarica" className="size-4" />
            Esporta CSV
          </Bottone>
        }
      />

      <Errore testo={errore || avviso} onRiprova={ricarica} />

      <label className="mb-6 flex items-center gap-2.5 text-[0.85rem] text-tenue">
        <input
          type="checkbox"
          checked={soloProssimi}
          onChange={(evento) => setSoloProssimi(evento.target.checked)}
          className="size-4 accent-[var(--accento)]"
        />
        Mostra solo i prossimi
      </label>

      {appuntamenti.length === 0 ? (
        <Vuoto testo="Nessun appuntamento in questo elenco." />
      ) : (
        <div className="space-y-3">
          {appuntamenti.map((appuntamento) => (
            <article
              key={appuntamento.id}
              className={classi(
                'flex flex-wrap items-start justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5',
                appuntamento.data === oggi && 'border-accento/50',
              )}
            >
              <div className="flex min-w-[14rem] flex-1 gap-5">
                <div className="w-20 shrink-0 rounded-morbido border border-bordo bg-superficie-alt p-3 text-center">
                  <p className="text-[0.72rem] tracking-[0.1em] text-tenue uppercase">
                    {dataBreve(appuntamento.data).split(' ')[0]}
                  </p>
                  <p className="mt-1 font-titolo text-[1.3rem] leading-none font-semibold tabellare">
                    {appuntamento.data.slice(8, 10)}
                  </p>
                  <p className="mt-1 text-[0.75rem] text-tenue tabellare">{appuntamento.ora}</p>
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etichetta tono={TONI[appuntamento.stato]}>
                      {NOMI_STATO_APPUNTAMENTO[appuntamento.stato]}
                    </Etichetta>
                    <span className="text-[0.8rem] text-tenue tabellare">{appuntamento.codice}</span>
                  </div>

                  <p className="mt-2.5 font-semibold">{appuntamento.servizioNome}</p>
                  <p className="mt-1 text-[0.85rem] text-tenue">
                    da {prezzo(appuntamento.prezzo)} · {appuntamento.veicolo}
                    {appuntamento.targa && ` · ${appuntamento.targa}`}
                  </p>

                  <p className="mt-2.5 text-[0.88rem]">
                    <span className="font-medium">
                      {appuntamento.nome} {appuntamento.cognome}
                    </span>
                    <span className="mx-2 text-tenue">·</span>
                    <a href={`tel:${appuntamento.telefono}`} className="text-accento sottolinea">
                      {appuntamento.telefono}
                    </a>
                  </p>

                  {appuntamento.note && (
                    <p className="mt-2.5 rounded-tenue bg-superficie-alt px-3 py-2 text-[0.85rem] text-tenue">
                      {appuntamento.note}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <label className="sr-only" htmlFor={`stato-app-${appuntamento.id}`}>
                  Stato dell’appuntamento {appuntamento.codice}
                </label>
                <select
                  id={`stato-app-${appuntamento.id}`}
                  value={appuntamento.stato}
                  onChange={(evento) =>
                    cambiaStato(appuntamento, evento.target.value as StatoAppuntamento)
                  }
                  className="rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.85rem] focus:border-accento focus:outline-none"
                >
                  {STATI_APPUNTAMENTO.map((stato) => (
                    <option key={stato} value={stato}>
                      {NOMI_STATO_APPUNTAMENTO[stato]}
                    </option>
                  ))}
                </select>

                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(appuntamento)}
                />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
