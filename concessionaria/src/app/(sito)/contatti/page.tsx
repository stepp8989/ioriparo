import type { Metadata } from 'next'
import { FiglioRivelato, GruppoRivelato, Rivela } from '@/componenti/animazioni/Rivela'
import { Mappa } from '@/componenti/contatti/Mappa'
import { ModuloContatti } from '@/componenti/contatti/ModuloContatti'
import { ModuloRichiesta } from '@/componenti/moduli/ModuloRichiesta'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione, TitoloSezione } from '@/componenti/ui/Sezione'
import { AZIENDA, INDIRIZZO_COMPLETO, LINK_INDICAZIONI, linkWhatsApp } from '@/dati/azienda'
import { DOMANDE_FREQUENTI } from '@/dati/contenuti'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole, schemaFaq } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Contatti',
  descrizione: `Dove siamo, orari e recapiti di ${AZIENDA.nomeCompleto}: ${INDIRIZZO_COMPLETO}. Telefono, WhatsApp, email e modulo per richiedere un preventivo.`,
  percorso: '/contatti',
})

const RECAPITI: Array<{
  icona: NomeIcona
  titolo: string
  valore: string
  indirizzo: string
  nota: string
  esterno?: boolean
}> = [
  {
    icona: 'telefono',
    titolo: 'Telefono',
    valore: AZIENDA.telefono,
    indirizzo: `tel:${AZIENDA.telefonoLink}`,
    nota: 'Negli orari di apertura',
  },
  {
    icona: 'whatsapp',
    titolo: 'WhatsApp',
    valore: 'Scriveteci un messaggio',
    indirizzo: linkWhatsApp('Buongiorno, vorrei un’informazione.'),
    nota: 'Risposta di solito entro un’ora',
    esterno: true,
  },
  {
    icona: 'posta',
    titolo: 'Email',
    valore: AZIENDA.email,
    indirizzo: `mailto:${AZIENDA.email}`,
    nota: 'Risposta entro un giorno lavorativo',
  },
  {
    icona: 'posizione',
    titolo: 'Sede',
    valore: INDIRIZZO_COMPLETO,
    indirizzo: LINK_INDICAZIONI,
    nota: 'Parcheggio gratuito davanti al salone',
    esterno: true,
  },
]

export default async function PaginaContatti() {
  const { orari } = await leggi()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Contatti', percorso: '/contatti' }])),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq()) }}
      />

      <Intestazione
        soprattitolo="Contatti"
        titolo={
          <>
            Parliamone: <span className="testo-accento">siamo qui</span>
          </>
        }
        sottotitolo={`Salone, officina e reparto detailing in ${INDIRIZZO_COMPLETO}. Chiamate, scrivete o passate: il caffè è buono.`}
        briciole={[{ nome: 'Contatti', percorso: '/contatti' }]}
      />

      {/* Recapiti */}
      <Sezione className="bg-sfondo">
        <GruppoRivelato className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {RECAPITI.map((recapito) => (
            <FiglioRivelato key={recapito.titolo}>
              <a
                href={recapito.indirizzo}
                {...(recapito.esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="group flex h-full flex-col rounded-ampio border border-bordo bg-superficie p-6 transition-all duration-400 hover:-translate-y-1 hover:border-accento/40 hover:shadow-morbida"
              >
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accento/10 text-accento transition-colors duration-400 group-hover:bg-accento group-hover:text-white">
                  <Icona nome={recapito.icona} className="size-5" />
                </span>
                <h2 className="mt-5 text-[0.72rem] font-semibold tracking-[0.2em] text-tenue uppercase">
                  {recapito.titolo}
                </h2>
                <p className="mt-2 text-[0.98rem] font-semibold">{recapito.valore}</p>
                <p className="mt-auto pt-3 text-[0.8rem] text-tenue">{recapito.nota}</p>
              </a>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>

      {/* Mappa e orari */}
      <Sezione className="border-y border-bordo bg-sfondo-alt">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
          <Rivela>
            <Mappa />
          </Rivela>

          <Rivela da="sinistra">
            <div className="rounded-ampio border border-bordo bg-superficie p-7 shadow-morbida">
              <h2 className="flex items-center gap-3 font-titolo text-[1.3rem] font-semibold">
                <Icona nome="orologio" className="size-5 text-accento" />
                Orari di apertura
              </h2>

              <dl className="mt-6 space-y-1">
                {orari.map((giorno) => (
                  <div
                    key={giorno.giorno}
                    className="flex items-baseline justify-between gap-4 border-b border-bordo py-2.5 last:border-0"
                  >
                    <dt className="text-[0.92rem] font-medium">{giorno.giorno}</dt>
                    <dd
                      className={
                        giorno.chiuso
                          ? 'text-[0.88rem] text-tenue'
                          : 'text-right text-[0.88rem] tabellare'
                      }
                    >
                      {giorno.chiuso
                        ? 'Chiuso'
                        : [giorno.mattina, giorno.pomeriggio].filter(Boolean).join(' · ')}
                    </dd>
                  </div>
                ))}
              </dl>

              <p className="mt-6 rounded-tenue border border-bordo bg-superficie-alt px-4 py-3 text-[0.82rem] leading-relaxed text-tenue">
                Il reparto detailing lavora su appuntamento anche fuori orario: se vi serve
                consegnare il veicolo prima delle otto e mezza, ditecelo e ci organizziamo.
              </p>
            </div>
          </Rivela>
        </div>
      </Sezione>

      {/* Preventivo */}
      <Sezione id="preventivo" className="bg-sfondo">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <TitoloSezione
              soprattitolo="Preventivo"
              titolo={
                <>
                  Richiedete un <span className="testo-accento">preventivo</span>
                </>
              }
              sottotitolo="Diteci cosa cercate: veicolo, budget, formula di pagamento. Vi rispondiamo con una proposta concreta, non con un listino."
              allineamento="sinistra"
            />

            <div className="mt-10">
              <ModuloRichiesta tipo="preventivo" conIntestazione={false} />
            </div>
          </div>

          <div>
            <TitoloSezione
              soprattitolo="Scriveteci"
              titolo="Oppure mandateci un messaggio"
              sottotitolo="Per tutto il resto: assistenza, ricambi, appuntamenti in officina."
              allineamento="sinistra"
            />

            <div className="mt-10 rounded-ampio border border-bordo bg-superficie p-7 shadow-morbida">
              <ModuloContatti />
            </div>
          </div>
        </div>
      </Sezione>

      {/* Domande frequenti */}
      <Sezione className="border-t border-bordo bg-sfondo-alt">
        <TitoloSezione
          soprattitolo="Domande frequenti"
          titolo="Le risposte che ci chiedono più spesso"
        />

        <GruppoRivelato className="mx-auto mt-14 max-w-3xl space-y-3">
          {DOMANDE_FREQUENTI.map((domanda) => (
            <FiglioRivelato key={domanda.domanda}>
              <details className="group rounded-morbido border border-bordo bg-superficie px-6 py-5 transition-colors duration-300 open:border-accento/40">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-[1rem] font-semibold [&::-webkit-details-marker]:hidden">
                  {domanda.domanda}
                  <Icona
                    nome="chevron"
                    className="mt-1 size-4 shrink-0 text-tenue transition-transform duration-300 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-4 text-[0.92rem] leading-relaxed text-tenue">{domanda.risposta}</p>
              </details>
            </FiglioRivelato>
          ))}
        </GruppoRivelato>
      </Sezione>
    </>
  )
}
