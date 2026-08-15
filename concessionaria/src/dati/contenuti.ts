import type { NomeIcona } from '@/componenti/ui/Icona'
import type { Articolo, Offerta, OrarioGiorno, Recensione } from '@/lib/tipi'

/**
 * Contenuti di partenza dell'archivio e testi fissi delle pagine.
 *
 * Recensioni, orari e offerte finiscono nell'archivio al primo avvio e da lì
 * in poi si modificano dal pannello. Storia, valori, squadra e domande
 * frequenti restano invece qui: cambiano una volta ogni tanto e non serve un
 * pannello per gestirli.
 */

/* ── Orari di apertura ───────────────────────────────────────────────────── */

export const ORARI_INIZIALI: OrarioGiorno[] = [
  { giorno: 'Lunedì', chiuso: false, mattina: '08:30 – 13:00', pomeriggio: '15:30 – 19:30' },
  { giorno: 'Martedì', chiuso: false, mattina: '08:30 – 13:00', pomeriggio: '15:30 – 19:30' },
  { giorno: 'Mercoledì', chiuso: false, mattina: '08:30 – 13:00', pomeriggio: '15:30 – 19:30' },
  { giorno: 'Giovedì', chiuso: false, mattina: '08:30 – 13:00', pomeriggio: '15:30 – 19:30' },
  { giorno: 'Venerdì', chiuso: false, mattina: '08:30 – 13:00', pomeriggio: '15:30 – 19:30' },
  { giorno: 'Sabato', chiuso: false, mattina: '09:00 – 13:00', pomeriggio: null },
  { giorno: 'Domenica', chiuso: true, mattina: null, pomeriggio: null },
]

/* ── Recensioni ──────────────────────────────────────────────────────────── */

export const RECENSIONI_INIZIALI: Recensione[] = [
  {
    id: 'rec-001',
    autore: 'Marco Piras',
    testo:
      'Ho comprato una A4 Avant usata e mi hanno mostrato tutti i tagliandi prima ancora che li chiedessi. ' +
      'Alla consegna la vettura era lucidata come una nuova. Zero sorprese, prezzo onesto.',
    voto: 5,
    data: '2026-05-18',
    fonte: 'google',
    servizio: 'vendita',
    pubblicata: true,
  },
  {
    id: 'rec-002',
    autore: 'Giulia Melis',
    testo:
      'Noleggiata una Panda per due settimane ad agosto, consegnata direttamente in hotel a Cala Gonone. ' +
      'Auto pulitissima, pieno fatto, nessun costo nascosto alla riconsegna.',
    voto: 5,
    data: '2026-08-02',
    fonte: 'google',
    servizio: 'noleggio',
    pubblicata: true,
  },
  {
    id: 'rec-003',
    autore: 'Andrea Corda',
    testo:
      'Trattamento ceramico sulla mia Golf nera. Avevano detto due giorni e in due giorni me l’hanno ' +
      'riconsegnata. Il risultato è impressionante, l’acqua scivola via da sola.',
    voto: 5,
    data: '2026-04-27',
    fonte: 'google',
    servizio: 'detailing',
    pubblicata: true,
  },
  {
    id: 'rec-004',
    autore: 'Francesca Loi',
    testo:
      'Mi hanno seguito nel finanziamento confrontando tre banche diverse e scegliendo la rata più bassa. ' +
      'Pratica chiusa in due giorni, spiegata voce per voce.',
    voto: 5,
    data: '2026-03-14',
    fonte: 'facebook',
    servizio: 'vendita',
    pubblicata: true,
  },
  {
    id: 'rec-005',
    autore: 'Stefano Deiana',
    testo:
      'Ho portato la moto per il tagliando e la sanificazione della sella. Lavoro fatto bene e in tempi ' +
      'rapidi. Unica nota: in alta stagione conviene prenotare con anticipo.',
    voto: 4,
    data: '2026-07-09',
    fonte: 'google',
    servizio: 'assistenza',
    pubblicata: true,
  },
  {
    id: 'rec-006',
    autore: 'Roberta Sanna',
    testo:
      'Permuta della mia vecchia utilitaria valutata più di quanto mi avessero offerto altrove. Passaggio ' +
      'di proprietà gestito da loro, io ho solo firmato.',
    voto: 5,
    data: '2026-06-21',
    fonte: 'google',
    servizio: 'vendita',
    pubblicata: true,
  },
  {
    id: 'rec-007',
    autore: 'Luca Mereu',
    testo:
      'Ripristino fari su una macchina di dieci anni: sembravano da sostituire, invece sono tornati ' +
      'trasparenti. Spesi ottanta euro invece di seicento.',
    voto: 5,
    data: '2026-02-11',
    fonte: 'google',
    servizio: 'detailing',
    pubblicata: true,
  },
  {
    id: 'rec-008',
    autore: 'Antonio Serra',
    testo:
      'Noleggio di una maxi enduro per un giro di quattro giorni nell’entroterra. Moto perfetta, caschi e ' +
      'bauletti compresi, hanno anche suggerito l’itinerario.',
    voto: 5,
    data: '2026-05-30',
    fonte: 'diretta',
    servizio: 'noleggio',
    pubblicata: true,
  },
]

