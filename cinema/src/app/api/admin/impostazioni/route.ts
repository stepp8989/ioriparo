import { annota, leggi, modifica } from '@/lib/archivio'
import { colorePulito, corpoJson, numeroDecimale, numeroIntero, testoPulito } from '@/lib/protezione'
import { bloccaSeNonAutenticato } from '@/lib/sessione'
import { FORMATI, type Formato, type Impostazioni } from '@/lib/tipi'

/**
 * Impostazioni generali.
 *
 *   GET  legge la configurazione corrente
 *   PUT  la sostituisce
 *
 * È qui che si cambia il nome del marchio: quel valore arriva nell'intestazione,
 * nel piè di pagina, nei biglietti, nelle email e nei titoli delle pagine
 * perché nessun altro file lo scrive in chiaro.
 *
 * Ogni valore numerico passa da un intervallo. Non è pignoleria: una
 * commissione di servizio di mille euro o un blocco dei posti di zero minuti
 * sono errori di battitura che, salvati, fermano la vendita — e quando ci si
 * accorge del perché è passata mezza giornata.
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const archivio = await leggi()
  return Response.json(
    { impostazioni: archivio.impostazioni },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function PUT(richiesta: Request) {
  const blocco = await bloccaSeNonAutenticato()
  if (blocco) return blocco

  const corpo = await corpoJson(richiesta)

  const esito = await modifica((archivio) => {
    const attuali = archivio.impostazioni

    const marchioGrezzo = (corpo.marchio ?? {}) as Record<string, unknown>
    const socialGrezzo = (corpo.social ?? {}) as Record<string, unknown>
    const moduliGrezzi = (corpo.moduli ?? {}) as Record<string, unknown>
    const formatiGrezzi = (corpo.supplementiFormato ?? {}) as Record<string, unknown>
    const postiGrezzi = (corpo.supplementiPosto ?? {}) as Record<string, unknown>

    const supplementiFormato = { ...attuali.supplementiFormato }
    for (const formato of FORMATI) {
      if (formato in formatiGrezzi) {
        supplementiFormato[formato as Formato] = numeroDecimale(
          formatiGrezzi[formato],
          0,
          50,
          supplementiFormato[formato as Formato],
        )
      }
    }

    const supplementiPosto = { ...attuali.supplementiPosto }
    for (const tipo of ['standard', 'premium', 'disabili', 'accompagnatore'] as const) {
      if (tipo in postiGrezzi) {
        supplementiPosto[tipo] = numeroDecimale(postiGrezzi[tipo], 0, 50, supplementiPosto[tipo])
      }
    }

    const prossime: Impostazioni = {
      marchio: {
        nome: testoPulito(marchioGrezzo.nome, 40) || attuali.marchio.nome,
        claim: testoPulito(marchioGrezzo.claim, 120) || attuali.marchio.claim,
        descrizione: testoPulito(marchioGrezzo.descrizione, 400) || attuali.marchio.descrizione,
        dominio: testoPulito(marchioGrezzo.dominio, 200) || attuali.marchio.dominio,
        email: testoPulito(marchioGrezzo.email, 160).toLowerCase() || attuali.marchio.email,
        telefono: testoPulito(marchioGrezzo.telefono, 30) || attuali.marchio.telefono,
        colore: colorePulito(marchioGrezzo.colore, attuali.marchio.colore),
        coloreAlt: colorePulito(marchioGrezzo.coloreAlt, attuali.marchio.coloreAlt),
      },
      social: {
        instagram: testoPulito(socialGrezzo.instagram, 200),
        facebook: testoPulito(socialGrezzo.facebook, 200),
        tiktok: testoPulito(socialGrezzo.tiktok, 200),
        youtube: testoPulito(socialGrezzo.youtube, 200),
      },
      commissioneServizio: numeroDecimale(corpo.commissioneServizio, 0, 20, attuali.commissioneServizio),
      commissionePerBiglietto: numeroDecimale(
        corpo.commissionePerBiglietto,
        0,
        20,
        attuali.commissionePerBiglietto,
      ),
      // Sotto i tre minuti nessuno completa un pagamento; sopra l'ora i posti
      // restano bloccati da carrelli abbandonati per tutta la serata.
      minutiBloccoPosti: numeroIntero(corpo.minutiBloccoPosti, 3, 60, attuali.minutiBloccoPosti),
      chiusuraVenditaMinuti: numeroIntero(
        corpo.chiusuraVenditaMinuti,
        0,
        240,
        attuali.chiusuraVenditaMinuti,
      ),
      postiMassimiPerOrdine: numeroIntero(corpo.postiMassimiPerOrdine, 1, 50, attuali.postiMassimiPerOrdine),
      puntiPerEuro: numeroDecimale(corpo.puntiPerEuro, 0, 1000, attuali.puntiPerEuro),
      valorePunto: numeroDecimale(corpo.valorePunto, 0, 10, attuali.valorePunto),
      supplementiFormato,
      supplementiPosto,
      moduli: {
        loyalty: moduliGrezzi.loyalty !== false,
        abbonamenti: moduliGrezzi.abbonamenti !== false,
        food: moduliGrezzi.food !== false,
        giftCard: moduliGrezzi.giftCard !== false,
        registrazione: moduliGrezzi.registrazione !== false,
      },
    }

    archivio.impostazioni = prossime
    annota(archivio, 'gestione', 'impostazioni-aggiornate', prossime.marchio.nome)

    return { impostazioni: prossime }
  })

  return Response.json(esito)
}
