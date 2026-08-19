# Product & Technical Roadmap: Slide Editor

## 1. Vision

The Slide Editor is evolving from a simple presentation authoring tool into the core rich-content editing engine of VipiClass.

The roadmap follows a progressive approach:

1. Build a reliable editing foundation.
2. Complete advanced content manipulation.
3. Expand educational content capabilities.
4. Introduce collaboration and AI-assisted creation.
5. Transform the editor into a complete learning-content platform.

The objective is not only to add features, but to create a reusable editing infrastructure that can support lessons, notes, exercises, quizzes, AI-generated content, and future educational experiences.

---

# Phase 1 — Core Editor Foundation ✅ COMPLETED

## Slide System

- [x] Lesson loading and initialization
- [x] Slide creation
- [x] Slide deletion
- [x] Slide duplication
- [x] Slide navigation sidebar
- [x] Slide ordering

---

## Block Architecture

- [x] Block-based content model
- [x] Central BlockRenderer dispatcher
- [x] Block insertion system
- [x] Block deletion
- [x] Block duplication
- [x] Block selection
- [x] Multi-block selection
- [x] Block drag-and-drop ordering

Implemented block types:

- [x] Text block
- [x] Image block
- [x] YouTube block
- [x] Callout block
  - Definition
  - Tip
  - Warning
  - Example

- [x] Divider block
- [x] Table block foundation
- [x] Quiz block placeholder

---

# Phase 2 — Rich Text Editing Infrastructure ✅ COMPLETED

## Tiptap Integration

- [x] Tiptap editor initialization
- [x] Shared rich-text editor hook
- [x] Editor registration system
- [x] Active editor tracking
- [x] Formatting synchronization

Supported formatting:

- [x] Bold
- [x] Italic
- [x] Underline
- [x] Highlight
- [x] Lists
- [x] Basic text formatting

---

## Unified Toolbar

- [x] Global editor toolbar
- [x] Toolbar connected to active editor
- [x] Shared formatting behavior across rich-text blocks

Future improvements:

- [ ] Floating selection toolbar
- [ ] Context-aware toolbar actions
- [ ] Block-specific formatting controls

---

## Slash Command System

- [x] `/` command detection
- [x] Block insertion from slash menu
- [x] Dynamic block creation

Future improvements:

- [ ] More slash commands
- [ ] AI commands
- [ ] Content transformation commands

---

# Phase 3 — Editor Infrastructure ✅ COMPLETED

## History System

- [x] Undo
- [x] Redo
- [x] History stack
- [x] History limit management
- [x] Separate updates with and without history recording

Future improvements:

- [ ] Granular history per subsystem
- [ ] Rich-text native undo integration
- [ ] Version snapshots

---

## Persistence

- [x] MongoDB integration
- [x] Lesson API routes
- [x] Client service layer
- [x] Debounced autosave
- [x] Save status indicator

Future improvements:

- [ ] Partial document updates
- [ ] Better offline support
- [ ] Conflict resolution

---

# Phase 4 — Table Editor V1+ ✅

The table system is treated as an independent advanced editor inside the editor.

> **2026-08 — Table editing/selection pass shipped (Phase 7 scope, also closes the Phase 4 gaps).**
> Excel-style cell selection (select-first click, second click focuses the cell editor, Shift-click
> extends a rectangular range), row/column selection, table keyboard shortcuts (arrows/Tab/Enter
> navigation, `Ctrl+M` merge, `Ctrl+S` split, Delete clears per selection type), an internal table
> clipboard (copy/paste cell/row/column) that never overrides external OS-clipboard content, and
> merge/split are all complete. All unchecked Phase 4 items below are now shipped.

---

## Table Foundation ✅

- [x] Table block
- [x] Dynamic rows
- [x] Dynamic columns
- [x] Add row
- [x] Delete row
- [x] Duplicate row
- [x] Add column
- [x] Delete column
- [x] Duplicate column
- [x] Row reordering
- [x] Column reordering
- [x] Row resizing
- [x] Column resizing
- [x] Table contextual menu

---

## Cell Editing ✅

- [x] Individual Tiptap editor per cell
- [x] Cell editor registry
- [x] Keyboard navigation
- [x] Arrow navigation
- [x] Tab navigation
- [x] Enter navigation

---

## Table V1 Completion ✅

- [x] Cell selection
- [x] Active cell highlighting
- [x] Row selection improvements
- [x] Column selection improvements
- [x] Table keyboard shortcuts
- [x] Delete behavior depending on selection type

