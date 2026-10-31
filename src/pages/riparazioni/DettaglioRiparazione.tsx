import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  MessageCircle,
  Pencil,
  Plus,
  Printer,
  Trash2,
  User,
} from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Badge, BadgeStato } from '@/components/ui/Badge'
import { Button, IconButton } from '@/components/ui/Button'
import { Campo, Input, Select } from '@/components/ui/Form'
import { DeviceIcon } from '@/components/ui/DeviceIcon'
import { Modal } from '@/components/ui/Modal'
import { Tabella, TabellaHead, Td, Th, Tr } from '@/components/ui/Tabella'
import { AnteprimaStampa } from '@/components/stampa/AnteprimaStampa'
import { DocumentoScheda } from '@/components/stampa/DocumentoScheda'
import { useIntestazione } from '@/components/layout/intestazione'
import { FedeltaRiparazione, OmaggioRiparazione } from '@/components/fedelta/TesseraCliente'
import { useGestionale, nuovoId } from '@/data/store'
import { imponibile, saldoRiparazione, scorporoIva, totaleRiparazione } from '@/lib/calcoli'
import { formatData, formatEuro, oggiISO } from '@/lib/format'
import { ORDINE_STATI, STATI_RIPARAZIONE, TIPI_DISPOSITIVO } from '@/lib/stati'
import type { StatoRiparazione } from '@/types'

