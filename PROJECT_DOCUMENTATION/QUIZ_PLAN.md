# Exercise Block — Architecture & Implementation Plan (v2, refined)

> Status: **Implemented (M1–M3); M4 docs in progress.** V1 authoring ships per this plan.
> Audience: reviewers of the Exercise Block feature.
> Relationship to existing docs: extends `ARCHITECTURE.md`, `DECISIONS.md`, and `ROADMAP.md`
> (Phase 6 — Educational Content Blocks).
> This revision incorporates the design review. Every change vs. v1 is listed in §1 with
> justification, so reviewers can approve the deltas quickly.

---

## 1. Design Review Outcomes (deltas vs. v1)

This section answers the review questions directly. The rest of the document is the refined plan.

### 1.1 Shared rich-text changes — **removed entirely**

**Decision: the Exercise Block requires no modification to `useRichTextEditor`.**

| v1 proposal | v2 decision | Why |
| --- | --- | --- |
| `field` parameter on `useInitEditor` | **Drop.** Use the existing `onContentChange` callback instead. | `onContentChange` (already in `useRichTextEditor.js:247`) is a general escape hatch that receives the editor's latest HTML. The Exercise Block routes that HTML into the correct content field itself via a functional state update. A new API parameter would duplicate an existing mechanism for exactly one consumer — premature generalization (violates ADR-008 and our "implementation first" principle). |
| `enableSlashMenu` parameter | **Drop.** Keep the slash menu enabled in exercise fields. | Every rich-text block today (Text, Callout) shows the slash menu on `/`. Keeping it in exercise fields is the *consistent* behavior. If it ever proves confusing, disabling it is a one-line option added then — not speculative API today. |
| `contentRef` staleness fix | **Not required for the exercise.** Report as a separate pre-existing bug (§7). | The exercise avoids the stale-closure pitfall by (a) reading only `newContent.html` from `onContentChange` and discarding the stale spread, and (b) applying functional updates against *current* state. No shared-hook change is needed to make this correct. |

**How the Exercise Block gets multi-field rich text without new shared API:**

```jsx
// inside ExerciseBlock.jsx (one per field: instructions / hint / teacherNotes)
const editor = useInitEditor({
  slideId,
  blockId,
  blockType: "exercise",
  content: { html: block.content.instructions?.html || "" },  // per-field payload, NOT block.content
  onContentChange: (newContent) => updateField("instructions", { html: newContent.html }),
});
```

```js
// useExercise.js — always a functional update, so no stale closure can lose data
const updateField = (field, value, { recordHistory = false } = {}) => {
  const update = recordHistory ? setSlides : setSlidesWithoutHistory;
  update((slides) => slides.map((slide) =>
    slide.id !== slideId ? slide : {
      ...slide,
      blocks: slide.blocks.map((b) =>
        b.id !== blockId ? b : { ...b, content: withDefaults({ ...b.content, [field]: value }) },
      ),
    },
  ));
};
```

Two implementation details this hinges on, both important:

- Each editor receives a **per-field** `content` payload (`{ html: <that field's html> }`), never the
  whole `block.content`. Passing the whole object would make `useInitEditor` read
  `content.html` (undefined → empty editor) and make `updateEditorUI` thrash on every render.
- The default `updateBlock` path is **never** used for these fields. It replaces the entire
  `block.content` with `{ ...content, html }`, which would wipe title/other fields. That is exactly
  why `onContentChange` is mandatory here.

### 1.2 YAGNI — `responseSettings` and `grading` **removed from the persisted V1 schema**

**Decision:** do not store `responseSettings` or `grading` in V1 content. They are documented as the
future schema (§5.4) and will be added, with their own milestones, when submissions and grading are
actually built.

Rationale — *"build what we need today; prepare for tomorrow without storing unused data."*

- Nothing in V1 reads or writes these fields. Storing them is speculative data in every document.
- Adding them later is **free** thanks to read-time normalization (`withDefaults`, §5.3): new fields
  are merged in automatically for old documents. There is no migration cost that today's schema
  avoids.
- Keeping them out makes every V1 document smaller, every save smaller, and the block's data model
  easier to reason about during implementation.

### 1.3 `schemaVersion` — **removed**

**Decision:** no version field in V1 content.

