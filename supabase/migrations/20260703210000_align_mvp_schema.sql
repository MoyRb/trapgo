-- Align existing MVP deployments with the TrapGo end-to-end flow used by the app.
alter table public.clients add column if not exists email text;
alter table public.clients add column if not exists status text not null default 'active';
alter table public.clients add constraint clients_status_check check (status in ('active', 'inactive')) not valid;
alter table public.clients validate constraint clients_status_check;

alter table public.trap_checks alter column service_order_id drop not null;
alter table public.trap_checks add column if not exists technician_name text;
alter table public.trap_checks add constraint trap_checks_trap_status_check check (trap_status in ('ok', 'activity_detected', 'damaged', 'missing', 'needs_replacement')) not valid;
alter table public.trap_checks validate constraint trap_checks_trap_status_check;
alter table public.trap_checks add constraint trap_checks_activity_level_check check (activity_level in ('none', 'low', 'medium', 'high')) not valid;
alter table public.trap_checks validate constraint trap_checks_activity_level_check;
