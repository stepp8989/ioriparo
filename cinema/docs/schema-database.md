# Schema del database

La piattaforma conserva i dati in una sola tabella `archivio`, con una riga per
collezione e il contenuto in una colonna `jsonb` (vedi `src/lib/deposito/postgres.ts`).
È una scelta adatta alla fase attuale — un solo schema da mantenere, quello in
`src/lib/tipi.ts` — e ha un limite preciso: il database non impone vincoli fra
collezioni e non permette di interrogare un singolo campo.

Questo documento è lo schema relazionale corrispondente, da usare quando si
normalizza. Non serve farlo tutto insieme: le tabelle si possono estrarre una
alla volta, tenendo il resto in `jsonb`.

## Quando normalizzare, e in quale ordine

1. **`prenotazioni` e `posti_prenotati`.** Sono le prime a crescere senza
   limite, e sono quelle su cui si interroga di più (per codice, per cliente,
   per spettacolo, per data). Finché stanno in `jsonb`, ogni verifica di
   disponibilità carica in memoria tutte le prenotazioni mai fatte.
2. **`spettacoli`.** Un palinsesto di un anno su una rete di venti sale sono
   decine di migliaia di righe, rilette a ogni pagina.
3. **`clienti` e `movimenti_punti`.** Diventano importanti quando gli account
   passano le poche migliaia.
4. Il resto — film, cinema, sale, listini, promozioni — può restare in `jsonb`
   a lungo: sono decine di righe, lette per intero a ogni utilizzo.

## Tabelle