- Versioning only earns its keep when there are *persisted documents from an earlier schema* that
  need different migration decisions. Today there are none — the editor is pre-production and the
  only stored lessons are seed data with empty `slides` arrays.
- Default-filling is already handled by `withDefaults`, which is additive and needs no version to
  work.
- Reintroduce `schemaVersion` (or a migration mechanism) later, when the editor stabilizes and
  starts holding real production documents. At that point it belongs on the *lesson document*, not
  on every block (one field per lesson, not N per lesson).

### 1.4 File organization — **collapsed from 9 to 3 new files**

| v1 | v2 |
| --- | --- |
| `blocks/Exercise/ExerciseBlock.jsx` | `blocks/ExerciseBlock.jsx` (flat, like `TextBlock`/`CalloutBlock`) |
| `blocks/Exercise/ExerciseRichTextField.jsx` | *folded into* `ExerciseBlock.jsx` as a module-local `RichTextField` component |
| `blocks/Exercise/ExerciseMetadata.jsx` | *folded inline* (small: one select + one number input) |
| `blocks/Exercise/ResourceList.jsx`, `ResourceItem.jsx` | *folded inline* for V1 |
| `blocks/Exercise/exerciseTypes.js` | *folded into* `hooks/exerciseUtils.js` (single consumer) |
| `hooks/exercise/useExercise.js` | `hooks/useExercise.js` |
| `hooks/exercise/exerciseDefaults.js` | `hooks/exerciseUtils.js` |

V1 stays to **three new files** (plus 4 small modifications). Splitting `ResourceList` /
`ExerciseRichTextField` / etc. out is deferred until those sections actually grow — that is the
project's progressive-decomposition rule (ADR-008), and a single file keeps M1–M3 diffs small and
reviewable.

### 1.5 Resource model — **added `addedAt`, kept otherwise**

Add one field to each resource:

```js
resources: [{ id, type, title, src, mimeType, size, addedAt }]
```

- `addedAt: string` (ISO timestamp, set at creation). Clear long-term value: per-resource
  analytics, future storage-migration/cleanup workflows (e.g., purging orphaned uploads), and
  natural default ordering by recency. Cheap, immutable, never edited.
- Deliberately **not** added: `filename`, `thumbnail`, `caption`, `createdBy`. `title` already
  covers display (it defaults to the original filename on upload). `filename` only becomes worth
  storing when download/export exists — at which point the future uploader can record it. Everything
  else has no consumer in sight.

### 1.6 Things we nearly forgot (found during review)

| # | Issue | Verdict |
| --- | --- | --- |
| 1 | **`onContentChange` is mandatory, and the default `updateBlock` path is a data-wipe trap.** If a future contributor omits `onContentChange` for an exercise field, typing would replace the *whole* `block.content` with `{ html }`. | Address **now** — M1/M2 tests explicitly include "edit instructions, then hint, then instructions again; hint is preserved." Also captured in a code comment at the field call site. |
| 2 | **"Turn into" destroys exercise content.** `transformBlock` flattens content to `{ html }`; `BlockActions` shows it for every block. | Address **now** — hide the "Turn into" section for exercise blocks (M1, one prop). |
| 3 | **Pre-existing latent bug: `CalloutBlock` variant revert.** Changing the callout variant select and then typing reverts the variant, because `useInitEditor`'s `onUpdate` writes `{ ...firstRenderContent, html }` from a stale closure. | Separate small bug fix (a `contentRef` in `useInitEditor`). Recommended as an independent, low-risk commit; **not** a dependency of the exercise. Postponed only if we prefer to file it as tech debt. |
| 4 | **Uploaded resources are blob URLs → lost on reload.** | Postponed (matches existing `ImageBlock`; cloud storage is a separate roadmap item). Documented in §6.4 and §8. |
| 5 | **Editor count / memory** (3 Tiptap instances per block). | Lazy-mount hint/teacher-notes editors (mounted only when expanded); instructions always mounted. |
| 6 | **`teacherNotes` must never be visible to students** in a future student view. | Convention documented now (§5); the future rendering mode must filter it. |
| 7 | **Empty/placeholder states** (fresh block, no resources yet) and accessibility labels for controls. | M4 polish, not blockers. |

---

