import Link from 'next/link'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { leggi } from '@/lib/archivio'
import { dataBreve, media, oggiIso, prezzo } from '@/lib/utili'

/**
 * Riepilogo del pannello.
 *
 * Risponde alle tre domande che lo staff si fa aprendo la pagina: chi arriva
 * oggi, cosa è rimasto da guardare, com'è messo il menù.
 */
export default async function PaginaRiepilogo() {
  const { prenotazioni, messaggi, piatti, recensioni, eventi } = await leggi()
  const oggi = oggiIso()

  const diOggi = prenotazioni
    .filter((voce) => voce.data === oggi && voce.stato !== 'annullata')
    .sort((primo, secondo) => primo.ora.localeCompare(secondo.ora))

  const prossime = prenotazioni
    .filter((voce) => voce.data > oggi && voce.stato !== 'annullata')
    .sort((primo, secondo) => `${primo.data}${primo.ora}`.localeCompare(`${secondo.data}${secondo.ora}`))
    .slice(0, 8)

  const pubblicate = recensioni.filter((voce) => voce.pubblicata)

  const numeri: Array<{ etichetta: string; valore: string; nota: string; icona: NomeIcona }> = [
    {
      etichetta: 'Coperti oggi',
      valore: String(diOggi.reduce((somma, voce) => somma + voce.persone, 0)),
      nota: `${diOggi.length} ${diOggi.length === 1 ? 'tavolo' : 'tavoli'}`,
      icona: 'persone',
    },
    {
      etichetta: 'Prenotazioni future',
      valore: String(prenotazioni.filter((voce) => voce.data > oggi && voce.stato !== 'annullata').length),
      nota: 'dai giorni successivi',
      icona: 'calendario',
    },
    {
      etichetta: 'Messaggi da leggere',
      valore: String(messaggi.filter((voce) => !voce.letto).length),
      nota: `${messaggi.length} in totale`,
      icona: 'posta',
    },
    {
      etichetta: 'Voto medio',
      valore: pubblicate.length
        ? media(pubblicate.map((voce) => voce.voto)).toLocaleString('it-IT', {
            minimumFractionDigits: 1,
          })
        : '—',
      nota: `${pubblicate.length} recensioni pubblicate`,
      icona: 'stellaVuota',
    },
  ]

  const scorciatoie: Array<{ etichetta: string; percorso: string; icona: NomeIcona; nota: string }> = [
    {
      etichetta: 'Aggiungi un piatto',
      percorso: '/admin/menu',
      icona: 'posate',
      nota: `${piatti.filter((voce) => voce.visibile).length} piatti in carta`,
    },
    {
      etichetta: 'Gestisci le prenotazioni',
      percorso: '/admin/prenotazioni',
      icona: 'calendario',
      nota: `${prenotazioni.length} richieste in archivio`,
    },
    {
      etichetta: 'Aggiorna gli orari',
      percorso: '/admin/orari',
      icona: 'orologio',
      nota: 'Aperture di pranzo e cena',
    },
    {
      etichetta: 'Eventi e promozioni',
      percorso: '/admin/eventi',
      icona: 'campanella',
      nota: `${eventi.filter((voce) => voce.attivo).length} attivi`,
    },
  ]

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-titolo text-3xl">Buon servizio</h1>
      <p className="mt-1.5 text-sm text-tenue">
        Riepilogo di {dataBreve(oggi)}. Tutto quello che modificate qui compare subito sul sito.
      </p>

      {/* Numeri del giorno */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {numeri.map((numero) => (
          <div key={numero.etichetta} className="border border-bordo bg-superficie p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-tenue">
                {numero.etichetta}
              </p>
              <Icona nome={numero.icona} className="size-4 shrink-0 text-accento" />
            </div>
            <p className="mt-3 font-titolo text-4xl">{numero.valore}</p>
            <p className="mt-1 text-xs text-tenue">{numero.nota}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Servizio di oggi */}
        <section className="border border-bordo bg-superficie">
          <header className="flex items-center justify-between border-b border-bordo px-5 py-4">
            <h2 className="font-titolo text-xl">Il servizio di oggi</h2>
            <Link
              href="/admin/prenotazioni"
              className="text-xs text-tenue transition-colors hover:text-accento"
            >
              Vedi tutte
            </Link>
          </header>

          {diOggi.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-tenue">
              Nessuna prenotazione per oggi.
            </p>
          ) : (
            <ul className="divide-y divide-bordo">
              {diOggi.map((prenotazione) => (
                <li key={prenotazione.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-14 shrink-0 font-titolo text-xl tabular-nums text-accento">
                    {prenotazione.ora}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {prenotazione.nome} {prenotazione.cognome}
                    </span>
                    <span className="block truncate text-xs text-tenue">
                      {prenotazione.persone}{' '}
                      {prenotazione.persone === 1 ? 'persona' : 'persone'} · {prenotazione.telefono}
                      {prenotazione.note && ` · ${prenotazione.note}`}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-xs text-tenue">{prenotazione.codice}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Prossimi giorni */}
        <section className="border border-bordo bg-superficie">
          <header className="border-b border-bordo px-5 py-4">
            <h2 className="font-titolo text-xl">Prossimi giorni</h2>
          </header>

          {prossime.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-tenue">
              Nessuna prenotazione nei giorni successivi.
            </p>
          ) : (
            <ul className="divide-y divide-bordo">
              {prossime.map((prenotazione) => (
                <li key={prenotazione.id} className="flex items-center gap-4 px-5 py-3.5">
                  <span className="w-24 shrink-0 text-xs text-tenue">
                    {dataBreve(prenotazione.data)}
                  </span>
                  <span className="w-12 shrink-0 text-sm tabular-nums">{prenotazione.ora}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {prenotazione.nome} {prenotazione.cognome}
                  </span>
                  <span className="shrink-0 text-xs text-tenue">{prenotazione.persone} p.</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Scorciatoie */}
      <section className="mt-8">
        <h2 className="mb-4 font-titolo text-xl">Azioni rapide</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {scorciatoie.map((scorciatoia) => (
            <Link
              key={scorciatoia.percorso}
              href={scorciatoia.percorso}
              className="group border border-bordo bg-superficie p-5 transition-colors hover:border-accento"
            >
              <span className="grid size-10 place-items-center rounded-full border border-bordo text-accento">
                <Icona nome={scorciatoia.icona} className="size-[1.05rem]" />
              </span>
              <p className="mt-4 text-sm font-medium">{scorciatoia.etichetta}</p>
              <p className="mt-1 text-xs text-tenue">{scorciatoia.nota}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stato del menù */}
      <section className="mt-8 border border-bordo bg-superficie p-5">
        <h2 className="font-titolo text-xl">Stato del menù</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
          {[
            ['Piatti visibili', String(piatti.filter((voce) => voce.visibile).length)],
            ['Nascosti', String(piatti.filter((voce) => !voce.visibile).length)],
            ['In evidenza in home', String(piatti.filter((voce) => voce.inEvidenza).length)],
            [
              'Prezzo medio',
              piatti.length
                ? prezzo(
                    Math.round(
                      (piatti.reduce((somma, voce) => somma + voce.prezzo, 0) / piatti.length) * 100,
                    ) / 100,
                  )
                : '—',
            ],
          ].map(([etichetta, valore]) => (
            <div key={etichetta}>
              <dt className="text-xs uppercase tracking-[0.14em] text-tenue">{etichetta}</dt>
              <dd className="mt-1 font-titolo text-2xl">{valore}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}
