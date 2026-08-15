'use client'

import { useState, type FormEvent } from 'react'
import {
  Azione,
  Caricamento,
  conferma,
  Errore,
  invia,
  TestataPagina,
  useRisorsa,
  Vuoto,
} from '@/componenti/admin/comuni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { Area, Campo, Esito, Scelta } from '@/componenti/ui/campi'
import { Etichetta } from '@/componenti/ui/Sezione'
import { CATEGORIE_ARTICOLO, NOMI_CATEGORIA_ARTICOLO, type Articolo } from '@/lib/tipi'
import { classi, dataEstesa, oggiIso } from '@/lib/utili'

/**
 * Articoli del blog.
 *
 * Il corpo si scrive in un formato ridotto e leggibile anche da chi non conosce
 * l'HTML: `## ` per i sottotitoli, `- ` per gli elenchi, una riga vuota fra i
 * paragrafi. È lo stesso formato che il sito sa impaginare.
 */
export function GestioneBlog() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ articoli: Articolo[] }>(
    '/api/articoli',
  )
  const [inModifica, setInModifica] = useState<Articolo | 'nuovo' | null>(null)
  const [avviso, setAvviso] = useState('')

  const articoli = dati?.articoli ?? []

  async function alterna(articolo: Articolo, modifica: Partial<Articolo>) {
    const esito = await invia('/api/articoli', 'PATCH', { id: articolo.id, ...modifica })
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  async function elimina(articolo: Articolo) {
    if (!conferma(`Eliminare l’articolo «${articolo.titolo}»?`)) return
    const esito = await invia(`/api/articoli?id=${encodeURIComponent(articolo.id)}`, 'DELETE')
    if (!esito.ok) setAvviso(esito.errore)
    await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Blog"
        descrizione="Guide, consigli di manutenzione e novità. Le bozze restano fuori dal sito."
        azione={
          <Bottone misura="piccola" onClick={() => setInModifica('nuovo')}>
            <Icona nome="piu" className="size-4" />
            Nuovo articolo
          </Bottone>
        }
      />

      <Errore testo={errore || avviso} onRiprova={ricarica} />

      {articoli.length === 0 ? (
        <Vuoto testo="Nessun articolo. Scrivetene uno: le guide sono la pagina più letta dopo il catalogo." />
      ) : (
        <div className="space-y-3">
          {articoli.map((articolo) => (
            <article
              key={articolo.id}
              className={classi(
                'flex flex-wrap items-start justify-between gap-4 rounded-ampio border border-bordo bg-superficie p-5',
                !articolo.pubblicato && 'opacity-60',
              )}
            >
              <div className="min-w-[16rem] flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Etichetta tono="accento">
                    {NOMI_CATEGORIA_ARTICOLO[articolo.categoria]}
                  </Etichetta>
                  {!articolo.pubblicato && <Etichetta tono="ambra">Bozza</Etichetta>}
                  {articolo.inEvidenza && <Etichetta tono="verde">In evidenza</Etichetta>}
                </div>

                <h2 className="mt-3 font-semibold">{articolo.titolo}</h2>
                <p className="mt-1.5 text-[0.88rem] leading-relaxed text-tenue">
                  {articolo.sommario}
                </p>
                <p className="mt-2 text-[0.8rem] text-tenue">
                  {articolo.autore} · {dataEstesa(articolo.data)} · {articolo.minutiLettura} min ·
                  /blog/{articolo.slug}
                </p>
              </div>

              <div className="flex gap-2">
                <Azione
                  icona={articolo.pubblicato ? 'occhio' : 'occhioBarrato'}
                  etichetta={articolo.pubblicato ? 'Riporta in bozza' : 'Pubblica'}
                  onClick={() => alterna(articolo, { pubblicato: !articolo.pubblicato })}
                />
                <Azione
                  icona="stella"
                  etichetta="Metti in evidenza"
                  attivo={articolo.inEvidenza}
                  onClick={() => alterna(articolo, { inEvidenza: !articolo.inEvidenza })}
                />
                <Azione
                  icona="matita"
                  etichetta="Modifica"
                  tono="accento"
                  onClick={() => setInModifica(articolo)}
                />
                <Azione
                  icona="cestino"
                  etichetta="Elimina"
                  tono="rosso"
                  onClick={() => elimina(articolo)}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <Finestra
        aperta={inModifica !== null}
        onChiudi={() => setInModifica(null)}
        titolo={inModifica === 'nuovo' ? 'Nuovo articolo' : 'Modifica articolo'}
      >
        {inModifica && (
          <ModuloArticolo
            articolo={inModifica === 'nuovo' ? null : inModifica}
            onSalvato={async () => {
              setInModifica(null)
              await ricarica()
            }}
          />
        )}
      </Finestra>
    </>
  )
}

function ModuloArticolo({
  articolo,
  onSalvato,
}: {
  articolo: Articolo | null
  onSalvato: () => void | Promise<void>
}) {
  const [messaggio, setMessaggio] = useState('')
  const [salvataggio, setSalvataggio] = useState(false)

  async function salva(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    if (salvataggio) return

    const modulo = new FormData(evento.currentTarget)
    setSalvataggio(true)
    setMessaggio('')

    const esito = await invia('/api/articoli', articolo ? 'PUT' : 'POST', {
      id: articolo?.id,
      titolo: modulo.get('titolo'),
      sommario: modulo.get('sommario'),
      contenuto: modulo.get('contenuto'),
      categoria: modulo.get('categoria'),
      autore: modulo.get('autore'),
      data: modulo.get('data'),
      immagine: modulo.get('immagine'),
      tag: String(modulo.get('tag') ?? '')
        .split(',')
        .map((voce) => voce.trim())
        .filter(Boolean),
      pubblicato: modulo.get('pubblicato') === 'si',
      inEvidenza: modulo.get('inEvidenza') === 'si',
    })

    setSalvataggio(false)

    if (!esito.ok) {
      setMessaggio(esito.errore)
      return
    }

    await onSalvato()
  }

  return (
    <form onSubmit={salva} className="space-y-5">
      <Campo etichetta="Titolo" name="titolo" required defaultValue={articolo?.titolo} />

      <Area
        etichetta="Sommario"
        name="sommario"
        rows={2}
        maxLength={400}
        defaultValue={articolo?.sommario}
        nota="Due righe: compaiono nell’elenco e nei risultati di ricerca."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Scelta etichetta="Categoria" name="categoria" defaultValue={articolo?.categoria}>
          {CATEGORIE_ARTICOLO.map((categoria) => (
            <option key={categoria} value={categoria}>
              {NOMI_CATEGORIA_ARTICOLO[categoria]}
            </option>
          ))}
        </Scelta>
        <Campo etichetta="Autore" name="autore" defaultValue={articolo?.autore ?? 'Redazione'} />
        <Campo
          etichetta="Data"
          name="data"
          type="date"
          defaultValue={articolo?.data ?? oggiIso()}
        />
        <Campo
          etichetta="Immagine"
          name="immagine"
          defaultValue={articolo?.immagine ?? '/immagini/blog/auto-usata-garantita.jpg'}
        />
        <Scelta
          etichetta="Stato"
          name="pubblicato"
          defaultValue={articolo?.pubblicato === false ? 'no' : 'si'}
        >
          <option value="si">Pubblicato</option>
          <option value="no">Bozza</option>
        </Scelta>
        <Scelta
          etichetta="In evidenza"
          name="inEvidenza"
          defaultValue={articolo?.inEvidenza ? 'si' : 'no'}
        >
          <option value="no">No</option>
          <option value="si">Sì</option>
        </Scelta>
      </div>

      <Campo
        etichetta="Argomenti"
        name="tag"
        defaultValue={articolo?.tag.join(', ')}
        nota="Separati da virgola."
      />

      <Area
        etichetta="Contenuto"
        name="contenuto"
        rows={18}
        required
        defaultValue={articolo?.contenuto}
        nota="«## » per i sottotitoli, «- » per gli elenchi puntati, una riga vuota fra i paragrafi."
      />

      <Esito testo={messaggio} tipo="errore" />

      <Bottone type="submit" disabled={salvataggio}>
        {salvataggio ? 'Salvataggio…' : articolo ? 'Salva le modifiche' : 'Crea l’articolo'}
      </Bottone>

      {articolo && (
        <p className="text-[0.78rem] text-tenue">
          Indirizzo pubblico: /blog/{articolo.slug} — non cambia quando si modifica il titolo, per
          non rompere i collegamenti già condivisi.
        </p>
      )}
    </form>
  )
}
