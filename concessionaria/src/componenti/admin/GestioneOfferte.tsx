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
import { Area, Campo, Esito } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import type { Offerta } from '@/lib/tipi'
import { classi, dataEstesa, fraGiorni, oggiIso } from '@/lib/utili'

/**
 * Promozioni mostrate in home.
 *
 * Un'offerta scaduta smette di comparire sul sito da sola, ma resta qui
 * segnata come tale: serve a ricordarsi cosa si è già proposto e a ripescarla
 * l'anno dopo cambiando solo la data.
 */
export function GestioneOfferte() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ offerte: Offerta[] }>('/api/offerte')
  const [inModifica, setInModifica] = useState<Offerta | 'nuova' | null>(null)
  const [avviso, setAvviso] = useState('')

  const offerte = dati?.offerte ?? []
  const oggi = oggiIso()

  async function alterna(offerta: Offerta) {
    const esito = await invia('/api/offerte', 'PATCH', {
      id: offerta.id,
      attiva: !offerta.attiva,
    })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(offerta: Offerta) {
    if (!conferma(`Eliminare l’offerta «${offerta.titolo}»?`)) return
    const esito = await invia(`/api/offerte?id=${encodeURIComponent(offerta.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Offerte"
        descrizione="Promozioni in home. Alla scadenza spariscono dal sito senza bisogno di toccarle."
        azione={
          <Bottone misura="piccola" onClick={() => setInModifica('nuova')}>
            <Icona nome="piu" className="size-4" />
            Nuova offerta
          </Bottone>
        }
      />

      <Errore testo={errore || avviso} onRiprova={ricarica} />

      {offerte.length === 0 ? (
        <Vuoto testo="Nessuna offerta creata." />
      ) : (
        <div className="space-y-3">
          {offerte.map((offerta) => {
            const scaduta = offerta.scadenza < oggi

            return (
              <article
                key={offerta.id}
                className={classi(
                  'flex flex-wrap items-start justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5',
                  (!offerta.attiva || scaduta) && 'opacity-60',
                )}
              >
                <div className="min-w-[16rem] flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Etichetta tono="accento">{offerta.etichetta}</Etichetta>
                    {scaduta ? (
                      <Etichetta tono="rosso">Scaduta</Etichetta>
                    ) : offerta.attiva ? (
                      <Etichetta tono="verde">Attiva</Etichetta>
                    ) : (
                      <Etichetta tono="ambra">Disattivata</Etichetta>
                    )}
                  </div>

                  <h2 className="mt-3 font-semibold">{offerta.titolo}</h2>
                  <p className="mt-0.5 text-[0.88rem] font-medium text-accento">
                    {offerta.sottotitolo}
                  </p>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">
                    {offerta.descrizione}
                  </p>
                  <p className="mt-2 text-[0.8rem] text-tenue">
                    Valida fino al {dataEstesa(offerta.scadenza)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Azione
                    icona={offerta.attiva ? 'occhio' : 'occhioBarrato'}
                    etichetta={offerta.attiva ? 'Disattiva' : 'Attiva'}
                    onClick={() => alterna(offerta)}
                  />
                  <Azione
                    icona="matita"
                    etichetta="Modifica"
                    tono="accento"
                    onClick={() => setInModifica(offerta)}
                  />
                  <Azione
                    icona="cestino"
                    etichetta="Elimina"
                    tono="rosso"
                    onClick={() => elimina(offerta)}
                  />
                </div>
              </article>
            )
          })}
        </div>
      )}

      <Finestra
        aperta={inModifica !== null}
        onChiudi={() => setInModifica(null)}
        titolo={inModifica === 'nuova' ? 'Nuova offerta' : 'Modifica offerta'}
      >
        {inModifica && (
          <ModuloOfferta
            offerta={inModifica === 'nuova' ? null : inModifica}
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

function ModuloOfferta({
  offerta,
  onSalvata,
}: {
  offerta: Offerta | null
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

    const esito = await invia('/api/offerte', offerta ? 'PUT' : 'POST', {
      id: offerta?.id,
      titolo: modulo.get('titolo'),
      sottotitolo: modulo.get('sottotitolo'),
      descrizione: modulo.get('descrizione'),
      etichetta: modulo.get('etichetta'),
      scadenza: modulo.get('scadenza'),
      immagine: modulo.get('immagine'),
      attiva: modulo.get('attiva') === 'si',
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
      <Campo etichetta="Titolo" name="titolo" required defaultValue={offerta?.titolo} />
      <Campo
        etichetta="Sottotitolo"
        name="sottotitolo"
        defaultValue={offerta?.sottotitolo}
        nota="La riga che spiega la promozione in poche parole."
      />

      <Area
        etichetta="Descrizione"
        name="descrizione"
        rows={4}
        defaultValue={offerta?.descrizione}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Campo
          etichetta="Etichetta"
          name="etichetta"
          defaultValue={offerta?.etichetta ?? 'Promozione'}
          nota="Vendita, Noleggio, Finanziamento…"
        />
        <Campo
          etichetta="Scadenza"
          name="scadenza"
          type="date"
          min={oggiIso()}
          defaultValue={offerta?.scadenza ?? fraGiorni(30)}
        />
        <Campo
          etichetta="Immagine"
          name="immagine"
          defaultValue={offerta?.immagine ?? '/immagini/offerte/ceramica-omaggio.jpg'}
          className="sm:col-span-2"
        />
      </div>

      <Esito testo={messaggio} tipo="errore" />

      <div className="flex items-center gap-4">
        <Bottone type="submit" disabled={salvataggio}>
          {salvataggio ? 'Salvataggio…' : offerta ? 'Salva le modifiche' : 'Crea l’offerta'}
        </Bottone>

        <label className="flex items-center gap-2.5 text-[0.88rem] text-tenue">
          <input
            type="checkbox"
            name="attiva"
            value="si"
            defaultChecked={offerta ? offerta.attiva : true}
            className="size-4 accent-[var(--accento)]"
          />
          Attiva subito
        </label>
      </div>
    </form>
  )
}
