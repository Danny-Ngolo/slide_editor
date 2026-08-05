import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { createQuestion, withDefaults } from "./exerciseUtils";
import { generateId } from "../utils/generateId";

export function useExercise({ slideId, blockId }) {
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

  const mutateQuestions = useCallback(
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

  const addQuestion = useCallback(
    () =>
      mutateQuestions(
        (content) => ({
          ...content,
          questions: [...content.questions, createQuestion()],
        }),
        true,
      ),
    [mutateQuestions],
  );

  const removeQuestion = useCallback(
    (questionId) =>
      mutateQuestions(
        (content) => ({
          ...content,
          questions: content.questions.filter((q) => q.id !== questionId),
        }),
        true,
      ),
    [mutateQuestions],
  );

  const duplicateQuestion = useCallback(
    (questionId) =>
      mutateQuestions(
        (content) => {
          const index = content.questions.findIndex(
            (q) => q.id === questionId,
          );
          if (index === -1) return content;

          const questions = [...content.questions];
          const copy = {
            ...structuredClone(questions[index]),
            id: `q_${generateId()}`,
          };

          questions.splice(index + 1, 0, copy);
          return { ...content, questions };
        },
        true,
      ),
    [mutateQuestions],
  );

  const moveQuestion = useCallback(
    (questionId, direction) =>
      mutateQuestions(
        (content) => {
          const questions = [...content.questions];
          const index = questions.findIndex((q) => q.id === questionId);
          const target = index + direction;

          if (index === -1 || target < 0 || target >= questions.length) {
            return content;
          }

          [questions[index], questions[target]] = [
            questions[target],
            questions[index],
          ];

          return { ...content, questions };
        },
        true,
      ),
    [mutateQuestions],
  );

  const updateQuestionField = useCallback(
    (questionId, field, value, { recordHistory = false } = {}) =>
      mutateQuestions(
        (content) => ({
          ...content,
          questions: content.questions.map((q) =>
            q.id === questionId ? { ...q, [field]: value } : q,
          ),
        }),
        recordHistory,
      ),
    [mutateQuestions],
  );

  return {
    updateField,
    addQuestion,
    removeQuestion,
    duplicateQuestion,
    moveQuestion,
    updateQuestionField,
  };
}