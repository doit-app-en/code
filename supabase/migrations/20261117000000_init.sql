-- Do it English — class server database.
-- Replaces the Google Sheet of the old Apps Script server (legacy/class-server-script.gs).
-- Only the Vercel functions in /api read and write these tables, with the service-role key.
-- Row Level Security is ON with no policies, so the public (anon) key cannot touch them.

create table if not exists public.students (
  email         text primary key,
  name          text        not null default '',
  cls           text        not null default '',
  overall       integer     not null default 0,
  listening     integer     not null default 0,
  pronounce     integer     not null default 0,
  lessons       integer     not null default 0,
  placement     text        not null default '',
  last_active   timestamptz,
  updated_at    timestamptz not null default now(),
  last_reminder timestamptz
);

create table if not exists public.speaking_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  email       text        not null,
  name        text        not null default '',
  cls         text        not null default '',
  topic       text        not null default '',
  seconds     integer,
  words       integer,
  level       text,
  fluency     integer,
  accuracy    integer,
  vocabulary  integer,
  formal      integer,
  informal    integer,
  summary     text
);
create index if not exists speaking_log_email_idx on public.speaking_log (email, created_at desc);

-- How many AI feedbacks each student asked for on each day (to protect the Claude credit).
create table if not exists public.ai_usage (
  day   date    not null,
  email text    not null,
  n     integer not null default 0,
  primary key (day, email)
);

alter table public.students     enable row level security;
alter table public.speaking_log enable row level security;
alter table public.ai_usage     enable row level security;

-- Counts one AI feedback for the student, unless a limit is reached.
-- Returns 'ok', 'student limit' or 'daily limit'. One call at a time, so the limits cannot be passed.
create or replace function public.ai_take(p_email text, p_max_student integer, p_max_day integer)
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
  perform pg_advisory_xact_lock(hashtext('do-it-english.ai_take'));
  select coalesce(sum(n), 0) into n_all from ai_usage where day = d;
  select coalesce(sum(n), 0) into n_stu from ai_usage where day = d and email = p_email;
  if n_all >= p_max_day then return 'daily limit'; end if;
  if n_stu >= p_max_student then return 'student limit'; end if;
  insert into ai_usage (day, email, n) values (d, p_email, 1)
    on conflict (day, email) do update set n = ai_usage.n + 1;
  delete from ai_usage where day < d - 30;
  return 'ok';
end;
$$;

revoke all on function public.ai_take(text, integer, integer) from public, anon, authenticated;
grant execute on function public.ai_take(text, integer, integer) to service_role;
