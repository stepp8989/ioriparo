'use client'

import { useState } from 'react'
import { Bottone } from '@/componenti/ui/Bottone'
import { Icona } from '@/componenti/ui/Icona'
import { Nota } from '@/componenti/ui/Sezione'
import { Campo, Spunta } from '@/componenti/ui/campi'
import { classi, emailValida } from '@/lib/utili'

/**
 * Accesso e registrazione all'area personale.
 *
 * Un solo componente per le due cose, con un interruttore: sono la stessa
 * decisione presa da parti opposte, e separarle in due pagine costringe chi
 * sbaglia a ricominciare.
 *
 * La password si può mostrare in chiaro. È l'opposto di quello che si faceva
 * una volta, e ha una ragione pratica: su un telefono, digitare a occhi chiusi
 * una password lunga produce più errori di quanti ne eviti, e chi ti guarda lo
 * schermo mentre compri un biglietto al cinema non è il modello di minaccia di
 * questo sito.
 */
export function Accesso({
  registrazioneAperta,
  onAccesso,
}: {
  registrazioneAperta: boolean
  onAccesso: () => void
}) {
  const [modo, setModo] = useState<'accesso' | 'registrazione'>('accesso')
  const [mostraPassword, setMostraPassword] = useState(false)
  const [invio, setInvio] = useState(false)
  const [errore, setErrore] = useState('')

  const [dati, setDati] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    password: '',
  })

  const [errori, setErrori] = useState<Record<string, string>>({})
  const [consenso, setConsenso] = useState(false)

  function aggiorna(campo: keyof typeof dati, valore: string) {
    setDati((precedenti) => ({ ...precedenti, [campo]: valore }))
  }

  function controlla(): boolean {
    const nuovi: Record<string, string> = {}

    if (!emailValida(dati.email)) nuovi.email = 'Indirizzo email non valido.'
    if (dati.password.length < 8) nuovi.password = 'La password deve avere almeno 8 caratteri.'

    if (modo === 'registrazione') {
      if (!dati.nome.trim()) nuovi.nome = 'Indica il tuo nome.'
      if (!dati.cognome.trim()) nuovi.cognome = 'Indica il tuo cognome.'
      if (!consenso) nuovi.consenso = 'Devi accettare i termini per registrarti.'
    }

    setErrori(nuovi)
    return Object.keys(nuovi).length === 0
  }

  async function invia(evento: React.FormEvent) {
    evento.preventDefault()
    if (!controlla()) return

    setInvio(true)
    setErrore('')

    const indirizzo =
      modo === 'accesso' ? '/api/clienti/accesso' : '/api/clienti/registrazione'

    try {
      const risposta = await fetch(indirizzo, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dati),
      })

      const esito = await risposta.json()

      if (!risposta.ok) {
        setErrore(esito.errore ?? 'Operazione non riuscita.')
        return
      }

      onAccesso()
    } catch {
      setErrore('Connessione non riuscita. Riprova fra poco.')
    } finally {
      setInvio(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-7 flex rounded-full border border-bordo bg-superficie p-1">
        {(['accesso', 'registrazione'] as const).map((voce) => (
          <button
            key={voce}
            type="button"
            onClick={() => {
              setModo(voce)
              setErrore('')
              setErrori({})
            }}
            disabled={voce === 'registrazione' && !registrazioneAperta}
            className={classi(
              'flex-1 rounded-full px-4 py-2.5 text-[0.88rem] font-medium transition-colors disabled:opacity-40',
              modo === voce ? 'bg-accento text-white' : 'text-tenue hover:text-testo',
            )}
          >
            {voce === 'accesso' ? 'Accedi' : 'Registrati'}
          </button>
        ))}
      </div>

      {errore && (
        <Nota tono="rosso" className="mb-5" icona={<Icona nome="avviso" className="size-4" />}>
          {errore}
        </Nota>
      )}

      <form onSubmit={invia} noValidate className="space-y-5">
        {modo === 'registrazione' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Campo
              etichetta="Nome"
              richiesto
              value={dati.nome}
              onChange={(evento) => aggiorna('nome', evento.target.value)}
              errore={errori.nome}
              autoComplete="given-name"
            />
            <Campo
              etichetta="Cognome"
              richiesto
              value={dati.cognome}
              onChange={(evento) => aggiorna('cognome', evento.target.value)}
              errore={errori.cognome}
              autoComplete="family-name"
            />
          </div>
        )}

        <Campo
          etichetta="Email"
          type="email"
          richiesto
          icona="posta"
          value={dati.email}
          onChange={(evento) => aggiorna('email', evento.target.value)}
          errore={errori.email}
          autoComplete="email"
        />

        <div>
          <Campo
            etichetta="Password"
            type={mostraPassword ? 'text' : 'password'}
            richiesto
            icona="lucchetto"
            value={dati.password}
            onChange={(evento) => aggiorna('password', evento.target.value)}
            errore={errori.password}
            aiuto={modo === 'registrazione' ? 'Almeno 8 caratteri.' : undefined}
            autoComplete={modo === 'accesso' ? 'current-password' : 'new-password'}
          />
          <button
            type="button"
            onClick={() => setMostraPassword((precedente) => !precedente)}
            className="mt-2 text-[0.8rem] text-tenue transition-colors hover:text-accento"
          >
            {mostraPassword ? 'Nascondi la password' : 'Mostra la password'}
          </button>
        </div>

        {modo === 'registrazione' && (
          <>
            <Campo
              etichetta="Telefono"
              type="tel"
              value={dati.telefono}
              onChange={(evento) => aggiorna('telefono', evento.target.value)}
              aiuto="Facoltativo."
              autoComplete="tel"
            />

            <Spunta
              etichetta={
                <>
                  Accetto i{' '}
                  <a href="/termini" target="_blank" className="text-accento underline">
                    termini
                  </a>{' '}
                  e l’
                  <a href="/privacy" target="_blank" className="text-accento underline">
                    informativa privacy
                  </a>
                </>
              }
              descrizione="Riceverai solo le email legate ai tuoi acquisti. Le promozionali sono una scelta separata, che puoi fare dopo."
              checked={consenso}
              onChange={(evento) => setConsenso(evento.target.checked)}
            />
            {errori.consenso && (
              <p className="text-[0.8rem] text-errore" role="alert">
                {errori.consenso}
              </p>
            )}
          </>
        )}

        <Bottone type="submit" misura="grande" disabled={invio} className="w-full">
          {invio
            ? 'Un momento…'
            : modo === 'accesso'
              ? 'Accedi'
              : 'Crea il mio account'}
        </Bottone>
      </form>

      {modo === 'accesso' && (
        <p className="mt-6 text-center text-[0.82rem] text-tenue">
          Hai comprato senza registrarti? Trovi il biglietto all’indirizzo che ti abbiamo mandato
          via email, oppure con il codice di prenotazione.
        </p>
      )}
    </div>
  )
}
