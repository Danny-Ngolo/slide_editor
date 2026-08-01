> **This repository is the Slide Editor repository.**

Its job is **not** to explain the entire VipiClass ecosystem.

Its job is to explain the editor that will later be integrated into VipiClass.

That's exactly how large software projects are documented. Every subsystem has its own context document.

So I'd keep the document editor-focused, but I'd make one important addition:

> Explain **where this editor fits** in the future.

Just a few paragraphs are enough.

---

# What I would change

Instead of saying:

> Slide Editor is a web-based presentation editor...

I'd say something like:

> The Slide Editor is the rich content engine of VipiClass. Although it currently focuses on lesson and slide authoring, its architecture is intentionally designed to become the unified editing engine used across the platform.

That sentence changes everything.

---

## Here's how I would rewrite `CONTEXT.md`

---

# Project Context: Slide Editor

## 1. Purpose

The **Slide Editor** is the rich content editing engine being developed for **VipiClass**.

Although the current implementation focuses on creating educational lessons composed of slides and blocks, the editor is intentionally designed as a reusable subsystem rather than a feature dedicated exclusively to presentations.

Its long-term objective is to become the standard editing engine for every rich content experience inside VipiClass.

Examples include:

* lessons
* lecture notes
* assignments
* quizzes
* documentation
* AI-generated educational content
* interactive learning materials
* future collaborative documents

For that reason, architectural decisions prioritize extensibility, maintainability, and consistency over short-term implementation speed.

---

## 2. Current Scope

At the current stage of development, the project focuses exclusively on building a robust block-based slide editor.

The primary objective is **not** to complete every editor feature as quickly as possible.

Instead, the goal is to establish a solid editing foundation that future platform features can safely reuse without architectural redesign.

Current development priorities include:

* block rendering
* rich text editing
* drag-and-drop
* history management
* table editing
* keyboard navigation
* selection systems
* reusable editor infrastructure

---

## 3. Core Editing Philosophy

The editor follows several architectural principles that guide every implementation decision.

### Block-Based Editing

Content is modeled as independent blocks rather than one large rich-text document.

Each block owns its own rendering logic while sharing common editor infrastructure.

This approach allows heterogeneous content such as:

* text
* callouts
* tables
* images
* videos
* quizzes

to coexist naturally inside the same slide.

---

### Shared Editing Infrastructure

Whenever multiple block types require similar behavior, the functionality is centralized instead of duplicated.

Examples include:

* shared formatting toolbar
* unified rich text initialization
* history management
* drag-and-drop architecture
* block insertion workflow

The objective is to make new block types inherit existing capabilities instead of reimplementing them.

---

### Progressive Development

Features generally follow the same implementation lifecycle:

```text
Make it work
↓

Debug

↓

Refactor

↓

Modularize
```

Premature abstraction is intentionally avoided until implementation details become well understood.

---

## 4. Core Domain Model

The editor manipulates four primary entities.

| Entity | Responsibility                          |
| ------ | --------------------------------------- |
| Lesson | Collection of slides                    |
| Slide  | Ordered collection of blocks            |
| Block  | Individual editable content unit        |
| Cell   | Rich-text container inside table blocks |

Blocks are embedded directly inside slides.

Table cells are embedded inside table blocks.

This hierarchy mirrors the editing experience and keeps rendering straightforward.

---

## 5. Current Functional Capabilities

Implemented features currently include:

### Slide Management

* slide creation
* deletion
* duplication
* reordering

### Block System

* multiple block types
* block insertion
* block transformation
* drag-and-drop
* multi-block selection

### Rich Text

* Tiptap integration
* shared toolbar
* slash menu
* reusable editor initialization

### Table

* rich text cells
* row operations
* column operations
* resizing
* row reordering
* column reordering
* keyboard navigation

### Editing Infrastructure

* undo / redo
* autosave
* clipboard
* history
* active editor synchronization

---

## 6. Current Development Status

The editor has reached a stable architectural foundation.

Most ongoing work focuses on completing the Table V1 feature set before expanding the editor with additional block types and more advanced editing capabilities.

Current active work includes:

* cell selection
* multi-cell selection
* merge and split cells
* internal clipboard improvements
* keyboard interaction refinement

---

## 7. Relationship to VipiClass

Although this repository develops the editor independently, the editor is intended to become shared infrastructure for the VipiClass platform.

The editor should therefore be viewed as an independent subsystem whose architecture must remain reusable across multiple future products rather than tightly coupled to lesson editing alone.

---