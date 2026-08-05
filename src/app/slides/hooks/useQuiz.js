import { useCallback } from "react";
import { useHistory } from "./useHistory";
import { generateId } from "../utils/generateId";
import { createOption, createQuestion, withDefaults } from "./quizUtils";

export function useQuiz({ slideId, blockId }) {
  const { setSlides, setSlidesWithoutHistory } = useHistory();

  const mutateContent = useCallback(
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
                        content: withDefaults(updater(withDefaults(block.content))),
                      },
                ),
              },
        ),
      );
    },
    [slideId, blockId, setSlides, setSlidesWithoutHistory],
  );

  const updateField = useCallback(
    (field, value, { recordHistory = false } = {}) => {
      mutateContent((content) => ({ ...content, [field]: value }), recordHistory);
    },
    [mutateContent],
  );

  const addQuestion = useCallback(() => {
    mutateContent(
      (content) => ({
        ...content,
        questions: [...content.questions, createQuestion()],
      }),
      true,
    );
  }, [mutateContent]);

  const removeQuestion = useCallback(
    (questionId) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.filter((q) => q.id !== questionId),
        }),
        true,
      );
    },
    [mutateContent],
  );

  const duplicateQuestion = useCallback(
    (questionId) => {
      mutateContent(
        (content) => {
          const index = content.questions.findIndex((q) => q.id === questionId);
          if (index === -1) return content;

          const questions = [...content.questions];
          const copy = { ...structuredClone(questions[index]), id: `q_${generateId()}` };

          questions.splice(index + 1, 0, copy);
          return { ...content, questions };
        },
        true,
      );
    },
    [mutateContent],
  );

  const setQuestionType = useCallback(
    (questionId, type) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) => {
            if (q.id !== questionId) return q;

            if (type === "choice" && q.options.length === 0) {
              return { ...q, type, options: [createOption(), createOption()] };
            }

            return { ...q, type };
          }),
        }),
        true,
      );
    },
    [mutateContent],
  );

  const moveQuestion = useCallback(
    (questionId, direction) => {
      mutateContent(
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
      );
    },
    [mutateContent],
  );

  const updateQuestionField = useCallback(
    (questionId, field, value, { recordHistory = false } = {}) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) =>
            q.id === questionId ? { ...q, [field]: value } : q,
          ),
        }),
        recordHistory,
      );
    },
    [mutateContent],
  );

  const setMultipleCorrect = useCallback(
    (questionId, value) => {
      updateQuestionField(questionId, "multipleCorrect", value, {
        recordHistory: true,
      });
    },
    [updateQuestionField],
  );

  const addOption = useCallback(
    (questionId) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) =>
            q.id === questionId
              ? { ...q, options: [...q.options, createOption()] }
              : q,
          ),
        }),
        true,
      );
    },
    [mutateContent],
  );

  const removeOption = useCallback(
    (questionId, optionId) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) =>
            q.id === questionId
              ? { ...q, options: q.options.filter((o) => o.id !== optionId) }
              : q,
          ),
        }),
        true,
      );
    },
    [mutateContent],
  );

  const updateOption = useCallback(
    (questionId, optionId, patch, { recordHistory = false } = {}) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) =>
            q.id === questionId
              ? {
                  ...q,
                  options: q.options.map((o) =>
                    o.id === optionId ? { ...o, ...patch } : o,
                  ),
                }
              : q,
          ),
        }),
        recordHistory,
      );
    },
    [mutateContent],
  );

  const moveOption = useCallback(
    (questionId, optionId, direction) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) => {
            if (q.id !== questionId) return q;

            const options = [...q.options];
            const index = options.findIndex((o) => o.id === optionId);
            const target = index + direction;

            if (index === -1 || target < 0 || target >= options.length) {
              return q;
            }

            [options[index], options[target]] = [
              options[target],
              options[index],
            ];

            return { ...q, options };
          }),
        }),
        true,
      );
    },
    [mutateContent],
  );

  const toggleOptionCorrect = useCallback(
    (questionId, optionId) => {
      mutateContent(
        (content) => ({
          ...content,
          questions: content.questions.map((q) => {
            if (q.id !== questionId) return q;

            const target = q.options.find((o) => o.id === optionId);
            if (!target) return q;

            const nextCorrect = !target.isCorrect;

            return {
              ...q,
              options: q.options.map((o) => {
                if (o.id === optionId) return { ...o, isCorrect: nextCorrect };
                if (!q.multipleCorrect) return { ...o, isCorrect: false };
                return o;
              }),
            };
          }),
        }),
        true,
      );
    },
    [mutateContent],
  );

  return {
    updateField,
    addQuestion,
    removeQuestion,
    duplicateQuestion,
    setQuestionType,
    moveQuestion,
    updateQuestionField,
    setMultipleCorrect,
    addOption,
    removeOption,
    updateOption,
    moveOption,
    toggleOptionCorrect,
  };
}
