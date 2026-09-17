'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo } from '@/componenti/ui/campi'
import type { GiftCard } from '@/lib/tipi'
import { dataBreve, prezzoPieno } from '@/lib/utili'

/**
 * Gift card.
 *
 * Non si creano dal pannello, e la mancanza è voluta: una gift card è credito
 * spendibile, e crearne senza incasso corrispondente significa emettere denaro.
 * Per un omaggio o un risarcimento lo strumento è il coupon, che nasce
 * apposta ed è tracciato come tale.
 *
 * Restano possibili tre interventi: bloccare una carta compromessa,
 * riattivarla e rettificarne il saldo — tutti con motivo obbligatorio e tutti
 * annotati nel registro.
 */

const TONI = {
  attiva: 'verde',
  programmata: 'ambra',
  esaurita: 'neutro',
  annullata: 'rosso',
} as const

export default function PaginaGiftCardAdmin() {
  const { mostra } = useAvvisi()

  const [voci, setVoci] = useState<GiftCard[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cerca, setCerca] = useState('')
  const [azione, setAzione] = useState<{ giftCard: GiftCard; tipo: string } | null>(null)
  const [motivo, setMotivo] = useState('')
  const [saldo, setSaldo] = useState(0)
  const [inCorso, setInCorso] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch('/api/admin/giftcard', { cache: 'no-store' })
      const esito = (await risposta.json()) as { voci: GiftCard[] }
      setVoci(esito.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => {
    void carica()
  }, [carica])

  async function esegui() {
    if (!azione) return
    setInCorso(true)

    try {
      const risposta = await fetch('/api/admin/giftcard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: azione.giftCard.id, azione: azione.tipo, motivo, saldo }),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Operazione non riuscita.', 'errore')
        return
      }

      mostra('Fatto.', 'ok')
      setAzione(null)
      setMotivo('')
      await carica()
    } finally {
      setInCorso(false)
    }
  }

  const filtrate = voci.filter((voce) =>
    `${voce.codice} ${voce.destinatario.email} ${voce.mittente.email}`
      .toLowerCase()
      .includes(cerca.trim().toLowerCase()),
  )

  const creditoInCircolazione = voci
    .filter((voce) => voce.stato === 'attiva')
    .reduce((somma, voce) => somma + voce.saldo, 0)

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Gift card</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Le gift card nascono dall’acquisto e non si creano da qui: sarebbe credito senza incasso.
          Per un omaggio usa i coupon.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-morbido border border-bordo bg-superficie p-5">
          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            Credito in circolazione
          </p>
          <p className="tabellare mt-2 font-titolo text-[1.7rem] font-bold text-accento">
            {prezzoPieno(creditoInCircolazione)}
          </p>
          <p className="mt-1.5 text-[0.78rem] text-tenue">
            È un debito verso i clienti: va tenuto d’occhio come tale.
          </p>
        </div>

        <div className="rounded-morbido border border-bordo bg-superficie p-5">
          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            Carte attive
          </p>
          <p className="tabellare mt-2 font-titolo text-[1.7rem] font-bold">
            {voci.filter((voce) => voce.stato === 'attiva').length}
          </p>
        </div>

        <div className="rounded-morbido border border-bordo bg-superficie p-5">
          <p className="text-[0.74rem] font-semibold uppercase tracking-[0.14em] text-tenue">
            In attesa di invio
          </p>
          <p className="tabellare mt-2 font-titolo text-[1.7rem] font-bold">
            {voci.filter((voce) => voce.stato === 'programmata').length}
          </p>
        </div>
      </div>

      <div className="relative mt-7 max-w-md">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={cerca}
          onChange={(evento) => setCerca(evento.target.value)}
          placeholder="Codice o email…"
          aria-label="Cerca fra le gift card"
          className="w-full rounded-full border border-bordo bg-superficie py-2.5 pl-10 pr-4 text-[0.88rem] focus:border-accento focus:outline-none"
        />
      </div>

      <div className="mt-6 overflow-x-auto rounded-ampio border border-bordo bg-superficie">
        {caricamento ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }, (_, indice) => (
              <Scheletro key={indice} className="h-10 w-full" />
            ))}
          </div>
        ) : filtrate.length === 0 ? (
          <p className="p-8 text-center text-[0.9rem] text-tenue">Nessuna gift card emessa.</p>
        ) : (
          <table className="w-full border-collapse text-[0.86rem]">
            <caption className="sr-only">Elenco delle gift card</caption>
            <thead>
              <tr className="border-b border-bordo">
                {['Codice', 'Valore', 'Saldo', 'Destinatario', 'Stato', 'Azioni'].map((titolo) => (
                  <th
                    key={titolo}
                    scope="col"
                    className={`p-3.5 text-left font-medium text-tenue ${titolo === 'Azioni' ? 'text-right' : ''}`}
                  >
                    {titolo}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrate.map((giftCard) => (
                <tr key={giftCard.id} className="border-b border-bordo last:border-0">
                  <td className="tabellare p-3.5 align-top font-semibold tracking-[0.08em]">
                    {giftCard.codice}
                    <span className="block text-[0.72rem] font-normal text-tenue">
                      {dataBreve(giftCard.creataIl)}
                    </span>
                  </td>
                  <td className="tabellare p-3.5 align-top">{prezzoPieno(giftCard.valoreIniziale)}</td>
                  <td className="tabellare p-3.5 align-top font-medium">
                    {prezzoPieno(giftCard.saldo)}
                    {giftCard.movimenti.length > 0 && (
                      <span className="block text-[0.72rem] font-normal text-tenue">
                        {giftCard.movimenti.length} utilizzi
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 align-top">
                    <span className="block">{giftCard.destinatario.nome}</span>
                    <span className="block text-[0.74rem] text-tenue">
                      {giftCard.destinatario.email}
                    </span>
                  </td>
                  <td className="p-3.5 align-top">
                    <Etichetta tono={TONI[giftCard.stato]}>{giftCard.stato}</Etichetta>
                    {giftCard.stato === 'programmata' && (
                      <span className="mt-1 block text-[0.72rem] text-tenue">
                        invio {dataBreve(giftCard.dataInvio)}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right align-top">
                    <span className="inline-flex flex-wrap justify-end gap-1.5">
                      {giftCard.stato !== 'annullata' ? (
                        <button
                          type="button"
                          onClick={() => setAzione({ giftCard, tipo: 'annulla' })}
                          className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-errore hover:text-errore"
                        >
                          Blocca
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setAzione({ giftCard, tipo: 'riattiva' })}
                          className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-ok hover:text-ok"
                        >
                          Riattiva
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSaldo(giftCard.saldo)
                          setAzione({ giftCard, tipo: 'saldo' })
                        }}
                        className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                      >
                        Saldo
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Finestra
        aperta={azione !== null}
        onChiudi={() => setAzione(null)}
        titolo={
          azione?.tipo === 'saldo'
            ? 'Rettifica del saldo'
            : azione?.tipo === 'riattiva'
              ? 'Riattiva la gift card'
              : 'Blocca la gift card'
        }
      >
        {azione && (
          <div className="space-y-5">
            <p className="text-[0.92rem]">
              Gift card <strong className="tabellare">{azione.giftCard.codice}</strong> — saldo{' '}
              {prezzoPieno(azione.giftCard.saldo)}
            </p>

            {azione.tipo === 'saldo' && (
              <Campo
                etichetta="Nuovo saldo (€)"
                type="number"
                step="0.01"
                min={0}
                value={saldo}
                onChange={(evento) => setSaldo(Number(evento.target.value))}
              />
            )}

            <Campo
              etichetta="Motivo"
              richiesto={azione.tipo !== 'riattiva'}
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              aiuto="Finisce nel registro delle operazioni."
            />

            {azione.tipo === 'annulla' && (
              <Nota tono="ambra" icona={<Icona nome="avviso" className="size-4" />}>
                La carta smette immediatamente di funzionare. Il credito residuo non viene
                rimborsato automaticamente: se è dovuto, va restituito a parte.
              </Nota>
            )}

            <div className="flex justify-end gap-3 border-t border-bordo pt-5">
              <Bottone variante="tenue" onClick={() => setAzione(null)}>
                Annulla
              </Bottone>
              <Bottone
                onClick={() => void esegui()}
                disabled={inCorso || (azione.tipo !== 'riattiva' && motivo.trim().length < 3)}
              >
                Conferma
              </Bottone>
            </div>
          </div>
        )}
      </Finestra>
    </div>
  )
}
