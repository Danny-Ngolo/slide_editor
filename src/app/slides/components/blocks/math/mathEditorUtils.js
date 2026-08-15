import { COLORS } from "../shared/styles";

export const innermostTemplateAt = (templates, position) => {
  let innermost = null;

  for (const template of templates) {
    if (template.from <= position && position < template.to) {
      if (
        !innermost ||
        template.to - template.from < innermost.to - innermost.from
      ) {
        innermost = template;
      }
    }
  }

  return innermost;
};

export const isStructuralPosition = (templates, position) => {
  const innermost = innermostTemplateAt(templates, position);

  if (!innermost) {
    return false;
  }

  return !innermost.slots.some(
    (slot) => slot.from <= position && position < slot.to,
  );
};

export const rangeHasStructuralPosition = (templates, from, to) => {
  for (let position = from; position < to; position++) {
    if (isStructuralPosition(templates, position)) {
      return true;
    }
  }

  return false;
};

export const findRemovableEmptyTemplate = (analysis, position, deleteKey) => {
  const removalRange = (template) => {
    const isSupSub =
      template.type === "superscript" || template.type === "subscript";

    if (isSupSub) {
      const content = template.slots[template.slots.length - 1];

      const inContent =
        (position >= content.from && position <= content.to) ||
        position === template.to;

      if (content.from !== content.to || !inContent) {
        return null;
      }

      const base = template.slots.length === 2 ? template.slots[0] : null;

      const hasContentBase = Boolean(base && base.from !== base.to);

      return {
        from: hasContentBase ? base.to : template.from,
        to: template.to,
      };
    }

    if (!template.slots.every((slot) => slot.from === slot.to)) {
      return null;
    }

    return {
      from: template.from,
      to: template.to,
    };
  };

  const candidates = analysis.templates.flatMap((template) => {
    const inside = deleteKey
      ? position >= template.from && position < template.to
      : position >= template.from && position <= template.to;

    if (!inside) {
      return [];
    }

    const range = removalRange(template);

    return range ? [range] : [];
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.to - a.from - (b.to - b.from))[0];
};

export const isColorboxSafe = (content) => {
  let depth = 0;

  for (let index = 0; index < content.length; index++) {
    if (content[index] === "\\") {
      index++;
      continue;
    }

    if (content[index] === "{") {
      depth++;
      continue;
    }

    if (content[index] === "}") {
      depth--;

      if (depth < 0) {
        return false;
      }
    }
  }

  return depth === 0;
};

export const getHighlightedDisplayLatex = (latex, placeholders, caretPos) => {
  if (!latex || placeholders.length === 0) {
    return latex;
  }

  const activeSlot = placeholders.find(
    (placeholder) => caretPos >= placeholder.from && caretPos <= placeholder.to,
  );

  if (!activeSlot) {
    return latex;
  }

  const from = Math.max(0, Math.min(activeSlot.from, latex.length));

  const to = Math.max(from, Math.min(activeSlot.to, latex.length));

  const before = latex.slice(0, from);

  const content = latex.slice(from, to);

  const after = latex.slice(to);

  const displayContent = content.length === 0 ? "\\phantom{0}" : content;

  if (!isColorboxSafe(displayContent)) {
    return latex;
  }

  const wrapped =
    `\\colorbox{${COLORS.accentSoft}}{` +
    `\\color{${COLORS.accentText}}{` +
    `$\\displaystyle ${displayContent}$` +
    `}` +
    `}`;

  return before + wrapped + after;
};
