# IO RIPARO — Sito web e gestionale

> **Nota.** Questo repository ospita anche altri progetti, indipendenti da IO RIPARO e
> indipendenti fra loro. Nessuno condivide codice, dipendenze o dati con gli altri: si
> compilano e si pubblicano separatamente, e **chi ne pubblica uno deve impostare la Root
> Directory sulla sua cartella**, altrimenti viene compilato IO RIPARO.
>
> | Cartella | Progetto | Tecnologia |
> | --- | --- | --- |
> | [`ristorante/`](ristorante/) | **Ristorante Aurea** — sito e pannello di gestione | Next.js 16, Tailwind 4, Framer Motion |
> | [`concessionaria/`](concessionaria/) | **Aurora Motori** — sito, catalogo e pannello | Next.js 16, Tailwind 4, Framer Motion |
> | [`agenzia/`](agenzia/) | **Orbita Studio** — vetrina per chi realizza siti web | Next.js 16, Tailwind 4, nessuna dipendenza per le animazioni |

Progetto unico che contiene due applicazioni con lo stesso archivio dati:

| Area | Percorso | Destinatari | Nella build pubblica |
| --- | --- | --- | --- |
| **Sito web pubblico** | `/` | clienti privati e aziende | sì |
| **Gestionale** | `/gestionale` | staff del laboratorio | **no**, si compila con `VITE_GESTIONALE=1` |

Il gestionale non ha autenticazione: se finisse online chiunque conoscesse l'indirizzo
vedrebbe clienti, fatture e magazzino. Per questo è escluso dalla build di produzione —
il codice resta nel repository e tornerà utile quando ci sarà un accesso vero.

Il sito presenta i servizi, raccoglie preventivi e appuntamenti e permette al cliente di seguire
la propria riparazione; il gestionale è il pannello con cui il laboratorio gestisce clienti,
riparazioni, preventivi, fatture, magazzino, ordini, scadenze e statistiche.

Applicazione **Vite + React + TypeScript**, interfaccia in italiano.

## Avvio rapido

```bash
npm install
npm run dev        # http://localhost:5173
```

Altri comandi:

```bash
npm run build      # sitemap + controllo dei tipi + build di produzione in dist/
npm run preview    # anteprima della build
npm run lint       # oxlint
npm run sitemap    # rigenera public/sitemap.xml
npm run anteprima  # anteprima/io-riparo.html: tutto il sito in un unico file
```

## Stack

| Ambito | Scelta |
| --- | --- |
| Build | Vite 8 |
| UI | React 19 + TypeScript |
| Stili sito pubblico | CSS proprietario con variabili di tema (`src/sito/sito.css`) |
| Stili gestionale | Tailwind CSS v4 (tema in `src/index.css`) |
| Routing | React Router 7 con caricamento a moduli separati |
| Grafici | Recharts (solo gestionale) |
| Icone | sprite SVG interno (sito) e lucide-react (gestionale) |
| Dati | archivio locale in `localStorage`, nessun backend |

Nessun font, script o immagine viene scaricato da domini esterni: il sito non effettua
richieste di terze parti e non installa cookie non necessari.

## Sito pubblico

| Percorso | Contenuto |
| --- | --- |
| `/` | Apertura con campo segnale animato, servizi, motivi, processo, numeri, settori, tracking, galleria, recensioni, FAQ, blog, invito al contatto |
| `/chi-siamo` | Storia, missione, valori e percorso dell'attività |
| `/servizi` | Le 12 specializzazioni, listino orientativo e domande frequenti |
| `/servizi/:id` | Pagina dedicata a ogni servizio: interventi compresi, fasi, prezzi e domande |
| `/galleria` | Lavori eseguiti con filtro per categoria e visualizzatore a schermo intero |
| `/blog`, `/blog/:slug` | Guide tecniche con dati strutturati `Article` |
| `/preventivo` | Preventivo online in tre passaggi con stima di prezzo calcolata |
| `/prenota` | Prenotazione appuntamenti con giorni e fasce orarie disponibili |
| `/stato-riparazione` | Ricerca della pratica per codice e avanzamento in tempo reale |
| `/area-clienti` | Accesso cliente: pratiche, approvazione preventivi, documenti |
| `/contatti` | Recapiti, orari con stato "aperto ora", mappa disegnata e modulo |
| `/privacy`, `/cookie-policy` | Informative GDPR |
| `/mappa-del-sito` | Elenco di tutte le pagine (in XML su `/sitemap.xml`) |

