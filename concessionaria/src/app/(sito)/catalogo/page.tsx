import type { Metadata } from 'next'
import { Catalogo } from '@/componenti/catalogo/Catalogo'
import { Invito } from '@/componenti/home/Offerte'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { leggi } from '@/lib/archivio'
import { applicaFiltri, daiParametri } from '@/lib/catalogo'
import { metadatiPagina, schemaBriciole, schemaCatalogo } from '@/lib/seo'

export const metadata: Metadata = metadatiPagina({
  titolo: 'Catalogo auto e moto',
  descrizione:
    'Auto e moto nuove, km 0 e usate garantite, con ricerca per marca, prezzo, alimentazione, ' +
    'cambio e chilometri. Ogni veicolo è controllato in centoventi punti e consegnato con garanzia.',
  percorso: '/catalogo',
})

/**
 * I filtri arrivano dall'indirizzo e vengono applicati già lato server: chi
 * apre un collegamento condiviso — o un motore di ricerca che lo indicizza —
 * riceve la pagina con i risultati giusti dentro, non una pagina vuota da
 * riempire dopo il caricamento.
 */
export default async function PaginaCatalogo({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ veicoli }, parametri] = await Promise.all([leggi(), searchParams])

  const query = new URLSearchParams()
  for (const [chiave, valore] of Object.entries(parametri)) {
    if (typeof valore === 'string') query.set(chiave, valore)
    else if (Array.isArray(valore) && valore[0]) query.set(chiave, valore[0])
  }

  const filtri = daiParametri(query)
  const visibili = veicoli.filter((veicolo) => veicolo.visibile)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaCatalogo(applicaFiltri(veicoli, filtri))),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Catalogo', percorso: '/catalogo' }])),
        }}
      />

      <Intestazione
        soprattitolo="Veicoli disponibili"
        titolo={
          <>
            {visibili.length} veicoli in piazzale,
            <br />
            tutti <span className="testo-accento">garantiti</span>
          </>
        }
        sottotitolo="Auto e moto nuove, a chilometri zero, aziendali e usate. Filtrate come volete: prezzo, alimentazione, cambio, chilometri, potenza. Quello che vedete è quello che c’è."
        briciole={[{ nome: 'Catalogo', percorso: '/catalogo' }]}
      />

      <div className="py-12">
        <Catalogo veicoli={veicoli} filtriIniziali={filtri} />
      </div>

      <Invito
        titolo="Non trovate quello che cercate?"
        testo="Diteci marca, modello e budget: attingiamo alla rete di fornitori con cui lavoriamo da vent’anni e vi facciamo una proposta entro pochi giorni."
      />
    </>
  )
}
