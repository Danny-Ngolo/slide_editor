# Architectural Decision Records (ADRs): Slide Editor

This document records the major architectural decisions that shape the Slide Editor.

Each ADR explains:

* **Context** — What problem existed?
* **Decision** — What did we choose?
* **Rationale** — Why did we choose it?
* **Consequences** — What benefits and trade-offs come from that choice?

The purpose is not to document every implementation detail, but to preserve the reasoning behind important decisions so future contributors understand **why** the architecture looks the way it does.

---

# ADR-001: Block-Based Content Model

**Status:** Accepted

## Context

The editor needs to support heterogeneous content:

* rich text
* tables
* images
* videos
* callouts
* quizzes
* future block types

A single rich-text document would make many of these difficult to manage independently.

## Decision

Represent slide content as an ordered array of blocks.

```text
Slide

↓

Blocks[]

↓

Text
Table
Image
Video
Callout
Quiz
...
```

Each block owns only its own content.

## Rationale

Blocks are naturally independent editing units.

They can be:

* reordered
* duplicated
* copied
* deleted
* transformed

without affecting surrounding content.

## Consequences

### Advantages

* extensible
* predictable rendering
* reusable editor infrastructure

### Trade-offs

* block relationships require explicit coordination when needed.

---

# ADR-002: Embedded Document Structure

**Status:** Accepted

## Context

A lesson is fundamentally hierarchical.

```text
Lesson

↓

Slides

↓

Blocks

↓

Cells
```

## Decision

Store slides inside lessons.

Store blocks inside slides.

Store table cells inside table blocks.

Avoid normalization for the editor's primary data model.

## Rationale

The editor almost always loads and saves an entire lesson.

Keeping the hierarchy intact mirrors how users think about their content and simplifies rendering and persistence.

## Consequences

### Advantages

* straightforward serialization
* simpler rendering
* intuitive data model

### Trade-offs

Large lessons require transmitting larger payloads during autosave.

---

# ADR-003: One Owner Per State

**Status:** Accepted

## Context

As the editor grew, several features required access to shared state:

* selection
* clipboard
* history
* active editor
* floating menus

Duplicating state quickly led to inconsistencies.

## Decision

Every shared piece of state has exactly one owner.

Shared state lives in Context.

Components consume it.

Hooks manipulate it.

## Rationale

Single ownership eliminates synchronization problems.

It also makes debugging significantly easier.

## Consequences

Developers should avoid introducing duplicate state unless there is a compelling architectural reason.

---

# ADR-004: Hooks Own Behavior

**Status:** Accepted

## Context

As editor functionality expanded, components began accumulating business logic alongside rendering code.

## Decision

Business logic belongs in hooks.

Components primarily render UI.

Examples:

* `useSlides`
* `useHistory`
* `useTable`
* `useClipboard`
* `useRichTextEditor`

## Rationale

Separating rendering from behavior improves readability, testing, and reuse.

## Consequences

Hooks may grow large, but responsibilities remain centralized instead of being scattered across many components.

---

# ADR-005: Shared Rich Text Engine

**Status:** Accepted

## Context

Several block types require rich-text editing.

Implementing independent editor logic for each block would duplicate behavior.

## Decision

All rich-text blocks share a common initialization and management layer through `useRichTextEditor`.

## Rationale

Formatting, keyboard shortcuts, toolbar synchronization, and editor lifecycle should behave consistently regardless of block type.

## Consequences

Adding a new rich-text block requires minimal editor-specific implementation.

---

# ADR-006: Independent Editor per Table Cell

**Status:** Accepted

## Context

Table cells require the same rich-text capabilities as ordinary text blocks while supporting keyboard navigation between cells.

## Decision

Each table cell owns its own Tiptap editor instance.

Editor references are registered centrally to enable programmatic focus changes.

## Rationale

This provides a consistent editing experience across text blocks and table cells.

## Consequences

### Advantages

* full formatting support in every cell
* natural keyboard navigation

### Trade-offs

Large tables create many editor instances and increase memory usage.

---

# ADR-007: Two-Tier History System

**Status:** Accepted

## Context

Not every update should create an undo step.

Typing or resizing continuously would flood the history stack.

## Decision

Expose two update paths:

* `setSlides()`
* `setSlidesWithoutHistory()`

## Rationale

Structural operations deserve history entries.

Continuous interactions do not.

## Consequences

The editor remains responsive while preserving meaningful undo behavior.

---

# ADR-008: Progressive Refactoring

**Status:** Accepted

## Context

Predicting the final abstraction before implementing a feature often leads to unnecessary complexity.

## Decision

Development follows this progression:

