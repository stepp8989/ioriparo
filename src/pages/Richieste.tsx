import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarClock,
  FileText,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Trash2,
  UserPlus,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useIntestazione } from '@/components/layout/intestazione'
import { useGestionale } from '@/data/store'
import { clienteDaInvito } from '@/lib/fedelta'
import {
  eliminaRichiesta,
  leggiRichieste,
  segnaRichiestaLetta,
  type Richiesta,
} from '@/data/archivio'

/** Come si presenta ogni tipo di richiesta. */
const TIPI = {
  preventivo: { etichetta: 'Preventivo', icona: FileText, badge: 'border-brand/30 bg-brand/10 text-brand' },
  appuntamento: { etichetta: 'Appuntamento', icona: CalendarClock, badge: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
  contatti: { etichetta: 'Messaggio', icona: MessageSquare, badge: 'border-line-soft bg-surface-2 text-ink-muted' },
} as const

const aspetto = (tipo: string) =>
  TIPI[tipo as keyof typeof TIPI] ?? { etichetta: tipo, icona: Inbox, badge: 'border-line-soft bg-surface-2 text-ink-muted' }

/**
 * I campi dei moduli arrivano già con l'etichetta mostrata al visitatore
 * («Nome», «Telefono», «Guasto»…). Nome e recapiti hanno una riga propria in
 * cima alla scheda, quindi qui non si ripetono.
 */
const RIPETUTI = /^(nome|telefono|cellulare|e-?mail)$/i

const quando = (iso: string) =>
  new Date(iso).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const soloCifre = (t: string) => t.replace(/[^\d+]/g, '')

/**
 * Le richieste che arrivano dai moduli del sito — preventivi, appuntamenti e
 * messaggi — atterrano qui oltre che nella casella e-mail. Da questa pagina si
 * apre il cliente e si passa alla lavorazione senza ricopiare niente a mano.
 */
export function Richieste() {
  useIntestazione({
    titolo: 'Richieste dal sito',
    sottotitolo: 'Preventivi, appuntamenti e messaggi ricevuti online',
  })

  const { sorgente, aggiungiCliente, db } = useGestionale()
  const [elenco, setElenco] = useState<Richiesta[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)

  const ricarica = useCallback(async () => {
    setCaricamento(true)
    setErrore(null)
    try {
      setElenco(await leggiRichieste())
    } catch (e) {
      setErrore(e instanceof Error ? e.message : 'Lettura non riuscita')
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => {
    if (sorgente === 'online') void ricarica()
    else setCaricamento(false)
  }, [sorgente, ricarica])

  async function impostaLetta(r: Richiesta, letta: boolean) {
    if (r.letta === letta) return
    setElenco((p) => p.map((v) => (v.id === r.id ? { ...v, letta } : v)))
    try {
      await segnaRichiestaLetta(r.id, letta)
    } catch {
      void ricarica()
    }
  }

  async function rimuovi(r: Richiesta) {
    if (!window.confirm('Eliminare definitivamente questa richiesta?')) return
    setElenco((p) => p.filter((v) => v.id !== r.id))
    try {
      await eliminaRichiesta(r.id)
    } catch {
      void ricarica()
    }
  }

  /** Crea la scheda cliente con i dati già ricevuti dal sito. */
  function creaCliente(r: Richiesta) {
    // Arrivato con il link di un amico: il collegamento si fa qui, così lo
    // sconto di benvenuto è già pronto nella scheda della riparazione.
    const presentatore = r.dati['Codice invito']
      ? clienteDaInvito(db.clienti, r.dati['Codice invito'])
      : undefined
    const nuovo = aggiungiCliente({
      ...(presentatore ? { invitatoDa: presentatore.id } : {}),
      nome: r.nome || 'Senza nome',
      tipo: 'privato',
      telefono: r.telefono,
      email: r.email ?? undefined,
      note: `Richiesta dal sito del ${quando(r.ricevuta_il)}.`,
    })
    // Una richiesta trasformata in cliente è di fatto già gestita.
    void impostaLetta(r, true)
    return nuovo
  }

  const clienteEsistente = (r: Richiesta) =>
    db.clienti.find(
      (c) =>
        (r.telefono && soloCifre(c.telefono) === soloCifre(r.telefono)) ||
        (!!r.email && c.email?.toLowerCase() === r.email.toLowerCase()),
    )

  if (sorgente !== 'online') {
    return (
      <Card>
        <CardHeader
          titolo="Archivio online non attivo"
          sottotitolo="Le richieste dal sito arrivano solo con l’archivio condiviso"
        />
        <p className="mt-3 text-sm text-ink-muted">
          Questo gestionale sta lavorando sull’archivio locale del browser. Le richieste inviate dal
          sito continuano ad arrivare per e-mail, ma per vederle qui serve il collegamento
          all’archivio online.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">
          {caricamento
            ? 'Carico le richieste…'
            : `${elenco.length} richieste · ${elenco.filter((r) => !r.letta).length} da leggere`}
        </p>
        <Button dimensione="sm" onClick={() => void ricarica()} disabled={caricamento}>
          {caricamento ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw className="size-4" aria-hidden="true" />
          )}
          Aggiorna
        </Button>
      </div>

      {errore && (
        <Card className="border-rose-500/30">
          <p className="text-sm text-rose-300">Non riesco a leggere le richieste: {errore}</p>
        </Card>
      )}

      {!caricamento && !elenco.length && !errore && (
        <Card>
          <p className="flex items-center gap-2 text-sm text-ink-muted">
            <Inbox className="size-4 shrink-0" aria-hidden="true" />
            Nessuna richiesta finora. Compariranno qui appena qualcuno scrive dal sito.
          </p>
        </Card>
      )}

      {elenco.map((r) => {
        const { etichetta, icona: Icona, badge } = aspetto(r.tipo)
        const cliente = clienteEsistente(r)
        return (
          <Card key={r.id} className={r.letta ? 'opacity-70' : undefined}>
            <CardHeader
              titolo={
                <span className="flex items-center gap-2">
                  <Icona className="size-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  {r.nome || 'Senza nome'}
                </span>
              }
              sottotitolo={quando(r.ricevuta_il)}
              azione={
                <div className="flex items-center gap-2">
                  <Badge className={badge}>{etichetta}</Badge>
                  {!r.letta && <Badge className="border-brand/30 bg-brand/10 text-brand">Nuova</Badge>}
                </div>
              }
            />

            <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {Object.entries(r.dati)
                .filter(([chiave, v]) => v?.trim() && !RIPETUTI.test(chiave))
                .map(([chiave, valore]) => (
                  <div key={chiave} className="min-w-0">
                    <dt className="text-xs text-ink-faint">{chiave}</dt>
                    <dd className="break-words text-ink">{valore}</dd>
                  </div>
                ))}
            </dl>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line-soft pt-4">
              {r.telefono && (
                <a
                  href={`tel:${soloCifre(r.telefono)}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-soft bg-surface-2 px-3 text-xs font-medium text-ink hover:bg-surface-3"
                >
                  <Phone className="size-3.5" aria-hidden="true" />
                  {r.telefono}
                </a>
              )}
              {r.email && (
                <a
                  href={`mailto:${r.email}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-soft bg-surface-2 px-3 text-xs font-medium text-ink hover:bg-surface-3"
                >
                  <Mail className="size-3.5" aria-hidden="true" />
                  {r.email}
                </a>
              )}

              <span className="flex-1" />

              {cliente ? (
                <Link
                  to={`/gestionale/clienti/${cliente.id}`}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line-soft bg-surface-2 px-3 text-xs font-medium text-ink hover:bg-surface-3"
                >
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  Apri scheda cliente
                </Link>
              ) : (
                <Button dimensione="sm" onClick={() => creaCliente(r)}>
                  <UserPlus className="size-3.5" aria-hidden="true" />
                  Crea cliente
                </Button>
              )}
              <Button dimensione="sm" onClick={() => void impostaLetta(r, !r.letta)}>
                {r.letta ? 'Segna da leggere' : 'Segna letta'}
              </Button>
              <Button dimensione="sm" variante="pericolo" onClick={() => void rimuovi(r)}>
                <Trash2 className="size-3.5" aria-hidden="true" />
                Elimina
              </Button>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
