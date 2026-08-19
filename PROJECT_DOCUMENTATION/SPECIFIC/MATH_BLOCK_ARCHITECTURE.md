# Math Block Architecture

> **Status:** V1 implemented (2026-08); V2/V3 postponed (MVP-first).
>
> This document was the deliverable of `MATH_PROMPT.md`: a recommended long-term architecture
> for mathematical editing inside VipiClass, designed after studying the existing Slide Editor
> (EditorContext, useRichTextEditor, BlockRenderer, history, autosave, toolbar, slash menu,
> clipboard, drag-and-drop, persistence, block factories, and the ADRs).
>
> The recommended architecture was agreed and **V1 has been implemented** (commits `228a93a` →
> `d6b114f`). The editor now proceeds to the Code Block; M3/M4/M5 below are postponed so the
> platform can serve its MVP first.

---

# 1. Context & Goal

The Math Block is **not simply another content block**. Per `MATH_BLOCK_PLAN.md` it is a
specialized editing engine whose responsibility is to let teachers author, render, and reuse
professional mathematical expressions across the whole platform. Future blocks (Exercise, Quiz,
Exam, Flashcard, Assignment...) must be able to *embed* this engine rather than implement their own
math editor.

The goal of this document is to define:

- which mathematical editing engine we should use and why;
- how expressions are represented in the data model;
- whether canonical format should be LaTeX;
- how rendering and editing interact;
- how the Math Block integrates with the existing editor lifecycle;
- which parts are generic infrastructure vs Math-Block-specific;
- the architectural risks to anticipate now;
- a milestone-based roadmap.

---

# 2. Executive Summary

Recommended architecture in one paragraph:

> Store every expression as a **canonical LaTeX string**. Render it with **KaTeX** inside a small,
> reusable `MathRenderer` component. Author it with a **controlled LaTeX source editor paired with
> an immediate KaTeX preview and a symbol/template toolbar** (no full WYSIWYG math engine in V1).
> Package these as a self-contained **math engine** (`components/blocks/math/`) that the **Math
> Block** composes as a container of expressions, and that future educational blocks reuse exactly
> like they reuse `RichTextField` today.

Design decisions (details in §4–§13):

1. **Canonical format = LaTeX.** Portable, editable, AI-friendly, PDF-friendly, supported by both
   KaTeX and MathJax. Rendering is always derived from stored LaTeX (never stored HTML).
2. **Rendering engine = KaTeX.** Fastest sync render, small footprint, SSR-friendly — ideal for a
   live preview editor with many equations and mobile users. MathJax remains a documented fallback
   for rare LaTeX constructs (KaTeX supports ~85% of TeX commands; MathJax ~99%).
3. **Editing surface = LaTeX source + KaTeX preview + symbol toolbar (V1).** No full WYSIWYG math
   dependency in V1. This keeps the data model clean, the behavior deterministic, and the surface
   cheap to embed inside other blocks. **MathLive** is the identified V2 candidate if teachers
   demand a fully visual editor.
4. **Math is a dedicated block + reusable engine, not a Tiptap node in V1.** Inline math inside
   prose is deferred; embedding in other blocks uses the reusable engine, mirroring how
   `RichTextField` is embedded today.
5. **Math Block content = a list of expressions** (`expressions: [{ id, latex }]`), following the
   proven `questions[]` container pattern of Exercise/Quiz (ADR-011/012/013). The reusable unit is a
   single expression.
6. **Full integration with the existing lifecycle for free:** block factory, `BlockRenderer`,
   two-tier history, debounced autosave, clipboard/duplicate, insert menus, drag-and-drop — because
   math content is plain JSON in `block.content`, exactly like every other block.

---

# 3. Existing Architecture Recap (grounding)

The analysis is grounded in the current implementation:

- **State:** `EditorContext` owns one source of truth: `slidesHistory { past, present, future }`,
  selection, active editor, slash menu, clipboard, table state. Hooks own behavior
  (`useHistory`, `useSlides`, `useTable*`, `useExercise`, `useQuiz`, `useResources`, `useClipboard`,
  `useRichTextEditor`, `useSlashMenu`, `useLongPress`).
- **History:** two-tier — `setSlides()` records an undo step; `setSlidesWithoutHistory()` does not
  (ADR-007). Structural ops record; continuous typing/resizing do not.
- **Rich text:** Tiptap, unified through `useInitEditor` + `updateEditorUI` inside
  `useRichTextEditor`. Content is stored as `{ html }`. Complex blocks (Exercise/Quiz) route each
  field's changes through an `onContentChange` callback that performs a **functional** update of
  only that field — never replacing the whole `block.content` (data-wipe trap, ADR-011/012).
- **Complex block pattern (ADR-013):** shared building blocks in
  `components/blocks/shared/` (`RichTextField`, `ResourceSection`, `Accordion`, `Select`,
  `TimeInput`, `constants`, `styles`); per-block factories/hooks (`exerciseUtils` + `useExercise`,
  `quizUtils` + `useQuiz`) with a `withDefaults()` read-time normalizer for legacy documents.
- **Persistence:** blocks are plain JSON in `block.content` (Mongo `Mixed`); autosave serializes
  the whole `slides` array (debounced 2s) to `POST /api/lessons/:lessonId`. Clipboard/duplicate use
  `cloneBlock` (`structuredClone`).
- **Insertion:** `blocks_groups` (`editor/blocks.js`) powers the `+` menu, Insert-Menu-Between, and
  slash menu (`/type`). `BlockRenderer` dispatches `block.type` → component. Transform ("turn into")
  is hidden for `exercise`/`quiz` because their content is not a single `{html}`.

---

# 4. Technology Evaluation

## 4.1 Rendering: KaTeX vs MathJax

| Criterion            | KaTeX                          | MathJax 3                          |
| -------------------- | ------------------------------ | ---------------------------------- |
| Render speed (1 eq)  | ~2–5 ms (synchronous)          | ~20–50 ms (async/reflow)           |
| Render speed (100)   | ~50–100 ms                     | ~200–500 ms                        |
| Bundle (gzip)        | ~100 KB (+ fonts/CSS)          | ~250 KB (modular)                  |
| LaTeX coverage       | ~85% (common commands)         | ~99% (rare constructs, macros)     |
| Live preview        | Excellent (sync, no reflow)    | Good but heavier                   |
| SSR                  | Native (`renderToString`)      | Possible, more involved            |
| Accessibility        | Basic (hidden MathML)          | Excellent (explore, speech, braille)|
| Maintenance          | Actively maintained (Khan)     | Actively maintained (AMS)          |

**Decision:** use **KaTeX** for rendering in the editor.

**Rationale.** The Math Block's primary audience writes classroom math (algebra → statistics). The
editor renders a live preview on every keystroke and pages can hold many equations; KaTeX's
synchronous, reflow-free rendering is the right fit and keeps the bundle small for mobile. LaTeX is
the canonical format, so a future switch to MathJax (for rare constructs or advanced accessibility)
requires no data migration — only a different renderer behind the same `MathRenderer` interface.

**Risk mitigation:** render with `throwOnError: false` and surface an inline error message in the
editor when a construct is unsupported, rather than crashing. Documented "switch to MathJax" path in
§12.

## 4.2 Authoring / editing surface

| Option                        | Fit for V1 | Notes                                            |
| ----------------------------- | ---------- | ------------------------------------------------ |
| **LaTeX source + KaTeX preview + symbol toolbar (recommended)** | High       | Deterministic, cheap to embed, canonical LaTeX; toolbar/templates make LaTeX mostly invisible |
| MathLive (WYSIWYG, math-virtual-keyboard) | Medium     | Mature, great UX/mobile; heavyweight dep; internal MathML→LaTeX serialization adds integration risk; stronger candidate for V2 |
| MathQuill (CSS-based WYSIWYG) | Low        | Aging/unmaintained; brittle on modern browsers/mobile |
| Tiptap math node (`$...$`)    | Medium     | Enables inline math *inside prose*, but drags ProseMirror math serialization complexity and mixes HTML+math content (against "LaTeX canonical") |
| Commercial (Wiris MathType)   | Low        | Licensing, heavyweight, SaaS coupling            |

**Decision:** V1 uses **LaTeX source editing with an immediate KaTeX preview and a symbol/template
toolbar** that auto-generates LaTeX snippets. The plan's design principle "teachers should not have
to memorize LaTeX; toolbar actions generate syntax automatically" is satisfied by the toolbar, the
grouped symbol palette, and templates.

