# CINEMAX — piattaforma di biglietteria cinematografica

Sito pubblico, motore di prenotazione e pannello di gestione per una rete di
cinema. Next.js 16, React 19, TypeScript, Tailwind CSS 4.

> **Contenuti dimostrativi.** Titoli, trame, registi, interpreti e locandine del
> catalogo incluso sono **inventati**. Non compare nessuna opera reale e nessun
> materiale protetto da copyright: il progetto non contiene neppure un file
> immagine di repertorio, perché locandine e fondali sono disegnati dal sito
> stesso. Anche il nome «CINEMAX» è provvisorio e si cambia dal pannello.
>
> Per lavorare con film veri c'è l'importazione da [The Movie
> Database](https://www.themoviedb.org): si configura una chiave e il pannello
> porta in catalogo schede, locandine, cast e trailer. Vedi
> [Film veri: importazione da TMDB](#film-veri-importazione-da-tmdb).

> **Progetto indipendente.** Questa cartella ospita un'applicazione a sé, che
> non condivide codice, dipendenze né dati con gli altri progetti del
> repository. Si compila e si pubblica separatamente: chi la mette online deve
> impostare la **Root Directory** su `cinema`.

## Avvio rapido

```bash
cd cinema
npm install
cp .env.example .env.local     # facoltativo: senza, il sito pubblico funziona
npm run dev                    # http://localhost:3000
```

Al primo avvio l'archivio si riempie da solo con dodici film, cinque cinema,
ventisei sale e un palinsesto di dieci giorni generato a partire da oggi. Per
entrare nel pannello (`/admin`) servono `PANNELLO_PASSWORD` e
`PANNELLO_SEGRETO` in `.env.local`.

Altri comandi:

```bash
npm run build      # compilazione di produzione
npm run start      # serve la build
npm run tipi       # controllo dei tipi (tsc --noEmit)
npm run prova-qr   # verifica del generatore di codici QR
```

## Cosa c'è dentro

### Sito pubblico

| Pagina | Indirizzo | Cosa fa |
| --- | --- | --- |
| Home | `/` | Apertura con i film in evidenza, in sala ora, prossime uscite, trailer, promozioni, CLUB, sale |
| Film | `/film` | Catalogo con filtri per genere, formato, cinema, anno, disponibilità |
| Scheda film | `/film/<slug>` | Trama, cast, formati, «dove vederlo», calendario e orari acquistabili |
| Programmazione | `/programmazione` | Tutti gli spettacoli, per giornata e per cinema |
| Trova cinema | `/cinema` | Ricerca per città, CAP o posizione, con ordinamento per distanza |
| Scheda cinema | `/cinema/<slug>` | Programmazione, sale, capienza, servizi, orari, contatti |
| Trailer | `/trailer` | Vetrina delle anteprime |
| Ricerca | `/ricerca?q=` | Film, interpreti, registi, generi, cinema |
| Promozioni | `/promozioni` | Offerte attive con tutte le condizioni dichiarate |
| Abbonamenti | `/abbonamenti` | Piani, confronto, limitazioni |
| Food & Drink | `/food` | Banco alimentari con prezzi e allergeni |
| Gift card | `/gift-card` | Acquisto con messaggio e data di invio |
| Acquisto | `/acquista` | Il motore di prenotazione |
| Biglietto | `/biglietto/<codice>` | Biglietti con QR, stampabili |
| My Cinema | `/area-personale` | Biglietti, punti, coupon, abbonamento, preferiti, profilo |

Completano l'elenco privacy, termini di vendita, cookie e la dichiarazione di
accessibilità.

### Motore di prenotazione

Otto passi (cinema → film → data → orario → posti → biglietti → food →
pagamento), attraversabili avanti e indietro. Chi arriva da un orario specifico
parte direttamente dalla scelta dei posti.

- **Mappa della sala** con zoom, navigazione da tastiera, stati distinguibili
  senza colore, scelta automatica dei posti migliori e avviso quando la
  selezione lascerebbe un posto isolato.
- **Il prezzo lo calcola il server.** Ogni modifica interroga `/api/ordine`,
  che usa lo stesso motore con cui poi si incassa: il browser non somma nulla
  per conto proprio.
- **La disponibilità si aggiorna da sola** ogni venticinque secondi mentre si
  guarda la mappa.
- **I posti si bloccano solo al pagamento**, per il numero di minuti impostato
  nel pannello. Scaduto il blocco tornano liberi senza che nessuno debba fare
  pulizia.

### Biglietti

Un biglietto per posto, ciascuno con il proprio QR firmato. Il contenuto è
corto e non contiene dati personali:

```
CMX1|<prenotazione>|<biglietto>|<firma>
```

La firma è un HMAC troncato calcolato con `BIGLIETTI_SEGRETO`: permette di
scartare un codice inventato prima ancora di interrogare l'archivio. La
verifica all'ingresso (`/admin/verifica`) legge il QR con la fotocamera dove il
browser lo permette, altrimenti da un campo di testo che funziona con i lettori
da banco. Lettura e timbratura sono due operazioni distinte: si può controllare
un biglietto senza consumarlo.

Il generatore di QR è scritto nel progetto (`src/lib/qr.ts`), senza
dipendenze. È stato confrontato modulo per modulo con la libreria di
riferimento `qrcode` su 2.978 casi — testi casuali da 1 a 180 caratteri, tutti
e quattro i livelli di correzione, versioni dalla 1 alla 10 — con esito
identico in tutti. `npm run prova-qr` ne verifica trenta contro le impronte
salvate.

### Pannello di gestione

`/admin`, con due livelli di accesso: gestione completa e sola verifica dei
biglietti (il tablet all'ingresso della sala, con una password propria).

Cruscotto e statistiche · programmazione con generatore automatico di
palinsesto · prenotazioni con incasso in cassa, annullamenti e rimborsi ·
verifica dei QR · catalogo film · **importazione da TMDB** · cinema ·
**editor grafico delle sale** ·
banco alimentari · tipologie di biglietto · promozioni · coupon anche a lotti ·
gift card · abbonamenti · programma fedeltà · anagrafica clienti · registro
delle operazioni · impostazioni.

Dal pannello si cambiano nome del marchio, commissioni, supplementi, valore dei
punti e moduli attivi: spegnendo un modulo spariscono la voce di menu, la
pagina pubblica e il passo corrispondente nel flusso d'acquisto.

## Film veri: importazione da TMDB

Il catalogo incluso è inventato e resta tale: le locandine vere sono materiale
di altri, e distribuirle dentro un repository pubblico non è una cosa che si fa.
Un cinema che apre davvero, però, programma film veri, e trascrivere a mano
trenta schede a settimana — trama, durata, generi, cast, regia, classificazione
— è il genere di lavoro che si smette di fare dopo la seconda settimana.

Per questo c'è `/admin/importa`, che parla con le API di
[The Movie Database](https://www.themoviedb.org).

**Come si attiva.** Una chiave v3 dal proprio profilo TMDB (Impostazioni → API),
scritta in `.env.local`:

```
TMDB_API_KEY=la-vostra-chiave
TMDB_LINGUA=it-IT
TMDB_PAESE=IT
```

La chiave non sta nel codice e non deve starci mai: `src/lib/tmdb.ts` la legge
solo da variabile d'ambiente, e il modulo è `server-only` — non finisce nel
pacchetto mandato al browser. Senza chiave la pagina d'importazione dice che
cosa manca e dove metterlo; tutto il resto della piattaforma funziona identico.

**Che cosa fa.** Tre elenchi — in sala ora, in arrivo, ricerca per titolo — e un
pulsante per titolo. La scheda arriva compilata: titolo e titolo originale,
frase d'effetto, sinossi e trama, generi, durata, anno, paese, lingua
originale, regia, primi dodici interpreti con i rispettivi ruoli,
classificazione d'età italiana, valutazione, locandina, fondale e il primo
trailer ufficiale su YouTube.

**Due scelte deliberate.**

1. Il film importato nasce **non pubblicato**. L'importazione porta dentro la
   materia prima; che un titolo compaia sul sito resta una decisione di chi
   programma la sala, non l'effetto collaterale di un clic.
2. Reimportare un film già in catalogo lo **aggiorna** invece di duplicarlo, e
   l'aggiornamento non tocca i campi che appartengono alla sala e non al film:
   formati di proiezione (IMAX, 4DX, Dolby Atmos dipendono dalla sala), evidenza
   in home, visibilità, identificativo, indirizzo della pagina e trailer scelto
   a mano — che spesso è la versione italiana, mentre TMDB propone l'originale.

L'archivio non conserva il numero TMDB: il riconoscimento passa dall'indirizzo
della pagina (titolo più anno). È voluto — una scheda importata si modifica poi
a mano senza che nulla la rileghi all'originale, e la piattaforma resta
indipendente dal servizio da cui i dati sono arrivati.

**Diritti.** TMDB richiede l'attribuzione a chi usa le sue API: il testo è in
fondo alla pagina d'importazione. Le locandine restano materiale dei rispettivi
titolari e vengono servite dai server di TMDB — la piattaforma non ne fa copia,
e per questo `image.tmdb.org` è dichiarato in `images.remotePatterns` dentro
`next.config.ts`. Chi pubblica un sito commerciale verifichi le condizioni
d'uso correnti di TMDB e dei distributori.

## Architettura

```
src/
  app/
    (sito)/          pagine pubbliche
    admin/           pannello di gestione
    api/             rotte di servizio
  componenti/
    ui/              design system: Bottone, Sezione, Finestra, campi, Qr, Poster…
    layout/          intestazione, piè di pagina, marchio, tema
    film/ cinema/    componenti di dominio
    prenota/         motore di prenotazione
    biglietto/       biglietto digitale
    account/         area personale
    admin/           componenti del pannello
  dati/              contenuti iniziali (film, cinema, listini, promozioni)
  lib/               logica: tipi, archivio, prezzi, posti, prenotazioni, QR…
docs/
  schema-database.md schema relazionale per la normalizzazione
```

Il confine che conta: **tutto ciò che decide un prezzo o una disponibilità sta
in `lib/` e gira sul server.** I componenti disegnano, non calcolano.

| Ambito | Scelta |
| --- | --- |
| Framework | Next.js 16, App Router, componenti di server per impostazione predefinita |
| Stili | Tailwind CSS 4, tema in `src/app/globals.css` |
| Animazioni | Framer Motion, solo per le comparse |
| Icone | disegnate nel progetto (`componenti/ui/Icona.tsx`) |
| Grafici | SVG disegnati nel progetto (`componenti/admin/Grafici.tsx`) |
| Codici QR | scritti nel progetto (`lib/qr.ts`) |
| Caratteri | `next/font`, serviti dal dominio: nessuna richiesta a Google |
| Dati | file JSON oppure PostgreSQL, deciso da `DATABASE_URL` |
| Pagamenti | Stripe e PayPal via API HTTP, senza SDK |
| Email | Resend via API HTTP |

Nessun font, script o immagine viene scaricato da domini terzi al caricamento
delle pagine. I trailer di YouTube e Vimeo si incorporano **solo dopo il clic**
sul pulsante di riproduzione: prima non parte nessuna richiesta e non viene
installato nessun cookie di terze parti. È il motivo per cui il sito non ha un
banner di consenso — installa soltanto cookie tecnici.

## Archivio dei dati

Senza `DATABASE_URL` i dati stanno in `dati-locali/archivio.json` (scrittura
atomica). Con `DATABASE_URL` si usa PostgreSQL, una riga per collezione in
colonne `jsonb`.

**Per la produzione con più di una sala usate PostgreSQL.** Il deposito su file
presuppone un solo processo con disco scrivibile; su piattaforme serverless le
modifiche fatte dal pannello non sopravvivono al riavvio.

Lo schema è descritto una volta sola, in `src/lib/tipi.ts`.
[`docs/schema-database.md`](docs/schema-database.md) contiene lo schema
relazionale normalizzato corrispondente, con l'ordine consigliato per
estrarre le tabelle e i due vincoli — doppia vendita del posto e sovrapposizione
di proiezioni — che conviene spostare sul database prima di scalare
orizzontalmente.

## Sicurezza

- **I dati delle carte non entrano mai nella piattaforma.** Vengono inseriti
  sulle pagine di Stripe o PayPal; qui torna solo un identificativo. Non c'è
  nessun punto del codice in cui un numero di carta possa essere letto o
  registrato.
- **Il pagamento si conferma solo dal riscontro firmato.** Per Stripe la firma
  del webhook viene verificata con `STRIPE_WEBHOOK_SECRET`; senza segreto i
  riscontri vengono rifiutati invece di essere accettati per comodità. Per
  PayPal l'ordine viene incassato interrogando PayPal, non sulla parola del
  browser.
- **Password** conservate come impronta scrypt con sale per utente. Il pannello
  non ha nessuna funzione per cambiare la password di un cliente.
- **Sessioni** in cookie `httpOnly`, `SameSite=Lax`, firmati HMAC-SHA256, con
  scadenza dentro la firma.
- **Autorizzazione** verificata in ogni rotta riservata, non solo
  nell'interfaccia. Due livelli: gestione e maschera.
- **SQL injection**: non c'è SQL costruito con stringhe. Il deposito PostgreSQL
  usa solo query parametriche.
- **XSS**: quella di React. Nessun `dangerouslySetInnerHTML` su contenuti
  dell'archivio.
- **CSRF**: `SameSite=Lax` sui cookie di sessione e nessuna operazione che
  modifichi dati su richieste `GET`.
- **Limite di frequenza** su accessi, registrazioni, ordini, ricerca, controllo
  delle gift card e recupero dei biglietti dal codice.
- **Registro** di accessi, modifiche, incassi, annullamenti, rimborsi e
  ingressi in sala.

Il limite da conoscere: il contatore del limite di frequenza è in memoria e
vale per processo. Dietro a un bilanciatore con più istanze va spostato su
Redis o su un servizio dedicato.

## Cosa manca per la produzione

Elencato perché sia chiaro dov'è il confine fra quello che funziona e quello
che è predisposto:

- **Gift card e abbonamenti si attivano senza incasso.** Vanno collegati allo
  stesso flusso delle prenotazioni — creazione in attesa, attivazione al
  riscontro di pagamento — altrimenti chiunque può emettersi credito. Per gli
  abbonamenti serve anche il rinnovo ricorrente (con Stripe: gli abbonamenti,
  non i pagamenti singoli).
- **Notifiche push e SMS** sono in coda ma non collegate: `lib/notifiche.ts`
  segna dove innestare il fornitore.
- **Apple Wallet e Google Wallet** richiedono certificati rilasciati dai
  rispettivi fornitori. Il pulsante c'è e dichiara di non essere ancora attivo.
- **Recupero della password** dei clienti non è implementato.
- **Audit di accessibilità** con utenti di tecnologie assistive non è stato
  svolto: la dichiarazione in `/accessibilita` dice cosa è stato verificato e
  cosa no.
- **Locandine, fondali e fotografie del banco** sono disegnati dal sito. In
  produzione o si importa il catalogo da TMDB, oppure si caricano le immagini
  su un archivio compatibile S3 aggiungendone l'host a `images.remotePatterns`
  in `next.config.ts`.
- **Importazione TMDB**: scritta e verificata staticamente, ma **non provata
  contro il servizio reale**, perché l'ambiente in cui è stata sviluppata non
  ha accesso in uscita a `api.themoviedb.org`. Va provata con una chiave vera
  prima di contarci in produzione.
- **Trailer**: gli identificativi dei video si inseriscono dal pannello.
- I documenti legali (privacy, termini) sono scritti sui trattamenti reali
  della piattaforma ma vanno riletti e adattati dal titolare: riferimenti
  societari, tempi di conservazione e responsabili esterni dipendono dai
  fornitori effettivamente attivati.

## Accessibilità

Navigazione da tastiera completa, mappa della sala compresa (frecce fra le
poltrone, Invio per scegliere). Modelli ARIA completi per schede a linguetta e
casella di ricerca. Nessuna informazione affidata al solo colore. Contrasto
minimo 4,5:1 in entrambi i temi — è il motivo per cui l'accento cambia tonalità
fra chiaro e scuro. Rispetto di `prefers-reduced-motion`. La dichiarazione in
`/accessibilita` elenca anche i punti aperti.

## SEO

Ogni film e ogni cinema hanno indirizzo leggibile, metadati propri e dati
strutturati Schema.org: `Movie` per i film, `ScreeningEvent` per le proiezioni
— con orario, formato e collegamento all'acquisto — `MovieTheater` per le sale,
`BreadcrumbList` per il percorso. Mappa del sito e `robots.txt` generati
dall'archivio. Pannello, API, checkout, biglietti e area personale sono esclusi
dall'indicizzazione.
