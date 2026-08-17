# Math Block Development Plan

> Status: **Math V1 shipped (2026-08); Math V2/V3 postponed (MVP-first).**
>
> V1 authoring is implemented (commits `228a93a` → `d6b114f`). The editor now proceeds to the
> Code Block; the remaining math capabilities defined in this document (V2 — scientific sets,
> V3 — advanced authoring) are deliberately postponed so the platform can serve its MVP first.
>
> This document defines the vision, scope, architecture, and implementation roadmap for the Math Block.
>
> It serves as the reference document for every future implementation of mathematical editing inside the Slide Editor.

---

# 1. Context

VipiClass is designed to become a complete educational platform.

Many disciplines—including Mathematics, Physics, Engineering, Economics, Statistics, Computer Science and Chemistry—require professional mathematical notation that cannot be represented comfortably using plain rich text.

While a normal Text Block can display simple formulas, it cannot provide a true mathematical authoring experience.

For this reason, the Math Block is introduced as a dedicated mathematical editing engine.

Unlike the Exercise Block or Quiz Block, the Math Block is **not simply another content block**.

It is a specialized editing engine whose responsibility is to allow teachers to create beautiful, editable, and reusable mathematical expressions throughout the platform.

Future educational blocks (Exercises, Quizzes, Exams, Flashcards, Assignments...) may embed mathematical expressions by reusing this engine.

---

# 2. Objectives

The Math Block should allow teachers to:

- write mathematical expressions naturally
- edit equations at any time
- produce professional-quality mathematical notation
- integrate seamlessly with the Slide Editor
- export correctly to future PDF documents
- become the mathematical foundation of the VipiClass ecosystem

---

# 3. Design Principles

The Math Block should always prioritize:

- Professional mathematical rendering
- Ease of authoring
- Future extensibility
- High performance
- Compatibility with exports
- Reusability by future educational blocks

The goal is **not** to reinvent mathematical editing, but to integrate a robust mathematical editing engine into the editor architecture.

---

# 4. Core Responsibilities

The Math Block is responsible for four major capabilities.

## 4.1 Mathematical Authoring

Teachers should be able to create mathematical expressions without memorizing LaTeX.

Whenever possible, toolbar actions should generate the appropriate mathematical syntax automatically.

---

## 4.2 Beautiful Rendering

Expressions should render exactly like professional mathematical textbooks.

Examples:

- Fractions
- Integrals
- Matrices
- Summations
- Limits
- Roots

should appear as properly formatted mathematical notation.

---

## 4.3 Editable Expressions

Every equation should remain editable.

Selecting an existing formula should reopen the editor instead of regenerating or recreating the expression.

---

## 4.4 Editor Integration

The Math Block must fully support:

- Undo / Redo
- Autosave
- Copy / Paste
- Duplicate
- Block Selection
- Multi-selection
- Drag & Drop
- Block History

exactly like every other editor block.

---

# 5. Canonical Storage Format

The canonical representation of every mathematical expression will be **LaTeX**.

Example:

```javascript
content: {
  latex: "\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}";
}
```

Rendering should always be generated from the stored LaTeX.

Reasons:

- portable
- editable
- AI-friendly
- PDF-friendly
- future-proof
- supported by KaTeX
- supported by MathJax

---

# 6. Feature Roadmap

## Math V1 — Foundation

### Editing [ok]

- Live mathematical editing
- Real-time rendering
- Editable equations

### Basic Operators [ok]

- -
- −
- ×
- ÷
- =
- ≠
- <
- >
- ≤
- ≥
- ±
- ≈

### Powers [ok]

- x²
- x³
- xⁿ

### Subscripts [ok]

- x₁
- a₂

### Fractions [ok]

- numerator
- denominator

### Roots [ok]

- Square root
- n-th root

### Parentheses [ok]

- ()
- []
- {}
- ||

### Greek Symbols [ok]

- α
- β
- γ
- δ
- θ
- λ
- μ
- π
- σ
- φ
- ω
- Δ
- Ω

### Miscellaneous [ok]

- Infinity
- Degree
- Percent

---

## Math V2 — Scientific Mathematics

### Calculus

- Integrals [ok]
- Double Integrals
- Triple Integrals
- Contour Integrals
- Derivatives
- Partial Derivatives
- Limits
- Summations [ok]
- Products

### Linear Algebra

- Matrices
- Determinants
- Vectors
- Transpose
- Identity Matrix

### Logic

- ∀
- ∃
- ∧
- ∨
- ⇒
- ⇔
- ¬

### Set Theory

- ℕ
- ℤ
- ℚ
- ℝ
- ℂ
- ∈
- ∉
- ⊂
- ⊆
- ∪
- ∩

### Geometry

- Angles
- Parallel
- Perpendicular
- Triangle
- Circle
- Arrows

---

## Math V3 — Advanced Authoring

### Formula Templates

Examples:

- Quadratic Formula
- Binomial Expansion
- Derivative Definition
- Matrix Template
- Polynomial Template
- Statistics Formulas

Teachers insert a template and modify only the variables.

---

### Symbol Search

Search for any mathematical symbol instead of browsing toolbars.

Example:

```
integral

matrix

theta

union

```

---

### Favorites

Frequently used symbols become available in a dedicated toolbar.

---

### Custom Templates

Teachers can save their own reusable formulas.

---

### Keyboard Shortcuts

Common shortcuts for frequently used structures.

---

### Import / Export

- Import LaTeX
- Export LaTeX

---

### Future Integrations

- Graph plotting
- AI-generated formulas
- Formula validation
- Step-by-step derivations

---

# 7. Toolbar Organization

To prevent an overwhelming interface, symbols should be grouped into categories.

Recommended toolbar groups:

- Basic
- Fractions
- Roots
- Powers
- Calculus
- Matrices
- Greek
- Logic
- Sets
- Geometry
- Symbols
- Templates

Each category expands into its own symbol panel.

---

# 8. Future Platform Integration

The Math Block should become the mathematical engine reused by:

- Exercise Block
- Quiz Block
- Assignment Block
- FlashCard Block
- Code explanations
- AI-generated lessons
- Exams
- PDFs
- Printable notes

No other block should implement its own mathematical editor.

Instead, they should embed or reuse the Math Block's editing capabilities.

---

# 9. Non-Goals

The Math Block is **not** responsible for:

- Student submissions
- Automatic grading
- CAS (Computer Algebra System)
- Symbolic simplification
- Numerical solving
- Graph plotting (initial versions)

Those belong to future educational or AI modules.

---

# 10. Architectural Notes

The Math Block should be implemented around a mature mathematical editing engine instead of building one from scratch.

The block's responsibility is to integrate that engine into the Slide Editor architecture while providing:

- persistence
- toolbar integration
- history
- autosave
- block lifecycle
- future extensibility

rather than implementing mathematical parsing itself.

---

# 11. Long-Term Vision

The Math Block is intended to become the mathematical foundation of VipiClass.

Every feature involving mathematical notation should rely on this engine.

By investing in a solid architecture now, future educational features will naturally inherit professional mathematical editing capabilities without duplicating logic.

# 12. Success Criteria

The Math Block will be considered mature when a university professor can prepare an entire mathematics lecture without leaving the editor.

This includes:

- Algebra
- Geometry
- Calculus
- Linear Algebra
- Probability
- Statistics
- Discrete Mathematics
- Logic

while producing publication-quality mathematical notation that remains editable, exportable, and reusable throughout the VipiClass platform.
