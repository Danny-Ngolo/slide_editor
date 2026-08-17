# Quiz Block — Architecture & Implementation Plan (V1 authoring)

> Status: **Implemented (M1–M3).**
> Audience: reviewers of the Quiz Block feature.
> Relationship to existing docs: extends `ARCHITECTURE.md`, `DECISIONS.md`, and `ROADMAP.md`
> (Phase 6 — Educational Content Blocks). Follows the pattern established by the Exercise Block
> (`EXCERCISE_BLOCK_PLAN.md`, implemented M1–M3).
> Authoring-only for V1: no student answering, grading, or attempts. Those arrive in later milestones.

---

## 1. Executive Summary

A **Quiz Block** presents one or more questions — each either **choice** (selectable options, one or
multiple correct) or **open** (free-text model answer). V1 is **authoring-only**: teachers write
questions, options, model answers, and mark correct answers. No student-side rendering, auto-grading,
or attempts in this milestone.

The design reuses the infrastructure we already built for Exercise, with **zero changes to shared
infrastructure**:

- Per-field rich text via `useInitEditor` + `onContentChange`
- Two-tier history (`setSlides` / `setSlidesWithoutHistory`)
- Autosave, clipboard/duplicate, selection, drag-and-drop
- `withDefaults` read-time normalization (no migration)
- `hideTransform` protection against destructive "Turn into"

Ships as **3 new files** plus 4 small edits, each milestone commit-ready and `npm run lint` clean.

---

## 2. Functional Requirements

### 2.1 V1 must support (authoring)

- Insert a Quiz Block via the `+` Insert Menu, Insert-Menu-Between, and the Slash Menu (`/quiz`).
- Edit a block **title** (single-line, `EditableTitle`, commits on blur/Enter).
- Manage a **list of questions**: add, duplicate, remove, and (stretch) reorder. A quiz can **mix** choice
  and open questions.
- For each **choice** question:
  - Edit the **prompt** as rich text.
  - Manage **options**: add, remove, rename (rich text), (stretch) reorder.
  - **Mark the correct option(s)** — radio/checkbox depending on mode.
  - Toggle **multiple correct** per question.
- For each **open** question (no options — free-text student response):
  - Edit the **prompt** as rich text.
  - Optionally write a **model answer** (reference response) as rich text.
- For both types: edit an optional **explanation** (rich text, collapsible).
- Block cloning (duplicate / copy / paste) deep-copies all questions, options, and `type`/`modelAnswer`
  with new ids.

### 2.2 Intentionally deferred (not V1)

| Capability | Why deferred |
| --- | --- |
| Student-facing render + answer checking | V1 is authoring-only; rendering is a future milestone. |
| Auto-grading / scoring | No answering exists yet. |
| Attempts / retries / response settings | Belongs with the response-capture feature. |
| Question banks / randomization | Roadmap item; schema is designed to allow it later. |
| Per-question max score / rubrics | No grading consumer yet. |
| Drag-and-drop option/question reordering | Use up/down buttons (or defer entirely). |

---

## 3. Data Model

### 3.1 V1 persisted schema

```javascript
// block.content for a block with type === "quiz"
content: {
  title: "Quiz",                      // short label; defaults to "Quiz"
  questions: [
    {
      id: "q_<generateId>",            // stable reference for future submissions/analytics
      type: "choice" | "open",         // question discriminator
      prompt: { html: "<p></p>" },     // rich text — the question stem
      // choice questions only:
      options: [
        {
          id: "qo_<generateId>",       // stable reference
          label: { html: "<p></p>" },  // rich text — the choice text
          isCorrect: false,            // marked by the teacher
        },
      ],
      multipleCorrect: false,          // single vs multi-select for THIS question
      // open questions only:
      modelAnswer: { html: "" },       // teacher's reference answer (rich text, optional)
      // both:
      explanation: { html: "" },       // rich text, optional
    },
  ],
}
```

### 3.2 Field justifications

