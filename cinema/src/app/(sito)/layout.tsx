import { PiePagina } from '@/componenti/layout/PiePagina'
import { Testata } from '@/componenti/layout/Testata'
import { FornitoreAvvisi } from '@/componenti/ui/Avviso'
import { MENU } from '@/dati/navigazione'
import { datiSito, cinemaVisibili, clienteDellaSessione } from '@/lib/sito'
import { datiStrutturatiSito } from '@/lib/seo'

/**
 * Struttura del sito pubblico.
 *
 * Il pannello di amministrazione vive fuori da questo gruppo e non eredita
 * intestazione né piè di pagina: sono due applicazioni con esigenze diverse
 * che condividono solo il documento e i caratteri.
 *
 * I dati strutturati dell'organizzazione e del motore di ricerca interno sono
 * dichiarati qui una volta sola, invece che in ogni pagina: sono gli stessi
 * ovunque, e ripeterli è solo un modo per farli divergere.
 */
export default async function SitoLayout({ children }: { children: React.ReactNode }) {
  const archivio = await datiSito()
  const cliente = await clienteDellaSessione()
  const { marchio } = archivio.impostazioni

  // Il modulo può essere spento dalle impostazioni: in quel caso la voce
  // «Food & Drink» non deve comparire nel menu, non solo essere irraggiungibile.
  const menu = MENU.filter((voce) => {
    if (voce.href === '/food') return archivio.impostazioni.moduli.food
    if (voce.href === '/abbonamenti') return archivio.impostazioni.moduli.abbonamenti
    return true
  })

  return (
    <FornitoreAvvisi>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(datiStrutturatiSito(archivio.impostazioni)),
        }}
      />

      <div className="flex min-h-screen flex-col">
        <Testata
          nome={marchio.nome}
          claim={marchio.claim}
          menu={menu}
          collegato={Boolean(cliente)}
        />

        <main id="contenuto" className="flex-1">
          {children}
        </main>

        <PiePagina impostazioni={archivio.impostazioni} cinema={cinemaVisibili(archivio)} />
      </div>
    </FornitoreAvvisi>
  )
}
