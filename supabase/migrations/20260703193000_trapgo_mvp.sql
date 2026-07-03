-- TrapGo MVP initial Supabase schema.
--
-- RLS note for MVP development:
-- The policies below intentionally allow any authenticated user to read and write the
-- operational tables and to read/upload files in the trap-evidence storage bucket.
-- This keeps early product development unblocked while authentication and role-based
-- access flows are still evolving. Before production, replace these policies with
-- role/client/site scoped rules (for example: admins can manage all data,
-- supervisors can manage assigned clients/sites, technicians can only see assigned
-- service orders and create their own trap checks).

create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'technician' check (role in ('admin', 'supervisor', 'technician')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  business_name text,
  contact_name text,
  contact_phone text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sites (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.zones (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.traps (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  zone_id uuid references public.zones(id) on delete set null,
  public_code text unique not null,
  name text not null,
  expected_location text,
  nfc_code text,
  qr_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'maintenance', 'missing')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  site_id uuid not null references public.sites(id) on delete cascade,
  technician_id uuid references public.profiles(id) on delete set null,
  scheduled_date date not null,
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.trap_checks (
  id uuid primary key default gen_random_uuid(),
  service_order_id uuid not null references public.service_orders(id) on delete cascade,
  trap_id uuid not null references public.traps(id) on delete cascade,
  technician_id uuid references public.profiles(id) on delete set null,
  checked_at timestamptz not null default now(),
  latitude numeric,
  longitude numeric,
  trap_status text not null,
  activity_level text,
  notes text,
  photo_url text,
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists sites_client_id_idx on public.sites(client_id);
create index if not exists zones_site_id_idx on public.zones(site_id);
create index if not exists traps_public_code_idx on public.traps(public_code);
create index if not exists traps_client_id_idx on public.traps(client_id);
create index if not exists traps_site_id_idx on public.traps(site_id);
create index if not exists traps_zone_id_idx on public.traps(zone_id);
create index if not exists service_orders_client_id_idx on public.service_orders(client_id);
create index if not exists service_orders_site_id_idx on public.service_orders(site_id);
create index if not exists service_orders_technician_id_idx on public.service_orders(technician_id);
create index if not exists service_orders_scheduled_date_idx on public.service_orders(scheduled_date);
create index if not exists trap_checks_service_order_id_idx on public.trap_checks(service_order_id);
create index if not exists trap_checks_trap_id_idx on public.trap_checks(trap_id);
create index if not exists trap_checks_technician_id_idx on public.trap_checks(technician_id);
create index if not exists trap_checks_checked_at_idx on public.trap_checks(checked_at);

create or replace trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create or replace trigger set_sites_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();

create or replace trigger set_zones_updated_at
  before update on public.zones
  for each row execute function public.set_updated_at();

create or replace trigger set_traps_updated_at
  before update on public.traps
  for each row execute function public.set_updated_at();

create or replace trigger set_service_orders_updated_at
  before update on public.service_orders
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.clients enable row level security;
alter table public.sites enable row level security;
alter table public.zones enable row level security;
alter table public.traps enable row level security;
alter table public.service_orders enable row level security;
alter table public.trap_checks enable row level security;

create policy "mvp authenticated read profiles" on public.profiles
  for select to authenticated using (true);
create policy "mvp users update own profile" on public.profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);
create policy "mvp users insert own profile" on public.profiles
  for insert to authenticated with check (auth.uid() = id);

create policy "mvp authenticated read clients" on public.clients
  for select to authenticated using (true);
create policy "mvp authenticated write clients" on public.clients
  for all to authenticated using (true) with check (true);

create policy "mvp authenticated read sites" on public.sites
  for select to authenticated using (true);
create policy "mvp authenticated write sites" on public.sites
  for all to authenticated using (true) with check (true);

create policy "mvp authenticated read zones" on public.zones
  for select to authenticated using (true);
create policy "mvp authenticated write zones" on public.zones
  for all to authenticated using (true) with check (true);

create policy "mvp authenticated read traps" on public.traps
  for select to authenticated using (true);
create policy "mvp authenticated write traps" on public.traps
  for all to authenticated using (true) with check (true);

create policy "mvp authenticated read service orders" on public.service_orders
  for select to authenticated using (true);
create policy "mvp authenticated write service orders" on public.service_orders
  for all to authenticated using (true) with check (true);

create policy "mvp authenticated read trap checks" on public.trap_checks
  for select to authenticated using (true);
create policy "mvp authenticated write trap checks" on public.trap_checks
  for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('trap-evidence', 'trap-evidence', false)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

create policy "mvp authenticated read trap evidence" on storage.objects
  for select to authenticated using (bucket_id = 'trap-evidence');

create policy "mvp authenticated upload trap evidence" on storage.objects
  for insert to authenticated with check (bucket_id = 'trap-evidence');

create policy "mvp authenticated update trap evidence" on storage.objects
  for update to authenticated using (bucket_id = 'trap-evidence') with check (bucket_id = 'trap-evidence');
