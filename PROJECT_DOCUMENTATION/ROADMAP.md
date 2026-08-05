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

- [ ] Cell selection
- [ ] Active cell highlighting
- [ ] Row selection improvements
- [ ] Column selection improvements
- [ ] Table keyboard shortcuts
- [ ] Delete behavior depending on selection type

---

## Table Advanced Features ✅

- [ ] Internal table clipboard

Supported operations:

- copy cell
- copy row
- copy column
- paste cell
- paste row
- paste column

---

- [ ] Multi-cell selection

Features:

- rectangular selection
- Shift + click selection
- selection visualization
- selection actions

---

- [ ] Merge cells

Requirements:

- rectangular selection validation
- rowspan support
- colspan support
- hidden covered cells

---

- [ ] Split cells

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

- [ ] Central BLOCK_TYPES registry
- [ ] replaceBlock utility
- [ ] transformBlock utility
- [ ] Preserve HTML/content during transformation
- [ ] Transformation menu

---

# Phase 6 — Advanced Block System 🚧 CURRENT MILESTONE

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
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [x] No "Turn into" (content is not a single `{html}` field)
- [ ] True/false question variant
- [ ] Answer validation / grading
- [ ] Student results tracking

---

## Exercise Block

V1 authoring (shipped): see `EXCERCISE_BLOCK_PLAN.md` M1–M3.

- [x] Insert via `+` menu, Insert-Menu-Between, and slash menu (`/exercise`)
- [x] Editable title + rich-text instructions/hint/teacher notes (shared toolbar)
- [x] Difficulty and estimated time metadata
- [x] Resources: upload file/image/video, external URL, rename, reorder, remove
- [x] Two-tier history, autosave, clipboard/duplicate integration
- [ ] Student submissions
- [ ] Teacher feedback

---

## Code Block

- [ ] Syntax highlighting
- [ ] Code formatting
- [ ] Programming lessons support

---

## Flashcard Block

- [ ] Question/answer cards
- [ ] Study mode
- [ ] Review tracking

---

## Equation / Math Block

- [ ] Mathematical expressions
- [ ] LaTeX support
- [ ] Scientific content support

---

# Phase 7 — Editor Experience Improvements

## Navigation

- [ ] Move blocks between slides
- [ ] Drag blocks across slides
- [ ] Slide duplication improvements
- [ ] Better keyboard navigation

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

Future:

- [ ] Cross-slide copy/paste
- [ ] Table clipboard
- [ ] Multi-block clipboard
- [ ] External paste support

---

# Phase 8 — Platform Integration

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

# Phase 9 — AI Integration (Tafsiri AI)

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

# Phase 10 — Collaboration & Advanced Platform Features

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
