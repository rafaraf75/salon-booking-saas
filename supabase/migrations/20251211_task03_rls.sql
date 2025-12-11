-- Task 03: RLS i polityki bezpieczeństwa
alter table public.salons enable row level security;
alter table public.workstations enable row level security;
alter table public.services enable row level security;
alter table public.appointments enable row level security;
alter table public.closed_days enable row level security;
alter table public.opening_hours enable row level security;

-- Helper predicate: salon należy do zalogowanego użytkownika
create policy "salons_select_own" on public.salons
  for select
  using (owner_user_id = auth.uid());

create policy "salons_insert_own" on public.salons
  for insert
  with check (owner_user_id = auth.uid());

create policy "salons_update_own" on public.salons
  for update
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "salons_delete_own" on public.salons
  for delete
  using (owner_user_id = auth.uid());

-- service_role pełny dostęp
create policy "salons_service_role_full" on public.salons
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

-- Polityki zależne od salonu (workstations, services, appointments, closed_days, opening_hours)
create policy "workstations_owner_access" on public.workstations
  for all
  using (
    exists (
      select 1 from public.salons s
      where s.id = workstations.salon_id and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = workstations.salon_id and s.owner_user_id = auth.uid()
    )
  );

create policy "workstations_service_role_full" on public.workstations
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

create policy "services_owner_access" on public.services
  for all
  using (
    exists (
      select 1 from public.salons s
      where s.id = services.salon_id and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = services.salon_id and s.owner_user_id = auth.uid()
    )
  );

create policy "services_service_role_full" on public.services
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

create policy "appointments_owner_access" on public.appointments
  for all
  using (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = appointments.salon_id and s.owner_user_id = auth.uid()
    )
  );

create policy "appointments_service_role_full" on public.appointments
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

create policy "closed_days_owner_access" on public.closed_days
  for all
  using (
    exists (
      select 1 from public.salons s
      where s.id = closed_days.salon_id and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = closed_days.salon_id and s.owner_user_id = auth.uid()
    )
  );

create policy "closed_days_service_role_full" on public.closed_days
  as permissive
  for all
  to service_role
  using (true)
  with check (true);

create policy "opening_hours_owner_access" on public.opening_hours
  for all
  using (
    exists (
      select 1 from public.salons s
      where s.id = opening_hours.salon_id and s.owner_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.salons s
      where s.id = opening_hours.salon_id and s.owner_user_id = auth.uid()
    )
  );

create policy "opening_hours_service_role_full" on public.opening_hours
  as permissive
  for all
  to service_role
  using (true)
  with check (true);
