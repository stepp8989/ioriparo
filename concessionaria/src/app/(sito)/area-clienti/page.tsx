import type { Metadata } from 'next'
import { AreaClienti } from '@/componenti/clienti/AreaClienti'
import { Intestazione } from '@/componenti/ui/Intestazione'
import { Sezione } from '@/componenti/ui/Sezione'
import { metadatiPagina } from '@/lib/seo'

/**
 * L'area riservata non va indicizzata: non ha contenuto pubblico utile e i
 * motori di ricerca finirebbero per mostrare fra i risultati una pagina di
 * accesso.
 */
export const metadata: Metadata = metadatiPagina({
  titolo: 'Area clienti',
  descrizione:
    'Accedete alla vostra area riservata: noleggi, appuntamenti, richieste, storico acquisti, ' +
    'documenti e fatture.',
  percorso: '/area-clienti',
  indicizza: false,
})

export default function PaginaAreaClienti() {
  return (
    <>
      <Intestazione
        soprattitolo="Area riservata"
        titolo={
          <>
            La vostra <span className="testo-accento">area clienti</span>
          </>
        }
        sottotitolo="Noleggi, appuntamenti, richieste, storico degli acquisti, documenti e fatture: tutto in un posto solo, sempre disponibile."
        briciole={[{ nome: 'Area clienti', percorso: '/area-clienti' }]}
      />

      <Sezione className="bg-sfondo">
        <AreaClienti />
      </Sezione>
    </>
  )
}
