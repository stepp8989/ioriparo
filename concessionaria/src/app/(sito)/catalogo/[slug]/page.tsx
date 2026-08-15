import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { SchedaVeicolo } from '@/componenti/veicoli/SchedaVeicolo'
import { AzioniVeicolo } from '@/componenti/veicoli/AzioniVeicolo'
import { Galleria } from '@/componenti/veicoli/Galleria'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole, schemaVeicolo } from '@/lib/seo'
import {
  NOMI_ALIMENTAZIONE,
  NOMI_CAMBIO,
  NOMI_CONDIZIONE,
  NOMI_TIPOLOGIA,
  type Veicolo,
} from '@/lib/tipi'
import {
  chilometri,
  consumo,
  numero,
  percentuale,
  prezzo,
  rataMensile,
  titoloVeicolo,
} from '@/lib/utili'

/**
 * Scheda completa di un veicolo.
 *
 * È la pagina che converte: galleria, caratteristiche tecniche, dotazioni e —
 * sempre visibile mentre si scorre — il riquadro con prezzo e azioni.
 */

/** Le schede vengono generate in anticipo per tutti i veicoli in archivio. */
export async function generateStaticParams() {
  const { veicoli } = await leggi()
  return veicoli.filter((veicolo) => veicolo.visibile).map((veicolo) => ({ slug: veicolo.slug }))
}

async function trovaVeicolo(slug: string): Promise<Veicolo | null> {
  const { veicoli } = await leggi()
  return veicoli.find((veicolo) => veicolo.slug === slug && veicolo.visibile) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const veicolo = await trovaVeicolo(slug)

  if (!veicolo) {
    return metadatiPagina({
      titolo: 'Veicolo non trovato',
      descrizione: 'Il veicolo cercato non è più disponibile.',
      percorso: `/catalogo/${slug}`,
      indicizza: false,
    })
  }

  const titolo = titoloVeicolo(veicolo)

  return metadatiPagina({
    titolo: `${titolo} — ${veicolo.anno}`,
    descrizione:
      `${titolo}, ${NOMI_CONDIZIONE[veicolo.condizione].toLowerCase()} del ${veicolo.anno} con ` +
      `${chilometri(veicolo.chilometri).toLowerCase()}, ${NOMI_ALIMENTAZIONE[veicolo.alimentazione].toLowerCase()}, ` +
      `cambio ${NOMI_CAMBIO[veicolo.cambio].toLowerCase()}, ${veicolo.potenzaCv} CV. ` +
      `${prezzo(veicolo.prezzo)} con garanzia ${veicolo.garanziaMesi} mesi.`,
    percorso: `/catalogo/${veicolo.slug}`,
    immagine: veicolo.immagini[0],
  })
}

/** Una riga della tabella tecnica. */
function Dato({ icona, voce, valore }: { icona: NomeIcona; voce: string; valore: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-bordo py-3.5">
      <Icona nome={icona} className="size-4 shrink-0 text-accento" />
      <dt className="flex-1 text-[0.88rem] text-tenue">{voce}</dt>
      <dd className="text-[0.92rem] font-semibold tabellare">{valore}</dd>
    </div>
  )
}

