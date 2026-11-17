-- Voice level test: saved results + separate daily limits for the speech service.

-- ai_usage now counts several kinds of paid calls: 'ai' (Claude feedback) and 'voice' (speech service).
alter table public.ai_usage add column if not exists kind text not null default 'ai';
alter table public.ai_usage drop constraint if exists ai_usage_pkey;
alter table public.ai_usage add primary key (day, kind, email);

-- Counts one call of this kind for the student, unless a limit is reached.
-- Returns 'ok', 'student limit' or 'daily limit'.
create or replace function public.usage_take(p_kind text, p_email text, p_max_student integer, p_max_day integer)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  d     date := (now() at time zone 'Asia/Riyadh')::date;
  n_all integer;
  n_stu integer;
begin
  perform pg_advisory_xact_lock(hashtext('do-it-english.usage.' || p_kind));
  select coalesce(sum(n), 0) into n_all from ai_usage where day = d and kind = p_kind;
  select coalesce(sum(n), 0) into n_stu from ai_usage where day = d and kind = p_kind and email = p_email;
  if n_all >= p_max_day then return 'daily limit'; end if;
  if n_stu >= p_max_student then return 'student limit'; end if;
  insert into ai_usage (day, kind, email, n) values (d, p_kind, p_email, 1)
    on conflict (day, kind, email) do update set n = ai_usage.n + 1;
  delete from ai_usage where day < d - 30;
  return 'ok';
end;
$$;

-- The old function keeps working and now only counts Claude feedback.
create or replace function public.ai_take(p_email text, p_max_student integer, p_max_day integer)
returns text
language sql
security definer
set search_path = public
as $$ select public.usage_take('ai', p_email, p_max_student, p_max_day); $$;

revoke all on function public.usage_take(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.usage_take(text, text, integer, integer) to service_role;
revoke all on function public.ai_take(text, integer, integer) from public, anon, authenticated;
grant execute on function public.ai_take(text, integer, integer) to service_role;

-- One row per finished voice level test. The id is a random string: whoever has the link can open the result.
create table if not exists public.voice_tests (
  id            text primary key,
  created_at    timestamptz not null default now(),
  email         text        not null,
  name          text        not null default '',
  cls           text        not null default '',
  level         text        not null default '',
  overall       integer,
  speaking      integer,
  pronunciation integer,
  repeating     integer,
  result        jsonb       not null
);
create index if not exists voice_tests_email_idx on public.voice_tests (email, created_at desc);
alter table public.voice_tests enable row level security;