/* ── Offerte ─────────────────────────────────────────────────────────────── */

export const OFFERTE_INIZIALI: Offerta[] = [
  {
    id: 'off-001',
    titolo: 'Ceramica in omaggio',
    sottotitolo: 'Su ogni usato garantito oltre i 20.000 €',
    descrizione:
      'Chi acquista un veicolo usato garantito sopra i ventimila euro riceve il trattamento nanoceramico ' +
      'completo, del valore di 690 €, incluso nel prezzo. La vettura viene consegnata già trattata.',
    veicoloId: null,
    etichetta: 'Vendita',
    scadenza: '2026-12-31',
    immagine: '/immagini/offerte/ceramica-omaggio.jpg',
    attiva: true,
  },
  {
    id: 'off-002',
    titolo: 'Noleggio lungo termine',
    sottotitolo: 'Terzo mese scontato del 50%',
    descrizione:
      'Sui noleggi mensili di durata pari o superiore a tre mesi, il terzo mese costa la metà. Vale su ' +
      'tutta la flotta auto, assicurazione e manutenzione sempre incluse.',
    veicoloId: null,
    etichetta: 'Noleggio',
    scadenza: '2026-11-30',
    immagine: '/immagini/offerte/noleggio-lungo.jpg',
    attiva: true,
  },
  {
    id: 'off-003',
    titolo: 'Tasso agevolato 3,95%',
    sottotitolo: 'Su tutte le vetture nuove e km 0',
    descrizione:
      'Finanziamento a TAN fisso 3,95% su nuovo e chilometri zero, con anticipo minimo del venti per ' +
      'cento e durata fino a settantadue mesi. Preventivo firmato in ventiquattro ore.',
    veicoloId: null,
    etichetta: 'Finanziamento',
    scadenza: '2026-10-31',
    immagine: '/immagini/offerte/tasso-agevolato.jpg',
    attiva: true,
  },
]

/* ── Chi siamo ───────────────────────────────────────────────────────────── */

export const STORIA = [
  {
    anno: '1997',
    titolo: 'Un’officina in due',
    testo:
      'Aurora nasce come officina meccanica in un capannone di duecento metri quadri alla periferia di ' +
      'Tortolì. Due soci, una fossa e un compressore preso a rate.',
  },
  {
    anno: '2004',
    titolo: 'Il primo salone',
    testo:
      'All’officina si affianca la vendita di vetture usate garantite. La regola di allora è quella di ' +
      'oggi: nessun veicolo entra in salone senza essere passato prima dal ponte.',
  },
  {
    anno: '2012',
    titolo: 'Nasce il noleggio',
    testo:
      'Dieci vetture per i clienti in attesa di riparazione diventano un servizio a sé, poi il primo ' +
      'contratto con una struttura ricettiva della costa.',
  },
  {
    anno: '2019',
    titolo: 'Il reparto detailing',
    testo:
      'Apre la cabina dedicata alla cura estetica, con illuminazione a temperatura controllata. Da lì ' +
      'passa ogni veicolo prima della consegna, venduto o noleggiato che sia.',
  },
  {
    anno: '2026',
    titolo: 'Sessanta veicoli in flotta',
    testo:
      'Oggi Aurora Motori occupa duemila metri quadri fra salone, officina e reparto estetico, con ' +
      'quattordici persone e una flotta a noleggio di sessanta mezzi fra auto e moto.',
  },
]

export type Valore = {
  titolo: string
  testo: string
  icona: NomeIcona
}

