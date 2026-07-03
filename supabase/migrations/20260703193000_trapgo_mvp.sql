create extension if not exists "pgcrypto";

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact_name text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.traps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  code text not null unique,
  label text not null,
  location_description text,
  created_at timestamptz not null default now()
);

create table if not exists public.trap_checks (
  id uuid primary key default gen_random_uuid(),
  trap_id uuid not null references public.traps(id) on delete cascade,
  status text not null check (status in ('ok', 'activity', 'damaged', 'missing')),
  observations text,
  photo_path text,
  latitude double precision,
  longitude double precision,
  created_at timestamptz not null default now()
);

alter table public.clients enable row level security;
alter table public.traps enable row level security;
alter table public.trap_checks enable row level security;

create policy "mvp public read clients" on public.clients for select using (true);
create policy "mvp public insert clients" on public.clients for insert with check (true);
create policy "mvp public read traps" on public.traps for select using (true);
create policy "mvp public insert traps" on public.traps for insert with check (true);
create policy "mvp public read checks" on public.trap_checks for select using (true);
create policy "mvp public insert checks" on public.trap_checks for insert with check (true);

insert into storage.buckets (id, name, public)
values ('trap-photos', 'trap-photos', true)
on conflict (id) do nothing;

create policy "mvp public upload trap photos" on storage.objects
  for insert with check (bucket_id = 'trap-photos');

create policy "mvp public read trap photos" on storage.objects
  for select using (bucket_id = 'trap-photos');
