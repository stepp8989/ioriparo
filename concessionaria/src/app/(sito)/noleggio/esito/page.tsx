import type { Metadata } from 'next'
import { EsitoPagamento } from '@/componenti/noleggio/EsitoPagamento'
import { Sezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'

/**
 * Pagina di ritorno dai servizi di pagamento.
 *
 * Non va indicizzata: ha senso solo con il codice del noleggio nell'indirizzo,
 * e comparirebbe fra i risultati di ricerca come una pagina vuota.
 */
export const metadata: Metadata = metadatiPagina({
  titolo: 'Esito del pagamento',
  descrizione: 'Verifica del pagamento del noleggio.',
  percorso: '/noleggio/esito',
  indicizza: false,
})

export default async function PaginaEsito({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const parametri = await searchParams
  const valore = (chiave: string) => {
    const grezzo = parametri[chiave]
    return typeof grezzo === 'string' ? grezzo : ''
  }

  return (
    <div className="pt-28">
      <Sezione className="bg-sfondo">
        <EsitoPagamento
          codice={valore('codice')}
          annullato={valore('stato') === 'annullato'}
          token={valore('token')}
        />
      </Sezione>
    </div>
  )
}
