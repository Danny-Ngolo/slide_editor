import { generateId } from "./generateId";

export function cloneSlide(slide, { asCopy = true } = {}) {
  const clone = structuredClone(slide);

  clone.id = generateId();
  clone.blocks = (clone.blocks || []).map((block) => ({
    ...block,
    id: generateId(),
  }));

  if (asCopy) {
    clone.title = `${clone.title} (copy)`;
  }

  return clone;
}
