// mathPlaceholder.js — pure Placeholder/Cursor engine (§16.4, Layer A).
// Transport-level only: string algebra over placeholder markers and caret
// offsets. No React, no LaTeX knowledge. It maps a template + set of values ->
// (resolved text, caret position, placeholder map for Tab navigation).

const MARKER = /!(\d+)/g;

// Recursively dereference nested `!{n}` markers in `text` using `valueMap`
// (an object keyed by placeholder index). Unknown markers are left as-is.
export const resolveAll = (text, valueMap = {}) =>
  String(text).replace(MARKER, (marker, key) => {
    const value = valueMap[key];
    return value == null ? marker : resolveAll(value, valueMap);
  });

const build = (template, values) => {
  const valueMap = Object.fromEntries(
    (values ?? []).map((value, index) => [String(index), value]),
  );

  const placeholders = [];
  let out = "";
  let cursor = 0;
  for (const match of template.matchAll(MARKER)) {
    out += template.slice(cursor, match.index);
    cursor = match.index + match[0].length;

    const key = match[1];
    const resolved =
      valueMap[key] == null ? match[0] : resolveAll(valueMap[key], valueMap);

    const from = out.length;
    out += resolved;
    placeholders.push({ index: Number(key), from, to: out.length });
  }
  out += template.slice(cursor);

  return { text: out, placeholders };
};

const centerOf = (placeholder) =>
  placeholder ? Math.floor((placeholder.from + placeholder.to) / 2) : null;

// Core solve: returns `{ text, cursor, placeholders }`.
// - `cursor` is the collapsed caret offset (center of the `cursorAt` placeholder).
// - `placeholders` is `[{ index, from, to }]` over the resolved text (Tab walk).
export const placeholderResolve = (template, values = [], cursorAt = 0) => {
  const { text, placeholders } = build(template, values);
  const target = placeholders.find((p) => p.index === cursorAt) ?? placeholders[0] ?? null;
  return { text, cursor: target ? centerOf(target) : text.length, placeholders };
};

// Alias kept for the §16.4 generic insertion API name.
export const insertTemplate = placeholderResolve;

// Tab/Shift+Tab step to the next/previous placeholder center (wraps around).
// Returns a collapsed caret offset, or null when there are no placeholders.
export const navigatePlaceholder = (placeholders = [], current, direction = "next") => {
  if (!placeholders.length) return null;
  const centers = placeholders
    .map((p) => ({ index: p.index, center: centerOf(p) }))
    .sort((a, b) => a.center - b.center);

  const compare = direction === "prev" ? (c) => c.center < current : (c) => c.center > current;
  return (centers.find(compare) ?? centers[0]).center;
};

// Keep a placeholder map accurate while the user types inside the source.
// `caret` is the caret position **before** the edit that changed
// `prevLatex` into `nextLatex`. Slots before the caret keep their offsets,
// slots after it shift by the length delta, and the slot the caret is inside
// grows/shrinks by the delta (so typing in an empty numerator widens that slot).
export const offsetPlaceholders = (placeholders = [], prevLatex = "", nextLatex = "", caret = 0) => {
  if (!placeholders.length) return placeholders;

  const delta = nextLatex.length - prevLatex.length;
  const shift = (pos) => Math.max(0, pos + delta);

  return placeholders.map((p) => {
    if (caret > p.to) return p;
    if (caret < p.from) return { index: p.index, from: shift(p.from), to: shift(p.to) };
    return { index: p.index, from: p.from, to: Math.max(p.from, p.to + delta) };
  });
};

const findMatchingClosing = (str, start, openChar = "{", closeChar = "}") => {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === openChar) depth++;
    else if (str[i] === closeChar) {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
};

export const detectPlaceholders = (latex) => {
  if (!latex) return [];

  // 1. Fraction: \frac{A}{B}
  if (latex.startsWith("\\frac{")) {
    const open1 = 5;
    const close1 = findMatchingClosing(latex, open1, "{", "}");
    if (close1 !== -1 && latex[close1 + 1] === "{") {
      const open2 = close1 + 1;
      const close2 = findMatchingClosing(latex, open2, "{", "}");
      if (close2 !== -1) {
        return [
          { index: 0, from: open1 + 1, to: close1 },
          { index: 1, from: open2 + 1, to: close2 },
        ];
      }
    }
  }

  // 2. n-th root: \sqrt[A]{B}
  if (latex.startsWith("\\sqrt[")) {
    const open1 = 5;
    const close1 = findMatchingClosing(latex, open1, "[", "]");
    if (close1 !== -1 && latex[close1 + 1] === "{") {
      const open2 = close1 + 1;
      const close2 = findMatchingClosing(latex, open2, "{", "}");
      if (close2 !== -1) {
        return [
          { index: 0, from: open1 + 1, to: close1 },
          { index: 1, from: open2 + 1, to: close2 },
        ];
      }
    }
  }

  // 3. Square root: \sqrt{A}
  if (latex.startsWith("\\sqrt{")) {
    const open1 = 5;
    const close1 = findMatchingClosing(latex, open1, "{", "}");
    if (close1 !== -1 && close1 === latex.length - 1) {
      return [{ index: 0, from: open1 + 1, to: close1 }];
    }
  }

  // 4. Integral: \int_{A}^{B} C
  if (latex.startsWith("\\int_{")) {
    const open1 = 5;
    const close1 = findMatchingClosing(latex, open1, "{", "}");
    if (close1 !== -1 && latex.startsWith("^{", close1 + 1)) {
      const open2 = close1 + 2;
      const close2 = findMatchingClosing(latex, open2, "{", "}");
      if (close2 !== -1) {
        let cStart = close2 + 1;
        if (latex[cStart] === " ") cStart++;
        return [
          { index: 0, from: open1 + 1, to: close1 },
          { index: 1, from: open2 + 1, to: close2 },
          { index: 2, from: cStart, to: latex.length },
        ];
      }
    }
  }

  // 5. Sum: \sum_{A}^{B} C
  if (latex.startsWith("\\sum_{")) {
    const open1 = 5;
    const close1 = findMatchingClosing(latex, open1, "{", "}");
    if (close1 !== -1 && latex.startsWith("^{", close1 + 1)) {
      const open2 = close1 + 2;
      const close2 = findMatchingClosing(latex, open2, "{", "}");
      if (close2 !== -1) {
        let cStart = close2 + 1;
        if (latex[cStart] === " ") cStart++;
        return [
          { index: 0, from: open1 + 1, to: close1 },
          { index: 1, from: open2 + 1, to: close2 },
          { index: 2, from: cStart, to: latex.length },
        ];
      }
    }
  }

  // 6. Binomial: \binom{A}{B}
  if (latex.startsWith("\\binom{")) {
    const open1 = 6;
    const close1 = findMatchingClosing(latex, open1, "{", "}");
    if (close1 !== -1 && latex[close1 + 1] === "{") {
      const open2 = close1 + 1;
      const close2 = findMatchingClosing(latex, open2, "{", "}");
      if (close2 !== -1) {
        return [
          { index: 0, from: open1 + 1, to: close1 },
          { index: 1, from: open2 + 1, to: close2 },
        ];
      }
    }
  }

  return [];
};