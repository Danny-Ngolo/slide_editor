# System Architecture: Slide Editor

## 1. Architectural Philosophy

The Slide Editor is designed as a reusable editing engine rather than a feature dedicated exclusively to slide presentations.

Every architectural decision should satisfy four goals:

* **Maintainability**
* **Extensibility**
* **Single source of truth**
* **Progressive evolution**

Whenever implementation convenience conflicts with long-term maintainability, architectural consistency should generally be preferred unless intentionally building a prototype.

---

# 2. Core Architectural Principles

These principles govern every new feature added to the editor.

---

## 2.1 One State, One Owner

Every piece of state has exactly one owner.

Duplicate state is avoided whenever possible.

If multiple components require access to the same information, ownership belongs to the nearest shared context rather than copying state into several components.

Example:

```text
EditorContext
      │
      ├── selectedBlock
      ├── selectedBlocks
      ├── activeEditor
      ├── tableSelection
      ├── clipboard
      └── history
```

Components consume state.

They do not own shared state.

---

## 2.2 Contexts Own Shared State

React Context is used exclusively for state that must be shared between multiple independent parts of the editor.

Typical examples include

* history
* selection
* active editor
* clipboard
* floating menus

Contexts expose state.

Business logic remains inside hooks.

---

## 2.3 Hooks Own Behavior

Custom hooks encapsulate editor behavior.

Examples

```text
useHistory()

↓

undo()

redo()

setSlides()
```

```text
useTable()

↓

moveRow()

moveColumn()

resizeColumn()

resizeRow()
```

Hooks operate on shared state.

They do not create duplicate copies of shared state.

---

## 2.4 Components Render

React components should primarily render UI.

Complex business logic should remain inside hooks.

Rendering hierarchy therefore stays predictable.

```text
Component

↓

Hook

↓

Context

↓

State
```

---

## 2.5 Progressive Development

Features generally evolve in four stages.

```text
Make it work

↓

Debug

↓

Refactor

↓

Modularize
```

Premature abstraction is intentionally avoided.

Patterns emerge from working software rather than being predicted in advance.

---

# 3. Domain Model

```
Lesson

└── Slides[]

      └── Blocks[]

             └── Content
```

Tables extend the model:

```
Table Block

└── Rows[]

      └── Cells[]
```

Blocks are embedded directly inside slides.

This mirrors the editing model while simplifying rendering and persistence.

---

# 4. Rendering Architecture

Rendering follows a dispatcher pattern.

```
SlideCanvas

↓

BlockRenderer

↓

TextBlock

CalloutBlock

TableBlock

ImageBlock

VideoBlock
```

Each block renders only itself.

Shared editor functionality remains centralized.

---

# 5. Rich Text Architecture

Rather than each block implementing its own editor logic, all rich text behavior passes through one abstraction.

```
useRichTextEditor()

↓

Text

Callout

Table Cell
```

Responsibilities include

* editor initialization

* toolbar synchronization

* keyboard handling

* editor registration

* shared formatting

This guarantees a consistent editing experience across every rich-text block.

---

# 6. Shared Toolbar Architecture

Only one toolbar exists.

```
Editor

↓

EditorContext.activeEditor

↓

Toolbar
```

Whenever focus changes

```
Text Block

↓

Table Cell

↓

Callout
```

the toolbar automatically updates because the active editor changes.

No toolbar belongs to an individual block.

---

# 7. History Architecture

History follows the classic

```
Past

↓

Present

↓

Future
```

model.

Structural operations call

```
setSlides()
```

Interactive operations call

```
setSlidesWithoutHistory()
```

This prevents continuous typing or mouse movement from generating hundreds of history entries.

---

# 8. Drag & Drop Architecture

All drag-and-drop interactions use the same infrastructure.

```
@dnd-kit

↓

Slides

↓

Blocks

↓

Rows

↓

Columns
```

Shared helpers such as

```
useEditorSortable()
```

standardize draggable behavior across the editor.

---

# 9. Persistence Architecture

The editor operates entirely on local state.

```
Editor

↓

EditorContext

↓

History

↓

Autosave

↓

REST API

↓

MongoDB
```

Users interact only with local state.

Persistence occurs asynchronously.

---

# 10. Scalability Philosophy

New features should reuse existing infrastructure whenever possible.

Examples

New block

↓

BlockRenderer

↓

useRichTextEditor

↓

Toolbar

↓

History

↓

Autosave

↓

Clipboard

Rather than building isolated implementations, every new feature should inherit the editor's existing systems.

---

# 11. Future Evolution

The current architecture intentionally prepares for capabilities including

* collaborative editing
* AI-assisted authoring
* version history
* comments
* reusable document editing
* additional block types
* cross-document clipboard
* mobile editing

These features should extend the existing architecture rather than replace it.