Technical Trade-offs & Engineering Considerations: Slide Editor

This document records important technical trade-offs made during the development of the Slide Editor.

The objective is not to identify "wrong" decisions, but to preserve the reasoning behind choices where multiple valid approaches existed.

Every trade-off represents a balance between:

development speed
maintainability
user experience
scalability
complexity

1. Embedded Content Model vs Normalized Database Structure
   Context

The editor manages hierarchical content:

Lesson
└── Slides
└── Blocks
└── Cells

A traditional database design could normalize these entities into separate collections.

Current Choice

Use embedded documents through MongoDB schemas.

Example:

Lesson

└── slides[]

       └── blocks[]

             └── content

Why This Choice Was Made

The editor naturally operates on complete documents.

When a teacher opens a lesson, the editor needs:

all slides
all blocks
all metadata

The embedded structure matches the user's mental model.

Benefits

✅ Simple loading

✅ Simple saving

✅ Easy undo/redo snapshots

✅ Natural React state structure

Costs

⚠️ Large lessons may eventually require optimization.

⚠️ Updating individual elements independently becomes more complex.

Future Consideration

If VipiClass introduces:

real-time collaboration
very large documents
partial loading

a hybrid approach may become necessary.

2. Full State Snapshots vs Operation-Based History
   Context

Undo/redo requires restoring previous editor states.

Two approaches exist:

Store complete snapshots.
Store individual operations.
Current Choice

Use complete snapshots.

past[]
present
future[]
Why This Choice Was Made

The editor contains many independent operations:

adding blocks
deleting blocks
moving rows
resizing tables
changing formatting

Creating inverse operations for every action would introduce significant complexity.

Benefits

✅ Simple implementation

✅ Reliable restoration

✅ Easy debugging

Costs

⚠️ Memory usage grows with document size.

⚠️ Large documents may eventually require optimization.

Future Consideration

Possible improvements:

Immer patches
operation logs
granular history per subsystem 3. Custom Table System vs Tiptap Table Extension
Context

Tiptap already provides table functionality.

However, the editor requires more than standard document tables.

Requirements include:

row manipulation
column manipulation
resizing
contextual menus
keyboard navigation
future merge/split operations
Current Choice

Build a custom table block.

Why This Choice Was Made

The table is treated as an independent editor block rather than a simple rich-text element.

This gives complete control over:

rendering
interactions
future educational features
Benefits

✅ Custom UX

✅ Easier integration with slide architecture

✅ Independent evolution

Costs

⚠️ More code to maintain.

⚠️ Complex operations like merging cells require custom logic.

4. Individual Tiptap Editor per Table Cell vs Single Table Editor
   Context

Each table cell contains rich text.

Two possible approaches:

Option A

One editor controlling the entire table.

Option B

One editor per cell.

Current Choice

Each cell owns a Tiptap instance.

Why This Choice Was Made

Cells behave like independent editable areas.

This enables:

direct focus management
keyboard navigation
independent formatting
Benefits

✅ Simple mental model

✅ Reuses existing text editor architecture

Costs

⚠️ Large tables create many editor instances.

⚠️ Multi-cell formatting becomes more complex.

5. React Context vs External State Management
   Context

The editor currently uses React Context.

Alternative

A state library such as:

Zustand
Redux
Jotai
Why Context Was Chosen

The editor initially required a small number of shared states.

Context provided:

native React integration
minimal dependencies
straightforward debugging
Benefits

✅ Simple

✅ No additional library

✅ Easy onboarding

Costs

⚠️ Large contexts may cause unnecessary renders.

⚠️ Future optimization may require splitting contexts or adopting selectors.

6. Implementation First vs Abstraction First
   Context

When developing complex features, there is a temptation to design the perfect architecture before writing code.

Current Choice

Implement working functionality first, then refactor when patterns become clear.

Why This Choice Was Made

The editor contains many unknown interactions.

Examples:

