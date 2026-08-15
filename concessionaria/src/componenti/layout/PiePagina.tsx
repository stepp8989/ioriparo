import Link from 'next/link'
import { Marchio } from '@/componenti/layout/Marchio'
import { Newsletter } from '@/componenti/comuni/Newsletter'
import { Icona, type NomeIcona } from '@/componenti/ui/Icona'
import { AZIENDA, INDIRIZZO_COMPLETO, linkWhatsApp } from '@/dati/azienda'
import { NAVIGAZIONE_LEGALE } from '@/dati/navigazione'
import type { OrarioGiorno } from '@/lib/tipi'

/**
 * Piè di pagina.
 *
 * Gli orari arrivano dall'archivio attraverso il layout: se lo staff li cambia
 * dal pannello, cambiano qui, nella pagina Contatti e nei dati strutturati
 * senza toccare il codice.
 */

const COLONNA_VEICOLI = [
  { nome: 'Auto in vendita', percorso: '/catalogo?tipo=auto' },
  { nome: 'Moto in vendita', percorso: '/catalogo?tipo=moto' },
  { nome: 'Noleggio auto', percorso: '/noleggio?tipo=auto' },
  { nome: 'Noleggio moto', percorso: '/noleggio?tipo=moto' },
  { nome: 'Offerte del mese', percorso: '/catalogo?ordine=prezzo-crescente' },
]

const COLONNA_SERVIZI = [
  { nome: 'Car detailing', percorso: '/detailing' },
  { nome: 'Protezione ceramica', percorso: '/detailing#trattamenti' },
  { nome: 'Sanificazione interni', percorso: '/detailing#trattamenti' },
  { nome: 'Finanziamenti', percorso: '/finanziamenti' },
  { nome: 'Permuta e valutazione', percorso: '/finanziamenti#permuta' },
]

const COLONNA_AZIENDA = [
  { nome: 'Chi siamo', percorso: '/chi-siamo' },
  { nome: 'Blog', percorso: '/blog' },
  { nome: 'Area clienti', percorso: '/area-clienti' },
  { nome: 'Contatti', percorso: '/contatti' },
  { nome: 'Tutti i servizi', percorso: '/servizi' },
]

const SOCIAL: Array<{ nome: string; icona: NomeIcona; indirizzo: string }> = [
  { nome: 'Instagram', icona: 'instagram', indirizzo: AZIENDA.social.instagram },
  { nome: 'Facebook', icona: 'facebook', indirizzo: AZIENDA.social.facebook },
  { nome: 'YouTube', icona: 'youtube', indirizzo: AZIENDA.social.youtube },
  { nome: 'LinkedIn', icona: 'linkedin', indirizzo: AZIENDA.social.linkedin },
]

function Colonna({
  titolo,
  voci,
}: {
  titolo: string
  voci: Array<{ nome: string; percorso: string }>
}) {
  return (
    <div>
      <h3 className="mb-5 text-[0.72rem] font-semibold tracking-[0.24em] text-white/45 uppercase">
        {titolo}
      </h3>
      <ul className="space-y-3">
        {voci.map((voce) => (
          <li key={`${voce.nome}-${voce.percorso}`}>
            <Link
              href={voce.percorso}
              className="text-[0.92rem] text-white/70 transition-colors duration-300 hover:text-white"
            >
              {voce.nome}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function PiePagina({ orari }: { orari: OrarioGiorno[] }) {
  const anno = new Date().getFullYear()

  return (
    <footer className="relative overflow-hidden bg-notte text-white">
      <div className="trama pointer-events-none absolute inset-0 text-white" aria-hidden />
      <div
        className="alone pointer-events-none absolute -top-40 left-1/4 h-96 w-96 rounded-full"
        aria-hidden
      />

      <div className="contenitore relative py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Marchio chiaro />
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-white/60">
              {AZIENDA.descrizione}
            </p>

            <div className="mt-8 space-y-3 text-[0.92rem] text-white/70">
              <a
                href={`tel:${AZIENDA.telefonoLink}`}
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Icona nome="telefono" className="size-4 shrink-0 text-accento-forte" />
                {AZIENDA.telefono}
              </a>
              <a
                href={linkWhatsApp('Buongiorno, vorrei un’informazione.')}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Icona nome="whatsapp" className="size-4 shrink-0 text-accento-forte" />
                Scrivici su WhatsApp
              </a>
              <a
                href={`mailto:${AZIENDA.email}`}
                className="flex items-center gap-3 transition-colors hover:text-white"
              >
                <Icona nome="posta" className="size-4 shrink-0 text-accento-forte" />
                {AZIENDA.email}
              </a>
              <p className="flex items-start gap-3">
                <Icona nome="posizione" className="mt-0.5 size-4 shrink-0 text-accento-forte" />
                {INDIRIZZO_COMPLETO}
              </p>
            </div>

            <div className="mt-8 flex gap-2">
              {SOCIAL.map((social) => (
                <a
                  key={social.nome}
                  href={social.indirizzo}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.nome}
                  className="inline-flex size-10 items-center justify-center rounded-full border border-white/12 text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-accento hover:text-white"
                >
                  <Icona nome={social.icona} className="size-[1.05rem]" />
                </a>
              ))}
            </div>
          </div>

          <Colonna titolo="Veicoli" voci={COLONNA_VEICOLI} />
          <Colonna titolo="Servizi" voci={COLONNA_SERVIZI} />

          <div className="space-y-10">
            <Colonna titolo="Azienda" voci={COLONNA_AZIENDA} />

            <div>
              <h3 className="mb-4 text-[0.72rem] font-semibold tracking-[0.24em] text-white/45 uppercase">
                Orari
              </h3>
              <ul className="space-y-1.5 text-[0.85rem] text-white/60 tabellare">
                {orari.map((giorno) => (
                  <li key={giorno.giorno} className="flex justify-between gap-4">
                    <span>{giorno.giorno.slice(0, 3)}</span>
                    <span className={giorno.chiuso ? 'text-white/35' : ''}>
                      {giorno.chiuso
                        ? 'Chiuso'
                        : [giorno.mattina, giorno.pomeriggio].filter(Boolean).join(' · ')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-2 md:items-center">
          <div>
            <h3 className="font-titolo text-[1.15rem] font-semibold">Restate aggiornati</h3>
            <p className="mt-1 text-[0.88rem] text-white/55">
              Nuovi arrivi in salone e promozioni riservate agli iscritti.
            </p>
          </div>
          <Newsletter chiaro />
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-[0.8rem] text-white/45 md:flex-row md:items-center md:justify-between">
          <p>
            © {anno} {AZIENDA.ragioneSociale} — P. IVA {AZIENDA.partitaIva} — REA {AZIENDA.rea}
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {NAVIGAZIONE_LEGALE.map((voce) => (
              <li key={voce.percorso}>
                <Link href={voce.percorso} className="transition-colors hover:text-white">
                  {voce.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  )
}
