````md
# CodeBlock — Design & Implementation Plan

> Status: **Teacher-facing MVP shipped 2026-08** (Phases 0–8 complete).
>
> This is the reference plan for the CodeBlock. The teacher-facing authoring MVP is implemented and
> shipped (Phases 0–8 in §27): data model, block integration, overlay code editing, language
> selection, syntax highlighting, history/persistence, and copy. **Phases 9–11 are deferred** and will
> be implemented when the VipiClass student/lesson rendering flow exists: Phase 9 (student-facing
> rendering) depends on that flow, which is not built yet; Phase 10 (edge cases/integration testing)
> and Phase 11 (UX polish) will follow once that rendering path is available.

## 1. Purpose

The CodeBlock is a block type in the VipiClass Slide Editor designed for presenting source code as educational content.

Teachers use it to write or paste code, identify its language, and present it with appropriate syntax highlighting.

Students primarily consume the code as readable instructional content and may copy it when useful.

The CodeBlock is intended for teaching, explanation, demonstration, and illustration. It is not intended to become a programming IDE.

---

# 2. Product Context

VipiClass is an education platform whose Classroom pillar allows teachers to create lessons composed of slides.

Each slide contains an ordered collection of blocks.

Examples of blocks include:

- Text
- Image
- YouTube
- Callout
- Table
- Code

The CodeBlock is therefore one content primitive inside the existing block-based Slide Editor.

Conceptually:

Lesson
└── Slides
└── Blocks
├── Text
├── Image
├── YouTube
├── Callout
├── Table
└── Code

The CodeBlock must integrate naturally with the existing block system rather than introducing a separate editing architecture for the whole slide.

---

# 3. Core Definition

> CodeBlock is an educational source-code presentation block.

Its primary responsibility is to allow a teacher to:

1. Create a code block.
2. Enter or paste source code.
3. Specify the programming language when relevant.
4. Edit the code.
5. See the code presented clearly.
6. Save the code as part of the slide content.

When students consume the lesson, they should be able to:

1. Read the code comfortably.
2. Understand the language/context from its presentation.
3. Copy the code when useful.

---

# 4. What CodeBlock Is NOT

The CodeBlock is NOT a mini IDE.

The MVP should not attempt to provide:

- Code execution
- Interactive REPL
- Debugging
- Terminal access
- Package installation
- Project/file management
- Multiple files
- IntelliSense
- Advanced autocomplete
- Compilation
- Runtime error reporting
- Dependency management
- Collaborative code editing
- Full IDE-like navigation
- Code execution sandbox

These features may be considered independently in the future, but they are outside the current CodeBlock scope.

The goal is:

> Present and edit educational code well — not develop software inside VipiClass.

---

# 5. Primary Users

## 5.1 Teacher

The teacher is the primary author of a CodeBlock.

The teacher should be able to:

- Add a CodeBlock to a slide.
- Enter or paste code.
- Select a language.
- Edit existing code.
- Review how the code is presented.
- Save the block as part of the slide.

## 5.2 Student

The student is the primary consumer of the CodeBlock.

The student should primarily be able to:

- Read the code.
- Distinguish code syntax visually.
- Identify the language when relevant.
- Copy the code.

The teacher's editing experience and student's viewing experience do not have to be identical.

---

# 6. Educational Use Cases

CodeBlock should support different educational situations.

## 6.1 Programming Example

A computer science teacher can demonstrate a JavaScript function.

```js
function greet(name) {
  return `Hello ${name}`;
}
```
````

## 6.2 Data Analysis

A statistics or economics teacher can demonstrate Python.

```python
import pandas as pd

data = pd.read_csv("students.csv")
data.describe()
```

The purpose is not necessarily to teach Python itself. Python may simply be the medium used to explain another subject.

## 6.3 SQL Example

A database teacher can demonstrate a query.

```sql
SELECT *
FROM students
WHERE grade >= 60;
```

## 6.4 Command Example

A teacher can demonstrate a terminal command.

```bash
npm install mongoose
```

## 6.5 Small Code Snippet

The CodeBlock should work equally well for very small snippets.

```js
const total = price * quantity;
```

The block should not require a large code sample.

---

# 7. Core MVP Capabilities

The MVP CodeBlock should support:

### 7.1 Code Content

The teacher can type or paste source code.

The code should be preserved as code rather than being treated as rich text.

### 7.2 Language

The CodeBlock should store the language associated with the code.

Examples:

