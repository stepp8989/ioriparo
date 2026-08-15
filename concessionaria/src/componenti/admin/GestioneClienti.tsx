'use client'

import { useMemo, useState, type FormEvent } from 'react'
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
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Campo, Esito, Scelta } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import { NOMI_TIPO_DOCUMENTO, TIPI_DOCUMENTO, type ClientePubblico } from '@/lib/tipi'
import { dataEstesa, oggiIso, prezzo } from '@/lib/utili'

/**
 * Anagrafica dei clienti registrati.
 *
 * Da qui si allegano documenti e fatture, si registrano gli acquisti e si
 * reimposta la password quando qualcuno la dimentica. La password attuale non
 * è visibile a nessuno, nemmeno allo staff: si può solo sostituire.
 */
export function GestioneClienti() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ clienti: ClientePubblico[] }>(
    '/api/clienti',
  )
  const [filtro, setFiltro] = useState('')
  const [aperto, setAperto] = useState<ClientePubblico | null>(null)
  const [avviso, setAvviso] = useState('')

  const clienti = useMemo(() => {
    const elenco = dati?.clienti ?? []
    const cerca = filtro.trim().toLowerCase()
    if (!cerca) return elenco
    return elenco.filter((cliente) =>
      `${cliente.nome} ${cliente.cognome} ${cliente.email} ${cliente.telefono}`
        .toLowerCase()
        .includes(cerca),
    )
  }, [dati, filtro])

  async function elimina(cliente: ClientePubblico) {
    if (!conferma(`Eliminare l’account di ${cliente.nome} ${cliente.cognome}?`)) return
    const esito = await invia(`/api/clienti?id=${encodeURIComponent(cliente.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Clienti"
        descrizione="Account registrati nell’area riservata, con documenti e storico acquisti."
        azione={
          <Bottone
            variante="contorno"
            misura="piccola"
            onClick={() =>
              esportaCsv(
                'clienti',
                (dati?.clienti ?? []).map((cliente) => ({
                  nome: cliente.nome,
                  cognome: cliente.cognome,
                  email: cliente.email,
                  telefono: cliente.telefono,
                  citta: cliente.citta,
                  acquisti: cliente.acquisti.length,
                  documenti: cliente.documenti.length,
                  registrato: cliente.creatoIl.slice(0, 10),
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

      <div className="relative mb-5 max-w-sm">
        <Icona
          nome="cerca"
          className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-tenue"
        />
        <input
          type="search"
          value={filtro}
          onChange={(evento) => setFiltro(evento.target.value)}
          placeholder="Cerca nome, email o telefono…"
          aria-label="Cerca fra i clienti"
          className="w-full rounded-full border border-bordo bg-superficie py-2.5 pr-4 pl-11 text-[0.9rem] focus:border-accento focus:outline-none"
        />
      </div>

      {clienti.length === 0 ? (
        <Vuoto testo="Nessun cliente registrato." />
      ) : (
        <div className="space-y-3">
          {clienti.map((cliente) => (
            <article
              key={cliente.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5"
            >
              <div className="min-w-[14rem] flex-1">
                <p className="font-semibold">
                  {cliente.nome} {cliente.cognome}
                </p>
                <p className="mt-1 text-[0.88rem]">
                  <a href={`mailto:${cliente.email}`} className="text-accento sottolinea">
                    {cliente.email}
                  </a>
                  <span className="mx-2 text-tenue">·</span>
                  <a href={`tel:${cliente.telefono}`} className="text-accento sottolinea">
                    {cliente.telefono}
                  </a>
                </p>
                <p className="mt-2 text-[0.8rem] text-tenue">
                  Registrato il {dataEstesa(cliente.creatoIl.slice(0, 10))}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Etichetta>{cliente.acquisti.length} acquisti</Etichetta>
                <Etichetta>{cliente.documenti.length} documenti</Etichetta>
              </div>

              <div className="flex gap-2">
                <Azione
                  icona="cartella"
                  etichetta="Apri la scheda"
                  tono="accento"
                  onClick={() => setAperto(cliente)}
                />
                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(cliente)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Finestra
        aperta={aperto !== null}
        onChiudi={() => setAperto(null)}
        titolo={aperto ? `${aperto.nome} ${aperto.cognome}` : ''}
      >
        {aperto && (
          <SchedaCliente
            cliente={aperto}
            onAggiornato={async () => {
              await ricarica()
              setAperto(null)
            }}
          />
        )}
      </Finestra>
    </>
  )
}

/* ── Scheda del singolo cliente ──────────────────────────────────────────── */

function SchedaCliente({
  cliente,
  onAggiornato,
}: {
  cliente: ClientePubblico
  onAggiornato: () => void | Promise<void>
}) {
  const [messaggio, setMessaggio] = useState('')
  const [esito, setEsito] = useState<'ok' | 'errore'>('errore')

  async function azione(corpo: Record<string, unknown>, successo: string) {
    const risultato = await invia('/api/clienti', 'PATCH', { id: cliente.id, ...corpo })
    setEsito(risultato.ok ? 'ok' : 'errore')
    setMessaggio(risultato.ok ? successo : risultato.errore)
    if (risultato.ok) await onAggiornato()
  }

  async function salvaAnagrafica(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = new FormData(evento.currentTarget)
    await azione(
      {
        nome: modulo.get('nome'),
        cognome: modulo.get('cognome'),
        telefono: modulo.get('telefono'),
        codiceFiscale: modulo.get('codiceFiscale'),
        indirizzo: modulo.get('indirizzo'),
        citta: modulo.get('citta'),
        cap: modulo.get('cap'),
      },
      'Anagrafica aggiornata.',
    )
  }

  async function aggiungiDocumento(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = new FormData(evento.currentTarget)
    await azione(
      {
        azione: 'documento',
        titolo: modulo.get('titolo'),
        tipo: modulo.get('tipo'),
        data: modulo.get('data'),
        importo: modulo.get('importo') || null,
        file: modulo.get('file'),
      },
      'Documento aggiunto.',
    )
  }

  async function aggiungiAcquisto(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = new FormData(evento.currentTarget)
    await azione(
      {
        azione: 'acquisto',
        descrizione: modulo.get('descrizione'),
        data: modulo.get('data'),
        importo: modulo.get('importo'),
        stato: modulo.get('stato'),
      },
      'Acquisto registrato.',
    )
  }

  async function reimpostaPassword(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const modulo = new FormData(evento.currentTarget)
    await azione(
      { azione: 'password', password: modulo.get('password') },
      'Password reimpostata: comunicatela al cliente.',
    )
  }

  return (
    <div className="space-y-8">
      <Esito testo={messaggio} tipo={esito} />

      <form onSubmit={salvaAnagrafica} className="space-y-4">
        <h3 className="font-titolo text-[1.05rem] font-semibold">Anagrafica</h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <Campo etichetta="Nome" name="nome" defaultValue={cliente.nome} />
          <Campo etichetta="Cognome" name="cognome" defaultValue={cliente.cognome} />
          <Campo etichetta="Telefono" name="telefono" defaultValue={cliente.telefono} />
          <Campo
            etichetta="Codice fiscale"
            name="codiceFiscale"
            defaultValue={cliente.codiceFiscale}
            maxLength={16}
          />
          <Campo
            etichetta="Indirizzo"
            name="indirizzo"
            defaultValue={cliente.indirizzo}
            className="sm:col-span-2"
          />
          <Campo etichetta="Città" name="citta" defaultValue={cliente.citta} />
          <Campo etichetta="CAP" name="cap" defaultValue={cliente.cap} maxLength={10} />
        </div>

        <Bottone type="submit" misura="piccola">
          Salva l’anagrafica
        </Bottone>
      </form>

      <div className="border-t border-bordo pt-8">
        <h3 className="font-titolo text-[1.05rem] font-semibold">Documenti e fatture</h3>

        {cliente.documenti.length > 0 && (
          <ul className="mt-4 space-y-2">
            {cliente.documenti.map((documento) => (
              <li
                key={documento.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-morbido border border-bordo px-4 py-3 text-[0.88rem]"
              >
                <span>
                  <span className="font-medium">{documento.titolo}</span>
                  <span className="ml-2 text-tenue">
                    {NOMI_TIPO_DOCUMENTO[documento.tipo]} · {dataEstesa(documento.data)}
                    {documento.importo !== null && ` · ${prezzo(documento.importo)}`}
                  </span>
                </span>
                <Azione
                  icona="cestino"
                  etichetta="Rimuovi il documento"
                  tono="rosso"
                  onClick={() =>
                    azione(
                      { azione: 'rimuovi-documento', documentoId: documento.id },
                      'Documento rimosso.',
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={aggiungiDocumento} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo etichetta="Titolo" name="titolo" required className="sm:col-span-2" />
          <Scelta etichetta="Tipo" name="tipo" defaultValue="fattura">
            {TIPI_DOCUMENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {NOMI_TIPO_DOCUMENTO[tipo]}
              </option>
            ))}
          </Scelta>
          <Campo etichetta="Data" name="data" type="date" defaultValue={oggiIso()} />
          <Campo etichetta="Importo (€)" name="importo" type="number" min={0} step={0.01} />
          <Campo
            etichetta="File"
            name="file"
            placeholder="/documenti/fattura-123.pdf"
            nota="Percorso del file dentro public/."
          />
          <Bottone type="submit" misura="piccola" variante="contorno" className="sm:col-span-2">
            <Icona nome="piu" className="size-4" />
            Aggiungi il documento
          </Bottone>
        </form>
      </div>

      <div className="border-t border-bordo pt-8">
        <h3 className="font-titolo text-[1.05rem] font-semibold">Acquisti</h3>

        {cliente.acquisti.length > 0 && (
          <ul className="mt-4 space-y-2">
            {cliente.acquisti.map((acquisto) => (
              <li
                key={acquisto.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-morbido border border-bordo px-4 py-3 text-[0.88rem]"
              >
                <span>
                  <span className="font-medium">{acquisto.descrizione}</span>
                  <span className="ml-2 text-tenue">
                    {dataEstesa(acquisto.data)} · {prezzo(acquisto.importo)} ·{' '}
                    {acquisto.stato === 'consegnato' ? 'consegnato' : 'in lavorazione'}
                  </span>
                </span>
                <Azione
                  icona="cestino"
                  etichetta="Rimuovi l’acquisto"
                  tono="rosso"
                  onClick={() =>
                    azione(
                      { azione: 'rimuovi-acquisto', acquistoId: acquisto.id },
                      'Acquisto rimosso.',
                    )
                  }
                />
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={aggiungiAcquisto} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Campo
            etichetta="Descrizione"
            name="descrizione"
            required
            className="sm:col-span-2"
            placeholder="Audi A4 Avant 40 TDI"
          />
          <Campo etichetta="Data" name="data" type="date" defaultValue={oggiIso()} />
          <Campo etichetta="Importo (€)" name="importo" type="number" min={0} step={0.01} required />
          <Scelta etichetta="Stato" name="stato" defaultValue="in-lavorazione">
            <option value="in-lavorazione">In lavorazione</option>
            <option value="consegnato">Consegnato</option>
          </Scelta>
          <Bottone type="submit" misura="piccola" variante="contorno" className="sm:col-span-2">
            <Icona nome="piu" className="size-4" />
            Registra l’acquisto
          </Bottone>
        </form>
      </div>

      <form onSubmit={reimpostaPassword} className="space-y-4 border-t border-bordo pt-8">
        <h3 className="font-titolo text-[1.05rem] font-semibold">Password</h3>
        <p className="text-[0.85rem] leading-relaxed text-tenue">
          La password attuale non è leggibile da nessuno: nell’archivio c’è solo la sua impronta
          crittografica. Se il cliente l’ha dimenticata, impostatene una nuova e comunicategliela.
        </p>
        <Campo
          etichetta="Nuova password"
          name="password"
          type="text"
          minLength={8}
          required
          icona="lucchetto"
          nota="Almeno otto caratteri."
        />
        <Bottone type="submit" misura="piccola" variante="contorno">
          Reimposta la password
        </Bottone>
      </form>
    </div>
  )
}
