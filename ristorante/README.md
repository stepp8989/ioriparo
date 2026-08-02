# Ristorante Aurea — sito web e pannello di gestione

Sito completo per un ristorante di alto livello: presentazione, menù con
allergeni, prenotazione online con conferma automatica, galleria, recensioni,
contatti e un pannello di amministrazione con cui lo staff aggiorna tutto senza
toccare il codice.

Applicazione **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4
+ Framer Motion**. Interfaccia e codice in italiano.

## Avvio rapido

```bash
npm install
cp .env.example .env.local     # facoltativo in sviluppo
npm run dev                    # http://localhost:3000
```

Il pannello è su [http://localhost:3000/admin](http://localhost:3000/admin). In
sviluppo la password predefinita è `aurea`; in produzione va impostata
(vedi [Configurazione](#configurazione)).

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Sviluppo con ricaricamento immediato |
| `npm run build` | Compilazione di produzione |
| `npm start` | Avvio della build compilata |
| `npm run tipi` | Controllo dei tipi TypeScript |
| `npm run immagini` | Rigenera le fotografie mancanti (`--tutto` per rifarle tutte) |

## Le pagine

| Percorso | Contenuto |
| --- | --- |
| `/` | Apertura a schermo intero, chi siamo, piatti più richiesti, specialità della casa, galleria, recensioni, eventi, invito a prenotare |
| `/menu` | Carta completa divisa in nove categorie, con foto, descrizione, allergeni, prezzo ed etichette «Novità» e «Consigliato» |
| `/prenota` | Modulo di prenotazione con orari ricavati dalle aperture reali e conferma immediata |
| `/chi-siamo` | Storia, missione, valori, chef e squadra |
| `/galleria` | Mosaico di fotografie con visualizzatore a schermo intero |
| `/contatti` | Recapiti, orari, mappa, indicazioni stradali e modulo contatti |
| `/privacy`, `/cookie-policy` | Informative GDPR |
| `/admin` | Pannello di gestione, protetto da password |

## Il pannello di gestione

Da `/admin` lo staff può:

* **Menù** — aggiungere piatti, modificare prezzi, descrizioni e allergeni,
  cambiare la fotografia, nascondere un piatto senza eliminarlo e scegliere
  quali compaiono in home fra «i piatti più richiesti».
* **Prenotazioni** — leggere le richieste, confermarle o annullarle, chiamare
  o scrivere al cliente con un tocco, esportare tutto in CSV.
* **Messaggi** — leggere quanto arriva dal modulo contatti.
* **Recensioni** — trascrivere quelle di Google e Tripadvisor, pubblicarle o
  nasconderle. La media mostrata sul sito e nei dati per Google si calcola da qui.
* **Eventi e promozioni** — creare, attivare e disattivare le iniziative in home.
* **Orari** — cambiare le aperture di pranzo e cena. La modifica si riflette
  subito nel piè di pagina, nella pagina Contatti, nei dati strutturati e negli
  orari prenotabili.

Ogni modifica invalida solo le pagine interessate (`revalidatePath`): il sito
pubblico resta statico e velocissimo, ma si aggiorna nel giro di un istante.

### Fotografie

Dal pannello si può caricare un'immagine dal dispositivo: viene ridimensionata
a 1600 px e riconvertita in JPEG prima di essere salvata in
`public/immagini/caricate/`. In alternativa si sceglie fra quelle già presenti
o si incolla un percorso.

Dove il disco è di sola lettura — è il caso di molte piattaforme serverless —
il caricamento non è possibile e la rotta lo dice chiaramente: in quel caso si
usa un servizio di archiviazione esterno e si incolla l'indirizzo dell'immagine.

## Configurazione

Tutte le variabili sono descritte in [`.env.example`](.env.example). Le uniche
obbligatorie in produzione sono quelle del pannello:

```bash
PANNELLO_PASSWORD=una-password-lunga
PANNELLO_SEGRETO=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

L'accesso usa un cookie firmato con HMAC, valido dodici ore, con confronto
della password a tempo costante e un limite ai tentativi per indirizzo di
provenienza.

I dati del ristorante — nome, indirizzo, telefono, partita IVA, social,
coordinate della mappa — stanno tutti in
[`src/dati/ristorante.ts`](src/dati/ristorante.ts): è l'unico file da toccare
per adattare il sito a un'altra attività.

## Dove stanno i dati

I contenuti modificabili vivono in un unico file JSON
(`dati-locali/archivio.json`, percorso configurabile), scritto in modo atomico e
con le modifiche messe in coda perché due richieste contemporanee non possano
sovrascriversi.

Per passare a un database vero basta sostituire `leggi` e `scrivi` in
[`src/lib/archivio.ts`](src/lib/archivio.ts): nient'altro nel progetto conosce
il formato di memorizzazione.

I contenuti di partenza — menù, recensioni, orari, eventi — sono in
`src/dati/` e vengono copiati nell'archivio al primo avvio.

## Prestazioni e SEO

* Tutte le pagine pubbliche sono **prodotte staticamente** in fase di
  compilazione e rigenerate su richiesta quando cambiano i contenuti.
* **Nessuna richiesta a domini terzi**: i due caratteri tipografici sono
  scaricati in compilazione e serviti dal dominio del sito, le fotografie sono
  locali. La mappa di Google e Analytics partono **solo dopo il consenso**.
* Immagini servite da `next/image` in AVIF e WebP, dimensionate per il
  dispositivo, con caricamento differito ovunque tranne che nella prima
  schermata.
* Animazioni limitate a `opacity` e `transform`, che il browser compone senza
  ricalcolare il layout: nessuno spostamento di contenuto durante lo
  scorrimento.
* `Metadata` per ogni pagina con canonical, Open Graph e Twitter Card; dati
  strutturati `Restaurant`, `Menu`, `BreadcrumbList`, `FAQPage` e
  `AggregateRating`; `sitemap.xml` e `robots.txt` generati automaticamente, con
  pannello e API esclusi dall'indice.

## Accessibilità

Contrasti conformi alle WCAG 2.1 AA, contorno di messa a fuoco sempre visibile,
collegamento «Vai al contenuto», etichette associate a ogni campo, errori
collegati con `aria-describedby`, carosello che si ferma al passaggio del
puntatore e alla messa a fuoco, visualizzatore della galleria comandabile da
tastiera (Esc e frecce). Chi ha ridotto le animazioni nelle impostazioni di
sistema vede il sito fermo, con tutti i contenuti al loro posto.

## Le fotografie

Il progetto non scarica immagini da servizi esterni: quelle incluse sono
composte da [`scripts/genera-immagini.mjs`](scripts/genera-immagini.mjs) con
`sharp`, a partire dalla palette del sito. Sono segnaposto d'autore, coerenti
fra loro e leggerissimi (poco più di un megabyte in tutto), pensati per essere
sostituiti.

**Per mettere le fotografie vere** basta sovrascrivere i file dentro
`public/immagini/` mantenendo gli stessi nomi: nessuna modifica al codice.
Le proporzioni attese sono 4:3 per i piatti, 3:4 per i ritratti e formati
misti in galleria.

## Pubblicazione

Il progetto è pronto per qualsiasi piattaforma che sappia eseguire Next.js.

* **Con disco scrivibile** (VPS, container, Docker): funziona così com'è,
  montando un volume persistente sulla cartella dell'archivio.
* **Su piattaforme serverless** (Vercel e simili): il sito pubblico e le
  prenotazioni funzionano, ma le modifiche fatte dal pannello non
  sopravvivono al riavvio dell'istanza, perché il disco è di sola lettura.
  Per l'uso reale collegate un database in `src/lib/archivio.ts` e un servizio
  di archiviazione per le immagini.

Ricordate di impostare `PANNELLO_PASSWORD`, `PANNELLO_SEGRETO` e
`NEXT_PUBLIC_SITO` fra le variabili d'ambiente della piattaforma.

> **Attenzione alla cartella radice.** Questo repository contiene anche IO
> RIPARO, che ha un proprio `vercel.json` nella radice. Chi pubblica deve
> impostare la **Root Directory** del progetto su `ristorante`, altrimenti la
> piattaforma compila l'altra applicazione.

## Struttura del progetto

```
scripts/genera-immagini.mjs   generatore delle fotografie
public/immagini/              piatti, ambienti, galleria, squadra, eventi
src/
  app/
    (sito)/                   pagine pubbliche, con intestazione e piè di pagina
    admin/                    pannello, protetto dal layout
    api/                      prenotazioni, menù, recensioni, orari, eventi,
                              contatti, newsletter, immagini, accesso
    layout.tsx                documento, caratteri, metadati di base
    globals.css               tema, utilità e regole di movimento
  componenti/
    layout/                   intestazione, piè di pagina, marchio, tema
    home/                     sezioni della home
    menu/ galleria/ prenota/ contatti/
    admin/                    pannello: guscio, campi, schermate di gestione
    ui/ animazioni/           mattoni riutilizzabili
    comuni/                   consenso cookie, banner, statistiche, azioni fisse
  dati/                       scheda del ristorante e contenuti iniziali
  lib/                        archivio, sessione, posta, SEO, protezioni, utilità
```
