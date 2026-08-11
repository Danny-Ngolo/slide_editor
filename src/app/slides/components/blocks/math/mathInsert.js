// mathInsert.js — unified insertion engine with nested placeholder boundary tracking.

import { placeholderResolve } from "./mathPlaceholder";
import { getTemplate } from "./mathTemplates";

export const SYMBOL = "symbol";
export const TEMPLATE = "template";

export const insertSymbol = (latex, selection, token) => {
  const start = Math.max(0, selection?.start ?? latex.length);
  const end = Math.max(start, selection?.end ?? start);

  const next = latex.slice(0, start) + token + latex.slice(end);

  return {
    latex: next,
    selection: { start: start + token.length, end: start + token.length },
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
  const selectedText = latex.slice(start, end);

  const templateStr =
    typeof templateObj === "string"
      ? templateObj
      : (templateObj?.latex ?? templateObj?.template ?? "");

  const placeholdersConfig = [...(templateObj?.placeholders ?? [])];
  const cursorAtConfig = templateObj?.cursorAt ?? 0;

  // Insert selected text into target cursor slot without corrupting placeholder array bounds
  if (selectedText) {
    if (placeholdersConfig.length > cursorAtConfig) {
      placeholdersConfig[cursorAtConfig] = selectedText;
    } else if (placeholdersConfig.length > 0) {
      placeholdersConfig[0] = selectedText;
    } else {
      placeholdersConfig.push(selectedText);
    }
  }

  const {
    text,
    cursor,
    placeholders: childPlaceholders,
  } = placeholderResolve(templateStr, placeholdersConfig, cursorAtConfig);

  const newLatex = latex.slice(0, start) + text + latex.slice(end);
  const delta = text.length - selectedText.length;

  const absoluteChildPlaceholders = childPlaceholders.map((p) => ({
    index: p.index,
    from: p.from + start,
    to: p.to + start,
  }));

  // Re-map existing parent and sibling placeholders around the nested template
  let updatedPlaceholders = [];
  if (existingPlaceholders && existingPlaceholders.length > 0) {
    existingPlaceholders.forEach((p) => {
      // Replaced completely by selected range -> remove
      if (
        p.from >= start &&
        p.to <= end &&
        (start !== end || p.from === start)
      ) {
        return;
      }
      // Strictly after insertion point -> shift right by delta
      if (p.from >= end) {
        updatedPlaceholders.push({
          index: p.index,
          from: p.from + delta,
          to: p.to + delta,
        });
      }
      // Encloses insertion point (Parent container) -> expand boundary by delta
      else if (p.to >= start) {
        updatedPlaceholders.push({
          index: p.index,
          from: p.from,
          to: p.to + delta,
        });
      } else {
        updatedPlaceholders.push(p);
      }
    });
  }

  const allPlaceholders = [...updatedPlaceholders, ...absoluteChildPlaceholders]
    .sort((a, b) => a.from - b.from)
    .map((p, idx) => ({ ...p, index: idx }));

  return {
    latex: newLatex,
    selection: { start: start + cursor, end: start + cursor },
    placeholders: allPlaceholders,
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

  let resolvedItem = item;
  if (typeof item === "string" && item.includes("!")) {
    resolvedItem = { type: TEMPLATE, latex: item };
  } else if (
    item &&
    typeof item === "object" &&
    item.id &&
    !item.latex &&
    !item.template
  ) {
    if (typeof getTemplate === "function") {
      const t = getTemplate(item.id);
      if (t) resolvedItem = t;
    }
  }

  const templateStr = resolvedItem?.latex ?? resolvedItem?.template ?? "";
  const itemType =
    resolvedItem?.type ?? (templateStr.includes("!") ? TEMPLATE : SYMBOL);

  if (itemType === TEMPLATE || templateStr.includes("!")) {
    return insertTemplateAt(
      latex,
      { start, end },
      resolvedItem,
      existingPlaceholders,
    );
  } else {
    const token =
      typeof resolvedItem === "string"
        ? resolvedItem
        : (resolvedItem?.latex ??
          resolvedItem?.value ??
          resolvedItem?.symbol ??
          "");
    return insertSymbol(latex, { start, end }, token);
  }
};