---

## Table Advanced Features ✅

- [x] Internal table clipboard

Supported operations:

- copy cell
- copy row
- copy column
- paste cell
- paste row
- paste column

---

- [x] Multi-cell selection

Features:

- rectangular selection
- Shift + click selection
- selection visualization
- selection actions

---

- [x] Merge cells

Requirements:

- rectangular selection validation
- rowspan support
- colspan support
- hidden covered cells

---

- [x] Split cells

Requirements:

- restore original matrix
- remove spans
- recreate missing cells

---

# Phase 5 — Block Transformation System ✅

## "Turn Into" Feature

Goal:

Allow users to transform blocks without losing content.

Examples:

Text block:

```
Text
 ↓
Heading
 ↓
Callout
```

---

Implementation:

- [x] Central BLOCK_TYPES registry
- [x] replaceBlock utility
- [x] transformBlock utility
- [x] Preserve HTML/content during transformation
- [x] Transformation menu

> **Future concern — data consistency on complex blocks.** `transformBlock` flattens content to
> `{ html }`, which is safe only for single-field rich-text blocks. For structured-content blocks
> (math `latex`, code `code`/`language`, exercise, quiz, table) "Turn into" is currently **hidden**
> (`hideTransform` in `BlockRenderer.jsx`) to avoid silent data loss. Re-enabling it for those
> blocks requires a per-block content-mapping strategy and is tracked as ADR-016.

---

# Phase 6 — Advanced Block System 🚧 CURRENT MILESTONE

> **Back on track after a styling & mobile detour (2026-08).** A mobile/styling pass shipped as
> commits `de25865` and `cfd2355` (long-press multi-selection for slides and blocks, native
> long-press text selection inside table cells, custom dropdowns replacing native `<select>`s).
> That pass only _touched_ Phase 11 (Mobile Experience); those items remain open and we will come
> back to them when the roadmap reaches that phase. Development now resumes here on the remaining
> educational blocks.
>
> **2026-08 — Math Block V1 shipped.** Quiz and Exercise authoring shipped earlier (see their
> sections); the Equation / Math Block V1 authoring is now complete (commits `228a93a` →
> `d6b114f`). Remaining math capabilities (Math V2/V3 from `MATH_BLOCK_PLAN.md`) are **postponed**
> so we can serve the MVP first.
>
> **2026-08 — Code Block teacher-facing MVP shipped.** The CodeBlock authoring (Phases 0–8 of
> `CODE_BLOCK_PLAN.md`) is complete (see the Code Block section below). **2026-08 — Phase 9
> (student-facing rendering) shipped** via the Student Presentation layer (Phase 8 below); edge-case
> testing (CODE_BLOCK_PLAN Phase 10) is in progress and UX polish (Phase 11) is planned next.

## Educational Content Blocks

New block types:

---

## Quiz Block

V1 authoring (shipped): see `QUIZ_BLOCK_PLAN.md` M1–M3.

- [x] Insert via `+` menu, Insert-Menu-Between, and slash menu (`/quiz`)
- [x] Editable title + per-question rich text (prompt, model answer, explanation) with shared toolbar
- [x] Choice questions: options, add/remove/reorder, single/multiple correct answers
- [x] Open questions: free-text model answer
- [x] Question CRUD, reordering, and type switching (choice ↔ open)
- [x] Difficulty and estimated time metadata
- [x] Resources: upload file/image/video, external URL, rename, reorder, remove (shared with Exercise)
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [x] No "Turn into" (content is not a single `{html}` field)
- [ ] True/false question variant
- [ ] Answer validation / grading
- [ ] Student results tracking

---

## Exercise Block

V1 authoring (shipped): see `EXCERCISE_BLOCK_PLAN.md` M1–M3.

- [x] Insert via `+` menu, Insert-Menu-Between, and slash menu (`/exercise`)
- [x] Editable title + difficulty/estimated time metadata
- [x] Multi-question exercises: question CRUD, reordering, duplication
- [x] Per-question rich text: prompt + hint + teacher notes (shared toolbar)
- [x] Resources: upload file/image/video, external URL, rename, reorder, remove (shared with Quiz)
- [x] Shared block building blocks (`components/blocks/shared/`): RichTextField, ResourceSection, Accordion, styles, useResources
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [ ] Student submissions
- [ ] Teacher feedback

---

## Code Block

Teacher-facing authoring MVP shipped (2026-08): see `CODE_BLOCK_PLAN.md` (Phases 0–8).