export const VALORI: Valore[] = [
  {
    titolo: 'Trasparenza',
    testo:
      'Ogni veicolo usato viene consegnato con il fascicolo completo: controllo in centoventi punti, ' +
      'storia manutentiva e certificazione del chilometraggio. Quello che sappiamo noi lo sapete anche voi.',
    icona: 'verifica',
  },
  {
    titolo: 'Competenza',
    testo:
      'Officina, carrozzeria e reparto estetico sono interni. Chi vi vende il veicolo può chiedere a chi ' +
      'ci ha messo le mani, e la risposta arriva nello stesso pomeriggio.',
    icona: 'chiaveInglese',
  },
  {
    titolo: 'Cura',
    testo:
      'Nessun mezzo lascia il piazzale senza essere passato dal detailing. È il modo più semplice per ' +
      'dire a chi compra che il veicolo è stato trattato bene anche prima.',
    icona: 'brillante',
  },
  {
    titolo: 'Continuità',
    testo:
      'Il rapporto comincia con la consegna, non finisce lì: tagliandi, gomme, revisioni e assistenza ' +
      'restano qui, con lo storico di ogni intervento sempre disponibile nell’area clienti.',
    icona: 'cuore',
  },
]

export type PersonaStaff = {
  nome: string
  ruolo: string
  descrizione: string
  immagine: string
}

export const SQUADRA: PersonaStaff[] = [
  {
    nome: 'Luca Aurora',
    ruolo: 'Fondatore e responsabile vendite',
    descrizione:
      'Ha aperto l’officina nel 1997 con il fratello. Segue personalmente le valutazioni di permuta e le ' +
      'trattative sui veicoli sportivi.',
    immagine: '/immagini/squadra/luca.jpg',
  },
  {
    nome: 'Marta Puddu',
    ruolo: 'Responsabile noleggio',
    descrizione:
      'Gestisce la flotta e i contratti con le strutture ricettive della costa. È la persona che risponde ' +
      'quando serve un mezzo per il giorno stesso.',
    immagine: '/immagini/squadra/marta.jpg',
  },
  {
    nome: 'Salvatore Cabras',
    ruolo: 'Capo officina',
    descrizione:
      'Ventitré anni di meccanica, specializzato in diagnosi elettronica e sistemi ibridi. Firma il ' +
      'controllo in centoventi punti di ogni usato.',
    immagine: '/immagini/squadra/salvatore.jpg',
  },
  {
    nome: 'Elena Farci',
    ruolo: 'Detailing specialist',
    descrizione:
      'Certificata sull’applicazione dei rivestimenti nanoceramici. Ha costruito il reparto estetico dal ' +
      'primo lucidatore rotorbitale.',
    immagine: '/immagini/squadra/elena.jpg',
  },
]

/* ── Domande frequenti ───────────────────────────────────────────────────── */

export const DOMANDE_FREQUENTI = [
  {
    domanda: 'Che garanzia avete sui veicoli usati?',
    risposta:
      'Ventiquattro mesi di garanzia su motore, cambio e differenziale su tutti gli usati garantiti, ' +
      'estendibile fino a quarantotto mesi con copertura completa. La garanzia è valida in tutta Italia ' +
      'presso officine convenzionate.',
  },
  {
    domanda: 'Posso provare il veicolo prima di acquistarlo?',
    risposta:
      'Sì, il test drive è gratuito e si prenota online dalla scheda del veicolo. Bastano patente e ' +
      'documento d’identità; per le vetture sportive e le maxi moto chiediamo due anni di patente.',
  },
  {
    domanda: 'Ritirate il mio veicolo in permuta?',
    risposta:
      'Sì. La valutazione è gratuita e arriva entro quarantotto ore dall’invio delle fotografie e dei ' +
      'dati. Ci occupiamo noi del passaggio di proprietà e dell’eventuale estinzione del finanziamento ' +
      'in corso.',
  },
  {
    domanda: 'Il noleggio comprende l’assicurazione?',
    risposta:
      'Sempre. Ogni noleggio include responsabilità civile, furto e incendio, kasko con franchigia e ' +
      'soccorso stradale ventiquattro ore su ventiquattro. La franchigia può essere azzerata al momento ' +
      'del ritiro.',
  },
  {
    domanda: 'Consegnate il veicolo a domicilio?',
    risposta:
      'Sì, entro trenta chilometri da Tortolì la consegna è gratuita per i noleggi di almeno tre giorni. ' +
      'Oltre quella distanza si applica un contributo che vi indichiamo prima della conferma.',
  },
  {
    domanda: 'Quanto dura un trattamento ceramico?',
    risposta:
      'La lavorazione richiede due giornate piene, perché la correzione della vernice precede sempre ' +
      'l’applicazione. La protezione dura fino a cinque anni con un controllo annuale, incluso nel prezzo.',
  },
]

