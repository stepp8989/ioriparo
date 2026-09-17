'use client'

import { useCallback, useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Scheletro } from '@/componenti/ui/Scheletro'
import { Etichetta, Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Campo } from '@/componenti/ui/campi'
import type { ClientePubblico, LivelloLoyalty, Sottoscrizione } from '@/lib/tipi'
import { dataBreve, numero, prezzoPieno } from '@/lib/utili'

/**
 * Anagrafica clienti.
 *
 * Il pannello non permette di cambiare la password di un cliente, e la
 * mancanza è voluta: una funzione del genere trasforma chi ha accesso al
 * pannello in qualcuno che può entrare negli account altrui. Chi dimentica la
 * password la reimposta dal proprio indirizzo email.
 *
 * La cancellazione di un account spezza il legame con le prenotazioni ma non
 * le elimina: sono documenti fiscali da conservare per dieci anni. È il modo
 * di rispettare insieme il diritto alla cancellazione e l'obbligo di
 * conservazione, ed è quello dichiarato nell'informativa privacy.
 */

type Riga = ClientePubblico & {
  progresso: { attuale: LivelloLoyalty | null }
  ordini: number
  speso: number
  abbonamento: Sottoscrizione | null
}

export default function PaginaClientiAdmin() {
  const { mostra } = useAvvisi()

  const [voci, setVoci] = useState<Riga[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [cerca, setCerca] = useState('')
  const [rettifica, setRettifica] = useState<Riga | null>(null)
  const [punti, setPunti] = useState(0)
  const [motivo, setMotivo] = useState('')
  const [daCancellare, setDaCancellare] = useState<Riga | null>(null)
  const [inCorso, setInCorso] = useState(false)

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const parametri = cerca.trim() ? `?q=${encodeURIComponent(cerca.trim())}` : ''
      const risposta = await fetch(`/api/admin/clienti${parametri}`, { cache: 'no-store' })
      const dati = (await risposta.json()) as { voci: Riga[] }
      setVoci(dati.voci ?? [])
    } finally {
      setCaricamento(false)
    }
  }, [cerca])

  useEffect(() => {
    const attesa = window.setTimeout(() => void carica(), 250)
    return () => window.clearTimeout(attesa)
  }, [carica])

  async function sospendi(cliente: Riga, attivo: boolean) {
    const risposta = await fetch('/api/admin/clienti', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cliente.id, attivo }),
    })

    if (!risposta.ok) {
      mostra('Modifica non riuscita.', 'errore')
      return
    }

    mostra(attivo ? 'Account riattivato.' : 'Account sospeso.', 'ok')
    await carica()
  }

  async function applicaRettifica() {
    if (!rettifica) return
    setInCorso(true)

    try {
      const risposta = await fetch('/api/admin/loyalty/punti', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clienteId: rettifica.id, punti, motivo }),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        mostra(esito.errore ?? 'Rettifica non riuscita.', 'errore')
        return
      }

      mostra('Punti aggiornati.', 'ok')
      setRettifica(null)
      setPunti(0)
      setMotivo('')
      await carica()
    } finally {
      setInCorso(false)
    }
  }

  async function cancella() {
    if (!daCancellare) return
    setInCorso(true)

    try {
      const risposta = await fetch('/api/admin/clienti', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: daCancellare.id }),
      })

      if (!risposta.ok) {
        mostra('Cancellazione non riuscita.', 'errore')
        return
      }

      mostra('Account cancellato.', 'ok')
      setDaCancellare(null)
      await carica()
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div>
      <header>
        <h1 className="font-titolo text-[1.8rem] font-semibold">Clienti</h1>
        <p className="mt-1.5 max-w-2xl text-[0.9rem] text-tenue">
          Anagrafica degli account registrati. Gli acquisti fatti senza registrazione non compaiono
          qui: si trovano fra le prenotazioni, cercando per email.
        </p>
      </header>

      <div className="relative mt-7 max-w-md">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={cerca}
          onChange={(evento) => setCerca(evento.target.value)}
          placeholder="Nome, cognome o email…"
          aria-label="Cerca fra i clienti"
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
        ) : voci.length === 0 ? (
          <p className="p-8 text-center text-[0.9rem] text-tenue">Nessun cliente registrato.</p>
        ) : (
          <table className="w-full border-collapse text-[0.86rem]">
            <caption className="sr-only">Elenco dei clienti registrati</caption>
            <thead>
              <tr className="border-b border-bordo">
                {['Cliente', 'CLUB', 'Acquisti', 'Stato', 'Azioni'].map((titolo) => (
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
              {voci.map((cliente) => (
                <tr key={cliente.id} className="border-b border-bordo last:border-0">
                  <td className="p-3.5 align-top">
                    <span className="block font-medium">
                      {cliente.nome} {cliente.cognome}
                    </span>
                    <span className="block text-[0.76rem] text-tenue">{cliente.email}</span>
                    <span className="block text-[0.74rem] text-tenue">
                      iscritto il {dataBreve(cliente.creatoIl)}
                    </span>
                  </td>

                  <td className="p-3.5 align-top">
                    {cliente.progresso.attuale && (
                      <Etichetta tono="neutro">{cliente.progresso.attuale.nome}</Etichetta>
                    )}
                    <span className="mt-1 block tabellare text-[0.78rem] text-tenue">
                      {numero(cliente.punti)} punti
                    </span>
                  </td>

                  <td className="p-3.5 align-top">
                    <span className="tabellare block">{prezzoPieno(cliente.speso)}</span>
                    <span className="block text-[0.76rem] text-tenue">
                      {cliente.ordini} {cliente.ordini === 1 ? 'ordine' : 'ordini'}
                    </span>
                    {cliente.abbonamento && (
                      <Etichetta tono="viola" className="mt-1 px-2 py-0.5 text-[0.56rem]">
                        Abbonato
                      </Etichetta>
                    )}
                  </td>

                  <td className="p-3.5 align-top">
                    <Etichetta tono={cliente.attivo ? 'verde' : 'rosso'}>
                      {cliente.attivo ? 'Attivo' : 'Sospeso'}
                    </Etichetta>
                  </td>

                  <td className="p-3.5 text-right align-top">
                    <span className="inline-flex flex-wrap justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setRettifica(cliente)}
                        className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                      >
                        Punti
                      </button>
                      <button
                        type="button"
                        onClick={() => void sospendi(cliente, !cliente.attivo)}
                        className="rounded-full border border-bordo px-3 py-1.5 text-[0.76rem] text-tenue transition-colors hover:border-attesa hover:text-attesa"
                      >
                        {cliente.attivo ? 'Sospendi' : 'Riattiva'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDaCancellare(cliente)}
                        className="inline-flex size-8 items-center justify-center rounded-full border border-bordo text-tenue transition-colors hover:border-errore hover:text-errore"
                        aria-label={`Cancella l’account di ${cliente.email}`}
                      >
                        <Icona nome="cestino" className="size-3.5" />
                      </button>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Rettifica punti ─────────────────────────────────────────────── */}
      <Finestra
        aperta={rettifica !== null}
        onChiudi={() => setRettifica(null)}
        titolo="Rettifica dei punti"
      >
        {rettifica && (
          <div className="space-y-5">
            <p className="text-[0.92rem]">
              {rettifica.nome} {rettifica.cognome} — saldo attuale{' '}
              <strong className="tabellare">{numero(rettifica.punti)}</strong> punti.
            </p>

            <Campo
              etichetta="Punti da aggiungere o togliere"
              type="number"
              value={punti}
              onChange={(evento) => setPunti(Number(evento.target.value))}
              aiuto="Usa un numero negativo per togliere punti."
            />

            <Campo
              etichetta="Motivo"
              richiesto
              value={motivo}
              onChange={(evento) => setMotivo(evento.target.value)}
              aiuto="Obbligatorio: finisce nel registro e nello storico del cliente."
            />

            <div className="flex justify-end gap-3 border-t border-bordo pt-5">
              <Bottone variante="tenue" onClick={() => setRettifica(null)}>
                Annulla
              </Bottone>
              <Bottone
                onClick={() => void applicaRettifica()}
                disabled={inCorso || punti === 0 || motivo.trim().length < 3}
              >
                Applica
              </Bottone>
            </div>
          </div>
        )}
      </Finestra>

      {/* ── Cancellazione ───────────────────────────────────────────────── */}
      <Finestra
        aperta={daCancellare !== null}
        onChiudi={() => setDaCancellare(null)}
        titolo="Cancellare l’account?"
      >
        {daCancellare && (
          <div className="space-y-5">
            <Nota tono="rosso" icona={<Icona nome="avviso" className="size-4" />}>
              Stai per cancellare l’account di{' '}
              <strong className="text-testo">{daCancellare.email}</strong>. Vengono eliminati
              punti, coupon, preferiti e abbonamenti. Le prenotazioni restano conservate per
              obbligo fiscale, ma perdono ogni riferimento alla persona.
            </Nota>

            <p className="text-[0.88rem] text-tenue">
              Fallo solo su richiesta dell’interessato. Per sospendere temporaneamente un account
              usa «Sospendi»: è reversibile.
            </p>

            <div className="flex justify-end gap-3 border-t border-bordo pt-5">
              <Bottone variante="tenue" onClick={() => setDaCancellare(null)}>
                Annulla
              </Bottone>
              <Bottone onClick={() => void cancella()} disabled={inCorso}>
                <Icona nome="cestino" className="size-4" />
                Cancella definitivamente
              </Bottone>
            </div>
          </div>
        )}
      </Finestra>
    </div>
  )
}
