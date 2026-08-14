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
    id: "parentheses",
    label: "Parentheses",
    items: [
      basicSymbol("lparen", "(", "(", ["parenthesis", "paren", "left", "open"]),
      basicSymbol("rparen", ")", ")", ["parenthesis", "paren", "right", "close"]),
      basicSymbol("lbracket", "[", "[", ["bracket", "left", "open"]),
      basicSymbol("rbracket", "]", "]", ["bracket", "right", "close"]),
      basicSymbol("lbrace", "{", "\\{", ["brace", "set", "literal", "braces", "left", "open"]),
      basicSymbol("rbrace", "}", "\\}", ["brace", "set", "literal", "braces", "right", "close"]),
      basicSymbol("vertical", "|", "|", ["vertical", "bar", "absolute", "norm"]),
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
      basicSymbol("lambda", "λ", "\\lambda", ["lambda"]),
      basicSymbol("mu", "μ", "\\mu", ["mu"]),
      basicSymbol("phi", "φ", "\\phi", ["phi"]),
      basicSymbol("Delta", "Δ", "\\Delta", ["Delta", "capital delta"]),
      basicSymbol("Omega", "Ω", "\\Omega", ["Omega", "capital omega"]),
    ],
  },
  {
    id: "powers",
    label: "Powers",
    items: [
      basicTemplate("square", "square", "x²", ["square", "power", "exponent", "squared"]),
      basicTemplate("cube", "cube", "x³", ["cube", "power", "exponent", "cubed"]),
      basicTemplate("superscript", "superscript", "xⁿ", ["superscript", "power", "exponent"]),
    ],
  },
  {
    id: "subscripts",
    label: "Subscripts",
    items: [
      basicTemplate("subscript", "subscript", "x₁", ["subscript", "index", "sub"]),
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
  {
    id: "misc",
    label: "Miscellaneous",
    items: [
      basicSymbol("degree", "°", "^\\circ", ["degree", "angle", "temperature"]),
      basicSymbol("percent", "%", "\\%", ["percent", "percentage"]),
    ],
  },
];

export const flattenSymbols = (groups) => groups.flatMap((group) => group.items);