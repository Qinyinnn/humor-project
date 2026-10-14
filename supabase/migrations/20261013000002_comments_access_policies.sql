alter table public.comments enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_read_all'
  ) then
    create policy comments_read_all
      on public.comments for select using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_insert_own_restrict'
  ) then
    create policy comments_insert_own_restrict
      on public.comments as restrictive for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_insert_own'
  ) then
    create policy comments_insert_own
      on public.comments for insert
      with check (auth.uid() = user_id);
  end if;
end
$$;
