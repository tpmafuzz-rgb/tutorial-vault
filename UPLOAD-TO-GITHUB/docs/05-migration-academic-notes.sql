-- ============================================================================
-- MIGRATION: Academic Notes workspace
-- Paste into Supabase SQL Editor and Run. Safe to run more than once.
-- Adds a `notes` table (blank-canvas notes with labeled blocks), its own
-- per-user serial counter (NOTE-0001, NOTE-0002, ...), RLS, and indexes.
-- Your existing editing tutorials are untouched.
-- ============================================================================

-- per-user serial counter for notes (separate from tutorials)
create table if not exists note_counters (
  user_id   uuid primary key references profiles(id) on delete cascade,
  note_seq  int not null default 0
);

-- the notes table
create table if not exists notes (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references profiles(id) on delete cascade,
  serial_number int not null,
  serial        text generated always as ('NOTE-' || lpad(serial_number::text, 4, '0')) stored,
  title         text not null,
  subject       text not null default '',
  level         text not null default '',
  -- ordered list of labeled blocks: [{ "id": "...", "label": "Introduction", "content": "..." }]
  blocks        jsonb not null default '[]'::jsonb,
  favorite      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (user_id, serial_number)
);

create index if not exists notes_user_idx     on notes (user_id);
create index if not exists notes_user_fav_idx on notes (user_id, favorite);

-- keep updated_at fresh (reuses the existing set_updated_at() function)
drop trigger if exists notes_updated_at on notes;
create trigger notes_updated_at before update on notes
  for each row execute function set_updated_at();

-- serial allocation: lock the user's note counter, bump it, assign
create or replace function assign_note_serial() returns trigger
language plpgsql security definer set search_path = public as $$
declare next_seq int;
begin
  insert into note_counters (user_id, note_seq)
    values (new.user_id, 1)
  on conflict (user_id)
    do update set note_seq = note_counters.note_seq + 1
  returning note_seq into next_seq;

  new.serial_number := next_seq;
  return new;
end $$;

drop trigger if exists notes_assign_serial on notes;
create trigger notes_assign_serial
  before insert on notes
  for each row execute function assign_note_serial();

-- Row-Level Security: each user sees only their own notes
alter table note_counters enable row level security;
alter table notes         enable row level security;

drop policy if exists "note_counters self" on note_counters;
drop policy if exists "notes own"          on notes;

create policy "note_counters self" on note_counters
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "notes own" on notes
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Also seed a note counter for existing users (so their first note is NOTE-0001)
insert into note_counters (user_id, note_seq)
  select id, 0 from profiles
  on conflict (user_id) do nothing;

-- ============================================================================
-- Done. Quick check (should return no error):  select * from notes limit 1;
-- ============================================================================
