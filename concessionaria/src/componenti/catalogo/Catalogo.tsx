'use client'

import { useEffect, useMemo, useState } from 'react'
import { SchedaVeicolo } from '@/componenti/veicoli/SchedaVeicolo'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Cursore, GruppoScelte, Scelta, Spunta } from '@/componenti/ui/campi'
import {
  aiParametri,
  applicaFiltri,
  filtriAttivi,
  FILTRI_VUOTI,
  NOMI_ORDINE,
  opzioniFiltri,
  ORDINI,
  type Filtri,
} from '@/lib/catalogo'
import {
  NOMI_ALIMENTAZIONE,
  NOMI_CAMBIO,
  NOMI_CONDIZIONE,
  NOMI_TIPOLOGIA,
  NOMI_TIPO_VEICOLO,
  TIPI_VEICOLO,
  type Veicolo,
} from '@/lib/tipi'
import { classi, numero, prezzo } from '@/lib/utili'

/**
 * Catalogo con ricerca e filtri.
 *
 * Il filtraggio avviene qui, nel browser: il catalogo di una concessionaria è
 * di qualche decina di veicoli, quindi mandarli tutti una volta sola e filtrare
 * in locale dà risultati immediati a ogni tocco, senza una richiesta per ogni
 * spunta. Il giorno in cui i veicoli fossero migliaia converrebbe l'opposto —
 * filtrare sul server e paginare — e `lib/catalogo.ts` è già scritto per
 * funzionare da entrambe le parti.
 *
 * I filtri restano scritti nell'indirizzo, così una ricerca si può salvare fra
 * i preferiti o mandare a qualcuno.
 */

/** Quanti veicoli si mostrano prima di chiedere «Mostra altri». */
const PASSO = 9