```sql
-- ── Anagrafiche ────────────────────────────────────────────────────────────

create table film (
  id                text primary key,
  slug              text unique not null,
  titolo            text not null,
  titolo_originale  text not null default '',
  sottotitolo       text not null default '',
  sinossi           text not null default '',
  trama             text not null default '',
  durata_minuti     integer not null check (durata_minuti > 0),
  anno              integer not null,
  classificazione   text not null check (classificazione in ('T','VM6','VM14','VM18')),
  lingua            text not null default 'Italiano',
  paese             text not null default '',
  regista           text not null default '',
  locandina         text not null default '',
  backdrop          text not null default '',
  palette           text[] not null default '{}',
  valutazione       numeric(3,1) not null default 0 check (valutazione between 0 and 10),
  stato             text not null check (stato in ('in-sala','prossimamente','archivio')),
  data_uscita       date,
  in_evidenza       boolean not null default false,
  visibile          boolean not null default true,
  creato_il         timestamptz not null default now()
);

create index film_stato_idx on film (stato, data_uscita desc) where visibile;

-- Generi e cast come tabelle a parte: servono a cercare «tutti i film di» e
-- «tutti i film con», che su un array dentro jsonb non si fa senza scorrere
-- l'intero catalogo.
create table generi (
  id    serial primary key,
  nome  text unique not null
);

create table film_generi (
  film_id   text references film(id) on delete cascade,
  genere_id integer references generi(id) on delete cascade,
  primary key (film_id, genere_id)
);

create table persone (
  id    text primary key,
  nome  text not null
);

create table film_cast (
  film_id   text references film(id) on delete cascade,
  persona_id text references persone(id) on delete cascade,
  ruolo     text not null default '',
  -- 'regia' oppure 'interprete'
  mansione  text not null,
  ordine    integer not null default 0,
  primary key (film_id, persona_id, mansione)
);

create table film_formati (
  film_id text references film(id) on delete cascade,
  formato text not null,
  primary key (film_id, formato)
);

create table trailer (
  film_id        text primary key references film(id) on delete cascade,
  piattaforma    text not null check (piattaforma in ('youtube','vimeo','file')),
  riferimento    text not null,
  durata_secondi integer not null default 0
);

-- ── Strutture ──────────────────────────────────────────────────────────────

create table cinema (
  id          text primary key,
  slug        text unique not null,
  nome        text not null,
  descrizione text not null default '',
  indirizzo   text not null default '',
  citta       text not null,
  cap         text not null default '',
  provincia   text not null default '',
  telefono    text not null default '',
  email       text not null default '',
  -- Con PostGIS diventerebbe `geography(point)` e la ricerca per distanza
  -- passerebbe da un indice spaziale invece che da un calcolo in memoria.
  latitudine  numeric(9,6),
  longitudine numeric(9,6),
  immagine    text not null default '',
  palette     text[] not null default '{}',
  visibile    boolean not null default true,
  creato_il   timestamptz not null default now()
);

create table cinema_servizi (
  cinema_id text references cinema(id) on delete cascade,
  servizio  text not null,
  primary key (cinema_id, servizio)
);

create table cinema_orari (
  cinema_id text references cinema(id) on delete cascade,
  giorno    smallint not null check (giorno between 0 and 6),
  apertura  time not null,
  chiusura  time not null,
  chiuso    boolean not null default false,
  primary key (cinema_id, giorno)
);

create table sale (
  id          text primary key,
  cinema_id   text not null references cinema(id) on delete restrict,
  nome        text not null,
  supplemento numeric(6,2) not null default 0 check (supplemento >= 0),
  schermo     text not null default 'alto',
  attiva      boolean not null default true,
  creata_il   timestamptz not null default now()
);

create table sala_formati (
  sala_id text references sale(id) on delete cascade,
  formato text not null,
  primary key (sala_id, formato)
);

-- Una riga per poltrona. È la tabella che permette di rispondere «il posto F8
-- di questa sala esiste ed è di che tipo» senza caricare la pianta intera.
create table posti (
  id       bigserial primary key,
  sala_id  text not null references sale(id) on delete cascade,
  fila     text not null,
  numero   integer not null,
  -- 'vuoto' non compare qui: i corridoi non sono poltrone. La posizione
  -- grafica si ricostruisce da `colonna`.
  tipo     text not null check (tipo in ('standard','premium','disabili','accompagnatore')),
  riga     integer not null,
  colonna  integer not null,
  unique (sala_id, fila, numero)
);

-- ── Programmazione ─────────────────────────────────────────────────────────

create table spettacoli (
  id          text primary key,
  film_id     text not null references film(id) on delete restrict,
  cinema_id   text not null references cinema(id) on delete restrict,
  sala_id     text not null references sale(id) on delete restrict,
  inizio      timestamptz not null,
  -- Fine calcolata: inizio + pubblicità + durata + pulizia. Conservarla
  -- permette di far rispettare al database il vincolo di non sovrapposizione.
  fine        timestamptz not null,
  formato     text not null,
  lingua      text not null default 'IT' check (lingua in ('IT','VO')),
  prezzo_base numeric(6,2) not null check (prezzo_base >= 0),
  stato       text not null default 'programmato' check (stato in ('programmato','annullato')),
  creato_il   timestamptz not null default now(),

  -- Il vincolo che regge tutta la sezione: in una sala non possono esserci due
  -- proiezioni sovrapposte. Con `btree_gist` lo impone il database, e non
  -- dipende più dal fatto che l'applicazione si ricordi di controllare.
  constraint spettacolo_coerente check (fine > inizio),
  exclude using gist (
    sala_id with =,
    tstzrange(inizio, fine) with &&
  ) where (stato = 'programmato')
);

create index spettacoli_cinema_idx on spettacoli (cinema_id, inizio);
create index spettacoli_film_idx on spettacoli (film_id, inizio);

create table tipologie_biglietto (
  id                 text primary key,
  nome               text not null,
  descrizione        text not null default '',
  variazione         numeric(6,2) not null default 0,
  richiede_documento boolean not null default false,
  massimo_per_ordine integer not null default 0,
  attiva             boolean not null default true,
  ordine             integer not null default 0
);

-- ── Clienti e fedeltà ──────────────────────────────────────────────────────

create table clienti (
  id                  text primary key,
  nome                text not null,
  cognome             text not null,
  email               citext unique not null,
  telefono            text not null default '',
  -- Impronta scrypt nella forma `scrypt$sale$derivata`. La password in chiaro
  -- non esiste in nessun punto del sistema.
  password            text not null,
  data_nascita        date,
  cinema_preferito_id text references cinema(id) on delete set null,
  pref_email          boolean not null default true,
  pref_push           boolean not null default false,
  pref_sms            boolean not null default false,
  punti               integer not null default 0 check (punti >= 0),
  punti_storici       integer not null default 0,
  livello_id          text references livelli_loyalty(id) on delete set null,
  creato_il           timestamptz not null default now(),
  ultimo_accesso      timestamptz,
  attivo              boolean not null default true
);

create table clienti_preferiti (
  cliente_id text references clienti(id) on delete cascade,
  film_id    text references film(id) on delete cascade,
  primary key (cliente_id, film_id)
);

create table livelli_loyalty (
  id             text primary key,
  nome           text not null,
  punti_minimi   integer not null default 0,
  colore         text not null default '#888888',
  moltiplicatore numeric(4,2) not null default 1 check (moltiplicatore >= 1),
  ordine         integer not null default 0
);

create table premi_loyalty (
  id              text primary key,
  nome            text not null,
  descrizione     text not null default '',
  punti_richiesti integer not null check (punti_richiesti > 0),
  tipo            text not null check (tipo in ('biglietto','food','sconto','upgrade')),
  valore          numeric(8,2) not null default 0,
  attivo          boolean not null default true
);

create table movimenti_punti (
  id          bigserial primary key,
  cliente_id  text not null references clienti(id) on delete cascade,
  tipo        text not null check (tipo in ('accredito','riscatto','rettifica','scadenza')),
  punti       integer not null,
  motivo      text not null,
  riferimento text not null default '',
  creato_il   timestamptz not null default now()
);

create index movimenti_cliente_idx on movimenti_punti (cliente_id, creato_il desc);

-- ── Abbonamenti ────────────────────────────────────────────────────────────

create table piani_abbonamento (
  id                text primary key,
  slug              text unique not null,
  nome              text not null,
  descrizione       text not null default '',
  prezzo            numeric(8,2) not null check (prezzo >= 0),
  periodo           text not null check (periodo in ('mensile','annuale')),
  ingressi_inclusi  integer not null default 0,
  sconto_food       numeric(5,2) not null default 0,
  colore            text not null default '#888888',
  attivo            boolean not null default true,
  in_evidenza       boolean not null default false,
  ordine            integer not null default 0
);

create table sottoscrizioni (
  id                 text primary key,
  cliente_id         text not null references clienti(id) on delete cascade,
  piano_id           text not null references piani_abbonamento(id) on delete restrict,
  stato              text not null check (stato in ('attiva','sospesa','scaduta','annullata')),
  dal                date not null,
  al                 date not null,
  ingressi_usati     integer not null default 0,
  rinnovo_automatico boolean not null default true,
  creata_il          timestamptz not null default now(),
  -- Un cliente non può avere due abbonamenti attivi contemporaneamente.
  constraint periodo_coerente check (al >= dal)
);

create unique index sottoscrizione_attiva_unica
  on sottoscrizioni (cliente_id) where stato = 'attiva';

-- ── Promozioni, coupon, gift card ──────────────────────────────────────────

create table promozioni (
  id                 text primary key,
  slug               text unique not null,
  titolo             text not null,
  sottotitolo        text not null default '',
  descrizione        text not null default '',
  tipo               text not null,
  valore             numeric(8,2) not null default 0,
  -- Vuoto = promozione automatica. L'unicità vale solo sui codici non vuoti.
  codice             text not null default '',
  dal                date not null,
  al                 date not null,
  ora_da             time,
  ora_a              time,
  limite_utilizzi    integer not null default 0,
  limite_per_cliente integer not null default 0,
  utilizzi           integer not null default 0,
  solo_abbonati      boolean not null default false,
  attiva             boolean not null default true,
  in_evidenza        boolean not null default false,
  creata_il          timestamptz not null default now()
);

create unique index promozione_codice_unico
  on promozioni (upper(codice)) where codice <> '';

create table promozione_giorni (
  promozione_id text references promozioni(id) on delete cascade,
  giorno        smallint not null check (giorno between 0 and 6),
  primary key (promozione_id, giorno)
);

create table promozione_cinema (
  promozione_id text references promozioni(id) on delete cascade,
  cinema_id     text references cinema(id) on delete cascade,
  primary key (promozione_id, cinema_id)
);

create table promozione_film (
  promozione_id text references promozioni(id) on delete cascade,
  film_id       text references film(id) on delete cascade,
  primary key (promozione_id, film_id)
);

create table coupon (
  id              text primary key,
  codice          text not null,
  promozione_id   text references promozioni(id) on delete set null,
  descrizione     text not null default '',
  tipo            text not null check (tipo in ('percentuale','fisso')),
  valore          numeric(8,2) not null check (valore >= 0),
  cliente_id      text references clienti(id) on delete cascade,
  scadenza        date,
  usato           boolean not null default false,
  usato_il        timestamptz,
  prenotazione_id text,
  creato_il       timestamptz not null default now()
);

create unique index coupon_codice_unico on coupon (upper(codice));

create table gift_card (
  id               text primary key,
  codice           text not null,
  valore_iniziale  numeric(8,2) not null check (valore_iniziale > 0),
  saldo            numeric(8,2) not null check (saldo >= 0),
  mittente_nome    text not null default '',
  mittente_email   citext,
  destinatario_nome  text not null default '',
  destinatario_email citext,
  messaggio        text not null default '',
  data_invio       date not null,
  stato            text not null check (stato in ('programmata','attiva','esaurita','annullata')),
  creata_il        timestamptz not null default now(),
  constraint saldo_coerente check (saldo <= valore_iniziale)
);

create unique index gift_card_codice_unico on gift_card (upper(codice));

create table gift_card_movimenti (
  id              bigserial primary key,
  gift_card_id    text not null references gift_card(id) on delete cascade,
  importo         numeric(8,2) not null check (importo > 0),
  prenotazione_id text,
  creato_il       timestamptz not null default now()
);

-- ── Banco alimentari ───────────────────────────────────────────────────────

create table prodotti_food (
  id          text primary key,
  nome        text not null,
  descrizione text not null default '',
  categoria   text not null,
  prezzo      numeric(8,2) not null check (prezzo >= 0),
  immagine    text not null default '',
  palette     text[] not null default '{}',
  allergeni   text[] not null default '{}',
  contenuto   text[] not null default '{}',
  disponibile boolean not null default true,
  in_evidenza boolean not null default false,
  ordine      integer not null default 0
);

create table food_cinema (
  prodotto_id text references prodotti_food(id) on delete cascade,
  cinema_id   text references cinema(id) on delete cascade,
  primary key (prodotto_id, cinema_id)
);

-- ── Prenotazioni ───────────────────────────────────────────────────────────

create table prenotazioni (
  id                 text primary key,
  codice             text not null,
  cliente_id         text references clienti(id) on delete set null,
  -- Recapiti dell'acquisto senza registrazione. Vengono azzerati quando un
  -- cliente chiede la cancellazione: la prenotazione resta come documento
  -- fiscale, senza più riferimenti alla persona.
  ospite_nome        text,
  ospite_email       citext,
  ospite_telefono    text,
  spettacolo_id      text not null references spettacoli(id) on delete restrict,
  -- Copie di comodo: il biglietto resta leggibile anche se lo spettacolo
  -- viene poi cancellato dal palinsesto.
  film_id            text not null references film(id) on delete restrict,
  cinema_id          text not null references cinema(id) on delete restrict,
  sala_id            text not null references sale(id) on delete restrict,
  inizio             timestamptz not null,
  importo_biglietti  numeric(10,2) not null default 0,
  importo_food       numeric(10,2) not null default 0,
  sconto             numeric(10,2) not null default 0,
  commissioni        numeric(10,2) not null default 0,
  totale             numeric(10,2) not null check (totale >= 0),
  promo_codice       text,
  gift_card_codice   text,
  punti_usati        integer not null default 0,
  punti_accreditati  integer not null default 0,
  stato              text not null check (stato in ('in-attesa','confermata','annullata','rimborsata','utilizzata')),
  scadenza_blocco    timestamptz not null,
  creata_il          timestamptz not null default now(),
  aggiornata_il      timestamptz not null default now()
);

create unique index prenotazione_codice_unico on prenotazioni (upper(codice));
create index prenotazioni_spettacolo_idx on prenotazioni (spettacolo_id) where stato <> 'annullata';
create index prenotazioni_cliente_idx on prenotazioni (cliente_id, inizio desc);

-- Un posto venduto: è l'unità che diventa un biglietto con il proprio QR.
create table posti_prenotati (
  id               bigserial primary key,
  prenotazione_id  text not null references prenotazioni(id) on delete cascade,
  spettacolo_id    text not null references spettacoli(id) on delete restrict,
  fila             text not null,
  numero           integer not null,
  tipo_posto       text not null,
  tipologia_id     text references tipologie_biglietto(id) on delete set null,
  tipologia_nome   text not null,
  prezzo           numeric(8,2) not null check (prezzo >= 0),
  codice_biglietto text not null,
  utilizzato_il    timestamptz,

  -- Il vincolo che impedisce la doppia vendita. Nella versione a documenti
  -- questa garanzia è data dalla coda delle scritture in `lib/archivio.ts`, che
  -- vale per un solo processo: qui la dà il database, e vale sempre.
  unique (spettacolo_id, fila, numero)
);

create unique index biglietto_codice_unico on posti_prenotati (codice_biglietto);

create table righe_food (
  id              bigserial primary key,
  prenotazione_id text not null references prenotazioni(id) on delete cascade,
  prodotto_id     text references prodotti_food(id) on delete set null,
  nome            text not null,
  quantita        integer not null check (quantita > 0),
  prezzo_unitario numeric(8,2) not null check (prezzo_unitario >= 0)
);

create table pagamenti (
  id              bigserial primary key,
  prenotazione_id text not null references prenotazioni(id) on delete cascade,
  metodo          text not null,
  stato           text not null check (stato in ('in-attesa','riuscito','fallito','rimborsato')),
  -- Identificativo presso il fornitore. Non contiene mai dati della carta.
  riferimento     text not null default '',
  importo         numeric(10,2) not null,
  creato_il       timestamptz not null default now()
);

-- ── Servizio ───────────────────────────────────────────────────────────────

create table notifiche (
  id               bigserial primary key,
  cliente_id       text references clienti(id) on delete cascade,
  canale           text not null check (canale in ('email','push','sms')),
  tipo             text not null,
  titolo           text not null,
  testo            text not null,
  riferimento      text not null default '',
  stato            text not null default 'in-coda' check (stato in ('in-coda','inviata','errore')),
  programmata_per  timestamptz not null,
  inviata_il       timestamptz,
  creata_il        timestamptz not null default now()
);

create index notifiche_coda_idx on notifiche (programmata_per) where stato = 'in-coda';

create table registro (
  id        bigserial primary key,
  quando    timestamptz not null default now(),
  attore    text not null,
  azione    text not null,
  oggetto   text not null default '',
  dettaglio text not null default ''
);

create index registro_quando_idx on registro (quando desc);

-- Le impostazioni restano una riga sola: sono una configurazione, non dati.
create table impostazioni (
  id        boolean primary key default true check (id),
  contenuto jsonb not null,
  aggiornate_il timestamptz not null default now()
);
```

## Due vincoli che vale la pena spostare sul database

Nella versione a documenti sono garantiti dall'applicazione. Normalizzando
diventano vincoli veri, e questo è il vero guadagno della migrazione — non la
velocità.

**Doppia vendita dello stesso posto.** `unique (spettacolo_id, fila, numero)`
su `posti_prenotati`. Oggi la garanzia viene dalla coda di scrittura in
`lib/archivio.ts`, che serializza le modifiche: funziona finché il processo è
uno solo. Con due istanze dietro un bilanciatore la coda non basta più, e senza
il vincolo sul database due clienti possono comprare la stessa poltrona.

**Sovrapposizione di due proiezioni nella stessa sala.** Il vincolo `exclude
using gist` su `spettacoli` lo rende impossibile. Richiede
`create extension btree_gist`.

## Nota sulle estensioni

`citext` serve per gli indirizzi email, che vanno confrontati senza distinzione
fra maiuscole e minuscole. `btree_gist` serve al vincolo di non sovrapposizione.
Entrambe sono disponibili su tutte le piattaforme gestite di uso comune:

```sql
create extension if not exists citext;
create extension if not exists btree_gist;
```
