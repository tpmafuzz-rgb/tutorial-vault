# 08 · PDF Book Export

Covers: **#14 PDF Export Architecture**

The flagship output: turn the whole vault into a published-feeling handbook PDF.

---

## 1. Approach

Use **`@react-pdf/renderer`** to declare the document as React components and render it
**client-side** (the user already has all their data on the export page; no server round
trip needed to build the PDF). After a successful download we call a Server Action to
`export.log()` so the "PDFs Exported" stat increments.

Why client-side: instant preview, no server memory/cost for rendering, works offline once
data is loaded. (If we later want server-generated PDFs for very large books, the same
`BookDocument` tree can be rendered with `renderToBuffer` in a Route Handler — noted.)

---

## 2. Document structure

```
<BookDocument>
  <CoverPage>        book title · author · creation date · "TUTORIAL Knowledge Vault"
  <TableOfContents>  auto-numbered from chapter list → "Title …… p.N"
  <Chapter> × N      one per tutorial:
        TUT-000N · Name
        Goal · Final Result
        Workflow Timeline (rendered as a numbered strip)
        Before You Start
        Step-by-Step Workflow (headings/lists)
        Common Mistakes · Troubleshooting · Shortcuts · Alternatives
        Final Checklist
  <Footer fixed>     "TUTORIAL Knowledge Vault"  ·  page number  (every page)
```

### Page numbering & TOC
react-pdf provides `render={({ pageNumber, totalPages }) => …}` on fixed views — used for
the footer page number. For the TOC we run a **two-pass** build: first compute each
chapter's start page from content length / a measured pass, then render the TOC with those
numbers. (Pragmatic V1: number chapters sequentially and show "Chapter N"; exact page
anchoring is a V1.1 refinement — flagged in the roadmap.)

---

## 3. Export configuration (UI)

```
Scope:  ◉ All tutorials   ○ By category ▾   ○ Favorites only
Title:  [ The Creator's Editing Encyclopedia ]   (default from profile.book_title)
Author: [ Alex Rivera ]                           (default from profile.author_name)
Order:  ◉ By serial   ○ By category then serial
         → Live preview (react-pdf <PDFViewer>)        [ ⤓ Download PDF ]
```

`@react-pdf/renderer`:
- `<PDFViewer>` for the live in-page preview.
- `<PDFDownloadLink>` (or `usePDF`) for the download button → `Book-Title.pdf`.

---

## 4. Styling for "published handbook" feel

- Generous margins (≈ 64px), one accent rule under chapter titles, page footer hairline.
- Inter embedded via `Font.register` (regular/medium/semibold) for crisp type.
- Monochrome, matching the app: ink text, muted secondary, hairline dividers.
- Cover: large title, small author/date block, the wordmark — calm, lots of whitespace.
- The markdown-subset step body is converted to react-pdf primitives by a small
  `pdfBlocks(steps)` helper (mirrors the on-screen `RichContent`).

---

## 5. Edge cases handled

| Case | Behavior |
|------|----------|
| No tutorials in scope | Disable Download, show "Nothing to export yet" |
| Very long step body | Natural page breaks (`wrap`), `break` on chapter starts |
| Missing optional fields | Sections render only if non-empty |
| Special characters | UTF-8 safe via embedded font |
| Large library (100+) | Chunked render; show a progress state during generation |
