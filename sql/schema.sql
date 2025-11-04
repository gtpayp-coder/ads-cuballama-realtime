
create extension if not exists pgcrypto;
create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  fornitore text not null,
  nome text not null,
  prezzo_usd numeric(10,2) not null,
  tempi text,
  immagine_url text,
  source_url text,
  attivo boolean not null default true,
  ultimo_aggiornamento date not null default now(),
  created_at timestamp with time zone default now()
);
create table if not exists public.famiglie (
  id uuid primary key default gen_random_uuid(),
  codice text unique not null,
  zona text,
  descrizione text,
  stato text check (stato in ('In attesa','In consegna','Aiutata')) default 'In attesa',
  foto_url text,
  consenso boolean default false,
  created_at timestamp with time zone default now()
);
create table if not exists public.provider_offers (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  source_url text not null,
  title text not null,
  price_usd numeric(10,2),
  lead_time text,
  image_url text,
  area text,
  raw jsonb,
  fetched_at timestamptz default now()
);
alter publication supabase_realtime add table public.combos;
alter publication supabase_realtime add table public.famiglie;