- JavaScript
- Python
- HTML
- CSS
- SQL
- Java
- C
- C++
- PHP
- Bash
- JSON
- etc.

The exact initial language list should be based on the syntax-highlighting solution selected during implementation.

The implementation should avoid hard-coding an unnecessarily large language ecosystem if the highlighting library does not require it.

### 7.3 Syntax Highlighting

The code should be presented using syntax highlighting appropriate to the selected language.

Syntax highlighting is primarily a presentation feature.

It should not alter the actual stored source code.

### 7.4 Direct Editing

The teacher should be able to edit the code directly inside the CodeBlock.

The editing experience should support normal code-editing fundamentals such as:

- Multiple lines
- Indentation
- New lines
- Pasting
- Cursor movement
- Selection
- Deletion
- Keyboard input

The goal is a good educational code editing experience, not a complete IDE.

### 7.5 Copying

The rendered CodeBlock should provide an obvious way to copy the source code.

Copying should copy the actual source code, not the syntax-highlighted HTML representation.

---

# 8. Proposed Data Model

The initial conceptual model is:

```js
{
  id: "block-123",
  type: "code",
  important: "false",
  content: {
    code: "const students = [];",
    language: "javascript"
  }
}
```

The data model should remain minimal and respect the architecture we designed for other blocks.

Do not introduce fields merely because they might become useful in the future.

Potential future metadata such as:

- filename
- caption
- title
- highlighted lines
- line numbers
- code output

should not be added to the MVP unless there is a concrete product requirement for them.

---

# 9. Data Principles

## 9.1 Source Code Is the Source of Truth

The actual source code should be stored as plain text.

Syntax highlighting should be generated from that source.

Do not store syntax-highlighted HTML as the canonical code content.

Conceptually:

Source:

```text
const total = price * quantity;
```

↓

Stored:

```js
content.code = "const total = price * quantity;";
```

↓

Rendered:

```text
Syntax-highlighted presentation
```

This separation keeps the data clean and makes future rendering changes easier.

---

# 10. CodeBlock and Rich Text

CodeBlock should NOT be implemented as a normal rich-text block whose text is merely styled to look like code.

Code has different semantics from normal prose.

A text block may contain:

- Bold
- Italic
- Links
- Lists
- Headings
- Inline formatting

CodeBlock should instead treat the source code as code content.

This distinction should be preserved even if an existing editor library is reused internally.

---

# 11. CodeBlock and TipTap

The existing Slide Editor uses TipTap for rich-text editing.

The implementation should not automatically assume that CodeBlock must use TipTap.

The decision should be based on the actual requirements of code editing.

The AI teammate should first inspect the existing editor architecture and determine whether:

- TipTap can cleanly support the required CodeBlock behavior, or
- a dedicated lightweight code-editing surface is more appropriate.

The CodeBlock should not inherit unnecessary rich-text behavior simply because TipTap already exists in the project.

The existing architecture should be reused where appropriate, not forced where it creates conceptual or technical problems.

---

# 12. Responsibilities

## CodeBlock should own

Code-specific concerns such as:

- Code content
- Language
- Code editing behavior
- Code-specific presentation
- Syntax highlighting integration
- Code copy behavior

## The Slide Editor should own

General editor concerns such as:

- Block creation
- Block ordering
- Block selection
- Multi-selection
- Moving blocks
- Deleting blocks
- Undo/redo
- Autosave
- Persistence
- Active slide state
- General block actions

CodeBlock should participate in these systems rather than reimplementing them.

---

# 13. Important Architectural Boundary

The CodeBlock should not create its own parallel slide/block state system.

It should integrate with the existing editor state architecture.

For example:

```text
Slide Editor
│
├── Slide State
│
├── Block State
│
├── Selection
│
├── History
│
├── Autosave
│
└── CodeBlock
      ├── code
      ├── language
      ├── code editing
      └── code presentation
```

The CodeBlock is a consumer of the editor's infrastructure.

It is not a second editor inside the editor.

---

# 14. MVP UX Direction

The CodeBlock should feel lightweight.

A conceptual editing experience could look like:

┌─────────────────────────────────────┐
│ JavaScript ▼ │
├─────────────────────────────────────┤
│ const students = []; │
│ │
│ students.push(student); │
│ │
└─────────────────────────────────────┘

The exact visual design is intentionally not fixed in this document.

Styling and visual polish should follow the existing VipiClass design language.

The important requirement is the interaction model, not the exact appearance.

