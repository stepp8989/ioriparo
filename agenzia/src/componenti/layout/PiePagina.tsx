import Link from 'next/link'
import { AGENZIA } from '@/dati/agenzia'
import { MENU_PIEDE } from '@/dati/navigazione'
import { Marchio } from '@/componenti/layout/Marchio'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'

/**
 * Piè di pagina.
 *
 * Minimo per scelta: il marchio, una frase, i collegamenti, i recapiti veri e
 * le note legali. Niente mappa del sito lunga tre schermate — su una pagina
 * sola non servirebbe a nessuno.
 */

const SOCIAL: { nome: NomeIcona; etichetta: string; href: string }[] = [
  { nome: 'instagram', etichetta: 'Instagram', href: AGENZIA.social.instagram },
  { nome: 'linkedin', etichetta: 'LinkedIn', href: AGENZIA.social.linkedin },
  { nome: 'behance', etichetta: 'Behance', href: AGENZIA.social.behance },
  { nome: 'github', etichetta: 'GitHub', href: AGENZIA.social.github },
]

export function PiePagina() {
  return (
    <footer className="relative overflow-hidden border-t border-bordo/70 bg-fondo-alt/60">
      {/* Alone tenue che sale dal bordo inferiore. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-40 h-80 bg-[radial-gradient(ellipse_at_center,rgb(59_130_246/.16),transparent_65%)] blur-2xl"
      />

      <div className="contenitore relative py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Marchio misura={40} />
            <p className="mt-5 max-w-xs text-[0.95rem] leading-relaxed text-tenue">
              {AGENZIA.motto}
            </p>

            <div className="mt-7 flex gap-2.5">
              {SOCIAL.map((social) => (
                <a
                  key={social.nome}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  aria-label={social.etichetta}
                  data-cursore="social"
                  className="vetro grid h-11 w-11 place-items-center rounded-full text-tenue transition-all duration-300 hover:-translate-y-0.5 hover:border-blu/50 hover:text-testo"
                >
                  <Icona nome={social.nome} misura={18} />
                </a>
              ))}
            </div>
          </div>

          <nav aria-label="Piè di pagina">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fioco">
              Naviga
            </h2>
            <ul className="mt-5 space-y-3">
              {MENU_PIEDE.map((voce) => (
                <li key={voce.href}>
                  {voce.ancora ? (
                    <a
                      href={voce.href}
                      className="text-[0.95rem] text-tenue transition-colors hover:text-testo"
                    >
                      {voce.etichetta}
                    </a>
                  ) : (
                    <Link
                      href={voce.href}
                      className="text-[0.95rem] text-tenue transition-colors hover:text-testo"
                    >
                      {voce.etichetta}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-fioco">
              Contatti
            </h2>
            <ul className="mt-5 space-y-3.5 text-[0.95rem]">
              <li>
                <a
                  href={`mailto:${AGENZIA.email}`}
                  className="inline-flex items-center gap-2.5 text-tenue transition-colors hover:text-testo"
                >
                  <Icona nome="busta" misura={17} className="text-blu-chiaro" />
                  {AGENZIA.email}
                </a>
              </li>
              <li>
                <a
                  href={`tel:${AGENZIA.telefonoLink}`}
                  className="inline-flex items-center gap-2.5 text-tenue transition-colors hover:text-testo"
                >
                  <Icona nome="telefono" misura={17} className="text-blu-chiaro" />
                  {AGENZIA.telefono}
                </a>
              </li>
              <li className="inline-flex items-center gap-2.5 text-tenue">
                <Icona nome="posizione" misura={17} className="text-blu-chiaro" />
                {AGENZIA.sede.citta} ({AGENZIA.sede.provincia})
              </li>
              <li className="inline-flex items-center gap-2.5 text-tenue">
                <Icona nome="orologio" misura={17} className="text-blu-chiaro" />
                Risposta entro {AGENZIA.tempi.risposta}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-bordo/70 pt-7 text-[0.8rem] text-fioco sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {AGENZIA.ragioneSociale} — P. IVA {AGENZIA.partitaIva}
          </p>
          <p className="inline-flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blu shadow-[0_0_10px_2px_rgb(59_130_246/.8)]" />
            Progettato e sviluppato in {AGENZIA.sede.regione}
          </p>
        </div>
      </div>
    </footer>
  )
}
