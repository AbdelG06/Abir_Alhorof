create extension if not exists pgcrypto;

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  nom text not null,
  prenom text not null,
  sexe text not null,
  sexe_label text not null,
  email text not null,
  phone text not null,
  address text default '',
  reserved_at text not null,
  event_name text not null,
  language text not null default 'fr',
  created_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists reservations_email_unique
  on public.reservations (lower(email));

create unique index if not exists reservations_phone_unique
  on public.reservations (phone);

alter table public.reservations enable row level security;

drop policy if exists "Public can read reservation records" on public.reservations;
create policy "Public can read reservation records"
on public.reservations
for select
to anon
using (true);

drop policy if exists "Public can insert reservations" on public.reservations;
create policy "Public can insert reservations"
on public.reservations
for insert
to anon
with check (true);

create table if not exists public.site (
  id uuid primary key default gen_random_uuid(),
  visitor_key text not null,
  page_path text not null,
  page_title text not null,
  language text not null default 'fr',
  referrer text default '',
  user_agent text default '',
  source text default 'website',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_created_at_idx
  on public.site (created_at desc);

create index if not exists site_visitor_key_idx
  on public.site (visitor_key);

alter table public.site enable row level security;

drop policy if exists "Public can read site visits (site)" on public.site;
create policy "Public can read site visits (site)"
on public.site
for select
to anon
using (true);

drop policy if exists "Public can insert site visits (site)" on public.site;
create policy "Public can insert site visits (site)"
on public.site
for insert
to anon
with check (true);

do $$
begin
  if to_regclass('public.site_visits') is not null then
    insert into public.site (
      id,
      visitor_key,
      page_path,
      page_title,
      language,
      referrer,
      user_agent,
      source,
      created_at
    )
    select
      id,
      visitor_key,
      page_path,
      page_title,
      language,
      referrer,
      user_agent,
      source,
      created_at
    from public.site_visits
    on conflict (id) do nothing;
  end if;
end $$;

create table if not exists public.site_visits (
  id uuid primary key default gen_random_uuid(),
  visitor_key text not null,
  page_path text not null,
  page_title text not null,
  language text not null default 'fr',
  referrer text default '',
  user_agent text default '',
  source text default 'website',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists site_visits_created_at_idx
  on public.site_visits (created_at desc);

create index if not exists site_visits_visitor_key_idx
  on public.site_visits (visitor_key);

alter table public.site_visits enable row level security;

drop policy if exists "Public can read site visits" on public.site_visits;
create policy "Public can read site visits"
on public.site_visits
for select
to anon
using (true);

drop policy if exists "Public can insert site visits" on public.site_visits;
create policy "Public can insert site visits"
on public.site_visits
for insert
to anon
with check (true);

create table if not exists public.join_messages (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text,
  language text not null default 'fr',
  source text default 'join-form',
  page_path text default '',
  user_agent text default '',
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists join_messages_created_at_idx
  on public.join_messages (created_at desc);

alter table public.join_messages enable row level security;

drop policy if exists "Public can read join messages" on public.join_messages;
create policy "Public can read join messages"
on public.join_messages
for select
to anon
using (true);

drop policy if exists "Public can insert join messages" on public.join_messages;
create policy "Public can insert join messages"
on public.join_messages
for insert
to anon
with check (true);

alter table public.reservations
  add column if not exists presence_status text not null default 'unknown';

alter table public.reservations
  add column if not exists presence_checked_at timestamptz;

create index if not exists reservations_presence_status_idx
  on public.reservations (presence_status);

drop policy if exists "Public can update reservation attendance" on public.reservations;
create policy "Public can update reservation attendance"
on public.reservations
for update
to anon
using (true)
with check (true);
