import { Copertina } from '@/componenti/ui/Copertina'
import { CartaMenu } from '@/componenti/menu/CartaMenu'
import { Invito } from '@/componenti/home/Invito'
import { Icona } from '@/componenti/ui/Icona'
import { ALLERGENI } from '@/lib/tipi'
import { leggi } from '@/lib/archivio'
import { metadatiPagina, schemaBriciole, schemaMenu } from '@/lib/seo'

export const metadata = metadatiPagina({
  titolo: 'Il menù',
  descrizione:
    'Antipasti, primi, secondi, pizza, carne, pesce, dolci, bevande e vini. Ogni piatto con ' +
    'descrizione, allergeni e prezzo aggiornato.',
  percorso: '/menu',
  immagine: '/immagini/ambienti/menu-copertina.jpg',
})

/**
 * Il menù completo.
 *
 * I piatti arrivano dall'archivio — quindi da quanto lo staff ha impostato nel
 * pannello — e vengono passati al componente client che gestisce i filtri.
 */
export default async function PaginaMenu() {
  const { piatti } = await leggi()
  const visibili = piatti.filter((piatto) => piatto.visibile)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            schemaMenu(visibili),
            schemaBriciole([{ nome: 'Menù', percorso: '/menu' }]),
          ]),
        }}
      />

      <Copertina
        soprattitolo="La carta"
        titolo="Il menù"
        sottotitolo="Cambia quattro volte l’anno, con le stagioni. Ogni piatto riporta descrizione, allergeni e prezzo."
        immagine="/immagini/ambienti/menu-copertina.jpg"
        briciole={[{ nome: 'Menù', percorso: '/menu' }]}
      />

      <div className="contenitore py-16 sm:py-20">
        <CartaMenu piatti={visibili} />

        {/* Nota sugli allergeni: obbligatoria e utile, quindi ben visibile */}
        <aside className="mt-20 border border-bordo bg-superficie-alt p-7 sm:p-9">
          <h2 className="flex items-center gap-3 font-titolo text-2xl">
            <Icona nome="campanella" className="size-5 text-accento" />
            Allergie e intolleranze
          </h2>

          <p className="mt-4 text-sm leading-relaxed text-tenue">
            Accanto a ogni piatto trovate gli allergeni presenti fra i quattordici indicati dal
            Regolamento UE 1169/2011. Alcune preparazioni possono contenere tracce di altri
            allergeni per contatto in cucina: segnalate sempre le vostre esigenze al personale di
            sala o nelle richieste particolari della prenotazione, e lo chef preparerà
            un’alternativa.
          </p>

          <ul className="mt-6 flex flex-wrap gap-2">
            {ALLERGENI.map((allergene) => (
              <li
                key={allergene}
                className="border border-bordo px-3 py-1.5 text-xs capitalize text-tenue"
              >
                {allergene}
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-tenue">
            Alcuni prodotti ittici somministrati crudi sono sottoposti ad abbattimento rapido di
            temperatura secondo il Regolamento CE 853/2004. In assenza di prodotto fresco vengono
            impiegate materie prime surgelate all’origine. Coperto e servizio inclusi nel prezzo.
          </p>
        </aside>
      </div>

      <Invito />
    </>
  )
}
