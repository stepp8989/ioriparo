'use client'

import { useEffect, useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { AZIENDA } from '@/dati/azienda'

/**
 * Esito del pagamento al ritorno dal servizio.
 *
 * Chiede al server di verificare l'incasso e mostra il risultato. Non si fida
 * del parametro nell'indirizzo: quello dice solo da dove si torna, non se il
 * pagamento è andato a buon fine.
 */
export function EsitoPagamento({
  codice,
  annullato,
  token,
}: {
  codice: string
  annullato: boolean
  token: string
}) {
  const [stato, setStato] = useState<'verifica' | 'pagato' | 'attesa' | 'errore'>(
    annullato ? 'attesa' : 'verifica',
  )

  useEffect(() => {
    if (annullato || !codice) return

    let vivo = true

    fetch('/api/noleggi/conferma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codice, token }),
    })
      .then(async (risposta) => {
        const dati = (await risposta.json()) as { stato?: string }
        if (!vivo) return
        if (!risposta.ok) setStato('errore')
        else setStato(dati.stato === 'pagato' ? 'pagato' : 'attesa')
      })
      .catch(() => {
        if (vivo) setStato('errore')
      })

    return () => {
      vivo = false
    }
  }, [codice, annullato, token])

  const contenuti = {
    verifica: {
      icona: 'orologio' as const,
      colore: 'text-tenue',
      titolo: 'Stiamo verificando il pagamento',
      testo: 'Un istante: chiediamo conferma al servizio di pagamento.',
    },
    pagato: {
      icona: 'verifica' as const,
      colore: 'text-emerald-500',
      titolo: 'Pagamento riuscito',
      testo:
        'L’acconto è stato incassato e il noleggio è confermato. Vi abbiamo mandato la conferma per email: al ritiro servono patente e documento d’identità.',
    },
    attesa: {
      icona: 'info' as const,
      colore: 'text-amber-500',
      titolo: annullato ? 'Pagamento annullato' : 'Pagamento non completato',
      testo:
        'La prenotazione è comunque registrata e resta valida: potete saldare al ritiro. Se preferite riprovare con il pagamento online, chiamateci e vi rimandiamo il collegamento.',
    },
    errore: {
      icona: 'avviso' as const,
      colore: 'text-red-500',
      titolo: 'Non riusciamo a verificare il pagamento',
      testo:
        'La prenotazione è registrata. Chiamateci per confermare lo stato del pagamento: risolviamo in un minuto.',
    },
  }[stato]

  return (
    <div className="mx-auto max-w-xl rounded-ampio border border-bordo bg-superficie p-10 text-center shadow-morbida">
      <span className={`inline-flex size-16 items-center justify-center ${contenuti.colore}`}>
        <Icona
          nome={contenuti.icona}
          className={stato === 'verifica' ? 'size-10 animate-spin' : 'size-10'}
        />
      </span>

      <h1 className="mt-5 font-titolo text-[1.6rem] font-semibold">{contenuti.titolo}</h1>
      <p className="mt-4 text-[0.98rem] leading-relaxed text-tenue">{contenuti.testo}</p>

      {codice && (
        <p className="mt-7 inline-flex items-center gap-3 rounded-full border border-bordo bg-superficie-alt px-5 py-2.5">
          <span className="text-[0.8rem] text-tenue">Codice</span>
          <span className="font-titolo text-[1.1rem] font-semibold tabellare">{codice}</span>
        </p>
      )}

      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <Bottone href="/">Torna alla home</Bottone>
        <Bottone href={`tel:${AZIENDA.telefonoLink}`} variante="contorno">
          <Icona nome="telefono" className="size-4" />
          {AZIENDA.telefono}
        </Bottone>
      </div>
    </div>
  )
}
