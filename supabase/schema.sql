-- ============================================================
--  IO RIPARO — archivio online
--  Da eseguire una sola volta nell'editor SQL di Supabase.
-- ============================================================
--
--  Regola di fondo: il gestionale (personale autenticato) vede e modifica
--  tutto; il sito pubblico non tocca nessuna tabella e legge soltanto lo
--  stato di una riparazione, tramite la funzione `stato_riparazione`, che
--  restituisce esclusivamente dati non personali. Nome, telefono e
--  indirizzo del cliente non escono mai da qui.
--
--  Ogni riga conserva la scheda completa in `dati` (JSON), nella stessa
--  forma che usa l'applicazione. Le poche colonne separate servono a
--  cercare e a collegare: così il gestionale non deve tradurre nulla e non
--  esiste una classe di errori dovuta a campi tradotti male.

begin;

create table if not exists clienti (
  id        text primary key,
  dati      jsonb not null,
  creato_il timestamptz not null default now()
);

create table if not exists riparazioni (
  id         text primary key,
  codice     text not null unique,
  cliente_id text,
  dati       jsonb not null,
  creato_il  timestamptz not null default now()
);

create table if not exists preventivi (
  id text primary key, numero text not null, dati jsonb not null,
  creato_il timestamptz not null default now()
);
create table if not exists fatture (
  id text primary key, numero text not null, dati jsonb not null,
  creato_il timestamptz not null default now()
);
create table if not exists magazzino (
  id text primary key, codice text not null, dati jsonb not null,
  creato_il timestamptz not null default now()
);
create table if not exists ordini (
  id text primary key, numero text not null, dati jsonb not null,
  creato_il timestamptz not null default now()
);
create table if not exists scadenze (
  id text primary key, dati jsonb not null,
  creato_il timestamptz not null default now()
);
create table if not exists impianti (
  id text primary key, dati jsonb not null,
  creato_il timestamptz not null default now()
);

-- Riga unica: dati dell'attività e profilo di chi lavora.
create table if not exists impostazioni (
  id      int primary key default 1 check (id = 1),
  azienda jsonb not null default '{}'::jsonb,
  utente  jsonb not null default '{}'::jsonb
);
insert into impostazioni (id) values (1) on conflict (id) do nothing;

-- Richieste in arrivo dal sito: preventivi, appuntamenti, messaggi.
create table if not exists richieste (
  id          uuid primary key default gen_random_uuid(),
  tipo        text not null,
  nome        text not null default '',
  telefono    text not null default '',
  email       text,
  dati        jsonb not null default '{}'::jsonb,
  letta       boolean not null default false,
  ricevuta_il timestamptz not null default now()
);

create index if not exists riparazioni_codice_idx
  on riparazioni (regexp_replace(upper(codice), '[^0-9A-Z]', '', 'g'));
create index if not exists riparazioni_cliente_idx on riparazioni (cliente_id);
create index if not exists richieste_data_idx on richieste (ricevuta_il desc);

-- ── Permessi ─────────────────────────────────────────────────
-- Attivare RLS senza regole significa: nessuno accede. Poi si concede
-- l'accesso completo al solo personale autenticato.

do $$
declare t text;
begin
  foreach t in array array['clienti','riparazioni','preventivi','fatture',
                           'magazzino','ordini','scadenze','impianti',
                           'impostazioni','richieste']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists "personale" on %I', t);
    execute format($f$create policy "personale" on %I
        for all to authenticated using (true) with check (true)$f$, t);
  end loop;
end $$;

-- Dal sito pubblico si può solo depositare una richiesta di contatto.
drop policy if exists "il sito deposita richieste" on richieste;
create policy "il sito deposita richieste" on richieste
  for insert to anon with check (true);

-- ── Stato riparazione per il cliente ─────────────────────────
-- Unica finestra aperta al pubblico. Restituisce solo ciò che serve a chi
-- aspetta il proprio dispositivo: nessun nome, nessun recapito, nessun prezzo.

create or replace function stato_riparazione(codice_cercato text)
returns table (
  codice            text,
  dispositivo       text,
  tipo_dispositivo  text,
  stato             text,
  data_accettazione date,
  data_prevista     date,
  data_consegna     date
)
language sql
security definer
set search_path = public
stable
as $$
  select r.codice,
         trim(concat_ws(' ', r.dati->>'marca', r.dati->>'modello')),
         coalesce(r.dati->>'tipoDispositivo', 'altro'),
         coalesce(r.dati->>'stato', 'in_attesa'),
         (r.dati->>'dataAccettazione')::date,
         nullif(r.dati->>'consegnaPrevista', '')::date,
         nullif(r.dati->>'dataConsegna', '')::date
  from riparazioni r
  -- Confronto tollerante: "#26-0001", "26-0001" e "260001" coincidono.
  where regexp_replace(upper(r.codice), '[^0-9A-Z]', '', 'g')
      = regexp_replace(upper(codice_cercato), '[^0-9A-Z]', '', 'g')
  limit 1;
$$;

revoke all on function stato_riparazione(text) from public;
grant execute on function stato_riparazione(text) to anon, authenticated;

commit;

-- ── Analytics del sito ───────────────────────────────────────
-- Una riga per pagina vista, depositata dal sito pubblico quando il
-- visitatore lascia la pagina. Nessun dato personale: niente indirizzi IP,
-- niente identificativi che durino oltre la sessione del browser.
--
-- `sessione` e' un numero casuale che vive in sessionStorage: serve solo a
-- cucire insieme le pagine di una stessa visita e sparisce chiudendo la
-- scheda. Non identifica una persona e non permette di riconoscerla domani.

create table if not exists visite (
  id           uuid primary key default gen_random_uuid(),
  sessione     text not null,
  -- Percorso della pagina, senza dominio e senza parametri di ricerca:
  -- nei parametri finiscono nomi e codici, qui non devono entrare.
  pagina       text not null,
  ingresso     boolean not null default false,
  -- Solo il nome del sito di provenienza (es. "google.com"), mai
  -- l'indirizzo completo: quello a volte contiene la ricerca fatta.
  provenienza  text,
  -- Etichetta di campagna, se il link era marcato (utm_source).
  campagna     text,
  dispositivo  text not null default 'sconosciuto',
  sistema      text,
  browser      text,
  -- Secondi passati sulla pagina e percentuale massima di scorrimento.
  secondi      int  not null default 0,
  scorrimento  int  not null default 0,
  -- Azioni compiute su questa pagina: telefono, whatsapp, email, moduli.
  azioni       text[] not null default '{}',
  vista_il     timestamptz not null default now()
);

create index if not exists visite_data_idx on visite (vista_il desc);
create index if not exists visite_sessione_idx on visite (sessione);
create index if not exists visite_pagina_idx on visite (pagina);

alter table visite enable row level security;

-- Il personale legge tutto.
drop policy if exists "personale legge le visite" on visite;
create policy "personale legge le visite" on visite
  for all to authenticated using (true) with check (true);

-- Il sito pubblico può solo depositare, mai rileggere: senza questa
-- distinzione chiunque potrebbe scaricarsi l'intero storico delle visite.
drop policy if exists "il sito deposita visite" on visite;
create policy "il sito deposita visite" on visite
  for insert to anon with check (
    length(sessione) between 8 and 40
    and length(pagina) <= 120
    and secondi between 0 and 7200
    and scorrimento between 0 and 100
    and coalesce(array_length(azioni, 1), 0) <= 20
  );
