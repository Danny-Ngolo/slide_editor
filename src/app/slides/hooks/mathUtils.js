import { generateId } from "../utils/generateId";

export const DEFAULT_CONTENT = {
  title: "Math",
  expressions: [],
};

export const createExpression = () => ({
  id: `me_${generateId()}`,
  latex: "",
  mode: "display",
});

const normalizeExpression = (expression = {}) => ({
  ...expression,
  id: expression.id || `me_${generateId()}`,
  latex: expression.latex || "",
  mode: expression.mode === "inline" ? "inline" : "display",
});

export const withDefaults = (content = {}) => {
  let expressions;

  if (Array.isArray(content.expressions)) {
    expressions = content.expressions.map(normalizeExpression);
  } else if (typeof content.latex === "string") {
    // legacy single-expression block shape -> wrap into one expression
    expressions = [normalizeExpression({ latex: content.latex })];
  } else {
    expressions = [];
  }

  return {
    ...content,
    title: content.title || DEFAULT_CONTENT.title,
    expressions,
  };
};

export const createMathBlock = () => ({
  id: generateId(),
  type: "math",
  content: {
    ...structuredClone(DEFAULT_CONTENT),
    expressions: [createExpression()],
  },
  important: false,
});