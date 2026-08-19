# Student Previewing & Presentation Rendering Plan

**Project:** VipiClass  
**Area:** Slide Editor / Student Previewing / Presentation Rendering  
**Status:** Implementation — plan Phases 1–6 shipped 2026-08 (teacher preview included); Phases 7–8 (VipiClass integration, PDF) pending.
**Document purpose:** Define the rendering architecture and implementation boundaries before development begins.

---

# 1. Objective

The objective of this phase is to build the **presentation/rendering layer** for content created with the VipiClass Slide Editor.

The Slide Editor is an **authoring environment** used by teachers to create educational content.

The rendering layer is a **consumption environment** used to present that content in a clean, structured, student-facing format.

The fundamental architectural separation is:

> **The Slide Editor creates and edits content. The Renderer consumes and presents content. The Renderer must not become another editor.**

The rendering system must consume the existing structured slide/block data and produce a presentation appropriate for the target context.

The initial target is the **student-facing presentation/preview experience**.

PDF/export rendering is considered a future output of the same content model and must be kept architecturally possible without making it part of the initial implementation.

---

# 2. Current Project State

The teacher-side authoring implementation currently includes:

- `TextBlock`
- `ImageBlock`
- `YoutubeBlock`
- `CalloutBlock`
- `DividerBlock`
- `TableBlock`
- `ExerciseBlock`
- `QuizBlock`
- `MathBlock`
- `CodeBlock`

`FlashCardBlock` is intentionally postponed and is **not part of the initial rendering scope** unless explicitly requested later.

The authoring system is considered sufficiently stable for this phase.

The existing block data model is considered:

- stable enough to consume;
- not necessarily perfect;
- not to be redesigned during the initial rendering implementation.

The rendering phase must therefore work **with the existing content model first**, rather than attempting to redesign the authoring system.

---

# 3. Primary Architectural Principle

The system must maintain a clear separation between:

```text
AUTHORING
    |
    v
Structured Slide Data
    |
    +--------------------+
    |                    |
    v                    v
Student Presentation   Future PDF Export
```

The Slide Editor is responsible for authoring.

The renderer is responsible for presentation.

The persistence/application layer is responsible for storing and retrieving the structured content.

The student application is responsible for student interaction, navigation, progress, submission, etc.

These responsibilities must not be mixed unnecessarily.

---

# 4. What "Rendering" Means in This Phase

Rendering means:

> Taking an existing structured slide and its blocks and transforming them into a visually coherent presentation suitable for viewing by a student.

Rendering includes:

- interpreting block types;
- selecting the appropriate visual representation;
- arranging blocks;
- displaying mathematical content;
- displaying tables;
- displaying exercises;
- displaying quizzes;
- displaying code;
- displaying ordinary textual content where applicable;
- handling empty or incomplete content safely;
- respecting the slide's structural information;
- adapting the presentation to the available viewport.

Rendering does **not** mean:

- editing the content;
- modifying the stored slide data;
- changing block definitions simply for visual convenience;
- implementing teacher authoring controls;
- implementing student grading logic;
- implementing course management;
- implementing authentication;
- implementing persistence;
- implementing PDF generation in the first phase.

---

# 5. Rendering Contexts

The architecture should anticipate three possible presentation contexts.

## 5.1 Teacher Preview

The teacher may need to preview how the slide will appear when presented.

The teacher preview should:

- use the same core rendering principles as the student presentation;
- provide confidence about the final appearance;
- not expose editing controls as part of the rendered content;
- not require the teacher to enter the actual student application.

The teacher preview may eventually have minor differences from the student presentation where necessary.

However, it should not become a second implementation of every block.

---

## 5.2 Student Presentation

This is the primary target of this phase.

The student presentation should provide:

- clean visual hierarchy;
- readable educational content;
- appropriate spacing;
- block-specific presentation;
- responsive behavior;
- presentation/navigation controls where required;
- interactive behavior for blocks that require student interaction.

The student should **not see the authoring interface**.

The student should not see:

- editing handles;
- teacher-only controls;
- raw LaTeX source;
- block configuration controls;
- authoring toolbars;
- internal placeholder/pill UI;
- editor-specific debugging information.

---

## 5.3 PDF / Export

