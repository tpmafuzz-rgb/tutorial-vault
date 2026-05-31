# 06 · Design System, Wireframes & Responsive

Covers: **#5 UI Design System · #7 Wireframes · #8 Full Page Designs · #9 Mobile · #10 Tablet**

Apple-level minimalism · Linear-level professionalism · Notion-level organization.
Monochrome by default; the *only* color in the product is the small category dot.

---

## 1. Tokens

### Color
| Token | Hex | Use |
|-------|-----|-----|
| `canvas` | `#FFFFFF` | page background |
| `surface` | `#F8F9FB` | cards' alt bg, inputs, hover |
| `line` | `#EAEAEA` | all borders/dividers |
| `ink` | `#111111` | primary text, primary button |
| `muted` | `#666666` | secondary text |
| `accent` | `#000000` | emphasis / focus |

Functional only (not in the brand palette): difficulty dots (emerald/amber/rose) and
category dots (user-chosen). Everything else is grayscale.

Dark "dim" theme (V1.1): invert to near-black canvas `#0B0B0C`, surface `#141415`,
line `#232325`, ink `#F2F2F3`, muted `#9A9A9E` — same structure, `class` strategy.

### Typography — Inter (`next/font`)
| Role | Size / weight / tracking |
|------|--------------------------|
| Display (page title) | 26–30px / 600 / -0.03em |
| Section title | 15px / 600 / -0.01em |
| Body | 14px / 400 / normal, 1.6 line-height |
| Secondary | 13px / 400 / muted |
| Mono (serial, kbd) | Inter/JetBrains mono, 11–12px |

### Spacing & shape
4px base scale. Card padding 20–24px. Radius: inputs/buttons `12px`, cards `18px`,
pills full. Shadows are whisper-soft (`0 1px 2px rgba(17,17,17,.04)`); cards lift to a
slightly larger soft shadow on hover. **No heavy shadows, no loud gradients.**

### Motion (Framer Motion, restrained)
Entry fade+rise (200–350ms, ease `cubic-bezier(.22,1,.36,1)`), card hover lift 1–2px,
dialog scale-in. Respect `prefers-reduced-motion`. 2–3 motion moments per screen, no more.

### Interactive states (non-negotiable)
Every control has hover · active · focus-visible (4px soft ring) · disabled · loading.
Every list/table has an empty state. Forms show inline Zod errors + a summary.

---

## 2. Wireframes (desktop ≥1024px)

### Dashboard
```
┌──────────┬───────────────────────────────────────────────────────┐
│ ▣ TUTORIAL│  [ 🔍 Search your vault…            ⌘K ]   [+ New ]    │
│          ├───────────────────────────────────────────────────────┤
│ Dashboard│  Welcome back, Alex                                     │
│ Tutorials│  Your editing encyclopedia                              │
│ Assets   │  ┌─────────┐┌─────────┐┌─────────┐┌─────────┐          │
│ Categories│ │ Tutorials││ Assets  ││Categories││ PDFs    │          │
│ Favorites│  │   42    ││   18    ││    6     ││    3    │          │
│ Refiner  │  └─────────┘└─────────┘└─────────┘└─────────┘          │
│ Export   │  QUICK ACTIONS                                          │
│ Settings │  [+ New][⤴ Upload][⊞ Category][▤ Export Book]           │
│          │  Recent Tutorials                          View all →   │
│  «collapse│ ┌────────┐┌────────┐┌────────┐                         │
│          │  │ card   ││ card   ││ card   │                         │
└──────────┴───────────────────────────────────────────────────────┘
```

