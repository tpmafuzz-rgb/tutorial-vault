-- ============================================================================
-- TUTORIAL · Supabase setup (run in Supabase SQL Editor)
-- Idempotent-ish: safe to read top-to-bottom on a fresh project.
-- Covers deliverables #3 / #12 / #15.
-- ============================================================================

-- ---------- Extensions ----------
create extension if not exists "pgcrypto";        -- gen_random_uuid()

-- ---------- Enums ----------
do $$ begin
  create type difficulty_enum as enum ('Beginner','Intermediate','Advanced');
exception when duplicate_object then null; end $$;

do $$ begin
  create type asset_type_enum as enum
    ('Font','LUT','Preset','PNG','Overlay','Music','Sound Effect');
exception when duplicate_object then null; end $$;

-- ---------- updated_at helper ----------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ============================================================================
-- profiles
-- ============================================================================
create table if not exists profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  author_name text not null default '',
  book_title  text not null default 'My Editing Encyclopedia',
  theme       text not null default 'light' check (theme in ('light','dim')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- auto-create a profile + counter on signup, and seed starter categories
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, author_name)
    values (new.id, split_part(coalesce(new.email,'creator'), '@', 1))
    on conflict (id) do nothing;
  insert into user_counters (user_id, tutorial_seq)
    values (new.id, 0)
    on conflict (user_id) do nothing;

  -- starter categories so the vault isn't intimidatingly empty (editable/deletable)
  insert into categories (user_id, name, color) values
    (new.id, 'CapCut',          '#111111'),
    (new.id, 'Premiere Pro',    '#7c5cff'),
    (new.id, 'After Effects',   '#2f6bff'),
    (new.id, 'Motion Graphics', '#ff7a45'),
    (new.id, 'Color Grading',   '#10b981'),
    (new.id, 'Sound Design',    '#f43f5e')
  on conflict do nothing;

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- user_counters (serial allocation)
-- ============================================================================
create table if not exists user_counters (
  user_id      uuid primary key references profiles(id) on delete cascade,
  tutorial_seq int not null default 0
);

-- ============================================================================
-- categories
-- ============================================================================
create table if not exists categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references profiles(id) on delete cascade,
  name       text not null,
  color      text not null default '#111111',
  created_at timestamptz not null default now()
);
create unique index if not exists categories_user_name_uq
  on categories (user_id, lower(name));
create index if not exists categories_user_idx on categories (user_id);

-- ============================================================================
-- tutorials
-- ============================================================================
create table if not exists tutorials (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  serial_number       int  not null,
  serial              text generated always as ('TUT-' || lpad(serial_number::text, 4, '0')) stored,
  name                text not null,
  goal                text not null default '',
  final_result        text not null default '',
  software            text[] not null default '{}',
  difficulty          difficulty_enum not null default 'Beginner',
  category_id         uuid references categories(id) on delete set null,
  assets_required     text[] not null default '{}',
  before_you_start    text not null default '',
  steps               text not null default '',
  common_mistakes     text not null default '',
  troubleshooting     text not null default '',
  keyboard_shortcuts  text not null default '',
  alternative_methods text not null default '',
  final_checklist     jsonb not null default '[]'::jsonb,
  workflow            jsonb not null default '[]'::jsonb,
  favorite            boolean not null default false,
  -- plain tsvector, filled by a trigger (to_tsvector is not immutable, so it
  -- cannot be a GENERATED column on current Postgres/Supabase)
  search              tsvector,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  unique (user_id, serial_number)
);

create index if not exists tutorials_user_idx       on tutorials (user_id);
create index if not exists tutorials_user_cat_idx   on tutorials (user_id, category_id);
create index if not exists tutorials_user_fav_idx   on tutorials (user_id, favorite);
create index if not exists tutorials_search_idx     on tutorials using gin (search);
create index if not exists tutorials_software_idx   on tutorials using gin (software);

create trigger tutorials_updated_at before update on tutorials
  for each row execute function set_updated_at();

-- full-text search: populate `search` via trigger (immutable-safe)
create or replace function tutorials_search_update() returns trigger
language plpgsql as $$
begin
  new.search :=
    to_tsvector('english',
      coalesce(new.name,'')         || ' ' ||
      coalesce(new.goal,'')         || ' ' ||
      coalesce(new.final_result,'') || ' ' ||
      coalesce(new.steps,'')        || ' ' ||
      array_to_string(new.software, ' '));
  return new;