- [x] Insert via `+` menu, Insert-Menu-Between, and slash menu (`/code`)
- [x] Overlay code editor: line numbers, Tab/Shift+Tab indentation, native undo/redo, `Ctrl+/` toggle comment for selected lines
- [x] Language selection (Plain text + 22 languages)
- [x] Syntax highlighting (highlight.js, github theme)
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [x] Copy source code (raw, no line numbers/markup)
- [x] No "Turn into" (content is not a single `{html}` field)
- [x] Student-facing rendering — shipped 2026-08 via the Student Presentation layer (Phase 8)
- [ ] Edge-case/integration testing and UX polish (CODE_BLOCK_PLAN Phases 10–11) — testing in progress, polish planned next
- [ ] Code formatting
- [ ] Programming lessons support

---

## Flashcard Block

- [ ] Question/answer cards
- [ ] Study mode
- [ ] Review tracking

---

## Equation / Math Block

Math Block V1 shipped: see `MATH_BLOCK_PLAN.md` (V1) and `MATH_BLOCK_ARCHITECTURE.md`.

- [x] LaTeX canonical storage + KaTeX rendering
- [x] Live editing with source and visual (slot) modes
- [x] Symbol toolbar (Basic, Parentheses, Greek, Powers, Subscripts, Fractions, Roots, Calculus, Templates, Miscellaneous)
- [x] Template system with slots (fraction, sqrt, n-th root, integral, sum, quadratic formula, binomial, superscript, subscript)
- [x] Slot navigation (SHIFT/TAB) and nested template insertion
- [x] Whole-template deletion and bare `^`/`_` template insertion in visual mode
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [x] No "Turn into" (content is not a single `{html}` field)

Postponed (MVP-first) — Math V2/V3:

- [ ] Powers/superscripts polish
- [ ] Calculus (derivatives, limits, double/triple/contour integrals)
- [ ] Linear algebra (matrices, determinants, vectors)
- [ ] Logic, set theory, geometry symbol sets
- [ ] Formula templates / symbol search / favorites / custom templates
- [ ] Keyboard shortcuts, LaTeX import/export, inline math in prose

---

# Phase 7 — Editor Experience Improvements

## Navigation

- [x] Move blocks between slides
- [x] Drag blocks across slides
- [x] Slide duplication improvements
- [x] Better keyboard navigation

---

## Content Management

- [ ] Nested lists
- [ ] Block comments
- [ ] Mentions
- [ ] Block references
- [ ] Reusable blocks

---

## Clipboard System

Current:

- [x] Basic block clipboard
- [x] Table clipboard (cell / row / column copy-paste, see Phase 4)
- [x] External paste support (OS clipboard grid import into selected cells, e.g. from Excel)

Future:

- [x] Cross-slide copy/paste
- [x] Multi-block clipboard

---

# Phase 8 — Student Previewing & Presentation Rendering ✅

> **2026-08 — Student Presentation layer shipped.** The initial student-facing rendering phase
> (Phases 1–5 of `STUDENT_PREVIEWING_PLAN.md`) is complete and merged to `main`. A new `/presentation` route renders persisted slide/block data
> (bundled demo data for now — no API/persistence wiring yet) through a dedicated, editor-free
> renderer tree: `PresentationShell` → `SlideRenderer` → `BlockRouter` → per-block renderers. All
> existing block types render (text, callout, youtube, image, divider, table, exercise, quiz, math,
> code); unknown/empty/malformed blocks fail gracefully without mutating data. Student interaction is
> local-only (exercise answers, quiz selection, hint toggles) — no grading, no submission, no
> persistence. See ADR-018.
>
> In the same pass, plan Phase 6 (teacher preview) shipped: a "Preview" button in the Slide Editor
> opens a full-screen overlay (`TeacherPreview`) that renders the live, unsaved slides through the
> same presentation primitives — identical student appearance, with teacher-only chrome (preview
> badge, exit button) kept outside the student renderer tree.

## Presentation Shell & Navigation

- [x] Client-only `/presentation` route (`next/dynamic` + `ssr: false` — DOMPurify is browser-only)
- [x] Slide navigation (counter + prev/next buttons + Arrow keys)
- [x] Responsive layout and overflow handling

## Block Rendering