**Rationale.** Consistent with the project's values (ADR-008 progressive, ADR-009 reuse, minimal
dependencies, one source of truth). A lean editor keeps `block.content` as pure LaTeX, which is what
makes the engine embeddable everywhere and export/PDF/AI-friendly.

## 4.3 Standalone block vs Tiptap node

- **Not** a Tiptap math node in V1: the plan defines the Math Block as a standalone specialized
  engine, and storing math as a separate `latex` field (not inside rich-text HTML) preserves the
  canonical format and keeps rich-text serialization untouched.
- **Deferred:** inline math inside prose (e.g. "the value of $x$ is…") requires a Tiptap node or an
  inline embed; noted in §14 as a future capability, not a V1 requirement.

---

# 5. Recommended Architecture

## 5.1 Layer overview

```
┌─────────────────────────────────────────────────────────────┐
│  Math Engine  (generic infrastructure, reusable everywhere)  │
│                                                             │
│  MathRenderer   → KaTeX render of a single { latex }        │
│  MathEditor     → LaTeX source + preview + symbol toolbar   │
│  MathSymbols    → grouped symbol/template definitions       │
│  mathStyles     → styles                                    │
│                                                             │
│  state: none (controlled component) — writes via onChange   │
└─────────────────────────────────────────────────────────────┘
              ▲                            ▲
              │ compose                    │ embed (future)
┌─────────────┴──────────┐        ┌─────────┴──────────────────┐
│  MathBlock (container) │        │ Exercise / Quiz / Callout  │
│  content: {            │        │ (reuse MathField later)    │
│    title,              │        │                            │
│    expressions[]       │        └────────────────────────────┘
│  }                     │
│  hook: useMath         │
└────────────────────────┘
```

## 5.2 Component hierarchy

```
Editor
└── SlideCanvas
    └── BlockRenderer  (add case: block.type === "math")
        └── MathBlock
            ├── EditableTitle        (reused from ../EditableTitle)
            └── MathExpression[]     (one per expression)
                └── MathEditor
                    ├── MathSourceInput      (controlled LaTeX textarea/input)
                    ├── MathPreview          (MathRenderer in preview mode)
                    └── MathSymbolToolbar    (grouped symbol panels → inserts LaTeX)
                    (read-only sibling: MathRenderer used directly)
```

- **`MathRenderer`** — the only place KaTeX is called. Props: `{ latex, display, className }`.
  Renders `katex.renderToString(latex, { displayMode: display, throwOnError: false })`. Used by the
  block preview, by a read-only render mode, and (future) by Exercise/Quiz/Flashcard/Pdf.
- **`MathEditor`** — controlled component. Props: `{ value: { latex }, onChange({latex}),
  autoFocus }`. Internally holds the LaTeX string, a debounced KaTeX preview, and the symbol
  toolbar. Local UI state only — no shared state (consistent with ADR-003: components consume
  state; the editor is a controlled leaf).
- **`MathBlock`** — the block-specific container. Owns the expressions list, title, metadata and
  the CRUD operations. It is the only "Math-Block-specific" surface; the editor/renderer beneath it
  are generic.

---

# 6. Data Model

## 6.1 Canonical representation

Every mathematical expression is stored as a **LaTeX string**. No rendered HTML is persisted.

```javascript
// single reusable expression unit
{ latex: "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}" }
```

**Why LaTeX (and why not HTML/MathML as canonical):**

- portable and versionable;
- directly editable;
- AI-friendly (LLMs emit/parse LaTeX natively — relevant for Phase 10);
- PDF/export-friendly (KaTeX HTML for web, TeX/LaTeX for print);
- supported by both KaTeX and MathJax, so the renderer can change without migration;
- plain string inside JSON → autosave, clipboard, duplicate, history all work unchanged.

## 6.2 Math Block content

```javascript
content: {
  title: "Quadratic formula",
  expressions: [
    { id: "me_...", latex: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" },
    { id: "me_...", latex: "\\Delta = b^2 - 4ac" }
  ]
}
```

The block is a **container of expressions**, mirroring `questions[]` in Exercise/Quiz
(ADR-011/012/013). The reusable unit is a single `{ id, latex }` expression.

Rationale:

- a professor's lecture contains many formulas — one expression per block would force dozens of
  blocks;
- the container enables add/remove/reorder/duplicate per expression with existing CRUD patterns;
- `useMath` operates on a single block via functional `setSlides`/`setSlidesWithoutHistory`
  updates (mirrors `useExercise.mutateQuestions`), so the data-wipe trap is avoided;
- a `withDefaults()` read-time normalizer migrates any future/simple `{ latex }` shape into
  `expressions[]` without a data migration (same trick as Exercise legacy migration, ADR-013).

## 6.3 Placement in the hierarchy

```
Lesson
└── Slides[]
    └── Blocks[]
        └── { type: "math", content: { title, expressions[] } }
```

`content` remains MongoDB `Mixed` (see `models/Lesson.js`) — no schema change required.

---

# 7. State Management Strategy

| Concern        | Owner                                                          |
| -------------- | -------------------------------------------------------------- |
| Slides truth   | `EditorContext.slidesHistory` (unchanged)                      |
| Block content  | `block.content` inside slides                                  |
| Math mutations | `useMath({ slideId, blockId })` hook (new)                     |
| Editor UI      | Local state inside `MathEditor` (LaTeX draft, open symbol panel) |
| Preview        | Derived from the current draft via `MathRenderer`              |

**`useMath` hook** (mirrors `useExercise` / `useQuiz` / `useResources`):

- `updateField(field, value, { recordHistory })` — title / metadata.
- `mutateExpressions(updater, recordHistory)` — functional update of `content.expressions`.
- `addExpression`, `removeExpression(id)`, `duplicateExpression(id)`, `moveExpression(id, dir)`.
- `updateExpression(id, patch)`.

**History rules (ADR-007):**

- Structural ops (add/remove/duplicate/reorder expression, rename title) → `setSlides`
  (`recordHistory: true`).
- Continuous LaTeX typing in the source field → `setSlidesWithoutHistory` (debounced per keystroke
  would flood the undo stack otherwise). Because the source is a plain controlled input, "typing"
  is one logical event stream; we batch the update (see §8).

**Why local UI state is safe:** the LaTeX source is held in the `MathEditor` during typing and
flushed to `block.content` through `onChange`. On undo/redo or external changes, an
`updateMathUI`-style sync (mirroring `updateEditorUI` in `useRichTextEditor`) reconciles the draft
from props without clobbering the user's caret mid-typing.

---

# 8. Rendering & Editing Pipeline

## 8.1 Rendering pipeline

```
block.content.expressions[i].latex
        │
        ▼
   MathRenderer (katex.renderToString)
        │
        ▼
   HTML + CSS (KaTeX fonts loaded once)
        │
        ▼
   <span class="katex">…</span>
```

- KaTeX CSS + fonts imported once (app/globals or the math module entry) to avoid font flash.
- Preview mode vs final mode differ only by `displayMode` and error surface:
  - final (render/read) — `throwOnError: false`, unsupported constructs show the raw LaTeX;
  - preview (editing) — same plus an inline "syntax" indicator when KaTeX errors, so teachers can
    fix as they type.
- SSR note: Next.js App Router pages that render math can call `katex.renderToString` server-side
  for export/PDF (future), while the editor stays client-rendered (`"use client"`).

## 8.2 Editing pipeline

```
Teacher types / clicks symbol
        │
        ▼
MathSourceInput (controlled)  ← MathSymbolToolbar inserts LaTeX snippet
        │  onChange({latex})
        ▼
debounced (e.g. ~150–250ms)
        ▼
useMath.updateExpression(id, { latex })   → setSlidesWithoutHistory
        │
        ▼
EditorContext → MathBlock rerender → MathPreview updates
        │
        ▼
autosave (existing 2s debounce) → POST /api/lessons/:lessonId
```

- **Two debounces, one for each concern:** a short one for the KaTeX preview (keeps typing fluid)
  and the existing autosave debounce. History is *not* recorded per keystroke.
- The symbol toolbar inserts **templates with placeholders** (e.g. `\frac{}{}` with cursor between
  braces) so teachers do not type LaTeX by hand for the plan's V1/V2 operator sets (§11).

---

# 9. Editor Lifecycle & Integration Points

The Math Block must satisfy the plan's §4.4 (undo/redo, autosave, copy/paste, duplicate, selection,
multi-selection, drag & drop, block history) — all of which fall out of the existing infrastructure
because math content is ordinary JSON.

