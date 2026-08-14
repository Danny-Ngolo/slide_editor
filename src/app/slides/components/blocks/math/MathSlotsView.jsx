import React from "react";

import MathRenderer from "./MathRenderer";
import { getHighlightedDisplayLatex } from "./mathEditorUtils";
import { COLORS, RADIUS, FOCUS_RING } from "../shared/styles";

const MathSlotsView = ({
  latex,
  placeholders,
  caret,
  sourceRef,
  jumpToSlot,
  setPlaceholders,
  setCaret,
  BlinkingCaret,
}) => {
  const chips =
    placeholders.length > 0 ? (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {placeholders.map((slot) => {
          const content = latex.slice(slot.from, slot.to);
          const isActive = caret >= slot.from && caret <= slot.to;
          const isEmpty = content.length === 0;

          return (
            <button
              key={`${slot.index}-${slot.from}-${slot.to}`}
              type="button"
              title="Click to fill this slot"
              aria-label={`Fill slot ${slot.index}`}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();

                jumpToSlot(slot);
              }}
              onClick={(event) => {
                event.stopPropagation();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "28px",
                minHeight: "24px",
                padding: "2px 10px",
                borderRadius: RADIUS.pill,
                cursor: "pointer",
                fontSize: "12px",
                border: isActive
                  ? `2px solid ${COLORS.accent}`
                  : isEmpty
                    ? `1px dashed ${COLORS.placeholder}`
                    : `1px solid ${COLORS.fieldBorder}`,
                boxShadow: isActive ? FOCUS_RING : "none",
                background: isActive ? COLORS.accentSoft : COLORS.fieldBg,
                color: isActive ? COLORS.accentText : COLORS.placeholder,
              }}
            >
              {isEmpty ? (
                isActive ? (
                  <BlinkingCaret />
                ) : (
                  <span
                    style={{
                      lineHeight: 1,
                    }}
                  >
                    …
                  </span>
                )
              ) : (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    lineHeight: 1,
                  }}
                >
                  <MathRenderer latex={content} mode="inline" />

                  {isActive && <BlinkingCaret />}
                </span>
              )}
            </button>
          );
        })}
      </div>
    ) : (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 12px",
          borderRadius: RADIUS.pill,
          fontSize: "12px",
          background: COLORS.fieldBg,
          border: `1px solid ${COLORS.fieldBorder}`,
          color: COLORS.placeholder,
        }}
      >
        <span>baseline</span>

        <BlinkingCaret />
      </div>
    );

  const handleBackgroundClick = (event) => {
    if (event.target.closest("button")) {
      return;
    }

    const element = sourceRef.current;

    if (!element) {
      return;
    }

    element.focus();

    const mapped = placeholders;

    setPlaceholders(mapped);

    const endPosition = latex.length;

    element.setSelectionRange(endPosition, endPosition);

    setCaret(endPosition);
  };

  return (
    <div
      role="group"
      aria-label="Visual expression"
      onMouseDown={(event) => event.preventDefault()}
      onClick={handleBackgroundClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        padding: "18px 12px",
        border: `1px dashed ${COLORS.accentBorder}`,
        borderRadius: RADIUS.md,
        background: COLORS.surfaceAlt,
        cursor: "text",
      }}
    >
      <MathRenderer
        latex={getHighlightedDisplayLatex(latex, placeholders, caret)}
        mode="display"
      />

      {caret >= latex.length &&
        !placeholders.some(
          (placeholder) => caret >= placeholder.from && caret <= placeholder.to,
        ) && <BlinkingCaret />}

      {chips}
    </div>
  );
};

export default MathSlotsView;
