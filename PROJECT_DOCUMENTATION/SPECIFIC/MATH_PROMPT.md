We are going to build the MathBlock for the VipiClass Slide Editor as planned at PROJECT_DOCUMENTATION/MATH_BLOCK_PLAN.md.

Before diving deeper, I want you to read that file and make sure you've understood the whole idea behind the implementation.
After reading, analyze the current Slide Editor architecture and design the complete Math Block architecture.

Your goal is not to implement the block yet.

Your goal is to determine the best long-term architecture for mathematical editing inside VipiClass.

Study the existing editor (EditorContext, useRichTextEditor, BlockRenderer, history, autosave, toolbar, slash menu, copy/paste, drag-and-drop, persistence, block factories, and documentation).

Then answer questions such as:

Which mathematical editing engine should we use and why?
How should mathematical expressions be represented in the data model?
Should the canonical format be LaTeX? Why or why not?
How should rendering and editing interact?
How should MathBlock integrate with the existing editor lifecycle?
How can future blocks (Exercise, Quiz, Flashcards, Assignments, etc.) reuse the math engine?
Which parts should be generic infrastructure versus MathBlock-specific?
What architectural risks should we anticipate now?

Produce a document named MATH_BLOCK_ARCHITECTURE.md containing:

recommended architecture
technology evaluation
proposed data model
component hierarchy
state management strategy
rendering pipeline
editor lifecycle
integration points with the existing Slide Editor
architectural decisions (ADRs)
identified trade-offs
implementation roadmap divided into small milestones.

Do not write implementation code yet. The objective is to reach architectural agreement before any coding begins.
