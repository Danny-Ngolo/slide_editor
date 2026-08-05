import { generateId } from "../utils/generateId";

export const QUESTION_TYPES = {
  choice: { label: "Choice" },
  open: { label: "Open" },
};

const DEFAULT_CONTENT = {
  title: "Quiz",
  difficulty: "medium",
  estimatedTime: null,
  questions: [],
  resources: [],
};

export const createOption = () => ({
  id: `qo_${generateId()}`,
  label: { html: "<p></p>" },
  isCorrect: false,
});

export const createQuestion = (type = "open") => ({
  id: `q_${generateId()}`,
  type,
  prompt: { html: "<p></p>" },
  options: type === "choice" ? [createOption(), createOption()] : [],
  multipleCorrect: false,
  modelAnswer: { html: "" },
  explanation: { html: "" },
});

export const createQuizBlock = () => ({
  id: generateId(),
  type: "quiz",
  content: {
    ...structuredClone(DEFAULT_CONTENT),
    questions: [createQuestion()],
  },
  important: false,
});

const normalizeOption = (option = {}) => ({
  id: option.id || `qo_${generateId()}`,
  label: option.label || { html: "<p></p>" },
  isCorrect: !!option.isCorrect,
});

const normalizeQuestion = (question = {}) => {
  const type = question.type === "choice" ? "choice" : "open";

  return {
    id: question.id || `q_${generateId()}`,
    type,
    prompt: question.prompt || { html: "<p></p>" },
    options: Array.isArray(question.options)
      ? question.options.map(normalizeOption)
      : [],
    multipleCorrect: !!question.multipleCorrect,
    modelAnswer: question.modelAnswer || { html: "" },
    explanation: question.explanation || { html: "" },
  };
};

export const withDefaults = (content = {}) => ({
  title: content.title || DEFAULT_CONTENT.title,
  difficulty: content.difficulty || DEFAULT_CONTENT.difficulty,
  estimatedTime: content.estimatedTime ?? null,
  questions: Array.isArray(content.questions)
    ? content.questions.map(normalizeQuestion)
    : [],
  resources: Array.isArray(content.resources) ? content.resources : [],
});

export const stripHtml = (html = "") =>
  html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
