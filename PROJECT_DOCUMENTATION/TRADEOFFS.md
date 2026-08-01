# Technical Trade-offs & Recommendations: Slide Editor

To ensure clear communication and shared understanding across the team, this document analyzes key technical trade-offs in the repository. Each item explicitly distinguishes between:
* 👁️ **Confirmed Observations** (Verified directly from source code inspection)
* 💡 **Inferred Assumptions** (Logical deductions based on current implementation patterns)
* ⚠️ **Potential Risks** (Identified stability, performance, or maintenance hazards)
* 🎯 **Personal Recommendations** (Actionable technical guidance for team review)

---

## 1. State Architecture: Monolithic React Context (`EditorContext`) vs. Sub-tree Contexts

### Context
`EditorContext.jsx` currently acts as a single centralized provider managing undo/redo history, active slide IDs, selected blocks, clipboard states, slash menu positioning, table selections, table menus, table resize state, and cell editor instances.

* **👁️ Confirmed Observations**:
  * All editor components (`SlideCanvas`, `SortableBlock`, `BlockRenderer`, `TableBlock`, `TableCell`, `EditorToolBar`) consume state directly from `useEditorContext()`.
  * Modifying any state property (e.g. updating `slashQuery` or `tableResizeState`) triggers a re-render of all context consumer components across the slide canvas.

* **💡 Inferred Assumptions**:
  * A single context was chosen during early prototyping to minimize boilerplate and avoid complex multi-context prop drilling.

* **⚠️ Potential Risks**:
  * **Performance Degradation**: As slide decks grow larger or tables contain dozens of cells, high-frequency state updates (such as mouse move events during column resizing) cause widespread component re-renders, causing noticeable input lag or UI stuttering.

* **🎯 Personal Recommendations**:
  * **Split Contexts by Lifecycle**: Separate `EditorContext` into targeted sub-providers:
    1. `SlidesHistoryContext` (for low-frequency slide deck updates)
    2. `TableEditorContext` (scoped exclusively within `TableBlock.jsx` for table selection, resizing, and cell editor registrations)
    3. `UIOverlayContext` (for slash menus, toolbars, and contextual popovers)
  * Alternatively, introduce a lightweight state store with selector subscriptions (e.g., `zustand`) to isolate re-renders.

---

## 2. History Engine: Full Array Snapshots (`useHistory`) vs. Operational Transforms / Deltas

### Context
`useHistory.js` maintains an in-memory stack of up to 50 previous states (`past`, `present`, `future`). Every structural change executes `JSON.stringify(prev.present) === JSON.stringify(newSlides)` to detect changes before appending a full deep clone of the entire `slides` array.

* **👁️ Confirmed Observations**:
  * Deep equality checks and full state array snapshots occur on every recorded change.
  * Interactive features like cell typing and live resizing bypass history recording (`setSlidesWithoutHistory`) to avoid snapshot bloat.

* **💡 Inferred Assumptions**:
  * Array snapshotting was implemented for simplicity and correctness without requiring custom inverse action handlers for every block mutation type.

* **⚠️ Potential Risks**:
  * **Memory Footprint & CPU Spikes**: Running `JSON.stringify` on large presentation decks containing extensive text or complex nested tables on every keystroke/mutation consumes significant CPU cycles and garbage collection memory.
  * **State Loss during Bypassed Actions**: Because typing and resizing bypass history, pressing `Ctrl+Z` after typing text inside a cell reverts the *entire block creation or prior structural operation*, rather than undoing the last typed character.

* **🎯 Personal Recommendations**:
  * **Adopt Fine-Grained Patching / Immer**: Transition from full array cloning to structural sharing with `immer` or JSON patches.
  * **Integrate Tiptap Native Undo/Redo**: Let Tiptap handle internal rich text undo/redo per cell/block, reserving the global history stack for slide-level and block-level structural modifications (add/delete/reorder blocks).

---

## 3. Rich Text Architecture: Micro-Tiptap Instance Per Table Cell vs. Unified Table Engine

