
alter table public.combos enable row level security;
alter table public.famiglie enable row level security;
alter table public.provider_offers enable row level security;

create policy if not exists "read_active_combos"
on public.combos for select
to anon, authenticated
using (attivo = true);

create policy if not exists "read_famiglie_public"
on public.famiglie for select
to anon, authenticated
using (true);

create policy if not exists "read_provider_offers_public"
on public.provider_offers for select
to anon, authenticated
using (true);

-- Simplified write (for local tests): any authenticated user
-- Replace with role=admin checks in production
create policy if not exists "write_combos_auth"
on public.combos for insert
to authenticated
with check (true);

create policy if not exists "update_combos_auth"
on public.combos for update
to authenticated
using (true)
with check (true);

create policy if not exists "delete_combos_auth"
on public.combos for delete
to authenticated
using (true);
