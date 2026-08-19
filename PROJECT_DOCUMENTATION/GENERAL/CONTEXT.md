# Project Context: Slide Editor

## 1. Purpose

The **Slide Editor** is the rich content editing engine being developed for **VipiClass**.

Although the current implementation focuses on creating educational lessons composed of slides and blocks, the editor is intentionally designed as a reusable subsystem rather than a feature dedicated exclusively to presentations.

Its long-term objective is to become the standard editing engine for every rich content experience inside VipiClass.

Examples include:

- lessons
- lecture notes
- assignments
- quizzes
- documentation
- AI-generated educational content
- interactive learning materials
- future collaborative documents

For that reason, architectural decisions prioritize extensibility, maintainability, and consistency over short-term implementation speed.

---

## 2. Current Scope

At the current stage of development, the project focuses exclusively on building a robust block-based slide editor.

The primary objective is **not** to complete every editor feature as quickly as possible.

Instead, the goal is to establish a solid editing foundation that future platform features can safely reuse without architectural redesign.

Current development priorities include:

- block rendering
- rich text editing
- drag-and-drop
- history management
- table editing
- keyboard navigation
- selection systems
- reusable editor infrastructure

---

## 3. Core Editing Philosophy

The editor follows several architectural principles that guide every implementation decision.

### Block-Based Editing

Content is modeled as independent blocks rather than one large rich-text document.

Each block owns its own rendering logic while sharing common editor infrastructure.

This approach allows heterogeneous content such as:

- text
- callouts
- tables
- images
- videos
- quizzes

to coexist naturally inside the same slide.

---

### Shared Editing Infrastructure

Whenever multiple block types require similar behavior, the functionality is centralized instead of duplicated.

Examples include:

- shared formatting toolbar
- unified rich text initialization
- history management
- drag-and-drop architecture
- block insertion workflow

The objective is to make new block types inherit existing capabilities instead of reimplementing them.

---

### Progressive Development

Features generally follow the same implementation lifecycle:

```text
Make it work
↓

Debug

↓

Refactor

↓

Modularize
```

Premature abstraction is intentionally avoided until implementation details become well understood.

---

## 4. Core Domain Model

The editor manipulates four primary entities.

| Entity | Responsibility                          |
| ------ | --------------------------------------- |
| Lesson | Collection of slides                    |
| Slide  | Ordered collection of blocks            |
| Block  | Individual editable content unit        |
| Cell   | Rich-text container inside table blocks |

Blocks are embedded directly inside slides.

Table cells are embedded inside table blocks.

This hierarchy mirrors the editing experience and keeps rendering straightforward.

---

## 5. Current Functional Capabilities

Implemented features currently include:

### Slide Management

- slide creation
- deletion
- duplication
- reordering

### Block System

- multiple block types
- block insertion
- block transformation
- drag-and-drop
- multi-block selection (desktop ctrl+click, mobile long-press)

### Mobile & Interaction

- touch long-press multi-selection for slides and blocks
- native long-press text selection inside table cells (touch)
- custom dropdowns replacing native `<select>`s in callout / quiz / exercise controls

### Rich Text

- Tiptap integration
- shared toolbar
- slash menu
- reusable editor initialization

### Table

- rich text cells
- row operations
- column operations
- resizing
- row reordering
- column reordering
- keyboard navigation

### Editing Infrastructure

- undo / redo
- autosave
- clipboard
- history
- active editor synchronization

---

## 6. Current Development Status

The editor has reached a stable architectural foundation.

Most ongoing work focuses on completing the remaining Phase 6 educational blocks.

> **2026-08 — Styling & mobile pass shipped (Phase 11 only touched).** A focused pass added touch
> long-press multi-selection for slides and blocks, restored native long-press text selection inside
> table cells, and replaced native `<select>`s with custom dropdowns. This touched Phase 11 (Mobile
> Experience) items without completing them; the roadmap will return to that phase later.
>
> **2026-08 — Math Block V1 shipped.** The Equation / Math Block V1 authoring is complete (source +
> visual slot editing, KaTeX rendering, symbol/template toolbar, template slots, keyboard navigation).
> The remaining math capabilities (V2/V3) are postponed so the platform can serve its MVP first.
>
> **2026-08 — Code Block teacher-facing MVP shipped.** The CodeBlock authoring is complete (Phases
> 0–8 of `CODE_BLOCK_PLAN.md`): insertion via `+` menu / Insert-Menu-Between / slash menu, an overlay
> code editor (line numbers, Tab/Shift+Tab indentation, `Ctrl+/` toggle comment for selected lines),
> language selection (Plain text + 22 languages), highlight.js syntax highlighting, two-tier
> history/autosave integration, and a copy button that copies the raw source. **2026-08 — CodeBlock
> Phase 9 (student-facing rendering) shipped** via the new Student Presentation layer (see below);
> edge-case testing is in progress and UX polish is planned next.
>
> **2026-08 — Student Previewing & Presentation Rendering shipped.** The student-facing rendering
> phase (Phases 1–5 of `STUDENT_PREVIEWING_PLAN.md`) is complete and merged to `main`: a
> `/presentation` route renders persisted slide/block data
> (bundled demo data for now) through a dedicated, editor-free renderer tree
> (`PresentationShell` → `SlideRenderer` → `BlockRouter` → per-block renderers). All block types
> render — text, callout, youtube, image, divider, table, exercise, quiz, math, code — with graceful
> fallbacks for unknown/empty/malformed content and no mutation of persisted data. Student interaction
> (exercise answers, quiz selection, hint toggles) is local-only; no grading, submission, or
> persistence. Security: centralized DOMPurify sanitization for all student-facing rich HTML,
> escaped/static code rendering, safe link handling (ADR-018). The teacher preview mode (plan Phase
> 6) shipped in the same pass: a "Preview" button in the Slide Editor opens a full-screen overlay
> that renders the live slides through the same presentation primitives, with teacher-only chrome
> (badge, exit) kept outside the student renderer tree. Remaining plan phases: VipiClass integration
> (7) and PDF/export (8).
>
> **2026-08 — Table editor experience pass shipped (Phase 7 scope, closes Phase 4 gaps).**
> Excel-style table editing: first click selects a cell, second click enters its editor, Shift-click
> extends a rectangular range; row/column selection via the `+` handles; keyboard navigation
> (arrows/Tab/Enter), `Ctrl+M` merge, `Ctrl+S` split, and Delete clears per selection type. The
> internal table clipboard (cell/row/column) coexists with the OS clipboard without overriding it:
> **the OS clipboard is the source of truth for paste** — the persisted/in-memory snapshot is used
> only when the OS text is empty or matches our own copy, so content copied and modified in Excel
> pastes back correctly (see ADR-017). The row/column `+` and drag handles no longer select the whole
> block, the table action menu stays inside the viewport, and selection highlights remain visible on
> header cells. These are the first items from Phase 7 (Editor Experience Improvements) to ship.

Current active work includes:

- Future: block transformation ("Turn into") on complex blocks — a known data-consistency concern:
  `transformBlock` flattens content to `{ html }`, so transforming blocks whose content is not a
  single HTML field (math, code, exercise, quiz, table) is currently hidden via `hideTransform`.
  Re-enabling it requires a content-mapping strategy and is deferred.

---

## 7. Relationship to VipiClass

Although this repository develops the editor independently, the editor is intended to become shared infrastructure for the VipiClass platform.

The editor should therefore be viewed as an independent subsystem whose architecture must remain reusable across multiple future products rather than tightly coupled to lesson editing alone.

---