```text
Implement

↓

Debug

↓

Refactor

↓

Modularize
```

## Rationale

Architecture should emerge from working software rather than speculation.

Patterns become clearer after solving the real problem.

## Consequences

Temporary duplication is acceptable during exploration, provided it is removed during refactoring.

---

# ADR-009: Reuse Before Reinvention

**Status:** Accepted

## Context

As the editor grows, many new features resemble existing ones.

## Decision

Whenever possible, new capabilities should extend existing infrastructure instead of introducing parallel implementations.

Examples include:

* toolbar
* history
* clipboard
* drag-and-drop
* editor initialization
* selection

## Rationale

Shared infrastructure reduces maintenance cost and creates a more consistent user experience.

## Consequences

Before adding new architecture, contributors should first evaluate whether the existing systems can be extended.

---

# ADR-010: The Editor Is Infrastructure

**Status:** Accepted

## Context

Although the current project focuses on lesson editing, the editor is intended to power many future VipiClass experiences.

## Decision

Architect the editor as an independent subsystem rather than coupling it to lesson-specific workflows.

## Rationale

The same editing engine should support lessons, documentation, assignments, AI-generated content, collaborative documents, and future features.

## Consequences

Architectural decisions should favor reuse and long-term extensibility, even if they introduce slightly more work during initial implementation.

---

# ADR-011: Exercise Block (multi-field rich text via the existing onContentChange)

**Status:** Accepted

## Context

The Exercise Block needs three rich-text fields on a single block: instructions, hint, and teacher notes. The shared rich-text pipeline (`useInitEditor` + `updateEditorUI` in `useRichTextEditor`) stores content as `{ html }` and routes changes through an `onContentChange` callback that writes the whole block `content`. The per-field mechanism was later generalized into a shared `RichTextField` component and multi-question authoring (ADR-013).

## Decision

The Exercise Block implements multi-field rich text with **no changes to shared infrastructure**:

- Each field gets its own Tiptap editor via `useInitEditor`, receiving a **per-field** payload (`{ html: <field html> }`), never the whole `block.content`.
- Every field passes a mandatory `onContentChange` that routes the new HTML into the correct content field via a functional `updateField(field, { html })` state update.
- All mutations go through functional `setSlides`/`setSlidesWithoutHistory` updates in `useExercise`, mirroring `useTableCore.updateTable`. The default `updateBlock` path is never used for these fields — it would replace the whole `block.content` and wipe sibling fields.

## Rationale

- A `field` parameter or slash-menu flag on the shared hook would duplicate existing escape hatches (`onContentChange`, functional updates) for exactly one consumer — premature generalization (violates ADR-008).
- Keeps the shared pipeline untouched, so every existing block inherits the same behavior for free.
- Lazy-mounting hint/teacher-notes editors keeps the typical visible editor count at one per block.

## Consequences

- `onContentChange` is mandatory at every exercise field call site; omitting it is a data-wipe trap.
- The block reads content through `withDefaults()` (read-time normalization), so old documents render complete and future fields merge in without migration.
- "Turn into" is hidden for exercise blocks (`hideTransform`) because `transformBlock` flattens content to `{ html }` and would destroy exercise data.

---

# ADR-012: Quiz Block (multi-question, per-field rich text)

**Status:** Accepted

## Context

The Quiz Block needs an unbounded list of questions on a single block, each with several rich-text
fields (prompt, option labels, model answer, explanation). Questions come in two shapes that share
fields but differ structurally: **choice** (options + correctness) and **open** (free-text model
answer). ADR-011 already established the per-field `onContentChange` pattern on `ExerciseBlock`, but
quiz multiplies the same pattern by an arbitrary number of questions.

## Decision

Model quiz content as an ordered array of questions with a `type` discriminator:

- `content = { title, questions: [{ id, type: "choice" | "open", prompt, options[], multipleCorrect,
  modelAnswer, explanation }] }`.
- A new block starts with one `open` question; switching a question to `choice` seeds two default
  options.
- Rich text is shared via a reusable `RichTextField` component (extracted from `ExerciseBlock`) that
  takes `content` (`{ html }`) and `onChange` directly, so the same pipeline (`useInitEditor` +
  `updateEditorUI`) serves nested fields like option labels — not just top-level block fields.
- All mutations are functional (`setSlides`/`setSlidesWithoutHistory`) through `useQuiz`, never the
  whole-content `updateBlock` path.
- Correctness is stored per option (`isCorrect`) with a `multipleCorrect` flag; when `multipleCorrect`
  is false, marking one option correct clears the others.

## Rationale

- The `type` discriminator lets choice and open questions share prompt/explanation while branching only
  the field that differs (options vs model answer) — no duplicated question shapes.
