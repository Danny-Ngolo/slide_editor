"use client";

import React, { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Circle,
  Copy,
  Plus,
  Trash,
} from "lucide-react";
import EditableTitle from "../EditableTitle";
import { useQuiz } from "../../hooks/useQuiz";
import { QUESTION_TYPES, withDefaults } from "../../hooks/quizUtils";
import RichTextField from "./RichTextField";

const COLORS = {
  card: "#ffffff",
  text: "#1f2328",
  label: "#374151",
  fieldBg: "#f6f8fa",
  fieldBorder: "#d0d7de",
  inputBg: "#ffffff",
  border: "#e2e5ea",
  placeholder: "#6b7280",
};

const LABEL_STYLE = {
  fontSize: "11px",
  fontWeight: "bold",
  color: COLORS.label,
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  marginBottom: "6px",
};

const INPUT_STYLE = {
  padding: "4px 6px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
};

const rowButtonStyle = (disabled) => ({
  display: "flex",
  alignItems: "center",
  background: "transparent",
  border: "none",
  cursor: disabled ? "default" : "pointer",
  color: disabled ? COLORS.placeholder : COLORS.label,
  padding: "2px",
  borderRadius: "4px",
  flexShrink: 0,
});

const addButtonStyle = {
  display: "flex",
  alignItems: "center",
  gap: "4px",
  padding: "4px 10px",
  border: `1px solid ${COLORS.fieldBorder}`,
  borderRadius: "4px",
  background: COLORS.inputBg,
  color: COLORS.text,
  fontSize: "12px",
  cursor: "pointer",
};

const Accordion = ({ label, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          ...LABEL_STYLE,
          marginBottom: 0,
        }}
      >
        <span>{open ? "▾" : "▸"}</span>
        {label}
      </button>
      {open && <div style={{ marginTop: "6px" }}>{children}</div>}
    </div>
  );
};

const OptionRow = ({
  option,
  index,
  count,
  blockId,
  slideId,
  onUpdateLabel,
  onToggleCorrect,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const stop = (e) => e.stopPropagation();
  const isFirst = index === 0;
  const isLast = index === count - 1;

  return (
    <div
      onClick={stop}
      onMouseDown={stop}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "8px",
        padding: "6px",
        border: `1px solid ${COLORS.fieldBorder}`,
        borderRadius: "6px",
        background: COLORS.inputBg,
      }}
    >
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onToggleCorrect();
        }}
        title={option.isCorrect ? "Mark as incorrect" : "Mark as correct"}
        style={rowButtonStyle(false)}
      >
        {option.isCorrect ? (
          <CheckCircle2 size={16} color="#16a34a" />
        ) : (
          <Circle size={16} color={COLORS.placeholder} />
        )}
      </button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="quiz"
          content={option.label}
          onChange={onUpdateLabel}
        />
      </div>

      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onMoveUp();
        }}
        disabled={isFirst}
        title="Move up"
        style={rowButtonStyle(isFirst)}
      >
        <ArrowUp size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onMoveDown();
        }}
        disabled={isLast}
        title="Move down"
        style={rowButtonStyle(isLast)}
      >
        <ArrowDown size={14} />
      </button>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          onRemove();
        }}
        title="Remove option"
        style={rowButtonStyle(false)}
      >
        <Trash size={14} />
      </button>
    </div>
  );
};