export default async function PaginaVeicolo({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const veicolo = await trovaVeicolo(slug)

  if (!veicolo) notFound()

  const { veicoli } = await leggi()
  const titolo = titoloVeicolo(veicolo)

  // Veicoli simili: stesso tipo, prezzo entro il 35%, esclusi i venduti.
  const simili = veicoli
    .filter(
      (altro) =>
        altro.id !== veicolo.id &&
        altro.visibile &&
        altro.stato !== 'venduto' &&
        altro.tipo === veicolo.tipo &&
        Math.abs(altro.prezzo - veicolo.prezzo) <= veicolo.prezzo * 0.35,
    )
    .sort((a, b) => Math.abs(a.prezzo - veicolo.prezzo) - Math.abs(b.prezzo - veicolo.prezzo))
    .slice(0, 3)

  const sconto =
    veicolo.prezzoPrecedente && veicolo.prezzoPrecedente > veicolo.prezzo
      ? Math.round((1 - veicolo.prezzo / veicolo.prezzoPrecedente) * 100)
      : null

  // Rata di esempio mostrata sotto il prezzo: anticipo del 20% e sessanta mesi,
  // gli stessi valori con cui parte il simulatore della pagina Finanziamenti.
  const rataEsempio = rataMensile(
    veicolo.prezzo * 0.8 + AZIENDA.finanziamento.speseIstruttoria,
    AZIENDA.finanziamento.tanPredefinito,
    60,
  )

  const scheda: Array<{ icona: NomeIcona; voce: string; valore: string }> = [
    { icona: 'calendario', voce: 'Immatricolazione', valore: String(veicolo.anno) },
    { icona: 'tachimetro', voce: 'Chilometri', valore: chilometri(veicolo.chilometri) },
    {
      icona: 'benzina',
      voce: 'Alimentazione',
      valore: NOMI_ALIMENTAZIONE[veicolo.alimentazione],
    },
    { icona: 'cambio', voce: 'Cambio', valore: NOMI_CAMBIO[veicolo.cambio] },
    { icona: 'fulmine', voce: 'Potenza', valore: `${veicolo.potenzaCv} CV (${veicolo.potenzaKw} kW)` },
    ...(veicolo.cilindrata > 0
      ? [
          {
            icona: 'motore' as NomeIcona,
            voce: 'Cilindrata',
            valore: `${numero(veicolo.cilindrata)} cm³`,
          },
        ]
      : []),
    { icona: 'auto', voce: 'Tipologia', valore: NOMI_TIPOLOGIA[veicolo.tipologia] },
    { icona: 'verifica', voce: 'Condizione', valore: NOMI_CONDIZIONE[veicolo.condizione] },
    ...(veicolo.tipo === 'auto'
      ? [
          { icona: 'persone' as NomeIcona, voce: 'Posti', valore: String(veicolo.posti) },
          { icona: 'porta' as NomeIcona, voce: 'Porte', valore: String(veicolo.porte) },
        ]
      : []),
    { icona: 'lucido', voce: 'Colore', valore: veicolo.colore },
    { icona: 'goccia', voce: 'Consumo misto', valore: consumo(veicolo) },
    {
      icona: 'co2',
      voce: 'Emissioni CO₂',
      valore: veicolo.emissioniCo2 > 0 ? `${veicolo.emissioniCo2} g/km` : 'Zero emissioni',
    },
    { icona: 'scudo', voce: 'Classe emissioni', valore: veicolo.classeEmissioni },
    ...(veicolo.autonomiaKm
      ? [
          {
            icona: 'fulmine' as NomeIcona,
            voce: 'Autonomia elettrica',
            valore: `${veicolo.autonomiaKm} km`,
          },
        ]
      : []),
    { icona: 'lucchetto', voce: 'Garanzia', valore: `${veicolo.garanziaMesi} mesi` },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaVeicolo(veicolo)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            schemaBriciole([
              { nome: 'Catalogo', percorso: '/catalogo' },
              { nome: titolo, percorso: `/catalogo/${veicolo.slug}` },
            ]),
          ),
        }}
      />

      <div className="bg-notte pt-28 pb-8 text-white sm:pt-32">
        <div className="contenitore">
          <nav aria-label="Percorso" className="mb-6">
            <ol className="flex flex-wrap items-center gap-2 text-[0.8rem] text-white/45">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Home
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Icona nome="chevronDestra" className="size-3" />
                <Link href="/catalogo" className="transition-colors hover:text-white">
                  Catalogo
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <Icona nome="chevronDestra" className="size-3" />
                <span className="text-white/75" aria-current="page">
                  {titolo}
                </span>
              </li>
            </ol>
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            <Etichetta tono="accento">{NOMI_CONDIZIONE[veicolo.condizione]}</Etichetta>
            <Etichetta tono="scuro">{NOMI_TIPOLOGIA[veicolo.tipologia]}</Etichetta>
            {veicolo.stato !== 'disponibile' && (
              <Etichetta tono={veicolo.stato === 'venduto' ? 'rosso' : 'ambra'}>
                {veicolo.stato === 'venduto' ? 'Venduto' : 'Prenotato'}
              </Etichetta>
            )}
            {veicolo.noleggio && <Etichetta tono="scuro">Anche a noleggio</Etichetta>}
          </div>

          <h1 className="mt-5 font-titolo text-[2rem] leading-tight font-semibold sm:text-4xl lg:text-[3rem]">
            {veicolo.marca} {veicolo.modello}
            <span className="block text-white/55">{veicolo.allestimento}</span>
          </h1>
        </div>
      </div>

      <div className="bg-sfondo pt-10 pb-20">
        <div className="contenitore grid gap-10 lg:grid-cols-[1.6fr_1fr] lg:gap-14">
          <div>
            <Galleria immagini={veicolo.immagini} video={veicolo.video} titolo={titolo} />

            <Rivela className="mt-14">
              <h2 className="font-titolo text-[1.5rem] font-semibold">Descrizione</h2>
              <p className="mt-5 text-[1rem] leading-relaxed text-tenue">{veicolo.descrizione}</p>
            </Rivela>

            <Rivela className="mt-14">
              <h2 className="font-titolo text-[1.5rem] font-semibold">Caratteristiche tecniche</h2>
              <dl className="mt-6 grid gap-x-10 sm:grid-cols-2">
                {scheda.map((riga) => (
                  <Dato key={riga.voce} icona={riga.icona} voce={riga.voce} valore={riga.valore} />
                ))}
              </dl>
            </Rivela>

            <Rivela className="mt-14">
              <h2 className="font-titolo text-[1.5rem] font-semibold">Dotazioni</h2>
              <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {veicolo.dotazioni.map((dotazione) => (
                  <li key={dotazione} className="flex items-start gap-3 text-[0.92rem]">
                    <Icona nome="spunta" className="mt-1 size-4 shrink-0 text-accento" />
                    {dotazione}
                  </li>
                ))}
              </ul>
            </Rivela>

            {veicolo.noleggio && (
              <Rivela className="mt-14 rounded-ampio border border-bordo bg-superficie-alt p-7">
                <h2 className="flex items-center gap-3 font-titolo text-[1.3rem] font-semibold">
                  <Icona nome="chiave" className="size-5 text-accento" />
                  Disponibile anche a noleggio
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  {[
                    { nome: 'Al giorno', valore: veicolo.noleggio.giornaliera },
                    { nome: 'A settimana', valore: veicolo.noleggio.settimanale },
                    { nome: 'Al mese', valore: veicolo.noleggio.mensile },
                  ].map((tariffa) => (
                    <div
                      key={tariffa.nome}
                      className="rounded-morbido border border-bordo bg-superficie p-4 text-center"
                    >
                      <p className="text-[0.72rem] tracking-[0.14em] text-tenue uppercase">
                        {tariffa.nome}
                      </p>
                      <p className="mt-2 font-titolo text-[1.4rem] font-semibold tabellare">
                        {prezzo(tariffa.valore)}
                      </p>
                    </div>
                  ))}
                </div>
                <p className="mt-5 text-[0.88rem] text-tenue">
                  Assicurazione kasko, soccorso stradale e {veicolo.noleggio.kmInclusiGiorno} km al
                  giorno inclusi. Cauzione {prezzo(veicolo.noleggio.cauzione)}, età minima{' '}
                  {veicolo.noleggio.etaMinima} anni.
                </p>
                <Link
                  href={`/noleggio?veicolo=${veicolo.slug}`}
                  className="mt-5 inline-flex items-center gap-2 text-[0.9rem] font-semibold text-accento sottolinea"
                >
                  Prenota il noleggio
                  <Icona nome="freccia" className="size-4" />
                </Link>
              </Rivela>
            )}
          </div>

          {/* Riquadro del prezzo: resta agganciato mentre si scorre la scheda. */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-ampio border border-bordo bg-superficie p-7 shadow-morbida">
              {veicolo.prezzoPrecedente && (
                <p className="flex items-center gap-3">
                  <span className="text-[0.95rem] text-tenue line-through tabellare">
                    {prezzo(veicolo.prezzoPrecedente)}
                  </span>
                  {sconto && <Etichetta tono="accento">−{sconto}%</Etichetta>}
                </p>
              )}

              <p className="mt-1 font-titolo text-[2.4rem] leading-none font-semibold tabellare">
                {prezzo(veicolo.prezzo)}
              </p>
              <p className="mt-2 text-[0.85rem] text-tenue">
                Prezzo chiavi in mano, IVA e passaggio di proprietà compresi.
              </p>

              <div className="my-6 border-y border-bordo py-5">
                <p className="text-[0.88rem] text-tenue">
                  Oppure da{' '}
                  <span className="font-titolo text-[1.3rem] font-semibold text-accento tabellare">
                    {prezzo(Math.round(rataEsempio))}
                  </span>{' '}
                  al mese
                </p>
                <p className="mt-1 text-[0.75rem] text-tenue">
                  60 rate, anticipo 20%, TAN {percentuale(AZIENDA.finanziamento.tanPredefinito)} — esempio non
                  vincolante.
                </p>
              </div>

              <AzioniVeicolo
                veicoloId={veicolo.id}
                titolo={titolo}
                prezzo={veicolo.prezzo}
                disponibile={veicolo.stato === 'disponibile'}
              />

              <ul className="mt-7 space-y-2.5 border-t border-bordo pt-6 text-[0.85rem] text-tenue">
                {[
                  `Garanzia ${veicolo.garanziaMesi} mesi su motore e cambio`,
                  'Controllo in 120 punti documentato',
                  'Chilometraggio certificato',
                  'Permuta e finanziamento su misura',
                ].map((punto) => (
                  <li key={punto} className="flex items-start gap-2.5">
                    <Icona nome="spunta" className="mt-0.5 size-3.5 shrink-0 text-accento" />
                    {punto}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      {simili.length > 0 && (
        <Sezione className="border-t border-bordo bg-sfondo-alt">
          <TitoloSezione
            soprattitolo="Potrebbero interessarvi"
            titolo="Veicoli simili"
            allineamento="sinistra"
          />
          <GruppoRivelato className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {simili.map((altro) => (
              <FiglioRivelato key={altro.id}>
                <SchedaVeicolo veicolo={altro} className="h-full" />
              </FiglioRivelato>
            ))}
          </GruppoRivelato>
        </Sezione>
      )}
    </>
  )
}
