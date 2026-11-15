create table public.dsa_planner_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  revision integer not null default 1 check (revision > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object')
);

alter table public.dsa_planner_state enable row level security;
revoke all on table public.dsa_planner_state from public, anon, authenticated;
grant select, insert, update on table public.dsa_planner_state to authenticated;

create policy "Read own planner" on public.dsa_planner_state
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Create own planner" on public.dsa_planner_state
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Update own planner" on public.dsa_planner_state
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
