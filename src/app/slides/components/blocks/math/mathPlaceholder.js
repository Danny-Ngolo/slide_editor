// mathPlaceholder.js — pure Placeholder/Cursor engine supporting sequential & nested expressions.

const MARKER = /!(\d+)/g;

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

export const placeholderResolve = (template, values = [], cursorAt = 0) => {
  const { text, placeholders } = build(template, values);
  const target =
    placeholders.find((p) => p.index === cursorAt) ?? placeholders[0] ?? null;
  return {
    text,
    cursor: target ? centerOf(target) : text.length,
    placeholders,
  };
};

export const insertTemplate = placeholderResolve;

export const navigatePlaceholder = (
  placeholders = [],
  current,
  direction = "next",
) => {
  if (!placeholders.length) return null;
  const sorted = [...placeholders].sort((a, b) => a.from - b.from);
  const currentIndex = sorted.findIndex(
    (p) => current >= p.from && current <= p.to,
  );

  let targetIndex;
  if (currentIndex === -1) {
    let closestIdx = 0;
    let minDst = Infinity;
    sorted.forEach((p, idx) => {
      const dst = Math.abs(centerOf(p) - current);
      if (dst < minDst) {
        minDst = dst;
        closestIdx = idx;
      }
    });
    targetIndex = closestIdx;
  } else if (direction === "prev") {
    targetIndex = (currentIndex - 1 + sorted.length) % sorted.length;
  } else {
    targetIndex = (currentIndex + 1) % sorted.length;
  }

  return centerOf(sorted[targetIndex]);
};

export const offsetPlaceholders = (
  placeholders = [],
  prevLatex = "",
  nextLatex = "",
  caret = 0,
) => {
  if (!placeholders.length) return placeholders;

  const delta = nextLatex.length - prevLatex.length;
  const maxLen = nextLatex.length;
  const clamp = (pos) => Math.max(0, Math.min(pos + delta, maxLen));
  const clampPos = (pos) => Math.max(0, Math.min(pos, maxLen));

  return placeholders.map((p) => {
    if (caret > p.to) return p;
    if (caret < p.from) {
      return {
        index: p.index,
        from: clamp(p.from),
        to: clamp(p.to),
      };
    }
    return {
      index: p.index,
      from: clampPos(p.from),
      to: Math.max(p.from, clamp(p.to, maxLen)),
    };
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

// Sequential scanner supporting concatenated and nested LaTeX macro structures
export const detectPlaceholders = (latex, baseOffset = 0) => {
  if (!latex) return [];
  let results = [];

  let i = 0;
  while (i < latex.length) {
    // 1. Fraction: \frac{A}{B}
    if (latex.slice(i).startsWith("\\frac{")) {
      const open1 = i + 5;
      const close1 = findMatchingClosing(latex, open1, "{", "}");
      if (close1 !== -1 && latex[close1 + 1] === "{") {
        const open2 = close1 + 1;
        const close2 = findMatchingClosing(latex, open2, "{", "}");
        if (close2 !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(open1 + 1, close1),
              baseOffset + open1 + 1,
            ),
          );
          results.push(
            ...detectPlaceholders(
              latex.slice(open2 + 1, close2),
              baseOffset + open2 + 1,
            ),
          );
          i = close2 + 1;
          continue;
        }
      }
    }

    // 2. n-th root: \sqrt[A]{B}
    if (latex.slice(i).startsWith("\\sqrt[")) {
      const open1 = i + 5;
      const close1 = findMatchingClosing(latex, open1, "[", "]");
      if (close1 !== -1 && latex[close1 + 1] === "{") {
        const open2 = close1 + 1;
        const close2 = findMatchingClosing(latex, open2, "{", "}");
        if (close2 !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(open1 + 1, close1),
              baseOffset + open1 + 1,
            ),
          );
          results.push(
            ...detectPlaceholders(
              latex.slice(open2 + 1, close2),
              baseOffset + open2 + 1,
            ),
          );
          i = close2 + 1;
          continue;
        }
      }
    }

    // 3. Square root: \sqrt{A}
    if (latex.slice(i).startsWith("\\sqrt{")) {
      const open1 = i + 5;
      const close1 = findMatchingClosing(latex, open1, "{", "}");
      if (close1 !== -1) {
        results.push(
          ...detectPlaceholders(
            latex.slice(open1 + 1, close1),
            baseOffset + open1 + 1,
          ),
        );
        i = close1 + 1;
        continue;
      }
    }

    // 4. Integral: \int_{A}^{B}
    if (latex.slice(i).startsWith("\\int_{")) {
      const open1 = i + 5;
      const close1 = findMatchingClosing(latex, open1, "{", "}");
      if (close1 !== -1 && latex.startsWith("^{", close1 + 1)) {
        const open2 = close1 + 2;
        const close2 = findMatchingClosing(latex, open2, "{", "}");
        if (close2 !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(open1 + 1, close1),
              baseOffset + open1 + 1,
            ),
          );
          results.push(
            ...detectPlaceholders(
              latex.slice(open2 + 1, close2),
              baseOffset + open2 + 1,
            ),
          );
          i = close2 + 1;
          continue;
        }
      }
    }

    // 5. Sum: \sum_{A}^{B}
    if (latex.slice(i).startsWith("\\sum_{")) {
      const open1 = i + 5;
      const close1 = findMatchingClosing(latex, open1, "{", "}");
      if (close1 !== -1 && latex.startsWith("^{", close1 + 1)) {
        const open2 = close1 + 2;
        const close2 = findMatchingClosing(latex, open2, "{", "}");
        if (close2 !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(open1 + 1, close1),
              baseOffset + open1 + 1,
            ),
          );
          results.push(
            ...detectPlaceholders(
              latex.slice(open2 + 1, close2),
              baseOffset + open2 + 1,
            ),
          );
          i = close2 + 1;
          continue;
        }
      }
    }

    // 6. Binomial: \binom{A}{B}
    if (latex.slice(i).startsWith("\\binom{")) {
      const open1 = i + 6;
      const close1 = findMatchingClosing(latex, open1, "{", "}");
      if (close1 !== -1 && latex[close1 + 1] === "{") {
        const open2 = close1 + 1;
        const close2 = findMatchingClosing(latex, open2, "{", "}");
        if (close2 !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(open1 + 1, close1),
              baseOffset + open1 + 1,
            ),
          );
          results.push(
            ...detectPlaceholders(
              latex.slice(open2 + 1, close2),
              baseOffset + open2 + 1,
            ),
          );
          i = close2 + 1;
          continue;
        }
      }
    }

    // Raw marker scan
    if (latex[i] === "!" && i + 1 < latex.length && /\d/.test(latex[i + 1])) {
      const match = latex.slice(i).match(/^!(\d+)/);
      if (match) {
        results.push({
          index: 0,
          from: baseOffset + i,
          to: baseOffset + i + match[0].length,
        });
        i += match[0].length;
        continue;
      }
    }

    i++;
  }

  return results
    .sort((a, b) => a.from - b.from)
    .map((p, idx) => ({ ...p, index: idx }));
};