---

# 15. Line Numbers

Line numbers are useful for educational code, especially when teachers refer to specific lines.

However, line numbers should not automatically become part of the stored source code.

For example:

Stored:

```js
const x = 10;
console.log(x);
```

Displayed:

```text
1  const x = 10;
2  console.log(x);
```

Line numbers are presentation metadata, not source content.

Whether line numbers are enabled in the MVP should be determined after evaluating the selected editing/highlighting approach.

They should not complicate the underlying data model.

---

# 16. Copy Behavior

Copying should copy only the source code.

For example, if the UI displays:

```text
1  const x = 10;
2  console.log(x);
```

copying should produce:

```js
const x = 10;
console.log(x);
```

It should NOT copy:

- Line numbers
- Syntax-highlighting markup
- UI labels
- Language selector text
- Copy button text

---

# 17. Language Selection

The language should be associated with the CodeBlock.

The UI may provide a language selector.

Conceptually:

```text
Language: JavaScript ▼
```

The language selection should primarily affect presentation/highlighting.

Changing the language should not modify the underlying source code.

The implementation should also consider an option for code where the language is unknown or irrelevant.

---

# 18. Empty CodeBlock

When a teacher creates a new CodeBlock, the block will initially contain no source code.

The empty state should make the expected action obvious.

For example:

```text
Start typing or paste your code...
```

The exact placeholder text is a UX decision and may be refined during implementation.

The placeholder must not become actual stored code content.

---

# 19. Keyboard Behavior

The CodeBlock should provide normal code-editing keyboard behavior.

At minimum:

- Enter creates a new line.
- Tab/indentation should behave reasonably.
- Shift+Tab should reasonably support dedentation where technically appropriate.
- Arrow keys should behave normally.
- Ctrl/Cmd+A should select the code within the editing context where appropriate.
- Ctrl/Cmd+C should copy selected code normally.
- Pasting should preserve source code as plain text.

The implementation should avoid interfering with the Slide Editor's global keyboard shortcuts unless necessary.

Special attention should be given to:

- Undo/redo
- Block selection
- Delete/backspace behavior
- Keyboard shortcuts already used by the editor

---

# 20. Undo/Redo

Code editing must integrate correctly with the existing Slide Editor history system.

The CodeBlock must not cause uncontrolled history pollution.

Typing every character should not necessarily create an independent slide-level history snapshot if the existing editor architecture is designed to group changes.

The AI teammate must inspect and understand the existing history implementation before integrating CodeBlock.

The existing history model should be reused rather than creating a second independent undo/redo system without a strong reason.

---

# 21. Persistence

CodeBlock data must persist as part of the existing slide/block structure.

The saved representation should contain the source code and its required metadata.

Example:

```js
{
  id: "block-123",
  type: "code",
  content: {
    code: "console.log('Hello');",
    language: "javascript"
  }
}
```

The implementation must remain compatible with the existing slide serialization/persistence architecture.

---

# 22. Rendering / Student View

The CodeBlock's authoring interface and student-facing rendering should be conceptually separated.

Teacher:

```text
Editing experience
```

Student:

```text
Reading experience
```

The student does not need to see editing controls.

The rendered block should focus on:

- Readability
- Syntax highlighting
- Clear language identification when useful
- Copying
- Appropriate scrolling for large code samples

---

# 23. Long Code Samples

CodeBlock should not assume that every code sample fits within the slide vertically.

For larger examples, the presentation should support scrolling rather than expanding the entire slide indefinitely.

The exact maximum height and scrolling behavior are UX decisions to be refined during implementation.

The important principle is:

> Large code should remain usable without breaking the slide layout.

---

# 24. MVP Out of Scope

The following should explicitly remain outside the MVP:

- Code execution
- Live previews
- Interactive code output
- Debugging
- Autocomplete/IntelliSense
- Error diagnostics
- Package installation
- File/project management
- Multiple files
- Code folding unless trivially supported by the chosen solution
- Collaborative coding
- Version control integration
- AI code generation inside the block
- AI code explanation inside the block
- Code execution security/sandboxing

These may become future features, but they should not influence the MVP architecture unnecessarily.

---

# 25. Possible Future Features

Future versions may consider:

- Code title
- Filename
- Caption
- Highlight specific lines
- Line numbers
- Code folding
- More advanced code editing
- Code explanations
- AI-assisted code explanation
- AI-generated examples
- Interactive examples
- Executable code
- Output panels
- Language-specific tools

