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
  let text = "";
  let cursor = 0;

  for (const match of String(template).matchAll(MARKER)) {
    text += String(template).slice(cursor, match.index);
    cursor = match.index + match[0].length;

    const index = Number(match[1]);
    const value = valueMap[String(index)];

    const from = text.length;

    if (value == null) {
      text += match[0];
    } else {
      text += resolveAll(value, valueMap);
    }

    const to = text.length;

    placeholders.push({
      index,
      from,
      to,
    });
  }

  text += String(template).slice(cursor);

  return {
    text,
    placeholders,
  };
};

const centerOf = (placeholder) =>
  placeholder ? Math.floor((placeholder.from + placeholder.to) / 2) : null;

export const placeholderResolve = (template, values = [], cursorAt = 0) => {
  const { text, placeholders } = build(template, values);

  const target =
    placeholders.find((placeholder) => placeholder.index === cursorAt) ??
    placeholders[0] ??
    null;

  return {
    text,
    cursor: target ? centerOf(target) : text.length,
    placeholders,
  };
};

export const insertTemplate = placeholderResolve;

export const navigatePlaceholder = (
  placeholders = [],
  current = 0,
  direction = "next",
) => {
  if (!placeholders.length) return null;

  const sorted = [...placeholders].sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    return a.to - b.to;
  });

  const currentIndex = sorted.findIndex(
    (placeholder) => current >= placeholder.from && current <= placeholder.to,
  );

  if (currentIndex === -1) {
    if (direction === "prev") {
      const previous = [...sorted]
        .reverse()
        .find((placeholder) => placeholder.to < current);

      return previous
        ? centerOf(previous)
        : centerOf(sorted[sorted.length - 1]);
    }

    const next = sorted.find((placeholder) => placeholder.from > current);

    return next ? centerOf(next) : centerOf(sorted[0]);
  }

  if (direction === "prev") {
    if (currentIndex === 0) return centerOf(sorted[sorted.length - 1]);

    return centerOf(sorted[currentIndex - 1]);
  }

  if (currentIndex === sorted.length - 1) {
    return centerOf(sorted[0]);
  }

  return centerOf(sorted[currentIndex + 1]);
};

export const offsetPlaceholders = (
  placeholders = [],
  prevLatex = "",
  nextLatex = "",
  caret = 0,
) => {
  if (!placeholders.length) return [];

  const delta = String(nextLatex).length - String(prevLatex).length;
  const nextLength = String(nextLatex).length;

  return placeholders
    .map((placeholder) => {
      if (caret < placeholder.from) {
        return {
          ...placeholder,
          from: placeholder.from + delta,
          to: placeholder.to + delta,
        };
      }

      if (caret > placeholder.to) {
        return { ...placeholder };
      }

      return {
        ...placeholder,
        to: Math.max(
          placeholder.from,
          Math.min(placeholder.to + delta, nextLength),
        ),
      };
    })
    .filter(
      (placeholder) =>
        placeholder.from >= 0 &&
        placeholder.from <= nextLength &&
        placeholder.to >= placeholder.from,
    );
};

const findMatchingClosing = (text, start, openChar = "{", closeChar = "}") => {
  let depth = 0;

  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) {
      depth++;
    } else if (text[i] === closeChar) {
      depth--;

      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
};

export const detectPlaceholders = (latex, baseOffset = 0) => {
  if (!latex) return [];

  const results = [];
  let i = 0;

  while (i < latex.length) {
    if (latex.startsWith("\\frac{", i)) {
      const numeratorOpen = i + 5;
      const numeratorClose = findMatchingClosing(latex, numeratorOpen);

      if (numeratorClose !== -1 && latex[numeratorClose + 1] === "{") {
        const denominatorOpen = numeratorClose + 1;
        const denominatorClose = findMatchingClosing(latex, denominatorOpen);

        if (denominatorClose !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(numeratorOpen + 1, numeratorClose),
              baseOffset + numeratorOpen + 1,
            ),
          );

          results.push(
            ...detectPlaceholders(
              latex.slice(denominatorOpen + 1, denominatorClose),
              baseOffset + denominatorOpen + 1,
            ),
          );

          i = denominatorClose + 1;
          continue;
        }
      }
    }

    if (latex.startsWith("\\sqrt[", i)) {
      const indexOpen = i + 5;
      const indexClose = findMatchingClosing(latex, indexOpen, "[", "]");

      if (indexClose !== -1 && latex[indexClose + 1] === "{") {
        const radicandOpen = indexClose + 1;
        const radicandClose = findMatchingClosing(latex, radicandOpen);

        if (radicandClose !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(indexOpen + 1, indexClose),
              baseOffset + indexOpen + 1,
            ),
          );

          results.push(
            ...detectPlaceholders(
              latex.slice(radicandOpen + 1, radicandClose),
              baseOffset + radicandOpen + 1,
            ),
          );

          i = radicandClose + 1;
          continue;
        }
      }
    }

    if (latex.startsWith("\\sqrt{", i)) {
      const radicandOpen = i + 5;
      const radicandClose = findMatchingClosing(latex, radicandOpen);

      if (radicandClose !== -1) {
        results.push(
          ...detectPlaceholders(
            latex.slice(radicandOpen + 1, radicandClose),
            baseOffset + radicandOpen + 1,
          ),
        );

        i = radicandClose + 1;
        continue;
      }
    }

    if (latex.startsWith("\\int_{", i)) {
      const lowerOpen = i + 5;
      const lowerClose = findMatchingClosing(latex, lowerOpen);

      if (lowerClose !== -1 && latex.startsWith("^{", lowerClose + 1)) {
        const upperOpen = lowerClose + 2;
        const upperClose = findMatchingClosing(latex, upperOpen);

        if (upperClose !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(lowerOpen + 1, lowerClose),
              baseOffset + lowerOpen + 1,
            ),
          );

          results.push(
            ...detectPlaceholders(
              latex.slice(upperOpen + 1, upperClose),
              baseOffset + upperOpen + 1,
            ),
          );

          i = upperClose + 1;
          continue;
        }
      }
    }

    if (latex.startsWith("\\sum_{", i)) {
      const lowerOpen = i + 5;
      const lowerClose = findMatchingClosing(latex, lowerOpen);

      if (lowerClose !== -1 && latex.startsWith("^{", lowerClose + 1)) {
        const upperOpen = lowerClose + 2;
        const upperClose = findMatchingClosing(latex, upperOpen);

        if (upperClose !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(lowerOpen + 1, lowerClose),
              baseOffset + lowerOpen + 1,
            ),
          );

          results.push(
            ...detectPlaceholders(
              latex.slice(upperOpen + 1, upperClose),
              baseOffset + upperOpen + 1,
            ),
          );

          i = upperClose + 1;
          continue;
        }
      }
    }

    if (latex.startsWith("\\binom{", i)) {
      const firstOpen = i + 7;
      const firstClose = findMatchingClosing(latex, firstOpen);

      if (firstClose !== -1 && latex[firstClose + 1] === "{") {
        const secondOpen = firstClose + 1;
        const secondClose = findMatchingClosing(latex, secondOpen);

        if (secondClose !== -1) {
          results.push(
            ...detectPlaceholders(
              latex.slice(firstOpen + 1, firstClose),
              baseOffset + firstOpen + 1,
            ),
          );

          results.push(
            ...detectPlaceholders(
              latex.slice(secondOpen + 1, secondClose),
              baseOffset + secondOpen + 1,
            ),
          );

          i = secondClose + 1;
          continue;
        }
      }
    }

    i++;
  }

  return results.sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    return a.to - b.to;
  });
};
