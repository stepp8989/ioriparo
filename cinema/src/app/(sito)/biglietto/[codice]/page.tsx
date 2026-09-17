import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BigliettoDigitale } from '@/componenti/biglietto/BigliettoDigitale'
import { AzioniBiglietto } from '@/componenti/biglietto/AzioniBiglietto'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Nota, Sezione } from '@/componenti/ui/Sezione'
import { contenutoQr } from '@/lib/biglietti'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'
import { dataEstesa, elencoPosti, minutiAllInizio, prezzoPieno } from '@/lib/utili'

/**
 * Pagina del biglietto.
 *
 * È l'indirizzo che si apre al cinema con il telefono in mano, ed è costruita
 * attorno a quella situazione: il QR è grande, il codice è leggibile in chiaro,
 * e nulla richiede una connessione per essere mostrato una seconda volta.
 *
 * Non è indicizzata e non è memorizzata in cache: il codice di prenotazione
 * vale come titolo d'ingresso, e una copia conservata da un intermediario è
 * una copia che qualcun altro potrebbe leggere.
 */
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ codice: string }>
}): Promise<Metadata> {
  const { codice } = await params
  return metadatiPagina({
    titolo: `Biglietto ${codice.toUpperCase()}`,
    descrizione: 'Il tuo biglietto con codice QR.',
    percorso: `/biglietto/${codice}`,
    indicizza: false,
  })
}

