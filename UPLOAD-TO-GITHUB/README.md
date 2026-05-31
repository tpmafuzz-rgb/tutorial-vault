# TUTORIAL — Knowledge Vault for Creators

> A premium creator knowledge operating system. Store, organize, search, and export
> editing tutorials as reusable written assets. A personal editing encyclopedia —
> **not** a note-taking app.

Apple-level minimalism · Linear-level professionalism · Notion-level organization.
Monochrome by design — the only color anywhere is the small category dot.

---

## Setup (one-time)

This app uses **Supabase** for login + database. Three short steps:

### 1. Create your Supabase project (free)
- Go to [supabase.com](https://supabase.com) → New project (free tier).
- Open **SQL Editor**, paste the entire contents of
  [`docs/04-supabase-setup.sql`](docs/04-supabase-setup.sql), and Run.
  (Creates all tables, security rules, the auto-serial trigger, and the storage bucket.)

### 2. Enable Google login
- Supabase → **Authentication → Providers → Google** → enable. Copy the **Callback URL** it shows.
- [Google Cloud Console](https://console.cloud.google.com) → APIs & Services → Credentials →
  **Create OAuth client ID** (type *Web*). Paste the Supabase Callback URL into
  *Authorized redirect URIs*. Also add `http://localhost:3001/auth/callback` for local dev.
- Copy the **Client ID** + **Client Secret** back into Supabase's Google provider → Save.

### 3. Add your keys
- Copy `.env.example` → `.env.local` and fill in:
  ```
  NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-publishable-key
  ```
  (Both are in Supabase → Project Settings → API.)

### Run
```bash
npm install      # or: pnpm install
npm run dev      # open http://localhost:3001
```

First sign-in creates your private vault (starts empty, with a few starter categories
you can rename or delete). Everything you create is stored in **your** Supabase, scoped
to your account by row-level security.

## What works
- Google login + email magic-link; sign out from Settings
- Tutorial CRUD with the full structured template + auto serial `TUT-0001`
- Auto-generated **Workflow Timeline** (editable + "Auto-generate")
- List / grid library, category & difficulty filters, `⌘K` global search
- Categories, Favorites
- **Assets** library — real file upload to private Supabase Storage
- **AI Refiner** — free local parser (no API key needed)
- **Book Export** — react-pdf handbook (cover → TOC → chapters → page numbers)
- Settings — profile, theme, JSON backup export

---

## Design package (the 20 deliverables)

Full architecture lives in [`docs/`](docs/). Start with the table below.

| # | Document |
|---|----------|
| 01 | [Product Architecture](docs/01-architecture.md) |
| 02 | [User Flows](docs/02-user-flows.md) |
| 03 | [Database Schema](docs/03-database-schema.md) |
| 04 | [Supabase SQL & RLS](docs/04-supabase-setup.sql) |
| 05 | [Component Hierarchy](docs/05-component-hierarchy.md) |
| 06 | [Design System & Screens](docs/06-design-system.md) |
| 07 | [API & Data Layer](docs/07-api-data-layer.md) |
| 08 | [PDF Book Export](docs/08-pdf-export.md) |
| 09 | [AI Refiner](docs/09-ai-refiner.md) |
| 10 | [Roadmap & Quality](docs/10-roadmap.md) |

---

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Zustand · Zod ·
`@react-pdf/renderer` · lucide-react · Supabase (Auth/Postgres/Storage, in the next phase).

## Project layout

```
app/(app)/      authenticated shell + all pages (dashboard, tutorials, assets, …)
components/      ui/ · shell/ · tutorial/ · form/ · pdf/
lib/             types · store (Zustand mock data) · schema (Zod) · workflow · refiner
docs/            the design package
```
