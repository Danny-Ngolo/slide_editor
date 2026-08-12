import { SYMBOL, TEMPLATE } from "./mathInsert";

// Math registry (§16.2). Data only — never UI. Adding a symbol/template is
// adding one entry to a group; the toolbar (Phase 5) renders whatever is here.
// Symbol items are leaf tokens; template items reference the Template Registry
// (§16.3) via `templateId`.

const basicSymbol = (id, label, latex, keywords = []) => ({
  type: SYMBOL,
  id,
  label,
  latex,
  keywords: [label, ...keywords],
});

const basicTemplate = (id, templateId, label, keywords = []) => ({
  type: TEMPLATE,
  id,
  templateId,
  label,
  keywords: [label, ...keywords],
});

export const MATH_GROUPS = [
  {
    id: "basic",
    label: "Basic",
    items: [
      basicSymbol("plus", "+", "+", ["add", "addition"]),
      basicSymbol("minus", "−", "-", ["minus", "subtract"]),
      basicSymbol("times", "×", "\\times", ["multiply"]),
      basicSymbol("divide", "÷", "\\div", ["division"]),
      basicSymbol("equals", "=", "=", ["equal"]),
      basicSymbol("notEqual", "≠", "\\neq", ["not", "equal", "ne"]),
      basicSymbol("lessThan", "<", "<", ["less"]),
      basicSymbol("greaterThan", ">", ">", ["greater"]),
      basicSymbol("lessEq", "≤", "\\leq", ["less", "le", "equal"]),
      basicSymbol("greaterEq", "≥", "\\geq", ["greater", "ge", "equal"]),
      basicSymbol("pm", "±", "\\pm", ["plus", "minus"]),
      basicSymbol("approx", "≈", "\\approx", ["approx", "approximately"]),
    ],
  },
  {
    id: "braces",
    label: "Braces",
    items: [
      basicSymbol("lbrace", "{", "\\{", ["brace", "set", "literal", "braces"]),
      basicSymbol("rbrace", "}", "\\}", ["brace", "set", "literal", "braces"]),
      basicSymbol(
        "set",
        "{·}",
        "\\{a, b\\}",
        ["set", "braces", "literal", "collection"],
      ),
    ],
  },
  {
    id: "greek",
    label: "Greek",
    items: [
      basicSymbol("alpha", "α", "\\alpha", ["alpha"]),
      basicSymbol("beta", "β", "\\beta", ["beta"]),
      basicSymbol("gamma", "γ", "\\gamma", ["gamma"]),
      basicSymbol("pi", "π", "\\pi", ["pi"]),
      basicSymbol("theta", "θ", "\\theta", ["theta"]),
      basicSymbol("delta", "δ", "\\delta", ["delta"]),
      basicSymbol("sigma", "σ", "\\sigma", ["sigma"]),
      basicSymbol("omega", "ω", "\\omega", ["omega"]),
      basicSymbol("infinity", "∞", "\\infty", ["infinity"]),
    ],
  },
  {
    id: "fractions",
    label: "Fractions",
    items: [
      basicTemplate("frac", "fraction", "Fraction", ["fraction", "frac", "divide"]),
    ],
  },
  {
    id: "roots",
    label: "Roots",
    items: [
      basicTemplate("sqrt", "sqrt", "Square root", ["root", "square", "radical"]),
      basicTemplate("nroot", "nroot", "n-th root", ["root", "radical", "nth"]),
    ],
  },
  {
    id: "calculus",
    label: "Calculus",
    items: [
      basicTemplate("integral", "integral", "Integral", ["integral", "integrate", "calculus"]),
      basicTemplate("sum", "sum", "Sum", ["sum", "sigma", "series"]),
    ],
  },
  {
    id: "templates",
    label: "Templates",
    items: [
      basicTemplate("quadratic", "quadratic", "Quadratic formula", ["quadratic", "formula", "roots"]),
      basicTemplate("binomial", "binomial", "Binomial", ["binomial", "choose", "combination"]),
    ],
  },
];

export const flattenSymbols = (groups) => groups.flatMap((group) => group.items);