## 2. Executive Summary

The Exercise Block is the first "educational task" block. It asks students to *perform a task*
(solve, explain, analyze, build, write…) as opposed to a Quiz, which asks them to *answer closed
questions*.

The refined plan:

1. Reuses the existing block dispatcher, rich-text pipeline (`useInitEditor` +
   `onContentChange`), two-tier history, autosave, toolbar, slash menu, selection, drag-and-drop
   and clipboard — **with zero changes to shared infrastructure**.
2. Persists a deliberately small V1 schema (title, instructions, difficulty, estimated time, hint,
   teacher notes, resources). `responseSettings`, `grading` and schema versioning are documented for
   later, added when their features ship.
3. Ships as **3 new files** (block component, behavior hook, pure utils) plus 4 small edits,
   following the project's progressive-decomposition philosophy.
4. Is authoring-only. Submissions, grading, attempts and feedback live in future VipiClass domain
   models and are never stored in lesson content.
5. Ships in four small, independently testable, commit-ready milestones (M1–M4).

---

## 3. Functional Requirements

## 3.1 V1 must support

**Core authoring (editing view):**

- Insert an Exercise Block via the `+` Insert Menu, Insert-Menu-Between, and the Slash Menu
  (`/exercise`).
- Edit an exercise **title** (single-line, commits on blur/Enter — same behavior as slide titles).
- Edit **instructions** as rich text (bold, italic, lists, headings, links, alignment) — the main
  prompt area.
- Set **difficulty** (`easy | medium | hard`) via a select.
- Set **estimated time** in minutes (optional number input, commits on blur/Enter).
- Edit an optional **hint** (rich text, collapsed by default).
- Edit **teacher notes** (rich text, collapsed by default; teacher-only by convention).
- Manage **resources**:
  - Add: upload a local file (image/PDF/Word/ZIP…), add an external URL, add a video URL.
  - Remove a resource; edit its display title; reorder (stretch — up/down buttons).
  - Uploads record `mimeType`, `size`, and `addedAt` automatically.

**Platform integration (inherited for free):**

- Undo/Redo via the global two-tier history.
- Autosave via the existing 2s debounced pipeline.
- Block selection, multi-selection, drag-and-drop ordering, duplicate, copy/paste.
- Persistence through the existing Lesson REST API + MongoDB (`content` is `Mixed` — no schema
  change required).
- Block cloning (duplicate/copy/paste) preserves all exercise content, including resources.

## 3.2 Intentionally deferred (not V1)

| Capability | Why deferred |
| --- | --- |
| Student-facing rendering mode | V1 is authoring-only; a read-only student view is a platform concern. |
| Student submissions / responses | Belongs to a future Classroom domain model. Storing them in `block.content` would pollute lesson content. |
| `responseSettings` authoring UI + schema | No response capture exists yet. Schema reserved in §5.4; added with the submissions feature. |
| `grading` / rubric / `maxScore` authoring UI + schema | Same reasoning as above. |
| Multiple attempts / response attachments | Depends on submissions; deferred. |
| Inline images inside rich text | The shared Tiptap config has no Image extension today. Adding one is a shared-infra change for a capability that already has two alternatives: a resource of type `image`, or an adjacent ImageBlock. Defer until multiple blocks need inline images — then add `@tiptap/extension-image` to the shared editor once, and the Exercise Block inherits it. |
| Cloud file storage | Existing editor uses local blob URLs (`neverforgetnotes.md` already lists cloud uploads as future). V1 matches `ImageBlock`; the resource model is designed so only the uploader swaps later. |
| Rich video embeds in resources | V1 renders resources as link cards; inline YouTube already exists via YoutubeBlock. |
| AI generation of exercises | Out of scope; the data model is the contract AI will target (§9). |

---

## 4. Architecture Review — Integration Points

### 4.1 BlockRenderer (dispatcher)

One new branch in the existing `if / block.type ===` switch:

```jsx
{block.type === "exercise" && <ExerciseBlock block={block} slideId={slideId} />}
```

No registry refactor for V1. (The ROADMAP's central `BLOCK_TYPES` registry stays a future refactor;
the factory approach in §5.3 keeps the block self-contained so that refactor remains mechanical.)

### 4.2 `useRichTextEditor` — **no changes**