const QuestionCard = ({
  question,
  index,
  count,
  blockId,
  slideId,
  onRemove,
  onDuplicate,
  onSetType,
  onMoveUp,
  onMoveDown,
}) => {
  const {
    updateQuestionField,
    setMultipleCorrect,
    addOption,
    removeOption,
    updateOption,
    moveOption,
    toggleOptionCorrect,
  } = useQuiz({ slideId, blockId });

  const stop = (e) => e.stopPropagation();
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const typeLabel = QUESTION_TYPES[question.type]?.label || question.type;

  return (
    <div
      onClick={stop}
      onMouseDown={stop}
      style={{
        border: `1px solid ${COLORS.fieldBorder}`,
        borderRadius: "6px",
        padding: "8px 10px",
        background: COLORS.fieldBg,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            color: COLORS.text,
          }}
        >
          Question {index + 1}
        </span>
        <span
          style={{
            fontSize: "11px",
            color: COLORS.placeholder,
            textTransform: "uppercase",
          }}
        >
          {typeLabel}
        </span>
        <select
          value={question.type}
          onChange={(e) => onSetType(e.target.value)}
          style={{ ...INPUT_STYLE, marginLeft: "auto", fontSize: "12px" }}
        >
          {Object.keys(QUESTION_TYPES).map((key) => (
            <option key={key} value={key}>
              {QUESTION_TYPES[key].label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onMoveUp();
          }}
          disabled={isFirst}
          title="Move up"
          style={rowButtonStyle(isFirst)}
        >
          <ArrowUp size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onMoveDown();
          }}
          disabled={isLast}
          title="Move down"
          style={rowButtonStyle(isLast)}
        >
          <ArrowDown size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onDuplicate();
          }}
          title="Duplicate question"
          style={rowButtonStyle(false)}
        >
          <Copy size={14} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            stop(e);
            onRemove();
          }}
          title="Remove question"
          style={rowButtonStyle(false)}
        >
          <Trash size={14} />
        </button>
      </div>

      <div style={{ marginTop: "10px" }}>
        <div style={LABEL_STYLE}>Prompt</div>
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="quiz"
          content={question.prompt}
          onChange={(next) => updateQuestionField(question.id, "prompt", next)}
        />
      </div>

      {question.type === "choice" ? (
        <>
          <div
            onClick={stop}
            onMouseDown={stop}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "12px",
            }}
          >
            <input
              type="checkbox"
              checked={question.multipleCorrect}
              onChange={(e) => setMultipleCorrect(question.id, e.target.checked)}
              style={{ cursor: "pointer" }}
            />
            <label style={{ fontSize: "12px", color: COLORS.text }}>
              Allow multiple correct answers
            </label>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "6px",
              marginTop: "8px",
            }}
          >
            {question.options.length === 0 && (
              <div
                style={{
                  border: `1px dashed ${COLORS.fieldBorder}`,
                  borderRadius: "6px",
                  padding: "12px",
                  color: COLORS.placeholder,
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                No options yet.
              </div>
            )}
            {question.options.map((option, optionIndex) => (
              <OptionRow
                key={option.id}
                option={option}
                index={optionIndex}
                count={question.options.length}
                blockId={blockId}
                slideId={slideId}
                onUpdateLabel={(next) =>
                  updateOption(question.id, option.id, { label: next })
                }
                onToggleCorrect={() =>
                  toggleOptionCorrect(question.id, option.id)
                }
                onRemove={() => removeOption(question.id, option.id)}
                onMoveUp={() => moveOption(question.id, option.id, -1)}
                onMoveDown={() => moveOption(question.id, option.id, 1)}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={(e) => {
              stop(e);
              addOption(question.id);
            }}
            style={{ ...addButtonStyle, marginTop: "8px" }}
          >
            <Plus size={14} /> Add option
          </button>
        </>
      ) : (
        <div style={{ marginTop: "12px" }}>
          <div style={LABEL_STYLE}>Model answer</div>
          <RichTextField
            blockId={blockId}
            slideId={slideId}
            blockType="quiz"
            content={question.modelAnswer}
            onChange={(next) =>
              updateQuestionField(question.id, "modelAnswer", next)
            }
          />
        </div>
      )}

      <Accordion label="Explanation">
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="quiz"
          content={question.explanation}
          onChange={(next) =>
            updateQuestionField(question.id, "explanation", next)
          }
        />
      </Accordion>
    </div>
  );
};

const QuizBlock = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const { updateField, addQuestion, removeQuestion, duplicateQuestion, setQuestionType, moveQuestion } =
    useQuiz({ slideId, blockId: block.id });

  const stop = (e) => e.stopPropagation();

  return (
    <div
      style={{
        background: COLORS.card,
        color: COLORS.text,
        padding: "12px 14px",
        borderRadius: "8px",
        border: `1px solid ${COLORS.border}`,
      }}
    >
      <EditableTitle
        value={content.title}
        onChange={(title) => updateField("title", title, { recordHistory: true })}
        style={{
          fontSize: "1.25em",
          fontWeight: "bold",
          color: COLORS.text,
          marginBottom: "4px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginTop: "12px",
        }}
      >
        <div style={LABEL_STYLE}>Questions</div>
        <span style={{ ...LABEL_STYLE, color: COLORS.placeholder }}>
          ({content.questions.length})
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          marginTop: "8px",
        }}
      >
        {content.questions.length === 0 && (
          <div
            style={{
              border: `1px dashed ${COLORS.fieldBorder}`,
              borderRadius: "6px",
              padding: "16px",
              color: COLORS.placeholder,
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            No questions yet.
          </div>
        )}

        {content.questions.map((question, index) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={index}
            count={content.questions.length}
            blockId={block.id}
            slideId={slideId}
            onRemove={() => removeQuestion(question.id)}
            onDuplicate={() => duplicateQuestion(question.id)}
            onSetType={(type) => setQuestionType(question.id, type)}
            onMoveUp={() => moveQuestion(question.id, -1)}
            onMoveDown={() => moveQuestion(question.id, 1)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={(e) => {
          stop(e);
          addQuestion();
        }}
        style={{ ...addButtonStyle, marginTop: "8px" }}
      >
        <Plus size={14} /> Add question
      </button>
    </div>
  );
};

export default QuizBlock;
