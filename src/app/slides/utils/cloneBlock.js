import { generateId } from "./generateId";

export function cloneBlock(block) {
  return {
    ...structuredClone(block),
    id: generateId(),
  };
}
