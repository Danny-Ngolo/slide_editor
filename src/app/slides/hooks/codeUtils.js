import { generateId } from "../utils/generateId";

export const DEFAULT_CONTENT = {
  code: "",
  language: null,
};

export const withDefaults = (content = {}) => ({
  ...content,
  code: typeof content.code === "string" ? content.code : "",
  language: content.language ?? null,
});

export const createCodeBlock = () => ({
  id: generateId(),
  type: "code",
  content: structuredClone(DEFAULT_CONTENT),
  important: false,
});
