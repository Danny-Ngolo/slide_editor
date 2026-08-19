"use client";

import { useState } from "react";
import { withDefaults } from "../../../slides/hooks/quizUtils";
import RichText from "../shared/RichText";
import ResourcesList from "../shared/ResourcesList";

const capitalize = (value) =>
  typeof value === "string" && value.length > 0
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : null;

const QuizQuestion = ({ question, index }) => {
  const isChoice = question?.type === "choice";
  const multiple = isChoice && !!question.multipleCorrect;

  const [singleSelected, setSingleSelected] = useState(null);
  const [multiSelected, setMultiSelected] = useState(() => new Set());
  const [openAnswer, setOpenAnswer] = useState("");

  const toggleMultiple = (optionId) => {
    setMultiSelected((prev) => {
      const next = new Set(prev);
      if (next.has(optionId)) {
        next.delete(optionId);
      } else {
        next.add(optionId);
      }
      return next;
    });
  };

  return (
    <div className="presentation-question">
      <div className="presentation-question-index">
        Question {index + 1}
      </div>

      <div className="presentation-question-prompt">
        <RichText className="presentation-rich" html={question?.prompt?.html} />
      </div>

      {isChoice ? (
        <div
          role={multiple ? "group" : "radiogroup"}
          aria-label={`Options for question ${index + 1}`}
        >
          {question.options.map((option) => (
            <label key={option.id} className="presentation-option">
              <input
                type={multiple ? "checkbox" : "radio"}
                name={multiple ? undefined : `quiz-${question.id}`}
                checked={
                  multiple
                    ? multiSelected.has(option.id)
                    : singleSelected === option.id
                }
                onChange={() =>
                  multiple
                    ? toggleMultiple(option.id)
                    : setSingleSelected(option.id)
                }
              />

              <RichText
                className="presentation-rich"
                html={option?.label?.html}
              />
            </label>
          ))}

          {question.options.length === 0 && (
            <p className="presentation-empty">No options available.</p>
          )}
        </div>
      ) : (
        <textarea
          className="presentation-answer"
          value={openAnswer}
          onChange={(e) => setOpenAnswer(e.target.value)}
          aria-label={`Your answer for question ${index + 1}`}
          placeholder="Write your answer here..."
        />
      )}
    </div>
  );
};

const QuizBlockRenderer = ({ block }) => {
  const content = withDefaults(block?.content);
  const questions = Array.isArray(content.questions) ? content.questions : [];
  const difficulty = capitalize(content.difficulty);
  const estimatedTime = content.estimatedTime;

  if (questions.length === 0) {
    return (
      <div className="presentation-unknown" role="note">
        This quiz has no questions yet.
      </div>
    );
  }

  return (
    <section>
      <h2 className="presentation-activity-title">{content.title}</h2>

      <div className="presentation-meta">
        {difficulty ? (
          <span className="presentation-meta-chip">{difficulty}</span>
        ) : null}

        {estimatedTime != null ? (
          <span className="presentation-meta-chip">
            {estimatedTime} min
          </span>
        ) : null}
      </div>

      {questions.map((question, index) => (
        <QuizQuestion
          key={question.id || index}
          question={question}
          index={index}
        />
      ))}

      <ResourcesList resources={content.resources} />
    </section>
  );
};

export default QuizBlockRenderer;