export function DettaglioRiparazione() {
  const { id = '' } = useParams()
  const { db, aggiornaRiparazione, eliminaRiparazione, clientePerId } = useGestionale()
  const navigate = useNavigate()
  const [parametri, setParametri] = useSearchParams()

  const riparazione = db.riparazioni.find((r) => r.id === id)

  const [aggiuntaAperta, setAggiuntaAperta] = useState(false)
  const [nuovaRiga, setNuovaRiga] = useState({ descrizione: '', quantita: '1', prezzo: '', articoloId: '' })
  const [confermaEliminazione, setConfermaEliminazione] = useState(false)
  const [anteprimaAperta, setAnteprimaAperta] = useState(false)

  useIntestazione({
    titolo: riparazione ? `${riparazione.marca} ${riparazione.modello}` : 'Riparazione non trovata',
    briciole: [
      { label: 'Home', to: '/' },
      { label: 'Dispositivi', to: '/gestionale/riparazioni' },
      { label: riparazione?.codice ?? '—' },
    ],
  })

  // «Salva e Stampa» arriva qui con ?stampa=1 e apre subito l'anteprima.
  const stampaRichiesta = parametri.get('stampa') === '1'
  useEffect(() => {
    if (!stampaRichiesta || !riparazione) return
    setAnteprimaAperta(true)
    setParametri({}, { replace: true })
  }, [stampaRichiesta, riparazione, setParametri])

  if (!riparazione) return <Navigate to="/gestionale/riparazioni" replace />

  const cliente = clientePerId(riparazione.clienteId)
  const totale = totaleRiparazione(riparazione)
  const iva = db.azienda.ivaPredefinita

  function cambiaStato(stato: StatoRiparazione) {
    if (!riparazione) return
    aggiornaRiparazione(riparazione.id, {
      stato,
      dataConsegna: stato === 'consegnato' ? (riparazione.dataConsegna ?? oggiISO()) : undefined,
    })
  }

  function aggiungiIntervento() {
    if (!riparazione) return
    const prezzo = Number.parseFloat(nuovaRiga.prezzo.replace(',', '.'))
    const quantita = Number.parseInt(nuovaRiga.quantita, 10)
    if (!nuovaRiga.descrizione.trim() || !Number.isFinite(prezzo)) return

    aggiornaRiparazione(riparazione.id, {
      interventi: [
        ...riparazione.interventi,
        {
          id: nuovoId('int'),
          descrizione: nuovaRiga.descrizione.trim(),
          quantita: Number.isFinite(quantita) && quantita > 0 ? quantita : 1,
          prezzoUnitario: prezzo,
          articoloId: nuovaRiga.articoloId || undefined,
        },
      ],
    })
    setNuovaRiga({ descrizione: '', quantita: '1', prezzo: '', articoloId: '' })
    setAggiuntaAperta(false)
  }

  function rimuoviIntervento(idRiga: string) {
    if (!riparazione) return
    aggiornaRiparazione(riparazione.id, {
      interventi: riparazione.interventi.filter((riga) => riga.id !== idRiga),
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Button onClick={() => navigate('/gestionale/riparazioni')}>
          <ArrowLeft size={15} />
          Torna all'elenco
        </Button>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setAnteprimaAperta(true)}>
            <Printer size={15} />
            Stampa scheda
          </Button>
          <Button variante="pericolo" onClick={() => setConfermaEliminazione(true)}>
            <Trash2 size={15} />
            Elimina
          </Button>
          <Button variante="primario" onClick={() => navigate(`/gestionale/riparazioni/${riparazione.id}/modifica`)}>
            <Pencil size={15} />
            Modifica
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          {/* Intestazione della scheda */}
          <Card>
            <div className="flex flex-wrap items-start gap-4">
              <DeviceIcon tipo={riparazione.tipoDispositivo} dimensione="lg" />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-ink">
                    {riparazione.marca} {riparazione.modello}
                  </h2>
                  <BadgeStato stato={riparazione.stato} />
                </div>
                <p className="mt-1 text-xs text-ink-faint">
                  {riparazione.codice} · {TIPI_DISPOSITIVO[riparazione.tipoDispositivo]}
                  {riparazione.capacita ? ` · ${riparazione.capacita}` : ''}
                  {riparazione.colore ? ` · ${riparazione.colore}` : ''}
                </p>
                {riparazione.imei && (
                  <p className="mt-0.5 font-mono text-xs text-ink-muted">IMEI / SN: {riparazione.imei}</p>
                )}
              </div>

              <div className="print:hidden">
                <Campo etichetta="Stato lavorazione">
                  <Select
                    value={riparazione.stato}
                    onChange={(e) => cambiaStato(e.target.value as StatoRiparazione)}
                    className="w-52"
                  >
                    {ORDINE_STATI.map((stato) => (
                      <option key={stato} value={stato}>
                        {STATI_RIPARAZIONE[stato].label}
                      </option>
                    ))}
                  </Select>
                </Campo>
              </div>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-4">
              <div>
                <dt className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Accettazione
                </dt>
                <dd className="mt-1 text-sm text-ink">{formatData(riparazione.dataAccettazione)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Consegna prevista
                </dt>
                <dd className="mt-1 text-sm text-ink">{formatData(riparazione.consegnaPrevista)}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Tecnico
                </dt>
                <dd className="mt-1 text-sm text-ink">{riparazione.tecnico ?? '--'}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Consegnato il
                </dt>
                <dd className="mt-1 text-sm text-ink">{formatData(riparazione.dataConsegna)}</dd>
              </div>
            </dl>
          </Card>

          {/* Difetto e condizioni */}
          <Card>
            <CardHeader titolo="Difetto segnalato" />
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              {riparazione.difettoSegnalato}
            </p>

            <div className="mt-4 grid grid-cols-1 gap-4 border-t border-line pt-4 sm:grid-cols-2">
              {/* Prima di tutto il resto: dice se l'apparecchio e' qui o no,
                  cioe' se c'e' qualcosa da cercare sullo scaffale. */}
              <div>
                <p className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Dov’è il dispositivo
                </p>
                <p
                  className={
                    (riparazione.custodia ?? 'negozio') === 'negozio'
                      ? 'mt-1 text-sm text-emerald-300'
                      : 'mt-1 text-sm text-amber-300'
                  }
                >
                  {(riparazione.custodia ?? 'negozio') === 'negozio'
                    ? 'Lasciato in negozio'
                    : 'Il cliente lo tiene'}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Condizioni esterne
                </p>
                <p className="mt-1 text-sm text-ink capitalize">
                  {riparazione.condizioniEsterne ?? '--'}
                </p>
                {riparazione.noteCondizioni && (
                  <p className="mt-1 text-xs text-ink-faint">{riparazione.noteCondizioni}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-wider text-ink-faint uppercase">
                  Accessori consegnati
                </p>
                <p className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    riparazione.accessori.scatola && 'Scatola',
                    riparazione.accessori.cover && 'Cover',
                    riparazione.accessori.caricabatterie && 'Caricabatterie',
                    riparazione.accessori.cavoUsb && 'Cavo USB',
                    riparazione.accessori.altro,
                  ]
                    .filter(Boolean)
                    .map((accessorio) => (
                      <Badge
                        key={String(accessorio)}
                        className="border-line-soft bg-surface-2 text-ink-muted"
                      >
                        {accessorio}
                      </Badge>
                    ))}
                  {!riparazione.accessori.scatola &&
                    !riparazione.accessori.cover &&
                    !riparazione.accessori.caricabatterie &&
                    !riparazione.accessori.cavoUsb &&
                    !riparazione.accessori.altro && (
                      <span className="text-sm text-ink-faint">Nessun accessorio</span>
                    )}
                </p>
              </div>
            </div>

            {riparazione.noteInterne && (
              <div className="mt-4 rounded-lg border border-amber-500/25 bg-amber-500/8 p-3 print:hidden">
                <p className="text-[10px] font-bold tracking-wider text-amber-300 uppercase">
                  Note interne
                </p>
                <p className="mt-1 text-xs text-ink-muted">{riparazione.noteInterne}</p>
              </div>
            )}
          </Card>

          {/* Interventi e importi */}
          <Card padding={false}>
            <div className="flex items-center justify-between gap-3 p-5 pb-3">
              <CardHeader titolo="Interventi e ricambi" className="flex-1" />
              <Button
                dimensione="sm"
                variante="primario"
                onClick={() => setAggiuntaAperta(true)}
                className="print:hidden"
              >
                <Plus size={14} />
                Aggiungi voce
              </Button>
            </div>

            {riparazione.interventi.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-ink-faint">
                Nessun intervento registrato. Aggiungi le voci per calcolare il totale da fatturare.
              </p>
            ) : (
              <Tabella className="min-w-[560px]">
                <TabellaHead>
                  <Th>Descrizione</Th>
                  <Th allineamento="center">Q.tà</Th>
                  <Th allineamento="right">Prezzo</Th>
                  <Th allineamento="right">Totale</Th>
                  <Th allineamento="right" className="print:hidden">
                    <span className="sr-only">Azioni</span>
                  </Th>
                </TabellaHead>
                <tbody>
                  {riparazione.interventi.map((riga) => (
                    <Tr key={riga.id}>
                      <Td className="text-[13px] text-ink">{riga.descrizione}</Td>
                      <Td allineamento="center">{riga.quantita}</Td>
                      <Td allineamento="right">{formatEuro(riga.prezzoUnitario)}</Td>
                      <Td allineamento="right" className="font-semibold text-ink">
                        {formatEuro(riga.quantita * riga.prezzoUnitario)}
                      </Td>
                      <Td allineamento="right" className="print:hidden">
                        <IconButton
                          etichetta="Rimuovi voce"
                          onClick={() => rimuoviIntervento(riga.id)}
                        >
                          <Trash2 size={14} />
                        </IconButton>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Tabella>
            )}

            <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
              <div className="flex justify-between text-ink-muted">
                <dt>Imponibile</dt>
                <dd>{formatEuro(imponibile(totale, iva))}</dd>
              </div>
              <div className="flex justify-between text-ink-muted">
                <dt>IVA {iva}%</dt>
                <dd>{formatEuro(scorporoIva(totale, iva))}</dd>
              </div>
              <div className="flex justify-between border-t border-line pt-1.5 text-base font-bold text-ink">
                <dt>Totale</dt>
                <dd>{formatEuro(totale)}</dd>
              </div>
              {riparazione.acconto ? (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <dt>Acconto versato</dt>
                    <dd>− {formatEuro(riparazione.acconto)}</dd>
                  </div>
                  <div className="flex justify-between font-semibold text-ink">
                    <dt>Saldo al ritiro</dt>
                    <dd>{formatEuro(saldoRiparazione(riparazione))}</dd>
                  </div>
                </>
              ) : null}
            </dl>
          </Card>
        </div>

        {/* Colonna laterale */}
        <div className="space-y-4">
          <Card>
            <CardHeader titolo="Cliente" />
            {cliente ? (
              <div className="mt-3">
                <Link
                  to={`/gestionale/clienti/${cliente.id}`}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
                >
                  <span className="flex size-10 items-center justify-center rounded-full bg-surface-3 text-ink-muted">
                    <User size={19} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {cliente.nome}
                    </span>
                    <span className="block text-xs text-ink-faint capitalize">{cliente.tipo}</span>
                  </span>
                </Link>

                <dl className="mt-3 space-y-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-faint">Telefono</dt>
                    <dd className="text-ink">{cliente.telefono}</dd>
                  </div>
                  {cliente.email && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-faint">Email</dt>
                      <dd className="truncate text-ink">{cliente.email}</dd>
                    </div>
                  )}
                  {cliente.citta && (
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-faint">Città</dt>
                      <dd className="text-ink">
                        {cliente.cap} {cliente.citta}
                      </dd>
                    </div>
                  )}
                </dl>

                <a
                  href={`https://wa.me/39${cliente.telefono.replace(/\D/g, '')}?text=${encodeURIComponent(
                    `Salve ${cliente.nome}, la contattiamo da ${db.azienda.nome} in merito alla riparazione ${riparazione.codice} (${riparazione.marca} ${riparazione.modello}).`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/12 text-sm font-medium text-emerald-300 transition-colors hover:bg-emerald-500/20 print:hidden"
                >
                  <MessageCircle size={16} />
                  Avvisa su WhatsApp
                </a>
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-faint">Cliente non disponibile.</p>
            )}
          </Card>

          <OmaggioRiparazione riparazione={riparazione} />
          <FedeltaRiparazione riparazione={riparazione} />

          {riparazione.foto && riparazione.foto.length > 0 && (
            <Card>
              <CardHeader titolo="Foto dispositivo" />
              <div className="mt-3 grid grid-cols-3 gap-2">
                {riparazione.foto.map((foto, indice) => (
                  <img
                    key={indice}
                    src={foto}
                    alt={`Foto dispositivo ${indice + 1}`}
                    className="aspect-3/4 w-full rounded-lg border border-line-soft object-cover"
                  />
                ))}
              </div>
            </Card>
          )}

          {riparazione.passwordBlocco && (
            <Card className="print:hidden">
              <CardHeader titolo="Password / Blocco" />
              <p className="mt-2 font-mono text-sm text-ink">{riparazione.passwordBlocco}</p>
            </Card>
          )}

          {riparazione.firmaCliente && (
            <Card>
              <CardHeader titolo="Firma cliente" />
              <img
                src={riparazione.firmaCliente}
                alt="Firma del cliente"
                className="mt-3 w-full rounded-lg border border-line-soft bg-surface-2 p-2"
              />
            </Card>
          )}
        </div>
      </div>

      <Modal
        aperta={aggiuntaAperta}
        titolo="Aggiungi intervento o ricambio"
        onChiudi={() => setAggiuntaAperta(false)}
        larghezza="sm"
        piede={
          <>
            <Button onClick={() => setAggiuntaAperta(false)}>Annulla</Button>
            <Button variante="primario" onClick={aggiungiIntervento}>
              Aggiungi
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Campo etichetta="Ricambio da magazzino">
            <Select
              value={nuovaRiga.articoloId}
              onChange={(e) => {
                const articolo = db.magazzino.find((a) => a.id === e.target.value)
                setNuovaRiga((precedente) => ({
                  ...precedente,
                  articoloId: e.target.value,
                  descrizione: articolo?.nome ?? precedente.descrizione,
                  prezzo: articolo ? String(articolo.prezzoVendita) : precedente.prezzo,
                }))
              }}
            >
              <option value="">Solo manodopera / voce libera</option>
              {db.magazzino.map((articolo) => (
                <option key={articolo.id} value={articolo.id}>
                  {articolo.nome} — {formatEuro(articolo.prezzoVendita)}
                </option>
              ))}
            </Select>
          </Campo>

          <Campo etichetta="Descrizione" obbligatorio>
            <Input
              value={nuovaRiga.descrizione}
              onChange={(e) =>
                setNuovaRiga((precedente) => ({ ...precedente, descrizione: e.target.value }))
              }
              placeholder="Sostituzione display"
            />
          </Campo>

          <div className="grid grid-cols-2 gap-3">
            <Campo etichetta="Quantità">
              <Input
                type="number"
                min={1}
                value={nuovaRiga.quantita}
                onChange={(e) =>
                  setNuovaRiga((precedente) => ({ ...precedente, quantita: e.target.value }))
                }
              />
            </Campo>
            <Campo etichetta="Prezzo (€)" obbligatorio>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={nuovaRiga.prezzo}
                onChange={(e) =>
                  setNuovaRiga((precedente) => ({ ...precedente, prezzo: e.target.value }))
                }
                placeholder="0,00"
              />
            </Campo>
          </div>
        </div>
      </Modal>

      <Modal
        aperta={confermaEliminazione}
        titolo="Eliminare la riparazione?"
        sottotitolo={`${riparazione.codice} · ${riparazione.marca} ${riparazione.modello}`}
        onChiudi={() => setConfermaEliminazione(false)}
        larghezza="sm"
        piede={
          <>
            <Button onClick={() => setConfermaEliminazione(false)}>Annulla</Button>
            <Button
              variante="pericolo"
              onClick={() => {
                eliminaRiparazione(riparazione.id)
                navigate('/gestionale/riparazioni')
              }}
            >
              <Trash2 size={15} />
              Elimina definitivamente
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-muted">
          L'operazione rimuove la scheda dall'archivio e non può essere annullata.
        </p>
      </Modal>

      <AnteprimaStampa
        aperta={anteprimaAperta}
        titolo={`Scheda di accettazione ${riparazione.codice}`}
        nomeFile={`scheda-${riparazione.codice.replace(/[^\w-]/g, '')}.html`}
        documento={
          <DocumentoScheda azienda={db.azienda} cliente={cliente} riparazione={riparazione} />
        }
        onChiudi={() => setAnteprimaAperta(false)}
      />
    </div>
  )
}
