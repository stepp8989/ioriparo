import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Gift, Link2, MessageCircle, Star, UserPlus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Form'
import { nuovoId, useGestionale } from '@/data/store'
import {
  amiciPortati,
  calcolaTessera,
  clienteDaInvito,
  codiceInvito,
  messaggioTessera,
  movimentiCliente,
  regoleFedelta,
  scontoAmicoUsato,
  whatsappCliente,
} from '@/lib/fedelta'
import { formatEuro, formatNumero } from '@/lib/format'
import { PELLICOLA, haDirittoPellicola, pellicolaApplicata } from '@/lib/omaggi'
import type { Cliente, Riparazione } from '@/types'

function Barra({ avanzamento }: { avanzamento: number }) {
  return (
    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-3">
      <div
        className="h-full rounded-full bg-brand transition-[width]"
        style={{ width: `${Math.max(2, avanzamento * 100)}%` }}
      />
    </div>
  )
}

/** Scheda della tessera nella pagina del cliente. */
export function TesseraCliente({ cliente }: { cliente: Cliente }) {
  const { db, aggiornaCliente } = useGestionale()
  const regole = regoleFedelta(db.azienda.fedelta)
  const tessera = calcolaTessera(movimentiCliente(db, cliente.id), regole)
  const amici = amiciPortati(db, cliente.id)
  const presentatore = cliente.invitatoDa
    ? db.clienti.find((c) => c.id === cliente.invitatoDa)
    : undefined
  const codice = codiceInvito(cliente.id)

  const [codiceAmico, setCodiceAmico] = useState('')
  const [errore, setErrore] = useState('')
  const [copiato, setCopiato] = useState(false)

  // Lo sconto di benvenuto è per i clienti nuovi: chi ha già ritirato una
  // riparazione non può essere «portato» a posteriori.
  const giaCliente = db.riparazioni.some(
    (r) => r.clienteId === cliente.id && r.stato === 'consegnato',
  )

  function collega() {
    const trovato = clienteDaInvito(db.clienti, codiceAmico)
    if (!trovato) return setErrore('Nessun cliente con questo codice invito.')
    if (trovato.id === cliente.id) return setErrore('Il codice è di questo stesso cliente.')
    if (trovato.invitatoDa === cliente.id)
      return setErrore('Questo cliente è stato invitato proprio da lui: non possono invitarsi a vicenda.')
    aggiornaCliente(cliente.id, { invitatoDa: trovato.id })
    setCodiceAmico('')
    setErrore('')
  }

  async function copia() {
    try {
      await navigator.clipboard.writeText(codice)
      setCopiato(true)
      window.setTimeout(() => setCopiato(false), 1800)
    } catch {
      /* appunti non disponibili: il codice resta comunque visibile */
    }
  }

  return (
    <Card>
      <CardHeader
        titolo="Tessera fedeltà"
        sottotitolo={regole.attivo ? undefined : 'Programma sospeso nelle Impostazioni'}
        azione={
          tessera.buoni > 0 ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/12 px-2 py-0.5 text-[11px] font-semibold text-emerald-300">
              <Gift size={12} />
              {tessera.buoni === 1 ? '1 buono' : `${tessera.buoni} buoni`}
            </span>
          ) : undefined
        }
      />

      <p className="mt-3 text-3xl font-bold text-ink tabular-nums">
        {formatNumero(tessera.punti)} <span className="text-sm font-medium text-ink-faint">punti</span>
      </p>
      <Barra avanzamento={tessera.avanzamento} />
      <p className="mt-1.5 text-xs text-ink-faint">
        {formatNumero(tessera.mancano)} punti al prossimo buono da {formatEuro(regole.valorePremio)}
        {tessera.daAmici > 0 && ` · ${formatNumero(tessera.daAmici)} punti dagli amici`}
      </p>

      <div className="mt-4 flex items-center justify-between gap-2 rounded-lg border border-dashed border-line-soft bg-surface-2 px-3 py-2">
        <div>
          <p className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">Codice invito</p>
          <p className="font-mono text-sm font-semibold tracking-widest text-ink">{codice}</p>
        </div>
        <Button dimensione="sm" variante="fantasma" onClick={() => void copia()}>
          <Copy size={13} />
          {copiato ? 'Copiato' : 'Copia'}
        </Button>
      </div>

      <a
        href={whatsappCliente(cliente.telefono, messaggioTessera(cliente, tessera, regole, db.azienda.nome))}
        target="_blank"
        rel="noreferrer"
        className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/12 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20"
      >
        <MessageCircle size={16} />
        Invia saldo e codice su WhatsApp
      </a>

      <div className="mt-4 border-t border-line pt-3 text-sm">
        {presentatore ? (
          <p className="flex items-center gap-2 text-ink-muted">
            <UserPlus size={14} className="text-ink-faint" />
            Invitato da{' '}
            <Link to={`/gestionale/clienti/${presentatore.id}`} className="font-medium text-blue-400 hover:text-blue-300">
              {presentatore.nome}
            </Link>
          </p>
        ) : giaCliente ? (
          <p className="text-xs text-ink-faint">Arrivato senza codice invito.</p>
        ) : (
          <div>
            <p className="mb-1.5 text-xs font-medium text-ink-muted">Codice invito ricevuto da un amico</p>
            <div className="flex gap-2">
              <Input
                value={codiceAmico}
                onChange={(e) => setCodiceAmico(e.target.value)}
                placeholder="IR-K7M2Q"
                className="font-mono uppercase"
              />
              <Button onClick={collega} disabled={!codiceAmico.trim()}>
                <Link2 size={14} />
                Collega
              </Button>
            </div>
            {errore && <p className="mt-1 text-xs text-rose-400">{errore}</p>}
          </div>
        )}

        {amici.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
              Amici portati ({amici.length})
            </p>
            <ul className="mt-1.5 space-y-1">
              {amici.map(({ cliente: amico, valido }) => (
                <li key={amico.id} className="flex items-center justify-between gap-2 text-xs">
                  <Link to={`/gestionale/clienti/${amico.id}`} className="truncate text-ink hover:text-blue-300">
                    {amico.nome}
                  </Link>
                  <span className={valido ? 'text-emerald-400' : 'text-ink-faint'}>
                    {valido ? `+${formatNumero(regole.puntiPresentatore)} punti` : 'in attesa del ritiro'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Card>
  )
}

/**
 * Buono fedeltà e sconto di benvenuto, dalla scheda della riparazione.
 *
 * Entrambi diventano una riga a prezzo negativo fra gli interventi: finiscono
 * sul totale, sulla stampa e in fattura senza altri passaggi, e togliendo la
 * riga si annullano (i punti tornano sulla tessera da soli).
 */
export function FedeltaRiparazione({ riparazione }: { riparazione: Riparazione }) {
  const { db, aggiornaRiparazione, clientePerId } = useGestionale()
  const cliente = clientePerId(riparazione.clienteId)
  const regole = regoleFedelta(db.azienda.fedelta)
  if (!cliente || !regole.attivo) return null

  const tessera = calcolaTessera(movimentiCliente(db, cliente.id), regole)
  const puoAmico = Boolean(cliente.invitatoDa) && !scontoAmicoUsato(db.riparazioni, cliente.id)
  const chiusa = riparazione.stato === 'consegnato' || riparazione.stato === 'non_riparabile'

  function aggiungi(riga: Riparazione['interventi'][number]) {
    aggiornaRiparazione(riparazione.id, { interventi: [...riparazione.interventi, riga] })
  }

  return (
    <Card className="print:hidden">
      <CardHeader titolo="Tessera fedeltà" />
      <p className="mt-2 flex items-center gap-2 text-sm text-ink">
        <Star size={15} className="text-amber-400" />
        <span className="font-semibold tabular-nums">{formatNumero(tessera.punti)} punti</span>
        <span className="text-xs text-ink-faint">
          · {tessera.buoni > 0 ? `${tessera.buoni} buoni disponibili` : `${formatNumero(tessera.mancano)} al buono`}
        </span>
      </p>

      <div className="mt-3 space-y-2">
        <Button
          className="w-full"
          variante="successo"
          disabled={tessera.buoni < 1 || chiusa}
          onClick={() =>
            aggiungi({
              id: nuovoId('int'),
              descrizione: `Buono fedeltà (${formatNumero(regole.puntiPremio)} punti)`,
              quantita: 1,
              prezzoUnitario: -regole.valorePremio,
              puntiUsati: regole.puntiPremio,
            })
          }
        >
          <Gift size={15} />
          Usa buono da {formatEuro(regole.valorePremio)}
        </Button>

        {puoAmico && (
          <Button
            className="w-full"
            variante="successo"
            disabled={chiusa}
            onClick={() =>
              aggiungi({
                id: nuovoId('int'),
                descrizione: 'Sconto di benvenuto «Porta un amico»',
                quantita: 1,
                prezzoUnitario: -regole.scontoAmico,
                scontoAmico: true,
              })
            }
          >
            <UserPlus size={15} />
            Sconto amico {formatEuro(regole.scontoAmico)}
          </Button>
        )}
      </div>
      <p className="mt-2 text-[11px] text-ink-faint">
        Il buono diventa una voce negativa fra gli interventi. Togliendo la voce i punti tornano sulla tessera.
      </p>
    </Card>
  )
}

/**
 * Promemoria dell'omaggio nella scheda della riparazione: se il lavoro è un
 * display Apple o Samsung, la pellicola va applicata e segnata. Diventa una
 * riga a zero euro, così compare sulla scheda stampata e sulla ricevuta.
 */
export function OmaggioRiparazione({ riparazione }: { riparazione: Riparazione }) {
  const { aggiornaRiparazione } = useGestionale()
  if (!haDirittoPellicola(riparazione)) return null
  const applicata = pellicolaApplicata(riparazione)

  return (
    <Card className="print:hidden">
      <CardHeader titolo="Omaggio display" />
      <p className="mt-2 text-sm text-ink-muted">
        {PELLICOLA.prodotto} in omaggio {PELLICOLA.condizione}.
      </p>
      {applicata ? (
        <p className="mt-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
          <Gift size={15} />
          Omaggio segnato sulla scheda
        </p>
      ) : (
        <Button
          className="mt-3 w-full"
          variante="successo"
          onClick={() =>
            aggiornaRiparazione(riparazione.id, {
              interventi: [
                ...riparazione.interventi,
                { id: nuovoId('int'), descrizione: PELLICOLA.riga, quantita: 1, prezzoUnitario: 0, omaggio: true },
              ],
            })
          }
        >
          <Gift size={15} />
          Aggiungi pellicola in omaggio
        </Button>
      )}
    </Card>
  )
}
