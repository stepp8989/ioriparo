import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Etichetta, Nota, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'
import { datiSito } from '@/lib/sito'
import { classi, percentuale, prezzo } from '@/lib/utili'

/**
 * Abbonamenti.
 *
 * I piani non sono scritti nel codice: arrivano dall'archivio e
 * l'amministratore li crea, li ritocca e li disattiva dal pannello. Anche il
 * confronto qui sotto si costruisce da solo — colonne, vantaggi e limitazioni
 * sono quelli dei piani esistenti, quali che siano.
 *
 * Le limitazioni sono dichiarate accanto ai vantaggi, con lo stesso risalto.
 * Un abbonamento che nasconde le proprie esclusioni si disdice al secondo mese.
 */
export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { impostazioni } = await datiSito()
  return metadatiPagina({
    titolo: 'Abbonamenti',
    descrizione:
      'Piani mensili e annuali per andare al cinema quando vuoi: ingressi, formati compresi, sconti sul banco e condizioni complete.',
    percorso: '/abbonamenti',
    nomeSito: impostazioni.marchio.nome,
  })
}

export default async function PaginaAbbonamenti() {
  const archivio = await datiSito()
  if (!archivio.impostazioni.moduli.abbonamenti) notFound()

  const piani = archivio.piani
    .filter((piano) => piano.attivo)
    .sort((a, b) => a.ordine - b.ordine)

  return (
    <>
      <Sezione className="pt-32">
        <TitoloSezione
          soprattitolo="Abbonamenti"
          titolo="Vai al cinema tutto l’anno"
          sottotitolo="Quattro piani, nessun vincolo nascosto. Si disdicono dall’area personale, senza telefonate e senza raccomandate."
          allineamento="sinistra"
        />

        {piani.length === 0 ? (
          <Nota className="mt-10 max-w-2xl" icona={<Icona nome="info" className="size-4" />}>
            Nessun piano di abbonamento attivo al momento.
          </Nota>
        ) : (
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {piani.map((piano) => (
              <article
                key={piano.id}
                className={classi(
                  'relative flex flex-col overflow-hidden rounded-ampio border bg-superficie p-7 transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo',
                  piano.inEvidenza ? 'border-accento shadow-accento' : 'border-bordo',
                )}
              >
                {piano.inEvidenza && (
                  <span className="absolute right-6 top-6">
                    <Etichetta tono="pieno">Il più scelto</Etichetta>
                  </span>
                )}

                <span
                  className="inline-flex size-11 items-center justify-center rounded-full"
                  style={{ backgroundColor: `${piano.colore}22`, color: piano.colore }}
                >
                  <Icona nome="tessera" className="size-5" />
                </span>

                <h2 className="mt-5 font-titolo text-[1.5rem] font-semibold">{piano.nome}</h2>
                <p className="mt-2 min-h-[3rem] text-[0.88rem] leading-relaxed text-tenue">
                  {piano.descrizione}
                </p>

                <p className="mt-6 flex items-baseline gap-1.5">
                  <span className="font-titolo text-[2.4rem] font-bold leading-none">
                    {prezzo(piano.prezzo)}
                  </span>
                  <span className="text-[0.85rem] text-tenue">
                    /{piano.periodo === 'mensile' ? 'mese' : 'anno'}
                  </span>
                </p>

                <p className="mt-2 text-[0.82rem] text-tenue">
                  {piano.ingressiInclusi === 0
                    ? 'Ingressi illimitati'
                    : `${piano.ingressiInclusi} ingressi ${piano.periodo === 'mensile' ? 'al mese' : 'all’anno'}`}
                  {piano.ingressiInclusi > 0 && (
                    <span className="ml-1.5 opacity-70">
                      ({prezzo(piano.prezzo / piano.ingressiInclusi)} a film)
                    </span>
                  )}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {piano.vantaggi.map((vantaggio) => (
                    <li key={vantaggio} className="flex items-start gap-2.5 text-[0.86rem]">
                      <Icona nome="spunta" className="mt-0.5 size-4 shrink-0 text-ok" />
                      {vantaggio}
                    </li>
                  ))}

                  {piano.limitazioni.map((limitazione) => (
                    <li
                      key={limitazione}
                      className="flex items-start gap-2.5 text-[0.86rem] text-tenue"
                    >
                      <Icona nome="info" className="mt-0.5 size-4 shrink-0 text-attesa" />
                      {limitazione}
                    </li>
                  ))}
                </ul>

                <Bottone
                  href={`/area-personale?abbonamento=${piano.slug}`}
                  variante={piano.inEvidenza ? 'pieno' : 'contorno'}
                  className="mt-7 w-full"
                >
                  Abbonati
                </Bottone>

                {piano.scontoFood > 0 && (
                  <p className="mt-3 text-center text-[0.78rem] text-tenue">
                    {percentuale(piano.scontoFood)} di sconto sul banco compreso
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </Sezione>

      {/* ── Confronto ───────────────────────────────────────────────────── */}
      {piani.length > 1 && (
        <Sezione className="bg-sfondo-alt">
          <TitoloSezione soprattitolo="Confronto" titolo="Quale piano fa per te" allineamento="sinistra" />

          <div className="senza-barra mt-10 overflow-x-auto">
            <table className="w-full min-w-[42rem] border-collapse text-[0.88rem]">
              <caption className="sr-only">
                Confronto fra i piani di abbonamento: prezzo, ingressi, formati compresi e sconto
                sul banco.
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-48 border-b border-bordo p-4 text-left font-medium text-tenue">
                    Caratteristica
                  </th>
                  {piani.map((piano) => (
                    <th
                      key={piano.id}
                      scope="col"
                      className="border-b border-bordo p-4 text-left font-titolo text-[1rem] font-semibold"
                    >
                      {piano.nome}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { etichetta: 'Prezzo', valore: (piano: (typeof piani)[number]) => `${prezzo(piano.prezzo)} / ${piano.periodo === 'mensile' ? 'mese' : 'anno'}` },
                  {
                    etichetta: 'Ingressi',
                    valore: (piano: (typeof piani)[number]) =>
                      piano.ingressiInclusi === 0 ? 'Illimitati' : String(piano.ingressiInclusi),
                  },
                  {
                    etichetta: 'Formati compresi',
                    valore: (piano: (typeof piani)[number]) => piano.formatiInclusi.join(', '),
                  },
                  {
                    etichetta: 'Sconto sul banco',
                    valore: (piano: (typeof piani)[number]) =>
                      piano.scontoFood > 0 ? percentuale(piano.scontoFood) : '—',
                  },
                  {
                    etichetta: 'Limitazioni',
                    valore: (piano: (typeof piani)[number]) =>
                      piano.limitazioni.length > 0 ? piano.limitazioni.join(' · ') : 'Nessuna',
                  },
                ].map((riga) => (
                  <tr key={riga.etichetta}>
                    <th scope="row" className="border-b border-bordo p-4 text-left font-medium text-tenue">
                      {riga.etichetta}
                    </th>
                    {piani.map((piano) => (
                      <td key={piano.id} className="border-b border-bordo p-4">
                        {riga.valore(piano)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Nota className="mt-8 max-w-3xl" icona={<Icona nome="info" className="size-4" />}>
            L’abbonamento è personale e non cedibile: all’ingresso può essere richiesto un
            documento. Gli ingressi non utilizzati non si accumulano da un periodo al successivo.
            La disdetta si effettua dall’area personale e ha effetto alla scadenza del periodo già
            pagato.
          </Nota>
        </Sezione>
      )}
    </>
  )
}
