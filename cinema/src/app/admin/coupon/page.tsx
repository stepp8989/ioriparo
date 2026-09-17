'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo, Scelta } from '@/componenti/ui/campi'
import type { Coupon } from '@/lib/tipi'
import { dataBreve, oggiIso, percentuale, prezzoPieno, sommaGiorni } from '@/lib/utili'

/**
 * Coupon.
 *
 * La differenza con le promozioni non è nominale: una promozione è una regola
 * che vale finché è attiva, un coupon è un codice che si consuma. Per un gesto
 * commerciale — una sala guasta, un disservizio, ottanta persone da
 * risarcire — serve il secondo, e serve poterne generare ottanta in una volta.
 */
export default function PaginaCouponAdmin() {
  const { mostra } = useAvvisi()

  const [voci, setVoci] = useState<Coupon[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cerca, setCerca] = useState('')
  const [modulo, setModulo] = useState(false)
  const [generati, setGenerati] = useState<Coupon[]>([])

  const [dati, setDati] = useState({
    quantita: 1,
    tipo: 'fisso' as 'fisso' | 'percentuale',
    valore: 5,
    descrizione: '',
    codice: '',
    scadenza: sommaGiorni(oggiIso(), 90),
  })
  const [inCorso, setInCorso] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch('/api/admin/coupon', { cache: 'no-store' })
      const esito = (await risposta.json()) as { voci: Coupon[] }
      setVoci(esito.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  async function genera() {
    setInCorso(true)
    try {
      const risposta = await fetch('/api/admin/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dati),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Generazione non riuscita.', 'errore')
        return
      }

      setGenerati(esito.coupon as Coupon[])
      setModulo(false)
      mostra(`${esito.coupon.length} coupon generati.`, 'ok')
      await carica()
    } finally {
      setInCorso(false)
    }
  }

  async function elimina(coupon: Coupon) {
    const risposta = await fetch('/api/admin/coupon', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: coupon.id }),
    })

    const esito = await risposta.json()

    if (!risposta.ok) {
      mostra(esito.errore ?? 'Eliminazione non riuscita.', 'errore')
      return
    }

    mostra('Coupon eliminato.', 'ok')
    await carica()
  }

  const filtrati = voci.filter((voce) =>
    `${voce.codice} ${voce.descrizione}`.toLowerCase().includes(cerca.trim().toLowerCase()),
  )

  return (
    <div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-titolo text-[1.8rem] font-semibold">Coupon</h1>
          <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
            Codici monouso, generabili anche a lotti. Un coupon già speso non si elimina: è la
            giustificazione di uno sconto applicato su una prenotazione.
          </p>
        </div>

        <Bottone onClick={() => setModulo(true)}>
          <Icona nome="piu" className="size-4" />
          Genera coupon
        </Bottone>
      </header>

      {generati.length > 0 && (
        <div className="mt-6 rounded-ampio border border-ok/40 bg-ok/6 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-titolo text-[1.05rem] font-semibold">
              {generati.length} coupon appena generati
            </h2>
            <Bottone
              variante="tenue"
              misura="piccola"
              onClick={() => {
                void navigator.clipboard
                  .writeText(generati.map((voce) => voce.codice).join('\n'))
                  .then(() => mostra('Codici copiati.', 'ok'))
                  .catch(() => mostra('Copia non riuscita.', 'errore'))
              }}
            >
              <Icona nome="copia" className="size-3.5" />
              Copia tutti i codici
            </Bottone>
          </div>

          <p className="tabellare mt-4 flex flex-wrap gap-2 text-[0.84rem]">
            {generati.map((voce) => (
              <span
                key={voce.id}
                className="rounded border border-dashed border-ok/50 px-2.5 py-1 font-semibold"
              >
                {voce.codice}
              </span>
            ))}
          </p>

          <p className="mt-3 text-[0.8rem] text-tenue">
            Copiali adesso: qui restano finché non ricarichi la pagina, ma li ritrovi comunque
            nell’elenco qui sotto.
          </p>
        </div>
      )}

      <div className="relative mt-7 max-w-md">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={cerca}
          onChange={(evento) => setCerca(evento.target.value)}
          placeholder="Codice o descrizione…"
          aria-label="Cerca fra i coupon"
          className="w-full rounded-full border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem] focus:border-accento focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-ampio border border-bordo bg-superficie">
        {caricamento ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, indice) => (
              <Scheletro key={indice} className="h-10 w-full" />
            ))}
          </div>
        ) : filtrati.length === 0 ? (
          <p className="p-8 text-center text-[0.9rem] text-tenue">Nessun coupon.</p>
        ) : (
          <table className="w-full border-collapse text-[0.86rem]">
            <caption className="sr-only">Elenco dei coupon</caption>
            <thead>
              <tr className="border-b border-bordo">
                {['Codice', 'Valore', 'Descrizione', 'Scadenza', 'Stato', ''].map((titolo, indice) => (
                  <th
                    key={titolo || indice}
                    scope="col"
                    className={`p-3.5 text-left font-medium text-tenue ${indice === 5 ? 'text-right' : ''}`}
                  >
                    {titolo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrati.slice(0, 300).map((coupon) => (
                <tr key={coupon.id} className="border-b border-bordo last:border-0">
                  <td className="tabellare p-3.5 align-top font-semibold tracking-[0.08em]">
                    {coupon.codice}
                  </td>
                  <td className="p-3.5 align-top">
                    {coupon.tipo === 'percentuale'
                      ? `−${percentuale(coupon.valore)}`
                      : `−${prezzoPieno(coupon.valore)}`}
                  </td>
                  <td className="p-3.5 align-top text-tenue">{coupon.descrizione}</td>
                  <td className="p-3.5 align-top text-tenue">{dataBreve(coupon.scadenza)}</td>
                  <td className="p-3.5 align-top">
                    {coupon.usato ? (
                      <Etichetta tono="neutro">Usato</Etichetta>
                    ) : coupon.scadenza < oggiIso() ? (
                      <Etichetta tono="ambra">Scaduto</Etichetta>
                    ) : (
                      <Etichetta tono="verde">Valido</Etichetta>
                    )}
                  </td>
                  <td className="p-3.5 text-right align-top">
                    {!coupon.usato && (
                      <button
                        type="button"
                        onClick={() => void elimina(coupon)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-errore hover:text-errore"
                        aria-label={`Elimina ${coupon.codice}`}
                      >
                        <Icona nome="cestino" className="size-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Generazione ─────────────────────────────────────────────────── */}
      <Finestra aperta={modulo} onChiudi={() => setModulo(false)} titolo="Genera coupon">
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            void genera()
          }}
          className="space-y-5"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Quantità"
              type="number"
              min={1}
              max={500}
              value={dati.quantita}
              onChange={(evento) => setDati({ ...dati, quantita: Number(evento.target.value) })}
              aiuto="Oltre uno, i codici sono generati casualmente."
            />

            <Scelta
              etichetta="Tipo di sconto"
              value={dati.tipo}
              onChange={(evento) =>
                setDati({ ...dati, tipo: evento.target.value as 'fisso' | 'percentuale' })
              }
            >
              <option value="fisso">Importo fisso in euro</option>
              <option value="percentuale">Percentuale</option>
            </Scelta>

            <Campo
              etichetta={dati.tipo === 'percentuale' ? 'Sconto (%)' : 'Sconto (€)'}
              type="number"
              step="0.5"
              min={0}
              max={dati.tipo === 'percentuale' ? 100 : 500}
              value={dati.valore}
              onChange={(evento) => setDati({ ...dati, valore: Number(evento.target.value) })}
            />

            <Campo
              etichetta="Scadenza"
              type="date"
              value={dati.scadenza}
              min={oggiIso()}
              onChange={(evento) => setDati({ ...dati, scadenza: evento.target.value })}
            />

            <Campo
              etichetta="Descrizione"
              value={dati.descrizione}
              onChange={(evento) => setDati({ ...dati, descrizione: evento.target.value })}
              className="sm:col-span-2"
              aiuto="Compare nell’area personale del cliente: «Risarcimento guasto sala 3»."
            />

            {dati.quantita === 1 && (
              <Campo
                etichetta="Codice personalizzato"
                value={dati.codice}
                onChange={(evento) => setDati({ ...dati, codice: evento.target.value.toUpperCase() })}
                className="sm:col-span-2"
                aiuto="Facoltativo. Lascia vuoto per generarlo a caso."
              />
            )}
          </div>

          <Nota icona={<Icona nome="info" className="size-4" />}>
            I coupon generati qui non sono intestati a nessuno: chiunque abbia il codice può
            usarlo, una volta sola. Per un coupon legato a un cliente specifico, usa la rettifica
            punti e lascia che sia lui a riscattare un premio.
          </Nota>

          <div className="flex justify-end gap-3 border-t border-bordo pt-5">
            <Bottone variante="tenue" onClick={() => setModulo(false)}>
              Annulla
            </Bottone>
            <Bottone type="submit" disabled={inCorso || dati.valore <= 0}>
              {inCorso ? 'Generazione…' : `Genera ${dati.quantita}`}
            </Bottone>
          </div>
        </form>
      </Finestra>
    </div>
  )
}
