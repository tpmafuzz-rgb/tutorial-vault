# 03 · Database Schema

Covers: **#3 Database Schema · #12 Scalable Supabase Schema · #15 Asset Management System**

The runnable SQL (tables, RLS, triggers, storage, indexes) is in
[`04-supabase-setup.sql`](04-supabase-setup.sql). This doc explains the *why*.

---

## Entity-relationship overview

```
auth.users (Supabase)
    │ 1:1
    ▼
profiles ──────────────┐
    │ 1:N              │ 1:N
    ▼                  ▼
categories         tutorials ──────1:N──────► (workflow steps stored as JSONB)
    ▲ 0:1              │
    └──────────────────┤ N:M (via tutorial_assets)
                       ▼
                    assets
    │ 1:N
    ▼
export_logs                user_counters (serial allocation, 1:1 with user)
```

Six tables + one counter table. Small surface area on purpose.

---

## Tables

### `profiles`
One row per user. Created automatically on signup (trigger on `auth.users`).

| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | = `auth.users.id` |
| `author_name` | text | default from email prefix |
| `book_title` | text | default "My Editing Encyclopedia" |
| `theme` | text | `'light' | 'dim'` |
| `created_at` `updated_at` | timestamptz | |

### `categories`
| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→profiles | RLS scope |
| `name` | text | |
| `color` | text | hex dot, the only color in the UI |
| `created_at` | timestamptz | |

`unique (user_id, lower(name))` — no duplicate category names per user.

### `tutorials` (the spine)
| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→profiles | RLS scope |
| `serial_number` | int | per-user sequential, set by trigger |
| `serial` | text | generated: `'TUT-' || lpad(serial_number,4,'0')` |
| `name` | text not null | |
| `goal` | text | |
| `final_result` | text | |
| `software` | text[] | e.g. `{CapCut,"Premiere Pro"}` |
| `difficulty` | difficulty_enum | `Beginner|Intermediate|Advanced` |
| `category_id` | uuid FK→categories | `on delete set null` |
| `assets_required` | text[] | free-text required asset names |
| `before_you_start` | text | |
| `steps` | text | markdown-subset body |
| `common_mistakes` | text | |
| `troubleshooting` | text | |
| `keyboard_shortcuts` | text | |
| `alternative_methods` | text | |
| `final_checklist` | jsonb | `string[]` |
| `workflow` | jsonb | `[{id,label}]` ordered timeline |
| `favorite` | boolean | default false |
| `search` | tsvector | generated, GIN-indexed |
| `created_at` `updated_at` | timestamptz | `updated_at` via trigger |

**Design choices**
- `workflow` and `final_checklist` are **JSONB**, not child tables. They are small, always
  loaded with the parent, and only ever edited as a whole. A normalized `workflow_steps`
  table would add joins and ordering columns for zero benefit at this scale. (If timelines
  ever need cross-tutorial querying, promoting to a table is a clean migration — noted.)
- `software` / `assets_required` are **text[]** — simple tags, queried with GIN if needed.
- `serial_number` is the source of truth; `serial` is a generated display column so it can
  never drift.

### `assets`
| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK→profiles | |
| `name` | text | |
| `type` | asset_type_enum | Font·LUT·Preset·PNG·Overlay·Music·Sound Effect |
| `tags` | text[] | GIN-indexed |
| `size_bytes` | bigint | display formatted client-side |
| `storage_path` | text | path in the `assets` bucket: `{user_id}/{uuid}-{filename}` |
| `created_at` | timestamptz | |

### `tutorial_assets` (link table, N:M)
| column | type | notes |
|--------|------|-------|
| `tutorial_id` | uuid FK | on delete cascade |
| `asset_id` | uuid FK | on delete cascade |
| `user_id` | uuid | denormalized for simple RLS |
| PK | (`tutorial_id`,`asset_id`) | |

### `export_logs`
Drives the "PDFs Exported" stat and gives a history.

| column | type | notes |
|--------|------|-------|
| `id` | uuid PK | |
| `user_id` | uuid FK | |
| `book_title` | text | |
| `tutorial_count` | int | |
| `created_at` | timestamptz | |

### `user_counters`
| column | type | notes |
|--------|------|-------|
| `user_id` | uuid PK FK | |
| `tutorial_seq` | int | last serial allocated; incremented under row lock |

---

## Auto serial — concurrency-safe (`TUT-0001`)

A `BEFORE INSERT` trigger on `tutorials`:
1. `INSERT ... ON CONFLICT DO UPDATE` the user's `user_counters` row, `tutorial_seq = tutorial_seq + 1`,
   `RETURNING tutorial_seq` (atomic — row is locked for the txn).
2. Set `NEW.serial_number = tutorial_seq`.
3. `serial` is a generated column, so the text form follows automatically.

This holds even if two inserts race: the counter row lock serializes them, so no two
tutorials ever share a serial, and there are no gaps from rollbacks beyond the normal.

---

## Row-Level Security (every table)

```sql
-- pattern applied to all user tables
alter table <t> enable row level security;
create policy "own rows" on <t>
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
```
`profiles` keys on `id = auth.uid()`. Full statements in doc 04.

---

## Indexes

- `tutorials (user_id)`, `tutorials (user_id, category_id)`, `tutorials (user_id, favorite)`
- `GIN (search)` for full-text, `GIN (software)`, `GIN (tags on assets)`
- `tutorial_assets (asset_id)` for reverse lookups
- `categories (user_id)`, `export_logs (user_id, created_at desc)`

---

## Storage (Supabase Storage)

- Bucket **`assets`**, **private**.
- Object path always `{auth.uid()}/{uuid}-{filename}`.
- Storage policy: a user may read/write/delete only objects whose first path segment equals
  their `auth.uid()`. Downloads use short-lived signed URLs.
- Max upload enforced client-side and via bucket file-size limit (e.g. 50 MB default,
  configurable).