Three rich-text fields on one block are supported with the existing `onContentChange` escape hatch
and functional state updates (§1.1). The toolbar, editor registration, and keyboard handling are all
inherited unchanged; focusing any exercise field makes it the `activeEditor` and the shared toolbar
tracks it automatically.

### 4.3 History

Two-tier history is used unchanged:

- Discrete/structural edits → `setSlides(...)` → undoable step.
- Continuous typing → `setSlidesWithoutHistory(...)` → Tiptap's native per-editor undo.

All exercise mutations use **functional** updates against current state (never stale closures),
mirroring `useTableCore.updateTable`. Full rules in §7.

### 4.4 Autosave

Zero changes. Every mutation flows through `slidesHistory.present`, so the existing debounce +
`isUndoRedoRef` skip work automatically. Caveat: uploaded resources are blob URLs (session-only),
same as today's `ImageBlock` (§6.4).

### 4.5 Toolbar

Free. Each field's Tiptap editor registers as `activeEditor` on focus; no block-owned toolbar.

### 4.6 Slash Menu

- **Inserting** the block: add `{ type: "exercise", label: "Exercise", icon: ClipboardCheck }` to
  the `Education` group in `editor/blocks.js`. It then appears in the Insert Menu,
  Insert-Menu-Between, and the slash menu automatically.
- **Inside** the block: slash menu stays enabled, consistent with every other rich-text block.
  Formatting via toolbar; `/` offers block insertion exactly as in a Text block.

### 4.7 Selection

Block-level wrapper in `BlockRenderer` provides selection, actions, and the "important" border
unchanged. Interactive exercise controls (accordion toggles, resource add/remove buttons, resource
drop zones) call `e.stopPropagation()` so they do not flip block selection or start a drag. Clicks
inside rich-text fields bubble normally (consistent with Text/Callout).

### 4.8 Drag & Drop

`SortableBlock` wraps the block; ordering uses the existing `⋮⋮` handle. Resource drop zones
`stopPropagation` on `drop`/`dragover` so dropping a file does not begin a block reorder.

### 4.9 Clipboard / clone

`cloneBlock`/`cloneSlide` use `structuredClone`, so exercise content and `resources` deep-clone
with new ids. Blob-URL strings clone as shared references (same limitation as today). No changes.

### 4.10 BlockActions ("Turn into")

`transformBlock` flattens content to `{ html }` and would destroy an exercise. Fix in M1:
`BlockRenderer` passes `hideTransform={block.type === "exercise"}` to `BlockActions`, which hides the
transform section. Content-aware transforms remain a future feature.

---

# 5. Data Model

## 5.1 V1 persisted schema

```javascript
// block.content for a block with type === "exercise"
content: {
  title: "Exercise",                      // short label; defaults to "Exercise"
  instructions: { html: "<p></p>" },      // rich text — the task prompt
  difficulty: "medium",                   // "easy" | "medium" | "hard"
  estimatedTime: null,                    // minutes (number) | null = unspecified
  hint: { html: "" },                     // rich text, optional
  teacherNotes: { html: "" },             // rich text, optional, teacher-only by convention
  resources: [],                          // Resource[]
}
```

### Resource

```javascript
{
  id: "rc_<generateId>",            // stable reference (future submissions/analytics)
  type: "image" | "file" | "url" | "video",   // renderer discriminator
  title: "worksheet.pdf",           // display name; defaults to original filename/URL
  src: "blob:… | https://…",        // the URL
  mimeType: "application/pdf",      // exact format for uploaded files; null for url/video
  size: 20480,                      // bytes for uploaded files; null otherwise
  addedAt: "2026-08-05T09:30:00Z",  // ISO timestamp, set at creation
}
```

## 5.2 Field justifications