Funzioni trasversali: menu mobile a scomparsa, ricerca interna (`Ctrl/⌘ K`) con sinonimi,
tema chiaro/scuro persistente, banner cookie con preferenze granulari, chat di assistenza,
pulsante WhatsApp e ritorno a inizio pagina, newsletter, notifiche a comparsa.

### Dati e SEO

I contenuti stanno in `src/sito/dati/` (servizi, galleria, recensioni, FAQ, blog, azienda):
sono l'unica fonte da cui derivano pagine, ricerca interna, sitemap e dati strutturati.

Ogni pagina imposta titolo, descrizione, canonical, Open Graph, Twitter Card e JSON-LD
(`LocalBusiness`, `Service`, `FAQPage`, `Article`, `BreadcrumbList`) tramite `useSeo`.

## Gestionale

| Percorso | Contenuto |
| --- | --- |
| `/gestionale` | Dashboard: riepiloghi, azioni rapide, riparazioni per stato, ultime pratiche, scadenze |
| `/gestionale/richieste` | Preventivi, appuntamenti e messaggi arrivati dai moduli del sito |
| `/gestionale/riparazioni` | Elenco con filtri, ricerca, ordinamento, paginazione ed esportazione CSV |
| `/gestionale/riparazioni/nuova` | Accettazione: dati cliente e dispositivo, difetto, accessori, foto, firma |
| `/gestionale/riparazioni/:id` | Scheda con stato, interventi, ricambi, totali IVA, stampa |
| `/gestionale/clienti`, `/clienti/:id` | Anagrafica privati e aziende con storico |
| `/gestionale/scadenze`, `/impianti` | Promemoria e impianti installati |
| `/gestionale/preventivi`, `/fatture` | Documenti commerciali e incassi |
| `/gestionale/magazzino`, `/ordini` | Ricambi, sotto scorta, ordini a fornitore |
| `/gestionale/statistiche` | Incassi, riparazioni per mese, ricavi per categoria, più venduti |
| `/gestionale/profilo` | **Solo** i dati di chi usa il gestionale e le preferenze del suo account |
| `/gestionale/impostazioni` | Dati dell'attività e valori predefiniti dei documenti |
| `/gestionale/backup` | Archivio (locale o online), backup JSON ed esportazioni CSV |

Ogni sezione ha una pagina propria, con il suo modulo caricato separatamente: la
dashboard non scarica il codice delle statistiche e viceversa. Il menu laterale è
raggruppato per area — Laboratorio, Documenti, Magazzino, Analisi, Account — così
resta leggibile man mano che le voci aumentano.

La divisione delle responsabilità è netta:

| Pagina | Contiene | Non contiene |
| --- | --- | --- |
| **Dashboard** | numeri del giorno, azioni rapide, code di lavoro | grafici e analisi, che stanno in Statistiche |
| **Profilo personale** | nome, ruolo, recapiti, preferenze, accesso | qualunque dato dell'azienda |
| **Impostazioni** | denominazione, partita IVA, IVA e numerazione | dati personali, backup |
| **Backup** | archivio locale, esportazioni, ripristino | impostazioni dell'attività |

Le due aree condividono l'archivio: la pratica che il tecnico aggiorna nel gestionale è la
stessa che il cliente vede su `/stato-riparazione` e nell'area riservata.