end $$;

drop trigger if exists tutorials_search_trg on tutorials;
create trigger tutorials_search_trg
  before insert or update of name, goal, final_result, steps, software
  on tutorials
  for each row execute function tutorials_search_update();

-- serial allocation: lock the user's counter row, bump it, assign.
create or replace function assign_tutorial_serial() returns trigger
language plpgsql security definer set search_path = public as $$
declare next_seq int;
begin
  insert into user_counters (user_id, tutorial_seq)
    values (new.user_id, 1)
  on conflict (user_id)
    do update set tutorial_seq = user_counters.tutorial_seq + 1
  returning tutorial_seq into next_seq;

  new.serial_number := next_seq;
  return new;
end $$;

drop trigger if exists tutorials_assign_serial on tutorials;
create trigger tutorials_assign_serial
  before insert on tutorials
  for each row execute function assign_tutorial_serial();

-- ============================================================================
-- assets
-- ============================================================================
create table if not exists assets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references profiles(id) on delete cascade,
  name         text not null,
  type         asset_type_enum not null,
  tags         text[] not null default '{}',
  size_bytes   bigint not null default 0,
  storage_path text,
  created_at   timestamptz not null default now()
);
create index if not exists assets_user_idx on assets (user_id);
create index if not exists assets_tags_idx on assets using gin (tags);

-- ============================================================================
-- tutorial_assets (N:M link)
-- ============================================================================
create table if not exists tutorial_assets (
  tutorial_id uuid not null references tutorials(id) on delete cascade,
  asset_id    uuid not null references assets(id)    on delete cascade,
  user_id     uuid not null references profiles(id)  on delete cascade,
  primary key (tutorial_id, asset_id)
);
create index if not exists tutorial_assets_asset_idx on tutorial_assets (asset_id);

-- ============================================================================
-- export_logs
-- ============================================================================
create table if not exists export_logs (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references profiles(id) on delete cascade,
  book_title      text not null default '',
  tutorial_count  int  not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists export_logs_user_idx on export_logs (user_id, created_at desc);

-- ============================================================================
-- Full-text search RPC (used by the ⌘K palette)
-- Searches tutorial fields + matches on linked category/asset names.
-- ============================================================================
create or replace function search_tutorials(q text)
returns setof tutorials
language sql stable as $$
  select distinct t.*
  from tutorials t
  left join categories c on c.id = t.category_id
  left join tutorial_assets ta on ta.tutorial_id = t.id
  left join assets a on a.id = ta.asset_id
  where t.user_id = auth.uid()
    and (
      q = '' or
      t.search @@ plainto_tsquery('english', q) or
      t.name ilike '%' || q || '%' or
      t.serial ilike '%' || q || '%' or
      c.name ilike '%' || q || '%' or
      a.name ilike '%' || q || '%'
    )
  order by t.updated_at desc;
$$;

-- ============================================================================
-- Row-Level Security
-- ============================================================================
alter table profiles        enable row level security;
alter table user_counters   enable row level security;
alter table categories      enable row level security;
alter table tutorials       enable row level security;
alter table assets          enable row level security;
alter table tutorial_assets enable row level security;
alter table export_logs     enable row level security;

create policy "profiles self" on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

create policy "counters self" on user_counters
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "categories own" on categories
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tutorials own" on tutorials
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "assets own" on assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "tutorial_assets own" on tutorial_assets
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "export_logs own" on export_logs
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ============================================================================
-- Storage: private 'assets' bucket + per-user path policies
-- ============================================================================
insert into storage.buckets (id, name, public)
  values ('assets', 'assets', false)
  on conflict (id) do nothing;

-- path convention: {auth.uid()}/{uuid}-{filename}
create policy "assets read own" on storage.objects
  for select using (
    bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "assets write own" on storage.objects
  for insert with check (
    bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "assets update own" on storage.objects
  for update using (
    bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "assets delete own" on storage.objects
  for delete using (
    bucket_id = 'assets' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- Done. Verify: select * from search_tutorials('');
-- ============================================================================