| Integration point            | How it is satisfied                                                               |
| ---------------------------- | --------------------------------------------------------------------------------- |
| **Block factory**            | `addBlock` in `useSlides.js` gains a `createMathBlock()` branch (mirrors exercise/quiz), or uses `mathUtils.createMathBlock`. |
| **Insertion menus**          | Add a `math` entry to `blocks_groups` "Education" (icon e.g. `Sigma`/`Braces` from lucide), so `+` menu, Insert-Menu-Between, and slash `/math` work automatically. |
| **BlockRenderer**            | Add `{block.type === "math" && <MathBlock .../>}`.                                 |
| **History (undo/redo)**      | `useMath` routes through `setSlides`/`setSlidesWithoutHistory` (ADR-007).          |
| **Autosave**                 | Automatic — slides JSON is serialized by `SlideEditor`'s existing debounced save.  |
| **Clipboard / duplicate**    | Automatic — `cloneBlock` uses `structuredClone`, so `{ latex }` strings copy/duplicate intact. Multi-select copy/paste works too. |
| **Selection / multi-selection / long-press** | Automatic — `BlockRenderer` wrapper handles it; `MathBlock` uses `stopPropagation` on inner controls like Exercise/Quiz. |
| **Drag & drop**              | Automatic — blocks are reordered by `SortableBlock`; math content is inert JSON.  |
| **Block actions menu**       | Automatic; "Turn into" is hidden for `math` (add to the `hideTransform` condition in `BlockRenderer`) because content is not a single `{ html }`. |
| **Shared rich text pipeline**| Not used — math fields are not Tiptap. This is intentional; math has its own engine but follows the same *shape* (controlled field + onChange + functional update). |
| **Toolbar**                  | Math uses its own `MathSymbolToolbar` (category panels), not `EditorToolBar` (which targets the active Tiptap editor). `Select` from `shared/` can be reused for any math options. |

**Lifecycle parity check:** because `MathBlock` is a normal block, add/duplicate/delete/reorder,
undo/redo, save indicator, and cross-slide copy all work with zero math-specific code — the same
guarantee Exercise/Quiz enjoy.

---

# 10. Generic Infrastructure vs Math-Block-Specific

| Generic infrastructure (reused by future blocks) | Math-Block-specific |
| ------------------------------------------------ | ------------------- |
| `MathRenderer` (KaTeX render)                    | `MathBlock` (container + CRUD) |
| `MathEditor` (source + preview + toolbar)        | `mathUtils.createMathBlock` |
| `MathSymbols` (grouped symbols/templates)        | `useMath` block-scoped wrapper |
| `mathStyles`                                     | toolbar categories tailored to a block (e.g. math inside a quiz prompt) |

**Rule (per ADR-009):** Exercise/Quiz/Flashcard/Callout/Code-explanations embed `MathRenderer` (and
later `MathEditor`) — they must **never** implement their own math parsing or LaTeX rendering. The
folder layout mirrors the `Table/` precedent (ADR-013): `components/blocks/math/` for the engine,
`hooks/useMath.js` + `hooks/mathUtils.js` for behavior, and the block component in
`components/blocks/`.

---

# 11. Proposed ADRs

## ADR-M001 — Canonical representation is LaTeX
**Status:** Accepted (from MATH_BLOCK_PLAN.md §5)
**Context:** expressions must be portable, editable, AI/PDF-friendly, renderer-agnostic.
**Decision:** `content` stores LaTeX strings only; rendering is always derived.
**Consequences:** no HTML persistence; renderer swap (KaTeX→MathJax) needs no migration.

## ADR-M002 — KaTeX is the rendering engine
**Context:** live preview, many equations, mobile users, React/Next SSR.
**Decision:** KaTeX behind a single `MathRenderer` component; `throwOnError: false`.
**Consequences:** fast sync render; ~85% LaTeX coverage — rare constructs fall back to raw LaTeX
with an inline notice; documented MathJax upgrade path.

## ADR-M003 — Math is a standalone block + reusable engine, not a Tiptap node in V1
**Context:** inline math inside prose would require a ProseMirror/Tiptap math node and mixing math
into rich-text HTML.
**Decision:** math content lives in a dedicated `latex` field; the block and the engine compose it.
Inline math in prose is deferred (§14).
**Consequences:** canonical format stays pure; no interference with rich-text serialization;
future inline math can be added as an embed without changing the data model.

## ADR-M004 — LaTeX source + KaTeX preview + symbol toolbar is the V1 authoring surface
**Context:** need "author without memorizing LaTeX" without a heavyweight WYSIWYG dependency.
**Decision:** controlled LaTeX source editor, immediate debounced preview, grouped symbol/template
toolbar generating LaTeX snippets. MathLive evaluated as V2 (§12).
**Consequences:** deterministic behavior, small bundle, trivially embeddable in other blocks; some
users may still want a fully visual editor later.

## ADR-M005 — Math Block content is a container of expressions
**Context:** lectures contain many formulas; the engine's reusable unit is one expression.
**Decision:** `content = { title, expressions: [{ id, latex }] }` with a `withDefaults()` normalizer;
CRUD via `useMath` functional updates.
**Consequences:** mirrors `questions[]` patterns (ADR-011/012/013); extensible to any metadata later
(`display` vs `inline`, labels, tags).

## ADR-M006 — Math uses the existing editor lifecycle, not parallel systems
**Context:** plan requires full editor integration (undo, autosave, clipboard, dnd, history).
**Decision:** math is an ordinary block whose content is JSON; all structural ops go through the
existing `setSlides`/clipboard/dnd/history/autosave machinery. "Turn into" is hidden for `math`.
**Consequences:** near-zero bespoke integration code; the block inherits every existing guarantee.

---

# 12. Trade-offs & Risks

| Trade-off / risk | Chosen side | Mitigation |
| ---------------- | ----------- | ---------- |
| KaTeX coverage vs MathJax coverage | KaTeX (speed, bundle) | canonical LaTeX ⇒ swap later; error surface + fallback rendering |
| LaTeX source-first vs WYSIWYG (MathLive) | source-first V1 | symbol toolbar + templates hide LaTeX; MathLive is the concrete V2 upgrade path |
| Standalone block vs inline math in prose | standalone V1 | inline math tracked as future capability; same `{latex}` unit, so no migration |
| Multi-expression container vs single expression | container | matches `questions[]` precedent; single-expression blocks remain a degenerate case |
| Render cost of many equations on a slide | KaTeX sync render is fast; still, per-expression render is O(n) | `React.memo` on `MathRenderer`; debounce preview; only render preview for the focused expression (lazy like Exercise/Quiz accordions) |
| Bundle/font weight | ~100 KB KaTeX + fonts | import fonts once; lazy-load KaTeX for the read-only render path if needed |
| Accessibility | KaTeX basic MathML | MathJax's accessibility is the documented fallback; add ARIA + `aria-label` on renderer in a later pass |
| Data-wipe trap on whole-content writes | avoided | `useMath` always uses functional field-level updates (ADR-011 lesson) |
| Undo flooding during typing | avoided | two-tier history (typing → `setSlidesWithoutHistory`) |
| Paste of LaTeX from external sources | possible garbage LaTeX | sanitize/validate on paste; error indicator; import/export LaTeX (V3) |

---

# 13. Implementation Roadmap (small milestones)

Mirrors `MATH_BLOCK_PLAN.md` V1→V3 while following the project's progressive philosophy
(make it work → debug → refactor → modularize).

### M0 — Skeleton & lifecycle integration ✅
- Add deps: `katex` (+ CSS/fonts import), pick `lucide-react` math icons.
- Create `components/blocks/math/` skeleton: `MathRenderer`, minimal `MathEditor`,
  `mathUtils.js` (`createMathBlock`, `withDefaults`, `createExpression`), `useMath`.
- Register block: `blocks_groups` entry (Education), `useSlides.addBlock` factory,
  `BlockRenderer` case, `hideTransform` for `math`.
- Verify end-to-end: insert via `+`, between-menu, `/math`; autosave persists LaTeX; undo/redo,
  duplicate, copy/paste, drag-drop all work.

### M1 — Math V1 editing (Basic Operators → Roots) ✅
- `MathSourceInput` + debounced `MathPreview`.
- `MathSymbolToolbar` with categories: Basic, Fractions, Roots, Powers, Parentheses, Greek,
  Symbols — each button inserts a LaTeX snippet/placeholder (operators `± × ÷ ≤ ≥ ≈ …`,
  `x² x³ xⁿ`, `\frac{}{}`, `\sqrt{}`, `\sqrt[n]{}`, Greek letters, `∞`, `°`, `%`).