These possibilities should be considered when avoiding architectural dead ends, but should NOT be implemented prematurely.

---

# 26. Design Principles

The implementation should follow these principles:

### Principle 1 — Educational first

Code exists to support teaching and learning.

### Principle 2 — Simple before powerful

The MVP should provide the smallest feature set that makes CodeBlock genuinely useful.

### Principle 3 — Source code remains clean

Store source code as plain text.

### Principle 4 — Presentation is separate from content

Syntax highlighting, line numbers, and UI controls should not pollute the stored source code.

### Principle 5 — Reuse existing editor infrastructure

CodeBlock should integrate with existing:

- block state
- selection
- ordering
- history
- autosave
- persistence

### Principle 6 — Avoid unnecessary abstractions

Do not introduce elaborate abstractions, generalized editor frameworks, or additional state layers unless the existing architecture genuinely requires them.

### Principle 7 — Do not turn CodeBlock into an IDE

The feature should remain focused on educational code presentation.

---

# 27. Implementation Roadmap

Implementation should proceed incrementally.

> **Status 2026-08 — Phases 0–8 shipped (teacher-facing MVP).** The teacher-facing CodeBlock authoring
> is complete: insert via `+` menu / Insert-Menu-Between / slash menu; overlay code editor (line
> numbers, Tab/Shift+Tab indentation, native undo/redo, `Ctrl+/` toggle comment for selected lines);
> language selection (Plain text + 22 languages); highlight.js syntax highlighting (github theme);
> two-tier history + autosave + clipboard/duplicate integration; copy button that copies the raw
> source. **Phases 9–11 are deferred**: Phase 9 (student-facing rendering) will be implemented when
> the VipiClass student/lesson rendering flow exists; Phase 10 (edge cases) and Phase 11 (UX polish)
> will follow that phase.

## Phase 0 — Understand the Existing Architecture ✅ done

Before writing CodeBlock code, inspect:

- Existing block architecture
- Block creation flow
- Block rendering flow
- Block state structure
- Slide state management
- History implementation
- Autosave
- Persistence/serialization
- Existing keyboard shortcuts
- Existing selection behavior
- Existing styling conventions
- Existing block components
- Existing hooks related to blocks

Do not modify unrelated architecture during this phase.

Deliverable:

A short implementation note describing where CodeBlock fits into the existing architecture.

---

## Phase 1 — Define the Minimal Data Model ✅ done

Implement the smallest CodeBlock representation.

Target:

```js
{
  id: "...",
  type: "code",
  content: {
    code: "",
    language: null
  }
}
```

Confirm that:

- The block can be created.
- It can be stored in a slide.
- It can be serialized.
- It can be restored correctly.

Do not implement syntax highlighting yet.

---

## Phase 2 — Create the Basic CodeBlock ✅ done

Create the CodeBlock component and integrate it into the existing block rendering system.

At this stage it should:

- Render correctly.
- Display its current code.
- Display an empty state when necessary.
- Participate in existing block selection/actions.
- Respect existing slide layout behavior.

Keep the implementation simple.

---

## Phase 3 — Implement Code Editing ✅ done

Add the actual editing surface.

Requirements:

- Multiline editing
- Typing
- Pasting
- Selection
- Cursor movement
- New lines
- Basic indentation behavior
- Deletion
- Normal keyboard interaction

Do not add advanced IDE features.

At the end of this phase, the teacher should be able to create and edit useful code samples.

---

## Phase 4 — Language Selection ✅ done

Add language selection.

Requirements:

- Display current language.
- Change language.
- Persist language.
- Keep source code unchanged when language changes.

Example:

```js
{
  code: "const x = 10;",
  language: "javascript"
}
```

---

## Phase 5 — Syntax Highlighting ✅ done

Integrate syntax highlighting.

Requirements:

- Highlight according to selected language.
- Preserve source code exactly.
- Handle unsupported/unknown languages gracefully.
- Avoid storing highlighted HTML as the canonical source.

The highlighting solution should be chosen based on the project's existing dependencies and architecture rather than introducing a library unnecessarily.

---

## Phase 6 — History Integration ✅ done

Verify interaction with the existing history system.

Test:

- Typing
- Pasting
- Deleting
- Language changes
- Undo
- Redo
- Switching between blocks
- Switching between slides

Ensure CodeBlock does not cause excessive history snapshots or break existing undo/redo behavior.

---

