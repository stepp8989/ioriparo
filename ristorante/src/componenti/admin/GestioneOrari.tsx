'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avviso, Interruttore, Pulsante, TestataPagina } from '@/componenti/admin/campi'
import type { OrarioGiorno } from '@/lib/tipi'
import { classi } from '@/lib/utili'

/** Formato accettato per una fascia: «12:30 – 14:30». */
const FORMATO = /^\s*\d{1,2}:\d{2}\s*[–-]\s*\d{1,2}:\d{2}\s*$/

/**
 * Orari di apertura.
 *
 * Non è solo una vetrina: da queste fasce il modulo di prenotazione ricava gli
 * orari selezionabili, e i dati strutturati comunicano le aperture a Google.
 * Per questo il formato viene controllato prima del salvataggio.
 */
export function GestioneOrari({ orari }: { orari: OrarioGiorno[] }) {
  const router = useRouter()
  const [bozza, setBozza] = useState<OrarioGiorno[]>(orari)
  const [salvataggio, setSalvataggio] = useState(false)
  const [avviso, setAvviso] = useState<{ tipo: 'ok' | 'errore'; testo: string }>({
    tipo: 'ok',
    testo: '',
  })

  const modificato = JSON.stringify(bozza) !== JSON.stringify(orari)

  function aggiorna(indice: number, modifiche: Partial<OrarioGiorno>) {
    setBozza((precedente) =>
      precedente.map((giorno, posizione) =>
        posizione === indice ? { ...giorno, ...modifiche } : giorno,
      ),
    )
    setAvviso({ tipo: 'ok', testo: '' })
  }

  async function salva() {
    // Una fascia scritta male non produrrebbe alcun orario prenotabile.
    const sbagliati = bozza.filter(
      (giorno) =>
        !giorno.chiuso &&
        [giorno.pranzo, giorno.cena].some((fascia) => fascia && !FORMATO.test(fascia)),
    )

    if (sbagliati.length > 0) {
      setAvviso({
        tipo: 'errore',
        testo: `Controllate il formato delle fasce (esempio: 12:30 – 14:30) per: ${sbagliati
          .map((giorno) => giorno.giorno)
          .join(', ')}.`,
      })
      return
    }

    if (bozza.every((giorno) => giorno.chiuso)) {
      setAvviso({ tipo: 'errore', testo: 'Almeno un giorno deve essere di apertura.' })
      return
    }

    setSalvataggio(true)
    try {
      const risposta = await fetch('/api/orari', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orari: bozza }),
      })
      if (!risposta.ok) throw new Error('Salvataggio non riuscito.')

      setAvviso({ tipo: 'ok', testo: 'Orari aggiornati su tutto il sito.' })
      router.refresh()
    } catch (problema) {
      setAvviso({
        tipo: 'errore',
        testo: problema instanceof Error ? problema.message : 'Salvataggio non riuscito.',
      })
    } finally {
      setSalvataggio(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <TestataPagina
        titolo="Orari di apertura"
        descrizione="Compaiono nel piè di pagina, nella pagina Contatti, nei dati per Google e determinano gli orari prenotabili."
        azione={
          <Pulsante icona="spunta" onClick={salva} disabled={!modificato || salvataggio}>
            {salvataggio ? 'Salvataggio…' : 'Salva gli orari'}
          </Pulsante>
        }
      />

      <Avviso tipo={avviso.tipo} testo={avviso.testo} />

      <ul className="divide-y divide-bordo border border-bordo bg-superficie">
        {bozza.map((giorno, indice) => (
          <li key={giorno.giorno} className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <p className={classi('w-28 shrink-0 font-medium', giorno.chiuso && 'text-tenue')}>
                {giorno.giorno}
              </p>

              <Interruttore
                etichetta="Chiuso"
                attivo={giorno.chiuso}
                onChange={(valore) =>
                  aggiorna(indice, {
                    chiuso: valore,
                    // Chiudendo il giorno le fasce non hanno più senso.
                    ...(valore ? { pranzo: null, cena: null } : {}),
                  })
                }
              />

              {!giorno.chiuso && (
                <div className="flex flex-1 flex-wrap gap-3">
                  <label className="flex-1">
                    <span className="mb-1 block text-[0.65rem] uppercase tracking-[0.14em] text-tenue">
                      Pranzo
                    </span>
                    <input
                      type="text"
                      value={giorno.pranzo ?? ''}
                      onChange={(evento) => aggiorna(indice, { pranzo: evento.target.value || null })}
                      placeholder="12:30 – 14:30"
                      className="w-full border border-bordo bg-superficie px-3 py-2 text-sm transition-colors focus:border-accento focus:outline-none"
                    />
                  </label>

                  <label className="flex-1">
                    <span className="mb-1 block text-[0.65rem] uppercase tracking-[0.14em] text-tenue">
                      Cena
                    </span>
                    <input
                      type="text"
                      value={giorno.cena ?? ''}
                      onChange={(evento) => aggiorna(indice, { cena: evento.target.value || null })}
                      placeholder="19:00 – 23:00"
                      className="w-full border border-bordo bg-superficie px-3 py-2 text-sm transition-colors focus:border-accento focus:outline-none"
                    />
                  </label>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-5 text-xs leading-relaxed text-tenue">
        Scrivete le fasce nella forma <strong className="text-testo">12:30 – 14:30</strong>. Lasciate
        vuoto un campo se quel servizio non viene svolto. Il modulo di prenotazione propone turni
        ogni trenta minuti e chiude le prenotazioni un’ora prima della fine del servizio.
      </p>
    </div>
  )
}
