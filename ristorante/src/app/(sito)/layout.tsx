import { Testata } from '@/componenti/layout/Testata'
import { PiePagina } from '@/componenti/layout/PiePagina'
import { AzioniFisse } from '@/componenti/comuni/AzioniFisse'
import { BannerCookie } from '@/componenti/comuni/BannerCookie'
import { ProviderConsenso } from '@/componenti/comuni/Consenso'
import { Analitiche } from '@/componenti/comuni/Analitiche'
import { leggi } from '@/lib/archivio'
import { schemaRistorante } from '@/lib/seo'

/**
 * Struttura del sito pubblico: intestazione fissa, contenuto, piè di pagina e
 * gli elementi che devono restare disponibili ovunque (azioni di contatto,
 * banner cookie, statistiche subordinate al consenso).
 */
export default async function SitoLayout({ children }: { children: React.ReactNode }) {
  // I dati strutturati leggono orari e recensioni reali, così restano
  // allineati a quello che lo staff aggiorna dal pannello.
  const { orari, recensioni } = await leggi()

  return (
    <ProviderConsenso>
      <script
        type="application/ld+json"
        // Il contenuto è generato dal server a partire dall'archivio: nessun input esterno.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaRistorante(orari, recensioni)) }}
      />

      {/* Primo elemento raggiungibile con il tabulatore: salta la navigazione. */}
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-accento focus:px-5 focus:py-3 focus:text-sm focus:text-white"
      >
        Vai al contenuto
      </a>

      <Testata />

      <main id="contenuto">{children}</main>

      <PiePagina />

      <AzioniFisse />
      <BannerCookie />
      <Analitiche />
    </ProviderConsenso>
  )
}
