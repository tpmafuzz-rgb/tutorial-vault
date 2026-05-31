# 09 · AI Refiner

Covers: **#16 AI Refiner Architecture**

The **only** AI feature. No agents, no chat, no automation. One job: turn messy text
(YouTube transcript / raw notes) into a clean tutorial in our exact template. Simple and
reliable beats clever.

---

## 1. Flow

```
/refiner page (client)
  paste raw text ──► [Refine]
        │ POST /api/refine { raw }
        ▼
  Route Handler (server-only)
    1. require auth (session)        4. validate model JSON ⇢ refinedTutorialSchema (Zod)
    2. rate-limit (per user/min)     5. on any failure ⇢ local deterministic parser
    3. call Claude (JSON output)     6. return { ok, draft }
        ▼
  side-by-side review (raw | structured)
  [Use this] ──► /tutorials/new pre-filled ──► edit ──► Save
```

The user **always reviews** before anything is saved. The refiner only drafts.

---

## 2. Why a server Route Handler

- The Anthropic API key stays server-side (never in the browser bundle).
- We can rate-limit and validate centrally.
- The endpoint returns a strict shape the form understands, so the model's output can
  never directly become a tutorial without passing Zod.

```
POST /api/refine
  body:     { raw: string }                 // refineInputSchema: 1..20000 chars
  200:      { ok: true,  draft: RefinedTutorial }
  4xx/5xx:  { ok: false, error: { code, message } }   // client falls back gracefully
```

---

## 3. The model call

- Model: latest Claude Sonnet (fast, cheap, more than capable for restructuring).
- **Prompt caching** on the static system prompt (the template spec + rules) so repeated
  refines are cheap.
- Output forced to JSON via a tool / response schema matching `RefinedTutorial`:

```ts
type RefinedTutorial = {
  name: string; goal: string; finalResult: string;
  software: string[]; difficulty: 'Beginner'|'Intermediate'|'Advanced';
  beforeYouStart: string; steps: string;          // markdown subset
  commonMistakes: string; troubleshooting: string;
  keyboardShortcuts: string; finalChecklist: string[];
  workflow: { id: string; label: string }[];      // the timeline
};
```

System prompt (essence): *"You convert messy editing-tutorial text into this exact JSON.
Preserve real steps; never invent specifics you can't infer. Use the markdown subset
(`## `, `- `, `1. `) for `steps`. Keep it concise and beginner-friendly. Output JSON only."*

The handler validates the returned JSON with `refinedTutorialSchema`. If it doesn't parse,
or the API errors/times out, we **fall back** to the local parser so the user always gets
a usable draft.

---

## 4. Deterministic fallback (also the mock-mode engine)

`lib/refiner.ts` — a no-network parser that:
- Picks a title from the first meaningful line.
- Detects software (dictionary match) and difficulty (keyword heuristic).
- Buckets sentences into steps / mistakes / troubleshooting / shortcuts by cue words.
- Builds the **workflow timeline** from action verbs (import → organize → color → motion →
  sound → export) via the shared `buildWorkflowFromSteps()`.

This guarantees the feature works with zero credentials (mock mode) and as a safety net in
production.

---

## 5. Cost, limits, safety

| Concern | Handling |
|--------|----------|
| Key exposure | server-only env var; never shipped |
| Abuse / cost | per-user rate limit + input length cap (20k chars) |
| Bad model output | strict Zod validation → fallback parser |
| Latency | streaming optional later; V1 shows a skeleton + "Refining…" |
| Privacy | only the pasted text is sent; nothing stored unless the user saves the draft |