PDF generation is a future rendering target.

It must be possible to eventually have:

```text
Structured Slide Data
        |
        +----> Student Renderer
        |
        +----> Teacher Preview
        |
        +----> PDF Renderer
```

However:

> PDF generation is NOT part of the initial Student Preview implementation.

Do not introduce PDF-specific complexity into the student renderer unless required by an explicitly defined shared abstraction.

---

# 6. Block Rendering Architecture

Each block type should have a clear rendering responsibility.

Conceptually:

```text
SlideRenderer
    |
    +-- Text renderer
    +-- Table renderer
    +-- Exercise renderer
    +-- Quiz renderer
    +-- Math renderer
    +-- Code renderer
    +-- Etc.
```

The exact component/file names are implementation details and should be determined after inspecting the existing project structure.

The important requirement is the separation of responsibilities.

The main slide renderer should not become a massive component containing all block-specific rendering logic.

---

# 7. Block Rendering Contracts

Each block renderer should consume the block's existing data structure and transform it into its student-facing presentation.

The fundamental responsibility is:

> "Given this block's data, how should it appear and behave in the presentation?"

It should not be responsible for deciding:

> "How should this block's data be stored?"

The renderer must respect the existing block data model. Do not redesign block schemas simply to make rendering more convenient.

---

## 7.1 TextBlock

`TextBlock` represents ordinary textual educational content.

The student renderer should:

- display the text with appropriate typography;
- preserve meaningful formatting supported by the existing block model;
- maintain paragraph/line structure where applicable;
- support readable text width and spacing;
- adapt to different viewport sizes;
- ensure long text remains accessible and readable.

The renderer must not:

- expose authoring controls;
- modify the stored text;
- introduce a new text-formatting model;
- interpret arbitrary content as executable code or unsafe HTML.

If the existing `TextBlock` supports rich text or inline formatting, the renderer should use the existing representation rather than introducing a second formatting system.

---

## 7.2 ImageBlock

`ImageBlock` represents visual educational content.

The student renderer should:

- display the image using the existing image data;
- preserve the intended aspect ratio;
- provide appropriate sizing within the slide;
- avoid unnecessary distortion;
- support responsive behavior;
- handle missing or unavailable images gracefully;
- preserve relevant metadata such as captions or alternative text where supported by the existing model.

Images must remain contained within the presentation layout and must not unexpectedly overflow the slide.

The renderer must not:

- modify image metadata;
- replace the image source silently;
- introduce an image-upload workflow;
- expose teacher editing controls.

Accessibility information such as alternative text should be used when it exists in the block data.

---

## 7.3 YouTubeBlock

`YouTubeBlock` represents embedded video content.

The student renderer should:

- display the configured YouTube video;
- preserve an appropriate video aspect ratio;
- provide responsive sizing;
- allow normal student playback through the embedded player;
- handle missing or invalid video identifiers safely;
- avoid breaking the entire slide when the video cannot be displayed.

The renderer should use an appropriate embed mechanism rather than treating the YouTube URL as ordinary text.

The renderer must not:

- implement video uploading;
- modify the stored video URL;
- expose teacher configuration controls;
- attempt to download or locally process the video;
- introduce unrelated video-platform functionality.

Any privacy/security restrictions associated with embedding external content should be handled through the appropriate application/embed configuration rather than inside the block's content model.

---

## 7.4 CalloutBlock

`CalloutBlock` represents highlighted educational information.

The block may have variants such as:

- `Definition`
- `Example`
- `Warning`
- `Tip`

The renderer should provide a consistent visual structure for all CalloutBlock variants while allowing each variant to communicate its semantic purpose.

Conceptually:

```text
CalloutBlock
    |
    +-- Definition
    +-- Example
    +-- Warning
    +-- Tip
```

The student renderer should:

- display the callout content clearly;
- visually distinguish the variant (it can take the colors that has been used for that distinction on the authoring phase);
- preserve the semantic meaning of the variant;
- use consistent spacing and typography;
- remain responsive;
- support the content types allowed by the existing CalloutBlock model.

The renderer should prefer the block's semantic variant over arbitrary visual styling.

For example, a `Warning` should not merely look like a generic colored box; its presentation should communicate that it represents a warning.

The renderer must not:

