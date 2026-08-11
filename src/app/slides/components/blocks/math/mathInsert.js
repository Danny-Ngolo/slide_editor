import { placeholderResolve } from "./mathPlaceholder";
import { getTemplate } from "./mathTemplates";

export const SYMBOL = "symbol";
export const TEMPLATE = "template";

const getItemType = (item) => {
  if (!item) return null;

  if (item.type === TEMPLATE || item.type === SYMBOL) {
    return item.type;
  }

  if (item.templateId || item.placeholders) {
    return TEMPLATE;
  }

  return SYMBOL;
};

const getTemplateDefinition = (item) => {
  if (!item) return null;

  if (typeof item === "string") {
    return {
      latex: item,
      placeholders: [],
      cursorAt: 0,
    };
  }

  if (item.templateId) {
    return getTemplate(item.templateId);
  }

  if (item.id) {
    return getTemplate(item.id) ?? item;
  }

  return item;
};

export const insertSymbol = (latex, selection, token) => {
  const start = Math.max(0, selection?.start ?? latex.length);
  const end = Math.max(start, selection?.end ?? start);

  const next = latex.slice(0, start) + token + latex.slice(end);
  const cursor = start + token.length;

  return {
    latex: next,
    selection: { start: cursor, end: cursor },
    placeholders: [],
  };
};

export const insertTemplateAt = (
  latex,
  selection,
  templateObj,
  existingPlaceholders = [],
) => {
  const start = Math.max(0, selection?.start ?? latex.length);
  const end = Math.max(start, selection?.end ?? start);

  const template = getTemplateDefinition(templateObj);

  if (!template || typeof template.latex !== "string") {
    return {
      latex,
      selection: { start, end },
      placeholders: existingPlaceholders,
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

  const newLatex = latex.slice(0, start) + resolved.text + latex.slice(end);

  const insertedLength = resolved.text.length;
  const replacedLength = end - start;
  const delta = insertedLength - replacedLength;

  const updatedExisting = existingPlaceholders
    .filter((p) => !(p.from >= start && p.to <= end))
    .map((p) => {
      if (p.from >= end) {
        return {
          ...p,
          from: p.from + delta,
          to: p.to + delta,
        };
      }

      if (p.from <= start && p.to >= end) {
        return {
          ...p,
          to: p.to + delta,
        };
      }

      return p;
    });

  const insertedPlaceholders = resolved.placeholders.map((p) => ({
    ...p,
    from: p.from + start,
    to: p.to + start,
  }));

  const placeholders = [...updatedExisting, ...insertedPlaceholders]
    .sort((a, b) => a.from - b.from)
    .map((p, index) => ({
      ...p,
      index,
    }));

  const cursor = start + resolved.cursor;

  return {
    latex: newLatex,
    selection: { start: cursor, end: cursor },
    placeholders,
  };
};

export const applyInsert = (
  latex,
  selection,
  item,
  existingPlaceholders = [],
) => {
  const start = Math.max(0, selection?.start ?? latex.length);
  const end = Math.max(start, selection?.end ?? start);

  const type = getItemType(item);

  if (type === TEMPLATE) {
    return insertTemplateAt(latex, { start, end }, item, existingPlaceholders);
  }

  let token = "";

  if (typeof item === "string") {
    token = item;
  } else {
    token = item?.latex ?? item?.value ?? item?.symbol ?? "";
  }

  return insertSymbol(latex, { start, end }, token);
};
