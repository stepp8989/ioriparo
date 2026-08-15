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
  NOMI_TIPO_RICHIESTA,
  STATI_RICHIESTA,
  TIPI_RICHIESTA,
  type Richiesta,
  type StatoRichiesta,
  type TipoRichiesta,
} from '@/lib/tipi'
import { classi, dataBreve, prezzo } from '@/lib/utili'

/**
 * Richieste commerciali arrivate dal sito.
 *
 * Le nuove restano in cima finché non vengono prese in carico: il pannello
 * serve a non perderne nessuna, e l'ordine cronologico da solo non basta
 * quando ne arrivano parecchie in un giorno.
 */

const NOMI_STATO: Record<StatoRichiesta, string> = {
  nuova: 'Nuova',
  'in-lavorazione': 'In lavorazione',
  chiusa: 'Chiusa',
}

const TONI: Record<StatoRichiesta, 'accento' | 'ambra' | 'neutro'> = {
  nuova: 'accento',
  'in-lavorazione': 'ambra',
  chiusa: 'neutro',
}

export function GestioneRichieste() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ richieste: Richiesta[] }>(
    '/api/richieste',
  )
  const [tipo, setTipo] = useState<TipoRichiesta | 'tutte'>('tutte')
  const [soloAperte, setSoloAperte] = useState(true)
  const [avviso, setAvviso] = useState('')

  const richieste = useMemo(() => {
    let elenco = [...(dati?.richieste ?? [])]
    if (tipo !== 'tutte') elenco = elenco.filter((richiesta) => richiesta.tipo === tipo)
    if (soloAperte) elenco = elenco.filter((richiesta) => richiesta.stato !== 'chiusa')

    // Prima le nuove, poi le più recenti.
    return elenco.sort((a, b) => {
      const pesoA = a.stato === 'nuova' ? 0 : 1
      const pesoB = b.stato === 'nuova' ? 0 : 1
      return pesoA - pesoB || b.creataIl.localeCompare(a.creataIl)
    })
  }, [dati, tipo, soloAperte])

  async function cambiaStato(richiesta: Richiesta, stato: StatoRichiesta) {
    const esito = await invia('/api/richieste', 'PATCH', { id: richiesta.id, stato })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(richiesta: Richiesta) {
    if (!conferma(`Eliminare la richiesta ${richiesta.codice}?`)) return
    const esito = await invia(`/api/richieste?id=${encodeURIComponent(richiesta.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Richieste"
        descrizione="Informazioni, test drive, finanziamenti, permute e preventivi."
        azione={
          <Bottone
            variante="contorno"
            misura="piccola"
            onClick={() =>
              esportaCsv(
                'richieste',
                (dati?.richieste ?? []).map((richiesta) => ({
                  codice: richiesta.codice,
                  tipo: richiesta.tipo,
                  cliente: `${richiesta.nome} ${richiesta.cognome}`,
                  telefono: richiesta.telefono,
                  email: richiesta.email,
                  veicolo: richiesta.veicoloTitolo,
                  stato: richiesta.stato,
                  ricevuta: richiesta.creataIl.slice(0, 10),
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

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setTipo('tutte')}
          aria-pressed={tipo === 'tutte'}
          className={classi(
            'rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors',
            tipo === 'tutte'
              ? 'border-accento bg-accento text-white'
              : 'border-bordo text-tenue hover:border-accento hover:text-accento',
          )}
        >
          Tutte
        </button>

        {TIPI_RICHIESTA.map((voce) => (
          <button
            key={voce}
            type="button"
            onClick={() => setTipo(voce)}
            aria-pressed={tipo === voce}
            className={classi(
              'rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors',
              tipo === voce
                ? 'border-accento bg-accento text-white'
                : 'border-bordo text-tenue hover:border-accento hover:text-accento',
            )}
          >
            {NOMI_TIPO_RICHIESTA[voce]}
          </button>
        ))}

        <label className="ml-auto flex items-center gap-2.5 text-[0.85rem] text-tenue">
          <input
            type="checkbox"
            checked={soloAperte}
            onChange={(evento) => setSoloAperte(evento.target.checked)}
            className="size-4 accent-[var(--accento)]"
          />
          Nascondi le chiuse
        </label>
      </div>

      {richieste.length === 0 ? (
        <Vuoto testo="Nessuna richiesta in questo elenco." />
      ) : (
        <div className="space-y-3">
          {richieste.map((richiesta) => (
            <article
              key={richiesta.id}
              className="rounded-ampio border border-bordo bg-superficie p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[14rem] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etichetta tono={TONI[richiesta.stato]}>{NOMI_STATO[richiesta.stato]}</Etichetta>
                    <Etichetta>{NOMI_TIPO_RICHIESTA[richiesta.tipo]}</Etichetta>
                    <span className="text-[0.8rem] text-tenue tabellare">
                      {richiesta.codice} · {dataBreve(richiesta.creataIl.slice(0, 10))}
                    </span>
                  </div>

                  <p className="mt-3 font-semibold">
                    {richiesta.nome} {richiesta.cognome}
                  </p>

                  <p className="mt-1 text-[0.88rem]">
                    <a href={`tel:${richiesta.telefono}`} className="text-accento sottolinea">
                      {richiesta.telefono}
                    </a>
                    <span className="mx-2 text-tenue">·</span>
                    <a href={`mailto:${richiesta.email}`} className="text-accento sottolinea">
                      {richiesta.email}
                    </a>
                  </p>

                  {richiesta.veicoloTitolo && (
                    <p className="mt-2 flex items-center gap-2 text-[0.88rem] text-tenue">
                      <Icona nome="auto" className="size-3.5" />
                      {richiesta.veicoloTitolo}
                    </p>
                  )}

                  {richiesta.data && (
                    <p className="mt-2 flex items-center gap-2 text-[0.88rem] text-tenue">
                      <Icona nome="calendario" className="size-3.5" />
                      Test drive richiesto per {dataBreve(richiesta.data)} alle {richiesta.ora}
                    </p>
                  )}

                  {richiesta.finanziamento && (
                    <p className="mt-2 flex items-center gap-2 text-[0.88rem] text-tenue tabellare">
                      <Icona nome="calcolatrice" className="size-3.5" />
                      {prezzo(richiesta.finanziamento.importo)} in{' '}
                      {richiesta.finanziamento.durataMesi} mesi · rata{' '}
                      {prezzo(Math.round(richiesta.finanziamento.rata))} · anticipo{' '}
                      {prezzo(richiesta.finanziamento.anticipo)}
                    </p>
                  )}

                  {richiesta.permuta && (
                    <p className="mt-2 flex items-center gap-2 text-[0.88rem] text-tenue">
                      <Icona nome="scambio" className="size-3.5" />
                      Permuta: {richiesta.permuta.marca} {richiesta.permuta.modello},{' '}
                      {richiesta.permuta.anno}, {richiesta.permuta.chilometri.toLocaleString('it-IT')} km
                    </p>
                  )}

                  {richiesta.messaggio && (
                    <p className="mt-3 rounded-tenue bg-superficie-alt px-3 py-2 text-[0.88rem] leading-relaxed text-tenue">
                      {richiesta.messaggio}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <label className="sr-only" htmlFor={`stato-ric-${richiesta.id}`}>
                    Stato della richiesta {richiesta.codice}
                  </label>
                  <select
                    id={`stato-ric-${richiesta.id}`}
                    value={richiesta.stato}
                    onChange={(evento) =>
                      cambiaStato(richiesta, evento.target.value as StatoRichiesta)
                    }
                    className="rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.85rem] focus:border-accento focus:outline-none"
                  >
                    {STATI_RICHIESTA.map((stato) => (
                      <option key={stato} value={stato}>
                        {NOMI_STATO[stato]}
                      </option>
                    ))}
                  </select>

                  <Azione
                    icona="cestino"
                    etichetta="Elimina"
                    tono="rosso"
                    onClick={() => elimina(richiesta)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
