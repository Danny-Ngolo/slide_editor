"use client";

import React from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash } from "lucide-react";
import EditableTitle from "../EditableTitle";
import { useExercise } from "../../hooks/useExercise";
import {
  COLORS,
  INPUT_STYLE,
  LABEL_STYLE,
  addButtonStyle,
  rowButtonStyle,
} from "./shared/styles";
import { DIFFICULTY_OPTIONS } from "./shared/constants";
import { Accordion } from "./shared/Accordion";
import { TimeInput } from "./shared/TimeInput";
import { withDefaults } from "../../hooks/exerciseUtils";
import RichTextField from "./shared/RichTextField";
import ResourceSection from "./shared/ResourceSection";
import Select from "./shared/Select";

const QuestionCard = ({
  question,
  index,
  count,
  blockId,
  slideId,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const { updateQuestionField } = useExercise({ slideId, blockId });

  const stop = (e) => e.stopPropagation();
  const isFirst = index === 0;
  const isLast = index === count - 1;

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
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
        <span
          style={{
            fontSize: "13px",
            fontWeight: "bold",
            color: COLORS.text,
          }}
        >
          Question {index + 1}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
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
      </div>

      <div style={{ marginTop: "10px" }}>
        <div style={LABEL_STYLE}>Prompt</div>
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="exercise"
          content={question.prompt}
          onChange={(next) => updateQuestionField(question.id, "prompt", next)}
        />
      </div>

      <Accordion label="Hint">
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="exercise"
          content={question.hint}
          onChange={(next) => updateQuestionField(question.id, "hint", next)}
        />
      </Accordion>

      <Accordion label="Teacher notes">
        <RichTextField
          blockId={blockId}
          slideId={slideId}
          blockType="exercise"
          content={question.teacherNotes}
          onChange={(next) =>
            updateQuestionField(question.id, "teacherNotes", next)
          }
        />
      </Accordion>
    </div>
  );
};

const ExerciseBlock = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const {
    updateField,
    addQuestion,
    removeQuestion,
    duplicateQuestion,
    moveQuestion,
  } = useExercise({ slideId, blockId: block.id });

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
        onChange={(title) =>
          updateField("title", title, { recordHistory: true })
        }
        style={{
          fontSize: "clamp(1.1em, 3vw, 1.25em)",
          fontWeight: "bold",
          color: COLORS.text,
          marginBottom: "4px",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "12px",
          fontSize: "13px",
          color: COLORS.text,
        }}
      >
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Difficulty
          <Select
            value={content.difficulty}
            options={DIFFICULTY_OPTIONS}
            onChange={(v) =>
              updateField("difficulty", v, {
                recordHistory: true,
              })
            }
            style={INPUT_STYLE}
          />
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          Time (min)
          <TimeInput
            value={content.estimatedTime}
            onChange={(v) =>
              updateField("estimatedTime", v, { recordHistory: true })
            }
          />
        </label>
      </div>

      <div style={{ marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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

      <div style={{ marginTop: "16px" }}>
        <ResourceSection block={block} slideId={slideId} />
      </div>
    </div>
  );
};

export default ExerciseBlock;