| Field | Justification |
| --- | --- |
| `questions: []` | A block is a quiz, i.e. an aggregate of questions. One question per block would force N blocks per quiz and make "the quiz" as a unit impossible to manage/re-use. |
| `title` | Short label for the whole quiz; reuses `EditableTitle`. Optional but useful for referencing. |
| `question.type` | `"choice" \| "open"` discriminator. Choice = selectable options (multiple choice); open = free-text response with **no options** (very common for teachers). Per-question, so a single quiz can mix both kinds. |
| `question.prompt` | Named `prompt` (not `question`) to avoid `question.question`; it is the stem. Rich text via `{ html }`. |
| `options[].label` | Rich-text choice text; `{ html }` keeps the per-field Tiptap pipeline working. Present only for `choice` questions. |
| `options[].isCorrect` | Lets both single and multi-correct be captured with one field, stored per option. |
| `options[].id`, `questions[].id` | Stable references for future submissions, analytics, and question-bank reuse. |
| `multipleCorrect` | Per-question, because a quiz may mix single- and multi-select questions. Choice-only. |
| `question.modelAnswer` | The teacher's reference answer for **open** questions. Rich text, optional. Stored now because it is authoring content (the teacher records the expected response at authoring time); the future grading layer compares against it. |
| `question.explanation` | Optional post-answer note; rich text, collapsible. Both types. |

**Note on future answer settings:** `responseSettings` / `grading` / `maxScore` are deliberately **not**
stored in V1 (YAGNI, mirrors Exercise). Adding them later is free because `withDefaults` merges new
fields at read time. They are documented in §7.

---

## 4. Files

### 4.1 New

```
src/app/slides/
├── components/blocks/QuizBlock.jsx    # root + all V1 UI (title, question list, option rows, accordion)
├── hooks/useQuiz.js                   # behavior: updateField, question + option CRUD, correctness
└── hooks/quizUtils.js                 # createQuizBlock, createQuestion, createOption, withDefaults
```

### 4.2 Modified

```
├── editor/blocks.js                     # add { type: "quiz", label: "Quiz", icon: <lucide> } to Education group
├── hooks/useSlides.js                   # dispatch createQuizBlock() in addBlock
├── components/blocks/BlockRenderer.jsx  # add the quiz branch
└── components/blocks/BlockActions.jsx   # (already honors hideTransform) set for quiz
```

The current `QuizBlock.jsx` placeholder (`[Quiz Placeholder]`) is replaced.

---

## 5. Component Architecture

| Piece | Responsibility | Pattern it follows |
| --- | --- | --- |
| `QuizBlock` (root) | Reads through `withDefaults`; renders block title; maps `questions`; owns per-question expand/collapse + option add local state; calls `useQuiz` for mutations. Contains a module-local `RichTextField` (label + `EditorContent` + per-field `useInitEditor`/`onContentChange`) and a `QuestionCard` sub-component that branches on `question.type` (choice → options + correctness; open → model answer field). | `ExerciseBlock`; `TableBlock` |
| `useQuiz` | Single owner of behavior: `updateField`, `updateQuestionPrompt`, `setQuestionType`, `addOption`, `removeOption`, `updateOption`, `toggleOptionCorrect`, `setMultipleCorrect`, `updateModelAnswer`, `addQuestion`, `removeQuestion`, `duplicateQuestion`. All functional `setSlides`/`setSlidesWithoutHistory`. | `useExercise` |
| `quizUtils.js` | Pure data: `createQuizBlock()`, `createQuestion(type)`, `createOption()`, `withDefaults()`. | `exerciseUtils` |

### Side effects / editor count

Lazy mounting mirrors Exercise: the **prompt** editor stays mounted while its question is expanded;
the **explanation** editor mounts only when its accordion is open. With multiple questions, `QuestionCard`
is collapsed by default (showing a plain-text preview of the prompt) so typical visible editor count stays
low — the same answer to the "many editors" trade-off (ADR-006).

---

## 6. Editing Workflow

All writes target `block.content`; single source of truth is `slidesHistory.present`.

