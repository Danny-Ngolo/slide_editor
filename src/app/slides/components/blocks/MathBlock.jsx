"use client";

import React from "react";
import { ArrowDown, ArrowUp, Copy, Plus, Trash } from "lucide-react";
import EditableTitle from "../EditableTitle";
import MathEditor from "./math/MathEditor";
import { useMath } from "../../hooks/useMath";
import { withDefaults } from "../../hooks/mathUtils";
import {
  COLORS,
  INPUT_STYLE,
  LABEL_STYLE,
  addButtonStyle,
  rowButtonStyle,
} from "./shared/styles";
import Select from "./shared/Select";

const MODE_OPTIONS = [
  { value: "display", label: "Display" },
  { value: "inline", label: "Inline" },
];

const ExpressionCard = ({
  expression,
  index,
  count,
  blockId,
  slideId,
  onRemove,
  onDuplicate,
  onMoveUp,
  onMoveDown,
}) => {
  const { updateExpression } = useMath({ slideId, blockId });

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
          Expression {index + 1}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
          <Select
            value={expression.mode}
            options={MODE_OPTIONS}
            onChange={(v) =>
              updateExpression(expression.id, { mode: v }, { recordHistory: true })
            }
            ariaLabel="Expression mode"
            style={INPUT_STYLE}
          />
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
            title="Duplicate expression"
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
            title="Remove expression"
            style={rowButtonStyle(false)}
          >
            <Trash size={14} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        <MathEditor
          latex={expression.latex}
          mode={expression.mode}
          onChange={(latex) => updateExpression(expression.id, { latex })}
        />
      </div>
    </div>
  );
};

const MathBlock = ({ block, slideId }) => {
  const content = withDefaults(block.content);
  const {
    updateField,
    addExpression,
    removeExpression,
    duplicateExpression,
    moveExpression,
  } = useMath({ slideId, blockId: block.id });

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
          fontSize: "clamp(1.1em, 3vw, 1.25em)",
          fontWeight: "bold",
          color: COLORS.text,
          marginBottom: "4px",
        }}
      />

      <div style={{ marginTop: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={LABEL_STYLE}>Expressions</div>
          <span style={{ ...LABEL_STYLE, color: COLORS.placeholder }}>
            ({content.expressions.length})
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
          {content.expressions.length === 0 && (
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
              No expressions yet.
            </div>
          )}

          {content.expressions.map((expression, index) => (
            <ExpressionCard
              key={expression.id}
              expression={expression}
              index={index}
              count={content.expressions.length}
              blockId={block.id}
              slideId={slideId}
              onRemove={() => removeExpression(expression.id)}
              onDuplicate={() => duplicateExpression(expression.id)}
              onMoveUp={() => moveExpression(expression.id, -1)}
              onMoveDown={() => moveExpression(expression.id, 1)}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={(e) => {
            stop(e);
            addExpression();
          }}
          style={{ ...addButtonStyle, marginTop: "8px" }}
        >
          <Plus size={14} /> Add expression
        </button>
      </div>
    </div>
  );
};

export default MathBlock;