- [x] Central `BlockRouter` dispatch + unknown-block fallback
- [x] Text / Callout / YouTube / Image / Divider renderers
- [x] Table renderer (headers, spans, hidden cells, overflow)
- [x] Exercise / Quiz renderers (student interaction, local state only)
- [x] Math renderer (reuses the KaTeX `MathRenderer`)
- [x] Code renderer (reuses highlight.js + student copy button)

## Security

- [x] Centralized DOMPurify sanitization for all student-facing rich HTML (single allow-list, ADR-018)
- [x] No arbitrary code execution; code rendered escaped/static
- [x] Safe link handling in shared resources

## Teacher Preview (plan Phase 6) ✅

- [x] Full-screen preview overlay reusing the same presentation primitives (`SlideRenderer`, `BlockRouter`, `PresentationNavigation`, `presentation.css`)
- [x] Renders the editor's live slides (current, unsaved state)
- [x] No authoring controls inside the preview; teacher-only chrome kept outside the student renderer tree
- [x] Arrow-key navigation + Escape exit; editor shortcuts suppressed while open
- [x] Opened via "Preview" button in the Slide Editor header

## Deferred (plan Phases 7–8)

- [ ] VipiClass integration: persisted lessons, identity, permissions, progress, submissions (plan Phase 7)
- [ ] PDF / export rendering (plan Phase 8)

---

# Phase 9 — Platform Integration

## Lesson Management

- [ ] Dynamic lesson routing

Current:

```
/slides
```

Future:

```
/slides/[lessonId]
```

---

- [ ] Lesson dashboard
- [ ] Create lessons
- [ ] Search lessons
- [ ] Organize lessons

---

## Asset Management

- [ ] Cloud image storage
- [ ] Image uploading
- [ ] Drag-and-drop uploads
- [ ] Media library

Possible storage:

- Cloudinary
- Vercel Blob
- S3

---

# Phase 10 — AI Integration (Tafsiri AI)

The editor should become AI-ready.

Future capabilities:

## AI Content Creation

- [ ] Generate lesson sections
- [ ] Generate explanations
- [ ] Generate exercises
- [ ] Generate quizzes
- [ ] Improve teacher content

---

## AI Editing Assistance

- [ ] Rewrite selected text
- [ ] Summarize content
- [ ] Change difficulty level
- [ ] Translate content
- [ ] Generate examples

---

## AI Block Generation

Examples:

Teacher:

"Create a lesson about photosynthesis"

AI:

Creates:

- slides
- explanations
- diagrams
- exercises
- quizzes

---

# Phase 11 — Collaboration & Advanced Platform Features

Future long-term evolution:

## Collaboration

- [ ] Real-time editing
- [ ] Multiple teachers editing
- [ ] Student collaboration
- [ ] Presence indicators

---

## Document Intelligence

- [ ] Version history
- [ ] Comments
- [ ] Review workflow
- [ ] Content analytics

---

## Mobile Experience

> **Touched 2026-08 — NOT completed, will return later.** A first mobile-integration pass partially
> explored this area during the styling detour: touch long-press multi-selection for slides and
> blocks, native long-press text selection inside table cells, and custom dropdowns replacing native
> `<select>`s in block controls. This is an exploratory detour, **not** the completion of this
> phase. All items below remain open and will be addressed when the roadmap reaches Phase 11.

- [ ] Touch-friendly editing
- [ ] Mobile toolbar
- [ ] Touch selection
- [ ] Mobile drag-and-drop

---

# Development Principles

Throughout every phase:

1. Prefer extending existing infrastructure over creating parallel systems.

2. Maintain one source of truth for editor state.

3. Avoid premature abstraction.

4. Implement features progressively:

```
Implementation
      ↓
Debugging
      ↓
Refactoring
      ↓
Optimization
```

5. Keep the editor independent from VipiClass-specific business logic whenever possible.

---

# Current Priority Order

> **Next:** **VipiClass integration** (plan Phase 7) of the Student Presentation layer. The
> student-facing rendering (plan Phases 1–5) and the teacher preview mode (plan Phase 6) shipped
> 2026-08 (Phase 8 above); the CodeBlock still needs UX polish (CODE_BLOCK_PLAN Phase 11), and math
> V2/V3 remains postponed to serve the MVP first.

## Immediate

1. Finish Table V1+
2. Complete selection systems
3. Complete merge/split preparation
4. Stabilize editor architecture

## Short Term

1. Block transformation
2. More educational blocks
3. Asset management
4. Lesson management

## Long Term

1. AI-assisted authoring
2. Collaboration
3. Complete VipiClass learning platform integration