- invent new CalloutBlock variants;
- change the meaning of an existing variant;
- encode variant-specific business logic;
- modify the stored content;
- expose authoring controls.

If the existing CalloutBlock supports mathematical or other structured content, the renderer should delegate those portions to the appropriate existing rendering mechanism rather than duplicating it.

---

## 7.5 DividerBlock

`DividerBlock` represents a visual separation between pieces of content.

The student renderer should:

- render a clean visual separator;
- respect the slide's spacing/layout system;
- remain visually unobtrusive;
- work consistently across viewport sizes.

The divider should be treated as a layout/content element rather than an interactive component.

The renderer must not:

- introduce unnecessary interaction;
- expose editing controls;
- modify surrounding blocks;
- use the divider as a mechanism for managing slide structure.

If the existing DividerBlock supports variants or styling options, those options should be respected only to the extent defined by the existing block model.

---

## 7.6 TableBlock

The student renderer should display the table as educational content.

Expected responsibilities:

- render table headers if present;
- render rows and cells;
- preserve meaningful structure;
- handle reasonable variations in cell content;
- remain readable on smaller screens;
- avoid exposing editing controls.

The renderer must not:

- provide teacher table editing;
- alter table data;
- introduce authoring behavior;
- redesign the TableBlock data model unless an actual missing rendering requirement is discovered.

---

## 7.7 ExerciseBlock

The student renderer should present the exercise as a student-facing activity.

The initial rendering layer should distinguish between:

```text
Exercise content
Student interaction
Evaluation / grading
```

Rendering is responsible primarily for the first two.

Grading/business logic should not be embedded into purely presentational components unless the existing architecture explicitly requires it.

The renderer should not invent grading rules.

If the existing ExerciseBlock data model does not contain enough information for a desired behavior, stop and identify the missing requirement rather than silently changing the model.

---

## 7.8 QuizBlock

The student renderer should present quiz questions and their available choices in a student-friendly manner.

It should support the interaction required by the existing block definition.

The renderer must not invent:

- scoring rules;
- attempt limits;
- answer-submission APIs;
- persistence rules;
- progress tracking;

unless those responsibilities are explicitly part of the existing student architecture.

Rendering and evaluation should remain conceptually separate.

---

## 7.9 MathBlock

The student renderer must display mathematical content using the existing mathematical rendering infrastructure wherever possible.

The student must see:

- rendered mathematics;
- readable mathematical notation;
- no raw editing placeholders;
- no authoring pills;
- no source textarea;
- no teacher toolbar.

The existing `MathBlock` authoring implementation is considered an upstream dependency.

Do not refactor `MathBlock` merely to make the renderer easier to implement.

If the renderer exposes a genuine problem in the MathBlock data contract, document the problem first.

Do not immediately redesign MathBlock.

---

## 7.10 CodeBlock

The student renderer should display code as educational content.

Expected responsibilities:

- readable code presentation;
- appropriate typography;
- preservation of formatting;
- appropriate scrolling/wrapping behavior;
- language information where available.

The renderer should not automatically execute code.

Code execution is outside the initial rendering scope unless explicitly requested and separately designed.

---

## 7.11 FlashCardBlock

`FlashCardBlock` is intentionally postponed.

Do not implement or partially implement FlashCard rendering during this phase.

The architecture should remain extensible enough to add it later.

---

## 7.12 General Rule for All Block Renderers

Every block renderer should follow the same fundamental contract:

```text
Block Data
    |
    v
Block Renderer
    |
    v
Student-Facing UI
```

The renderer should be as close as reasonably possible to a pure transformation of block data into presentation.

Block-specific interaction may introduce local state where necessary, but application-level concerns should remain outside the renderer whenever possible.

In particular, individual block renderers should not independently manage:

- authentication;
- course management;
- lesson management;
- persistence;
- global navigation;
- grading policy;
- global student progress.

Those concerns belong to higher architectural layers.

The renderer should also fail gracefully when a block is incomplete or malformed. One problematic block should not unnecessarily prevent the rest of the slide from rendering.

# 8. Slide-Level Rendering

The slide renderer is responsible for composing blocks into a coherent slide.

Conceptually:

