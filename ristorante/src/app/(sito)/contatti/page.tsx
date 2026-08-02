import { Copertina } from '@/componenti/ui/Copertina'
import { Mappa } from '@/componenti/contatti/Mappa'
import { ModuloContatti } from '@/componenti/contatti/ModuloContatti'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { INDIRIZZO_COMPLETO, LINK_INDICAZIONI, RISTORANTE } from '@/dati/ristorante'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Contatti',
  descrizione:
    `Dove siamo, come raggiungerci e come contattarci: ${INDIRIZZO_COMPLETO}, ` +
    `telefono ${RISTORANTE.telefono}, WhatsApp ed email.`,
  percorso: '/contatti',
  immagine: '/immagini/ambienti/contatti-copertina.jpg',
})

/** Recapiti mostrati nella colonna di sinistra. */
const RECAPITI: Array<{ icona: NomeIcona; titolo: string; righe: string[]; href?: string }> = [
  {
    icona: 'posizione',
    titolo: 'Indirizzo',
    righe: [RISTORANTE.indirizzo.via, `${RISTORANTE.indirizzo.cap} ${RISTORANTE.indirizzo.citta}`],
    href: LINK_INDICAZIONI,
  },
  {
    icona: 'telefono',
    titolo: 'Telefono',
    righe: [RISTORANTE.telefono],
    href: `tel:${RISTORANTE.telefonoLink}`,
  },
  {
    icona: 'whatsapp',
    titolo: 'WhatsApp',
    righe: ['Scriveteci un messaggio'],
    href: `https://wa.me/${RISTORANTE.whatsapp}`,
  },
  {
    icona: 'posta',
    titolo: 'Email',
    righe: [RISTORANTE.email, RISTORANTE.emailInfo],
    href: `mailto:${RISTORANTE.email}`,
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

      <Copertina
        soprattitolo="Dove siamo"
        titolo="Contatti"
        sottotitolo={`Nel centro di ${RISTORANTE.indirizzo.citta}, a due passi dal Ponte Santa Trinita. Chiamateci, scriveteci o passate a trovarci.`}
        immagine="/immagini/ambienti/contatti-copertina.jpg"
        briciole={[{ nome: 'Contatti', percorso: '/contatti' }]}
      />

      <div className="contenitore py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Recapiti e orari */}
          <div className="lg:col-span-5">
            <Rivela>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {RECAPITI.map((recapito) => {
                  const esterno = recapito.href?.startsWith('http')
                  const Contenuto = (
                    <>
                      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-bordo text-accento">
                        <Icona nome={recapito.icona} className="size-5" />
                      </span>
                      <span>
                        <span className="block text-xs uppercase tracking-[0.18em] text-tenue">
                          {recapito.titolo}
                        </span>
                        {recapito.righe.map((riga) => (
                          <span key={riga} className="mt-0.5 block text-sm">
                            {riga}
                          </span>
                        ))}
                      </span>
                    </>
                  )

                  return (
                    <li key={recapito.titolo}>
                      {recapito.href ? (
                        <a
                          href={recapito.href}
                          {...(esterno ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                          className="flex items-start gap-4 border border-bordo p-5 transition-colors duration-300 hover:border-accento"
                        >
                          {Contenuto}
                        </a>
                      ) : (
                        <div className="flex items-start gap-4 border border-bordo p-5">{Contenuto}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            </Rivela>

            <Rivela ritardo={0.08}>
              <div className="mt-8 border border-bordo bg-superficie-alt p-7">
                <h2 className="flex items-center gap-3 font-titolo text-2xl">
                  <Icona nome="orologio" className="size-5 text-accento" />
                  Orari di apertura
                </h2>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {orari.map((giorno) => (
                    <li
                      key={giorno.giorno}
                      className="flex justify-between gap-4 border-b border-bordo pb-2.5 last:border-b-0 last:pb-0"
                    >
                      <span className={giorno.chiuso ? 'text-tenue' : 'font-medium'}>
                        {giorno.giorno}
                      </span>
                      <span className="text-right text-tenue">
                        {giorno.chiuso
                          ? 'Chiuso'
                          : [giorno.pranzo, giorno.cena].filter(Boolean).join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>

                <p className="mt-5 text-xs leading-relaxed text-tenue">
                  Cucina aperta fino a mezz’ora prima della chiusura. Nei giorni di festa gli orari
                  possono cambiare: in quel caso lo segnaliamo qui e sui social.
                </p>
              </div>
            </Rivela>

            <Rivela ritardo={0.14}>
              <div className="mt-8 border border-bordo p-7">
                <h2 className="font-titolo text-2xl">Come arrivare</h2>
                <dl className="mt-5 space-y-4 text-sm">
                  {[
                    ['In auto', 'Siamo in zona a traffico limitato. Parcheggio convenzionato a 200 metri, prima ora gratuita per i nostri ospiti.'],
                    ['A piedi', 'Cinque minuti da Piazza della Repubblica, tre dal Ponte Santa Trinita.'],
                    ['Con i mezzi', 'Fermata più vicina a 150 metri, servita dalle linee del centro storico.'],
                  ].map(([titolo, testo]) => (
                    <div key={titolo}>
                      <dt className="text-xs uppercase tracking-[0.18em] text-accento">{titolo}</dt>
                      <dd className="mt-1 leading-relaxed text-tenue">{testo}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Rivela>
          </div>

          {/* Mappa e modulo */}
          <div className="lg:col-span-7">
            <Rivela da="sinistra">
              <Mappa />
            </Rivela>

            <Rivela da="sinistra" ritardo={0.1}>
              <div className="mt-8">
                <ModuloContatti />
              </div>
            </Rivela>
          </div>
        </div>
      </div>
    </>
  )
}
