import { placeholderResolve } from "./mathPlaceholder";

import { getTemplate } from "./mathTemplates";

export const SYMBOL = "symbol";
export const TEMPLATE = "template";

const normalizeSelection = (latex, selection) => {
  const length = latex.length;

  const start = Math.max(0, Math.min(selection?.start ?? length, length));

  const end = Math.max(start, Math.min(selection?.end ?? start, length));

  return {
    start,
    end,
  };
};

const resolveItem = (item) => {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    if (item.includes("!")) {
      return {
        type: TEMPLATE,
        latex: item,
        placeholders: [],
        cursorAt: 0,
      };
    }

    return {
      type: SYMBOL,
      latex: item,
    };
  }

  if (item.type === TEMPLATE || item.type === SYMBOL) {
    if (item.type === TEMPLATE && item.templateId) {
      const template = getTemplate(item.templateId);

      return template
        ? {
            ...template,
            type: TEMPLATE,
          }
        : null;
    }

    return item;
  }

  if (item.templateId) {
    const template = getTemplate(item.templateId);

    return template
      ? {
          ...template,
          type: TEMPLATE,
        }
      : null;
  }

  if (item.id) {
    const template = getTemplate(item.id);

    if (template) {
      return {
        ...template,
        type: TEMPLATE,
      };
    }
  }

  return item;
};

export const insertSymbol = (latex, selection, token) => {
  const { start, end } = normalizeSelection(latex, selection);

  const nextLatex = latex.slice(0, start) + token + latex.slice(end);

  const caret = start + token.length;

  return {
    latex: nextLatex,
    selection: {
      start: caret,
      end: caret,
    },
  };
};

export const insertTemplateAt = (latex, selection, template) => {
  const { start, end } = normalizeSelection(latex, selection);

  if (!template || typeof template.latex !== "string") {
    return {
      latex,
      selection: {
        start,
        end,
      },
    };
  }

  const selectedText = latex.slice(start, end);

  const values = Array.isArray(template.placeholders)
    ? [...template.placeholders]
    : [];

  const cursorAt = template.cursorAt ?? 0;

  if (selectedText && values.length > 0) {
    values[cursorAt] = selectedText;
  }

  const resolved = placeholderResolve(template.latex, values, cursorAt);

  const nextLatex = latex.slice(0, start) + resolved.text + latex.slice(end);

  const caret = start + resolved.cursor;

  return {
    latex: nextLatex,
    selection: {
      start: caret,
      end: caret,
    },
  };
};

export const applyInsert = (latex, selection, item) => {
  const resolvedItem = resolveItem(item);

  if (!resolvedItem) {
    return {
      latex,
      selection: {
        start: selection?.start ?? latex.length,
        end: selection?.end ?? selection?.start ?? latex.length,
      },
    };
  }

  if (resolvedItem.type === TEMPLATE) {
    return insertTemplateAt(latex, selection, resolvedItem);
  }

  const token =
    resolvedItem.latex ?? resolvedItem.value ?? resolvedItem.symbol ?? "";

  return insertSymbol(latex, selection, token);
};