export default async function PaginaBiglietto({
  params,
  searchParams,
}: {
  params: Promise<{ codice: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ codice }, parametri, archivio] = await Promise.all([params, searchParams, datiSito()])

  const normalizzato = codice.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const prenotazione = archivio.prenotazioni.find((voce) => voce.codice === normalizzato)

  if (!prenotazione) notFound()

  const film = archivio.film.find((voce) => voce.id === prenotazione.filmId)
  const cinema = archivio.cinema.find((voce) => voce.id === prenotazione.cinemaId)
  const sala = archivio.sale.find((voce) => voce.id === prenotazione.salaId)

  const appenaPagato = parametri.pagamento === 'ok'
  const mancanti = minutiAllInizio(prenotazione.data, prenotazione.ora)
  const passato = mancanti < -240

  return (
    <Sezione className="pt-32" ampiezza="stretta">
      {appenaPagato && prenotazione.stato !== 'in-attesa' && (
        <div className="mb-8 rounded-ampio border border-ok/40 bg-ok/6 p-6 text-center">
          <span className="inline-flex size-14 items-center justify-center rounded-full bg-ok/15 text-ok">
            <Icona nome="spunta" className="size-7" spessore={2.4} />
          </span>
          <h1 className="mt-4 font-titolo text-[1.6rem] font-semibold">Ordine confermato</h1>
          <p className="mt-2 text-[0.95rem] text-tenue">
            Ti abbiamo mandato una copia via email. Mostra il QR all’ingresso della sala.
          </p>
        </div>
      )}

      {!appenaPagato && (
        <h1 className="mb-2 font-titolo text-[2rem] font-semibold">
          {prenotazione.posti.length === 1 ? 'Il tuo biglietto' : 'I tuoi biglietti'}
        </h1>
      )}

      {/* ── Riquadro del codice ─────────────────────────────────────────── */}
      <div className="mb-8 rounded-ampio border border-dashed border-accento/40 bg-accento/5 p-6 text-center">
        <p className="text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-tenue">
          Codice prenotazione
        </p>
        <p className="tabellare mt-2 font-titolo text-[2.4rem] font-bold leading-none tracking-[0.2em]">
          {prenotazione.codice}
        </p>
        <p className="mt-3 text-[0.86rem] text-tenue">
          {elencoPosti(prenotazione.posti)} · {dataEstesa(prenotazione.data)} alle{' '}
          {prenotazione.ora}
        </p>
      </div>

      {prenotazione.stato === 'in-attesa' && (
        <Nota tono="ambra" className="mb-8" icona={<Icona nome="orologio" className="size-4" />}>
          <p className="font-medium text-testo">Pagamento non ancora completato.</p>
          <p className="mt-1">
            I biglietti non sono validi finché l’importo di{' '}
            <strong>{prezzoPieno(prenotazione.totale)}</strong> non risulta pagato. Puoi saldare
            alla cassa del cinema mostrando il codice qui sopra, fino a trenta minuti prima dello
            spettacolo.
          </p>
        </Nota>
      )}

      {prenotazione.stato === 'annullata' && (
        <Nota tono="rosso" className="mb-8" icona={<Icona nome="avviso" className="size-4" />}>
          Questa prenotazione è stata annullata. I biglietti non danno diritto all’ingresso.
        </Nota>
      )}

      {prenotazione.stato === 'rimborsata' && (
        <Nota tono="rosso" className="mb-8" icona={<Icona nome="avviso" className="size-4" />}>
          Questa prenotazione è stata rimborsata.
        </Nota>
      )}

      {passato && prenotazione.stato === 'confermata' && (
        <Nota className="mb-8" icona={<Icona nome="info" className="size-4" />}>
          Lo spettacolo è terminato. Conserviamo il biglietto nel tuo storico.
        </Nota>
      )}

      {/* ── Biglietti ───────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {prenotazione.posti.map((posto, indice) => (
          <BigliettoDigitale
            key={posto.codiceBiglietto}
            prenotazione={prenotazione}
            posto={posto}
            contenutoQr={contenutoQr(prenotazione.codice, posto.codiceBiglietto)}
            film={film}
            cinema={cinema}
            salaNome={sala?.nome ?? ''}
            impostazioni={archivio.impostazioni}
            indice={indice + 1}
            totale={prenotazione.posti.length}
          />
        ))}
      </div>

      {/* ── Food ordinato ───────────────────────────────────────────────── */}
      {prenotazione.food.length > 0 && (
        <div className="mt-8 rounded-ampio border border-bordo bg-superficie p-6">
          <h2 className="flex items-center gap-2 font-titolo text-[1.1rem] font-semibold">
            <Icona nome="popcorn" className="size-5 text-accento" />
            Da ritirare al banco
          </h2>
          <ul className="mt-4 space-y-2 text-[0.9rem]">
            {prenotazione.food.map((riga) => (
              <li key={riga.prodottoId} className="flex justify-between gap-4">
                <span className="text-tenue">
                  {riga.quantita} × {riga.nome}
                </span>
                <span className="tabellare">{prezzoPieno(riga.prezzoUnitario * riga.quantita)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[0.82rem] text-tenue">
            Mostra il codice della prenotazione al banco: non serve rimettersi in fila alla cassa.
          </p>
        </div>
      )}

      {/* ── Azioni ──────────────────────────────────────────────────────── */}
      <AzioniBiglietto codice={prenotazione.codice} className="mt-8 no-stampa" />

      <div className="mt-8 flex flex-wrap gap-3 no-stampa">
        <Bottone href="/area-personale" variante="contorno">
          <Icona nome="utente" className="size-4" />
          Area personale
        </Bottone>
        <Bottone href="/programmazione" variante="tenue">
          Altri film
        </Bottone>
      </div>

      <Nota className="mt-8 no-stampa" icona={<Icona nome="info" className="size-4" />}>
        Ogni posto ha il proprio QR e vale una sola volta. Se entrate in momenti diversi, ciascuno
        deve mostrare il proprio biglietto. Per qualsiasi problema all’ingresso, il personale può
        recuperare la prenotazione dal codice{' '}
        <strong className="tabellare text-testo">{prenotazione.codice}</strong>.{' '}
        <Link href="/termini" className="text-accento underline">
          Termini di vendita
        </Link>
        .
      </Nota>
    </Sezione>
  )
}
