'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { SchedaPiatto } from '@/componenti/menu/SchedaPiatto'
import { Icona } from '@/componenti/ui/Icona'
import { CATEGORIE, NOMI_CATEGORIA, type Categoria, type Piatto } from '@/lib/tipi'
import { classi } from '@/lib/utili'

/**
 * Carta del menù con filtro per categoria.
 *
 * Il filtro agisce sui piatti già ricevuti dal server: nessuna nuova richiesta
 * di rete a ogni clic, quindi il cambio di categoria è immediato. Le categorie
 * senza piatti non compaiono nella barra.
 */
export function CartaMenu({ piatti }: { piatti: Piatto[] }) {
  const [categoria, setCategoria] = useState<Categoria | 'tutti'>('tutti')
  const [soloConsigliati, setSoloConsigliati] = useState(false)
  const menoMovimento = useReducedMotion()

  // Categorie effettivamente presenti nel menù, nell'ordine canonico.
  const disponibili = useMemo(
    () => CATEGORIE.filter((voce) => piatti.some((piatto) => piatto.categoria === voce)),
    [piatti],
  )

  const visibili = useMemo(() => {
    return piatti
      .filter((piatto) => categoria === 'tutti' || piatto.categoria === categoria)
      .filter((piatto) => !soloConsigliati || piatto.etichetta !== null)
      .sort((primo, secondo) => {
        const differenza = CATEGORIE.indexOf(primo.categoria) - CATEGORIE.indexOf(secondo.categoria)
        return differenza !== 0 ? differenza : primo.ordine - secondo.ordine
      })
  }, [piatti, categoria, soloConsigliati])

  // Raggruppamento per categoria: serve a mostrare i titoli di sezione.
  const gruppi = useMemo(() => {
    const mappa = new Map<Categoria, Piatto[]>()
    for (const piatto of visibili) {
      const elenco = mappa.get(piatto.categoria) ?? []
      elenco.push(piatto)
      mappa.set(piatto.categoria, elenco)
    }
    return [...mappa.entries()]
  }, [visibili])

  return (
    <div>
      {/* Barra dei filtri: resta agganciata sotto l'intestazione mentre si scorre */}
      <div className="sticky top-[4.5rem] z-30 -mx-5 border-y border-bordo bg-sfondo/90 px-5 py-4 backdrop-blur-xl no-stampa md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            role="tablist"
            aria-label="Filtra il menù per categoria"
          >
            <Filtro attivo={categoria === 'tutti'} onClick={() => setCategoria('tutti')}>
              Tutto il menù
            </Filtro>

            {disponibili.map((voce) => (
              <Filtro key={voce} attivo={categoria === voce} onClick={() => setCategoria(voce)}>
                {NOMI_CATEGORIA[voce]}
              </Filtro>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-tenue">
              <input
                type="checkbox"
                checked={soloConsigliati}
                onChange={(evento) => setSoloConsigliati(evento.target.checked)}
                className="size-4 accent-[var(--accento)]"
              />
              Solo novità e consigliati
            </label>

            <button
              type="button"
              onClick={() => window.print()}
              className="hidden items-center gap-2 text-sm text-tenue transition-colors hover:text-accento sm:inline-flex"
            >
              <Icona nome="stampa" className="size-4" />
              Stampa
            </button>
          </div>
        </div>
      </div>

      {/* Piatti */}
      <div className="mt-12">
        {gruppi.length === 0 && (
          <p className="py-20 text-center text-tenue">
            Nessun piatto corrisponde ai filtri scelti.
          </p>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={`${categoria}-${soloConsigliati}`}
            initial={{ opacity: 0, y: menoMovimento ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: menoMovimento ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {gruppi.map(([nome, elenco], indiceGruppo) => (
              <section key={nome} className="mb-16 last:mb-0" aria-labelledby={`categoria-${nome}`}>
                <div className="mb-8 flex items-center gap-5">
                  <h2 id={`categoria-${nome}`} className="font-titolo text-3xl sm:text-4xl">
                    {NOMI_CATEGORIA[nome]}
                  </h2>
                  <span className="h-px flex-1 bg-bordo" aria-hidden />
                  <span className="text-xs uppercase tracking-[0.2em] text-tenue">
                    {elenco.length} {elenco.length === 1 ? 'piatto' : 'piatti'}
                  </span>
                </div>

                <div className="grid gap-x-12 lg:grid-cols-2">
                  {elenco.map((piatto, indice) => (
                    <SchedaPiatto
                      key={piatto.id}
                      piatto={piatto}
                      formato="riga"
                      priorita={indiceGruppo === 0 && indice < 2}
                    />
                  ))}
                </div>
              </section>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** Singolo pulsante della barra dei filtri. */
function Filtro({
  attivo,
  onClick,
  children,
}: {
  attivo: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={attivo}
      onClick={onClick}
      className={classi(
        'shrink-0 border px-5 py-2.5 text-[0.7rem] font-medium uppercase tracking-[0.14em] transition-all duration-300',
        attivo
          ? 'border-accento bg-accento text-white scuro:text-notte'
          : 'border-bordo text-tenue hover:border-accento hover:text-accento',
      )}
    >
      {children}
    </button>
  )
}
