// mathTemplates.js — Template Registry (§16.3). Pure data, no components.
// A template is a structured definition: a LaTeX skeleton with `!n` placeholder
// markers, per-placeholder seed content, and a cursor contract.

export const MATH_TEMPLATES = {
  fraction: {
    id: "fraction",
    description: "Fraction",
    keywords: ["fraction", "frac", "divide", "ratio"],
    category: "Fractions",
    latex: "\\frac{!0}{!1}",
    placeholders: ["", ""],
    cursorAt: 0,
    preview: "\\frac{n}{d}",
  },
  sqrt: {
    id: "sqrt",
    description: "Square root",
    keywords: ["root", "square", "radical", "sqrt"],
    category: "Roots",
    latex: "\\sqrt{!0}",
    placeholders: [""],
    cursorAt: 0,
    preview: "\\sqrt{n}",
  },
  nroot: {
    id: "nroot",
    description: "n-th root",
    keywords: ["root", "radical", "nth"],
    category: "Roots",
    latex: "\\sqrt[!0]{!1}",
    placeholders: ["", ""],
    cursorAt: 0,
    preview: "\\sqrt[k]{n}",
  },
  integral: {
    id: "integral",
    description: "Definite integral",
    keywords: ["integral", "integrate", "area", "calculus"],
    category: "Calculus",
    latex: "\\int_{!0}^{!1} !2",
    placeholders: ["", "", ""],
    cursorAt: 0,
    preview: "\\int_{a}^{b} f(x)\\,dx",
  },
  sum: {
    id: "sum",
    description: "Sum (Sigma)",
    keywords: ["sum", "sigma", "series"],
    category: "Calculus",
    latex: "\\sum_{!0}^{!1} !2",
    placeholders: ["", "", ""],
    cursorAt: 0,
    preview: "\\sum_{i=1}^{n} a_i",
  },
  quadratic: {
    id: "quadratic",
    description: "Quadratic formula",
    keywords: ["quadratic", "formula", "roots"],
    category: "Templates",
    latex: "!0 = \\frac{!1 \\pm \\sqrt{!2}}{!3}",
    placeholders: ["x", "-b", "b^2-4ac", "2a"],
    cursorAt: 0,
    preview: "x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}",
  },
  binomial: {
    id: "binomial",
    description: "Binomial coefficient",
    keywords: ["binomial", "choose", "combination", "ncr"],
    category: "Templates",
    latex: "\\binom{!0}{!1}",
    placeholders: ["", ""],
    cursorAt: 0,
    preview: "\\binom{n}{k}",
  },
};

export const listTemplates = () => Object.values(MATH_TEMPLATES);
export const getTemplate = (templateId) => MATH_TEMPLATES[templateId] ?? null;
