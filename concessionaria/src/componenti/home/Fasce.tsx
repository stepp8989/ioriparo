import Image from 'next/image'
import { Contatore } from '@/componenti/animazioni/Contatore'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA } from '@/dati/azienda'
import { prezzo } from '@/lib/utili'
import type { Veicolo } from '@/lib/tipi'

/**
 * Le fasce di racconto della home: noleggio, detailing e traguardi.
 *
 * Stanno in un file solo perché condividono la stessa impaginazione a due
 * colonne e gli stessi accorgimenti sulle immagini; separarle significherebbe
 * ripetere tre volte le stesse classi.
 */

/* ── Noleggio ────────────────────────────────────────────────────────────── */

const VANTAGGI_NOLEGGIO = [
  { icona: 'scudo', testo: 'Assicurazione kasko e soccorso stradale sempre inclusi' },
  { icona: 'consegna', testo: 'Consegna a domicilio gratuita entro trenta chilometri' },
  { icona: 'calendario', testo: 'Da un giorno a un anno, senza penali di riconsegna' },
  { icona: 'carta', testo: 'Prenotazione e pagamento online in due minuti' },
] as const

export function FasciaNoleggio({ veicoli }: { veicoli: Veicolo[] }) {
  const noleggiabili = veicoli.filter((veicolo) => veicolo.visibile && veicolo.noleggio)
  const tariffaMinima = Math.min(
    ...noleggiabili.map((veicolo) => veicolo.noleggio?.giornaliera ?? Infinity),
  )

  return (
    <Sezione className="bg-sfondo">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Rivela da="destra" className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/3] overflow-hidden rounded-ampio shadow-rilievo">
            <Image
              src="/immagini/servizi/noleggio-auto.jpg"
              alt="Flotta a noleggio"
              fill
              sizes="(min-width: 1024px) 46vw, 92vw"
              className="object-cover"
            />
          </div>

          {/* Riquadro di vetro appoggiato sull'immagine: il prezzo di ingresso. */}
          <div className="vetro absolute -right-3 -bottom-6 rounded-ampio p-6 shadow-rilievo sm:right-6">
            <p className="text-[0.7rem] tracking-[0.2em] text-tenue uppercase">A partire da</p>
            <p className="mt-1 font-titolo text-[2rem] leading-none font-semibold tabellare">
              {Number.isFinite(tariffaMinima) ? prezzo(tariffaMinima) : '—'}
            </p>
            <p className="mt-1 text-[0.8rem] text-tenue">al giorno, tutto compreso</p>
          </div>
        </Rivela>

        <div className="order-1 lg:order-2">
          <TitoloSezione
            soprattitolo="Noleggio auto e moto"
            titolo={
              <>
                Il mezzo giusto,
                <br />
                <span className="testo-accento">per il tempo che serve</span>
              </>
            }
            sottotitolo={`Una flotta di ${AZIENDA.numeri.veicoliFlotta} veicoli recenti fra utilitarie, SUV, scooter e maxi enduro. Prenotate online, ritirate in sede o fatevelo portare dove siete.`}
            allineamento="sinistra"
          />

          <GruppoRivelato className="mt-10 space-y-4">
            {VANTAGGI_NOLEGGIO.map((vantaggio) => (
              <FiglioRivelato key={vantaggio.testo} className="flex items-start gap-4">
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-accento/10 text-accento">
                  <Icona nome={vantaggio.icona} className="size-[1.05rem]" />
                </span>
                <p className="pt-2 text-[0.95rem] text-tenue">{vantaggio.testo}</p>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>

          <Rivela ritardo={0.2} className="mt-10 flex flex-wrap gap-3">
            <Bottone href="/noleggio">
              Vedi la flotta
              <Icona nome="freccia" className="size-4" />
            </Bottone>
            <Bottone href="/noleggio#prenota" variante="contorno">
              Prenota ora
            </Bottone>
          </Rivela>
        </div>
      </div>
    </Sezione>
  )
}

/* ── Detailing ───────────────────────────────────────────────────────────── */

const PASSAGGI_DETAILING = [
  {
    numero: '01',
    titolo: 'Analisi',
    testo: 'Misuriamo lo spessore della vernice e fotografiamo ogni difetto prima di cominciare.',
  },
  {
    numero: '02',
    titolo: 'Correzione',
    testo: 'Levigatura a più passaggi con paste di grana decrescente, sotto luce controllata.',
  },
  {
    numero: '03',
    titolo: 'Protezione',
    testo: 'Rivestimento ceramico applicato in cabina e polimerizzato a infrarossi.',
  },
]

export function FasciaDetailing() {
  return (
    <Sezione className="relative overflow-hidden bg-notte text-white">
      <div className="griglia-tecnica absolute inset-0" aria-hidden />
      <div className="alone absolute -top-32 right-0 h-96 w-96 rounded-full" aria-hidden />

      <div className="relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <TitoloSezione
            soprattitolo="Reparto detailing"
            titolo={
              <>
                La cura che fa la
                <br />
                <span className="testo-accento">differenza negli anni</span>
              </>
            }
            sottotitolo="Non un autolavaggio veloce: una cabina dedicata, illuminazione a temperatura controllata e tempi di lavorazione veri. Con fotografie del prima e del dopo."
            allineamento="sinistra"
            chiaro
          />

          <GruppoRivelato className="mt-12 space-y-8">
            {PASSAGGI_DETAILING.map((passaggio) => (
              <FiglioRivelato key={passaggio.numero} className="flex gap-6">
                <span className="font-titolo text-[1.6rem] leading-none font-semibold text-accento tabellare">
                  {passaggio.numero}
                </span>
                <div className="border-l border-white/10 pl-6">
                  <h3 className="font-titolo text-[1.1rem] font-semibold text-white">
                    {passaggio.titolo}
                  </h3>
                  <p className="mt-1.5 text-[0.92rem] leading-relaxed text-white/60">
                    {passaggio.testo}
                  </p>
                </div>
              </FiglioRivelato>
            ))}
          </GruppoRivelato>

          <Rivela ritardo={0.2} className="mt-12">
            <Bottone href="/detailing" variante="chiaro">
              Scopri i trattamenti
              <Icona nome="freccia" className="size-4" />
            </Bottone>
          </Rivela>
        </div>

        {/* Confronto prima/dopo: due immagini affiancate con l'etichetta sopra. */}
        <Rivela da="sinistra" className="grid grid-cols-2 gap-4">
          {[
            { titolo: 'Prima', file: '/immagini/detailing/lucidatura-prima.jpg' },
            { titolo: 'Dopo', file: '/immagini/detailing/lucidatura-dopo.jpg' },
          ].map((lato, indice) => (
            <figure
              key={lato.titolo}
              className={
                indice === 1
                  ? 'relative aspect-[3/4] translate-y-8 overflow-hidden rounded-ampio'
                  : 'relative aspect-[3/4] overflow-hidden rounded-ampio'
              }
            >
              <Image
                src={lato.file}
                alt={`Carrozzeria ${lato.titolo.toLowerCase()} del trattamento`}
                fill
                sizes="(min-width: 1024px) 23vw, 46vw"
                className="object-cover"
              />
              <figcaption className="absolute top-3 left-3">
                <Etichetta tono={indice === 1 ? 'accento' : 'scuro'}>{lato.titolo}</Etichetta>
              </figcaption>
            </figure>
          ))}
        </Rivela>
      </div>
    </Sezione>
  )
}

/* ── Traguardi ───────────────────────────────────────────────────────────── */

export function Traguardi() {
  const numeri = [
    { valore: AZIENDA.numeri.anniAttivita, suffisso: '', etichetta: 'Anni di attività' },
    { valore: AZIENDA.numeri.veicoliConsegnati, suffisso: '+', etichetta: 'Veicoli consegnati' },
    { valore: AZIENDA.numeri.clientiSoddisfatti, suffisso: '+', etichetta: 'Clienti seguiti' },
    { valore: 120, suffisso: '', etichetta: 'Punti di controllo' },
  ]

  return (
    <Sezione className="border-y border-bordo bg-sfondo-alt py-14 sm:py-16 lg:py-20">
      <GruppoRivelato className="grid grid-cols-2 gap-8 lg:grid-cols-4">
        {numeri.map((numero) => (
          <FiglioRivelato key={numero.etichetta} className="text-center">
            <p className="font-titolo text-[2.4rem] leading-none font-semibold sm:text-[3rem]">
              <Contatore valore={numero.valore} suffisso={numero.suffisso} className="tabellare" />
            </p>
            <p className="mt-3 text-[0.72rem] tracking-[0.2em] text-tenue uppercase">
              {numero.etichetta}
            </p>
          </FiglioRivelato>
        ))}
      </GruppoRivelato>
    </Sezione>
  )
}