- Preview error indicator (KaTeX `throwOnError: false` + message).
- History policy wired (`updateExpression` → `setSlidesWithoutHistory`; structural ops recorded).

### M2 — Expressions lifecycle & polish ✅
- Add/remove/duplicate/reorder expressions (CRUD buttons mirroring QuestionCard).
- Editable title (reuse `EditableTitle`).
- Focus management: click on preview focuses the source; Escape blurs back to block level.
- `React.memo` on `MathRenderer`; render preview only for the focused expression.

### M3 — Math V2 scientific sets ⬜ POSTPONED (MVP-first)
- Symbol sets: Calculus (integrals, limits, summations, products, derivatives, partials), Linear
  Algebra (matrix/determinant/vector environments), Logic, Sets, Geometry — as additional grouped
  panels.
- Templates (Quadratic formula, derivative definition, matrix template, …) insert as ready-to-edit
  snippets.
- Import/Export LaTeX actions on the block menu.

### M4 — Reuse surface & accessibility ⬜ POSTPONED (MVP-first)
- Embed the engine in other blocks (first target: math inside Exercise prompts / Quiz prompts, then
  Callout). This is the payoff of §10 — no duplicated math logic.
- Symbol search + favorites (V3), custom templates, keyboard shortcuts.
- Accessibility pass on `MathRenderer` (MathML/ARIA); evaluate MathJax fallback for rare content.

### M5 — Platform integration ⬜ POSTPONED (MVP-first)
- SSR KaTeX rendering for export/PDF and read-only lesson view.
- AI-generated formulas harness (Phase 10) producing canonical LaTeX.
- Evaluate MathLive as an optional visual authoring surface; graph plotting later (non-goal now).

---

# 14. Explicitly Out of Scope (V1)

- Inline math inside rich-text prose (needs a Tiptap node or embed — future capability).
- CAS, symbolic simplification, numeric solving, graph plotting (MATH_BLOCK_PLAN.md §9).
- Student submissions, grading, review tracking.
- Multi-line equation alignment environments beyond basic templates (add with demand).

---

# 15. Open Questions for the Team

1. Should a Math Block default to **one** empty expression, or seed with a placeholder template
   (e.g. the quadratic formula) for discoverability?
2. Confirm the **MathLive V2** appetite: is a fully visual editor worth the dependency for the
   target teachers, or is source+toolbar enough long-term?
3. Where should inline math appear first — inside rich text, inside quiz/exercise prompts, or both
   (both reuse the same `{ latex }` unit either way)?
4. Do we need equation **labels/references** (e.g. `\label`/`\eqref`) in the long run? If yes, KaTeX
   may need MathJax for that specific feature — worth tracking now.

---

# 16. Editing Experience & Math Engine — Architecture Deepening

This section formalizes the design decisions that the high-level architecture (sections 1–15) only
implied. It is a **separate, additive layer** of the document. Its objective is not to add
implementation complexity but to make architectural choices *once*, before coding, so the engine can
survive years of evolution without being rediscovered during implementation and refactored later.

A single mental model runs through everything below:

> The math engine is **data-driven**. Symbols, templates, placeholders, and shortcuts are
> *configuration*. The engine is a set of **generic, context-free constructions** (renderer, editor,
> toolbar, registries, placeholder/cursor engines, parsers). Only a thin **block-adapted layer**
> (`MathBlock`, `useMath`) knows about slides and editor state. Future blocks reuse the generic layer
> without inheriting MathBlock behavior.

---

## 16.1 Expression Model

### The problem with `{ id, latex }`

`expressions: [{ id, latex }]` is a correct *minimum*, but it conflates "content" with "document".
A real expression wants to carry decisions about how it is rendered, how it behaves in the UI, and
(only when a concrete need exists) who created it and when. The trap is the opposite: adding too many
fields now, with no consumer, is over-engineering.

### Recommended model (decided today)

```javascript
expression: {
  id: string,          // stable identity (React key, reorder, clipboard, references)
  latex: string,       // canonical content — the ONLY source of truth
  mode: "inline" | "display",   // KaTeX displayMode; default "display"
}
```

`block.content`:

```json
{
  "title": "Quadratic formula",
  "expressions": [
    { "id": "me_1", "latex": "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}", "mode": "display" },
    { "id": "me_2", "latex": "\\Delta = b^2 - 4ac", "mode": "display" }
  ]
}
```

### Which fields belong *today*

| Field | Why now |
| ----- | ------- |
| `id` | Identity for keys, reorder, duplicate, multi-select, and (future) references. Cannot be guessed. |
| `latex` | The content. |
| `mode` | Changes *behavior* (KaTeX `displayMode`, vertical metrics, and how the editor sizes itself). Added later would be a brand-new field on every stale item — a small migration every embedder repeats. Cheap now. |

The decision rule for "today" vs "later":

> A field is added today **only if** (a) it changes render/edit/history behavior now, or (b) adding
> it later would be painful or lossy across the whole corpus. Everything else is deferred.

### Which fields should *wait* (and why)

| Field | Defer because | How it arrives later (non-breaking) |
|-------|---------------|--------------------------------------|
| `collapsed` (open/closed in UI) | Pure UI state; per-session, not per-document. | Live in component state; if we later want it persisted, it's an additive boolean read by `withDefaults`. |
| `metadata` (tags, subject, attribution, source) | No consuming feature yet; shape is unknown (abstraction would be speculative, per ADR-008). | Add an additive `metadata: Mixed` field read via `withDefaults`; Mongo `Mixed` accepts it without a schema migration. |
| `createdAt` / `updatedAt` | Only valuable for audit, sorting, or diffing — none needed in V1. Costs bytes on every expression. | Add later; backfill semantics documented (fill = time of migration) because historical timestamps are unrecoverable — acceptable when the consumer appears (collaboration / versioning, Phase 5+). |
| `label` / `ref` (equation numbers) | Requires `\label`/`\eqref`, which KaTeX lacks (see §15 Q4). | Add with the MathJax/reference work; additive field. |
| visual overrides (color, size, alignment) | Styling belongs to *theme/props*, not the document. | Pass as renderer props, never as document fields, unless a product feature genuinely needs per-expression overrides. |

### How to avoid over-engineering

1. **Every field must map to a current behavior or a named roadmap item.** If neither, it does not
   get a slot today.
2. **The model is normalized by the read-time normalizer (`withDefaults`), not by Pascal-case
   structs.** Unknown or missing fields are merged with defaults and pass through untouched, so
   evolution is purely additive:
   - old documents `{ latex }` → render as `{ latex, mode: "display" }`;
   - future docs with extra fields → still render with today's code;
   - field traversal for `id`/`latex`/`mode` stays the only hard contract.
3. **Do not model "states" (collapsed/selected/hovered) in the document.** Those live in UI state,
   exactly like `selection`/`showActions` live outside `block.content` today.
4. **Treat nesting as one expression = one unit.** The reusable contract is a single expression; the
   block is a container. Nothing else branches the data model.

### How future evolution stays compatible

- `withDefaults()` is the single migration point — no per-release migration scripts for simple
  additive fields.
- `id`, `latex`, `mode` are the only fields the engine reads; extra fields are preserved opaquely
  (`structuredClone` passes them through).
- A future **"simple expression"** flag (§16.7) would be *inferred*, not stored, so no new field.
- A future **expression-level undo within an editor** (§16.6) is an engine capability, not a data
  change.

---

## 16.2 Toolbar Architecture

The toolbar must be an **engine**, not a pile of buttons. Concretely: a symbol toolbar is a *generic
component that renders an ordered set of configured groups*. Adding a symbol = adding a data entry,
never editing JSX.

### Configuration-driven data model

Mirror the proven `blocks_groups` pattern (`editor/blocks.js`):

```js
// mathSymbols.js — pure data (no components)
export const MATH_GROUPS = [
  { id: "basic",  label: "Basic",  items: [ /* SymbolItem | TemplateItem */ ] },
  { id: "fractions", label: "Fractions", items: [...] },
  { id: "roots",   label: "Roots",   items: [...] },
  // powers, calculus, matrices, greek, logic, sets, geometry, templates ...
];
```

Where each item is a discriminated union:

