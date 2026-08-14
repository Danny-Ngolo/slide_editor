const MARKER = /!(\d+)/g;

export const resolveAll = (text, valueMap = {}) =>
  String(text).replace(MARKER, (marker, key) => {
    const value = valueMap[key];

    return value == null ? marker : resolveAll(value, valueMap);
  });

const build = (template, values = []) => {
  const valueMap = Object.fromEntries(
    values.map((value, index) => [String(index), value]),
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
      text += "";
    } else {
      text += resolveAll(value, valueMap);
    }

    placeholders.push({
      index,
      from,
      to: text.length,
    });
  }

  text += String(template).slice(cursor);

  return {
    text,
    placeholders,
  };
};

const endOf = (placeholder) => (placeholder ? placeholder.to : null);

export const placeholderResolve = (template, values = [], cursorAt = 0) => {
  const { text, placeholders } = build(template, values);

  const target =
    placeholders.find((placeholder) => placeholder.index === cursorAt) ??
    placeholders[0] ??
    null;

  return {
    text,
    cursor: target ? endOf(target) : text.length,
    placeholders,
  };
};

export const insertTemplate = placeholderResolve;

const findMatchingClosing = (text, start, openChar = "{", closeChar = "}") => {
  let depth = 0;

  for (let index = start; index < text.length; index++) {
    if (text[index] === "\\") {
      index++;
      continue;
    }

    if (text[index] === openChar) {
      depth++;
      continue;
    }

    if (text[index] === closeChar) {
      depth--;

      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};

const parseTemplateRanges = (latex, start = 0, end = latex.length) => {
  const templates = [];
  let index = start;

  while (index < end) {
    /*
     * \frac{A}{B}
     */
    if (latex.startsWith("\\frac{", index)) {
      const firstOpen = index + 5;
      const firstClose = findMatchingClosing(latex, firstOpen);

      if (
        firstClose !== -1 &&
        firstClose < end &&
        latex[firstClose + 1] === "{"
      ) {
        const secondOpen = firstClose + 1;

        const secondClose = findMatchingClosing(latex, secondOpen);

        if (secondClose !== -1 && secondClose < end) {
          const firstFrom = firstOpen + 1;

          const firstTo = firstClose;

          const secondFrom = secondOpen + 1;

          const secondTo = secondClose;

          const children = [
            ...parseTemplateRanges(latex, firstFrom, firstTo),
            ...parseTemplateRanges(latex, secondFrom, secondTo),
          ];

          const template = {
            type: "fraction",
            from: index,
            to: secondClose + 1,
            slots: [
              {
                from: firstFrom,
                to: firstTo,
              },
              {
                from: secondFrom,
                to: secondTo,
              },
            ],
            children,
          };

          templates.push(template);

          index = secondClose + 1;
          continue;
        }
      }
    }

    /*
     * \sqrt[A]{B}
     */
    if (latex.startsWith("\\sqrt[", index)) {
      const indexOpen = index + 5;

      const indexClose = findMatchingClosing(latex, indexOpen, "[", "]");

      if (
        indexClose !== -1 &&
        indexClose < end &&
        latex[indexClose + 1] === "{"
      ) {
        const bodyOpen = indexClose + 1;

        const bodyClose = findMatchingClosing(latex, bodyOpen);

        if (bodyClose !== -1 && bodyClose < end) {
          const indexFrom = indexOpen + 1;

          const indexTo = indexClose;

          const bodyFrom = bodyOpen + 1;

          const bodyTo = bodyClose;

          const children = [
            ...parseTemplateRanges(latex, indexFrom, indexTo),
            ...parseTemplateRanges(latex, bodyFrom, bodyTo),
          ];

          templates.push({
            type: "nroot",
            from: index,
            to: bodyClose + 1,
            slots: [
              {
                from: indexFrom,
                to: indexTo,
              },
              {
                from: bodyFrom,
                to: bodyTo,
              },
            ],
            children,
          });

          index = bodyClose + 1;
          continue;
        }
      }
    }

    /*
     * \sqrt{A}
     */
    if (latex.startsWith("\\sqrt{", index)) {
      const bodyOpen = index + 5;

      const bodyClose = findMatchingClosing(latex, bodyOpen);

      if (bodyClose !== -1 && bodyClose < end) {
        const bodyFrom = bodyOpen + 1;

        const bodyTo = bodyClose;

        const children = parseTemplateRanges(latex, bodyFrom, bodyTo);

        templates.push({
          type: "sqrt",
          from: index,
          to: bodyClose + 1,
          slots: [
            {
              from: bodyFrom,
              to: bodyTo,
            },
          ],
          children,
        });

        index = bodyClose + 1;
        continue;
      }
    }

    /*
     * \int_{A}^{B} C
     *
     * The integral body is the remainder of
     * this math expression.
     */
    if (latex.startsWith("\\int_{", index)) {
      const lowerOpen = index + 5;
      const lowerClose = findMatchingClosing(latex, lowerOpen);

      if (lowerClose !== -1 && latex.startsWith("^{", lowerClose + 1)) {
        const upperOpen = lowerClose + 2;
        const upperClose = findMatchingClosing(latex, upperOpen);

        if (upperClose !== -1 && upperClose < end) {
          const lowerFrom = lowerOpen + 1;
          const lowerTo = lowerClose;

          const upperFrom = upperOpen + 1;
          const upperTo = upperClose;

          // The template contains a literal space before !2:
          // \int_{!0}^{!1} !2
          const bodyFrom =
            latex[upperClose + 1] === " " ? upperClose + 2 : upperClose + 1;

          const bodyTo = end;

          const children = [
            ...parseTemplateRanges(latex, lowerFrom, lowerTo),
            ...parseTemplateRanges(latex, upperFrom, upperTo),
            ...parseTemplateRanges(latex, bodyFrom, bodyTo),
          ];

          templates.push({
            type: "integral",
            from: index,
            to: bodyTo,
            slots: [
              {
                from: lowerFrom,
                to: lowerTo,
              },
              {
                from: upperFrom,
                to: upperTo,
              },
              {
                from: bodyFrom,
                to: bodyTo,
              },
            ],
            children,
          });

          index = bodyTo;
          continue;
        }
      }
    }

    /*
     * \sum_{A}^{B} C
     */
    // \sum_{A}^{B} C
    if (latex.startsWith("\\sum_{", index)) {
      const lowerOpen = index + 5;
      const lowerClose = findMatchingClosing(latex, lowerOpen);

      if (lowerClose !== -1 && latex.startsWith("^{", lowerClose + 1)) {
        const upperOpen = lowerClose + 2;
        const upperClose = findMatchingClosing(latex, upperOpen);

        if (upperClose !== -1 && upperClose < end) {
          const lowerFrom = lowerOpen + 1;
          const lowerTo = lowerClose;

          const upperFrom = upperOpen + 1;
          const upperTo = upperClose;

          // The template contains a literal space before !2:
          // \sum_{!0}^{!1} !2
          const bodyFrom =
            latex[upperClose + 1] === " " ? upperClose + 2 : upperClose + 1;

          const bodyTo = end;

          const children = [
            ...parseTemplateRanges(latex, lowerFrom, lowerTo),
            ...parseTemplateRanges(latex, upperFrom, upperTo),
            ...parseTemplateRanges(latex, bodyFrom, bodyTo),
          ];

          templates.push({
            type: "sum",
            from: index,
            to: bodyTo,
            slots: [
              {
                from: lowerFrom,
                to: lowerTo,
              },
              {
                from: upperFrom,
                to: upperTo,
              },
              {
                from: bodyFrom,
                to: bodyTo,
              },
            ],
            children,
          });

          index = bodyTo;
          continue;
        }
      }
    }

    /*
     * \binom{A}{B}
     */
    if (latex.startsWith("\\binom{", index)) {
      const firstOpen = index + 6;

      const firstClose = findMatchingClosing(latex, firstOpen);

      if (
        firstClose !== -1 &&
        firstClose < end &&
        latex[firstClose + 1] === "{"
      ) {
        const secondOpen = firstClose + 1;

        const secondClose = findMatchingClosing(latex, secondOpen);

        if (secondClose !== -1 && secondClose < end) {
          const firstFrom = firstOpen + 1;

          const firstTo = firstClose;

          const secondFrom = secondOpen + 1;

          const secondTo = secondClose;

          const children = [
            ...parseTemplateRanges(latex, firstFrom, firstTo),
            ...parseTemplateRanges(latex, secondFrom, secondTo),
          ];

          templates.push({
            type: "binomial",
            from: index,
            to: secondClose + 1,
            slots: [
              {
                from: firstFrom,
                to: firstTo,
              },
              {
                from: secondFrom,
                to: secondTo,
              },
            ],
            children,
          });

          index = secondClose + 1;
          continue;
        }
      }
    }

    /*
     * x^{A} - Superscript
     */
    // Look for pattern: something^{something}
    if (index < latex.length - 2 && latex[index] === "^" && latex[index + 1] === "{") {
      const superscriptOpen = index + 1; // Position of {
      const superscriptClose = findMatchingClosing(latex, superscriptOpen);
      
      if (superscriptClose !== -1 && superscriptClose < end) {
        // Find the base (character before ^)
        const baseStart = Math.max(0, index - 1);
        const baseFrom = baseStart;
        const baseTo = index; // Up to but not including ^
        
        const superscriptFrom = superscriptOpen + 1;
        const superscriptTo = superscriptClose;
        
        const children = [
          ...parseTemplateRanges(latex, baseFrom, baseTo),
          ...parseTemplateRanges(latex, superscriptFrom, superscriptTo),
        ];
        
        templates.push({
          type: "superscript",
          from: baseFrom,
          to: superscriptClose + 1,
          slots: [
            {
              from: baseFrom,
              to: baseTo,
            },
            {
              from: superscriptFrom,
              to: superscriptTo,
            },
          ],
          children,
        });
        
        index = superscriptClose + 1;
        continue;
      }
    }

    /*
     * x_{A} - Subscript
     */
    // Look for pattern: something_{something}
    if (index < latex.length - 2 && latex[index] === "_" && latex[index + 1] === "{") {
      const subscriptOpen = index + 1; // Position of {
      const subscriptClose = findMatchingClosing(latex, subscriptOpen);
      
      if (subscriptClose !== -1 && subscriptClose < end) {
        // Find the base (character before _)
        const baseStart = Math.max(0, index - 1);
        const baseFrom = baseStart;
        const baseTo = index; // Up to but not including _
        
        const subscriptFrom = subscriptOpen + 1;
        const subscriptTo = subscriptClose;
        
        const children = [
          ...parseTemplateRanges(latex, baseFrom, baseTo),
          ...parseTemplateRanges(latex, subscriptFrom, subscriptTo),
        ];
        
        templates.push({
          type: "subscript",
          from: baseFrom,
          to: subscriptClose + 1,
          slots: [
            {
              from: baseFrom,
              to: baseTo,
            },
            {
              from: subscriptFrom,
              to: subscriptTo,
            },
          ],
          children,
        });
        
        index = subscriptClose + 1;
        continue;
      }
    }

    // Quadratic formula
    if (latex.startsWith("x = \\frac{", index)) {
      const fractionOpen = index + 9;
      const numeratorClose = findMatchingClosing(latex, fractionOpen);

      if (numeratorClose !== -1 && latex[numeratorClose + 1] === "{") {
        const denominatorOpen = numeratorClose + 1;
        const denominatorClose = findMatchingClosing(latex, denominatorOpen);

        if (denominatorClose !== -1 && denominatorClose < end) {
          const numeratorFrom = fractionOpen + 1;
          const numeratorTo = numeratorClose;

          const denominatorFrom = denominatorOpen + 1;
          const denominatorTo = denominatorClose;

          templates.push({
            type: "quadratic",
            from: index,
            to: denominatorClose + 1,
            slots: [
              {
                // x
                from: index,
                to: index + 1,
              },
              {
                // -b \pm \sqrt{...}
                from: numeratorFrom,
                to: numeratorTo,
              },
              {
                // 2a
                from: denominatorFrom,
                to: denominatorTo,
              },
            ],
            // Flattened: the numerator is a single reachable slot. The nested
            // \sqrt inside it is plain user text (Option A).
            children: [],
          });

          index = denominatorClose + 1;
          continue;
        }
      }
    }

    index++;
  }

  return templates;
};

const flattenTemplates = (templates) => {
  const result = [];

  const visit = (template) => {
    result.push(template);

    template.children.forEach(visit);
  };

  templates.forEach(visit);

  return result;
};

const collectLeafPlaceholders = (template, result) => {
  template.slots.forEach((slot) => {
    const children = template.children.filter(
      (child) => child.from >= slot.from && child.to <= slot.to,
    );

    if (children.length === 0) {
      result.push({
        from: slot.from,
        to: slot.to,
      });

      return;
    }

    children.forEach((child) => collectLeafPlaceholders(child, result));
  });
};

export const analyzeLatex = (latex = "") => {
  const source = String(latex);

  const roots = parseTemplateRanges(source);

  const templates = flattenTemplates(roots);

  const placeholders = [];

  roots.forEach((template) => collectLeafPlaceholders(template, placeholders));

  placeholders.sort((a, b) => {
    if (a.from !== b.from) {
      return a.from - b.from;
    }

    return a.to - b.to;
  });

  const indexedPlaceholders = placeholders.map((placeholder, index) => ({
    ...placeholder,
    index,
  }));

  const protectedRanges = templates.flatMap((template) => template.slots);

  return {
    templates,
    placeholders: indexedPlaceholders,
    protectedRanges,
  };
};

export const detectPlaceholders = (latex) => analyzeLatex(latex).placeholders;

export const findRemovableTemplate = (analysis, position) => {
  const candidates = analysis.templates.filter((template) => {
    const containsPosition =
      position >= template.from && position <= template.to;

    if (!containsPosition) {
      return false;
    }

    return template.slots.every((slot) => slot.from === slot.to);
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.to - a.from - (b.to - b.from))[0];
};

export const navigatePlaceholder = (
  placeholders = [],
  current = 0,
  direction = "next",
) => {
  if (placeholders.length === 0) {
    return null;
  }

  const sorted = [...placeholders].sort((a, b) => {
    if (a.from !== b.from) {
      return a.from - b.from;
    }

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

      return previous ? endOf(previous) : endOf(sorted[sorted.length - 1]);
    }

    const next = sorted.find((placeholder) => placeholder.from > current);

    return next ? endOf(next) : endOf(sorted[0]);
  }

  if (direction === "prev") {
    if (currentIndex === 0) {
      return endOf(sorted[sorted.length - 1]);
    }

    return endOf(sorted[currentIndex - 1]);
  }

  if (currentIndex === sorted.length - 1) {
    return endOf(sorted[0]);
  }

  return endOf(sorted[currentIndex + 1]);
};
