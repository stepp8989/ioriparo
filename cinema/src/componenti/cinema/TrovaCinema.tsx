'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Fondale } from '@/componenti/ui/Poster'
import { Nota } from '@/componenti/ui/Sezione'
import type { Cinema, ServizioCinema } from '@/lib/tipi'
import { classi, distanzaKm, inSlug } from '@/lib/utili'

/**
 * Ricerca del cinema più vicino.
 *
 * La geolocalizzazione è facoltativa e non viene mai chiesta da sola: parte
 * solo se si preme il pulsante. La posizione resta nel browser — la distanza
 * si calcola qui, con le coordinate dei cinema che erano già nella pagina, e
 * non viene mandata a nessun server, nostro o di terzi. È il motivo per cui
 * non c'è nessuna integrazione con un servizio di mappe in questa schermata.
 *
 * Il campo di testo cerca per città, CAP, provincia, indirizzo e nome: chi
 * cerca «08048» e chi cerca «Ogliastra» devono trovare la stessa sala.
 */
export function TrovaCinema({
  cinema,
  nomeMarchio,
  saleConteggio,
}: {
  cinema: Cinema[]
  nomeMarchio: string
  /** Numero di sale per cinema, calcolato dal server. */
  saleConteggio: Record<string, number>
}) {
  const [testo, setTesto] = useState('')
  const [servizio, setServizio] = useState<ServizioCinema | ''>('')
  const [posizione, setPosizione] = useState<{ lat: number; lng: number } | null>(null)
  const [statoPosizione, setStatoPosizione] = useState<'inattiva' | 'attesa' | 'negata' | 'assente'>(
    'inattiva',
  )

  const servizi = useMemo(
    () => [...new Set(cinema.flatMap((voce) => voce.servizi))].sort(),
    [cinema],
  )

  const risultati = useMemo(() => {
    const termine = inSlug(testo.trim())

    const filtrati = cinema.filter((voce) => {
      if (servizio && !voce.servizi.includes(servizio)) return false
      if (!termine) return true

      const campi = inSlug(
        `${voce.nome} ${voce.citta} ${voce.cap} ${voce.provincia} ${voce.indirizzo}`,
      )
      return campi.includes(termine)
    })

    if (!posizione) return filtrati

    return [...filtrati].sort(
      (a, b) =>
        distanzaKm(posizione, a.coordinate) - distanzaKm(posizione, b.coordinate),
    )
  }, [cinema, testo, servizio, posizione])

  function localizza() {
    if (!('geolocation' in navigator)) {
      setStatoPosizione('assente')
      return
    }

    setStatoPosizione('attesa')
    navigator.geolocation.getCurrentPosition(
      (esito) => {
        setPosizione({ lat: esito.coords.latitude, lng: esito.coords.longitude })
        setStatoPosizione('inattiva')
      },
      () => setStatoPosizione('negata'),
      // Dieci secondi bastano; una posizione vecchia di cinque minuti è più che
      // sufficiente per ordinare cinque cinema in una regione.
      { timeout: 10_000, maximumAge: 300_000 },
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Icona
            nome="cerca"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-tenue"
          />
          <input
            type="search"
            value={testo}
            onChange={(evento) => setTesto(evento.target.value)}
            placeholder="Città, CAP o nome del cinema"
            aria-label="Cerca per città, CAP o nome del cinema"
            className="w-full rounded-full border border-bordo bg-superficie py-3.5 pl-11 pr-4 text-[0.92rem] transition-colors placeholder:text-tenue/70 focus:border-accento focus:outline-none"
          />
        </div>

        <Bottone
          variante="contorno"
          misura="normale"
          onClick={localizza}
          disabled={statoPosizione === 'attesa'}
        >
          <Icona nome="bussola" className="size-4" />
          {statoPosizione === 'attesa' ? 'Ricerca…' : 'Vicino a me'}
        </Bottone>
      </div>

      {servizi.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filtra per servizio">
          <button
            type="button"
            onClick={() => setServizio('')}
            aria-pressed={servizio === ''}
            className={classi(
              'rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors',
              servizio === ''
                ? 'border-accento bg-accento text-white'
                : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
            )}
          >
            Tutti i servizi
          </button>
          {servizi.map((voce) => (
            <button
              key={voce}
              type="button"
              onClick={() => setServizio(servizio === voce ? '' : voce)}
              aria-pressed={servizio === voce}
              className={classi(
                'rounded-full border px-3.5 py-1.5 text-[0.8rem] transition-colors',
                servizio === voce
                  ? 'border-accento bg-accento text-white'
                  : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
              )}
            >
              {voce}
            </button>
          ))}
        </div>
      )}

      {statoPosizione === 'negata' && (
        <Nota tono="ambra" className="mt-5" icona={<Icona nome="info" className="size-4" />}>
          Non siamo riusciti a ottenere la tua posizione. Puoi cercare per città o CAP nel campo
          qui sopra: funziona altrettanto bene.
        </Nota>
      )}
      {statoPosizione === 'assente' && (
        <Nota tono="ambra" className="mt-5" icona={<Icona nome="info" className="size-4" />}>
          Questo browser non offre la geolocalizzazione. Cerca per città o CAP.
        </Nota>
      )}
      {posizione && (
        <p className="mt-5 flex items-center gap-2 text-[0.85rem] text-tenue">
          <Icona nome="bussola" className="size-4 text-accento" />
          Sale ordinate per distanza dalla tua posizione. La posizione resta sul tuo dispositivo.
        </p>
      )}

      <p className="mt-6 text-[0.85rem] text-tenue" role="status" aria-live="polite">
        {risultati.length === 0
          ? 'Nessun cinema corrisponde alla ricerca.'
          : `${risultati.length} ${risultati.length === 1 ? 'cinema' : 'cinema'} trovati.`}
      </p>

      <ul className="mt-6 grid gap-5 lg:grid-cols-2">
        {risultati.map((struttura) => {
          const distanza = posizione ? distanzaKm(posizione, struttura.coordinate) : null

          return (
            <li key={struttura.id}>
              <article className="group flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie transition-all duration-500 hover:-translate-y-1 hover:border-accento/40 hover:shadow-rilievo">
                <div className="relative h-36 overflow-hidden">
                  <div className="size-full transition-transform duration-700 group-hover:scale-105">
                    <Fondale
                      chiave={struttura.id}
                      palette={struttura.palette}
                      immagine={struttura.immagine}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-notte/90 to-transparent" aria-hidden />

                  {distanza !== null && (
                    <span className="absolute right-3 top-3 rounded-full bg-notte/85 px-3 py-1 text-[0.72rem] tabellare text-white">
                      {distanza} km
                    </span>
                  )}

                  <h3 className="absolute bottom-3 left-4 font-titolo text-[1.15rem] font-semibold text-white">
                    {nomeMarchio} {struttura.nome}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="flex items-start gap-2 text-[0.88rem] text-tenue">
                    <Icona nome="posizione" className="mt-0.5 size-4 shrink-0" />
                    {struttura.indirizzo}, {struttura.cap} {struttura.citta} ({struttura.provincia})
                  </p>

                  <p className="mt-2 flex items-center gap-2 text-[0.88rem] text-tenue">
                    <Icona nome="schermo" className="size-4 shrink-0" />
                    {saleConteggio[struttura.id] ?? 0} sale
                    <span aria-hidden>·</span>
                    <a
                      href={`tel:${struttura.telefono.replace(/\s/g, '')}`}
                      className="transition-colors hover:text-accento"
                    >
                      {struttura.telefono}
                    </a>
                  </p>

                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {struttura.servizi.map((voce) => (
                      <li
                        key={voce}
                        className="rounded-full bg-superficie-alt px-2.5 py-1 text-[0.7rem] text-tenue"
                      >
                        {voce}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-wrap gap-2.5 pt-1">
                    <Bottone href={`/cinema/${struttura.slug}`} misura="piccola">
                      Vedi programmazione
                    </Bottone>
                    <a
                      href={`https://www.openstreetmap.org/?mlat=${struttura.coordinate.lat}&mlon=${struttura.coordinate.lng}#map=17/${struttura.coordinate.lat}/${struttura.coordinate.lng}`}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1.5 rounded-full border border-bordo px-4 py-2 text-[0.8rem] text-tenue transition-colors hover:border-accento hover:text-accento"
                    >
                      Indicazioni
                      <Icona nome="esterno" className="size-3.5" />
                    </a>
                  </div>
                </div>
              </article>
            </li>
          )
        })}
      </ul>

      {risultati.length === 0 && (
        <Nota className="mt-6" icona={<Icona nome="info" className="size-4" />}>
          Non abbiamo ancora una sala in questa zona.{' '}
          <Link href="/film" className="text-accento underline">
            Guarda i film in programmazione
          </Link>{' '}
          nelle sale esistenti.
        </Nota>
      )}
    </div>
  )
}