```js
// symbol item (leaf token)
{ type: "symbol",   id, latex,            // e.g. "\pm" or "\infty"
  keywords: [], description?, group?, icon? }

// template item (structured construct)
{ type: "template", id, templateId,       // references the Template Registry (§16.3)
  keywords: [], description?, group?, icon? }
```

### How toolbar groups are organized & registered

- **One registry, many views.** `MATH_GROUPS` is the single source of truth. Components never
  hardcode a symbol list; they render whatever the registry contains.
- **Registration = the registry.** A category is registered by adding its group object to
  `MATH_GROUPS`. Order in the array is the default order in the panel. Category labelling, keywords,
  and search are all data attributes.
- **Reusable across blocks.** `MathSymbolToolbar` takes `{ groups, onInsert, compact? }`. A block
  (Math/Exercise/Quiz/Flashcard) passes either the full registry or a *filtered* selection
  (e.g. quiz embeds a "Basic" + "Greek" toolbar for its option labels). Reusability is
  therefore reusing the same registry + component, exactly like `RichTextField` reuses the editor
  pipeline.

### How toolbar buttons insert LaTeX

All insertion funnels through a single **insert command** handled by `MathEditor`:

```js
onInsert(item) {
  const result = item.type === "symbol"
    ? Insert.symbol(item.latex)                 // cursor after the token
    : Insert.template(item.templateId);          // placeholder-aware, §16.4
  MathEditor.applyInsert(result);                // calls onChange + cursor engine
}
```

- **Symbols** insert a raw token at the caret and move the caret after it.
- **Templates** go through the **Template** + **Placeholder** engines so the caret lands inside the
  first placeholder (§16.3, §16.4).
- Multi-cursor / replacement of a selected range (if the user selected text first, the insert wraps
  it) is handled by one rule in the apply-insert step, not scattered.

### Symbols vs templates (decided)

- `symbol` — a leaf token with no sub-structure (`+`, `\pi`, `\pm`, `\infty`).
- `template` — structured constructs (fraction, sqrt, integral, sum, matrix) that carry placeholders
  + a cursor contract, defined in the Template Registry (§16.3).
- The distinction is *structural*, and it is exactly what makes the cursor engine generic (§16.4).

### Extensibility contract

- **Add a symbol**: one data literal (optionally an icon) inserted into a group. No component edits.
- **Add a category**: one item entry. 
- **Re-skin / types**: category labels, keywords, and order are all data; a design pass changes
  data/CSS, not JSX.

---

## 16.3 Template System

A **template is not text** — it is a structured definition that knows what to insert and *where the
caret/placeholders go after insertion*.

### Template registry (data)

```js
// mathTemplates.js — pure data
export const MATH_TEMPLATES = {
  "quadratic": {
    id: "quadratic",
    description: "Quadratic formula",
    keywords: ["quadratic", "formula", "roots"],
    category: "Templates",
    latex: String.raw`x = \frac{!0}{!1}`,        // placeholder markers
    placeholders: [ "{-b \\pm \\sqrt{b^2-4ac}}", "{2a}" ],
    cursorAt: 0,                                  // caret starts in placeholder 0
  },
  "sqrt": {
    id: "sqrt",
    keywords: ["root", "square"],
    category: "Roots",
    latex: `\sqrt{!0}`, placeholders: ["{value}"], cursorAt: 0,
  },
  "integral": {
    id: "integral",
    keywords: ["integral", "integrate"],
    category: "Calculus",
    latex: `\int_{!0}^{!1} !2`, placeholders: ["{lower}", "{upper}", "{integrand}"], cursorAt: 0,
  },
};
```

Key points:

- `latex` uses **placeholder tokens** (`!0`, `!1`, …) resolved by the Placeholder Engine, not
  hardcoded `{}`. This is what lets one template system serve fractions, roots, integrals, sums,
  matrices, and any future construct without new per-construct code.
- Each template can define per-placeholder default *seed content* (`insert`), so inserting
  "Quadratic formula" produces `x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}` with the caret inside the first
  argument — and the user edits only the variables.
- `keywords` feed template search (a V3 "Symbol/Template palette"); `category` and `description`
  feed the toolbar and tooltips.

### How templates evolve independently of the editor

- **Templates are data, not code.** Adding one = adding a registry entry; the editor, toolbar, cursor
  engine, and MathSymbolToolbar all remain untouched.
- **The editor renders the *resolved* LaTeX, not the template.** Stored state is the resolved
  `latex` string only (template identity is not persisted). template can be freely renamed/removed
  without corrupting saved documents — a subtle but important decoupling: the *document* holds math,
  the *template* is just a convenient authoring shim.
- **Discovery is registry-driven.** Search, favorites, recent, "templates for this category" all read
  the same registry, so features can be added without branching the editor.

---

## 16.4 Cursor & Placeholder Engine

The single most important UX problem in LaTeX editors is *where the caret lands after inserting a
structure*. This is architected generically **once** so every construct (fraction, sqrt, integral,
sum, matrix, cases, aligned) benefits — including ones not yet imagined.

### Placeholder model

The engine understands a LaTeX-as-primitive template as a sequence separated by **placeholder
tokens** `!0`, `!1`, … (a reserved marker unlikely to collide with real LaTeX — see note below).

```
Input template:  \frac{!0}{!1}
Resolved fields: !0 -> "-b \\pm \\sqrt{b^2-4ac}"
                 !1 -> "2a"
Inserted doc :   \frac{-b \pm \sqrt{b^2-4ac}}{2a}
Selection map :  { 0: { from, to } covering "!0" in the result, 1: { from, to } covering "!1" }
```

The core engine, `placeholderResolve(latex, fields)`, returns:

```ts
{
  text: string,                       // fully resolved LaTeX to insert
  cursor: { from, to },               // for placeholder `cursorAt`
  placeholders: [{ index, from, to }],// for Tab navigation
}
```

- The engine is **purely algebraic over strings/caret offsets** — it has no LaTeX knowledge. It maps
  a template (which happens to be LaTeX) + a set of values → a string and position map. Any future
  construct (arguments) is covered by the same mechanism.
- **Critical mental model:** every template can be any *sequence of literal text and placeholders*
  (not only LaTeX). E.g. a "new placeholder inside a placeholder" recursion (fraction inside a
  radical) is produced by nesting templates at insert time.

### The generic insertion API

```ts
insertTemplate(latexTemplate, values, cursorAt=0) → { text, cursor, placeholders }
resolveAll(text, valueMap) //  recursively dereferences nested `!{n}` inside valueMap
navigatePlaceholder(text, placeholders, direction) // Tab/Shift+Tab across placeholder centers
```

`MathEditor.applyInsert(result)`:
- replaces the current selection;
- sets the caret at `cursor` (placeholder 0);
- stores `placeholders` in a per-editor transient (not persisted) so **Tab** walks to the next
  empty/seed placeholder, and they blink/light up as "holes".

**Why Tab/walk matters:** it turns "insert \frac{}{} " + manually reach the denominator into
"insert → type numerator → Tab → type denominator → Tab continues", which is the textbook-feel math
editing UX — and it works for *every* structure for free.

### Anti-over-engineering: keep it transport-level

- Nothing here is stored to the document. Placeholders, cursor, and selection are transient editor
  state only (§16.1).
- Implementation is a small, pure util (a few functions in `mathPlaceholder.js`) — the "engine" is
  the *interface contract*, not a big library.

**Why not just hardcode a cursor after `\frac{}{}`?** Because that approach would duplicate
per-construct cursor logic, break the moment we add matrices/environments, and fail when a
placeholder must hold default/nested content. The generic engine is the single source that
future-proofs every construct, now and later.

---

## 16.5 Keyboard Shortcut Architecture (reserve space, implement later)

Shortcuts are **deferred for V1** but the *abstraction* is designed now so the UI to wire them later
does not fight the architecture.

### Command abstraction

```js
// shortcuts.js — data + resolver, no binding logic
export const MATH_COMMANDS = {
  "insert.matrix":      { id: "insert.matrix",      label: "Insert matrix" },
  "template.quadratic": { id: "template.quadratic", label: "Quadratic formula", keyword: "quadratic" },
  "template.fraction":  { id: "template.fraction",  label: "Fraction" },
  "template.nthroot":   { id: "template.nthroot",   label: "n-th root" },
};
```

A command is `{ id, label, handler(input, { insert, selection }) }`. Handlers are injected by the
host (MathEditor or MathBlock) at the binding site, so the registry stays declarative and testable
while the actual behavior lives in the engine.

