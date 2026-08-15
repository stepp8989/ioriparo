'use client'

import { useEffect, useState } from 'react'
import { Caricamento, Errore, invia, TestataPagina, useRisorsa } from '@/componenti/admin/comuni'
import { Bottone } from '@/componenti/ui/Bottone'
import { Esito } from '@/componenti/ui/campi'
import type { OrarioGiorno } from '@/lib/tipi'

/**
 * Orari di apertura.
 *
 * Una modifica qui si riflette nel piè di pagina, nella pagina Contatti e nei
 * dati strutturati che Google usa per la scheda dell'attività: è il posto in
 * cui si cambia l'orario estivo una volta sola invece che in tre punti.
 */
export function GestioneOrari() {
  const { dati, caricamento, errore, ricarica } = useRisorsa<{ orari: OrarioGiorno[] }>('/api/orari')
  const [orari, setOrari] = useState<OrarioGiorno[]>([])
  const [messaggio, setMessaggio] = useState('')
  const [esito, setEsito] = useState<'ok' | 'errore'>('ok')
  const [salvataggio, setSalvataggio] = useState(false)

  // Il modulo lavora su una copia locale: si salva quando si è finito, non a
  // ogni tasto premuto.
  useEffect(() => {
    if (dati?.orari) setOrari(dati.orari)
  }, [dati])

  function aggiorna(indice: number, modifica: Partial<OrarioGiorno>) {
    setOrari((precedenti) =>
      precedenti.map((giorno, posizione) =>
        posizione === indice ? { ...giorno, ...modifica } : giorno,
      ),
    )
  }

  async function salva() {
    setSalvataggio(true)
    setMessaggio('')

    const risultato = await invia('/api/orari', 'PUT', { orari })
    setSalvataggio(false)
    setEsito(risultato.ok ? 'ok' : 'errore')
    setMessaggio(risultato.ok ? 'Orari salvati.' : risultato.errore)

    if (risultato.ok) await ricarica()
  }

  if (caricamento) return <Caricamento />

  return (
    <>
      <TestataPagina
        titolo="Orari"
        descrizione="Aperture di salone e officina. Si riflettono su tutto il sito e sui dati per Google."
      />

      <Errore testo={errore} onRiprova={ricarica} />

      <div className="max-w-3xl space-y-3">
        {orari.map((giorno, indice) => (
          <div
            key={giorno.giorno}
            className="flex flex-wrap items-center gap-4 rounded-ampio border border-bordo bg-superficie p-4"
          >
            <span className="w-28 font-semibold">{giorno.giorno}</span>

            <label className="flex items-center gap-2.5 text-[0.85rem] text-tenue">
              <input
                type="checkbox"
                checked={giorno.chiuso}
                onChange={(evento) => aggiorna(indice, { chiuso: evento.target.checked })}
                className="size-4 accent-[var(--accento)]"
              />
              Chiuso
            </label>

            {!giorno.chiuso && (
              <div className="flex flex-1 flex-wrap gap-3">
                <label className="flex-1">
                  <span className="sr-only">Mattina di {giorno.giorno}</span>
                  <input
                    value={giorno.mattina ?? ''}
                    onChange={(evento) => aggiorna(indice, { mattina: evento.target.value })}
                    placeholder="08:30 – 13:00"
                    className="w-full min-w-32 rounded-tenue border border-bordo bg-superficie px-3 py-2 text-[0.88rem] focus:border-accento focus:outline-none tabellare"
                  />
                </label>

                <label className="flex-1">
                  <span className="sr-only">Pomeriggio di {giorno.giorno}</span>
                  <input
                    value={giorno.pomeriggio ?? ''}
                    onChange={(evento) => aggiorna(indice, { pomeriggio: evento.target.value })}
                    placeholder="15:30 – 19:30"
                    className="w-full min-w-32 rounded-tenue border border-bordo bg-superficie px-3 py-2 text-[0.88rem] focus:border-accento focus:outline-none tabellare"
                  />
                </label>
              </div>
            )}
          </div>
        ))}

        <p className="pt-2 text-[0.82rem] leading-relaxed text-tenue">
          Il formato accettato è «08:30 – 13:00». Una fascia lasciata vuota o scritta in altro modo
          viene considerata assente: lasciate vuoto il pomeriggio del sabato se si chiude a
          mezzogiorno.
        </p>

        <Esito testo={messaggio} tipo={esito} />

        <div className="pt-2">
          <Bottone onClick={salva} disabled={salvataggio}>
            {salvataggio ? 'Salvataggio…' : 'Salva gli orari'}
          </Bottone>
        </div>
      </div>
    </>
  )
}
