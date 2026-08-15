import type { Metadata } from 'next'
import Image from 'next/image'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { PrenotaNoleggio } from '@/componenti/noleggio/PrenotaNoleggio'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'
import { metodiDisponibili } from '@/lib/pagamenti'
import { NOMI_TIPO_VEICOLO, type TipoVeicolo } from '@/lib/tipi'
import { prezzo, titoloVeicolo } from '@/lib/utili'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Noleggio auto e moto',
  descrizione:
    'Noleggio a breve e lungo termine a Tortolì: auto, scooter e maxi enduro con assicurazione ' +
    'kasko, soccorso stradale e consegna a domicilio inclusi. Tariffe giornaliere, settimanali e ' +
    'mensili, prenotazione e pagamento online.',
  percorso: '/noleggio',
})

const INCLUSI: Array<{ icona: NomeIcona; titolo: string; testo: string }> = [
  {
    icona: 'scudo',
    titolo: 'Assicurazione completa',
    testo: 'Responsabilità civile, furto e incendio, kasko con franchigia azzerabile al ritiro.',
  },
  {
    icona: 'chiaveInglese',
    titolo: 'Soccorso stradale 24 ore',
    testo: 'In tutta la Sardegna, con veicolo sostitutivo in caso di fermo prolungato.',
  },
  {
    icona: 'consegna',
    titolo: 'Consegna a domicilio',
    testo: 'Gratuita entro trenta chilometri per i noleggi di almeno tre giorni.',
  },
  {
    icona: 'goccia',
    titolo: 'Veicolo igienizzato',
    testo: 'Ogni mezzo passa dal reparto detailing prima di ogni consegna.',
  },
  {
    icona: 'strada',
    titolo: 'Chilometri inclusi',
    testo: 'Da 150 a 250 km al giorno secondo il veicolo, eccedenza a 0,25 €/km.',
  },
  {
    icona: 'carta',
    titolo: 'Pagamento online',
    testo: 'Acconto con carta o PayPal, saldo al ritiro. Oppure tutto in sede, come preferite.',
  },
]

