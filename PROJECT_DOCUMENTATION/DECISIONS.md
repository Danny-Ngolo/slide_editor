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

The Exercise Block needs three rich-text fields on a single block: instructions, hint, and teacher notes. The shared rich-text pipeline (`useInitEditor` + `updateEditorUI` in `useRichTextEditor`) stores content as `{ html }` and routes changes through an `onContentChange` callback that writes the whole block `content`.

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