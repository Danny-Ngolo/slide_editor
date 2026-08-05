import { generateId } from "../utils/generateId";

const LEGACY_QUESTION_ID = "q_legacy";

const DEFAULT_CONTENT = {
  title: "Exercise",
  difficulty: "medium",
  estimatedTime: null,
  questions: [],
  resources: [],
};

export const createQuestion = () => ({
  id: `q_${generateId()}`,
  prompt: { html: "<p></p>" },
  hint: { html: "" },
  teacherNotes: { html: "" },
});

const normalizeQuestion = (question = {}) => ({
  id: question.id || `q_${generateId()}`,
  prompt: question.prompt || { html: "<p></p>" },
  hint: question.hint || { html: "" },
  teacherNotes: question.teacherNotes || { html: "" },
});

export const withDefaults = (content = {}) => {
  let questions;
  if (Array.isArray(content.questions)) {
    questions = content.questions.map(normalizeQuestion);
  } else {
    // legacy flat block -> wrap instructions/hint/teacherNotes into one question
    questions = [
      normalizeQuestion({
        id: LEGACY_QUESTION_ID,
        prompt: content.instructions || { html: "<p></p>" },
        hint: content.hint,
        teacherNotes: content.teacherNotes,
      }),
    ];
  }

  return {
    title: content.title || DEFAULT_CONTENT.title,
    difficulty: content.difficulty || DEFAULT_CONTENT.difficulty,
    estimatedTime: content.estimatedTime ?? null,
    questions,
    resources: Array.isArray(content.resources) ? content.resources : [],
  };
};

export const createExerciseBlock = () => ({
  id: generateId(),
  type: "exercise",
  content: {
    ...structuredClone(DEFAULT_CONTENT),
    questions: [createQuestion()],
  },
  important: false,
});