import Image from 'next/image'
import Link from 'next/link'
import { FiglioRivelato, GruppoRivelato } from '@/componenti/animazioni/Rivela'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Etichetta, Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA, linkWhatsApp } from '@/dati/azienda'
import type { Offerta } from '@/lib/tipi'
import { dataEstesa, oggiIso } from '@/lib/utili'

/**
 * Promozioni in corso.
 *
 * Un'offerta scaduta sparisce da sola: il confronto con la data di oggi evita
 * che una promozione dimenticata nel pannello resti online per mesi, che è il
 * modo più rapido per perdere credibilità.
 */
export function Offerte({ offerte }: { offerte: Offerta[] }) {
  const oggi = oggiIso()
  const attive = offerte.filter((offerta) => offerta.attiva && offerta.scadenza >= oggi)

  if (attive.length === 0) return null

  return (
    <Sezione className="bg-sfondo-alt">
      <TitoloSezione
        soprattitolo="Promozioni"
        titolo={
          <>
            Offerte <span className="testo-accento">in corso</span>
          </>
        }
        sottotitolo="Valide fino a esaurimento dei veicoli in promozione. Chiedeteci la simulazione della rata: è gratuita e non impegna."
      />

      <GruppoRivelato className="mt-14 grid gap-6 md:grid-cols-3">
        {attive.slice(0, 3).map((offerta) => (
          <FiglioRivelato key={offerta.id}>
            <article className="group flex h-full flex-col overflow-hidden rounded-ampio border border-bordo bg-superficie shadow-morbida transition-all duration-500 hover:-translate-y-1 hover:shadow-rilievo">
              <div className="relative aspect-[16/10] overflow-hidden">
                <Image
                  src={offerta.immagine}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 32vw, 92vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <Etichetta tono="accento">{offerta.etichetta}</Etichetta>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-7">
                <h3 className="font-titolo text-[1.3rem] font-semibold">{offerta.titolo}</h3>
                <p className="mt-1 text-[0.9rem] font-medium text-accento">{offerta.sottotitolo}</p>
                <p className="mt-4 text-[0.9rem] leading-relaxed text-tenue">{offerta.descrizione}</p>

                <p className="mt-6 flex items-center gap-2 text-[0.8rem] text-tenue">
                  <Icona nome="calendario" className="size-3.5" />
                  Valida fino al {dataEstesa(offerta.scadenza)}
                </p>

                <div className="mt-auto pt-6">
                  {offerta.veicoloId ? (
                    <Bottone href="/catalogo" variante="tenue" misura="piccola" className="w-full">
                      Vedi il veicolo
                    </Bottone>
                  ) : (
                    <Link
                      href="/contatti#preventivo"
                      className="inline-flex items-center gap-2 text-[0.9rem] font-semibold text-accento sottolinea"
                    >
                      Richiedi l’offerta
                      <Icona nome="freccia" className="size-4" />
                    </Link>
                  )}
                </div>
              </div>
            </article>
          </FiglioRivelato>
        ))}
      </GruppoRivelato>
    </Sezione>
  )
}

/**
 * Invito finale.
 *
 * Chiude ogni pagina lunga con le tre azioni che contano — preventivo,
 * telefono, WhatsApp — perché chi arriva in fondo ha già deciso di scriverci e
 * non deve tornare su a cercare come farlo.
 */
export function Invito({
  titolo = 'Parliamone di persona',
  testo = 'Passate in salone o scriveteci: vi rispondiamo con una proposta concreta, senza formule generiche.',
}: {
  titolo?: string
  testo?: string
}) {
  return (
    <Sezione className="relative overflow-hidden bg-notte text-white">
      <div className="griglia-tecnica absolute inset-0" aria-hidden />
      <div className="alone absolute -bottom-40 left-1/3 h-96 w-96 rounded-full" aria-hidden />

      <div className="relative">
        <TitoloSezione
          soprattitolo="Siamo qui"
          titolo={titolo}
          sottotitolo={testo}
          chiaro
          livello={2}
        />

        <div className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Bottone href="/contatti#preventivo" misura="grande">
            Richiedi preventivo
            <Icona nome="freccia" className="size-4" />
          </Bottone>
          <Bottone href={`tel:${AZIENDA.telefonoLink}`} variante="chiaro" misura="grande">
            <Icona nome="telefono" className="size-4" />
            {AZIENDA.telefono}
          </Bottone>
          <Bottone
            href={linkWhatsApp('Buongiorno, vorrei un’informazione.')}
            variante="vetro"
            misura="grande"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icona nome="whatsapp" className="size-4" />
            WhatsApp
          </Bottone>
        </div>
      </div>
    </Sezione>
  )
}
