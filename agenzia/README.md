# Orbita Studio — sito vetrina per chi realizza siti web

Sito di presentazione per un professionista o uno studio che progetta siti web
su misura per aziende, negozi, professionisti e attività commerciali.

È pensato per essere **la dimostrazione stessa del servizio**: chi lo apre
dovrebbe pensare «se questo è il sito con cui mi vende un sito, immagino cosa
può fare per la mia attività». Per questo è una pagina sola, molto curata, con
un portale che si apre all'ingresso, dieci anteprime di siti disegnate dal vivo,
un confronto prima/dopo trascinabile e un modulo di preventivo che funziona.

Applicazione **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4**.
Interfaccia e codice in italiano. **Nessuna dipendenza per le animazioni**: niente
librerie 3D, niente motori di scroll, niente pacchetti di icone — tutto è scritto
con canvas, CSS e SVG (il perché sta in [Come sono fatte le animazioni](#come-sono-fatte-le-animazioni)).

## Avvio rapido

```bash
npm install
cp .env.example .env.local     # facoltativo: il sito funziona senza
npm run dev                    # http://localhost:3000
```

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Sviluppo con ricaricamento immediato |
| `npm run build` | Compilazione di produzione |
| `npm start` | Avvio della build compilata |
| `npm run tipi` | Controllo dei tipi TypeScript |

## Le sezioni

| # | Sezione | Cosa fa |
| --- | --- | --- |
| 1 | Apertura | Buio, una particella che si accende, il portale che si apre in tre anelli, poi il titolo. Sfondo particellare interattivo, pulsanti magnetici |
| 2 | Non creo semplici siti web | La frase arriva in due tempi; tre oggetti sospesi che si inclinano seguendo il puntatore |
| 3 | Servizi | Otto schede che si voltano al passaggio del mouse, più il listino con tre prezzi di partenza |
| 4 | Dall'idea al sito | Sezione alta tre schermate con il contenuto fissato: idea → design → sviluppo → online, guidato dallo scorrimento |
| 5 | Portfolio | Dieci siti dentro dieci finestre di browser; la pagina scorre dentro la finestra mentre si scorre la sezione. Al clic si apre la scheda del progetto |
| 6 | Prima / dopo | Due siti sovrapposti e una linea da trascinare col mouse, col dito o con le frecce della tastiera |
| 7 | Perché scegliermi | Quattro grandezze che si animano quando entrano nello schermo |
| 8 | Il processo | Cinque fasi su una linea che si riempie mentre si legge |
| 9 | Chi sono | Presentazione, competenze e domande frequenti |
| 10 | Invito | Sfera luminosa, la domanda finale e il modulo di preventivo in una finestra |

Più il piè di pagina, la pagina `/privacy` e la pagina 404.

## Cosa cambiare per farlo proprio

Tutto quello che riguarda il marchio e i contenuti sta in `src/dati/`. Non serve
aprire nessun componente.

| File | Cosa contiene |
| --- | --- |
| `src/dati/agenzia.ts` | **Nome, motto, email, telefono, WhatsApp, social, partita IVA, sede, dominio, tempi di risposta e listino prezzi** |
| `src/dati/servizi.ts` | Le otto schede dei servizi, con i dettagli che compaiono al passaggio |
| `src/dati/portfolio.ts` | I dieci progetti: nome, categoria, racconto, funzioni, risultati, colori e struttura dell'anteprima |
| `src/dati/contenuti.ts` | I testi delle sezioni: pilastri, tappe, traguardi, fasi del processo, «chi sono», domande frequenti |
| `src/dati/navigazione.ts` | Le voci di menu |

Il **marchio** non è un file immagine ma un disegno vettoriale in
`src/componenti/layout/Marchio.tsx`: pesa poche centinaia di byte e resta nitido
ovunque. Per usare il proprio logo basta sostituire quel componente con un
`<Image>` — nient'altro nel progetto lo conosce. Stesso discorso per l'icona
(`src/app/icon.svg`) e per l'immagine di anteprima sui social, che viene
disegnata in fase di compilazione da `src/app/opengraph-image.tsx`.

I **colori** stanno tutti in cima a `src/app/globals.css`, dichiarati una volta
sola: cambiando `--blu` e `--viola` cambia l'intero sito, bagliori compresi.

### ⚠️ Prima di pubblicare

I dieci progetti in `src/dati/portfolio.ts` sono **inventati**, risultati
compresi. Vanno sostituiti con lavori veri o rimossi: numeri di crescita
attribuiti a clienti che non esistono sono pubblicità ingannevole, non un
esempio di stile. Lo stesso vale per i prezzi del listino e per la
[privacy policy](src/app/privacy/page.tsx), che descrive fedelmente ciò che
questo sito fa ma va riletta con i propri dati reali.

## Il modulo di preventivo

Il modulo invia a `POST /api/contatti`. La rotta, nell'ordine:

1. limita gli invii ravvicinati dallo stesso indirizzo (quattro ogni quindici minuti);
2. scarta i moduli compilati da un automatismo grazie a un campo esca nascosto;
3. ripulisce ogni testo e ne limita la lunghezza;
4. ripete i controlli già fatti dal browser, perché quelli non contano nulla per
   chi non usa il browser;
5. **registra la richiesta prima di inviare le email**, così un servizio di posta
   spento non fa perdere una richiesta.

Le richieste finiscono in un file di testo, una per riga
(`dati-locali/richieste.jsonl`), e le notifiche partono via
[Resend](https://resend.com) se è configurata la chiave. Senza chiave il sito
funziona lo stesso: la conferma appare a schermo e in console si legge il
messaggio che sarebbe partito.

Dove il disco non è scrivibile — le funzioni serverless di molte piattaforme —
la scrittura viene saltata e **la notifica per email diventa l'unico recapito**:
in quel caso configurare Resend non è facoltativo. Per la produzione si può
sostituire `registra` in `src/lib/archivio.ts` con la chiamata al proprio
database: nient'altro nel progetto conosce il formato.

## Configurazione

Tutte le variabili stanno in [`.env.example`](.env.example) e sono tutte
facoltative.

| Variabile | A cosa serve |
| --- | --- |
| `NEXT_PUBLIC_SITO` | Dominio pubblico, per canonical, sitemap e social |
| `RESEND_API_KEY` | Attiva l'invio delle email |
| `POSTA_MITTENTE` | Mittente verificato presso il servizio |
| `POSTA_DESTINATARIO` | Dove arrivano le richieste |
| `PERCORSO_RICHIESTE` | File in cui registrare le richieste |

## Come sono fatte le animazioni

Un sito che si vende come «veloce» non può pesare tre megabyte di librerie
grafiche. Perciò qui non ce n'è nessuna, e ogni effetto è costruito con lo
strumento più economico che sappia farlo:

* **Sfondo particellare** — un solo `canvas` per tutta la pagina, con la densità
  legata all'area dello schermo (26 punti su un telefono, mai più di 110 su un
  monitor grande), risoluzione limitata a 1,5×, e il ciclo che si ferma quando la
  scheda passa in secondo piano.
* **Comparse allo scorrimento** — un solo `IntersectionObserver` condiviso, che
  aggiunge una classe e smette di seguire l'elemento. Il movimento è tutto in
  CSS, dove lo compone il browser senza far lavorare il thread principale.
* **Parallasse e sezioni guidate dallo scorrimento** — un solo ascoltatore per
  tutta la pagina, con i calcoli raccolti in un `requestAnimationFrame`. Durante
  lo scorrimento si scrivono variabili CSS, non stato di React: un `setState` per
  fotogramma farebbe ricalcolare l'albero sessanta volte al secondo. Lo stato si
  muove solo quando cambia qualcosa di discreto, come la tappa attiva.
* **Elementi tridimensionali** — portale, sfera, schermi e carte che si inclinano
  sono prospettiva CSS e sfumature. La stessa scena in WebGL costerebbe centinaia
  di kilobyte e un ciclo di disegno acceso per tutta la visita.
* **Anteprime dei siti** — SVG composti dal codice a partire dai dati, resi sul
  server: nel pacchetto del browser non finisce niente, restano nitide a ogni
  ingrandimento e cambiarle è una riga di dati.

### Chi ha chiesto meno movimento

Con `prefers-reduced-motion: reduce` il sito diventa immobile ma resta completo:
le comparse sono immediate, i cicli infiniti si fermano, il campo particellare
disegna un solo fotogramma, la schermata d'apertura non compare e il cursore su
misura non viene nemmeno montato. Nessun contenuto sparisce, perché tutto quello
che si anima è già visibile da fermo.

Il cursore su misura, allo stesso modo, esiste solo dove esiste un puntatore
vero: su telefono e tablet resta quello di sistema.

## Accessibilità

* Tutto il testo è nel documento fin dall'inizio: le animazioni cambiano solo
  l'aspetto, quindi lettori di schermo e motori di ricerca trovano subito ogni
  parola.
* Le due finestre di dialogo (scheda progetto e modulo) chiudono con `Esc` e con
  il clic fuori, bloccano lo scorrimento sotto, spostano il fuoco all'apertura e
  lo restituiscono alla chiusura.
* Il confronto prima/dopo ha sotto un vero cursore di scorrimento: si usa con Tab
  e con le frecce.
* Le domande frequenti usano `<details>`, che funziona anche senza JavaScript.
* Dove il passaggio del mouse rivela del testo, su schermo tattile quel testo è
  già aperto o raggiungibile con un tocco: niente contenuti nascosti dietro un
  gesto che il dito non sa fare.
* Salto al contenuto, contrasti verificati, aree di tocco di almeno 44 pixel.

## SEO

* Metadati, Open Graph e canonical generati dai dati dell'agenzia.
* Dati strutturati `ProfessionalService` + `WebSite` + `FAQPage`, costruiti dagli
  stessi dati che alimentano le pagine — quindi non possono divergere dal
  contenuto visibile, cosa che Google penalizza.
* `sitemap.xml` e `robots.txt` generati.
* Immagine per i social disegnata in fase di compilazione.
* Nessuna richiesta a domini terzi: i caratteri sono serviti dal dominio, non ci
  sono fotografie remote né script esterni. Non servono banner dei cookie perché
  non ci sono cookie.

## Sicurezza

`next.config.ts` applica a tutte le pagine una `Content-Security-Policy` severa
(`default-src 'self'`, nessun dominio esterno ammesso) insieme alle intestazioni
abituali: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` e
`Permissions-Policy` con fotocamera, microfono e posizione disattivati.

## Pubblicazione

Il progetto è una normale applicazione Next.js e si pubblica ovunque sia
supportata. Su Vercel va indicata **`agenzia` come cartella radice**, perché
questo repository ne contiene diversi.

Prima di pubblicare vale la pena ricontrollare, in ordine: i dati in
`src/dati/agenzia.ts`, i progetti in `portfolio.ts`, i prezzi del listino, la
privacy policy e la variabile `NEXT_PUBLIC_SITO`.
