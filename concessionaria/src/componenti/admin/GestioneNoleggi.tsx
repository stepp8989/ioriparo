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
  NOMI_METODO_PAGAMENTO,
  NOMI_STATO_NOLEGGIO,
  STATI_NOLEGGIO,
  type Noleggio,
  type StatoNoleggio,
} from '@/lib/tipi'
import { classi, dataBreve, oggiIso, prezzo } from '@/lib/utili'

/**
 * Gestione dei noleggi.
 *
 * L'ordinamento predefinito è per data di ritiro, non di prenotazione: quello
 * che serve sapere ogni mattina è chi passa a ritirare oggi, non chi ha
 * prenotato per primo.
 */

const FILTRI = [
  { chiave: 'attivi', nome: 'Attivi' },
  { chiave: 'oggi', nome: 'Oggi' },
  { chiave: 'tutti', nome: 'Tutti' },
] as const

type ChiaveFiltro = (typeof FILTRI)[number]['chiave']

const TONI: Record<StatoNoleggio, 'neutro' | 'accento' | 'verde' | 'ambra' | 'rosso'> = {
  'in-attesa': 'ambra',
  confermato: 'accento',
  'in-corso': 'verde',
  concluso: 'neutro',
  annullato: 'rosso',
}

export function GestioneNoleggi() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ noleggi: Noleggio[] }>('/api/noleggi')
  const [filtro, setFiltro] = useState<ChiaveFiltro>('attivi')
  const [avviso, setAvviso] = useState('')

  const oggi = oggiIso()

  const noleggi = useMemo(() => {
    const elenco = [...(dati?.noleggi ?? [])].sort((a, b) => a.dal.localeCompare(b.dal))

    if (filtro === 'attivi') {
      return elenco.filter((noleggio) =>
        ['in-attesa', 'confermato', 'in-corso'].includes(noleggio.stato),
      )
    }
    if (filtro === 'oggi') {
      return elenco.filter(
        (noleggio) => noleggio.stato !== 'annullato' && noleggio.dal <= oggi && noleggio.al >= oggi,
      )
    }
    return elenco
  }, [dati, filtro, oggi])

  async function cambiaStato(noleggio: Noleggio, stato: StatoNoleggio) {
    const esito = await invia('/api/noleggi', 'PATCH', { id: noleggio.id, stato })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function segnaPagato(noleggio: Noleggio) {
    const esito = await invia('/api/noleggi', 'PATCH', {
      id: noleggio.id,
      statoPagamento: noleggio.pagamento.stato === 'pagato' ? 'in-attesa' : 'pagato',
    })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(noleggio: Noleggio) {
    if (!conferma(`Eliminare il noleggio ${noleggio.codice}?`)) return
    const esito = await invia(`/api/noleggi?id=${encodeURIComponent(noleggio.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Noleggi"
        descrizione="Prenotazioni della flotta, ordinate per giorno di ritiro."
        azione={
          <Bottone
            variante="contorno"
            misura="piccola"
            onClick={() =>
              esportaCsv(
                'noleggi',
                (dati?.noleggi ?? []).map((noleggio) => ({
                  codice: noleggio.codice,
                  cliente: `${noleggio.nome} ${noleggio.cognome}`,
                  telefono: noleggio.telefono,
                  email: noleggio.email,
                  veicolo: noleggio.veicoloTitolo,
                  dal: noleggio.dal,
                  al: noleggio.al,
                  giorni: noleggio.giorni,
                  totale: noleggio.totale,
                  pagamento: noleggio.pagamento.stato,
                  stato: noleggio.stato,
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

      <div className="mb-6 flex gap-2" role="group" aria-label="Filtra i noleggi">
        {FILTRI.map((voce) => (
          <button
            key={voce.chiave}
            type="button"
            onClick={() => setFiltro(voce.chiave)}
            aria-pressed={filtro === voce.chiave}
            className={classi(
              'rounded-full border px-4 py-2 text-[0.85rem] font-medium transition-colors duration-300',
              filtro === voce.chiave
                ? 'border-accento bg-accento text-white'
                : 'border-bordo text-tenue hover:border-accento hover:text-accento',
            )}
          >
            {voce.nome}
          </button>
        ))}
      </div>

      {noleggi.length === 0 ? (
        <Vuoto testo="Nessun noleggio in questo elenco." />
      ) : (
        <div className="space-y-3">
          {noleggi.map((noleggio) => (
            <article
              key={noleggio.id}
              className="rounded-ampio border border-bordo bg-superficie p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-[14rem] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-titolo text-[0.95rem] font-semibold tabellare">
                      {noleggio.codice}
                    </span>
                    <Etichetta tono={TONI[noleggio.stato]}>
                      {NOMI_STATO_NOLEGGIO[noleggio.stato]}
                    </Etichetta>
                    <Etichetta tono={noleggio.pagamento.stato === 'pagato' ? 'verde' : 'neutro'}>
                      {NOMI_METODO_PAGAMENTO[noleggio.pagamento.metodo]} ·{' '}
                      {noleggio.pagamento.stato === 'pagato' ? 'pagato' : 'da incassare'}
                    </Etichetta>
                    {noleggio.consegnaDomicilio && <Etichetta tono="accento">A domicilio</Etichetta>}
                  </div>

                  <p className="mt-3 font-semibold">{noleggio.veicoloTitolo}</p>
                  <p className="mt-1 text-[0.88rem] text-tenue tabellare">
                    {dataBreve(noleggio.dal)} → {dataBreve(noleggio.al)} · {noleggio.giorni}{' '}
                    {noleggio.giorni === 1 ? 'giorno' : 'giorni'} · {prezzo(noleggio.totale)}
                    {noleggio.pagamento.importo > 0 &&
                      ` (acconto ${prezzo(noleggio.pagamento.importo)})`}
                  </p>

                  <p className="mt-3 text-[0.88rem]">
                    <span className="font-medium">
                      {noleggio.nome} {noleggio.cognome}
                    </span>
                    <span className="mx-2 text-tenue">·</span>
                    <a href={`tel:${noleggio.telefono}`} className="text-accento sottolinea">
                      {noleggio.telefono}
                    </a>
                    <span className="mx-2 text-tenue">·</span>
                    <a href={`mailto:${noleggio.email}`} className="text-accento sottolinea">
                      {noleggio.email}
                    </a>
                  </p>

                  {noleggio.consegnaDomicilio && noleggio.indirizzoConsegna && (
                    <p className="mt-2 flex items-start gap-2 text-[0.85rem] text-tenue">
                      <Icona nome="posizione" className="mt-0.5 size-3.5 shrink-0" />
                      {noleggio.indirizzoConsegna}
                    </p>
                  )}

                  {noleggio.note && (
                    <p className="mt-2 rounded-tenue bg-superficie-alt px-3 py-2 text-[0.85rem] text-tenue">
                      {noleggio.note}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <label className="sr-only" htmlFor={`stato-${noleggio.id}`}>
                    Stato del noleggio {noleggio.codice}
                  </label>
                  <select
                    id={`stato-${noleggio.id}`}
                    value={noleggio.stato}
                    onChange={(evento) =>
                      cambiaStato(noleggio, evento.target.value as StatoNoleggio)
                    }
                    className="rounded-full border border-bordo bg-superficie px-4 py-2 text-[0.85rem] focus:border-accento focus:outline-none"
                  >
                    {STATI_NOLEGGIO.map((stato) => (
                      <option key={stato} value={stato}>
                        {NOMI_STATO_NOLEGGIO[stato]}
                      </option>
                    ))}
                  </select>

                  <div className="flex gap-2">
                    <Azione
                      icona="euro"
                      etichetta={
                        noleggio.pagamento.stato === 'pagato'
                          ? 'Segna come da incassare'
                          : 'Segna come pagato'
                      }
                      attivo={noleggio.pagamento.stato === 'pagato'}
                      onClick={() => segnaPagato(noleggio)}
                    />
                    <Azione
                      icona="cestino"
                      etichetta="Elimina"
                      tono="rosso"
                      onClick={() => elimina(noleggio)}
                    />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  )
}
