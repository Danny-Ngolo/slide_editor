# Project Context: Slide Editor

## 1. Overview & Vision

**Slide Editor** is a web-based, block-structured presentation and lesson authoring application built with Next.js 16, React 19, Tiptap, and Mongoose (MongoDB). It aims to provide educators and content creators with an intuitive canvas to create, edit, reorder, and persist interactive lesson slides consisting of heterogeneous block types (rich text, tables, callouts, images, videos, dividers, and quizzes).

---

## 2. Business Context & Primary Use Cases

* **Educational Content Creation**: Teachers and instructors build structured lessons made up of individual sequential slides.
* **Interactive Media & Block Editing**: Slide content is broken down into discrete blocks that can be reformatted, reordered via drag-and-drop, transformed, or duplicated.
* **Rich Data Presentation**: Tables serve as a core data display and manipulation element within slides, supporting advanced features like cell selection, resizing, drag-and-drop row/column reordering, and keyboard navigation.

---

## 3. Core Domain Entities & Concepts

| Entity | Description | Storage Model |
| :--- | :--- | :--- |
| **Lesson** | Top-level container representing a complete presentation deck with metadata (`title`, timestamps). | MongoDB document in `SlideLesson` collection. |
| **Slide** | A single card/view within a lesson containing an ordered list of blocks. | Embedded array within `LessonSchema.slides`. |
| **Block** | Primitive content unit (`text`, `table`, `image`, `youtube`, `callout`, `divider`, `quiz`). | Embedded array within `SlideSchema.blocks`. |
| **Cell** | Content container within a Table Block, hosting an isolated rich text editor. | Nested object inside `TableBlock.content.rows[].cells[]`. |

---

## 4. Current Operational Workflows

1. **Lesson Loading & Initialization**:
   * App mounts at `/slides` (`src/app/slides/page.jsx`).
   * Passes `lessonId` to `SlideEditor` which fetches data via `lessonService.getLesson(lessonId)`.
   * Populates `EditorContext`'s `slidesHistory.present` with slide data.

2. **Slide & Block Editing Canvas**:
   * Users select slides from `SlidesSidebar`.
   * Active slide blocks render in `SlideCanvas` via `BlockRenderer`.
   * Users can insert new blocks via `InsertMenuBetween` or floating `InsertMenu`, or via `/` slash menu within Tiptap text areas.
   * Blocks can be reordered vertically using `@dnd-kit` handle dragging.

3. **Table Block Interactions**:
   * Table blocks support adding/deleting/duplicating rows and columns.
   * Mouse handlers support live column width and row height resizing.
   * Drag handles allow reordering rows or columns using `@dnd-kit`.
   * Keyboard shortcuts (Arrow keys, Tab, Enter, Shift+Tab) navigate focus between adjacent cell Tiptap editors.

4. **State Persistence & History**:
   * Local mutations update `slidesHistory.present` state via `useHistory`.
   * Every structural mutation records a snapshot into `slidesHistory.past` (up to 50 history steps).
   * Interactive inputs (typing, resizing) update `present` state without adding history steps (`setSlidesWithoutHistory`).
   * A 2-second debounce timer triggers `handleSave()`, sending the full `slides` payload to POST `/api/lessons/[lessonId]`.

---

## 5. Current Project Status & Known Pain Points

* **Hardcoded Lesson Entry**: `src/app/slides/page.jsx` uses a hardcoded lesson ID (`lessons[0]._id`), lacking dynamic route param resolution (e.g. `/slides/[lessonId]`) or a lesson selection dashboard.
* **Uncommitted Table WIP**: Active working changes exist in table components (`TableBlock.jsx`, `TableCell.jsx`, `useTable.js`, `table.css`) progressing toward cell-level selection and manipulation.
* **Local Image Upload Constraints**: Image blocks rely on raw URL/local file paths without integrated cloud storage (S3/Cloudinary/Vercel Blob).
* **Monolithic Editor Context**: `EditorContext.jsx` holds shared state for history, active editors, block selections, clipboard, slash menu, table menus, and cell editor refs in a single React context provider.