```text
Slide
 |
 +-- Slide metadata
 |
 +-- Block 1
 |
 +-- Block 2
 |
 +-- Block 3
 |
 +-- ...
```

The renderer should preserve the intended ordering of blocks.

The renderer should not reinterpret the educational structure unless the existing data model explicitly defines such behavior.

---

# 9. Presentation Layout

The rendering layer should establish a consistent visual system for:

- slide dimensions;
- content width;
- vertical spacing;
- block spacing;
- typography;
- headings;
- emphasis;
- responsive behavior;
- overflow;
- navigation controls.

The layout should prioritize:

1. readability;
2. educational clarity;
3. consistency;
4. responsiveness;
5. visual simplicity.

Avoid unnecessary visual complexity.

The student presentation is not intended to reproduce the Slide Editor's UI.

---

# 10. Responsive Behavior

The student presentation must work across reasonable viewport sizes.

The implementation should consider:

- desktop;
- laptop;
- tablet;
- mobile.

Block content must not become unusable because of fixed dimensions.

Particular attention should be given to:

- mathematical expressions;
- tables;
- code;
- long text;
- quizzes;
- exercises.

Do not introduce arbitrary fixed heights that cause educational content to become inaccessible.

If a slide contains more content than comfortably fits on screen, the architecture should have a defined strategy rather than silently clipping content.

---

# 11. Navigation

Student presentation navigation is conceptually separate from block rendering.

The renderer for an individual block should not control global slide navigation.

For example:

```text
Presentation
    |
    +-- Slide navigation
    |
    +-- Current Slide
           |
           +-- Block renderer
           +-- Block renderer
           +-- Block renderer
```

A block may request an interaction or state change where necessary, but it should not directly own the entire presentation navigation system.

---

# 12. Student Interaction Boundary

Some blocks are naturally interactive.

Examples:

- QuizBlock
- ExerciseBlock

The architecture should distinguish:

```text
Presentation
    ↓
Block interaction
    ↓
Student state
    ↓
Persistence / submission
```

Do not put application-level persistence logic directly into visual rendering components unless there is a clear existing architectural reason.

Rendering components should remain as close as possible to:

```text
input data → UI
```

while interaction/state management can live at the appropriate application layer.

---

# 13. Teacher Preview vs Student Presentation

The teacher preview and student presentation should share rendering primitives wherever practical.

However, they are not required to be identical.

The important rule is:

> Teacher Preview should demonstrate the intended student-facing appearance, while Student Presentation owns the actual student experience.

Teacher-only functionality must remain outside the student renderer.

For example:

```text
Teacher
    |
    +-- Edit
    +-- Preview
         |
         v
     Presentation Renderer

Student
    |
    v
Presentation Renderer
```

---

# 14. Data Flow

The intended long-term flow is:

```text
Teacher
   |
   v
Slide Editor
   |
   v
Structured Slide Data
   |
   v
Persistence / VipiClass
   |
   +-------------------------+
   |                         |
   v                         v
Teacher Preview          Student App
                              |
                              v
                     Student Presentation
```

The renderer must consume the structured data rather than the internal state of the editor.

This is critical.

The renderer must not depend on:

- editor refs;
- editor caret state;
- editor selection state;
- authoring placeholders;
- editing mode;
- editor-specific UI state.

---

# 15. Persistence Boundary

The rendering layer should assume that the slide data may have been loaded from persistence.

Therefore, rendering must not depend on:

- the editor having previously been opened;
- React state created by the editor;
- temporary editor state;
- browser-local state that is not part of the saved content.

A slide loaded from the backend should be renderable directly from its persisted representation.

---

# 16. Empty, Invalid, or Incomplete Content

The renderer must fail gracefully.

Possible situations include:

- missing optional block fields;
- empty text;
- incomplete content;
- unknown block type;
- malformed content;
- older content created by a previous version.

The renderer should avoid crashing the entire presentation because of one problematic block.

A reasonable strategy is:

```text
Unknown / invalid block
        ↓
Safe fallback UI
        ↓
Presentation continues where possible
```

The exact fallback design should be decided during implementation.

Do not silently mutate invalid content in order to make it render.

---

# 17. Unknown Block Types

The architecture must support future blocks.

If a block type is unknown to the current renderer:

