# 05 · Component Hierarchy

Covers: **#6 Component Hierarchy · #4 Folder Structure (component view)**

Principle: thin pages, composable components, primitives at the bottom. A pattern that
repeats 3+ times becomes a component.

---

## Tree

```
RootLayout (fonts, providers, Toaster)
└── (app)/layout  ── AppShell
    ├── Sidebar           collapsible · nav items · brand
    ├── Topbar            GlobalSearch trigger (⌘K) · New Tutorial
    ├── GlobalSearch      command palette (Dialog)
    └── <page>

Dashboard
├── PageHeader
├── StatCard ×4               Total Tutorials · Assets · Categories · PDFs Exported
├── QuickActions              New Tutorial · Upload Asset · Create Category · Export Book
└── RecentTutorials
    └── TutorialCard ×6

Tutorials (Library)
├── PageHeader (+ New Tutorial)
├── LibraryToolbar           SearchInput · CategoryFilter · DifficultyFilter · ViewToggle
├── view = grid → TutorialCard[]      (TutorialGrid)
│        list → TutorialTable
│                 └── TutorialRow      serial · title · CategoryDot · DifficultyBadge · date · FavoriteButton
└── EmptyState

TutorialDetail
├── DetailHeader            serial · name · goal · CategoryDot · DifficultyBadge · software chips · FavoriteButton · Edit/Delete
├── WorkflowTimeline   ◄── flagship (horizontal desktop / vertical mobile)
├── Section[] (main col)   FinalResult · BeforeYouStart · Steps(RichContent) · CommonMistakes · Troubleshooting · Alternatives
├── Section[] (side col)   AssetsRequired · KeyboardShortcuts · FinalChecklist · LinkedAssets
└── ConfirmDialog (delete)

TutorialForm  (new + edit)
├── FormHeader (sticky)     Back · Cancel · Save (primary)
├── Section "Overview"      name · goal · finalResult · DifficultySelect · CategorySelect · TagInput(software) · TagInput(assetsRequired)
├── Section "The Workflow"  beforeYouStart · StepsEditor(textarea) · WorkflowEditor(+Auto-generate)
└── Section "Reference"     commonMistakes · troubleshooting · shortcuts · alternatives · ChecklistEditor · LinkedAssetsPicker

Assets
├── PageHeader (+ Upload)
├── AssetFilters (type · tag · search)
├── AssetCard[]            type glyph · name · tags · size · linked count · delete
├── UploadDialog          dropzone · name · type · tags
└── EmptyState

Categories
├── PageHeader (+ New)
├── CategoryCard[]         color dot · name · tutorial count · edit/delete
├── CategoryDialog        name · color swatches
└── ConfirmDialog

Favorites → reuses TutorialCard / EmptyState
AI Refiner → RefinerPanel (RawInput | StructuredPreview) · "Use this"
Book Export → ExportConfig (scope · title · author) · BookPreview · DownloadButton (react-pdf)
Settings → ProfileForm · ThemeToggle · DataTools (export/import/backup)
```

---

## Shared primitives (`components/ui/`, shadcn-based)

`Button` · `Input` · `Textarea` · `Select` · `Dialog` (Modal) · `Badge` · `Card` ·
`Tooltip` · `DropdownMenu` · `Skeleton` · `Toast` (sonner) · `Field` (label+hint+error).

## Domain components

| Component | Responsibility |
|-----------|----------------|
| `TutorialCard` | grid card: serial, title, goal, category, difficulty, mini timeline |
| `WorkflowTimeline` / `…Mini` | the timeline, full + compact |
| `RichContent` | render the markdown-subset step body (headings/lists/links/bold) |
| `DifficultyBadge` `CategoryDot` `FavoriteButton` | tiny shared bits |
| `TagInput` `ChecklistEditor` `WorkflowEditor` | form sub-editors |
| `StatCard` `EmptyState` `PageHeader` | layout helpers |
| `BookDocument` (+ Cover/TOC/Chapter/Footer) | react-pdf document tree |

---

## State ownership

| State | Where |
|-------|-------|
| Sidebar collapsed, modal/dialog open, view toggle, search query | Zustand / local `useState` |
| Form values | `useState` shaped by Zod `z.infer` (RHF optional for large forms) |
| Server data (tutorials, assets…) | server fetch → props; mutations via Server Actions + `revalidatePath` |
| Theme | `profiles.theme` (persisted) + class on `<html>` |

No server data is duplicated into Zustand — the cache is the server + RSC.
