# 10 · Roadmap & Quality

Covers: **#17 Build Roadmap · #18 MVP · #19 V2 · #20 Bug Prevention**

---

## 1. Build roadmap (phased, each phase shippable)

### Phase 0 — Foundation (½–1 day)
Scaffold Next.js + TS + Tailwind + shadcn. Design tokens in `tailwind.config`. Inter via
`next/font`. AppShell (Sidebar + Topbar). Repository interfaces + **mock repo** seeded.
→ *Outcome: app runs on mock data, navigable shell.*

### Phase 1 — Tutorial core (the heart)
Library (list + grid + filters), TutorialCard, New/Edit `TutorialForm`, Detail page,
**auto serial**, **Workflow Timeline** (+ auto-generate), `RichContent`.
→ *Outcome: full CRUD on mock data; the encyclopedia works.*

### Phase 2 — Organize & find
Categories CRUD, Favorites, `⌘K` Global Search.
→ *Outcome: a usable knowledge vault.*

### Phase 3 — Supabase wiring
Run `04-supabase-setup.sql`. Add `lib/supabase/*` clients + `@supabase/ssr` auth +
middleware + login. Implement `repos/supabase/*`. Flip `NEXT_PUBLIC_DATA_MODE`.
→ *Outcome: real persistence, real auth, RLS. (Needs your keys.)*

### Phase 4 — Assets
Upload to Storage, AssetCard/grid, linking to tutorials, signed-URL downloads.

### Phase 5 — Flagships
Book Export (react-pdf: cover → TOC → chapters → page numbers → footer) + export logging.
AI Refiner (`/api/refine` + Claude + Zod + fallback). (Refiner needs the Anthropic key.)

### Phase 6 — Settings & polish
Profile, theme (light/dim), export/import/backup JSON. Empty/error/loading states audit,
responsive QA at 375 / 768 / 1280, a11y pass, motion polish.

---

## 2. MVP (what "done enough to use daily" means)

**In:** Auth · Tutorial CRUD with full template · auto serial · Workflow Timeline ·
list/grid · categories · favorites · global search · Supabase persistence + RLS ·
responsive · empty/error states.

**Deferred from MVP (fast-follow):** Assets, Book Export, AI Refiner, dim theme,
data import/export. (All designed now so they slot in cleanly.)

This keeps MVP focused on the core promise — *capture and retrieve editing knowledge* —
without waiting on PDF/AI/storage plumbing.

---

## 3. Version 2 roadmap

- **Dim theme** + theme system polish.
- **Exact TOC page anchoring** in PDF; export presets (cover styles).
- **Asset previews** (thumbnail LUTs/PNGs), drag-reorder workflow steps.
- **Refiner streaming** + "refine selection" + tone presets.
- **Saved filters / smart views** (e.g. "Advanced color grading").
- **Image/screenshot uploads inside step bodies** (Storage-backed).
- **Tiny team mode** (optional): a shared workspace with per-row ownership — only if asked;
  it stays off by the simplicity-first principle.
- **Cross-device** is already free via Supabase; add offline cache (V2.1).

---

## 4. Bug-prevention strategy

**Type & schema safety**
- TypeScript strict, no `any`. Zod schemas shared by client + server; `z.infer` is the
  single source of truth for types. RLS as the final guard even if a check is missed.

**Architecture guards**
- Repository layer: components never import the Supabase client → no leaked queries, easy
  to test, mock/real parity.
- Server data never mirrored in Zustand (kills stale-cache class of bugs).

**The usual landmines, pre-empted**
| Risk | Prevention |
|------|------------|
| Hydration mismatch | persisted/localStorage state gated behind a `useHydrated()` mount check; server & first client render identical |
| Serial race / duplicates | DB trigger with row-locked per-user counter (doc 03/04) |
| N+1 on lists | single queries with joins / the `search_tutorials` RPC; pagination everywhere |
| XSS via step body | render through the controlled `RichContent` (no `dangerouslySetInnerHTML`); links get `rel="noreferrer"` |
| Orphaned data | FKs with `on delete cascade` (links) / `set null` (category) |
| Lost AI/PDF on failure | deterministic fallbacks; downloads gated on non-empty scope |
| Secret leakage | Anthropic + service-role keys server-only; never `NEXT_PUBLIC_` |
| Unhandled async | every action returns `ActionResult`; toast on `ok:false`; `error.tsx` boundaries |

**Process**
- Vitest unit tests for `lib/` pure logic (serial format, `buildWorkflowFromSteps`,
  refiner parser, Zod schemas). Playwright smoke for core flows (create → view → search →
  export). Manual responsive checklist before each ship.

---

## 5. Definition of done (per feature)
Typed · Zod-validated · empty + error + loading states · responsive 375→1280 ·
keyboard-accessible · no console errors · matches the design tokens.