- do not crash the entire slide;
- do not delete the block;
- do not mutate its data;
- display a safe fallback where appropriate;
- make the issue observable during development.

This allows future blocks such as `FlashCardBlock` to be added without destabilizing existing rendering.

---

# 18. Architectural Boundaries

The initial rendering implementation must respect these boundaries.

### Renderer may:

- read slide data;
- read block data;
- transform data into UI;
- manage presentation-local visual state;
- manage block interaction state where appropriate;
- request application-level actions through defined interfaces.

### Renderer must not:

- redesign the editor;
- modify authoring behavior;
- rewrite existing block data structures without necessity;
- modify persisted content silently;
- implement teacher authoring controls;
- implement authentication;
- implement course management;
- implement grading policy;
- implement progress persistence unless explicitly connected through a defined application interface;
- implement PDF generation in the first phase;
- execute arbitrary code from CodeBlock.

---

# 19. Do Not Refactor Upstream Systems Without Evidence

The existing Slide Editor and block implementations are considered stable enough for this phase.

Therefore:

> Do not refactor existing authoring code merely because the renderer would be easier to implement after refactoring it.

If a rendering requirement cannot be satisfied because the existing data model is genuinely insufficient:

1. identify the exact missing information;
2. explain why it is required;
3. propose the smallest possible data-model change;
4. wait for confirmation before changing the upstream system if the change is architectural.

This prevents the rendering phase from becoming another uncontrolled refactoring phase.

---

# 20. Reuse Existing Infrastructure

Before creating new rendering mechanisms, inspect the existing project.

Prefer existing:

- design tokens;
- typography;
- layout utilities;
- Math rendering;
- block data structures;
- shared UI components;
- existing presentation/navigation components;
- existing application state mechanisms.

Do not duplicate existing infrastructure.

However, reuse must not create inappropriate coupling.

If an existing component is specifically an authoring component, do not force it into the student renderer simply because it already exists.

---

# 21. Component Responsibility

Components should have one understandable responsibility.

Avoid creating a single component such as:

```text
StudentPreview.jsx
```

containing all logic for:

- every block type;
- navigation;
- quiz evaluation;
- exercise evaluation;
- persistence;
- responsive layout;
- PDF generation;
- teacher preview;
- student state.

Instead, establish clear boundaries.

A conceptual structure might look like:

```text
Presentation
│
├── PresentationShell
│
├── SlideRenderer
│
├── BlockRenderer
│   ├── TableRenderer
│   ├── ExerciseRenderer
│   ├── QuizRenderer
│   ├── MathRenderer
│   └── CodeRenderer
│
└── PresentationNavigation
```

These names are illustrative, not mandatory.

Inspect the existing project before choosing the final file/component structure.

---

# 22. State Management

Separate the following concepts:

### Content state

What the slide contains.

### Presentation state

Where the student currently is.

Examples:

- current slide;
- current block interaction;
- revealed answer;
- selected quiz option.

### Application state

Information belonging to the larger VipiClass application.

Examples:

- current user;
- course;
- lesson;
- permissions;
- progress;
- submissions.

These should not all be stored in the same component.

---

# 23. Security and Trust Boundary

The student renderer must treat persisted content as data.

It must not assume that all stored content is safe merely because it was originally created through the teacher editor.

In particular:

- do not execute arbitrary JavaScript from content;
- do not execute CodeBlock contents;
- avoid unsafe HTML injection;
- sanitize/escape content where appropriate;
- use established rendering libraries safely.

The renderer should render content, not execute content.

---

# 24. Accessibility

The student presentation should be accessible by design.

At minimum, consider:

- semantic HTML;
- keyboard navigation;
- visible focus states;
- readable contrast;
- meaningful labels;
- appropriate button semantics;
- accessible quiz/exercise interactions;
- mathematical content accessibility where supported by the rendering system.

Accessibility should not be treated as a final cosmetic pass.

---

# 25. Performance

The initial implementation should prioritize correctness and architectural clarity over premature optimization.

However, avoid obvious performance problems such as:

- unnecessary complete slide rerenders;
- repeated expensive parsing on every render;
- rendering every slide simultaneously when only one is visible;
- unnecessary duplication of large block data.

Optimization should be introduced only where an actual bottleneck is identified.

---

# 26. Testing Strategy

