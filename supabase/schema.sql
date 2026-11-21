-- StudyFlow database setup.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.

-- 1. Each person's saved plan (profile, deadlines, quizzes, chats…), one row per account.
create table if not exists public.user_state (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  state      jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

-- People can only ever see and change their own row.
drop policy if exists "read own state"   on public.user_state;
drop policy if exists "insert own state" on public.user_state;
drop policy if exists "update own state" on public.user_state;
drop policy if exists "delete own state" on public.user_state;
create policy "read own state"   on public.user_state for select using (auth.uid() = user_id);
create policy "insert own state" on public.user_state for insert with check (auth.uid() = user_id);
create policy "update own state" on public.user_state for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own state" on public.user_state for delete using (auth.uid() = user_id);

-- Keep a single saved plan to a sensible size (2 MB).
alter table public.user_state drop constraint if exists user_state_size;
alter table public.user_state add constraint user_state_size check (pg_column_size(state) < 2000000);

-- 2. Plans (free / paid). Everyone starts on free; change this later when you add payments.
create table if not exists public.plans (
  user_id uuid primary key references auth.users (id) on delete cascade,
  plan    text not null default 'free' check (plan in ('free', 'plus')),
  since   timestamptz not null default now()
);
alter table public.plans enable row level security;
drop policy if exists "read own plan" on public.plans;
create policy "read own plan" on public.plans for select using (auth.uid() = user_id);
-- No insert/update policy: only the server (service role) can change someone's plan.

-- 3. Daily AI usage, used to apply free-plan limits. Only the server function writes it.
create table if not exists public.ai_usage (
  user_id uuid not null references auth.users (id) on delete cascade,
  day     date not null default current_date,
  calls   int  not null default 0,
  primary key (user_id, day)
);
alter table public.ai_usage enable row level security;
drop policy if exists "read own usage" on public.ai_usage;
create policy "read own usage" on public.ai_usage for select using (auth.uid() = user_id);

-- Counts one AI call for the signed-in person and returns today's total.
create or replace function public.bump_ai_usage()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare n int;
begin
  if auth.uid() is null then raise exception 'not signed in'; end if;
  insert into ai_usage (user_id, day, calls) values (auth.uid(), current_date, 1)
  on conflict (user_id, day) do update set calls = ai_usage.calls + 1
  returning calls into n;
  return n;
end $$;
revoke all on function public.bump_ai_usage() from public, anon;
grant execute on function public.bump_ai_usage() to authenticated;

-- Returns the signed-in person's plan ('free' if they have no row yet).
create or replace function public.my_plan()
returns text
language sql
security definer
set search_path = public
stable
as $$ select coalesce((select plan from plans where user_id = auth.uid()), 'free') $$;
revoke all on function public.my_plan() from public, anon;
grant execute on function public.my_plan() to authenticated;

-- 4. Linked calendars (ManageBac, iSAMS, Google, Apple, Outlook, Canvas…), refreshed every 30 minutes.
create table if not exists public.calendar_feeds (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  url        text not null check (char_length(url) < 2000),
  source     text,
  label      text,
  ics        text,
  hash       text,
  fetched_at timestamptz,
  status     text,
  error      text,
  created_at timestamptz not null default now()
);
create index if not exists calendar_feeds_fetched on public.calendar_feeds (fetched_at);
alter table public.calendar_feeds enable row level security;
drop policy if exists "read own feeds"   on public.calendar_feeds;
drop policy if exists "add own feeds"    on public.calendar_feeds;
drop policy if exists "remove own feeds" on public.calendar_feeds;
create policy "read own feeds"   on public.calendar_feeds for select using (auth.uid() = user_id);
create policy "add own feeds"    on public.calendar_feeds for insert with check (auth.uid() = user_id);
create policy "remove own feeds" on public.calendar_feeds for delete using (auth.uid() = user_id);
-- No update policy: only the sync function (service role) writes the downloaded calendar.

create or replace function public.limit_feeds() returns trigger language plpgsql as $$
begin
  if (select count(*) from public.calendar_feeds where user_id = new.user_id) >= 10 then
    raise exception 'You can link up to 10 calendars.';
  end if;
  return new;
end $$;
drop trigger if exists limit_feeds on public.calendar_feeds;
create trigger limit_feeds before insert on public.calendar_feeds for each row execute function public.limit_feeds();