- Reusing one `RichTextField` avoids three copies of the slash-menu/toolbar wiring and keeps every
  field consistent (ADR-005, ADR-009).
- Functional updates mirror `useExercise`/`useTableCore` and avoid the stale-closure data-wipe trap
  that whole-content updates would cause with nested question arrays.

## Consequences

- Rich-text field call sites pass `content`/`onChange`; omitting `onChange` is a data-wipe trap.
- "Turn into" is hidden for quiz blocks (`hideTransform`), same reason as exercise.
- Each visible question mounts several editors (prompt, model answer, option labels); count stays low
  because explanation is lazy via an accordion (ADR-006 trade-off, same answer as ADR-011).
- Grading/attempts are out of scope for V1; the schema already carries `modelAnswer` and correctness
  so those features can be added without a data migration.

---

# ADR-013: Shared Block Building Blocks and Multi-Question Exercise

**Status:** Accepted

## Context

Exercise and Quiz evolved into the same shape: an editable title, block-level metadata, a list of
questions with per-question rich text, and resources. Before the refactor they duplicated nearly all of
that (styles, accordion, time input, resource list, rich-text wiring). A proposal to merge the two into a
single "Activity" block with a quiz/exercise toggle was considered and rejected: quiz questions carry
correctness/options/modelAnswer and auto-grading lifecycles, exercise questions are open-ended tasks with
hint/teacher notes — different student-side behavior. The commonality is in the *building blocks*, not
the block type.

## Decision

- Keep `exercise` and `quiz` as distinct block types.
- Extract the shared pieces into `components/blocks/shared/` (mirroring the `Table/` folder pattern):
  `styles.js`, `constants.js` (difficulty options), `Accordion.jsx`, `TimeInput.jsx`,
  `RichTextField.jsx`, `ResourceSection.jsx`. General hooks live in `hooks/`: `useResources`,
  `resourceUtils`.
- Exercise adopts the same multi-question model as Quiz: `content = { title, difficulty,
  estimatedTime, questions: [{ id, prompt, hint, teacherNotes }], resources }`. Difficulty/estimated
  time and resources stay **block-level** (shared across all questions).
- `withDefaults` lazily migrates legacy flat exercises (top-level `instructions`/`hint`/`teacherNotes`)
  into a single `questions[0]`.
- Both blocks use `useResources`/`ResourceSection` for block-level resources, and `shared/Accordion` +
  `TimeInput` + `DIFFICULTY_OPTIONS` for metadata, so Quiz also gains resources and difficulty/time.

## Rationale

- The folder/name scoping avoids the ambiguity of a generic `ui.js`: files are named by what they are
  (`styles`, `Accordion`, `ResourceSection`) and grouped by purpose (`shared/`), not by current
  consumers.
- Merging shared components keeps one source of truth: fixing resource rename/reorder or accordion
  behavior once fixes both blocks (ADR-009).
- Keeping block types distinct preserves their diverging futures (quiz grading vs exercise submissions).

## Consequences

- `components/blocks/` top level stays flat and scannable (block components + `BlockRenderer`);
  reusable pieces live under `shared/`.
- New blocks can adopt the same building blocks (resources, rich text, accordion, card styles) without
  forking them.
- Legacy exercise documents render unchanged through the read-time migration; saving writes the new
  `questions[]` shape.
- "Turn into" remains hidden for both blocks (`hideTransform`).

---

# ADR-014: Custom Select Component over Native Select

**Status:** Accepted

## Context

Callout, Quiz, and Exercise controls used native `<select>` elements. On desktop they render fine,
but on mobile the OS renders option lists full-width, dark, and unthemeable — visually inconsistent
with the editor's designed menu system (ActionMenu).

## Decision

Replace native `<select>` usage in block controls with a shared custom dropdown:
`components/blocks/shared/Select.jsx`. It matches the ActionMenu look (white card, shadow, accent
highlight, radius), supports `minWidth: 100%`, a max-height scroll, and closes on outside press or
Escape.

## Rationale

- The editor already has a designed menu visual language; native selects break that consistency.
- One shared component serves all consumers (Callout variant, Quiz type + difficulty, Exercise
  difficulty), matching ADR-009 (reuse before reinvention).

## Consequences

### Advantages

* consistent desktop/mobile styling
* matches the existing ActionMenu look
* full control over open state, selection highlight, and scroll

### Trade-offs

* loses native accessibility behavior (keyboard listbox navigation, screen-reader semantics)
* requires manual outside-click and Escape handling
* a future accessibility pass may need ARIA `role="listbox"`/`option` semantics added to the
  component without changing its API