export function Catalogo({
  veicoli,
  filtriIniziali,
}: {
  veicoli: Veicolo[]
  filtriIniziali: Filtri
}) {
  const [filtri, setFiltri] = useState<Filtri>(filtriIniziali)
  const [mostrati, setMostrati] = useState(PASSO)
  const [pannelloAperto, setPannelloAperto] = useState(false)

  const opzioni = useMemo(() => opzioniFiltri(veicoli, filtri), [veicoli, filtri])
  const risultati = useMemo(() => applicaFiltri(veicoli, filtri), [veicoli, filtri])
  const attivi = filtriAttivi(filtri)

  /**
   * L'indirizzo si aggiorna con `replaceState` invece che con il router: qui
   * non serve una nuova richiesta al server — i dati sono già tutti nel
   * browser — e la cronologia non deve riempirsi di una voce per ogni spunta.
   */
  useEffect(() => {
    const parametri = aiParametri(filtri).toString()
    window.history.replaceState(null, '', parametri ? `/catalogo?${parametri}` : '/catalogo')
  }, [filtri])

  // Cambiando i filtri si torna alla prima pagina di risultati: restare a
  // «mostrati: 36» dopo aver ristretto la ricerca non avrebbe senso.
  useEffect(() => setMostrati(PASSO), [filtri])

  function aggiorna(modifica: Partial<Filtri>) {
    setFiltri((precedenti) => ({ ...precedenti, ...modifica }))
  }

  const pannello = (
    <div className="space-y-8">
      <Scelta
        etichetta="Marca"
        value={filtri.marca}
        onChange={(evento) => aggiorna({ marca: evento.target.value, modello: '' })}
      >
        <option value="">Tutte le marche</option>
        {opzioni.marche.map((marca) => (
          <option key={marca} value={marca}>
            {marca}
          </option>
        ))}
      </Scelta>

      {opzioni.modelli.length > 0 && (
        <Scelta
          etichetta="Modello"
          value={filtri.modello}
          onChange={(evento) => aggiorna({ modello: evento.target.value })}
        >
          <option value="">Tutti i modelli</option>
          {opzioni.modelli.map((modello) => (
            <option key={modello} value={modello}>
              {modello}
            </option>
          ))}
        </Scelta>
      )}

      <GruppoScelte
        etichetta="Condizione"
        voci={opzioni.condizioni.map((valore) => ({ valore, nome: NOMI_CONDIZIONE[valore] }))}
        selezionate={filtri.condizione}
        onCambia={(condizione) => aggiorna({ condizione })}
      />

      <GruppoScelte
        etichetta="Alimentazione"
        voci={opzioni.alimentazioni.map((valore) => ({ valore, nome: NOMI_ALIMENTAZIONE[valore] }))}
        selezionate={filtri.alimentazione}
        onCambia={(alimentazione) => aggiorna({ alimentazione })}
      />

      <GruppoScelte
        etichetta="Cambio"
        voci={opzioni.cambi.map((valore) => ({ valore, nome: NOMI_CAMBIO[valore] }))}
        selezionate={filtri.cambio}
        onCambia={(cambio) => aggiorna({ cambio })}
      />

      <GruppoScelte
        etichetta="Tipologia"
        voci={opzioni.tipologie.map((valore) => ({ valore, nome: NOMI_TIPOLOGIA[valore] }))}
        selezionate={filtri.tipologia}
        onCambia={(tipologia) => aggiorna({ tipologia })}
      />

      <Cursore
        etichetta="Prezzo massimo"
        valore={filtri.prezzoMax}
        minimo={Math.floor(opzioni.prezzoMinimo / 1000) * 1000}
        massimo={Math.ceil(opzioni.prezzoMassimo / 1000) * 1000}
        passo={500}
        formato={(valore) => prezzo(valore)}
        onCambia={(prezzoMax) => aggiorna({ prezzoMax })}
      />

      <Cursore
        etichetta="Chilometri massimi"
        valore={filtri.kmMax}
        minimo={0}
        massimo={Math.max(10_000, Math.ceil(opzioni.kmMassimo / 5000) * 5000)}
        passo={2500}
        formato={(valore) => `${numero(valore)} km`}
        onCambia={(kmMax) => aggiorna({ kmMax })}
      />

      <Cursore
        etichetta="Immatricolazione da"
        valore={filtri.annoMin}
        minimo={opzioni.annoMinimo}
        massimo={new Date().getFullYear()}
        passo={1}
        formato={(valore) => String(valore)}
        onCambia={(annoMin) => aggiorna({ annoMin })}
      />

      <Cursore
        etichetta="Potenza minima"
        valore={filtri.potenzaMin}
        minimo={0}
        massimo={Math.ceil(opzioni.potenzaMassima / 10) * 10}
        passo={10}
        formato={(valore) => `${valore} CV`}
        onCambia={(potenzaMin) => aggiorna({ potenzaMin })}
      />

      <Spunta
        etichetta="Solo veicoli disponibili anche a noleggio"
        checked={filtri.soloNoleggio}
        onChange={(evento) => aggiorna({ soloNoleggio: evento.target.checked })}
      />

      {attivi > 0 && (
        <Bottone
          variante="contorno"
          misura="piccola"
          className="w-full"
          onClick={() => setFiltri({ ...FILTRI_VUOTI, tipo: filtri.tipo })}
        >
          <Icona nome="chiudi" className="size-3.5" />
          Azzera i filtri
        </Bottone>
      )}
    </div>
  )

  return (
    <div className="contenitore pb-24">
      {/* Barra di ricerca e tipo veicolo */}
      <div className="vetro sticky top-20 z-30 -mx-2 rounded-ampio p-4 shadow-morbida sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <label htmlFor="ricerca-catalogo" className="sr-only">
              Cerca fra i veicoli
            </label>
            <Icona
              nome="cerca"
              className="pointer-events-none absolute top-1/2 left-4 size-[1.05rem] -translate-y-1/2 text-tenue"
            />
            <input
              id="ricerca-catalogo"
              type="search"
              value={filtri.testo}
              onChange={(evento) => aggiorna({ testo: evento.target.value })}
              placeholder="Marca, modello, «suv automatico 30000»…"
              className="w-full rounded-full border border-bordo bg-superficie py-3 pr-4 pl-11 text-[0.95rem] focus:border-accento focus:outline-none"
            />
          </div>

          <div className="flex gap-2">
            <div
              className="flex rounded-full border border-bordo p-1"
              role="group"
              aria-label="Tipo di veicolo"
            >
              {(['tutti', ...TIPI_VEICOLO] as const).map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => aggiorna({ tipo, marca: '', modello: '', tipologia: [] })}
                  aria-pressed={filtri.tipo === tipo}
                  className={classi(
                    'rounded-full px-4 py-2 text-[0.85rem] font-medium transition-colors duration-300',
                    filtri.tipo === tipo
                      ? 'bg-accento text-white'
                      : 'text-tenue hover:text-accento',
                  )}
                >
                  {tipo === 'tutti' ? 'Tutti' : NOMI_TIPO_VEICOLO[tipo]}
                </button>
              ))}
            </div>

            <label htmlFor="ordine-catalogo" className="sr-only">
              Ordina i risultati
            </label>
            <div className="relative flex-1 lg:flex-none">
              <select
                id="ordine-catalogo"
                value={filtri.ordine}
                onChange={(evento) =>
                  aggiorna({ ordine: evento.target.value as Filtri['ordine'] })
                }
                className="w-full appearance-none rounded-full border border-bordo bg-superficie py-3 pr-10 pl-4 text-[0.85rem] focus:border-accento focus:outline-none"
              >
                {ORDINI.map((ordine) => (
                  <option key={ordine} value={ordine}>
                    {NOMI_ORDINE[ordine]}
                  </option>
                ))}
              </select>
              <Icona
                nome="chevron"
                className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-tenue"
              />
            </div>

            <button
              type="button"
              onClick={() => setPannelloAperto(true)}
              className="inline-flex items-center gap-2 rounded-full border border-bordo px-4 py-3 text-[0.85rem] font-medium transition-colors hover:border-accento hover:text-accento lg:hidden"
            >
              <Icona nome="filtro" className="size-4" />
              Filtri
              {attivi > 0 && (
                <span className="inline-flex size-5 items-center justify-center rounded-full bg-accento text-[0.7rem] text-white">
                  {attivi}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[17rem_1fr] lg:gap-12">
        {/* Filtri: colonna fissa su schermi larghi. */}
        <aside className="hidden lg:block">
          <div className="sticky top-44 max-h-[calc(100vh-13rem)] overflow-y-auto pr-2 pb-6">
            <h2 className="mb-6 flex items-center gap-2 text-[0.75rem] font-semibold tracking-[0.2em] text-tenue uppercase">
              <Icona nome="filtro" className="size-4" />
              Filtri
            </h2>
            {pannello}
          </div>
        </aside>

        <div>
          <p className="mb-6 text-[0.9rem] text-tenue" role="status">
            <span className="font-semibold text-testo">{risultati.length}</span>{' '}
            {risultati.length === 1 ? 'veicolo trovato' : 'veicoli trovati'}
            {attivi > 0 && ` · ${attivi} ${attivi === 1 ? 'filtro attivo' : 'filtri attivi'}`}
          </p>

          {risultati.length === 0 ? (
            <div className="rounded-ampio border border-dashed border-bordo-forte p-12 text-center">
              <Icona nome="cerca" className="mx-auto size-8 text-tenue/50" />
              <h3 className="mt-5 font-titolo text-[1.2rem] font-semibold">
                Nessun veicolo con questi criteri
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[0.92rem] text-tenue">
                Provate ad allargare la ricerca. Se cercate un modello che non abbiamo in piazzale,
                possiamo procurarvelo: ditecelo e ve lo troviamo.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Bottone variante="contorno" onClick={() => setFiltri(FILTRI_VUOTI)}>
                  Azzera i filtri
                </Bottone>
                <Bottone href="/contatti#preventivo">Cercatelo per me</Bottone>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {risultati.slice(0, mostrati).map((veicolo, indice) => (
                  <SchedaVeicolo key={veicolo.id} veicolo={veicolo} priorita={indice < 3} />
                ))}
              </div>

              {mostrati < risultati.length && (
                <div className="mt-12 text-center">
                  <Bottone
                    variante="contorno"
                    misura="grande"
                    onClick={() => setMostrati((precedenti) => precedenti + PASSO)}
                  >
                    Mostra altri {Math.min(PASSO, risultati.length - mostrati)} veicoli
                    <Icona nome="frecciaGiu" className="size-4" />
                  </Bottone>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filtri come pannello laterale su schermo stretto. */}
      <div
        className={classi('fixed inset-0 z-[60] lg:hidden', !pannelloAperto && 'pointer-events-none')}
        aria-hidden={!pannelloAperto}
      >
        <button
          type="button"
          tabIndex={pannelloAperto ? 0 : -1}
          onClick={() => setPannelloAperto(false)}
          className={classi(
            'absolute inset-0 bg-notte/70 backdrop-blur-sm transition-opacity duration-400',
            pannelloAperto ? 'opacity-100' : 'opacity-0',
          )}
          aria-label="Chiudi i filtri"
        />

        <div
          className={classi(
            'absolute inset-y-0 left-0 flex w-full max-w-sm flex-col bg-sfondo shadow-rilievo transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
            pannelloAperto ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between border-b border-bordo px-6 py-5">
            <h2 className="font-titolo text-[1.1rem] font-semibold">Filtri</h2>
            <button
              type="button"
              tabIndex={pannelloAperto ? 0 : -1}
              onClick={() => setPannelloAperto(false)}
              className="inline-flex size-10 items-center justify-center rounded-full border border-bordo transition-colors hover:border-accento hover:text-accento"
              aria-label="Chiudi i filtri"
            >
              <Icona nome="chiudi" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">{pannello}</div>

          <div className="border-t border-bordo px-6 py-5">
            <Bottone
              className="w-full"
              tabIndex={pannelloAperto ? 0 : -1}
              onClick={() => setPannelloAperto(false)}
            >
              Mostra {risultati.length} {risultati.length === 1 ? 'veicolo' : 'veicoli'}
            </Bottone>
          </div>
        </div>
      </div>
    </div>
  )
}