| Field | Justification |
| --- | --- |
| `title` | A slide can contain several exercises; each needs a short label students can reference. Reuses `EditableTitle`. |
| `instructions`, `hint`, `teacherNotes` as `{ html }` | Rich text. The editor's entire text pipeline stores HTML (`content.html`); objects wrap it per-field so `useInitEditor` + `onContentChange` can target a single field. |
| `difficulty` as string enum | Readable and self-documenting in data and in the future AI contract; no consumer needs a numeric scale yet. |
| `estimatedTime` as `number | null` minutes | Simple, unambiguous. A `unit` field is speculative; add only when hours become real. |
| `resources` with `id/type/title/src/mimeType/size` | `id` = stable reference; `type` = how to render (thumbnail vs. link card); `mimeType`/`size` = authoritative file data. New kinds later = new `type` values + one renderer case — additive, never breaking. |
| `addedAt` | Analytics, storage-migration/cleanup workflows, default recency ordering. Immutable, cheap. |

## 5.3 Forward compatibility without migration

- **Read-time normalization.** A pure helper `withDefaults(content)` fills any missing field with
  its default (including per-resource defaults). Components read through it; it never writes during
  render. Old documents always render complete, and future fields are added to `withDefaults` — no
  data migration.
- **Additive resource types.** `type` is an open enum; a new kind = registry entry + renderer case.
- **Future fields are added, not migrated.** Because `withDefaults` is additive, `responseSettings`
  and `grading` can appear in content later with zero changes to existing documents.

## 5.4 Future schema (documented now, added when built)

```javascript
// ADDED when the submissions feature ships:
responseSettings: {
  enabled: false,          // does the task expect a deliverable?
  type: "text",            // "text" | "file" | "both"
  allowMultipleAttempts: false,
  allowAttachments: false,
  maxAttachments: 1,
  acceptedFormats: [],
}

// ADDED when grading ships:
grading: {
  enabled: false,
  maxScore: 0,
  rubric: null,            // future: { criteria: [{ id, label, description, points }] }
}

// ADDED when the editor holds production documents:
schemaVersion: 1           // on the Lesson document, not per block
```

---

# 6. Component Architecture

## 6.1 Files (V1)

**New:**

```
src/app/slides/
├── components/blocks/ExerciseBlock.jsx   # root + all V1 UI (incl. module-local RichTextField)
├── hooks/useExercise.js                  # behavior: updateField, resource CRUD (functional updates)
└── hooks/exerciseUtils.js                # createExerciseBlock, withDefaults, createResource, RESOURCE_TYPES
```

**Modified:**

```
├── editor/blocks.js                      # add "Exercise" to the Education group
├── components/blocks/BlockRenderer.jsx   # add the exercise branch
├── components/BlockActions.jsx           # hideTransform prop
└── hooks/useSlides.js                    # dispatch createExerciseBlock() in addBlock
```

## 6.2 Responsibilities

| Piece | Responsibility | Pattern it follows |
| --- | --- | --- |
| `ExerciseBlock` (root) | Reads `block.content` through `withDefaults`; renders title, metadata, instructions, collapsible hint/teacher-notes, resources; owns accordion + add-resource local UI state; calls `useExercise` for all mutations. Contains a module-local `RichTextField` component (label + `EditorContent` + per-field `useInitEditor`/`onContentChange`) used 3×. | `TableBlock`; module-local helpers keep the file count at one. |
| `useExercise` | Single owner of exercise behavior. `updateField`, `addResource`, `removeResource`, `updateResource`. All via functional `setSlides`/`setSlidesWithoutHistory`. | `useTable` decomposition. |
| `exerciseUtils.js` | Pure data: `createExerciseBlock()`, `withDefaults()`, `createResource(type, data)`, `RESOURCE_TYPES` registry. | `tableUtils.createTableBlock`; `calloutTypes.js`. |

**Deliberately not split in V1:** `ResourceList`/`ResourceItem`, `ExerciseRichTextField`,
`ExerciseMetadata`, `exerciseTypes`. Each is small now; split when a file or responsibility grows
(progressive decomposition). The module-local `RichTextField` gives the 3 rich-text sections a
single implementation without adding a file.

**Lazy editor mounting:** hint/teacher-notes editors mount only when their accordion section is
expanded (and unmount on collapse); instructions stays mounted. Typical visible editor count is
**one** per exercise — a deliberate answer to the "many editors" trade-off (ADR-006).

---

# 7. Editing Workflow

All writes target `block.content`; the single source of truth is `slidesHistory.present`.

