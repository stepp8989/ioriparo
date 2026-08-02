import { Copertina } from '@/componenti/ui/Copertina'
import { Mosaico } from '@/componenti/galleria/Mosaico'
import { Invito } from '@/componenti/home/Invito'
import { GALLERIA } from '@/dati/contenuti'
import { RISTORANTE } from '@/dati/ristorante'
import { metadatiPagina, schemaBriciole } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Galleria',
  descrizione:
    `Le fotografie di ${RISTORANTE.nomeCompleto}: la sala, la cucina a vista, la cantina storica ` +
    'e i dettagli di un servizio curato.',
  percorso: '/galleria',
  immagine: '/immagini/ambienti/galleria-copertina.jpg',
})

export default function PaginaGalleria() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaBriciole([{ nome: 'Galleria', percorso: '/galleria' }])),
        }}
      />

      <Copertina
        soprattitolo="Immagini"
        titolo="Galleria"
        sottotitolo="La sala, la brace, la cantina e le mani al lavoro. Toccate una fotografia per vederla a schermo intero."
        immagine="/immagini/ambienti/galleria-copertina.jpg"
        briciole={[{ nome: 'Galleria', percorso: '/galleria' }]}
      />

      <div className="contenitore py-20 sm:py-24">
        <Mosaico scatti={GALLERIA} />
      </div>

      <Invito />
    </>
  )
}
