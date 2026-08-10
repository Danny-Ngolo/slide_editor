// mathInsert.js — unified insertion engine (Layer A, §16.8). The single funnel
// that symbols (Phase 3) and templates (Phase 4) + toolbar + shortcuts all go
// through. Stateless: given the current LaTeX source and a selection, returns
// the new source, caret selection, and any transient placeholders.

import { placeholderResolve } from "./mathPlaceholder";
import { getTemplate } from "./mathTemplates";

export const SYMBOL = "symbol";
export const TEMPLATE = "template";

export const insertSymbol = (latex, selection, token) => {
  const start = selection?.start ?? latex.length;
  const end = selection?.end ?? start;

  const next = latex.slice(0, start) + token + latex.slice(end);

  return {
    latex: next,
    selection: { start, end: start + token.length },
  };
};

// Splice a resolved template into `latex` at `selection`, shifting the
// placeholder map so every offset is absolute within the final document string.
export const insertTemplateAt = (latex, selection, template) => {
  const start = selection?.start ?? latex.length;
  const end = selection?.end ?? start;

  const { text, cursor, placeholders } = placeholderResolve(
    template.latex,
    template.placeholders ?? [],
    template.cursorAt ?? 0,
  );

  return {
    latex: latex.slice(0, start) + text + latex.slice(end),
    selection: { start: start + cursor, end: start + cursor },
    placeholders: placeholders.map((p) => ({
      index: p.index,
      from: p.from + start,
      to: p.to + start,
    })),
  };
};

// Unified insertion. `selection` is `{ start, end }`; `item` is a registry item
// with a discriminated `type` ("symbol" | "template").
export const applyInsert = (latex, selection, item) => {
  if (!item) return { latex, selection: { start: 0, end: 0 }, placeholders: [] };

  switch (item.type) {
    case SYMBOL: {
      const inserted = insertSymbol(latex, selection, item.latex);
      return { ...inserted, placeholders: [] };
    }
    case TEMPLATE: {
      const template = getTemplate(item.templateId);
      if (!template) return { latex, selection, placeholders: [] };
      return insertTemplateAt(latex, selection, template);
    }
    default:
      return { latex, selection, placeholders: [] };
  }
};