```
MATH_COMMANDS (id → command meta)
   │  each key-combo binding is a data row mapping to a command
   ▼
KEY BINDING    Ctrl+/  → "insert.matrix"
               Ctrl+Shift+F → "template.fraction"
               Ctrl+Shift+R → "template.nthroot"
```

### Shortcut registry

- A declarative `MATH_SHORTCUTS` maps `{ keyCombo } → commandId`. It is pure data: it drives both the
  real key handler and the tooltips/help UI without waiting for the implementation.
- **Resolution policy (global vs local):** the same rule as `useEditorKeyboard` today — a math
  shortcut only applies while the math editor/block is active (the `activeEditor`); it must never
  shadow browser/system behavior or the app's global `Ctrl+Z`/`Ctrl+C`. Binding is delegated so the
  existing `useEditorKeyboard` remains the single place that decides whether a math shortcut is
  consumed.
- **Composability:** keyboard, toolbar, and search all funnel into "trigger a Command with a target
  insertion" — the same `applyInsert` engine (§16.4). Adding a shortcut later needs no new execution
  path, only a new binding row.

### Extensibility

- **New shortcut = a new row** in `MATH_COMMANDS` + `MATH_SHORTCUTS` (data), no core-function edits.
- **Discovery:** tooltips and a data-driven help panel derive the bound key from the registry.
- **Future per-user / per-block overrides** are possible because bindings live outside the editor
  function; an embed can opt out of certain bindings (e.g. inline-only contexts) without changing the
  engine.

The outcome: the architecture already defines how `Ctrl+/`, `Ctrl+Shift+F`, `Ctrl+Shift+R` are
resolved even though not a single one is implemented in V1.

---

## 16.6 Formula Editing Philosophy: Independent Editors vs One Shared Engine

### The current plan: each formula owns its own `MathEditor`

`expressions.map(e => <MathEditor .../>)`. This makes each expression an **isolated, controlled
leaf**.

### Advantages (why V1 chooses this)

- **Simplicity / correctness by construction.** Each editor manages one `latex` string; there is no
  cross-expression caret state to reconcile.
- **History scoping stays at the block level** (consistent with the whole editor — history snapshots
  are document-level, via `useMath`). An independent editor writes a whole expression; that maps
  cleanly to one `updateExpression` functional update.
- **Focus management is trivial and predictable.** Focus routes to the clicked expression only;
  Escape returns to the block, mirroring how Tiptap blocks behave today.
- **Memory/performance is bounded.** A `MathEditor` with full toolbar + preview is only mounted for
  the expression that is actually being edited; the other expressions are cheap `MathRenderer`
  previews (lazy mounting, exactly like Exercise/Quiz accordions). So the expensive editors are
  never all alive at once.
- **Decoupling.** A broken or heavy editor cannot block the rest of the block/whole-page render.

### Disadvantages / limits of independence

- **No shared caret/document model** across expressions today: you can't "select across two
  formulas" or run one formatting command over several.
- **Duplicate per-editor machinery** (each focused expression needs its own toolbar state). Invalidation
  is small because only one is active, but the latent cost exists.
- **Coordinated behaviors** (e.g. shift across-expressions, cross-expression auto-numbering) are
  clumsy when editors are separate.

### The future evolution (documented, not built)

- **Phase A (V1) — independent controlled editors.** Recommended. Cost is low, matches the existing
  block model, and gives per-expression correctness.
- **Phase B (when a genuine need appears) — one shared editing engine.** If cross-expression
  selection, shared formatting, visible synchronization, or "edit a whole slide of formulas"
  (typically typing) must cover several expressions we move the *editing model* to a single,
  controlled engine that keeps a `source` pointer to the current expression and routes each change
  through `useMath.updateExpression` for the targeted id. Crucially, this is a **swap internal to
  `MathBlock`** — it changes *how much state the container coordinates*, not the public API
  (`MathEditor` stays a controlled leaf; the registries/engines are untouched).

### How this affects the shared concerns

| Concern | Independent editors (V1) | Shared engine (future) |
|--------:|:--------------------------|:-----------------------|
| History | block-level snapshots (via `useMath`) — unchanged both ways | container-level state update is still one `setSlides` op; identical footprint |
| Focus | simple, per-expression | requires routing layer that focuses the container and internal active source |
| Memory | only focused editor alive | fewer editor instances; but one heavier model |
| Performance | N previews (cheap) + 1 editor | 1 editor + N previews (similar render cost) |
| Reusability | each expression an independent consumer — trivially embeddable | engine reusable but couples expression context |

**Recommendation:** V1 = **independent controlled editors**. It is the lowest-risk, most legible,
most consistent-with-existing-blocks design, and it does not permanently preclude the shared-engine
evolution because the swap stays local to `MathBlock`.

---

## 16.7 Simple Expressions vs Full Editors

Not every expression warrants a full editor: `x²`, `a+b`, `5%`, `π`, `∞` are trivial to author and
render. Forcing the full editor chrome onto them adds visual noise and makes a tiny expression feel
unwieldy to edit.

### The principle: the distinction is a *rendering concern*, not a *data-model concern*

- The **document never stores "simple/full"**.
- Instead, the engine decides the *surface* by (a) the expression's resolved behavior and (b) whether
  it is currently being edited.

```
latex ──►  MathRenderer (always the render surface)
             │
             └── if this expression is being edited ──►  MathEditor (full surface)
                          otherwise ──►  read-only MathRenderer only
```

### Two modes determined inside `MathExpression`

1. **Full editor** — used whenever an expression is *focused/being edited*. Full toolbar, template,
   cursor engine, preview, error indicator. This is the only path that writes `latex`.
2. **Lean render** — for any expression not currently being edited, and specifically for "small"
   (low-churn) expressions show only `MathRenderer`. The renderer has zero editing deps: it reads
   `latex`/`mode` and calls KaTeX.

Optionally, a cheap "is simple?" heuristic (no `\{...\}`, no `\begin{…}`, no environments) can force
lean rendering even while focused — but that is a tuning cost, so the V1 default is simplest:
**all non-focused expressions are lean render; focused ones are full**. Any heuristics can be layered
later without touching storage.

### Trade-offs

| Approach | Trade-off |
|----------|-----------|
| One unified controlled (recommended) | One code path; no duplicated editing logic; "simple vs full" is just focus. Risk: the default "everything not focused is lean" might surprise teachers who expect to click into a big formula without it expanding — the toolbar reveals on focus, acceptable. |
| A separate "simple editor" path | Fewer rules, but forks the editing logic and risks divergence (and subtle data-model drift). Not chosen. |
| Persist `collapsed/simple` flag | Over-engineering; a render concern stored in the document (contradicts §16.1). Not chosen. |

**Recommendation:** keep **one** `MathExpression` that always renders the preview and mounts the full
`MathEditor` only on focus. `mode: "inline"` expressions render compact by default (`MathRenderer`
with `displayMode=false`); `mode: "display"` expressions center a display render. Editing of both is
identical. This keeps the engine singular, avoids a UI fork, and preserves the reusability promise: a
quiz prompt embed uses the same component, and tiny inline math like `5%` simply never opens an
editor unless focused.

---

## 16.8 Reusable Math Engine Boundaries (crystal-clear layer split)

The single most important contract for long-term maintainability. Two layers, a hard rule between
them:

### Layer A — Generic Math Engine (context-free, state-free by design)

| Module | Responsibility | Allowed imports |
|--------|----------------|-----------------|
| `MathRenderer` | render `{latex, mode}` via KaTeX | KaTeX only |
| `MathEditor` | controlled LaTeX source + preview + toolbar compose | engine modules only |
| `MathSymbolToolbar` | render data-driven `MATH_GROUPS` + `onInsert` | registries, engine |
| `MathTemplates` / `mathTemplate` | template definitions strings + resolver | |
| `MathPlaceholder` | placeholder/cursor resolve | engine utils |
| `MathParser` / `mathValidation` | syntax validation, KaTeX coverage hints, paste sanitizer | KaTeX |
| `mathStyles` | shared CSS/tokens | |
| `InsertEngine` (applyInsert) | execute an insert command (symbol/template) + selection | engine |

**contract:** These modules are **stateless, controlled, pure(ish)** — they take values via props and
report changes via callbacks. They **never** import `EditorContext`, `useSlides`, `useHistory`, or
the block's `useMath`. They hold local UI state only (focused, open panel, transient placeholders).

