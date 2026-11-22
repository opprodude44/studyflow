-- Lets a signed-in person permanently delete their own account.
-- Their plan, usage and linked calendars are removed too (those tables cascade on delete).
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- Feedback sent from inside StudyFlow. People can send it; only you (in the Supabase dashboard) can read it.
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid default auth.uid() references auth.users (id) on delete set null,
  message    text not null check (char_length(message) between 2 and 4000),
  kind       text check (kind in ('idea','bug','other')),
  page       text check (char_length(page) < 60),
  created_at timestamptz not null default now()
);
alter table public.feedback enable row level security;
drop policy if exists "send feedback" on public.feedback;
create policy "send feedback" on public.feedback for insert to authenticated with check (user_id = auth.uid());
