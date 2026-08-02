'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'
import {
  Avviso,
  CampoArea,
  CampoScelta,
  CampoTesto,
  Etichetta,
  Interruttore,
  Pulsante,
  TestataPagina,
} from '@/componenti/admin/campi'
import { SceltaImmagine } from '@/componenti/admin/SceltaImmagine'
import { EtichettaPiatto } from '@/componenti/menu/SchedaPiatto'
import { Icona } from '@/componenti/ui/Icona'
import { ALLERGENI, CATEGORIE, NOMI_CATEGORIA, type Categoria, type Piatto } from '@/lib/tipi'
import { classi, prezzo } from '@/lib/utili'

/** Piatto vuoto usato quando si preme «Nuovo piatto». */
function piattoVuoto(): Piatto {
  return {
    id: '',
    nome: '',
    descrizione: '',
    prezzo: 0,
    categoria: 'antipasti',
    allergeni: [],
    etichetta: null,
    immagine: '',
    visibile: true,
    inEvidenza: false,
    ordine: 99,
  }
}

/**
 * Gestione del menù.
 *
 * A sinistra l'elenco filtrabile, a destra la scheda del piatto selezionato.
 * Dopo ogni salvataggio si chiama `router.refresh()`: il server rilegge
 * l'archivio e rimanda i dati aggiornati, quindi l'elenco resta allineato
 * senza tenere una copia parallela dei piatti nel browser.
 */
