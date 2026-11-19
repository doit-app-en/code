-- Accounts: every signed-in person has a profile (student or teacher); a teacher owns classes; a student joins one class with its code.
-- The sign-in itself (email + password, Google) is Supabase Auth. Only the Vercel functions in /api touch these tables (service-role key):
-- Row Level Security is on with no policies, so the public key cannot read or write them.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text        not null,
  name       text        not null default '',
  role       text        not null default 'student' check (role in ('student', 'teacher')),
  class_id   uuid,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_email_idx on public.profiles (lower(email));

create table if not exists public.classes (
  id         uuid primary key default gen_random_uuid(),
  teacher_id uuid        not null references public.profiles (id) on delete cascade,
  name       text        not null,
  code       text        not null unique,
  created_at timestamptz not null default now()
);
create index if not exists classes_teacher_idx on public.classes (teacher_id);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_class_fk') then
    alter table public.profiles add constraint profiles_class_fk foreign key (class_id) references public.classes (id) on delete set null;
  end if;
end $$;
create index if not exists profiles_class_idx on public.profiles (class_id);

-- The progress summary now belongs to an account and, through it, to a class.
alter table public.students add column if not exists user_id  uuid;
alter table public.students add column if not exists class_id uuid;
create index if not exists students_class_idx on public.students (class_id);

alter table public.profiles enable row level security;
alter table public.classes  enable row level security;