### Tutorial Library (grid + list)
```
Tutorials                                            [+ New Tutorial]
[ 🔍 Filter…        ] [Category ▾] [Level ▾]      [▦ grid] [≣ list]

grid:  ┌ TUT-0003  ★ ┐  ┌ TUT-0002    ┐  ┌ TUT-0001 ★ ┐
       │ Teal & Orange│  │ Whoosh Trans │  │ Kinetic Title│
       │ goal…        │  │ goal…        │  │ goal…        │
       │ ●Color ·Adv  │  │ ●Premiere    │  │ ●CapCut ·Beg │
       │ ①②③④ +3   2d │  │ ①②③④ +2  4d │  │ ①②③④ +2 1w │
       └──────────────┘  └──────────────┘  └──────────────┘

list:  #        Title                 Category     Level     Updated  ★
       TUT-0003 Teal & Orange Grade   ●Color Grade Advanced  May 25   ★
       TUT-0002 Whoosh Transitions    ●Premiere    Interm.   May 18
```

### Tutorial Detail (the timeline leads)
```
← Back                                         [✎ Edit] [🗑 Delete]
TUT-0003  ★
Cinematic Teal & Orange Color Grade
Give any footage a filmic look with depth and contrast.
●Color Grading   ● Advanced   [Premiere Pro][After Effects]   Updated May 25

┌ Workflow Timeline ───────────────────────────────────────────────┐
│  ①─②─③─④─⑤─⑥─⑦                                                  │
│ Balance Set Apply Wheels Skin Grain Export                        │
└───────────────────────────────────────────────────────────────────┘
┌ main (2/3) ───────────────────────┐ ┌ side (1/3) ───────────────┐
│ Final Result                       │ │ Assets Required            │
│ Before You Start                   │ │ Keyboard Shortcuts (kbd)   │
│ Step-by-Step Workflow (rich)       │ │ Final Checklist  ☑         │
│ Common Mistakes · Troubleshooting  │ │ Linked Assets              │
└────────────────────────────────────┘ └────────────────────────────┘
```

### New / Edit Tutorial
```
New Tutorial          (serial assigned automatically on save)
┌ sticky: ← Back                                  [Cancel] [Create] ┐
│ Overview      name · goal · final result · difficulty · category │
│               · software (tags) · assets required (tags)         │
│ The Workflow  before you start · steps (mono textarea)           │
│               · Workflow Timeline editor   [✨ Auto-generate]    │
│ Reference     mistakes · troubleshooting · shortcuts · alts      │
│               · checklist · linked assets                        │
└──────────────────────────────────────────────────────────────────┘
```

### Book Export
```
Book Export
┌ Configure ─────────────┐ ┌ Live Preview ───────────────────┐
│ Scope: ◉ All           │ │  ╔══════════════╗               │
│        ○ By category   │ │  ║  Book Title  ║  cover         │
│        ○ Favorites     │ │  ║  Author·Date ║               │
│ Title: [____________]  │ │  ╚══════════════╝               │
│ Author:[____________]  │ │  Table of Contents              │
│        [⤓ Download PDF] │ │  1. Kinetic Title ........ 3    │
└────────────────────────┘ │  Ch.1  …  · page numbers · footer│
                           └──────────────────────────────────┘
```

---

## 3. Tablet (768–1023px)
- Sidebar auto-collapses to icon rail (68px); expandable.
- Grids: 3 → **2 columns**. Tutorial detail main/side stack to single column with side
  sections moving **below** the steps.
- Workflow timeline stays horizontal but scrolls if it overflows.
- Toolbars wrap; filters become a single row that wraps to two.

## 4. Mobile (375–767px)
- Sidebar becomes a **bottom-sheet / drawer** opened from a hamburger in the topbar;
  primary tabs (Dashboard, Tutorials, Search, New) optionally as a bottom bar.
- All grids → **1 column**. Stat cards → 2×2.
- **Workflow timeline switches to a vertical rail** (numbered nodes down the left).
- Forms are single-column, inputs full-width, sticky action bar at the bottom.
- `⌘K` palette becomes a full-screen search sheet.
- Min target size 44px; everything works at 375px width.

Mobile-first Tailwind: base styles target 375px, `md:`/`lg:` add density upward.