export function GestioneMenu({ piatti }: { piatti: Piatto[] }) {
  const router = useRouter()
  const [selezionato, setSelezionato] = useState<Piatto | null>(null)
  const [bozza, setBozza] = useState<Piatto | null>(null)
  const [filtro, setFiltro] = useState<Categoria | 'tutti'>('tutti')
  const [ricerca, setRicerca] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)
  const [avviso, setAvviso] = useState<{ tipo: 'ok' | 'errore'; testo: string }>({
    tipo: 'ok',
    testo: '',
  })

  const visibili = useMemo(() => {
    const cercato = ricerca.trim().toLowerCase()
    return piatti
      .filter((piatto) => filtro === 'tutti' || piatto.categoria === filtro)
      .filter((piatto) => !cercato || piatto.nome.toLowerCase().includes(cercato))
      .sort((primo, secondo) => {
        const differenza = CATEGORIE.indexOf(primo.categoria) - CATEGORIE.indexOf(secondo.categoria)
        return differenza !== 0 ? differenza : primo.ordine - secondo.ordine
      })
  }, [piatti, filtro, ricerca])

  function apri(piatto: Piatto | null) {
    setAvviso({ tipo: 'ok', testo: '' })
    setSelezionato(piatto)
    setBozza(piatto ? { ...piatto, allergeni: [...piatto.allergeni] } : piattoVuoto())
  }

  function chiudi() {
    setSelezionato(null)
    setBozza(null)
  }

  async function salva() {
    if (!bozza) return

    if (bozza.nome.trim().length < 2) {
      setAvviso({ tipo: 'errore', testo: 'Il nome del piatto è obbligatorio.' })
      return
    }

    setSalvataggio(true)
    try {
      const nuovo = !selezionato
      const risposta = await fetch('/api/menu', {
        method: nuovo ? 'POST' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bozza),
      })
      const dati = await risposta.json()
      if (!risposta.ok) throw new Error(dati.errore ?? 'Salvataggio non riuscito.')

      setAvviso({ tipo: 'ok', testo: nuovo ? 'Piatto aggiunto.' : 'Modifiche salvate.' })
      chiudi()
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Salvataggio non riuscito.',
      })
    } finally {
      setSalvataggio(false)
    }
  }

  async function elimina(piatto: Piatto) {
    if (!confirm(`Eliminare «${piatto.nome}» dal menù? L’operazione non si può annullare.`)) return

    try {
      const risposta = await fetch(`/api/menu?id=${encodeURIComponent(piatto.id)}`, {
        method: 'DELETE',
      })
      if (!risposta.ok) throw new Error('Eliminazione non riuscita.')

      setAvviso({ tipo: 'ok', testo: 'Piatto eliminato.' })
      chiudi()
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Eliminazione non riuscita.',
      })
    }
  }

  /** Cambio rapido di visibilità dall'elenco, senza aprire la scheda. */
  async function alternaVisibilita(piatto: Piatto) {
    await fetch('/api/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...piatto, visibile: !piatto.visibile }),
    })
    router.refresh()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <TestataPagina
        titolo="Menù"
        descrizione={`${piatti.length} piatti in archivio, ${piatti.filter((voce) => voce.visibile).length} visibili sul sito.`}
        azione={
          <Pulsante icona="piu" onClick={() => apri(null)}>
            Nuovo piatto
          </Pulsante>
        }
      />

      <Avviso tipo={avviso.tipo} testo={avviso.testo} />

      {/* Filtri */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <Icona
            nome="cerca"
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-tenue"
          />
          <input
            type="search"
            value={ricerca}
            onChange={(evento) => setRicerca(evento.target.value)}
            placeholder="Cerca un piatto"
            aria-label="Cerca un piatto"
            className="w-full border border-bordo bg-superficie py-2.5 pr-3.5 pl-9 text-sm transition-colors focus:border-accento focus:outline-none"
          />
        </div>

        <select
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value as Categoria | 'tutti')}
          aria-label="Filtra per categoria"
          className="border border-bordo bg-superficie px-3.5 py-2.5 text-sm transition-colors focus:border-accento focus:outline-none"
        >
          <option value="tutti">Tutte le categorie</option>
          {CATEGORIE.map((categoria) => (
            <option key={categoria} value={categoria}>
              {NOMI_CATEGORIA[categoria]}
            </option>
          ))}
        </select>
      </div>

      {/* Elenco */}
      <div className="border border-bordo bg-superficie">
        {visibili.length === 0 ? (
          <p className="py-16 text-center text-sm text-tenue">Nessun piatto trovato.</p>
        ) : (
          <ul className="divide-y divide-bordo">
            {visibili.map((piatto) => (
              <li
                key={piatto.id}
                className={classi(
                  'flex items-center gap-4 px-4 py-3 transition-colors hover:bg-superficie-alt',
                  !piatto.visibile && 'opacity-55',
                )}
              >
                <div className="relative size-12 shrink-0 overflow-hidden bg-superficie-alt">
                  {piatto.immagine && (
                    <Image src={piatto.immagine} alt="" fill sizes="3rem" className="object-cover" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium">{piatto.nome}</span>
                    {piatto.etichetta && <EtichettaPiatto tipo={piatto.etichetta} />}
                    {piatto.inEvidenza && (
                      <span className="text-[0.6rem] uppercase tracking-[0.14em] text-accento">
                        in home
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate text-xs text-tenue">
                    {NOMI_CATEGORIA[piatto.categoria]} · {piatto.descrizione}
                  </p>
                </div>

                <span className="shrink-0 font-titolo text-lg text-accento">
                  {prezzo(piatto.prezzo)}
                </span>

                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => alternaVisibilita(piatto)}
                    title={piatto.visibile ? 'Nascondi dal sito' : 'Mostra sul sito'}
                    aria-label={piatto.visibile ? 'Nascondi dal sito' : 'Mostra sul sito'}
                    className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
                  >
                    <Icona nome={piatto.visibile ? 'spunta' : 'meno'} className="size-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => apri(piatto)}
                    aria-label={`Modifica ${piatto.nome}`}
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

      {/* Scheda di modifica */}
      {bozza && (
        <div className="fixed inset-0 z-50 flex justify-end bg-notte/50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0"
            onClick={chiudi}
            aria-hidden
          />

          <div className="relative flex h-full w-full max-w-xl flex-col overflow-y-auto border-l border-bordo bg-sfondo">
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-bordo bg-sfondo px-6 py-4">
              <h2 className="font-titolo text-2xl">
                {selezionato ? 'Modifica piatto' : 'Nuovo piatto'}
              </h2>
              <button
                type="button"
                onClick={chiudi}
                aria-label="Chiudi la scheda"
                className="grid size-9 place-items-center text-tenue transition-colors hover:text-accento"
              >
                <Icona nome="chiudi" className="size-5" />
              </button>
            </header>

            <div className="flex-1 space-y-5 px-6 py-6">
              <CampoTesto
                id="piatto-nome"
                etichetta="Nome"
                obbligatorio
                valore={bozza.nome}
                onChange={(valore) => setBozza({ ...bozza, nome: valore })}
              />

              <CampoArea
                id="piatto-descrizione"
                etichetta="Descrizione"
                massimo={400}
                valore={bozza.descrizione}
                onChange={(valore) => setBozza({ ...bozza, descrizione: valore })}
              />

              <div className="grid gap-5 sm:grid-cols-3">
                <CampoTesto
                  id="piatto-prezzo"
                  etichetta="Prezzo (€)"
                  tipo="number"
                  min={0}
                  step={0.5}
                  valore={bozza.prezzo}
                  onChange={(valore) => setBozza({ ...bozza, prezzo: Number(valore) })}
                />

                <CampoScelta
                  id="piatto-categoria"
                  etichetta="Categoria"
                  valore={bozza.categoria}
                  onChange={(valore) => setBozza({ ...bozza, categoria: valore })}
                  opzioni={CATEGORIE.map((categoria) => ({
                    valore: categoria,
                    nome: NOMI_CATEGORIA[categoria],
                  }))}
                />

                <CampoTesto
                  id="piatto-ordine"
                  etichetta="Ordine"
                  tipo="number"
                  min={0}
                  max={999}
                  valore={bozza.ordine}
                  onChange={(valore) => setBozza({ ...bozza, ordine: Number(valore) })}
                  suggerimento="Numeri bassi prima"
                />
              </div>

              <CampoScelta
                id="piatto-etichetta"
                etichetta="Etichetta"
                valore={bozza.etichetta ?? ''}
                onChange={(valore) =>
                  setBozza({ ...bozza, etichetta: valore === '' ? null : (valore as 'novita') })
                }
                opzioni={[
                  { valore: '', nome: 'Nessuna' },
                  { valore: 'novita', nome: 'Novità' },
                  { valore: 'consigliato', nome: 'Consigliato' },
                ]}
              />

              <SceltaImmagine
                id="piatto-immagine"
                valore={bozza.immagine}
                onChange={(percorso) => setBozza({ ...bozza, immagine: percorso })}
              />

              {/* Allergeni */}
              <fieldset>
                <Etichetta htmlFor="allergeni">Allergeni</Etichetta>
                <div id="allergeni" className="flex flex-wrap gap-2">
                  {ALLERGENI.map((allergene) => {
                    const attivo = bozza.allergeni.includes(allergene)
                    return (
                      <button
                        key={allergene}
                        type="button"
                        aria-pressed={attivo}
                        onClick={() =>
                          setBozza({
                            ...bozza,
                            allergeni: attivo
                              ? bozza.allergeni.filter((voce) => voce !== allergene)
                              : [...bozza.allergeni, allergene],
                          })
                        }
                        className={classi(
                          'border px-3 py-1.5 text-xs capitalize transition-colors',
                          attivo
                            ? 'border-accento bg-accento text-white scuro:text-notte'
                            : 'border-bordo text-tenue hover:border-accento hover:text-accento',
                        )}
                      >
                        {allergene}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <div className="space-y-3 border-t border-bordo pt-5">
                <Interruttore
                  etichetta="Visibile sul sito"
                  descrizione="Se spento il piatto resta in archivio ma sparisce dalla carta."
                  attivo={bozza.visibile}
                  onChange={(valore) => setBozza({ ...bozza, visibile: valore })}
                />
                <Interruttore
                  etichetta="In evidenza in home"
                  descrizione="Compare nella sezione «I piatti più richiesti»."
                  attivo={bozza.inEvidenza}
                  onChange={(valore) => setBozza({ ...bozza, inEvidenza: valore })}
                />
              </div>
            </div>

            <footer className="sticky bottom-0 flex items-center gap-3 border-t border-bordo bg-sfondo px-6 py-4">
              <Pulsante onClick={salva} disabled={salvataggio} icona="spunta">
                {salvataggio ? 'Salvataggio…' : 'Salva'}
              </Pulsante>

              <Pulsante variante="contorno" onClick={chiudi}>
                Annulla
              </Pulsante>

              {selezionato && (
                <Pulsante
                  variante="pericolo"
                  icona="cestino"
                  className="ml-auto"
                  onClick={() => elimina(selezionato)}
                >
                  Elimina
                </Pulsante>
              )}
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}
