import { Copertina } from '@/componenti/ui/Copertina'
import { ModuloPrenotazione } from '@/componenti/prenota/ModuloPrenotazione'
import { Rivela } from '@/componenti/animazioni/Rivela'
import { Icona } from '@/componenti/ui/Icona'
import { FAQ } from '@/dati/contenuti'
import { RISTORANTE } from '@/dati/ristorante'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole, schemaFaq } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Prenota un tavolo',
  descrizione:
    `Prenota online da ${RISTORANTE.nomeCompleto}: scegli data, orario e numero di persone. ` +
    'Conferma immediata via email.',
  percorso: '/prenota',
  immagine: '/immagini/ambienti/prenota-copertina.jpg',
})

/** Modi alternativi di prenotare, per chi preferisce la voce alla tastiera. */
const CONTATTI_RAPIDI = [
  {
    icona: 'telefono' as const,
    titolo: 'Al telefono',
    testo: RISTORANTE.telefono,
    href: `tel:${RISTORANTE.telefonoLink}`,
  },
  {
    icona: 'whatsapp' as const,
    titolo: 'Su WhatsApp',
    testo: 'Risposta in giornata',
    href: `https://wa.me/${RISTORANTE.whatsapp}`,
  },
  {
    icona: 'posta' as const,
    titolo: 'Per email',
    testo: RISTORANTE.email,
    href: `mailto:${RISTORANTE.email}`,
  },
]

export default async function PaginaPrenota() {
  const { orari } = await leggi()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            schemaBriciole([{ nome: 'Prenota', percorso: '/prenota' }]),
            schemaFaq(FAQ),
          ]),
        }}
      />

      <Copertina
        soprattitolo="Prenotazioni"
        titolo="Prenota un tavolo"
        sottotitolo="Un minuto per compilare, conferma immediata. Il tavolo resta vostro per tutta la sera: da noi non ci sono doppi turni."
        immagine="/immagini/ambienti/prenota-copertina.jpg"
        briciole={[{ nome: 'Prenota', percorso: '/prenota' }]}
      />

      <div className="contenitore py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Modulo */}
          <div className="lg:col-span-7">
            <Rivela>
              <ModuloPrenotazione orari={orari} />
            </Rivela>
          </div>

          {/* Colonna di servizio */}
          <aside className="lg:col-span-5">
            <Rivela da="sinistra" ritardo={0.08}>
              <div className="border border-bordo bg-superficie-alt p-7">
                <h2 className="font-titolo text-2xl">Preferite parlare con noi?</h2>
                <p className="mt-2 text-sm text-tenue">
                  Per gruppi numerosi, cene private ed esigenze particolari, il modo più veloce è
                  sentirci direttamente.
                </p>

                <ul className="mt-6 space-y-3">
                  {CONTATTI_RAPIDI.map((contatto) => (
                    <li key={contatto.titolo}>
                      <a
                        href={contatto.href}
                        {...(contatto.href.startsWith('http')
                          ? { target: '_blank', rel: 'noopener noreferrer' }
                          : {})}
                        className="group flex items-center gap-4 border border-bordo bg-superficie p-4 transition-all duration-300 hover:border-accento"
                      >
                        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-bordo text-accento transition-colors group-hover:border-accento">
                          <Icona nome={contatto.icona} className="size-5" />
                        </span>
                        <span>
                          <span className="block text-xs uppercase tracking-[0.16em] text-tenue">
                            {contatto.titolo}
                          </span>
                          <span className="mt-0.5 block text-sm font-medium">{contatto.testo}</span>
                        </span>
                        <Icona
                          nome="freccia"
                          className="ml-auto size-4 text-tenue transition-transform duration-300 group-hover:translate-x-1 group-hover:text-accento"
                        />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Rivela>

            {/* Orari */}
            <Rivela da="sinistra" ritardo={0.14}>
              <div className="mt-8 border border-bordo p-7">
                <h2 className="flex items-center gap-3 font-titolo text-2xl">
                  <Icona nome="orologio" className="size-5 text-accento" />
                  Orari di apertura
                </h2>

                <ul className="mt-5 space-y-2.5 text-sm">
                  {orari.map((giorno) => (
                    <li
                      key={giorno.giorno}
                      className="flex justify-between gap-4 border-b border-bordo pb-2.5 last:border-b-0"
                    >
                      <span className={giorno.chiuso ? 'text-tenue' : ''}>{giorno.giorno}</span>
                      <span className="text-right text-tenue">
                        {giorno.chiuso
                          ? 'Chiuso'
                          : [giorno.pranzo, giorno.cena].filter(Boolean).join(' · ')}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Rivela>

            {/* Domande frequenti */}
            <Rivela da="sinistra" ritardo={0.2}>
              <div className="mt-8">
                <h2 className="font-titolo text-2xl">Domande frequenti</h2>

                <div className="mt-5 divide-y divide-bordo border-y border-bordo">
                  {FAQ.map((voce) => (
                    <details key={voce.domanda} className="group py-4">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium marker:hidden">
                        {voce.domanda}
                        <Icona
                          nome="chevron"
                          className="size-4 shrink-0 text-accento transition-transform duration-300 group-open:rotate-180"
                        />
                      </summary>
                      <p className="mt-3 text-sm leading-relaxed text-tenue">{voce.risposta}</p>
                    </details>
                  ))}
                </div>
              </div>
            </Rivela>
          </aside>
        </div>
      </div>
    </>
  )
}
