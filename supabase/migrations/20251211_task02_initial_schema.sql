-- Task 02: Schemat bazodanowy dla salon-booking-saas
create extension if not exists "btree_gist";
create extension if not exists "uuid-ossp";

create type public.appointment_status as enum ('scheduled', 'cancelled', 'completed', 'no_show');
create type public.currency_code as enum ('EUR', 'PLN');
create type public.supported_locale as enum ('es', 'pl', 'en');

create or replace function public.trigger_set_timestamp()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.salons (
  id uuid primary key default uuid_generate_v4(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  country text,
  phone text,
  email text,
  currency public.currency_code not null default 'EUR',
  default_locale public.supported_locale not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salons_owner_unique unique (owner_user_id)
);

create table if not exists public.workstations (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes % 30 = 0),
  price numeric(10, 2) not null default 0,
  currency public.currency_code not null default 'EUR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  workstation_id uuid not null references public.workstations(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  start_at timestamptz not null,
  duration_minutes integer not null check (duration_minutes > 0 and duration_minutes % 30 = 0),
  client_name text not null,
  client_phone text,
  client_email text,
  status public.appointment_status not null default 'scheduled',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_duration_positive check (duration_minutes > 0)
);

create table if not exists public.closed_days (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  date date not null,
  reason text,
  created_at timestamptz not null default now(),
  constraint closed_days_unique unique (salon_id, date)
);

create table if not exists public.opening_hours (
  id uuid primary key default uuid_generate_v4(),
  salon_id uuid not null references public.salons(id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  open_time time,
  close_time time,
  is_closed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint opening_hours_unique unique (salon_id, weekday),
  constraint opening_hours_time_check check (
    (is_closed = true and open_time is null and close_time is null)
    or (is_closed = false and open_time is not null and close_time is not null and open_time < close_time)
  )
);

-- Uaktualnianie pól updated_at
create trigger salons_set_timestamp
before update on public.salons
for each row execute function public.trigger_set_timestamp();

create trigger services_set_timestamp
before update on public.services
for each row execute function public.trigger_set_timestamp();

create trigger appointments_set_timestamp
before update on public.appointments
for each row execute function public.trigger_set_timestamp();

-- Indexy
create index if not exists idx_salons_owner on public.salons(owner_user_id);
create index if not exists idx_workstations_salon on public.workstations(salon_id, order_index);
create index if not exists idx_services_salon on public.services(salon_id, is_active);
create index if not exists idx_appointments_salon_start on public.appointments(salon_id, start_at);
create index if not exists idx_appointments_workstation_start on public.appointments(workstation_id, start_at);
create index if not exists idx_closed_days_salon_date on public.closed_days(salon_id, date);

-- Constraint przeciwko podwójnym rezerwacjom na jednym stanowisku (czas nakładający się)
alter table public.appointments
  add constraint appointments_no_overlap exclude using gist (
    workstation_id with =,
    tstzrange(start_at, start_at + make_interval(mins => duration_minutes)) with &&
  );
