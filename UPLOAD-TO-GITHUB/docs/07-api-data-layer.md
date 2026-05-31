# 07 · API & Data Layer

Covers: **#13 API Design · #11 Production-Ready Code Architecture (data flow)**

Supabase means we don't hand-write most CRUD endpoints — the client (under RLS) and
Server Actions do the work. The **repository layer** is our API surface; one custom Route
Handler exists for the AI Refiner.

---

## 1. The repository interface (the swap point)

`lib/repos/types.ts` defines what the app can do, independent of *where* data lives.

```ts
export interface TutorialsRepo {
  list(opts?: { categoryId?: string; difficulty?: Difficulty; favorite?: boolean;
                page?: number; perPage?: number }): Promise<Paged<Tutorial>>;
  get(id: string): Promise<Tutorial | null>;
  search(q: string): Promise<Tutorial[]>;
  create(input: NewTutorialInput): Promise<Tutorial>;   // serial assigned by DB
  update(id: string, patch: Partial<Tutorial>): Promise<Tutorial>;
  remove(id: string): Promise<void>;
  toggleFavorite(id: string): Promise<void>;
}
export interface CategoriesRepo { list; create; rename; remove }
export interface AssetsRepo     { list; upload; remove; link; unlink }
export interface ProfileRepo    { get; update }
export interface ExportRepo     { log(bookTitle, count); count() }
```

Two implementations:
- `lib/repos/supabase/*` — real (browser anon client for reads, Server Actions for writes).
- `lib/repos/mock/*` — in-memory + localStorage, seeded with example data.

A single factory picks the implementation:
```ts
export const repo = process.env.NEXT_PUBLIC_DATA_MODE === 'mock'
  ? mockRepo : supabaseRepo;
```
**Result:** the UI runs today on mock data (no creds), and switching to Supabase is one
env var — no component changes.

---

## 2. Response & error conventions

Repos return domain objects or throw a typed `RepoError { code, message }`. Server
Actions wrap calls and return a discriminated result to the UI:

```ts
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };
```
The UI maps `ok:false` to an inline field error (validation) or a toast (everything else).

For list endpoints, pagination is built in: `Paged<T> = { rows: T[]; page; perPage; total }`,
default `perPage = 20`, max `100`.

---

## 3. Operation map

| Action | Mechanism | Notes |
|--------|-----------|-------|
| List/get/search tutorials | RSC server fetch via Supabase server client | RLS-scoped |
| Create/update/delete tutorial | **Server Action** → repo → `revalidatePath` | serial via DB trigger |
| Toggle favorite | Server Action (optimistic UI) | |
| Search (`⌘K`) | RPC `search_tutorials(q)` | single round-trip, FTS + ilike |
| Category CRUD | Server Actions | unique name per user |
| Asset upload | client → Supabase Storage `upload()` then Server Action to insert row | path `{uid}/{uuid}-{name}` |
| Asset download | signed URL (short TTL) from server | private bucket |
| Link/unlink asset | Server Action on `tutorial_assets` | |
| Refine text | `POST /api/refine` (Route Handler) | only custom endpoint; see doc 09 |
| Export book | client-side react-pdf + Server Action `export.log()` | increments stat |
| Profile/theme | Server Action | |
| Export/Import data | client JSON download / upload → bulk Server Action | data ownership |

---

## 4. The one Route Handler — `POST /api/refine`

```
Request:  { raw: string }                       (auth required; rate-limited)
Response: { ok: true, draft: RefinedTutorial } | { ok:false, error }
```
Server-only: holds the Anthropic key, validates input with Zod, calls Claude, validates
the model's JSON against `refinedTutorialSchema`, falls back to the local parser on failure.
Full design in doc 09.

---

## 5. Auth

`@supabase/ssr` with cookie sessions. Middleware refreshes the session and guards the
`(app)` group — unauthenticated users are redirected to `/login`. The `(auth)` group is
public. Server clients read the session from cookies; the browser client uses the anon key.

---

## 6. Validation (shared)

`lib/schema.ts` exports Zod schemas used by **both** the form and the Server Action:
`tutorialFormSchema`, `categorySchema`, `assetSchema`, `refineInputSchema`,
`refinedTutorialSchema`. `z.infer` is the single source of truth for the corresponding TS
types — types and runtime checks can never drift.
