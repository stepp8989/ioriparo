'use client'

import { useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import { useAvvisi } from '@/componenti/ui/Avviso'
import { Area, Campo } from '@/componenti/ui/campi'
import { classi, emailValida, oggiIso, prezzo, sommaGiorni } from '@/lib/utili'

/**
 * Acquisto di una gift card.
 *
 * Il controllo dei campi avviene due volte: qui, per dirlo subito e accanto al
 * campo sbagliato, e di nuovo sul server, che è l'unico controllo che conta.
 * Quello nel browser esiste per non far attendere una risposta di rete per
 * scoprire che manca la chiocciola nell'indirizzo.
 *
 * Il codice non viene generato qui: lo produce il server. Un codice creato dal
 * browser sarebbe un codice che il browser può scegliere.
 */

const TAGLI = [10, 25, 50, 100] as const

export function ModuloGiftCard({ saldoMassimo = 500 }: { saldoMassimo?: number }) {
  const { mostra } = useAvvisi()

  const [valore, setValore] = useState<number>(25)
  const [personalizzato, setPersonalizzato] = useState('')
  const [mittente, setMittente] = useState({ nome: '', email: '' })
  const [destinatario, setDestinatario] = useState({ nome: '', email: '' })
  const [messaggio, setMessaggio] = useState('')
  const [dataInvio, setDataInvio] = useState(oggiIso())
  const [errori, setErrori] = useState<Record<string, string>>({})
  const [invio, setInvio] = useState(false)
  const [esito, setEsito] = useState<{ codice: string; valore: number } | null>(null)

  const importo = personalizzato ? Number(personalizzato) : valore

  function controlla(): boolean {
    const nuovi: Record<string, string> = {}

    if (!Number.isFinite(importo) || importo < 5) nuovi.importo = 'L’importo minimo è 5 €.'
    else if (importo > saldoMassimo) nuovi.importo = `L’importo massimo è ${prezzo(saldoMassimo)}.`

    if (!mittente.nome.trim()) nuovi.mittenteNome = 'Indica il tuo nome.'
    if (!emailValida(mittente.email)) nuovi.mittenteEmail = 'Indirizzo email non valido.'
    if (!destinatario.nome.trim()) nuovi.destinatarioNome = 'Indica il nome di chi riceve.'
    if (!emailValida(destinatario.email)) nuovi.destinatarioEmail = 'Indirizzo email non valido.'

    if (dataInvio < oggiIso()) nuovi.dataInvio = 'La data non può essere nel passato.'

    setErrori(nuovi)
    return Object.keys(nuovi).length === 0
  }

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    if (!controlla()) return

    setInvio(true)
    try {
      const risposta = await fetch('/api/giftcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valore: importo,
          mittente,
          destinatario,
          messaggio,
          dataInvio,
        }),
      })

      const dati = (await risposta.json()) as { codice?: string; valore?: number; errore?: string }

      if (!risposta.ok || !dati.codice) {
        mostra(dati.errore ?? 'Non è stato possibile creare la gift card.', 'errore')
        return
      }

      setEsito({ codice: dati.codice, valore: dati.valore ?? importo })
      mostra('Gift card creata.', 'ok')
    } catch {
      mostra('Connessione non riuscita. Riprova fra poco.', 'errore')
    } finally {
      setInvio(false)
    }
  }

  if (esito) {
    return (
      <div className="rounded-ampio border border-ok/40 bg-superficie p-8 text-center">
        <span className="inline-flex size-14 items-center justify-center rounded-full bg-ok/12 text-ok">
          <Icona nome="spunta" className="size-7" />
        </span>

        <h2 className="mt-5 font-titolo text-[1.5rem] font-semibold">Gift card creata</h2>
        <p className="mt-2 text-[0.92rem] text-tenue">
          {dataInvio === oggiIso()
            ? `L’email con il codice è in partenza verso ${destinatario.email}.`
            : `L’email partirà il ${dataInvio} verso ${destinatario.email}.`}
        </p>

        <div className="mx-auto mt-7 max-w-sm rounded-morbido border border-dashed border-accento/50 bg-accento/6 p-6">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-tenue">
            Codice
          </p>
          <p className="tabellare mt-2 font-titolo text-[1.8rem] font-bold tracking-[0.22em]">
            {esito.codice}
          </p>
          <p className="mt-3 text-[0.9rem] text-tenue">Valore {prezzo(esito.valore)}</p>
        </div>

        <p className="mx-auto mt-6 max-w-md text-[0.84rem] leading-relaxed text-tenue">
          Conserva questo codice: si usa al momento del pagamento e può essere speso in più volte
          finché resta credito. Se l’email non arriva, il codice qui sopra è comunque valido.
        </p>

        <Bottone
          variante="contorno"
          className="mt-7"
          onClick={() => {
            setEsito(null)
            setMessaggio('')
            setDestinatario({ nome: '', email: '' })
          }}
        >
          Crea un’altra gift card
        </Bottone>
      </div>
    )
  }

  return (
    <form onSubmit={invia} noValidate className="space-y-7">
      <fieldset>
        <legend className="mb-3 text-[0.78rem] font-semibold uppercase tracking-[0.14em] text-tenue">
          Valore
        </legend>

        <div className="flex flex-wrap gap-2.5">
          {TAGLI.map((taglio) => (
            <button
              key={taglio}
              type="button"
              onClick={() => {
                setValore(taglio)
                setPersonalizzato('')
              }}
              aria-pressed={!personalizzato && valore === taglio}
              className={classi(
                'rounded-tenue border px-6 py-3.5 font-titolo text-[1.1rem] font-semibold transition-all duration-300',
                !personalizzato && valore === taglio
                  ? 'border-accento bg-accento text-white'
                  : 'border-bordo bg-superficie text-tenue hover:border-accento hover:text-accento',
              )}
            >
              {prezzo(taglio)}
            </button>
          ))}
        </div>

        <div className="mt-4 max-w-xs">
          <Campo
            etichetta="Oppure un importo a scelta"
            type="number"
            min={5}
            max={saldoMassimo}
            step={5}
            inputMode="numeric"
            value={personalizzato}
            onChange={(evento) => setPersonalizzato(evento.target.value)}
            placeholder="es. 35"
            errore={errori.importo}
            aiuto={`Da 5 € a ${prezzo(saldoMassimo)}.`}
          />
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          etichetta="Il tuo nome"
          richiesto
          value={mittente.nome}
          onChange={(evento) => setMittente({ ...mittente, nome: evento.target.value })}
          errore={errori.mittenteNome}
          autoComplete="name"
        />
        <Campo
          etichetta="La tua email"
          type="email"
          richiesto
          value={mittente.email}
          onChange={(evento) => setMittente({ ...mittente, email: evento.target.value })}
          errore={errori.mittenteEmail}
          aiuto="Ci serve per mandarti la ricevuta."
          autoComplete="email"
        />
        <Campo
          etichetta="Nome di chi riceve"
          richiesto
          value={destinatario.nome}
          onChange={(evento) => setDestinatario({ ...destinatario, nome: evento.target.value })}
          errore={errori.destinatarioNome}
        />
        <Campo
          etichetta="Email di chi riceve"
          type="email"
          richiesto
          value={destinatario.email}
          onChange={(evento) => setDestinatario({ ...destinatario, email: evento.target.value })}
          errore={errori.destinatarioEmail}
        />
      </div>

      <Area
        etichetta="Messaggio"
        value={messaggio}
        onChange={(evento) => setMessaggio(evento.target.value)}
        maxLength={400}
        aiuto={`${messaggio.length}/400 caratteri. Comparirà nell’email insieme al codice.`}
        placeholder="Buon compleanno! Scegli tu il film."
      />

      <Campo
        etichetta="Quando inviarla"
        type="date"
        value={dataInvio}
        min={oggiIso()}
        max={sommaGiorni(oggiIso(), 365)}
        onChange={(evento) => setDataInvio(evento.target.value)}
        errore={errori.dataInvio}
        aiuto="Lascia la data di oggi per mandarla subito."
        className="max-w-xs"
      />

      <Nota icona={<Icona nome="lucchetto" className="size-4" />}>
        Il pagamento avviene sulla pagina protetta del nostro fornitore: i dati della carta non
        transitano dai nostri sistemi e non vengono conservati.
      </Nota>

      <Bottone type="submit" misura="grande" disabled={invio}>
        <Icona nome="regalo" className="size-4" />
        {invio ? 'Creazione in corso…' : `Regala ${prezzo(Number.isFinite(importo) ? importo : 0)}`}
      </Bottone>
    </form>
  )
}
