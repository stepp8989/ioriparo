'use client'

import { useMemo, useState } from 'react'
import { ModuloRichiesta } from '@/componenti/moduli/ModuloRichiesta'
import { Bottone } from '@/componenti/ui/Bottone'
import { Finestra } from '@/componenti/ui/Finestra'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA } from '@/dati/azienda'
import { percentuale, prezzo, rataMensile } from '@/lib/utili'

/**
 * Simulatore di rata.
 *
 * Il calcolo è un ammortamento alla francese a tasso fisso, lo stesso che usano
 * gli istituti con cui lavoriamo. Restano fuori due cose che dipendono dalla
 * singola pratica: l'assicurazione facoltativa e l'imposta di bollo. È scritto
 * sotto al risultato, perché un simulatore che promette una rata più bassa di
 * quella vera fa perdere tempo a tutti.
 */
export function Simulatore({ prezzoIniziale = 25_000 }: { prezzoIniziale?: number }) {
  const [importo, setImporto] = useState(prezzoIniziale)
  const [anticipo, setAnticipo] = useState(() => Math.round((prezzoIniziale * 0.2) / 500) * 500)
  const [durata, setDurata] = useState(60)
  const [finestraAperta, setFinestraAperta] = useState(false)

  // L'anticipo non può superare il prezzo: si limita al volo invece di
  // mostrare un risultato negativo.
  const anticipoValido = Math.min(anticipo, Math.round(importo * 0.7))
  const finanziato = Math.max(importo - anticipoValido, 0)
  const conSpese = finanziato > 0 ? finanziato + AZIENDA.finanziamento.speseIstruttoria : 0

  const rata = useMemo(
    () => rataMensile(conSpese, AZIENDA.finanziamento.tanPredefinito, durata),
    [conSpese, durata],
  )

  const totaleRimborsato = rata * durata
  const interessi = Math.max(totaleRimborsato - conSpese, 0)
  const sottoMinimo = finanziato > 0 && finanziato < AZIENDA.finanziamento.importoMinimo

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-9">
        <Cursore
          etichetta="Prezzo del veicolo"
          valore={importo}
          minimo={5_000}
          massimo={120_000}
          passo={500}
          onCambia={(valore) => {
            setImporto(valore)
            // L'anticipo segue il prezzo quando diventerebbe sproporzionato.
            setAnticipo((precedente) => Math.min(precedente, Math.round(valore * 0.7)))
          }}
        />

        <Cursore
          etichetta="Anticipo"
          valore={anticipoValido}
          minimo={0}
          massimo={Math.round(importo * 0.7)}
          passo={500}
          onCambia={setAnticipo}
          nota={`${Math.round((anticipoValido / importo) * 100)}% del prezzo`}
        />

        <div>
          <p className="mb-3 text-[0.75rem] font-semibold tracking-[0.14em] text-tenue uppercase">
            Durata
          </p>
          <div className="flex flex-wrap gap-2">
            {AZIENDA.finanziamento.durateMesi.map((mesi) => (
              <button
                key={mesi}
                type="button"
                onClick={() => setDurata(mesi)}
                aria-pressed={durata === mesi}
                className={
                  durata === mesi
                    ? 'rounded-full border border-accento bg-accento px-5 py-2.5 text-[0.88rem] font-semibold text-white'
                    : 'rounded-full border border-bordo px-5 py-2.5 text-[0.88rem] font-medium text-tenue transition-colors hover:border-accento hover:text-accento'
                }
              >
                {mesi} mesi
              </button>
            ))}
          </div>
        </div>

        <dl className="grid gap-4 rounded-morbido border border-bordo bg-superficie-alt p-6 sm:grid-cols-3">
          {[
            { voce: 'Importo finanziato', valore: prezzo(finanziato) },
            { voce: 'Interessi totali', valore: prezzo(Math.round(interessi)) },
            { voce: 'Totale da rimborsare', valore: prezzo(Math.round(totaleRimborsato)) },
          ].map((riga) => (
            <div key={riga.voce}>
              <dt className="text-[0.75rem] tracking-[0.1em] text-tenue uppercase">{riga.voce}</dt>
              <dd className="mt-1.5 text-[1.05rem] font-semibold tabellare">{riga.valore}</dd>
            </div>
          ))}
        </dl>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-ampio border border-bordo bg-superficie p-7 shadow-morbida">
          <p className="text-[0.75rem] tracking-[0.16em] text-tenue uppercase">Rata mensile</p>
          <p className="mt-2 font-titolo text-[2.8rem] leading-none font-semibold tabellare">
            {finanziato > 0 ? prezzo(Math.round(rata)) : '—'}
          </p>

          <dl className="mt-6 space-y-2.5 border-y border-bordo py-5 text-[0.88rem]">
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">TAN fisso</dt>
              <dd className="font-semibold tabellare">{percentuale(AZIENDA.finanziamento.tanPredefinito)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">TAEG</dt>
              <dd className="font-semibold tabellare">{percentuale(AZIENDA.finanziamento.taegPredefinito)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">Spese di istruttoria</dt>
              <dd className="font-semibold tabellare">
                {prezzo(AZIENDA.finanziamento.speseIstruttoria)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-tenue">Rate</dt>
              <dd className="font-semibold tabellare">{durata}</dd>
            </div>
          </dl>

          {sottoMinimo && (
            <p className="mt-5 flex items-start gap-2.5 rounded-tenue border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[0.82rem] text-amber-600 scuro:text-amber-400">
              <Icona nome="avviso" className="mt-0.5 size-4 shrink-0" />
              Sotto {prezzo(AZIENDA.finanziamento.importoMinimo)} il finanziamento non è
              attivabile: conviene il pagamento diretto.
            </p>
          )}

          <Bottone
            className="mt-6 w-full"
            onClick={() => setFinestraAperta(true)}
            disabled={finanziato <= 0 || sottoMinimo}
          >
            Richiedi questo preventivo
            <Icona nome="freccia" className="size-4" />
          </Bottone>

          <p className="mt-4 text-[0.75rem] leading-relaxed text-tenue">
            Calcolo indicativo, non è un’offerta contrattuale. Restano esclusi l’assicurazione
            facoltativa e l’imposta di bollo; il preventivo definitivo dipende dall’istruttoria
            dell’istituto di credito.
          </p>
        </div>
      </aside>

      <Finestra
        aperta={finestraAperta}
        onChiudi={() => setFinestraAperta(false)}
        titolo="Richiesta di finanziamento"
      >
        <ModuloRichiesta
          tipo="finanziamento"
          veicoloTitolo=""
          prezzoVeicolo={importo}
          conIntestazione={false}
        />
      </Finestra>
    </div>
  )
}

/** Cursore con etichetta e valore in euro: usato solo qui, resta locale. */
function Cursore({
  etichetta,
  valore,
  minimo,
  massimo,
  passo,
  nota,
  onCambia,
}: {
  etichetta: string
  valore: number
  minimo: number
  massimo: number
  passo: number
  nota?: string
  onCambia: (valore: number) => void
}) {
  const id = `cursore-${etichetta.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className="text-[0.75rem] font-semibold tracking-[0.14em] text-tenue uppercase"
        >
          {etichetta}
        </label>
        <span className="font-titolo text-[1.3rem] font-semibold tabellare">{prezzo(valore)}</span>
      </div>

      <input
        id={id}
        type="range"
        min={minimo}
        max={massimo}
        step={passo}
        value={valore}
        onChange={(evento) => onCambia(Number(evento.target.value))}
        className="w-full accent-[var(--accento)]"
      />

      <div className="mt-1.5 flex justify-between text-[0.75rem] text-tenue">
        <span>{prezzo(minimo)}</span>
        {nota && <span className="font-medium">{nota}</span>}
        <span>{prezzo(massimo)}</span>
      </div>
    </div>
  )
}
