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

Final Principle

The Slide Editor intentionally favors:

A simple, understandable architecture that can evolve, rather than a theoretically perfect architecture that slows development.

The goal is not to eliminate every future limitation.

The goal is to create a strong foundation where future improvements can be introduced without rewriting the entire system.