---

# ADR-015: Long-Press Gesture Ownership on Touch

**Status:** Accepted

## Context

On touch devices a single long-press gesture was needed for two conflicting jobs: multi-selecting a
block (mirroring the slide list) and selecting text inside rich-text areas. Early attempts to enable
long-press multi-selection broke the native long-press text selection inside table cells.

## Decision

Centralize the gesture in `useLongPress()` with target-based routing:

- Blocks opt in via an `allowInsideEditable` option — long-press over a block toggles
  `toggleBlockSelection` (mirroring `Slide.jsx`'s `toggleSlideSelection`).
- Table cells are always excluded via the `.table-cell-inner` scope — long-press inside a cell keeps
  its native text selection.
- Form controls (`input`, `textarea`, `select`) are always skipped.

## Rationale

- The slide list already established a working long-press multi-select model; mirroring it gives
  blocks the same capability with minimal new surface (ADR-009).
- Scoping by target preserves the table cell text-selection fix without reintroducing the conflict.
- Selected blocks are made visible with an accent ring + `accentSoft` background in `BlockRenderer`,
  so desktop ctrl+click multi-selection becomes visually trackable too.

## Consequences

### Advantages

* one gesture, consistent with the slide list
* table cell long-press text selection preserved
* single source of truth for touch-gesture behavior

### Trade-offs

* long-press over a text block now selects the block instead of its text; editing relies on
  tap-to-focus
* target-based routing couples the hook to a DOM scope class (`.table-cell-inner`)

### Future

* if text selection inside text blocks must be restored on touch, add per-block opt-out in the hook
  without redesigning it

---

# ADR-016: "Turn Into" on Complex Blocks Is a Future Data-Consistency Concern

**Status:** Accepted (as a deferred concern; not implemented)

## Context

`transformBlock` (`useSlides.js`) transforms a block by rewriting it as:

```js
{
  ...block,
  type: target.type,
  content: { html: block.content.html },
}
```

This only preserves content when the block's content is a single HTML-rich field. Math (`content.latex`),
code (`content.code`/`content.language`), exercise, quiz, and table blocks carry structured content that
cannot survive the flatten-to-`{ html }` mapping without data loss. Phase 5 (Block Transformation System)
still lists transformation as partially open.

## Decision

- The **MVP hides "Turn into" for complex blocks** (`hideTransform` in `BlockRenderer.jsx` for
  `math`, `code`, `exercise`, `quiz`) and only exposes it where the `{ html }` mapping is safe.
- Re-enabling transformation for complex blocks is **deferred**; when it is tackled it must ship a
  per-block content-mapping strategy (e.g. math latex → `{ html: renderedLatex }`, code → `<pre>`),
  not a blind flatten.

## Rationale

Transforming a math block into plain text by discarding its LaTeX would silently destroy teacher
content — a worse outcome than hiding the menu entry. The current approach guarantees no data loss
at the cost of a temporarily missing feature.

## Consequences

### Advantages

* no silent data loss on transformation
* the risk is explicitly tracked instead of discovered in production

### Trade-offs

* teachers cannot turn a math/code block into another type in the MVP
* when re-enabled, each complex block needs a content-mapping path and round-trip verification
  (transform out and transform back must be lossless enough for teaching content)

---

# ADR-017: The OS Clipboard Is the Source of Truth for Paste

**Status:** Accepted

## Context

The editor keeps its own internal clipboard state: a persisted snapshot plus in-memory copies
(`copiedBlocks`, `copiedSlides`, and the table's `tableClipboard`). Early versions treated those
internal states as the paste source whenever they were non-empty, which silently overrode content a
teacher had copied and edited in an external app (e.g. Excel): copy in the editor → paste into Excel →
modify → copy from Excel → paste back into the editor would re-insert the *old* in-app copy. The table
keyboard handler was the worst offender — it intercepted `Ctrl+V` inside a cell and pasted from the
in-memory `tableClipboard` without ever consulting the OS clipboard.

## Decision

**Paste always treats the OS clipboard as the decision-maker.** All paste flows (block/slide paste in
`useEditorPaste`, table paste through the registered table handler) use the same rule:

- If the OS clipboard holds content that is **not** our own snapshot (comparison via
  `normalizeClipboardText`), import the OS content — internal state must never clobber it.
- The internal persisted/in-memory snapshot is used **only** when the OS text is empty (restricted
  clipboard access) or normalizes to equal our own copy.

Implementation details:

- The table's `handleCellKeyDown` no longer intercepts `Ctrl+V`; the native `paste` event reaches the
  global handler, which decides between the in-memory table clipboard and external grid import.
- `tableClipboard` stores a `plain` representation of what was written to the OS at copy time so the
  equality check is exact.
- Copy is unchanged: copying always (re)writes the OS clipboard from app state.

## Rationale

- The OS clipboard is the user's single clipboard across apps; content in it is by definition what
  they most recently copied. Prioritizing internal snapshots over it breaks the common
  copy-into-Excel/edit/copy-back workflow and loses teacher data.
- Reading `clipboardData` is only possible on the synchronous `paste` event (not `keydown`), which is
  why the interception moved out of the keydown handler.

## Consequences

### Advantages

* copy → external edit → paste-back works (grid import for tables, e.g. from Excel)
* internal clipboard still works for same-session copy/paste, and survives refresh when the OS text
  matches the snapshot
* no data loss from a stale internal copy shadowing newer OS content

### Trade-offs

* in-app copy/paste relies on the OS clipboard round-tripping plain text (TSV for tables); on
  platforms with restricted clipboard access the internal snapshot is the fallback only when no OS
  text is present
* the table paste path now flows through the native paste event, so paste must happen with a cell
  selection (first-click select) rather than while editing a single cell (which stays native)

---

# ADR-018: Student Presentation Layer Renders Persisted Data, Editor-Free

**Status:** Accepted

## Context

The teacher-side Slide Editor is an authoring system. `STUDENT_PREVIEWING_PLAN.md` requires a
student-facing presentation that consumes the **persisted structured slide/block data** — never
editor state (refs, caret, selection, placeholders, editing mode) — shows no authoring controls, fails
gracefully on empty/unknown/malformed content, and treats persisted content as untrusted data
(sanitize rich HTML, never execute code). It must reuse existing infrastructure where appropriate
(Math rendering, highlight.js, block normalizers) and stay minimal (plan §30).

## Decision

1. **Dedicated renderer tree** under `src/app/presentation/`, editor-free by construction:
   `PresentationShell` → `SlideRenderer` → `BlockRouter` → one renderer per block type
   (`Text`, `Callout`, `YouTube`, `Image`, `Divider`, `Table`, `Exercise`, `Quiz`, `Math`, `Code`,
   plus an unknown-block fallback). No authoring component is reused in the renderer.
2. **New client-only `/presentation` route** loaded with `next/dynamic({ ssr: false })`. DOMPurify is
   a browser-only library, so the whole presentation subtree renders client-side.
3. **Centralized sanitization**: one `sanitize` utility with a single DOMPurify allow-list
   (`components/shared/sanitize.js`) wrapped in a `RichText` component; every student-facing rich-HTML
   injection must pass through it. No per-renderer or ad-hoc sanitization.
4. **Reuse only pure/state-free authoring-side infrastructure**: the KaTeX `MathRenderer`,
   `highlightCode` + `LANGUAGE_OPTIONS` (highlight.js), `withDefaults` normalizers, and
   `calloutTypes`. Everything editor-specific (toolbars, editors, placeholders) stays out.
5. **Interaction boundary**: exercise answers, quiz selection, and hint toggles are local component
   state only. No grading, submission, attempt limits, or persistence. Teacher-only fields
   (`teacherNotes`, `isCorrect`, `modelAnswer`, `explanation`) are never rendered to students.
6. **Phase wiring uses bundled demo data** (`demoData.js`) that mirrors persisted block shapes,
   including legacy/edge-case content; no API, lesson IDs, or backend queries in this phase.

## Rationale

- Keeps the plan's central contract — the structured content model — as the single source both
  consumers (editor and renderers) share, and keeps authoring/rendering from coupling.
- Reuse-before-reinvention without forcing authoring components into the student renderer (plan §20).
- A single sanitization point is easier to audit and trust than sanitizers scattered across renderers.
- Client-only avoids a Node DOM shim (jsdom/isomorphic-dompurify) and keeps the heavier libs
  (DOMPurify, KaTeX, highlight.js) out of the initial route chunk.

## Consequences

### Advantages

* any persisted slide (legacy or new, valid or malformed) can be rendered without the editor open
* teacher preview, student presentation, and future PDF export can share the same rendering primitives
* one place to configure what rich HTML is allowed into the student view
* existing teacher authoring is completely untouched

### Trade-offs

* `/presentation` emits no server-rendered HTML for its subtree (irrelevant for an interactive
  student view; no SEO concern today, but a migration to `isomorphic-dompurify` would be needed if SSR
  becomes a requirement)
* until plan Phase 7, the route renders demo data rather than real persisted lessons
* sanitizer, YouTube `videoId` guard, and safe-link rules must be kept in sync if block models change