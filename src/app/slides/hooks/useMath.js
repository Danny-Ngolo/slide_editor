import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { createExpression, withDefaults } from "./mathUtils";
import { generateId } from "../utils/generateId";

export function useMath({ slideId, blockId }) {
  const { setSlides, setSlidesWithoutHistory } = useHistory();

  const updateField = useCallback(
    (field, value, { recordHistory = false } = {}) => {
      const update = recordHistory ? setSlides : setSlidesWithoutHistory;

      update((slides) =>
        slides.map((slide) =>
          slide.id !== slideId
            ? slide
            : {
                ...slide,
                blocks: slide.blocks.map((block) =>
                  block.id !== blockId
                    ? block
                    : {
                        ...block,
                        content: withDefaults({
                          ...block.content,
                          [field]: value,
                        }),
                      },
                ),
              },
        ),
      );
    },
    [slideId, blockId, setSlides, setSlidesWithoutHistory],
  );

  const mutateExpressions = useCallback(
    (updater, recordHistory = false) => {
      const update = recordHistory ? setSlides : setSlidesWithoutHistory;

      update((slides) =>
        slides.map((slide) =>
          slide.id !== slideId
            ? slide
            : {
                ...slide,
                blocks: slide.blocks.map((block) =>
                  block.id !== blockId
                    ? block
                    : {
                        ...block,
                        content: withDefaults(
                          updater(withDefaults(block.content)),
                        ),
                      },
                ),
              },
        ),
      );
    },
    [slideId, blockId, setSlides, setSlidesWithoutHistory],
  );

  const addExpression = useCallback(
    () =>
      mutateExpressions(
        (content) => ({
          ...content,
          expressions: [...content.expressions, createExpression()],
        }),
        true,
      ),
    [mutateExpressions],
  );

  const removeExpression = useCallback(
    (expressionId) =>
      mutateExpressions(
        (content) => ({
          ...content,
          expressions: content.expressions.filter((e) => e.id !== expressionId),
        }),
        true,
      ),
    [mutateExpressions],
  );

  const duplicateExpression = useCallback(
    (expressionId) =>
      mutateExpressions(
        (content) => {
          const index = content.expressions.findIndex(
            (e) => e.id === expressionId,
          );
          if (index === -1) return content;

          const expressions = [...content.expressions];
          const copy = {
            ...structuredClone(expressions[index]),
            id: `me_${generateId()}`,
          };

          expressions.splice(index + 1, 0, copy);
          return { ...content, expressions };
        },
        true,
      ),
    [mutateExpressions],
  );

  const moveExpression = useCallback(
    (expressionId, direction) =>
      mutateExpressions(
        (content) => {
          const expressions = [...content.expressions];
          const index = expressions.findIndex((e) => e.id === expressionId);
          const target = index + direction;

          if (index === -1 || target < 0 || target >= expressions.length) {
            return content;
          }

          [expressions[index], expressions[target]] = [
            expressions[target],
            expressions[index],
          ];

          return { ...content, expressions };
        },
        true,
      ),
    [mutateExpressions],
  );

  const updateExpression = useCallback(
    (expressionId, patch, { recordHistory = false } = {}) =>
      mutateExpressions(
        (content) => ({
          ...content,
          expressions: content.expressions.map((e) =>
            e.id === expressionId ? { ...e, ...patch } : e,
          ),
        }),
        recordHistory,
      ),
    [mutateExpressions],
  );

  return {
    updateField,
    addExpression,
    removeExpression,
    duplicateExpression,
    moveExpression,
    updateExpression,
  };
}