### Layer B — Block-specific adaptation (the only layer that touches editor state)

| Module | Responsibility |
|--------|----------------|
| `MathBlock` | container: title + expressions list + CRUD UI; brings the engine and the editor state together |
| `useMath` | functional `setSlides`/`setSlidesWithoutHistory` updates for this block |
| `mathUtils` (`createMathBlock`, `withDefaults`, `createExpression`) | block content shapes + normalizer |
| CRUD (add/remove/duplicate/reorder) | structural ops over `expressions` |
| history/autosave/clipboard/dnd wiring | exactly the ordinary block lifecycle |

**Rule (the boundary nobody crosses):**
> Blocks import the **generic engine** and the engine knows **nothing** about blocks or slides.
> Any new educational block (Exercise, Quiz, Flashcard, Assignment, Exam) uses Layer A directly and
> writes through *its own* `useXxx` functional update (exactly as Exercise/Quiz use `RichTextField`
> today). MathBlock-specific behavior (`MathBlock`, `useMath`, `createMathBlock`, CRUD, title,
> ordering) must never leak into those blocks.

### Concrete embed recipe (for any future block)

```
ExercisePrompt (block X)
   ├ embedded: <RichTextField>… or <MathEditor latex onChange/>  ← Layer A
   └ write: useExercise.updateField("prompt.{html}")            ← Layer B (its own)
```

Concretely: for a math prompt, the block maps the math value into its own fields through the same
functional update it already uses. The engine is reused; the block's history stays correct; no
MathBlock behavior leaks in.

### What happens if the boundary is violated

- A block starts importing `useMath` or `createMathBlock` → it silently inherits MathBlock's title,
  CRUD, and ordering semantics → coupling grows and it becomes hard to evolve. This is enforced by
  naming: the generic engine modules live under `components/blocks/math/` (the reusable layer), the
  block-specific code lives under `components/blocks/` + `hooks/useMath.js`, and by a code-review
  rule: **"do not import `useMath` outside `MathBlock`".**

---

## 16.9 Guiding Principle for All These Additions

The purpose of this entire extension is **to settle decisions now**—not to add work before we know a
feature exists.

- **Prefer making architectural decisions ONCE.** The field set, the registry shape, the template
  contract, the placeholder engine, the toolbar data model, the layer boundary above are fixed now.
  Coding then follows them without re-deriving design.
- **Stay progressive where it's free.** Registries start small and grow by *adding data*, which is
  the essence of "make it work, debug, refactor, modularize." We do not build features that have no
  consumer.
- **Favor the additive, the derivable, with defaults.** Every extensibility point is a
  default-trimmed additive field or a registry entry — never a branch that rewrites storage. That
  keeps old documents renderable and future ones acceptable without migration cascades.
- **Grow within controlled boundaries.** A strict line between generic engine (no editor state) and
  block-adaptation ensures any new educational block can reuse math without inheriting MathBlock.
