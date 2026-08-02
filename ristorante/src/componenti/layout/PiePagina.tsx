import Link from 'next/link'
import { Marchio } from '@/componenti/layout/Marchio'
import { Newsletter } from '@/componenti/comuni/Newsletter'
import { Icona } from '@/componenti/ui/Icona'
import { INDIRIZZO_COMPLETO, RISTORANTE } from '@/dati/ristorante'
import { leggi } from '@/lib/archivio'

const COLLEGAMENTI_RAPIDI = [
  { etichetta: 'Home', percorso: '/' },
  { etichetta: 'Menù', percorso: '/menu' },
  { etichetta: 'Prenota un tavolo', percorso: '/prenota' },
  { etichetta: 'Chi siamo', percorso: '/chi-siamo' },
  { etichetta: 'Galleria', percorso: '/galleria' },
  { etichetta: 'Contatti', percorso: '/contatti' },
]

const COLLEGAMENTI_LEGALI = [
  { etichetta: 'Privacy Policy', percorso: '/privacy' },
  { etichetta: 'Cookie Policy', percorso: '/cookie-policy' },
  { etichetta: 'Mappa del sito', percorso: '/sitemap.xml' },
]

/**
 * Piè di pagina.
 *
 * È un componente server: legge gli orari dall'archivio, così quando lo staff
 * li cambia dal pannello la modifica si vede in fondo a ogni pagina senza
 * toccare il codice.
 */
export async function PiePagina() {
  const { orari } = await leggi()
  const anno = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-notte text-white no-stampa">
      <div className="trama pointer-events-none absolute inset-0 text-white" aria-hidden />

      <div className="contenitore relative py-20">
        <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
          {/* Marchio e social */}
          <div className="lg:col-span-4">
            <Marchio className="text-white" />

            <p className="mt-6 max-w-xs text-sm leading-relaxed text-white/55">
              {RISTORANTE.descrizione}
            </p>

            <div className="mt-8 flex items-center gap-3">
              {[
                { nome: 'instagram' as const, url: RISTORANTE.social.instagram, testo: 'Instagram' },
                { nome: 'facebook' as const, url: RISTORANTE.social.facebook, testo: 'Facebook' },
                {
                  nome: 'tripadvisor' as const,
                  url: RISTORANTE.social.tripadvisor,
                  testo: 'Tripadvisor',
                },
              ].map((social) => (
                <a
                  key={social.testo}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${RISTORANTE.nomeCompleto} su ${social.testo}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-white/70 transition-all duration-400 hover:-translate-y-0.5 hover:border-accento hover:text-accento"
                >
                  <Icona nome={social.nome} className="size-[1.1rem]" />
                </a>
              ))}
            </div>
          </div>

          {/* Collegamenti rapidi */}
          <nav aria-label="Collegamenti rapidi" className="lg:col-span-2">
            <h2 className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accento">
              Naviga
            </h2>
            <ul className="space-y-3">
              {COLLEGAMENTI_RAPIDI.map((voce) => (
                <li key={voce.percorso}>
                  <Link
                    href={voce.percorso}
                    className="sottolinea text-sm text-white/65 transition-colors hover:text-white"
                  >
                    {voce.etichetta}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contatti e orari */}
          <div className="lg:col-span-3">
            <h2 className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accento">
              Dove siamo
            </h2>

            <address className="space-y-3 text-sm not-italic text-white/65">
              <p className="flex gap-3">
                <Icona nome="posizione" className="mt-0.5 size-4 shrink-0 text-accento" />
                <span>{INDIRIZZO_COMPLETO}</span>
              </p>
              <p>
                <a
                  href={`tel:${RISTORANTE.telefonoLink}`}
                  className="flex gap-3 transition-colors hover:text-white"
                >
                  <Icona nome="telefono" className="mt-0.5 size-4 shrink-0 text-accento" />
                  {RISTORANTE.telefono}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${RISTORANTE.email}`}
                  className="flex gap-3 transition-colors hover:text-white"
                >
                  <Icona nome="posta" className="mt-0.5 size-4 shrink-0 text-accento" />
                  {RISTORANTE.email}
                </a>
              </p>
            </address>

            <h3 className="mt-8 mb-4 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accento">
              Orari
            </h3>
            <ul className="space-y-1.5 text-sm text-white/65">
              {orari.map((giorno) => (
                <li key={giorno.giorno} className="flex justify-between gap-4">
                  <span>{giorno.giorno}</span>
                  <span className="text-right text-white/45">
                    {giorno.chiuso
                      ? 'Chiuso'
                      : [giorno.pranzo, giorno.cena].filter(Boolean).join(' · ')}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h2 className="mb-6 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-accento">
              Newsletter
            </h2>
            <Newsletter />
          </div>
        </div>

        {/* Riga finale: dati societari e informative */}
        <div className="mt-16 flex flex-col gap-5 border-t border-white/10 pt-8 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <p>
            © {anno} {RISTORANTE.ragioneSociale} — P. IVA {RISTORANTE.partitaIva} — REA{' '}
            {RISTORANTE.rea}
          </p>

          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {COLLEGAMENTI_LEGALI.map((voce) => (
              <li key={voce.percorso}>
                <Link href={voce.percorso} className="sottolinea transition-colors hover:text-white">
                  {voce.etichetta}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/admin" className="sottolinea transition-colors hover:text-white">
                Area riservata
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
