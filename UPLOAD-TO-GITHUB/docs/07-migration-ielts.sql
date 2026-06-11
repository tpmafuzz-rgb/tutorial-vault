-- ============================================================================
-- MIGRATION: IELTS 30-Day Comeback Challenge workspace
-- Paste into Supabase SQL Editor and Run. Safe to run more than once.
-- Adds `ielts_challenges` (one row per 30-day attempt) and `ielts_days`
-- (one row per tracked day), with per-user serials (IELTS-0001), RLS,
-- and indexes. Existing tutorials/notes are untouched.
-- ============================================================================

-- per-user serial counter for challenges (separate from tutorials/notes)
create table if not exists ielts_counters (
  user_id    uuid primary key references profiles(id) on delete cascade,
  ielts_seq  int not null default 0
);

-- one row per 30-day challenge attempt
create table if not exists ielts_challenges (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  serial_number int not null,
  serial        text generated always as ('IELTS-' || lpad(serial_number::text, 4, '0')) stored,
  student_name  text not null default '',
  target_band   text not null default '',
  start_date    text not null default '',
  target_date   text not null default '',
  status        text not null default 'active' check (status in ('active','completed','archived')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, serial_number)
);

create index if not exists ielts_challenges_user_idx on ielts_challenges (user_id);

drop trigger if exists ielts_challenges_updated_at on ielts_challenges;
create trigger ielts_challenges_updated_at before update on ielts_challenges
  for each row execute function set_updated_at();

-- serial allocation: bump the user's counter, assign
create or replace function assign_ielts_serial() returns trigger
language plpgsql security definer set search_path = public as $$
declare next_seq int;
begin
  insert into ielts_counters (user_id, ielts_seq)
    values (new.user_id, 1)
  on conflict (user_id)
    do update set ielts_seq = ielts_counters.ielts_seq + 1
  returning ielts_seq into next_seq;

  new.serial_number := next_seq;
  return new;
end $$;

drop trigger if exists ielts_challenges_assign_serial on ielts_challenges;
create trigger ielts_challenges_assign_serial
  before insert on ielts_challenges
  for each row execute function assign_ielts_serial();

-- one row per tracked day (created lazily the first time a day is saved)
create table if not exists ielts_days (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  challenge_id    uuid not null references ielts_challenges(id) on delete cascade,
  day_number      int not null check (day_number between 1 and 30),
  date            text not null default '',
  -- module payloads: see lib/ielts.ts for the exact shapes
  listening       jsonb not null default '{}'::jsonb,
  reading         jsonb not null default '{}'::jsonb,
  writing         jsonb not null default '{}'::jsonb,
  speaking        jsonb not null default '{}'::jsonb,
  vocabulary      jsonb not null default '[]'::jsonb,
  reflection      jsonb not null default '{}'::jsonb,
  -- the 5 Success Rule checkboxes (kept as columns for fast grid queries)
  done_listening  boolean not null default false,
  done_reading    boolean not null default false,
  done_writing    boolean not null default false,
  done_speaking   boolean not null default false,
  done_reflection boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (challenge_id, day_number)
);

create index if not exists ielts_days_user_idx      on ielts_days (user_id);
create index if not exists ielts_days_challenge_idx on ielts_days (challenge_id, day_number);

drop trigger if exists ielts_days_updated_at on ielts_days;
create trigger ielts_days_updated_at before update on ielts_days
  for each row execute function set_updated_at();

-- Row-Level Security: each user sees only their own data
alter table ielts_counters   enable row level security;
alter table ielts_challenges enable row level security;
alter table ielts_days       enable row level security;

drop policy if exists "ielts_counters self"   on ielts_counters;
drop policy if exists "ielts_challenges own"  on ielts_challenges;
drop policy if exists "ielts_days own"        on ielts_days;

create policy "ielts_counters self" on ielts_counters
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ielts_challenges own" on ielts_challenges
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "ielts_days own" on ielts_days
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- seed counters for existing users (so their first challenge is IELTS-0001)
insert into ielts_counters (user_id, ielts_seq)
  select id, 0 from profiles
  on conflict (user_id) do nothing;

-- ============================================================================
-- Done. Quick check:  select * from ielts_challenges limit 1;
-- ============================================================================
