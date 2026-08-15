'use client'

import { useState, type FormEvent } from 'react'
import {
  Azione,
  Caricamento,
  conferma,
  Errore,
  invia,
  TestataPagina,
  useRisorsa,
  Vuoto,
} from '@/componenti/admin/comuni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import { Stelle } from '@/componenti/ui/Stelle'
import type { Recensione } from '@/lib/tipi'
import { classi, dataEstesa, media, oggiIso } from '@/lib/utili'

/**
 * Recensioni.
 *
 * Si trascrivono a mano da Google e Facebook. La media che compare in home e
 * nei dati strutturati si calcola da quelle pubblicate: nasconderne una la
 * toglie anche dal conteggio, ed è giusto che sia così.
 */
export function GestioneRecensioni() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ recensioni: Recensione[] }>(
    '/api/recensioni',
  )
  const [inModifica, setInModifica] = useState<Recensione | 'nuova' | null>(null)
  const [avviso, setAvviso] = useState('')

  const recensioni = dati?.recensioni ?? []
  const pubblicate = recensioni.filter((recensione) => recensione.pubblicata)
  const valutazione = media(pubblicate.map((recensione) => recensione.voto))

  async function alterna(recensione: Recensione) {
    const esito = await invia('/api/recensioni', 'PATCH', {
      id: recensione.id,
      pubblicata: !recensione.pubblicata,
    })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(recensione: Recensione) {
    if (!conferma(`Eliminare la recensione di ${recensione.autore}?`)) return
    const esito = await invia(`/api/recensioni?id=${encodeURIComponent(recensione.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Recensioni"
        descrizione={`${pubblicate.length} pubblicate su ${recensioni.length} · media ${valutazione.toLocaleString('it-IT')}`}
        azione={
          <Bottone misura="piccola" onClick={() => setInModifica('nuova')}>
            <Icona nome="piu" className="size-4" />
            Nuova recensione
          </Bottone>
        }
      />

      <Errore testo={errore || avviso} onRiprova={ricarica} />

      {recensioni.length === 0 ? (
        <Vuoto testo="Nessuna recensione trascritta." />
      ) : (
        <div className="space-y-3">
          {recensioni.map((recensione) => (
            <article
              key={recensione.id}
              className={classi(
                'flex flex-wrap items-start justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5',
                !recensione.pubblicata && 'opacity-60',
              )}
            >
              <div className="min-w-[16rem] flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <Stelle voto={recensione.voto} />
                  <span className="font-semibold">{recensione.autore}</span>
                  <Etichetta>{recensione.fonte}</Etichetta>
                  <Etichetta>{recensione.servizio}</Etichetta>
                  {!recensione.pubblicata && <Etichetta tono="ambra">Nascosta</Etichetta>}
                </div>

                <p className="mt-3 text-[0.9rem] leading-relaxed text-tenue">«{recensione.testo}»</p>
                <p className="mt-2 text-[0.8rem] text-tenue">{dataEstesa(recensione.data)}</p>
              </div>

              <div className="flex gap-2">
                <Azione
                  icona={recensione.pubblicata ? 'occhio' : 'occhioBarrato'}
                  etichetta={recensione.pubblicata ? 'Nascondi' : 'Pubblica'}
                  onClick={() => alterna(recensione)}
                />
                <Azione
                  icona="matita"
                  etichetta="Modifica"
                  tono="accento"
                  onClick={() => setInModifica(recensione)}
                />
                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(recensione)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Finestra
        aperta={inModifica !== null}
        onChiudi={() => setInModifica(null)}
        titolo={inModifica === 'nuova' ? 'Nuova recensione' : 'Modifica recensione'}
      >
        {inModifica && (
          <ModuloRecensione
            recensione={inModifica === 'nuova' ? null : inModifica}
            onSalvata={async () => {
              setInModifica(null)
              await ricarica()
            }}
          />
        )}
      </Finestra>
    </>
  )
}

function ModuloRecensione({
  recensione,
  onSalvata,
}: {
  recensione: Recensione | null
  onSalvata: () => void | Promise<void>
}) {
  const [messaggio, setMessaggio] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)

  async function salva(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvataggio) return

    const modulo = new FormData(evento.currentTarget)
    setSalvataggio(true)
    setMessaggio('')

    const esito = await invia('/api/recensioni', recensione ? 'PUT' : 'POST', {
      id: recensione?.id,
      autore: modulo.get('autore'),
      testo: modulo.get('testo'),
      voto: Number(modulo.get('voto')),
      data: modulo.get('data'),
      fonte: modulo.get('fonte'),
      servizio: modulo.get('servizio'),
      pubblicata: modulo.get('pubblicata') === 'si',
    })

    setSalvataggio(false)

    if (!esito.ok) {
      setMessaggio(esito.errore)
      return
    }

    await onSalvata()
  }

  return (
    <form onSubmit={salva} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etichetta="Autore" name="autore" required defaultValue={recensione?.autore} />
        <Campo
          etichetta="Data"
          name="data"
          type="date"
          defaultValue={recensione?.data ?? oggiIso()}
        />
        <Scelta etichetta="Voto" name="voto" defaultValue={recensione?.voto ?? 5}>
          {[5, 4, 3, 2, 1].map((voto) => (
            <option key={voto} value={voto}>
              {voto} {voto === 1 ? 'stella' : 'stelle'}
            </option>
          ))}
        </Scelta>
        <Scelta etichetta="Fonte" name="fonte" defaultValue={recensione?.fonte ?? 'google'}>
          <option value="google">Google</option>
          <option value="facebook">Facebook</option>
          <option value="diretta">Diretta</option>
        </Scelta>
        <Scelta etichetta="Reparto" name="servizio" defaultValue={recensione?.servizio ?? 'vendita'}>
          <option value="vendita">Vendita</option>
          <option value="noleggio">Noleggio</option>
          <option value="detailing">Detailing</option>
          <option value="assistenza">Assistenza</option>
        </Scelta>
        <Scelta
          etichetta="Stato"
          name="pubblicata"
          defaultValue={recensione?.pubblicata === false ? 'no' : 'si'}
        >
          <option value="si">Pubblicata</option>
          <option value="no">Nascosta</option>
        </Scelta>
      </div>

      <Area
        etichetta="Testo"
        name="testo"
        rows={5}
        required
        minLength={10}
        defaultValue={recensione?.testo}
        nota="Trascrivete il testo così com’è, senza correzioni."
      />

      <Esito testo={messaggio} tipo="errore" />

      <Bottone type="submit" disabled={salvataggio}>
        {salvataggio ? 'Salvataggio…' : recensione ? 'Salva le modifiche' : 'Aggiungi la recensione'}
      </Bottone>
    </form>
  )
}
