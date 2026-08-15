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
import type { IscrittoNewsletter, Messaggio } from '@/lib/tipi'
import { classi, dataEstesa } from '@/lib/utili'

/**
 * Messaggi dal modulo contatti e dalla chat, più gli iscritti alla newsletter.
 *
 * Stanno nella stessa pagina perché sono due elenchi brevi che si consultano
 * insieme, e perché un iscritto alla newsletter nasce quasi sempre da chi ci
 * ha già scritto.
 */
export function GestioneMessaggi() {
  const messaggi = useRisorsa<{ messaggi: Messaggio[] }>('/api/contatti')
  const newsletter = useRisorsa<{ newsletter: IscrittoNewsletter[] }>('/api/newsletter')
  const [soloDaLeggere, setSoloDaLeggere] = useState(false)
  const [avviso, setAvviso] = useState('')

  const elenco = useMemo(() => {
    const voci = messaggi.dati?.messaggi ?? []
    return soloDaLeggere ? voci.filter((messaggio) => !messaggio.letto) : voci
  }, [messaggi.dati, soloDaLeggere])

  async function alterna(messaggio: Messaggio) {
    const esito = await invia('/api/contatti', 'PATCH', {
      id: messaggio.id,
      letto: !messaggio.letto,
    })
    if (!esito.ok) setAvviso(esito.errore)
    await messaggi.ricarica()
  }

  async function elimina(messaggio: Messaggio) {
    if (!conferma(`Eliminare il messaggio di ${messaggio.nome}?`)) return
    const esito = await invia(`/api/contatti?id=${encodeURIComponent(messaggio.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await messaggi.ricarica()
  }

  async function cancellaIscritto(iscritto: IscrittoNewsletter) {
    if (!conferma(`Cancellare l’iscrizione di ${iscritto.email}?`)) return
    const esito = await invia(`/api/newsletter?id=${encodeURIComponent(iscritto.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await newsletter.ricarica()
  }

  if (messaggi.caricamento) return <Caricamento />

  const iscritti = newsletter.dati?.newsletter ?? []
  const daLeggere = (messaggi.dati?.messaggi ?? []).filter((messaggio) => !messaggio.letto).length

  return (
    <>
      <TestataPagina
        titolo="Messaggi"
        descrizione={`${daLeggere} da leggere · ${iscritti.length} iscritti alla newsletter`}
        azione={
          <Bottone
            variante="contorno"
            misura="piccola"
            onClick={() =>
              esportaCsv(
                'newsletter',
                iscritti.map((iscritto) => ({
                  email: iscritto.email,
                  iscritto: iscritto.iscrittoIl.slice(0, 10),
                })),
              )
            }
          >
            <Icona nome="scarica" className="size-4" />
            Esporta iscritti
          </Bottone>
        }
      />

      <Errore testo={messaggi.errore || avviso} onRiprova={messaggi.ricarica} />

      <label className="mb-6 flex items-center gap-2.5 text-[0.85rem] text-tenue">
        <input
          type="checkbox"
          checked={soloDaLeggere}
          onChange={(evento) => setSoloDaLeggere(evento.target.checked)}
          className="size-4 accent-[var(--accento)]"
        />
        Mostra solo quelli da leggere
      </label>

      {elenco.length === 0 ? (
        <Vuoto testo="Nessun messaggio in questo elenco." />
      ) : (
        <div className="space-y-3">
          {elenco.map((messaggio) => (
            <article
              key={messaggio.id}
              className={classi(
                'flex flex-wrap items-start justify-between gap-4 rounded-ampio border bg-superficie p-5',
                messaggio.letto ? 'border-bordo opacity-70' : 'border-accento/40',
              )}
            >
              <div className="min-w-[16rem] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  {!messaggio.letto && <Etichetta tono="accento">Nuovo</Etichetta>}
                  <Etichetta>{messaggio.oggetto}</Etichetta>
                  <span className="text-[0.8rem] text-tenue">
                    {dataEstesa(messaggio.creatoIl.slice(0, 10))}
                  </span>
                </div>

                <p className="mt-3 font-semibold">{messaggio.nome}</p>
                <p className="mt-1 text-[0.88rem]">
                  <a href={`mailto:${messaggio.email}`} className="text-accento sottolinea">
                    {messaggio.email}
                  </a>
                  {messaggio.telefono && (
                    <>
                      <span className="mx-2 text-tenue">·</span>
                      <a href={`tel:${messaggio.telefono}`} className="text-accento sottolinea">
                        {messaggio.telefono}
                      </a>
                    </>
                  )}
                </p>

                <p className="mt-3 rounded-tenue bg-superficie-alt px-3 py-2 text-[0.9rem] leading-relaxed text-tenue">
                  {messaggio.testo}
                </p>
              </div>

              <div className="flex gap-2">
                <Azione
                  icona={messaggio.letto ? 'occhioBarrato' : 'spunta'}
                  etichetta={messaggio.letto ? 'Segna da leggere' : 'Segna come letto'}
                  onClick={() => alterna(messaggio)}
                />
                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(messaggio)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <section className="mt-12">
        <h2 className="mb-5 font-titolo text-[1.25rem] font-semibold">Iscritti alla newsletter</h2>

        {iscritti.length === 0 ? (
          <Vuoto testo="Nessun iscritto." />
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {iscritti.map((iscritto) => (
              <li
                key={iscritto.id}
                className="flex items-center justify-between gap-3 rounded-morbido border border-bordo bg-superficie px-4 py-3"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[0.9rem]">{iscritto.email}</span>
                  <span className="mt-0.5 block text-[0.75rem] text-tenue">
                    dal {dataEstesa(iscritto.iscrittoIl.slice(0, 10))}
                  </span>
                </span>
                <Azione
                  icona="cestino"
                  etichetta="Cancella l’iscrizione"
                  tono="rosso"
                  onClick={() => cancellaIscritto(iscritto)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  )
}