table resizing
drag-and-drop conflicts
keyboard behavior
editor synchronization

Real implementation reveals better abstractions than speculation.

Benefits

✅ Faster discovery

✅ Less premature complexity

✅ Architecture based on real problems

Costs

⚠️ Temporary duplication may exist.

⚠️ Refactoring discipline is required.

7. Client-Side Autosave vs Server Synchronization
   Context

The editor needs to prevent data loss.

Current Choice

Client-side debounced autosave.

Flow:

Editor State

↓

Debounce

↓

API

↓

MongoDB
Benefits

✅ Simple user experience

✅ Minimal backend complexity

✅ Works well for individual editing

Costs

⚠️ Requires network availability.

⚠️ Multiple simultaneous editors would require conflict resolution.

8. Native HTML Table vs Custom Grid System
   Context

Tables can be implemented using:

HTML tables
CSS Grid
Canvas-based systems
Current Choice

Native HTML table elements.

Why

The editor requires semantic table behavior and compatibility with normal browser interactions.

Benefits

✅ Browser-supported layout

✅ Accessibility advantages

✅ Easier initial implementation

Costs

⚠️ Advanced features like merging cells require careful calculations.

⚠️ Drag handles require special handling because tables have strict DOM rules.

9. Native Select vs Custom Select Component
   Context

Callout, Quiz, and Exercise controls used native `<select>` elements.

On desktop they render fine.

On mobile, native option lists are rendered by the operating system: full-width, dark, and impossible to theme.

Current Choice

Build a shared custom dropdown: `components/blocks/shared/Select.jsx`.

It reuses the editor's visual language (ActionMenu look: white card, shadow, accent highlight, radius) and closes on outside press or Escape.

Why This Choice Was Made

The editor already has a designed menu system (ActionMenu).

Using a native select inside a designed product creates inconsistent visuals and unreadable option lists on mobile.

Benefits

✅ Consistent styling across desktop and mobile

✅ Matches the existing ActionMenu look

✅ Full control over open/close, selection highlight, and scroll

Costs

⚠️ Loses native accessibility/behavior (keyboard listbox navigation, screen-reader semantics)

⚠️ Requires manual outside-click and Escape handling

⚠️ Future accessibility pass may need ARIA role additions

Future Consideration

If accessibility becomes a hard requirement, the component can add role="listbox"/option semantics without changing the API.

10. Long-Press Disambiguation: Block Multi-Select vs Native Text Selection
   Context

On touch devices, a single long-press gesture was needed for two conflicting jobs:

selecting a block for multi-selection (mirroring the slide list), and selecting text inside rich-text areas.

Early attempts to enable long-press for multi-selection broke native text selection inside table cells.

Current Choice

Centralize the gesture in `useLongPress()` with target-based routing:

blocks opt in via `allowInsideEditable` (long-press over a block toggles block selection);

table cells are always excluded via `.table-cell-inner` (long-press inside a cell keeps its native text selection).

Why This Choice Was Made

The slide list already had a working long-press multi-select model.

Mirroring that model for blocks gave mobile users the same multi-select capability, while scoping kept the table cell text-selection fix intact.

Benefits

✅ One gesture, consistent with the slide list

✅ Table cell long-press text selection preserved

✅ Single source of truth for touch-gesture behavior

Costs

⚠️ Long-press over a text block now selects the block instead of its text

⚠️ Text editing inside blocks relies on tap-to-focus instead of long-press

⚠️ Target-based routing adds coupling to DOM classes (`.table-cell-inner`)

Future Consideration

If text selection inside text blocks must be restored on touch, the routing can be refined (e.g., per-block opt-out) without redesigning the hook.

Final Principle

The Slide Editor intentionally favors:

A simple, understandable architecture that can evolve, rather than a theoretically perfect architecture that slows development.

The goal is not to eliminate every future limitation.

The goal is to create a strong foundation where future improvements can be introduced without rewriting the entire system.
