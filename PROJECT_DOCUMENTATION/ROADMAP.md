# Product & Technical Roadmap: Slide Editor

## 1. Overview & Current Development Phase

The project has established a stable foundational architecture for slide deck management, block reordering, and rich text editing. The codebase is currently in **Phase 2 (Table V1+ Enhancements)** with active focus on cell selection, multi-cell interactions, and advanced tabular operations as documented in `notes.md`.

## 2. Detailed Milestone Goals

### Phase 1: Core Foundation (Completed)
- [x] Slide deck initialization, addition, deletion, and sidebar navigation (`useSlides`, `SlidesSidebar`).
- [x] Block primitives (`text`, `table`, `image`, `youtube`, `callout`, `divider`, `quiz`).
- [x] Vertical block reordering via `@dnd-kit/sortable`.
- [x] Global Undo/Redo history stack with 50-snapshot cap (`useHistory`).
- [x] Debounced auto-save to MongoDB via REST API (`/api/lessons/[lessonId]`).
- [x] Slash command menu (`/`) for inline block creation and formatting.
- [x] Basic Table V1 (Row/Column add, delete, duplicate, drag reorder, handle click context menus, live resize, keyboard cell navigation).

---

### Phase 2: Table V1+ Enhancements (Active Work in Progress)

1. **Cell Selection Foundation** (In Progress):
   - [x] Expose `selectCell` in `useTable.js`.
   - [ ] Connect `onClick` in `TableCell.jsx` to update `tableSelection` (`type: "cell"`).
   - [ ] Highlight active cell with non-layout-shifting CSS outline.

2. **Keyboard Delete Shortcuts**:
   - [ ] Hook `Delete` and `Backspace` keys in global listener to erase content or delete selected row/column/cell.

3. **Internal Table Clipboard**:
   - [ ] Implement in-memory table clipboard object (`clipboard = { type: "row"|"column"|"cell", data: ... }`).
   - [ ] Bind `Ctrl+C` and `Ctrl+V` when table selection is active to copy/duplicate table structures.

4. **Multi-Cell Range Selection**:
   - [ ] Support `Shift+Click` cell selection bounding rectangle (`start: {row, column}, end: {row, column}`).
   - [ ] Render rectangular range highlight over selected cell bounding box.

5. **Merge & Split Cells**:
   - [ ] Validate rectangular selection area.
   - [ ] Apply `rowspan` and `colspan` attributes to anchor cell; mark covered cells as hidden.
   - [ ] Implement `Split Cell` action to reset spans to 1 and unhide covered cells.

---

### Phase 3: Platform Integration & Asset Management (Upcoming)
*Reference: `neverforgetnotes.md` pending checklist*

1. **Dynamic Lesson Management & Routing**:
   - [ ] Replace hardcoded lesson ID in `src/app/slides/page.jsx` with dynamic route parameter `/slides/[lessonId]`.
   - [ ] Build lesson dashboard overview page (`/lessons`) allowing users to create, search, and open lessons.
   - [ ] Implement environment variable configuration cleanup (`MONGODB_URI` environment validation).

2. **Cloud Storage Asset Pipeline**:
   - [ ] Transition `ImageBlock.jsx` from raw URL string input / local filesystem paths to a cloud storage engine (Cloudinary, AWS S3, or Vercel Blob).
   - [ ] Implement direct drag-and-drop image file uploading within the canvas.

---

### Phase 4: Mobile Optimization & Type Safety (Future)

1. **Mobile & Touch UX**:
   - [ ] Implement mobile-friendly selection controls, floating toolbars, and touch-optimized drag handles.
   - [ ] Provide virtual control buttons for key shortcuts (`Ctrl`, `Shift`, `Delete`) on touch devices.

<!-- 2. **TypeScript Migration**:
   - [ ] Populate `src/app/slides/types/` with TypeScript interfaces for `Lesson`, `Slide`, `Block`, `TableSelection`, and `EditorState`.
   - [ ] Migrate `.js` and `.jsx` files to `.ts` and `.tsx` for strict build-time safety. -->