Each rendering layer should be testable independently where practical.

At minimum, verify:

### Slide rendering

- correct block order;
- correct block type dispatch;
- empty slides;
- multiple blocks.

### Individual blocks

- normal content;
- empty content;
- long content;
- malformed/incomplete content where relevant.

### Student interactions

- quiz interaction;
- exercise interaction;
- presentation navigation.

### Responsive behavior

- narrow viewport;
- normal desktop viewport;
- content overflow.

### Regression

Existing authoring functionality must continue to work.

The implementation must not modify teacher authoring behavior as a side effect.

---

# 27. Implementation Phases

The system should be implemented in controlled phases.

## Phase 1 — Inspect and Map

Before writing code:

- inspect the existing Slide Editor;
- inspect existing block data structures;
- inspect shared UI/design infrastructure;
- identify existing rendering components;
- identify where persisted slide data currently lives;
- identify existing navigation mechanisms.

Do not refactor yet.

Produce a concise implementation map.

---

## Phase 2 — Rendering Foundation

Implement the minimal rendering foundation:

```text
Presentation
    ↓
SlideRenderer
    ↓
BlockRenderer
```

Establish:

- slide layout;
- block dispatch;
- unknown-block fallback;
- basic responsive behavior.

Do not implement unnecessary application integration yet.

---

## Phase 3 — Block Renderers

Implement rendering for all blocks:

1. TextBlock
2. CalloutBlock,
3. YoutubeBlock
4. ImageBlock
5. TableBlock
6. ExerciseBlock
7. QuizBlock
8. MathBlock
9. CodeBlock

FlashCardBlock remains postponed.

Each renderer should remain independently understandable.

---

## Phase 4 — Student Presentation Shell

Implement:

- presentation container;
- slide navigation;
- current-slide state;
- appropriate presentation controls;
- responsive presentation behavior.

Keep this separate from individual block renderers.

---

## Phase 5 — Interaction Layer

Add the student interaction behavior required by:

- QuizBlock;
- ExerciseBlock.

Do not invent grading or persistence behavior that has not yet been defined.

Where integration is not yet available, use clearly defined interfaces/mocks rather than coupling the renderer directly to future backend assumptions.

---

## Phase 6 — Teacher Preview ✅

Connect the same presentation rendering primitives to a teacher preview mode.

The preview should demonstrate the student-facing appearance without exposing authoring controls inside the presentation itself.

**Status 2026-08 — shipped.** `TeacherPreview` (`src/app/presentation/components/TeacherPreview.jsx`) renders the editor's live slides in a full-screen overlay, reusing `SlideRenderer`, `BlockRouter`, `PresentationNavigation`, and `presentation.css` so the teacher sees exactly what students see. It adds a "Preview" badge, lesson title, slide counter/nav, Arrow/Escape keyboard handling, and an Exit button, while the editor's own keyboard shortcuts are suppressed while the overlay is open. Teacher-only chrome lives in the preview wrapper — outside the student renderer tree. Opened from the "Preview" button in the `SlideEditor` header.

---

## Phase 7 — VipiClass Integration

Only after the rendering architecture is stable:

- connect persisted slide content;
- connect lesson/course context;
- connect student identity;
- connect permissions;
- connect progress;
- connect submissions;
- connect other application-level services.

Integration should consume the renderer rather than modify its internal rendering responsibilities.

---

## Phase 8 — PDF

PDF generation is a separate future phase.

It should consume the same structured slide data.

Do not make the student renderer responsible for PDF generation.

---

# 28. Definition of Done

> **Status 2026-08 — plan Phases 1–6 shipped.** The student-facing presentation (rendering
> foundation, all block renderers, presentation shell/navigation, the exercise/quiz interaction
> layer, and the teacher preview mode) shipped at `/presentation` (student) and via the editor's
> "Preview" button (teacher), rendering data that mirrors the persisted slide/block model. The
> checklist below reflects that shipped scope. Plan Phase 7 (VipiClass integration) and Phase 8
> (PDF) remain.

The Student Presentation phase is considered complete when:

