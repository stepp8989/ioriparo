import { AGENZIA } from '@/dati/agenzia'
import { CHI_SONO, DOMANDE } from '@/dati/contenuti'
import { Rivela } from '@/componenti/effetti/Rivela'
import { Simbolo } from '@/componenti/layout/Marchio'
import { Icona } from '@/componenti/ui/Icona'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Chi sono, e le domande che mi fanno tutti
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Niente fotografia di repertorio con la persona sorridente davanti al
 * portatile: al suo posto c'è il marchio dentro una scheda di vetro, e a
 * parlare sono le parole.
 *
 * Le domande frequenti usano `<details>`: apertura e chiusura sono del
 * browser, quindi funzionano senza JavaScript, rispondono correttamente alla
 * tastiera e vengono lette bene dai lettori di schermo. Sono anche le stesse
 * domande dichiarate nei dati strutturati della pagina — Google chiede che il
 * contenuto marcato sia visibile, e qui lo è per costruzione.
 */
export function ChiSono() {
  return (
    <section id="chi-sono" className="relative py-28 sm:py-36" aria-labelledby="chi-sono-titolo">
      <div className="contenitore">
        <div className="grid items-start gap-14 lg:grid-cols-[1.1fr_1fr]">
          <Rivela>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-blu-chiaro">
              {CHI_SONO.soprattitolo}
            </p>
            <h2
              id="chi-sono-titolo"
              className="mt-5 font-titolo text-[clamp(1.8rem,4.6vw,3.1rem)] font-semibold leading-[1.1]"
            >
              {CHI_SONO.titolo}
            </h2>
            <div className="mt-7 space-y-5">
              {CHI_SONO.paragrafi.map((paragrafo) => (
                <p key={paragrafo.slice(0, 24)} className="text-[1rem] leading-relaxed text-tenue">
                  {paragrafo}
                </p>
              ))}
            </div>

            <ul className="mt-9 flex flex-wrap gap-2.5">
              {CHI_SONO.competenze.map((competenza) => (
                <li
                  key={competenza}
                  className="rounded-full border border-bordo-forte px-4 py-2 text-[0.82rem] text-tenue transition-colors hover:border-blu/45 hover:text-testo"
                >
                  {competenza}
                </li>
              ))}
            </ul>
          </Rivela>

          {/* La scheda: marchio, anni di lavoro, recapiti. */}
          <Rivela tipo="destra" ritardo={140}>
            <div className="vetro vetro-luce relative overflow-hidden rounded-enorme p-9">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgb(139_92_246/.28),transparent_66%)] blur-2xl"
              />

              <div className="relative flex items-center gap-4">
                <span className="anima-fluttua grid h-16 w-16 place-items-center rounded-2xl border border-blu/30 bg-blu/10">
                  <Simbolo misura={34} />
                </span>
                <div>
                  <p className="font-titolo text-lg font-semibold">{AGENZIA.nomeCompleto}</p>
                  <p className="mt-1 text-[0.85rem] text-fioco">
                    Dal {AGENZIA.fondato} — {new Date().getFullYear() - AGENZIA.fondato} anni di
                    progetti
                  </p>
                </div>
              </div>

              <dl className="relative mt-9 grid gap-5 border-t border-bordo/70 pt-8 sm:grid-cols-2">
                {[
                  { voce: 'Dove lavoro', valore: AGENZIA.sede.raggio, icona: 'posizione' as const },
                  { voce: 'Rispondo entro', valore: AGENZIA.tempi.risposta, icona: 'orologio' as const },
                  { voce: 'Un sito richiede', valore: AGENZIA.tempi.consegna, icona: 'razzo' as const },
                  { voce: 'Progetti insieme', valore: 'Pochi per volta', icona: 'scudo' as const },
                ].map((riga) => (
                  <div key={riga.voce}>
                    <dt className="flex items-center gap-2 text-[0.78rem] uppercase tracking-[0.16em] text-fioco">
                      <Icona nome={riga.icona} misura={14} className="text-blu-chiaro" />
                      {riga.voce}
                    </dt>
                    <dd className="mt-1.5 text-[0.98rem] text-testo">{riga.valore}</dd>
                  </div>
                ))}
              </dl>

              <div className="relative mt-8 flex flex-col gap-3 border-t border-bordo/70 pt-8 sm:flex-row">
                <a
                  href={`mailto:${AGENZIA.email}`}
                  className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-bordo-forte px-5 py-3 text-[0.9rem] text-tenue transition-colors hover:border-blu/50 hover:text-testo"
                >
                  <Icona nome="busta" misura={16} />
                  Scrivimi
                </a>
                <a
                  href={`https://wa.me/${AGENZIA.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full border border-bordo-forte px-5 py-3 text-[0.9rem] text-tenue transition-colors hover:border-blu/50 hover:text-testo"
                >
                  <Icona nome="whatsapp" misura={16} />
                  WhatsApp
                </a>
              </div>
            </div>
          </Rivela>
        </div>

        {/* ── Domande frequenti ────────────────────────────────────────────── */}

        <div className="mx-auto mt-28 max-w-3xl">
          <Rivela className="text-center">
            <h3 className="font-titolo text-[clamp(1.5rem,4vw,2.4rem)] font-semibold">
              Le domande che mi fanno <span className="testo-neon">tutti.</span>
            </h3>
          </Rivela>

          <div className="mt-10 space-y-3">
            {DOMANDE.map((voce, indice) => (
              <Rivela key={voce.domanda} ritardo={indice * 70}>
                <details className="vetro group rounded-ampio px-6 py-1 transition-colors duration-300 open:border-blu/35">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-left font-medium text-testo [&::-webkit-details-marker]:hidden">
                    {voce.domanda}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-bordo-forte text-tenue transition-all duration-300 group-open:rotate-45 group-open:border-blu/50 group-open:text-blu-chiaro">
                      <span className="relative block h-3 w-3">
                        <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                        <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                      </span>
                    </span>
                  </summary>
                  <p className="pb-6 pr-12 text-[0.95rem] leading-relaxed text-tenue">
                    {voce.risposta}
                  </p>
                </details>
              </Rivela>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