| Control | Component | History |
| --- | --- | --- |
| Block title | `EditableTitle` | `setSlides` |
| Question type switch (choice ↔ open) | `QuestionCard` select | `setSlides` |
| Prompt / option label / model answer / explanation keystrokes | per-field `useInitEditor` + `onContentChange` | `setSlidesWithoutHistory` |
| Add / remove / duplicate question or option | `useQuiz` CRUD | `setSlides` |
| Toggle correct, multiple-correct switch | `useQuiz` | `setSlides` |

All mutations use **functional** updates (never `useSlides.updateBlock`), mirroring `useExercise` and
`useTableCore.updateTable` — avoids the stale-closure data-wipe trap.

---

## 7. Future schema (documented now, added when built)

```javascript
// ADDED when the response-capture feature ships:
responseSettings: {
  enabled: false,
  type: "single" | "multiple",   // derived from each question's multipleCorrect at render time
}

// ADDED per question when grading ships:
maxScore: 0,
```

---

## 8. Milestones

Each is independently testable, commit-ready, `npm run lint` clean, and leaves the app working.

### M1 — Skeleton + data model

- **Add** `hooks/quizUtils.js` — `createQuizBlock()`, `createQuestion(type)`, `createOption()`, `withDefaults()`.
- **Add** `hooks/useQuiz.js` — `updateField` + question CRUD (`addQuestion`, `removeQuestion`, `duplicateQuestion`, `setQuestionType`, `moveQuestion`).
- **Add** `components/blocks/QuizBlock.jsx` — title, question list shell with one default **open** question, add/remove/duplicate question, type switch (choice ↔ open, seeds two default options when switching to choice), up/down question reorder.
- **Modify** `editor/blocks.js`, `hooks/useSlides.js`, `components/blocks/BlockRenderer.jsx`, `components/blocks/BlockActions.jsx` (hideTransform).

**Manual test:** insert via all 3 paths; default content shape (`type: "open"`, no options); edit
title; switch a question to `choice` → two default options seeded; add/remove/duplicate/reorder
questions; reload persists; clone/copy/paste keeps questions (with `type`/`modelAnswer`) and new ids;
no "Turn into"; lint clean.

### M2 — Authoring core (per-question rich text + correctness)

- **Modify** `QuizBlock.jsx` — `QuestionCard` branching on `type`: for choice, rich-text prompt, option
  list (add/remove/rename), correct-toggle, multiple-correct switch; for open, rich-text prompt + model
  answer field; both share collapsible explanation.
- **Modify** `useQuiz.js` — option CRUD, correctness updates, `updateModelAnswer` (all functional).

**Manual test:** KEY — fill Q1 (choice) prompt → options → explanation → edit Q1 again → Q2 (open)
prompt + model answer and all options preserved (no cross-field loss); toolbar follows focus; undo/redo
per field; collapse/reopen preserves content; correct-toggle = one undo step; switching choice ↔ open
keeps prompt/explanation and hides/shows options or model answer; lint clean.

### M3 — Polish, edge cases & documentation

- **Modify** `QuizBlock.jsx` — empty states ("No questions yet", "Add an option"), long-text rendering,
  accessibility labels.
- **Modify** `PROJECT_DOCUMENTATION/DECISIONS.md` — add `ADR-012: Quiz Block (multi-question, per-field rich text)`.
- **Modify** `PROJECT_DOCUMENTATION/ROADMAP.md` — tick Quiz V1 items in Phase 6.

**Manual test:** full V1 acceptance pass combining M1–M2 with undo/redo + autosave + drag/drop +
clipboard; `npm run lint`; `npm run build`.

---

## 9. Recommended build order & open questions

Build **M1 first** (skeleton + data model), then M2, then M3.

Confirmed decisions:

1. **Default question on insert:** new block starts with one **`open`** question (no options). When the
   teacher switches a question to `choice`, it is seeded with two default options ("Option 1", "Option 2").
2. **Reordering:** up/down reordering is included for both **questions** (M1) and **options** (M2).