## Phase 7 — Persistence and Autosave Verification ✅ done

Verify that:

1. Code changes are persisted.
2. Language changes are persisted.
3. Reloading restores the CodeBlock.
4. Autosave behaves correctly.
5. Switching slides does not lose code.
6. Switching blocks does not lose code.

---

## Phase 8 — Copy Code ✅ done

Add a copy action to the appropriate CodeBlock presentation UI.

The copied value must be the raw source code.

Verify:

- Multiline code copies correctly.
- Indentation is preserved.
- Line numbers are not copied.
- UI text is not copied.
- Syntax highlighting markup is not copied.

---

## Phase 9 — Student-Facing Rendering ⏸ deferred (until student flow)

If the project already has a lesson/student rendering architecture, integrate CodeBlock there.

The student view should:

- Render the source code.
- Apply syntax highlighting.
- Show language information when appropriate.
- Provide copy functionality.
- Handle large code samples gracefully.

No editing controls should appear in the student view.

---

## Phase 10 — Edge Cases and Integration Testing ⏸ deferred (after student flow)

Test at least:

### Content

- Empty code
- One-line code
- Large code
- Multiline code
- Special characters
- Quotes
- Backticks
- HTML-like content
- Unicode characters

### Languages

- Supported language
- Unsupported language
- No language

### Editor behavior

- Undo/redo
- Block selection
- Multi-selection
- Moving block
- Deleting block
- Adding blocks before/after
- Switching slides
- Autosave

### Persistence

- Save
- Reload
- Restore
- Reopen lesson

---

## Phase 11 — UX and Styling Polish ⏸ deferred (after student flow)

Only after functionality is stable should the CodeBlock receive visual refinement.

Focus on:

- Typography
- Spacing
- Borders
- Background
- Language selector
- Copy button
- Focus state
- Hover state
- Empty state
- Scroll behavior
- Responsive behavior

Styling should follow the existing VipiClass visual language.

Do not use styling work to hide architectural problems.

---

# 28. Definition of Done

The CodeBlock MVP is considered complete when:

- A teacher can insert a CodeBlock.
- A teacher can type or paste code.
- A teacher can select a language.
- The source code is stored as plain text.
- Syntax highlighting works.
- The CodeBlock integrates with existing block selection/actions.
- Undo/redo works correctly.
- Autosave works correctly.
- Persistence works correctly.
- A CodeBlock survives slide switching and reload.
- Students can read the code.
- Students can copy the source code.
- Large code samples remain usable.
- No IDE/execution functionality has been unnecessarily introduced.
- The implementation follows the existing editor architecture.
- No unnecessary abstractions or parallel state systems were introduced.

---

# 29. Guidance for the AI Teammate

Before implementation:

1. Read this document.
2. Inspect the existing Slide Editor architecture.
3. Identify the existing patterns used by comparable blocks.
4. Identify how blocks are created, stored, rendered, selected, moved, and persisted.
5. Identify how history and autosave currently work.
6. Determine the smallest integration point for CodeBlock.
7. Do not redesign unrelated parts of the editor.

When implementation decisions are ambiguous:

- Prefer the simplest solution compatible with the existing architecture.
- Do not introduce abstractions without a concrete need.
- Do not add future features just because they may be useful later.
- Preserve existing editor behavior.
- Keep CodeBlock responsibilities separate from global editor responsibilities.

Before changing existing architecture, explain:

1. Why the change is necessary.
2. What alternative was considered.
3. What part of the existing architecture is affected.
4. What new complexity the change introduces.

The implementation should optimize for:

> **Correctness → Maintainability → Simplicity → UX polish**

rather than feature count.

---

# 30. Final Product Definition

The CodeBlock should ultimately feel like a natural part of VipiClass:

> A teacher inserts a CodeBlock when code helps explain a concept. They enter or paste the source, choose its language, and continue building the lesson. VipiClass presents the code clearly to students, who can read and copy it when needed.

The CodeBlock should solve that problem extremely well before attempting to solve anything larger.

````

### And I would use that roadmap deliberately

There is a subtle but important thing about the sequence above: **we aren't asking the AI teammate to build the “perfect code editor” first.**

We're walking it through:

```text
Understand
   ↓
Data model
   ↓
Block integration
   ↓
Basic editing
   ↓
Language
   ↓
Highlighting
   ↓
History / persistence
   ↓
Copy
   ↓
Student rendering
   ↓
Edge cases
   ↓
Polish
````
