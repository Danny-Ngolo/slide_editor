# Architectural Decision Records (ADRs): Slide Editor

This document records the key architectural and design decisions governing the **Slide Editor** codebase, providing context, rationale, and consequences for current and future maintainers.

---

## ADR-001: Adoption of Next.js 16 App Router & React 19

* **Status**: Accepted

### Context
The application requires a fast, modern web framework with seamless API route integration, client-side rich interactivity, and server rendering capability for lesson previews.

### Decision
Use Next.js 16 (App Router) with React 19 Client Components (`"use client"`) for the slide editor application UI and Next.js Route Handlers (`src/app/api/`) for persistence.

### Consequences
* **Positive**:
  * Unified codebase for frontend editor UI and backend REST API endpoints.
  * Native integration with modern React 19 features and Next.js routing.
* **Negative**:
  * Rich interactive client components require explicit `"use client"` directives throughout `src/app/slides/`.
  * Dynamic parameters and headers in Next.js 16 Route Handlers are asynchronous (`const { lessonId } = await params`).

---

## ADR-002: Modular Block-Based Architecture with BlockRenderer Dispatcher

* **Status**: Accepted
* **Date**: May 2026

### Context
Slides consist of heterogeneous content elements (text, tables, callouts, images, videos, quizzes). The system must support extensible block types without coupling slide canvas layout code to specific block renderers.

### Decision
Model slide content as an ordered array of polymorphic `Block` schemas (`{ id, type, content, important }`). Render blocks dynamically using a central `BlockRenderer.jsx` dispatcher component.

### Consequences
* **Positive**:
  * Adding a new block type (e.g. Code Block or Audio Block) simply requires defining a new component in `src/app/slides/components/blocks/` and adding a case in `BlockRenderer.jsx`.
  * Enables standardized wrapper features across all block types (selection outline, context menus, drag-and-drop handles).
* **Negative**:
  * `content` field uses loose schema validation (`mongoose.Schema.Types.Mixed`), shifting runtime validation responsibilities to client components.

---

## ADR-003: Custom In-Memory Snapshot History Engine (`useHistory`)

* **Status**: Accepted
* **Date**: May 2026

### Context
Users require Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) capabilities across slide and block editing operations.

### Decision
Implement a custom 3-tuple state stack (`{ past: [], present: [], future: [] }`) within `EditorContext.jsx` capped at 50 historical steps. Expose explicit `setSlides` (records history) and `setSlidesWithoutHistory` (bypasses history) methods via `useHistory.js`.

### Consequences
* **Positive**:
  * Simple, predictable implementation with zero external history dependencies.
  * Direct control over which user actions create restore points (e.g. bypassing continuous typing or dragging).
* **Negative**:
  * Memory utilization scales with deck size due to full state snapshots.
  * Typing inside text blocks or table cells bypasses history to prevent snapshot overload, requiring future refinement for granular text undo.

---

## ADR-004: Micro-Editor Per Cell Table Architecture

* **Status**: Accepted (Under Refinement)
* **Date**: June 2026

### Context
Tables within slides require rich text formatting (bold, italic, lists, highlights) inside individual cells, as well as keyboard navigation between cells.

### Decision
Instantiate a separate Tiptap rich text editor instance (`useEditor`) inside each `TableCell.jsx`. Register active editors in a shared `cellEditors` ref map inside `EditorContext` to enable keyboard navigation via `focusEditor(cellId)`.

### Consequences
* **Positive**:
  * Unlocks full rich text capabilities inside every table cell.
  * Enables precise arrow key and Tab navigation between cells.
* **Negative**:
  * High DOM and event listener count for large tables.
  * Requires active WIP enhancements to support multi-cell range selection, copy/paste, and cell merging.

---

## ADR-005: `@dnd-kit` for Multi-Level Drag-and-Drop Reordering

* **Status**: Accepted
* **Date**: June 2026

### Context
Users need to reorder slides in the sidebar, reorder blocks vertically on the slide canvas, and reorder rows and columns within tables.

### Decision
Standardize on `@dnd-kit/core` and `@dnd-kit/sortable` for all drag-and-drop interactions across the codebase.

### Consequences
* **Positive**:
  * Modern, accessible, touch-supported drag-and-drop framework.
  * Clean separation of drag sensors, collision algorithms, and sortable contexts.
* **Negative**:
  * Nested `DndContext` providers (canvas block sorting wrapping table row/column sorting) require explicit drag data tagging (`e.active.data.current.type`) to prevent event collisions.

---

## ADR-006: Debounced Client-Driven Auto-Save to MongoDB

* **Status**: Accepted
* **Date**: June 2026

### Context
Edits must be saved automatically to prevent data loss without overwhelming the database with HTTP requests on every keystroke.

### Decision
Implement a 2-second client-side debounce timer in `SlideEditor.jsx`. When `slides` state changes, schedule `lessonService.saveLesson(lessonId, { slides })` to POST updated data to MongoDB via Mongoose.

### Consequences
* **Positive**:
  * Seamless user experience with visual save status indicators ("Saving", "Saved", "Error").
  * Eliminates the need for manual save buttons during ordinary editing.
* **Negative**:
  * Transmits full slide deck array on each save cycle.
  * Network interruption during active editing can leave unpersisted changes on the client.
