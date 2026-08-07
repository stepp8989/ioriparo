import { Analitiche } from '@/componenti/comuni/Analitiche'
import { AzioniFisse } from '@/componenti/comuni/AzioniFisse'
import { BannerCookie } from '@/componenti/comuni/BannerCookie'
import { ProviderConsenso } from '@/componenti/comuni/Consenso'
import { RegistraSW } from '@/componenti/comuni/RegistraSW'
import { PiePagina } from '@/componenti/layout/PiePagina'
import { Testata } from '@/componenti/layout/Testata'
import { leggi } from '@/lib/archivio'
import { schemaAzienda } from '@/lib/seo'

/**
 * Struttura del sito pubblico: intestazione fissa, contenuto, piè di pagina e
 * gli elementi che devono restare disponibili ovunque (azioni di contatto,
 * banner cookie, statistiche subordinate al consenso).
 */
export default async function SitoLayout({ children }: { children: React.ReactNode }) {
  // I dati strutturati e gli orari nel piè di pagina leggono l'archivio, così
  // restano allineati a quello che lo staff aggiorna dal pannello.
  const { orari, recensioni } = await leggi()

  return (
    <ProviderConsenso>
      <script
        type="application/ld+json"
        // Il contenuto è generato dal server a partire dall'archivio: nessun input esterno.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaAzienda(orari, recensioni)) }}
      />

      {/* Primo elemento raggiungibile con il tabulatore: salta la navigazione. */}
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-full focus:bg-accento focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Vai al contenuto
      </a>

      <Testata />

      {/* `tabIndex={-1}` non lo mette nell'ordine di tabulazione: serve perché
          il salto al contenuto — e il ritorno dall'ingresso cinematografico —
          possano spostarci davvero il fuoco. Senza, alcuni browser fanno
          scorrere la pagina ma lasciano il fuoco dov'era. */}
      <main id="contenuto" tabIndex={-1} className="focus:outline-none">
        {children}
      </main>

      <PiePagina orari={orari} />

      <AzioniFisse />
      <BannerCookie />
      <Analitiche />
      <RegistraSW />
    </ProviderConsenso>
  )
}
