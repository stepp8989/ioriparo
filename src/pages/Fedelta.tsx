import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Gift, MessageCircle, Settings, Star, UserPlus, Users } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { LinkButton } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Tabella, TabellaHead, Td, Th, Tr, StatoVuoto } from '@/components/ui/Tabella'
import { useIntestazione } from '@/components/layout/intestazione'
import { useGestionale } from '@/data/store'
import {
  amiciPortati,
  calcolaTessera,
  codiceInvito,
  messaggioTessera,
  movimentiCliente,
  regoleFedelta,
  whatsappCliente,
} from '@/lib/fedelta'
import { formatEuro, formatNumero } from '@/lib/format'

/**
 * Il programma fedeltà visto dal laboratorio.
 *
 * La tabella che conta è la prima: clienti con un buono pronto e nessuna
 * riparazione aperta. Sono soldi già promessi che aspettano solo un motivo
 * per tornare — un messaggio su WhatsApp glielo dà.
 */
export function Fedelta() {
  useIntestazione({
    titolo: 'Fedeltà e Porta un amico',
    sottotitolo: 'Punti, buoni e clienti arrivati con un invito',
  })
  const { db } = useGestionale()
  const navigate = useNavigate()
  const regole = regoleFedelta(db.azienda.fedelta)

  const dati = useMemo(() => {
    const schede = db.clienti.map((cliente) => ({
      cliente,
      tessera: calcolaTessera(movimentiCliente(db, cliente.id), regole),
      amici: amiciPortati(db, cliente.id),
      aperta: db.riparazioni.some(
        (r) =>
          r.clienteId === cliente.id && r.stato !== 'consegnato' && r.stato !== 'non_riparabile',
      ),
    }))

    let buoniUsati = 0
    let valoreBuoni = 0
    let scontiAmico = 0
    let valoreSconti = 0
    for (const r of db.riparazioni) {
      for (const riga of r.interventi) {
        if (riga.puntiUsati) {
          buoniUsati += 1
          valoreBuoni += -riga.prezzoUnitario * riga.quantita
        }
        if (riga.scontoAmico) {
          scontiAmico += 1
          valoreSconti += -riga.prezzoUnitario * riga.quantita
        }
      }
    }

    return {
      daRichiamare: schede
        .filter((s) => s.tessera.buoni > 0 && !s.aperta)
        .sort((a, b) => b.tessera.punti - a.tessera.punti),
      presentatori: schede
        .filter((s) => s.amici.length > 0)
        .sort((a, b) => b.amici.length - a.amici.length)
        .slice(0, 10),
      invitati: db.clienti.filter((c) => c.invitatoDa).length,
      puntiInCircolo: schede.reduce((n, s) => n + s.tessera.punti, 0),
      buoniUsati,
      valoreBuoni,
      scontiAmico,
      valoreSconti,
    }
  }, [db, regole])

  return (
    <div className="space-y-4">
      {!regole.attivo && (
        <Card>
          <p className="text-sm text-ink-muted">
            Il programma è sospeso: sul sito la tessera non mostra i punti e i buoni non si possono usare.{' '}
            <Link to="/gestionale/impostazioni" className="font-medium text-blue-400 hover:text-blue-300">
              Riattivalo dalle Impostazioni
            </Link>
            .
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard etichetta="Buoni pronti da usare" valore={dati.daRichiamare.reduce((n, s) => n + s.tessera.buoni, 0)} icona={Gift} tono="verde" />
        <StatCard etichetta="Clienti portati da amici" valore={dati.invitati} icona={UserPlus} tono="viola" />
        <StatCard
          etichetta="Buoni riscattati"
          valore={`${dati.buoniUsati} · ${formatEuro(dati.valoreBuoni)}`}
          icona={Star}
          tono="ambra"
        />
        <StatCard
          etichetta="Sconti di benvenuto"
          valore={`${dati.scontiAmico} · ${formatEuro(dati.valoreSconti)}`}
          icona={Users}
          tono="ciano"
        />
      </div>

      <Card padding={false}>
        <div className="p-5 pb-3">
          <CardHeader
            titolo="Clienti da richiamare"
            sottotitolo="Hanno un buono pronto e nessuna riparazione in corso: un messaggio li riporta in negozio"
            azione={
              <LinkButton to="/gestionale/impostazioni" dimensione="sm" variante="fantasma">
                <Settings size={14} />
                Regole
              </LinkButton>
            }
          />
        </div>
        {dati.daRichiamare.length === 0 ? (
          <StatoVuoto
            titolo="Nessun buono in attesa"
            descrizione={`I clienti ricevono un buono da ${formatEuro(regole.valorePremio)} ogni ${formatNumero(regole.puntiPremio)} punti.`}
          />
        ) : (
          <Tabella className="min-w-[620px]">
            <TabellaHead>
              <Th>Cliente</Th>
              <Th allineamento="right">Punti</Th>
              <Th allineamento="right">Buoni</Th>
              <Th>Codice invito</Th>
              <Th allineamento="right">
                <span className="sr-only">Azioni</span>
              </Th>
            </TabellaHead>
            <tbody>
              {dati.daRichiamare.map(({ cliente, tessera }) => (
                <Tr key={cliente.id} onClick={() => navigate(`/gestionale/clienti/${cliente.id}`)}>
                  <Td className="text-[13px] text-ink">{cliente.nome}</Td>
                  <Td allineamento="right" className="tabular-nums">{formatNumero(tessera.punti)}</Td>
                  <Td allineamento="right" className="font-semibold text-emerald-400">
                    {formatEuro(tessera.buoni * regole.valorePremio)}
                  </Td>
                  <Td className="font-mono text-xs">{codiceInvito(cliente.id)}</Td>
                  <Td allineamento="right">
                    <a
                      href={whatsappCliente(
                        cliente.telefono,
                        messaggioTessera(cliente, tessera, regole, db.azienda.nome),
                      )}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/12 px-3 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20"
                    >
                      <MessageCircle size={13} />
                      WhatsApp
                    </a>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Tabella>
        )}
      </Card>

      <Card padding={false}>
        <div className="p-5 pb-3">
          <CardHeader
            titolo="Chi porta più clienti"
            sottotitolo={`${formatNumero(dati.puntiInCircolo)} punti in circolazione in tutto`}
          />
        </div>
        {dati.presentatori.length === 0 ? (
          <StatoVuoto
            titolo="Ancora nessun invito"
            descrizione="Quando un cliente nuovo arriva con un codice, collegalo dalla sua scheda: il presentatore riceve i punti al ritiro."
          />
        ) : (
          <Tabella className="min-w-[520px]">
            <TabellaHead>
              <Th>Cliente</Th>
              <Th allineamento="right">Amici portati</Th>
              <Th allineamento="right">Hanno già ritirato</Th>
            </TabellaHead>
            <tbody>
              {dati.presentatori.map(({ cliente, amici }) => (
                <Tr key={cliente.id} onClick={() => navigate(`/gestionale/clienti/${cliente.id}`)}>
                  <Td className="text-[13px] text-ink">{cliente.nome}</Td>
                  <Td allineamento="right">{amici.length}</Td>
                  <Td allineamento="right">{amici.filter((a) => a.valido).length}</Td>
                </Tr>
              ))}
            </tbody>
          </Tabella>
        )}
      </Card>
    </div>
  )
}
