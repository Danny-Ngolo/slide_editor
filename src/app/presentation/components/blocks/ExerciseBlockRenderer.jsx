"use client";

import { useState } from "react";
import { withDefaults } from "../../../slides/hooks/exerciseUtils";
import RichText from "../shared/RichText";
import ResourcesList from "../shared/ResourcesList";

const capitalize = (value) =>
  typeof value === "string" && value.length > 0
    ? value.charAt(0).toUpperCase() + value.slice(1)
    : null;

const ExerciseQuestion = ({ question, index }) => {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const hintHtml = question?.hint?.html;

  return (
    <div className="presentation-question">
      <div className="presentation-question-index">
        Question {index + 1}
      </div>

      <div className="presentation-question-prompt">
        <RichText className="presentation-rich" html={question?.prompt?.html} />
      </div>

      <textarea
        className="presentation-answer"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        aria-label={`Your answer for question ${index + 1}`}
        placeholder="Write your answer here..."
      />

      {hintHtml ? (
        <div className="presentation-hint">
          <button
            type="button"
            className="presentation-hint-toggle"
            onClick={() => setShowHint((visible) => !visible)}
            aria-expanded={showHint}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>

          {showHint && (
            <div className="presentation-hint-content">
              <RichText className="presentation-rich" html={hintHtml} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

const ExerciseBlockRenderer = ({ block }) => {
  const content = withDefaults(block?.content);
  const questions = Array.isArray(content.questions) ? content.questions : [];
  const difficulty = capitalize(content.difficulty);
  const estimatedTime = content.estimatedTime;

  if (questions.length === 0) {
    return (
      <div className="presentation-unknown" role="note">
        This exercise has no questions yet.
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
        <ExerciseQuestion
          key={question.id || index}
          question={question}
          index={index}
        />
      ))}

      <ResourcesList resources={content.resources} />
    </section>
  );
};

export default ExerciseBlockRenderer;