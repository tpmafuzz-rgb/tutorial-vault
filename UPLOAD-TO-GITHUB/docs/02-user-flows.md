# 02 · User Flows

Covers: **#2 User Flow**

Every flow is optimized for the 3-second rule: minimum decisions, obvious primary action.

---

## 0. First run / onboarding (intentionally tiny)

```
Land → Sign in (Supabase Auth, magic link or email+password)
     → First login creates a `profiles` row (author name = email prefix, default book title)
     → Dashboard with empty states + seeded example categories (CapCut, Premiere Pro, …)
```
No multi-step wizard. The empty states *are* the onboarding ("Save your first technique").

---

## 1. Core loop — capture knowledge (the reason the app exists)

```
Creator watches a tutorial (YouTube/CapCut/TikTok)
        │
        ▼
  New Tutorial ──► fill structured template ──► Save
        │                                         │
        │                              serial TUT-000N assigned (trigger)
        │                              workflow timeline auto-generated
        ▼                                         ▼
  (optional) AI Refiner: paste transcript ──► review ──► prefill the form
```

**New Tutorial form sections** (one scroll, grouped, never overwhelming):
Overview → The Workflow (steps + auto timeline) → Reference (mistakes, troubleshooting,
shortcuts, alternatives, checklist, linked assets).

Primary action (`Create Tutorial`) is pinned top-right and always visible.

---

## 2. Retrieve knowledge (months later)

```
Need a technique
   ├─ ⌘K Global Search ─► type ─► arrow keys ─► Enter ─► Tutorial detail
   ├─ Tutorials ─► filter by category / difficulty / view toggle ─► open
   └─ Favorites ─► open a starred go-to
                         │
                         ▼
            Tutorial detail: Workflow Timeline first,
            then steps, checklist, shortcuts, linked assets
```

---

## 3. Manage assets

```
Assets ─► Upload (drag file) ─► name, type, tags ─► stored in Supabase Storage
                                                   │
                                  link to a tutorial (from asset OR from the form)
                                                   │
                              shows on tutorial detail as "Linked Assets"
```

---

## 4. Organize

```
Categories ─► Create (name + color dot) / Rename / Delete
            └─ Delete only un-categorizes tutorials; never deletes them
Favorites  ─► toggle ★ from card, list row, or detail header
```

---

## 5. Export the book (flagship)

```
Book Export ─► choose: all tutorials | by category | favorites only
            ─► set Book Title + Author (from profile, editable)
            ─► live preview (cover → auto TOC → chapters → page numbers → footer)
            ─► Download PDF  ─► export count +1 (dashboard stat)
```

---

## 6. AI Refiner (the only AI touchpoint)

```
AI Refiner ─► paste messy transcript / notes
           ─► Refine  ─► server calls Claude ─► returns structured draft
           ─► review side-by-side (raw | structured)
           ─► "Use this" ─► opens New Tutorial pre-filled ─► edit ─► Save
```
If the AI call fails, a deterministic local parser produces a draft so the flow never
dead-ends (see doc 09).

---

## 7. Settings / data ownership

```
Settings ─► Profile (name, book title) · Theme (light / dim)
         ─► Export Data (JSON download)  ·  Import Data (JSON restore)
         ─► Backup (download full snapshot)
```

---

## Navigation map

```
Sidebar (collapsible)
├── Dashboard      stats · recent · quick actions
├── Tutorials      list/grid · search · filters → detail → edit
├── Assets         grid · upload · link
├── Categories     CRUD
├── Favorites      starred tutorials
├── AI Refiner     paste → structure
├── Book Export    configure → preview → PDF
└── Settings       profile · theme · data
```