- **Agreement before code.** With the decisions above locked ("which fields are today", "how the
  placeholder/cursor engine works", "whether toolbars/templates evolve as data", "where the engine
  boundary lies"), implementation (M0–M5) can proceed without reconsidering architecture mid-feature.

---

## 16.10 Supported LaTeX Scope (Engine Contract)

The architecture has so far said "expressions are LaTeX", but it never defined **which LaTeX is
valid**. This section formalizes the language boundary of the engine so the renderer, validator, and
parser never disagree about what the editor accepts.

### The contract

> **The supported language of the engine is exactly the subset implemented by KaTeX.**
>
> If KaTeX supports it, the editor supports it. Otherwise the editor reports an unsupported command
> while preserving the original source.

Formalized:

1. **Storage:** the editor stores plain LaTeX strings — nothing more.
2. **Supported language:** the command/environment set documented by KaTeX
   (see `https://katex.org/docs/supported.html`) is the single, authoritative specification of what
   the editor accepts.
3. **Unsupported commands are validation/rendering errors, not editor failures.** A command outside
   the KaTeX subset never crashes the editor, never corrupts the document, and never blocks editing.
   It degrades to a visible "unsupported" indicator and keeps working.
4. **The engine never implements missing LaTeX features itself.** We do not write custom parsers or
   renderers for commands KaTeX lacks. The line between "engine feature" and "unsupported input" is
   drawn at the KaTeX boundary and never crossed.
5. **One shared command set.** `MathRenderer`, `MathParser`/`mathValidation`, and the preview all
   operate from the *same* supported set. There is exactly one notion of "valid LaTeX" in the
   system.

### Consequence: the answer to recurring future questions

| Question | Answer |
| -------- | ------ |
| **Custom macros** | Not a V1 feature. Macros are a KaTeX option (`macros`), not part of the stored language. If custom macros become a product need, they are a *renderer/theme* capability (per-expression or per-document macro tables passed to KaTeX), never stored inline in the expression text. Until then they are "unsupported". |
| **TikZ / PSTricks** | Out of scope. They are full drawing/plotting systems, not math typesetting; they also conflict with the non-goal "graph plotting" (`MATH_BLOCK_PLAN.md` §9). They are reported as unsupported. |
| **Unsupported environments** | Reported as unsupported while the source is preserved (see §16.11). If a common educational environment is missing from KaTeX, the response is *"add to the shared command set only if KaTeX adds it"* — never a bespoke engine implementation. |
| **Unsupported packages** | Not supported. LaTeX packages do not exist on the web math side; only the KaTeX subset does. Any package-like construct is out of the language. |
| **"Why can't I write this?"** | Because the engine's contract is "KaTeX subset", and the answer is stable and discoverable (`MathParser` can cite the offending command). |

### Why this boundary is an asset, not a limitation

- It is **definable and testable**: valid = "renders without KaTeX error", so validation has a
  single oracle (KaTeX itself) instead of a hand-maintained grammar.
- It **guarantees render/edit/export consistency**: everything the editor accepts, the renderer can
  draw, and vice-versa.
- It **prevents scope creep**: the moment a "we should support this missing construct" request
  arrives, the decision is already made (defer, or wait for KaTeX), so the engine never accretes a
  fragile second LaTeX implementation.
- It **scales with the ecosystem**: when KaTeX adds commands (it grows over time), the editor
  inherits them for free — the language contract is versioned with the `katex` dependency.

---

## 16.11 Error Handling Philosophy

The editor must define, explicitly, what happens when a rendering or validation failure occurs.
The philosophy below protects the one thing the user actually cares about: **their work**.

> The editor always protects the user's work before protecting rendering correctness.

### The three responsibilities are always separated

```
Storage     — store exactly what the user typed (LaTeX string, byte-for-byte).
Validation  — report whether the string is within the supported KaTeX subset; never mutate it.
Rendering   — attempt to draw the string; on failure, show a graceful fallback; never mutate it.
```

These three concerns **never mix**:

- **Storage does not validate.** Invalid expressions are still stored exactly as typed (unless
  future business rules explicitly require otherwise — see below). The editor does not silently
  "fix" or strip input.
- **Validation does not render.** `MathParser`/`mathValidation` reports problems; it never alters
  the stored string and never decides what the user may keep typing.
- **Rendering does not store.** KaTeX output is ephemeral. A failed render writes nothing to
  `block.content`; only `onChange` (from real edits) writes.

### Established rules

1. **Invalid LaTeX never destroys user input.** There is no code path where an erroring expression
   is truncated, replaced with the fallback, or deleted. The source the user sees and edits is
   always their original text.
2. **The original source is always preserved.** On error the stored `latex` remains untouched; the
   fallback message is a *display* artifact only.
3. **Rendering errors are presentation errors, not data errors.** A red "unsupported: `\foo`" chip
   or the raw LaTeX shown in place of the preview is a presentation state — identical to KaTeX's
   `throwOnError: false` behaviour, which prints the source rather than throwing.
4. **The preview may fail while editing continues normally.** The source editor never blocks on a
   bad preview; the user keeps typing, and the preview updates on the next valid edit.
5. **Users may continue correcting expressions without losing work.** Because state lives in the
   block (§16.12) and only real edits commit, a failed render cannot strand the user — they edit
   the source, the preview recovers, everything else (history, autosave) is untouched.
6. **Invalid expressions are still stored exactly as typed — by default.** The *only* exception is
   if a future business rule (e.g. an exam flow that must reject unsupported syntax at save time)
   explicitly requires validation at the storage boundary. That decision belongs to product, not to
   the math engine; the engine's default remains "store as typed".
7. **History & autosave are data-bound, not render-bound.** Undo/redo and autosave react to
   committed `latex` changes (via `useMath`), never to preview success or failure. An erroring
   expression is a perfectly ordinary document value.

### What the user sees

| State | Source editor | Preview | Persistence |
| ----- | ------------- | ------- | ----------- |
| Valid | normal editing | rendered by KaTeX | stored |
| Unsupported command | normal editing | inline "unsupported: `<cmd>`" notice | stored unchanged |
| Invalid syntax (unbalanced) | normal editing | error surface with source preserved | stored unchanged |

The contract in one line: **the source is sacred; the render is disposable.**

---

## 16.12 State Ownership Contract

The high-level sections described `MathEditor` as "controlled", but the exact ownership of each kind
of state deserves to be a hard contract, because it is the single most common source of bugs in
rich editors (duplicated truth, desync, accidental local persistence).

### The contract

> **Persistent document state always belongs to the block container.**
>
> `MathEditor` is responsible for *editing*. `MathBlock` is responsible for *persistence*.

In detail:

| Owner | Owns | Does not own |
| ----- | ---- | ------------ |
| `useMath` | the **authoritative document state** — reads `block.content.expressions`, applies every committed change via functional `setSlides`/`setSlidesWithoutHistory` updates | rendering, toolbar internals, caret |
| `MathBlock` | **coordinates document updates** — decides what/when to commit to `useMath`, passes values down as props | the draft text while the user is mid-edit |
| `MathEditor` | **transient UI state only** — selection, cursor position, placeholder navigation (`Tab` walk, §16.4), focus, which toolbar panel is open, temporary interactions (draft before commit, panel hover, autocomplete state) | **never** persistent expression data |

### What this means in practice

- **Single source of truth.** `block.content` (owned by `useMath`) is the only place the document
  lives. `MathEditor` never holds a "local copy" of the expression that could drift from
  `block.content`; it holds a *draft* only for the duration of a keystroke/preview cycle and
  commits through `onChange`, after which the props become the truth again.
- **No duplicated state.** If both `MathBlock` and `MathEditor` stored the same `latex`, edits and
  undo/redo would fight. By the contract, the editor's transient cursor/draft state and the block's
  committed document are different kinds of state that never collide.
- **No accidental local persistence.** Because `MathEditor` has no durable state, a component
  unmount, a reorder, or an undo cannot leave "phantom" expression data behind. Everything durable
  is `useMath`'s, and everything else dies with the component.
- **Sync stays one-directional.** `block.content` → props → editor draft → `onChange` → `useMath`
  → `block.content`. Any undo/redo or external change flows back through props and reconciles the
  transient state (`updateMathUI`, mirroring `updateEditorUI`), without the editor trying to write
  its own version of the document.
- **History/autosave bind to `useMath`.** Undo/redo and autosave (via the existing `SlideEditor`
  debounced save) react to committed `block.content`, which is exactly the state `useMath` owns.

### The strict rule, restated

> **MathEditor is responsible for editing. MathBlock is responsible for persistence.**
>
> - `MathEditor` receives `value` and reports `onChange`; it holds no persistent expression data.
> - `MathBlock` + `useMath` own the authoritative document and decide when an `onChange` becomes a
>   history/autosave event.
> - No other component may read or write `block.content.expressions` directly.

This contract prevents duplicated sources of truth, synchronization bugs, and accidental local
persistence — and it makes the "independent editors" decision in §16.6 safe: many editors, each
with only transient state, all funneling into one authoritative `block.content`.

---

## 16.13 Implementation Order (Recommended)

Implementation deliberately follows **dependency order, not visual order.** The UI is built
bottom-up so every architectural layer can be validated in isolation before the next layer consumes
it. This minimizes debugging (errors are attributable to exactly the layer being built) and means we
never debug through a stack of unverified dependencies.

```
Phase 0   Data model            createMathBlock, createExpression, withDefaults
Phase 1   Renderer              MathRenderer
Phase 2   Editor                MathEditor (controlled: source + preview)
Phase 3   Insertion engine      Symbol insertion engine (applyInsert for symbols)
Phase 4   Templates + cursor    Template Registry, Placeholder Engine, Cursor Engine, Tab navigation
Phase 5   Toolbar               Toolbar wired to the insertion engine
Phase 6   Block integration     MathBlock, useMath, history, autosave, clipboard, DnD
```

### Why this order

- **Phase 0 — Data model first.** The shape `{ id, latex, mode }` and its normalizer
  (`withDefaults`) are the contract everything else compiles against. Freezing them first means no
  later phase has to guess the data shape, and old/future documents render correctly from day one.
- **Phase 1 — Render before edit.** `MathRenderer` has one input (`{ latex, mode }`) and one output
  (KaTeX HTML). It is the simplest component and it validates the *entire* language contract
  (§16.10) and the error philosophy (§16.11) with almost no surface area. If KaTeX integration,
  fonts, or CSS are wrong, we find out here — not buried inside an editor.
- **Phase 2 — Controlled editor.** With the renderer proven, `MathEditor` can be built as a pure
  controlled component: `value` in, `onChange` out, preview driven by Phase 1. This validates the
  State Ownership Contract (§16.12) before any mutation machinery exists.
- **Phase 3 — Symbol insertion.** `applyInsert` is introduced for the trivial `symbol` case first.
  This establishes the single insertion funnel (toolbar, keyboard, search all go through it later)
  with the least complex input.
- **Phase 4 — Templates & cursor engine.** Only now do we add the placeholder resolution and Tab
  navigation, layered on the already-working insertion funnel. The generic placeholder engine
  (§16.4) is tested against real structures instead of being designed in a vacuum.
- **Phase 5 — Toolbar.** The toolbar is pure presentation over the registries (§16.2/16.3) and the
  insertion engine. Because Phase 3–4 already work, wiring the toolbar is declarative wiring, not
  new behavior.
- **Phase 6 — Block integration last.** `MathBlock`, `useMath`, history, autosave, clipboard, and
  DnD come last because they compose already-verified pieces. This is also the phase with the
  highest reuse payoff: every future block (Exercise, Quiz, …) reuses Phases 1–5 unchanged and only
  repeats the small Phase-6-style adaptation.

Each phase is independently shippable and testable (a renderer unit test in Phase 1, a controlled
component check in Phase 2, template-insertion tests in Phase 4, an end-to-end Math Block in
Phase 6). A bug at Phase N is guaranteed to be in Phase N, because everything beneath it already
passed.

---

## 16.14 Final Engineering Vision

We are **no longer designing "a Math Block."**

We are designing a **reusable mathematical authoring engine** whose first consumer happens to be
MathBlock. MathBlock is one adapter — the *block-shaped* adapter. The engine itself is block-agnostic
and knows nothing about slides, `block.content`, history, or autosave (§16.8).

The reusable engine — `MathRenderer`, `MathEditor`, `MathSymbolToolbar`, the Symbol Registry, the
Template Registry, the Placeholder Engine, the Cursor Engine, the parser, the validation pipeline,
and the insertion engine — is the long-term asset of VipiClass. Every future mathematical surface
reuses the **exact same** components and engines:

- Exercise prompts, hints, and teacher notes;
- Quiz prompts, option labels, and explanations;
- Exams, assignments, and flashcards;
- inline mathematical editors inside prose;
- AI-generated formulas (Phase 10) producing canonical LaTeX;
- read-only renderers in student-facing views and PDF/SSR exports.

Each of those consumers uses the engine directly and writes through *its own* functional update
(`useExercise`, `useQuiz`, …) — exactly as they use `RichTextField` today — so they inherit the
renderer, editor, toolbar, template registry, placeholder engine, parser, and validation pipeline
**without inheriting MathBlock-specific behavior** (title, CRUD, ordering, `useMath`).

This conclusion reinforces the project's guiding principle:

> **Build one reusable math engine.**
> **Adapt it everywhere.**
> **Never duplicate mathematical editing behavior across educational blocks.**

The architecture settled in this document — the data model (§16.1), the registries (§16.2–16.3),
the placeholder/cursor engine (§16.4), the reserved shortcut space (§16.5), the independent-editor
philosophy (§16.6), the lean-vs-full rendering (§16.7), the engine boundaries (§16.8), the language
contract (§16.10), the error philosophy (§16.11), and the state ownership contract (§16.12) — is the
agreed foundation. Implementation now proceeds in dependency order (§16.13), and every future
consumer of mathematics in VipiClass is a reuse of this engine, not a new implementation.

---
