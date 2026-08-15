import type { Metadata } from 'next'
import Image from 'next/image'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Confronto } from '@/componenti/detailing/Confronto'
import { PrenotaDetailing } from '@/componenti/detailing/PrenotaDetailing'
import { Recensioni } from '@/componenti/home/Recensioni'
import { Icona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { durataTrattamento, TRATTAMENTI } from '@/dati/servizi'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'
import { prezzo } from '@/lib/utili'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Car detailing e trattamenti ceramici',
  descrizione:
    'Lavaggio premium, lucidatura correttiva, nano ceramic coating, sanificazione all’ozono, ' +
    'wrapping e ripristino fari a Tortolì. Cabina dedicata, prodotti professionali e fotografie ' +
    'del prima e del dopo.',
  percorso: '/detailing',
})

export default async function PaginaDetailing() {
  const { recensioni } = await leggi()

  const confronti = TRATTAMENTI.filter((trattamento) => trattamento.confronto !== null)
  const recensioniDetailing = recensioni.filter(
    (recensione) => recensione.servizio === 'detailing' && recensione.pubblicata,
  )

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Detailing', percorso: '/detailing' }])),
        }}
      />

      <Intestazione
        soprattitolo="Reparto detailing"
        titolo={
          <>
            La cura del veicolo,
            <br />
            <span className="testo-accento">fatta come si deve</span>
          </>
        }
        sottotitolo="Cabina dedicata, illuminazione a temperatura controllata, prodotti professionali e tempi di lavorazione veri. Ogni intervento è documentato con fotografie del prima e del dopo."
        immagine="/immagini/servizi/detailing.jpg"
        briciole={[{ nome: 'Detailing', percorso: '/detailing' }]}
      />

      {/* Trattamenti */}
      <Sezione id="trattamenti" className="bg-sfondo">
        <TitoloSezione
          soprattitolo="I trattamenti"
          titolo={
            <>
              Dieci lavorazioni, <span className="testo-accento">un solo standard</span>
            </>
          }
          sottotitolo="Prezzi di partenza per una vettura di segmento medio in condizioni normali. Il preventivo definitivo arriva dopo aver visto il veicolo, mai dopo il lavoro."
        />

        <GruppoRivelato className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TRATTAMENTI.map((trattamento) => (
            <FiglioRivelato key={trattamento.id}>
              <article className="flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={trattamento.immagine}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 768px) 46vw, 92vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-notte/85 to-transparent" />
                  <span className="absolute bottom-4 left-4 inline-flex size-11 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white backdrop-blur-sm">
                    <Icona nome={trattamento.icona} className="size-5" />
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-titolo text-[1.15rem] font-semibold">{trattamento.nome}</h3>
                  <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">
                    {trattamento.descrizione}
                  </p>

                  <ul className="mt-5 space-y-2 text-[0.85rem] text-tenue">
                    {trattamento.comprende.slice(0, 4).map((voce) => (
                      <li key={voce} className="flex items-start gap-2.5">
                        <Icona nome="spunta" className="mt-0.5 size-3.5 shrink-0 text-accento" />
                        {voce}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex items-end justify-between gap-4 border-t border-bordo pt-5">
                    <div>
                      <p className="text-[0.72rem] tracking-[0.12em] text-tenue uppercase">
                        A partire da
                      </p>
                      <p className="font-titolo text-[1.4rem] leading-none font-semibold tabellare">
                        {prezzo(trattamento.prezzoDa)}
                      </p>
                    </div>
                    <Etichetta>
                      <Icona nome="orologio" className="size-3" />
                      {durataTrattamento(trattamento.ore)}
                    </Etichetta>
                  </div>
                </div>
              </article>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Prima e dopo */}
      <Sezione className="relative overflow-hidden border-y border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Galleria"
          titolo={
            <>
              Prima e <span className="testo-accento">dopo</span>
            </>
          }
          sottotitolo="Trascinate il cursore per vedere la differenza. Sono lavorazioni eseguite nella nostra cabina, senza ritocchi alle fotografie."
        />

        <GruppoRivelato className="mt-14 grid gap-8 lg:grid-cols-2">
          {confronti.map((trattamento) => (
            <FiglioRivelato key={trattamento.id}>
              <Confronto
                prima={trattamento.confronto!.prima}
                dopo={trattamento.confronto!.dopo}
                titolo={trattamento.nome}
              />
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Come lavoriamo */}
      <Sezione className="relative overflow-hidden bg-notte text-white">
        <div className="griglia-tecnica absolute inset-0" aria-hidden />
        <div className="relative">
          <TitoloSezione
            soprattitolo="Il metodo"
            titolo="Perché ci vogliono giorni, non ore"
            sottotitolo="Un trattamento ceramico fatto in mezza giornata non è un trattamento ceramico. Ecco dove finisce il tempo."
            chiaro
          />

          <GruppoRivelato className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                numero: '01',
                titolo: 'Decontaminazione',
                testo:
                  'Lavaggio a due secchi, rimozione chimica dei depositi ferrosi e passaggio di clay bar su tutta la superficie.',
              },
              {
                numero: '02',
                titolo: 'Misurazione',
                testo:
                  'Spessimetro su ogni pannello: sapere quanto trasparente resta decide quanto si può correggere senza rischi.',
              },
              {
                numero: '03',
                titolo: 'Correzione',
                testo:
                  'Da uno a tre passaggi di levigatura con paste di grana decrescente, controllando il risultato sotto lampada.',
              },
              {
                numero: '04',
                titolo: 'Protezione',
                testo:
                  'Sgrassaggio, applicazione del rivestimento in cabina e polimerizzazione a infrarossi prima della riconsegna.',
              },
            ].map((passaggio) => (
              <FiglioRivelato key={passaggio.numero}>
                <p className="font-titolo text-[2.2rem] leading-none font-semibold text-accento tabellare">
                  {passaggio.numero}
                </p>
                <h3 className="mt-4 font-titolo text-[1.1rem] font-semibold">{passaggio.titolo}</h3>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-white/60">
                  {passaggio.testo}
                </p>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>

          <Rivela ritardo={0.2} className="mt-14">
            <p className="mx-auto max-w-2xl rounded-ampio border border-white/10 bg-white/5 p-6 text-center text-[0.92rem] leading-relaxed text-white/70">
              <Icona nome="info" className="mb-3 inline-block size-5 text-accento" />
              <br />
              Sui veicoli che vendiamo il detailing è compreso: nessun mezzo lascia il piazzale senza
              essere passato di qui.
            </p>
          </Rivela>
        </div>
      </Sezione>

      {recensioniDetailing.length > 0 && <Recensioni recensioni={recensioniDetailing} />}

      {/* Prenotazione */}
      <Sezione id="prenota" className="border-t border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Appuntamento"
          titolo={
            <>
              Portateci il <span className="testo-accento">vostro veicolo</span>
            </>
          }
          sottotitolo="Scegliete il trattamento e il giorno che preferite: vi confermiamo l’orario per telefono entro poche ore."
        />

        <div className="mt-14">
          <PrenotaDetailing />
        </div>
      </Sezione>
    </>
  )
}
