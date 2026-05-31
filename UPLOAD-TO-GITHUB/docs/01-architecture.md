# 01 · Product Architecture

Covers: **#1 Product Architecture · #4 Folder Structure · #11 Production-Ready Code Architecture**

---

## 1. System overview

TUTORIAL is a single-user (or tiny-team) SaaS. One creator authenticates, and all
their data (tutorials, assets, categories) is scoped to them by Postgres Row-Level
Security. There is no sharing, no realtime, no multiplayer — by design.

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (Next.js)                         │
│                                                                    │
│  Server Components (RSC)          Client Components ("use client") │
│  • initial data fetch             • forms, editors, search palette │
│  • SEO/meta, layouts              • Zustand UI state               │
│         │                                   │                      │
│         ▼                                   ▼                      │
│  ┌──────────────┐                 ┌────────────────────┐          │
│  │ Data Layer   │  repository     │ Supabase JS client │          │
│  │ (repos/*)    │◄───interface────│ (browser, anon key)│          │
│  └──────┬───────┘                 └─────────┬──────────┘          │
└─────────┼───────────────────────────────────┼────────────────────┘
          │ server-only (service role)         │ RLS-enforced
          ▼                                     ▼
   ┌─────────────────┐   Route Handlers   ┌──────────────────────────┐
   │ /api/refine     │  (Next.js server)  │        Supabase          │
   │  → Claude API   │                    │  Auth · Postgres · Storage│
   └─────────────────┘                    └──────────────────────────┘
```

### Why this shape
- **RSC for reads, client for writes/interaction.** Pages load fast with server-fetched
  data; only interactive islands ship JS.
- **A repository layer** sits between UI and Supabase. The UI never imports the Supabase
  client directly — it calls `tutorialsRepo.list()`, etc. This is the single most important
  architectural decision: it lets us start on **mock data** and swap to **Supabase** (or
  later, anything else) without touching a single component. See doc 07.
- **Two trust zones.** The browser uses the `anon` key and is fully governed by RLS. Only
  server Route Handlers use the `service_role` key or the Anthropic key.

---

## 2. Trust & security boundaries

| Concern | Where it lives | Mechanism |
|--------|----------------|-----------|
| Who can read/write a row | Postgres | RLS: `user_id = auth.uid()` on every table |
| Auth session | httpOnly cookie | `@supabase/ssr` cookie-based sessions |
| Anthropic API key | Server only | `/api/refine` Route Handler; key in env, never bundled |
| File access | Supabase Storage | Per-user path prefix + storage RLS policy |
| Input validation | Client **and** server | Shared Zod schemas (`lib/schema.ts`) |

**Rule:** the client is never trusted. Every Zod schema that guards a form also guards
the corresponding server action / route. RLS is the last line of defense even if a check
is missed.

---

## 3. Rendering & data-fetching strategy

| Route | Render | Data |
|-------|--------|------|
| `/` Dashboard | RSC shell + client stat cards | server fetch counts + recent |
| `/tutorials` | RSC list, client filters/view toggle | server fetch page 1, client paginate |
| `/tutorials/[id]` | RSC | server fetch one (RLS) |
| `/tutorials/new` `/edit` | Client | form → server action |
| `/assets` `/categories` `/favorites` | RSC + client islands | server fetch |
| `/refiner` | Client | POST `/api/refine` |
| `/export` | Client (react-pdf renders in browser) | client fetch all tutorials |
| `/settings` | Client | profile read/write |

Mutations use **Next.js Server Actions** calling the repository (server side, service-role
or RLS-scoped). On success, `revalidatePath()` refreshes the affected RSC.

---

## 4. Folder structure (feature-oriented, App-Router)

```
tutorial-vault/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── callback/route.ts          # Supabase auth callback
│   ├── (app)/                          # authenticated shell (sidebar + topbar)
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard
│   │   ├── tutorials/
│   │   │   ├── page.tsx                # Library (list + grid)
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx            # Detail + Workflow Timeline
│   │   │       └── edit/page.tsx
│   │   ├── assets/page.tsx
│   │   ├── categories/page.tsx
│   │   ├── favorites/page.tsx
│   │   ├── refiner/page.tsx
│   │   ├── export/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   └── refine/route.ts            # Claude API proxy (server-only)
│   ├── layout.tsx                     # root: fonts, providers
│   └── globals.css
│
├── components/
│   ├── ui/                            # shadcn/ui primitives (button, input, dialog…)
│   ├── shell/                         # Sidebar, Topbar, GlobalSearch, AppShell
│   ├── tutorial/                      # TutorialCard, WorkflowTimeline, RichContent…
│   ├── form/                          # TutorialForm, TagInput, ChecklistEditor…
│   └── pdf/                           # BookDocument (react-pdf), cover, TOC, chapter
│
├── features/                          # optional: colocate hooks+logic per domain
│   ├── tutorials/  (hooks, queries)
│   ├── assets/
│   └── refiner/
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                  # browser client (anon)
│   │   ├── server.ts                  # server client (cookies)
│   │   └── admin.ts                   # service-role client (server-only)
│   ├── repos/                         # repository layer (the swap point)
│   │   ├── types.ts                   # Repo interfaces
│   │   ├── supabase/                  # Supabase implementation
│   │   └── mock/                      # in-memory/localStorage implementation
│   ├── schema.ts                      # Zod schemas (shared)
│   ├── types.ts                       # domain types
│   ├── workflow.ts                    # auto-timeline generator
│   ├── store.ts                       # Zustand (UI state only)
│   └── utils.ts                       # cn(), formatSerial(), dates…
│
├── docs/                              # this design package
└── supabase/
    └── migrations/                    # SQL (mirrors doc 04)
```

### Layering rules (enforced by review)
1. `components/*` may import `lib/repos` **interfaces**, never `lib/supabase/*` directly.
2. `lib/repos/supabase/*` is the only place that touches the Supabase client.
3. Domain types live in `lib/types.ts`; Zod schemas in `lib/schema.ts`; they agree
   (`z.infer` is the source of truth for form values).
4. UI state (sidebar collapsed, modal open, search query) → Zustand. Server data →
   server fetch + Server Actions + `revalidatePath`. Never mirror server data in Zustand.

---

## 5. Key cross-cutting concerns

- **Auto serial (`TUT-0001`)** — generated by a Postgres trigger, never by the client.
  Concurrency-safe via a per-user counter row locked during insert (see doc 03/04).
- **Workflow timeline** — derived from the step body by `lib/workflow.ts` on save, stored
  as ordered JSONB, editable by the user. Always present so the UI never has an empty timeline.
- **Search** — Postgres full-text (`tsvector` + GIN) for tutorial fields; category/asset
  name matches joined in. A `⌘K` palette hits a single search RPC. See doc 07.
- **Error handling** — `error.tsx` + `not-found.tsx` per route segment; toast for action
  errors; inline Zod errors on forms.
