alter table public.comments
  add column if not exists parent_comment_id bigint;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.comments'::regclass
      and conname = 'comments_parent_comment_id_fkey'
  ) then
    alter table public.comments
      add constraint comments_parent_comment_id_fkey
      foreign key (parent_comment_id)
      references public.comments(id)
      on delete cascade;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_read_all'
  ) then
    create policy comments_read_all
      on public.comments for select
      using (true);
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

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_delete_own_restrict'
  ) then
    create policy comments_delete_own_restrict
      on public.comments as restrictive for delete
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'comments'
      and policyname = 'comments_delete_own'
  ) then
    create policy comments_delete_own
      on public.comments for delete
      using (auth.uid() = user_id);
  end if;
end
$$;

create index if not exists comments_post_parent_created_idx
  on public.comments(post_id, parent_comment_id, created_at);

alter table public.comments enable row level security;