/* ── Blog ────────────────────────────────────────────────────────────────── */

export const ARTICOLI_INIZIALI: Articolo[] = [
  {
    id: 'art-001',
    slug: 'come-scegliere-auto-usata-garantita',
    titolo: 'Come scegliere un’auto usata garantita senza brutte sorprese',
    sommario:
      'I sette controlli che facciamo su ogni vettura prima di metterla in salone, spiegati in modo che ' +
      'possiate rifarli anche voi.',
    contenuto: `Comprare un’auto usata non è una scommessa, se si sa dove guardare. In concessionaria ogni vettura passa un controllo in centoventi punti prima di entrare in salone, ma i più importanti sono sette e chiunque può verificarli.

## 1. La storia manutentiva, non il libretto

Il libretto dei tagliandi timbrato non basta: chiedete le fatture degli interventi. Una fattura riporta i ricambi usati e i chilometri al momento del lavoro, un timbro no. Se il venditore non ha le fatture, può recuperarle dall’officina che ha eseguito i tagliandi.

## 2. Il chilometraggio va incrociato

Il contachilometri si legge in almeno quattro punti diversi della centralina, non solo sul quadro. Incrociate il dato con le revisioni: la banca dati della Motorizzazione registra i chilometri a ogni controllo, e la sequenza deve essere sempre crescente.

## 3. Lo spessore della vernice racconta gli incidenti

Uno spessimetro costa poche decine di euro. Su una vettura mai riverniciata i valori restano fra 90 e 140 micron su tutta la superficie. Salti improvvisi a 300 micron significano stucco, e lo stucco significa un urto riparato.

## 4. Le gomme dicono l’allineamento

Un consumo irregolare sul bordo interno o esterno segnala una geometria fuori misura, che a sua volta può derivare da una buca presa male o da un incidente. Guardate anche la data di produzione stampigliata sul fianco: quattro cifre, settimana e anno.

## 5. Il freddo dice la verità sul motore

La prova su strada va fatta a motore freddo. Un motore già caldo nasconde l’avviamento difficile, il fumo blu dei primi secondi e i rumori che spariscono con la dilatazione termica.

## 6. L’elettronica va letta, non ascoltata

Una diagnosi con lo strumento tira fuori gli errori memorizzati anche quando la spia sul cruscotto è spenta. Chiedete la stampa: è un documento, e va allegato al fascicolo del veicolo.

## 7. La garanzia, per iscritto

Una garanzia vale quanto il foglio su cui è scritta. Verificate cosa copre davvero:

- quali organi sono inclusi (motore, cambio, differenziale sono il minimo)
- il massimale per singolo intervento
- se la manodopera è compresa o solo il ricambio
- dove potete farla valere se vi trovate lontano da casa

Se anche uno solo di questi punti resta senza risposta, la trattativa può aspettare.`,
    categoria: 'guide',
    autore: 'Luca Aurora',
    data: '2026-06-12',
    immagine: '/immagini/blog/auto-usata-garantita.jpg',
    minutiLettura: 6,
    tag: ['usato', 'garanzia', 'acquisto'],
    pubblicato: true,
    inEvidenza: true,
  },
  {
    id: 'art-002',
    slug: 'trattamento-ceramico-conviene',
    titolo: 'Trattamento ceramico: quando conviene davvero',
    sommario:
      'Non è una cera costosa. Ecco cosa fa un rivestimento nanoceramico, quanto dura e su quali veicoli ' +
      'ha senso spendere.',
    contenuto: `Il rivestimento nanoceramico viene raccontato spesso male: né una cera che dura di più, né una corazza contro i graffi. È un film di biossido di silicio che si lega chimicamente al trasparente della vernice e ne cambia il comportamento.

## Cosa fa davvero

Tre cose, tutte misurabili:

- rende la superficie fortemente idrorepellente, con angolo di contatto dell’acqua sopra i 100 gradi
- protegge dai raggi ultravioletti, che sono ciò che sbiadisce i rossi e i blu
- riduce l’aderenza dello sporco, quindi il lavaggio successivo è più rapido e meno aggressivo

## Cosa non fa

Non elimina i graffi già presenti: li sigilla. Per questo la correzione della vernice viene sempre prima, e occupa la maggior parte delle sedici ore di lavorazione. Non rende la carrozzeria indistruttibile: contro i sassi serve la pellicola, che è un’altra cosa.

## Su quali veicoli conviene

Conviene su vernici scure, che mostrano ogni micrograffio, e su veicoli parcheggiati all’aperto, dove sole e salsedine lavorano tutto l’anno. Sul litorale ogliastrino la salsedine è il fattore che pesa di più.

Conviene meno su un veicolo che verrà rivenduto entro un anno, o su una vernice già molto rovinata: in quel caso la spesa maggiore è la correzione, e il risultato dipende da quanto trasparente è rimasto.

## Quanto dura

Le durate dichiarate dai produttori vanno dai due ai cinque anni. Il fattore che le determina non è il prodotto ma il lavaggio: un ceramico lavato con spazzole rotanti perde metà della sua vita utile. Il controllo annuale serve proprio a verificare l’idrorepellenza residua e a rinnovare lo strato sacrificale.`,
    categoria: 'detailing',
    autore: 'Elena Farci',
    data: '2026-05-04',
    immagine: '/immagini/blog/ceramica.jpg',
    minutiLettura: 5,
    tag: ['detailing', 'ceramica', 'protezione'],
    pubblicato: true,
    inEvidenza: true,
  },
  {
    id: 'art-003',
    slug: 'manutenzione-auto-ibrida',
    titolo: 'Manutenzione dell’auto ibrida: cosa cambia davvero',
    sommario:
      'Meno freni da cambiare, più attenzione alla batteria e al circuito di raffreddamento. Guida pratica ' +
      'per chi passa all’ibrido.',
    contenuto: `Chi passa da un diesel a un’ibrida si aspetta una manutenzione complicata e trova il contrario. Le differenze però esistono, e conoscerle evita spese inutili.

## I freni durano il doppio, ma vanno controllati

La frenata rigenerativa fa la maggior parte del lavoro, quindi le pastiglie durano anche centomila chilometri. Il rovescio della medaglia è che i dischi, poco usati, si ossidano: il controllo annuale serve a verificare che le pinze non siano bloccate, non che le pastiglie siano finite.

## La batteria ad alta tensione

Le batterie delle ibride full non si sostituiscono a scadenza: si monitorano. Una diagnosi legge lo stato di salute di ogni modulo. Sotto l’ottanta per cento della capacità originale conviene intervenire, e quasi sempre si sostituiscono singoli moduli, non l’intero pacco.

## Il raffreddamento è doppio

Un circuito per il motore termico, uno per l’elettronica di potenza. Il secondo ha un liquido specifico e una scadenza propria, spesso ignorata perché non compare nei tagliandi generici.

## Cosa resta uguale

- olio motore e filtri, con intervalli anche più lunghi
- filtro abitacolo, una volta l’anno
- gomme, che su un’ibrida pesante si consumano leggermente prima
- liquido freni, ogni due anni, esattamente come su qualsiasi altra vettura

## Il consiglio pratico

Fate girare il motore termico almeno una volta a settimana per una decina di chilometri. Chi usa l’ibrida solo per tragitti brevissimi tiene il motore a benzina fermo per giorni, e la batteria da dodici volt dei servizi si scarica: è il guasto più frequente, e il più banale da evitare.`,
    categoria: 'manutenzione',
    autore: 'Salvatore Cabras',
    data: '2026-04-18',
    immagine: '/immagini/blog/ibrida.jpg',
    minutiLettura: 5,
    tag: ['ibrido', 'manutenzione', 'batteria'],
    pubblicato: true,
    inEvidenza: false,
  },
  {
    id: 'art-004',
    slug: 'noleggio-o-acquisto',
    titolo: 'Noleggio a lungo termine o acquisto: i numeri per decidere',
    sommario:
      'Il confronto onesto fra le due formule, con il calcolo del costo reale al chilometro e i casi in cui ' +
      'ciascuna conviene.',
    contenuto: `La domanda arriva quasi ogni settimana. La risposta dipende da tre numeri: quanti chilometri percorrete in un anno, quanto a lungo tenete un veicolo e se avete partita IVA.

## Il costo reale dell’acquisto

Non è il prezzo diviso gli anni. Al prezzo va aggiunto quello che si spende comunque:

- bollo e assicurazione, che su una vettura media pesano fra 700 e 1.100 euro l’anno
- manutenzione ordinaria, dai 300 ai 600 euro l’anno
- gomme, circa 500 euro ogni due o tre anni
- svalutazione, che è la voce più grossa e la più ignorata

Da questa somma si sottrae il valore residuo alla rivendita. Il risultato, diviso i chilometri percorsi, è il costo reale.

## Il costo del noleggio

Il canone comprende tutto tranne il carburante, e non c’è valore residuo da recuperare perché il veicolo non è vostro. Il vantaggio è la certezza: si sa oggi quanto si spenderà fra tre anni.

## Quando conviene il noleggio

- se percorrete più di ventimila chilometri l’anno
- se cambiate veicolo ogni tre o quattro anni
- se avete partita IVA e potete dedurre il canone
- se il fermo macchina vi costa più del canone stesso

## Quando conviene comprare

- se tenete il veicolo oltre sette anni
- se percorrete meno di diecimila chilometri l’anno
- se il veicolo che volete tiene bene il valore nel tempo

## Il caso intermedio

Esiste una terza via che consigliamo spesso: acquisto di un usato garantito recente, quando la curva di svalutazione più ripida è già stata pagata da qualcun altro. Su una vettura di tre anni si evita circa il quaranta per cento del deprezzamento totale, mantenendo la proprietà.`,
    categoria: 'guide',
    autore: 'Marta Puddu',
    data: '2026-03-22',
    immagine: '/immagini/blog/noleggio-acquisto.jpg',
    minutiLettura: 6,
    tag: ['noleggio', 'acquisto', 'costi'],
    pubblicato: true,
    inEvidenza: false,
  },
  {
    id: 'art-005',
    slug: 'preparare-auto-estate-salsedine',
    titolo: 'Preparare il veicolo all’estate: salsedine, sole e sabbia',
    sommario:
      'Sul litorale un’estate vale due inverni di città. I quattro interventi che allungano la vita alla ' +
      'carrozzeria e agli interni.',
    contenuto: `La salsedine non arrugginisce soltanto: si deposita sul trasparente e, con il sole, ne accelera l’opacizzazione. Chi vive sulla costa se ne accorge dopo tre o quattro stagioni, quando il nero diventa grigio.

## Lavare più spesso, e meglio

Il lavaggio settimanale in estate non è un vezzo. Conta però il metodo: la spazzola rotante dell’impianto automatico trascina la sabbia sulla vernice e produce i micrograffi a ragnatela che si vedono in controluce. Il lavaggio a mano con metodo a due secchi esiste per questo.

## Proteggere prima, non dopo

Una cera dura sei settimane, un sigillante sintetico sei mesi, un ceramico anni. Qualunque sia la scelta, va applicata a inizio stagione: proteggere a settembre significa aver già preso tutto il danno.

## Gli interni soffrono più della carrozzeria

Il cruscotto sotto il parabrezza supera i settanta gradi in un pomeriggio d’agosto. Le plastiche si seccano e si crepano, la pelle perde gli oli. Un protettivo con filtro ultravioletto applicato due volte l’anno costa poco e cambia la faccia di un abitacolo dopo cinque anni.

## Le quattro cose da fare adesso

- decontaminare la carrozzeria dai depositi ferrosi, che d’estate si fissano più in fretta
- applicare una protezione, qualunque essa sia
- trattare plastiche interne e pelle con un prodotto ai raggi ultravioletti
- sostituire il filtro abitacolo prima di usare il climatizzatore tutti i giorni

Sono quattro interventi che, insieme, occupano una giornata sola.`,
    categoria: 'detailing',
    autore: 'Elena Farci',
    data: '2026-06-28',
    immagine: '/immagini/blog/estate-salsedine.jpg',
    minutiLettura: 4,
    tag: ['detailing', 'estate', 'protezione'],
    pubblicato: true,
    inEvidenza: false,
  },
  {
    id: 'art-006',
    slug: 'patente-a2-quale-moto',
    titolo: 'Patente A2: quali moto scegliere e quali evitare',
    sommario:
      'Il limite non è la cilindrata ma il rapporto peso-potenza. Come leggerlo e quali modelli restano ' +
      'validi anche dopo il passaggio alla A.',
    contenuto: `La patente A2 consente di guidare moto fino a 35 kW, cioè 47,6 cavalli, con un rapporto peso-potenza non superiore a 0,2 kW per chilogrammo. Il secondo vincolo è quello che sfugge, e ha una conseguenza pratica importante.

## Il vincolo del rapporto peso-potenza

Una moto depotenziata a 35 kW deve pesare almeno 175 chilogrammi a secco per rispettare il limite. Inoltre, la moto di partenza non può superare i 70 kW: una supersportiva da 200 cavalli non è depotenziabile, nemmeno sulla carta.

## Depotenziata o nativa?

Una moto nativa A2 è pensata per quella potenza: rapporti del cambio, freni e ciclistica sono coerenti. Una depotenziata è una moto più grossa con una mappatura limitata: pesa di più, frena come la versione piena e, il giorno in cui si toglie il limitatore, diventa la moto che era.

Il criterio è semplice: se pensate di passare alla patente A entro due anni, conviene la depotenziata, perché la rivendita è immediata. Se la moto vi accompagnerà a lungo così com’è, la nativa è più equilibrata.

## Cosa guardare al di là dei numeri

- l’altezza sella, che decide quanta fiducia avrete nel traffico
- il peso a secco: sotto i 190 chilogrammi la moto si muove da fermo con una mano
- la posizione dei comandi e l’angolo di sterzo, che contano nelle manovre
- la disponibilità dei ricambi, che sui modelli di nicchia non è mai scontata

## Tre errori frequenti

Comprare troppa moto per paura di annoiarsi, comprare troppo poca per paura di sbagliare, e comprare senza provare. Il test drive esiste anche per le moto, e mezz’ora in sella dice più di qualsiasi scheda tecnica.`,
    categoria: 'guide',
    autore: 'Luca Aurora',
    data: '2026-02-15',
    immagine: '/immagini/blog/patente-a2.jpg',
    minutiLettura: 5,
    tag: ['moto', 'patente', 'acquisto'],
    pubblicato: true,
    inEvidenza: false,
  },
  {
    id: 'art-007',
    slug: 'novita-elettriche-2026',
    titolo: 'Elettriche nel 2026: cosa è cambiato davvero',
    sommario:
      'Ricarica più rapida, batterie LFP e prezzi in discesa. Il punto della situazione senza entusiasmi ' +
      'né catastrofismi.',
    contenuto: `Il 2026 è il primo anno in cui l’auto elettrica compatta costa quanto la corrispondente a benzina ben accessoriata. Non è una svolta ideologica: è la chimica delle batterie che è cambiata.

## Le batterie LFP hanno cambiato i conti

Il litio-ferro-fosfato ha densità energetica inferiore, quindi a parità di autonomia pesa di più. In cambio costa meno, dura più cicli e non teme la ricarica al cento per cento. Sulle vetture cittadine, dove l’autonomia richiesta è modesta, è la scelta giusta e ha abbassato i listini.

## La ricarica non è più il collo di bottiglia

Le architetture a 800 volt sono scese dai modelli di lusso alle vetture di segmento C. Venti minuti dal dieci all’ottanta per cento sono ormai la norma su queste piattaforme. Il vero limite oggi è la distribuzione delle colonnine, non la velocità.

## Cosa guardare prima di passare all’elettrico

- se avete un posto auto con presa: senza ricarica domestica il risparmio si dimezza
- il consumo reale in autostrada, che è dove le elettriche perdono di più
- lo stato di salute della batteria, se comprate usato: chiedete sempre il certificato
- il costo dell’assicurazione, spesso più alto per il valore del veicolo

## Sull’usato elettrico

Le prime elettriche di massa arrivano ora sul mercato dell’usato a prezzi interessanti. Il criterio decisivo è uno solo: il certificato di stato di salute della batteria. Sopra il novanta per cento si compra tranquilli, fra l’ottanta e il novanta si tratta sul prezzo, sotto l’ottanta si lascia perdere.`,
    categoria: 'novita',
    autore: 'Salvatore Cabras',
    data: '2026-07-16',
    immagine: '/immagini/blog/elettriche-2026.jpg',
    minutiLettura: 5,
    tag: ['elettrico', 'novità', 'batteria'],
    pubblicato: true,
    inEvidenza: false,
  },
]