- [x] A persisted slide can be rendered without the Slide Editor.
- [x] Blocks render according to their block type.
- [x] Block order is preserved.
- [x] Unknown block types do not crash the entire presentation.
- [x] Empty/incomplete content fails gracefully.
- [x] Student presentation contains no teacher authoring controls.
- [x] Student presentation does not depend on editor state.
- [x] Student presentation does not depend on editor refs/caret/placeholders.
- [x] Responsive behavior is acceptable.
- [x] Keyboard/accessibility behavior is considered.
- [x] Existing teacher authoring behavior remains intact.
- [x] Rendering does not silently mutate persisted content.
- [x] Rendering architecture leaves room for future PDF output.

---

# 29. AI Teammate Guardrails

The following rules are mandatory during implementation.

## Rule 1 — Do not expand scope silently

If a requested change appears to require work outside rendering, stop and identify it.

Do not silently modify unrelated systems.

---

## Rule 2 — Do not redesign stable block data

The current data model is considered stable enough for rendering.

Do not redesign it unless a concrete rendering requirement demonstrates that information is missing.

---

## Rule 3 — Do not modify the Slide Editor unnecessarily

The editor is an upstream authoring system.

Do not refactor it merely to simplify renderer implementation.

---

## Rule 4 — Do not merge authoring and rendering

Do not reuse authoring components merely because they already render something.

Authoring UI and student presentation have different responsibilities.

---

## Rule 5 — Do not invent business logic

Do not invent:

- grading rules;
- scoring rules;
- attempt limits;
- progress rules;
- submission rules;
- permissions;
- persistence behavior.

If these are not defined, identify the missing requirement.

---

## Rule 6 — Do not implement future features prematurely

Do not implement:

- FlashCardBlock;
- PDF generation;
- arbitrary code execution;
- advanced analytics;
- course management;

unless explicitly requested.

---

## Rule 7 — Prefer small, verifiable changes

Each implementation phase should produce a working state.

Avoid large simultaneous refactors.

After each meaningful phase:

1. verify the implementation;
2. identify regressions;
3. confirm architecture;
4. proceed to the next phase.

---

## Rule 8 — Preserve existing behavior

Existing teacher-side functionality is considered valuable working behavior.

If a rendering change causes an authoring regression, the regression must be fixed rather than accepted as an unavoidable side effect.

---

## Rule 9 — Explain architectural changes before making them

If implementation reveals a structural problem, explain:

- what is wrong;
- why it matters;
- what alternatives exist;
- which change is recommended.

Do not silently introduce architectural decisions.

---

## Rule 10 — Do not over-engineer

The goal is a clear, extensible rendering architecture.

Do not introduce abstractions simply because they might be useful someday.

Prefer the smallest architecture that supports:

- current blocks;
- student presentation;
- teacher preview;
- future PDF rendering;
- future block types.

---

# 30. Final Architectural Model

The intended architecture is:

```text
                         TEACHER
                            |
                            v
                     +--------------+
                     | Slide Editor |
                     +--------------+
                            |
                            v
                  Structured Slide Data
                            |
                            v
                    Persistence Layer
                            |
             +--------------+--------------+
             |                             |
             v                             v
      Teacher Preview                Student Application
             |                             |
             +--------------+              |
                            |              |
                            v              v
                      Presentation Renderer
                            |
                            v
                    +-------------------+
                    |    SlideRenderer  |
                    +-------------------+
                            |
                            v
                     +-------------+
                     | BlockRouter |
                     +-------------+
                       /   |   |   \
                      /    |   |    \
                     v     v   v     v
                  Table  Math Quiz Exercise ...
                              |
                              v
                         Student UI
```

Future:

```text
                  Structured Slide Data
                         |
              +----------+----------+
              |          |          |
              v          v          v
           Teacher    Student      PDF
           Preview   Presentation  Renderer
```

The structured content model is therefore the **central contract**.

The editor and the renderers are consumers/producers around that contract, not tightly coupled versions of the same interface.

---

# 31. Guiding Principle

The most important principle for this phase is:

> **Build the presentation layer around the content model, not around the editor.**

The teacher editor is where content is created.

The student presentation is where content is consumed.

The renderer should be able to operate even if the Slide Editor is completely absent from the runtime.

That separation will allow VipiClass to evolve independently from the authoring tool and will make future outputs — including PDF, other presentation modes, and future block types — significantly easier to add.