## Archivio online (Supabase)

Senza configurazione il gestionale lavora sull'archivio locale del browser: comodo per
provare, ma i dati restano su un solo dispositivo e il sito non può mostrare stati reali.
Collegando Supabase le due cose diventano una sola — il laboratorio scrive, il cliente legge.

**Cosa cambia una volta collegato**

- il gestionale chiede e-mail e password prima di aprirsi: senza accesso le tabelle non
  restituiscono nulla, quindi non è una protezione di facciata;
- ogni modifica fatta nel gestionale finisce anche nell'archivio condiviso, così le stesse
  pratiche si vedono dal negozio, da casa e dal telefono;
- `/stato-riparazione` legge lo stato vero della pratica, senza che nessuno debba ricopiarlo;
- le richieste dei moduli del sito arrivano in `/gestionale/richieste` **oltre** che per
  e-mail: i due canali sono indipendenti, se uno non funziona la richiesta non si perde.

**Come si collega**

1. crea un progetto su [supabase.com](https://supabase.com) (il piano gratuito basta);
2. apri **SQL Editor**, incolla il contenuto di `supabase/schema.sql` ed esegui: crea le
   tabelle, i permessi e la funzione `stato_riparazione`;
3. in **Authentication → Users** crea l'utenza del personale (e-mail e password): non
   esiste registrazione libera, gli account si creano solo da qui;
4. in **Project Settings → API** copia *Project URL* e chiave *anon public* e mettile in
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (in `.env` e su Vercel);
5. al primo accesso, da `/gestionale/backup`, usa **Trasferisci l'archivio di questo
   browser** per portare online il lavoro già fatto sul computer.

**Cosa vede il pubblico.** Una sola porta: la funzione `stato_riparazione`, che a fronte di
un codice pratica restituisce dispositivo, stato e date. Nome, telefono, indirizzo e importi
non escono mai dal database. Tutte le tabelle hanno Row Level Security attiva e l'unica cosa
che un visitatore può scrivere è una riga in `richieste`.

**Sui codici pratica.** Il progressivo da solo (`#26-0007`) sarebbe indovinabile: chiunque
potrebbe scorrere i numeri e vedere dispositivo e stato di tutti i clienti. Per questo i
codici nuovi hanno tre caratteri casuali in coda — `#26-0007-K7M` — scelti fra lettere e
cifre non confondibili, così restano leggibili al telefono. I codici già emessi continuano a
funzionare: la ricerca ignora spazi, trattini e maiuscole.

**Sulle chiavi.** `VITE_SUPABASE_URL` e la chiave *anon* non sono segreti: finiscono nel
codice di qualunque sito che usi Supabase e da sole non aprono niente, perché i permessi li
decide il database. La chiave `service_role`, invece, è segreta e non va mai messa nel
progetto né su Vercel come variabile `VITE_*`.

## Struttura del progetto

```
public/
  marchio/        logo ufficiale (PNG), versione su fondo scuro, icone e immagine social
  robots.txt      sitemap.xml  site.webmanifest
scripts/
  genera-sitemap.mjs   sitemap XML generata dalle rotte e dagli articoli
src/
  sito/           sito pubblico
    sito.css      sistema di design: colori, tipografia, componenti, animazioni
    SitoLayout    intestazione, piè di pagina, pannelli, pulsanti flottanti
    dati/         contenuti e recapiti (unica fonte)
    componenti/   marchio, icone, illustrazioni, galleria, recensioni, FAQ, scheda pratica…
    pagine/       una pagina per rotta
    lib/          SEO, hook (rivela allo scorrimento, contatori), formattazione
  components/     gestionale: layout, elementi di interfaccia, stampe, grafici
  pages/          gestionale: una cartella per area funzionale
  data/           archivio dimostrativo, contesto con le operazioni CRUD, metriche
  lib/            formattazione italiana, calcoli IVA, stati, esportazioni
  types/          modelli di dominio condivisi
```

## Identità grafica

Il marchio usato ovunque è il **file originale fornito dall'azienda**:

| File | Uso |
| --- | --- |
| `public/marchio/io-riparo-logo.png` | originale ricevuto, conservato intatto |
| `public/marchio/logo.png` | stesso file senza margine trasparente, per fondi chiari |
| `public/marchio/logo-chiaro.png` | lettering schiarito, per fondi scuri e gestionale |
| `public/marchio/simbolo.png` | solo la parte grafica, base delle icone |
| `public/marchio/icona-*.png` | favicon e icone app generate dal simbolo originale |
| `public/marchio/social.png` | immagine per le condivisioni |

Il passaggio tra la versione chiara e quella scura avviene via CSS (`.marchio--scuro` /
`.marchio--chiaro`): nessun ridisegno, nessuna reinterpretazione del marchio.

Palette del sito: nero con dominante blu (`#05070c`), blu elettrico (`#2563eb`), bianco e
grigio chiaro; tipografia di sistema (SF Pro Display / Segoe UI / Inter) con monospace per
codici pratica e dati tecnici.

## Moduli e invio e-mail

Il sito è statico: non c'è backend e nessuna richiesta resta nel browser. I moduli
**Contatti**, **Preventivo**, **Prenotazione** e **Newsletter** passano tutti da
`src/sito/lib/moduli.ts` e recapitano a `ioriparotortoli@gmail.com` in due modi:

1. **Formspree** (modalità attiva) — le richieste partono in JSON verso
   `https://formspree.io/f/mpqvknlr`, il modulo di Io Riparo, che recapita a
   ioriparotortoli@gmail.com. L'endpoint sta in `src/sito/lib/moduli.ts`: non è
   un segreto — l'indirizzo di un modulo Formspree finisce nel codice di ogni
   sito che lo usa — ed è lì perché il sito funzioni da qualunque hosting senza
   configurare variabili d'ambiente. Si può scavalcare con
   `VITE_MODULI_ENDPOINT` (valgono anche Web3Forms, Getform e Basin, più
   `VITE_MODULI_CHIAVE` dove serve una chiave).
2. **Client di posta** — ripiego che entra in funzione solo svuotando
   l'endpoint: apre il programma di posta con destinatario, oggetto e testo già
   compilati. Utile in sviluppo, non è la modalità di produzione.

Con il servizio configurato la conferma di successo compare **solo** dopo una
risposta positiva: se l'invio fallisce il visitatore legge il motivo e i recapiti
alternativi, mai un falso "inviato". I casi gestiti:

| Risposta | Cosa vede il visitatore |
| --- | --- |
| `200` | conferma di avvenuto invio |
| `400` / `422` | dati rifiutati, con il dettaglio riportato da Formspree |
| `429` | troppe richieste, riprovare più tardi o telefonare |
| `403` / `404` | modulo non disponibile, con WhatsApp e telefono |
| rete assente | invito a ricontrollare la connessione, con i recapiti |

I moduli hanno un campo esca invisibile e un tempo minimo di compilazione come
filtro anti-robot, senza CAPTCHA.

L'indirizzo di risposta viene incluso solo quando il visitatore ne ha lasciato uno
valido: nella prenotazione l'e-mail è facoltativa e la richiesta parte comunque con
il numero di telefono, senza indirizzi inventati che i servizi scarterebbero.

## Dati dell'attività

Nome, indirizzo, telefono, WhatsApp, e-mail e partita IVA stanno **in un solo punto**
(`src/sito/dati/azienda.ts`) e da lì alimentano intestazione, contatti, piè di pagina,
informative, dati strutturati e pulsanti "Chiama ora" e WhatsApp.

| Dato | Valore |
| --- | --- |
| Attività | Io Riparo |
| Sede | Via Campidano 7, 08048 Tortolì (NU) |
| Telefono | 0782 208901 |
| WhatsApp | +39 338 435 6603 |
| E-mail | ioriparotortoli@gmail.com |
| Partita IVA | 01625710916 |

## Convenzioni

- Interfaccia, nomi di dominio e commenti in italiano.
- I prezzi di riparazioni, preventivi e fatture sono **IVA inclusa**: l'imposta viene scorporata
  in fase di visualizzazione (`src/lib/calcoli.ts`).
- Gli stati delle riparazioni e i relativi colori sono definiti una sola volta in
  `src/lib/stati.ts`; il sito li traduce in linguaggio per il cliente in `SchedaPratica`.
- Gli stili del sito valgono solo dove il layout pubblico è montato (`body[data-sito]`,
  `#app`, `#layers`): il gestionale continua a usare esclusivamente Tailwind.
- Le animazioni rispettano `prefers-reduced-motion`.

## Da completare prima della pubblicazione

- **Fotografie reali**: le illustrazioni vettoriali di galleria, servizi e blog vanno
  sostituite con foto del laboratorio e degli impianti (formato WebP/AVIF, `loading="lazy"`).
- **Profili social**: `social.facebook` e `social.instagram` in `src/sito/dati/azienda.ts` sono
  vuoti, quindi le due icone non compaiono nel piè di pagina. Basta incollare l'indirizzo del
  profilo perché l'icona torni visibile e finisca anche nei dati strutturati (`sameAs`).
- **Archivio online**: finché `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` non sono
  impostate, tracking e area clienti leggono l'archivio locale del browser, cioè dati di
  esempio. Il sito è pubblicabile così com'è, ma la pagina «Stato riparazione» diventa utile
  solo con il collegamento a Supabase (vedi sopra).
- **Dominio**: `SITO_URL` (`src/sito/lib/seo.ts` e `scripts/genera-sitemap.mjs`) vale
  `https://ioriparotortoli.it`, senza `www`. Su Vercel va impostato lo stesso
  indirizzo come dominio principale, con `www.ioriparotortoli.it` che vi rimanda:
  canonical, sitemap, robots.txt e Open Graph devono puntare all'indirizzo
  realmente servito, altrimenti Google riceve segnali contraddittori.

## Pubblicazione su Vercel

`vercel.json` è già nel repository e contiene tutto il necessario:

- **riscrittura per il routing lato client** (`/(.*)` → `/index.html`): senza di essa
  ogni indirizzo diverso dalla home (`/contatti`, `/servizi/...`) restituisce 404 se
  aperto direttamente, ricaricato o raggiunto da un motore di ricerca. Non servono
  esclusioni per `assets/`, `marchio/`, `sitemap.xml`, `robots.txt` e
  `site.webmanifest`: Vercel serve prima i file che esistono davvero e applica la
  riscrittura solo dopo. Attenzione a non complicare il pattern — `source` non accetta
  espressioni regolari arbitrarie e una regola che non viene interpretata fa cadere
  tutto il sito sulla 404 di Vercel;
- **cache**: un anno sugli asset con nome contenente l'hash, una settimana sul marchio;
- **intestazioni di sicurezza**: `X-Content-Type-Options`, `Referrer-Policy`,
  `X-Frame-Options`, `Permissions-Policy`.

Su Vercel bastano le impostazioni predefinite (`npm run build` → `dist`). L'endpoint dei
moduli è nel codice, quindi il sito funziona senza configurare nulla; per l'archivio online
vanno aggiunte in **Settings → Environment Variables** `VITE_SUPABASE_URL`,
`VITE_SUPABASE_ANON_KEY` e, se si vuole il gestionale sullo stesso indirizzo,
`VITE_GESTIONALE=1`. Le variabili sono lette in compilazione: dopo averle aggiunte serve un
nuovo deploy perché abbiano effetto.