### Context
In `TableCell.jsx`, every single table cell instantiates its own dedicated Tiptap editor via `useRichTextEditor()`. Active editors are registered in `EditorContext.cellEditors.current` map.

* **👁️ Confirmed Observations**:
  * A table with 5 rows and 5 columns instantiates 25 simultaneous active Tiptap editor instances (`useEditor`).
  * Custom keybindings (`handleTableKeyDown`) intercept `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`, and `Tab` to shift focus between cell instances via `focusEditor(cellId)`.

* **💡 Inferred Assumptions**:
  * Micro-editors were chosen so that each cell could natively leverage Tiptap extensions (bold, italic, underline, highlight, starter kit) without building a custom table cell renderer.

* **⚠️ Potential Risks**:
  * **DOM & Event Listener Overhead**: Instantiating dozens of rich text editor instances on a single slide introduces substantial DOM nodes, ProseMirror event listeners, and memory allocation.
  * **Cross-Cell Formatting Complexity**: Multi-cell formatting (e.g. bolding text across 4 selected cells) requires iterating through multiple independent editor instances rather than applying a single transaction.

* **🎯 Personal Recommendations**:
  * **Cell Editor Lazy Loading**: Only instantiate a full Tiptap editor instance when a cell is double-clicked or focused. Render standard HTML (`dangerouslySetInnerHTML={{ __html: cell.html }}`) for inactive cells.
  * **Long-Term Consideration**: Evaluate Tiptap's official `@tiptap/extension-table` if free-form cell placement inside a standalone block becomes secondary to standard rich text table capabilities.

---

## 4. Table Layout Engine: Standard HTML `<table>` Element vs. CSS Grid / Virtualized Matrix

### Context
`TableBlock.jsx` renders standard HTML `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` elements styled via `table.css`.

* **👁️ Confirmed Observations**:
  * Live resizing calculates explicit column widths (`columnWidths`) and row heights (`rowHeights`) applied via inline styles onto `<col>` or `<td>` elements.
  * Drag handles are rendered outside or inside table cells to trigger `@dnd-kit` row/column reordering.

* **💡 Inferred Assumptions**:
  * Native `<table>` markup was selected for semantic HTML compliance and default browser layout behavior.

* **⚠️ Potential Risks**:
  * **Cell Merging / Span Calculation Complexity**: Implementing `rowspan` and `colspan` within native HTML tables requires complex matrix calculations to hide covered `<td>` elements while keeping drag handles aligned.

* **🎯 Personal Recommendations**:
  * Maintain native `<table>` elements for Table V1+ since current progress in `notes.md` is well underway.
  * Ensure covered merged cells are conditionally omitted from DOM rendering (using `display: none` or skipping element generation) to prevent table layout corruption.

---

## 5. Persistence Strategy: Debounced Full-Payload Auto-Save vs. Delta / Operational Updates

### Context
`SlideEditor.jsx` sets a 2-second timeout on any `slides` change to post the entire `slides` array to `/api/lessons/[lessonId]`.

* **👁️ Confirmed Observations**:
  * The save API endpoint uses Mongoose `Lesson.findByIdAndUpdate(lessonId, body, { upsert: true })`.
  * The full lesson payload containing all slides and blocks is transmitted over network HTTP POST on every save interval.

* **💡 Inferred Assumptions**:
  * Debounced full-payload posting avoids complex backend diffing and guarantees server state matches client state.

* **⚠️ Potential Risks**:
  * **Network Bandwidth & Race Conditions**: Sending multi-megabyte payloads every 2 seconds during active editing wastes bandwidth. If a user navigates away or network drops mid-save, progress can be lost.
  * **Lack of Optimistic Concurrency Control**: Simultaneous editing across multiple browser tabs will silently overwrite changes due to unconditional `findByIdAndUpdate`.

* **🎯 Personal Recommendations**:
  * Add a `beforeunload` browser navigation prompt if `saveStatus === "saving"`.
  * Implement endpoint payload trimming (e.g. updating only the modified slide via `/api/lessons/[lessonId]/slides/[slideId]`).
  * Introduce an explicit `updatedAt` timestamp check for version concurrency.