export default async function PaginaNoleggio({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ veicoli }, parametri] = await Promise.all([leggi(), searchParams])

  const flotta = veicoli.filter(
    (veicolo) => veicolo.visibile && veicolo.noleggio && veicolo.stato !== 'venduto',
  )

  const tipoScelto = typeof parametri.tipo === 'string' ? parametri.tipo : null
  const veicoloScelto = typeof parametri.veicolo === 'string' ? parametri.veicolo : ''

  const perTipo = (tipo: TipoVeicolo) => flotta.filter((veicolo) => veicolo.tipo === tipo)

  const tariffaMinima = flotta.length
    ? Math.min(...flotta.map((veicolo) => veicolo.noleggio?.giornaliera ?? Infinity))
    : 0

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Noleggio', percorso: '/noleggio' }])),
        }}
      />

      <Intestazione
        soprattitolo="Noleggio auto e moto"
        titolo={
          <>
            Un mezzo pronto,
            <br />
            <span className="testo-accento">da un giorno a un anno</span>
          </>
        }
        sottotitolo={`Flotta di ${AZIENDA.numeri.veicoliFlotta} veicoli recenti, assicurazione e soccorso stradale sempre inclusi. A partire da ${prezzo(tariffaMinima)} al giorno.`}
        immagine="/immagini/servizi/noleggio-auto.jpg"
        briciole={[{ nome: 'Noleggio', percorso: '/noleggio' }]}
      />

      {/* Flotta */}
      <Sezione className="bg-sfondo">
        <TitoloSezione
          soprattitolo="La flotta"
          titolo={
            <>
              Veicoli <span className="testo-accento">disponibili</span>
            </>
          }
          sottotitolo="Tariffe già comprensive di assicurazione, manutenzione e bollo. L’unica cosa che aggiungete è il carburante."
        />

        {(['auto', 'moto'] as TipoVeicolo[])
          .filter((tipo) => !tipoScelto || tipoScelto === tipo || perTipo(tipo).length > 0)
          .map((tipo) => {
            const elenco = perTipo(tipo)
            if (elenco.length === 0) return null

            return (
              <div key={tipo} className="mt-16 first:mt-14">
                <h3 className="mb-8 flex items-center gap-3 font-titolo text-[1.4rem] font-semibold">
                  <Icona nome={tipo === 'auto' ? 'auto' : 'moto'} className="size-6 text-accento" />
                  {NOMI_TIPO_VEICOLO[tipo]}
                  <span className="text-[0.9rem] font-normal text-tenue">
                    ({elenco.length} {elenco.length === 1 ? 'veicolo' : 'veicoli'})
                  </span>
                </h3>

                <GruppoRivelato className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {elenco.map((veicolo) => (
                    <FiglioRivelato key={veicolo.id}>
                      <article className="flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
                        <div className="relative aspect-[16/10] overflow-hidden bg-antracite">
                          <Image
                            src={veicolo.immagini[0]}
                            alt={titoloVeicolo(veicolo)}
                            fill
                            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 92vw"
                            className="object-cover"
                          />
                          {veicolo.noleggio?.consegnaDomicilio && (
                            <span className="absolute top-3 left-3">
                              <Etichetta tono="scuro">
                                <Icona nome="consegna" className="size-3" />A domicilio
                              </Etichetta>
                            </span>
                          )}
                        </div>

                        <div className="flex flex-1 flex-col p-6">
                          <p className="text-[0.72rem] font-semibold tracking-[0.2em] text-accento uppercase">
                            {veicolo.marca}
                          </p>
                          <h4 className="mt-1.5 text-[1.1rem] font-semibold">{veicolo.modello}</h4>
                          <p className="mt-1 text-[0.85rem] text-tenue">{veicolo.allestimento}</p>

                          <dl className="mt-5 space-y-2 border-t border-bordo pt-4 text-[0.88rem]">
                            {[
                              { nome: 'Al giorno', valore: veicolo.noleggio?.giornaliera ?? 0 },
                              { nome: 'A settimana', valore: veicolo.noleggio?.settimanale ?? 0 },
                              { nome: 'Al mese', valore: veicolo.noleggio?.mensile ?? 0 },
                            ].map((tariffa) => (
                              <div key={tariffa.nome} className="flex justify-between gap-4">
                                <dt className="text-tenue">{tariffa.nome}</dt>
                                <dd className="font-semibold tabellare">{prezzo(tariffa.valore)}</dd>
                              </div>
                            ))}
                          </dl>

                          <p className="mt-4 text-[0.78rem] text-tenue">
                            Cauzione {prezzo(veicolo.noleggio?.cauzione ?? 0)} · età minima{' '}
                            {veicolo.noleggio?.etaMinima} anni ·{' '}
                            {veicolo.noleggio?.kmInclusiGiorno} km/giorno
                          </p>

                          <a
                            href="#prenota"
                            className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.9rem] font-semibold text-accento sottolinea"
                          >
                            Prenota questo veicolo
                            <Icona nome="freccia" className="size-4" />
                          </a>
                        </div>
                      </article>
                    </FiglioRivelato>
                  ))}
                </GruppoRivelato>
              </div>
            )
          })}
      </Sezione>

      {/* Cosa è incluso */}
      <Sezione className="border-y border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Sempre compreso"
          titolo="Nel prezzo c’è tutto"
          sottotitolo="Nessun costo che compare alla riconsegna: quello che leggete è quello che pagate."
        />

        <GruppoRivelato className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {INCLUSI.map((voce) => (
            <FiglioRivelato
              key={voce.titolo}
              className="rounded-ampio border border-bordo bg-superficie p-6"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accento/10 text-accento">
                <Icona nome={voce.icona} className="size-5" />
              </span>
              <h3 className="mt-5 font-titolo text-[1.05rem] font-semibold">{voce.titolo}</h3>
              <p className="mt-2 text-[0.88rem] leading-relaxed text-tenue">{voce.testo}</p>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Prenotazione */}
      <Sezione id="prenota" className="bg-sfondo">
        <TitoloSezione
          soprattitolo="Prenotazione online"
          titolo={
            <>
              Prenotate in <span className="testo-accento">due minuti</span>
            </>
          }
          sottotitolo="Scegliete veicolo e periodo sul calendario: le date già impegnate sono segnate. Confermiamo per email, di solito entro un’ora."
        />

        <div className="mt-14">
          <PrenotaNoleggio
            veicoli={flotta}
            veicoloIniziale={veicoloScelto}
            metodiPagamento={metodiDisponibili()}
          />
        </div>
      </Sezione>
    </>
  )
}