| Field | Control | Reused component/pattern | History |
| --- | --- | --- | --- |
| Title | Single-line input, commit on blur/Enter | `EditableTitle` | `setSlides` (1 entry/commit) |
| Instructions | Tiptap rich text, per-field `useInitEditor` + `onContentChange` | shared `useRichTextEditor` | `setSlidesWithoutHistory` (native Tiptap undo) |
| Difficulty | Native select | `CalloutBlock` variant select | `setSlides` |
| Estimated time | Number input, commit on blur/Enter | `EditableTitle` commit pattern | `setSlides` |
| Hint | Tiptap rich text (collapsed, lazy-mounted) | same as instructions | `setSlidesWithoutHistory` |
| Teacher notes | Tiptap rich text (collapsed, lazy-mounted) | same as instructions | `setSlidesWithoutHistory` |
| Add resource | Button → type chooser → file input (upload → blob URL) or URL prompt | `ImageBlock` uploader pattern | `setSlides` |
| Remove / rename / reorder resource | Row buttons + `EditableTitle` | — | `setSlides` |

---

# 8. UI Layout (authoring view)

```
┌ Exercise ───────────────────────────────────────┐
│  Exercise 1          [Difficulty: Medium ▾]      │
│  Estimated time: [ 20 ] min                     │
│                                                  │
│  ▍ Instructions                                 │
│  ┌────────────────────────────────────────────┐ │
│  │ (shared Tiptap editor — toolbar on focus)  │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ▍ Resources                                    │
│  [+ File] [+ URL] [+ Video]                     │
│  • worksheet.pdf    [✎][×]                      │
│  • diagram.png      [✎][×]                      │
│                                                  │
│  ▸ Hint (optional)          ← collapsed          │
│  ▸ Teacher notes           ← collapsed          │
└──────────────────────────────────────────────────┘
```

Usability principles:

- **Visible-first:** instructions (the task) and resources are the default surface; hint and teacher
  notes are deliberately secondary (collapsed).
- **No modal for authoring:** every field edits in place, matching the rest of the editor.
- **Block chrome reused:** selection ring, actions menu, drag handle, "important" — all inherited.
- Visual polish is intentionally out of scope.

---

# 9. State Management

## 9.1 Where state lives

- **All document state** stays in `EditorContext.slidesHistory` (existing single owner). The
  Exercise Block adds **zero** new context/global state — exercise editing needs only `block.content`.
- **Local ephemeral UI state** lives in the component: accordion open/closed, add-resource menu,
  number-input draft, file-input ref. Discarded on unmount, never persisted.

## 9.2 Update path

The Exercise hook never uses `useSlides.updateBlock` (it closes over a potentially stale `slides`
snapshot). It uses functional updates through `useHistory`, exactly like `useTableCore.updateTable`
(§1.1 code sketch).

## 9.3 History rules

| Update | Path | Why |
| --- | --- | --- |
| Rich-text keystrokes (instructions/hint/teacherNotes) | `setSlidesWithoutHistory` | Continuous; Tiptap native undo per field. |
| Title commit, difficulty change, time commit | `setSlides` | Discrete, user-intentional. |
| Resource add / remove / rename / reorder | `setSlides` | Structural. |

## 9.4 Autosave behavior

Unchanged pipeline. Every mutation lands in `present`; the 2s debounce saves; undo/redo sets
`isUndoRedoRef` and skips an autosave cycle. No new save logic.

## 9.5 Known limitation (accepted, documented)

Uploaded resources use `URL.createObjectURL` blob URLs, which do not survive page reload (identical
to today's ImageBlock). Mitigation: `src` is an opaque string and the uploader is a swappable seam —
when cloud storage lands, only the upload handler and the value written to `src` change. The schema
does not change.

---

# 10. Future Evolution

| Future capability | How today's architecture enables it |
| --- | --- |
| **Quiz** | Same pattern: a block with multiple rich-text fields (question stem, option labels, explanation) via per-field `useInitEditor` + `onContentChange`. `withDefaults` normalizes its content. |
| **Assignment** | Assignment ≈ Exercise + submission workflow. Task authoring (title, instructions, resources, time) is shared; the submission layer plugs into the future Classroom domain, not `block.content`. |
| **Lab** | Exercise with a checklist-style instructions body + procedure/data-file resources. No new model. |
| **Flashcards** | New block type reusing the same per-field rich text and normalization pattern; distinct content shape, same infrastructure. |
| **AI-generated exercises** | `createExerciseBlock()` is a public factory and `withDefaults` a public normalizer; an AI endpoint can emit factory-shaped JSON and the editor renders it with zero glue code. The data model *is* the contract. |
| **Student submissions** | New Classroom collection referencing `{ lessonId, slideId, blockId, resourceId }`. Stable ids already exist for blocks and resources; lesson content stays read-only for students. |
| **Teacher grading** | `grading` (§5.4) is added with the feature; grading consumes submissions (external) and writes results to the submission, not lesson content. |
| **AI feedback** | Consumes submissions + the task's `grading.rubric`/`difficulty` metadata; writes back to the submission domain. No editor changes. |
| **Rubrics** | Extension point defined in §5.4 (`criteria: [{ id, label, description, points }]`); authoring UI is a future milestone. |
| **Classroom integration** | Block/resource ids are stable and content carries only authored intent — everything a classroom needs to reference an exercise exists in the model. |
| **Block transformation** | Not a V1 target; exercise hides "Turn into" (§4.10). A content-aware transform can be added later. |

---

# 11. Risks & Mitigations

| # | Risk | Mitigation |
| --- | --- | --- |
| 1 | **Data-wipe trap:** omitting `onContentChange` for a field would replace the whole `block.content` with `{ html }`. | `onContentChange` is mandatory for every field; M1/M2 tests explicitly verify cross-field preservation; comment at the call site. |
| 2 | **Stale closures** losing edits when switching fields. | Functional updates only (`setSlides(prev => …)`), never `useSlides.updateBlock`. |
| 3 | **Editor count / memory** (up to 3 Tiptap instances per block). | Lazy-mount hint/teacher-notes editors; typical visible count = 1. |
| 4 | **Blob URLs not persistent across reload** (uploaded resources). | Accepted existing limitation, documented (§9.5); `src` is a swappable seam for cloud storage. |
| 5 | **History flooding** from continuous inputs. | Rules table in §9.3; title/time inputs commit on blur/Enter. |
| 6 | **`transformBlock` destroys exercise data** if reachable. | "Turn into" hidden for exercise blocks (M1). |
| 7 | **Drop-zone vs block drag conflict.** | Resource drop handlers `stopPropagation` (§4.8). |
| 8 | **Schema drift** on old documents after future field additions. | `withDefaults` read-time normalization (§5.3). |
| 9 | **Scope creep** toward quiz/grading behavior during implementation. | V1 requirements are explicit (§3); grading/response UI is excluded until its own milestone. |
| 10 | **Pre-existing CalloutBlock variant-revert bug** (unrelated but in the touched file). | Small independent fix (contentRef in `useInitEditor`); recommended before or alongside M1. |

---

# 12. Implementation Roadmap

Principles: each milestone is independently testable, commit-ready, `npm run lint` clean, and does
not mix unrelated work. Every milestone leaves the app working.

---

## M1 — Exercise block skeleton + data model

**Goal:** an Exercise Block can be inserted, renders a shell with an editable title, persists its
normalized content, clones correctly, and is protected from destructive transforms.

**Files:**
- **Add** `hooks/exerciseUtils.js` — `createExerciseBlock()`, `withDefaults()`,
  `createResource()`, `RESOURCE_TYPES`.
- **Add** `hooks/useExercise.js` — `updateField` (functional updates; `recordHistory` option).
- **Add** `components/blocks/ExerciseBlock.jsx` — title via `EditableTitle` + placeholder sections
  (instructions/hint/teacher-notes/metadata/resources render as empty states).
- **Modify** `editor/blocks.js` — add `{ type: "exercise", label: "Exercise", icon: ClipboardCheck }`
  to the `Education` group.
- **Modify** `hooks/useSlides.js` — `addBlock` dispatches `createExerciseBlock()` for `"exercise"`
  (mirroring the `table` special case).
- **Modify** `components/blocks/BlockRenderer.jsx` — add the `exercise` branch.
- **Modify** `components/blocks/BlockActions.jsx` — honor `hideTransform`.

**Expected result:** insert via `+` menu, Insert-Menu-Between, and `/exercise`; a shell renders;
state shows the full default content shape; reload keeps it; no "Turn into" menu for the block.

**Manual testing checklist:**
- [ ] Insert via all three entry points; `content` has all V1 fields + defaults.
- [ ] Edit the title → commits on blur/Enter → one undo step → autosave fires.
- [ ] Reload — block and content persist.
- [ ] Duplicate, copy/paste — content (incl. `resources`) cloned with new ids.
- [ ] Selection ring, drag handle, "important" marker still work.
- [ ] BlockActions menu shows Duplicate/Copy/Paste/Mark Important/Delete but **no "Turn into"**.
- [ ] `npm run lint` passes.

---

## M2 — Authoring core: rich text + metadata

**Goal:** instructions, hint, teacher notes are fully editable rich text with shared toolbar and
**no cross-field data loss**; difficulty and estimated time are editable.

**Files:**
- **Modify** `components/blocks/ExerciseBlock.jsx` — add module-local `RichTextField` (per-field
  `useInitEditor` + `onContentChange` → `updateField`); add difficulty select and time input.
- **Modify** `hooks/useExercise.js` — metadata commits via `setSlides`.

**Expected result:** full task-text authoring with correct history/autosave/toolbar.

**Manual testing checklist:**
- [ ] Type in Instructions → toolbar (bold/lists/links) works; Ctrl+Z undoes typing natively.
- [ ] **KEY TEST:** fill Instructions → fill Hint → edit Instructions again → **Hint is preserved**;
  reverse order as well.
- [ ] Switch focus Instructions ↔ Hint ↔ Teacher Notes — toolbar follows; no cursor jumps.
- [ ] Collapse/reopen Hint and Teacher Notes — content intact; editors mount lazily.
- [ ] Difficulty select → one undo step per change; time input commits on blur, clears to `null`.
- [ ] Undo/redo of metadata changes does not duplicate an autosave.
- [ ] `npm run lint` passes.

---

## M3 — Resources V1

**Goal:** add, remove, rename (and stretch: reorder) resources of all four types with correct
history.

**Files:**
- **Modify** `components/blocks/ExerciseBlock.jsx` — resource section: add controls (file/URL/
  video), hidden file input, editable titles, remove (stretch: up/down).
- **Modify** `hooks/useExercise.js` — `addResource`, `removeResource`, `updateResource` (all
  `setSlides`).
- **Modify** `hooks/exerciseUtils.js` — `createResource(type, data)` fills `id/type/title/src/
  mimeType/size/addedAt`.
- Drop handlers `stopPropagation` (§4.8).

**Expected result:** teachers attach worksheets, diagrams, and links to an exercise.

**Manual testing checklist:**
- [ ] Upload image → thumbnail card; upload PDF → file card with icon; add external URL; add video
  URL.
- [ ] Rename a resource (commit on blur); remove a resource; (stretch) reorder.
- [ ] `addedAt`, `mimeType`, `size` present on uploads; `null` for URL/video.
- [ ] Every operation undoable/redoable.
- [ ] Duplicating the block duplicates resources with new ids.
- [ ] Dropping a file on the resource area does **not** reorder the block.
- [ ] Reload keeps URL-based resources (blob uploads are session-only — documented).
- [ ] `npm run lint` passes.

---

## M4 — Polish, edge cases & documentation

**Goal:** close V1 quality and record the decision.

**Files:**
- **Modify** `components/blocks/ExerciseBlock.jsx` — empty states ("No resources yet"), long-title
  wrapping, long-instructions rendering, accessibility labels for controls.
- **Modify** `PROJECT_DOCUMENTATION/DECISIONS.md` — add `ADR-011: Exercise Block (multi-field rich
  text via the existing onContentChange)`.
- **Modify** `PROJECT_DOCUMENTATION/ROADMAP.md` — tick Exercise Block V1 items in Phase 6.

**Expected result:** a polished, documented, stable V1.

**Manual testing checklist:**
- [ ] Full V1 acceptance pass combining M1–M3 with undo/redo + autosave + drag/drop + clipboard.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes (optional final gate).

---

## Suggested review order

1. Review the deltas in §1 (especially the decision to touch **no** shared infrastructure).
2. Approve the V1 schema (§5.1) — small, YAGNI-clean.
3. Approve M1–M4; each is small and mechanical once the schema is settled.
