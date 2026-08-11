"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import MathRenderer from "./MathRenderer";
import MathSymbolToolbar from "./MathSymbolToolbar";
import { applyInsert } from "./mathInsert";
import { navigatePlaceholder } from "./mathPlaceholder";
import { MATH_GROUPS } from "./mathSymbols";
import { COLORS, RADIUS, FOCUS_RING } from "../shared/styles";

const caretBlinkStyle = `
  @keyframes math-caret-blink {
    from, to { background-color: transparent }
    50% { background-color: ${COLORS.accent} }
  }
`;

const BlinkingCaret = () => (
  <span
    style={{
      display: "inline-block",
      width: "1.5px",
      height: "14px",
      backgroundColor: COLORS.accent,
      marginLeft: "2px",
      animation: "math-caret-blink 1.5s step-end infinite",
    }}
  />
);

const getHighlightedDisplayLatex = (latex, placeholders, caretPos) => {
  if (!latex || placeholders.length === 0) {
    return latex;
  }

  const activeSlot = placeholders.find(
    (placeholder) => caretPos >= placeholder.from && caretPos <= placeholder.to,
  );

  if (!activeSlot) {
    return latex;
  }

  const from = Math.max(0, Math.min(activeSlot.from, latex.length));

  const to = Math.max(from, Math.min(activeSlot.to, latex.length));

  const before = latex.slice(0, from);
  const content = latex.slice(from, to);
  const after = latex.slice(to);

  const bgColor = COLORS.accentSoft;
  const textColor = COLORS.accentText;

  const displayContent = content.length === 0 ? "\\phantom{0}" : content;

  const wrapped =
    `\\colorbox{${bgColor}}{` +
    `\\color{${textColor}}{` +
    `$\\displaystyle ${displayContent}$` +
    `}` +
    `}`;

  return before + wrapped + after;
};

const MathEditor = ({
  latex = "",
  onChange,
  mode = "display",
  autoFocus = false,
  placeholder = "Type or paste a LaTeX expression…",
  toolbarGroups = MATH_GROUPS,
  showToolbar = true,
}) => {
  const sourceRef = useRef(null);
  const containerRef = useRef(null);

  const [placeholders, setPlaceholders] = useState([]);
  const [caret, setCaret] = useState(0);
  const [view, setView] = useState("source");

  const pendingInsertRef = useRef(null);
  const previousLatexRef = useRef(latex);
  const editAnchorRef = useRef(0);

  const placeholdersRef = useRef(placeholders);

  useEffect(() => {
    placeholdersRef.current = placeholders;
  }, [placeholders]);

  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleSelect = (event) => {
    setCaret(event.currentTarget.selectionStart ?? 0);
  };

  const applyItem = useCallback(
    (item) => {
      const element = sourceRef.current;

      if (!element) {
        return;
      }

      const selection = {
        start: element.selectionStart,
        end: element.selectionEnd,
      };

      const currentLatex = previousLatexRef.current;

      const result = applyInsert(
        currentLatex,
        selection,
        item,
        placeholdersRef.current,
      );

      pendingInsertRef.current = {
        caret: result.selection.start,
        placeholders: result.placeholders,
      };

      previousLatexRef.current = result.latex;

      setCaret(result.selection.start);
      onChange?.(result.latex);
    },
    [onChange],
  );

  useLayoutEffect(() => {
    previousLatexRef.current = latex;

    const pending = pendingInsertRef.current;

    if (!pending) {
      return;
    }

    const element = sourceRef.current;

    if (!element) {
      pendingInsertRef.current = null;
      return;
    }

    element.focus();

    element.setSelectionRange(pending.caret, pending.caret);

    setCaret(pending.caret);
    setPlaceholders(pending.placeholders);

    pendingInsertRef.current = null;
  }, [latex]);

  const captureEditAnchor = (event) => {
    const element = event.currentTarget;

    if (element) {
      editAnchorRef.current = element.selectionStart ?? editAnchorRef.current;
    }
  };

  const onSourceChange = (event) => {
    const element = event.currentTarget;
    const nextLatex = element.value;

    const previousLatex = previousLatexRef.current;

    const delta = nextLatex.length - previousLatex.length;

    const editPosition = editAnchorRef.current;

    const updatedPlaceholders = placeholdersRef.current
      .map((placeholder) => {
        if (editPosition < placeholder.from) {
          return {
            ...placeholder,
            from: placeholder.from + delta,
            to: placeholder.to + delta,
          };
        }

        if (editPosition > placeholder.to) {
          return placeholder;
        }

        return {
          ...placeholder,
          to: Math.max(placeholder.from, placeholder.to + delta),
        };
      })
      .filter(
        (placeholder) =>
          placeholder.from <= nextLatex.length &&
          placeholder.to <= nextLatex.length,
      );

    previousLatexRef.current = nextLatex;

    setPlaceholders(updatedPlaceholders);
    setCaret(element.selectionStart ?? nextLatex.length);

    onChangeRef.current?.(nextLatex);
  };

  useEffect(() => {
    const element = sourceRef.current;

    if (!element) {
      return;
    }

    const onKeyDown = (event) => {
      const map = placeholdersRef.current;
      const caretPos = element.selectionStart;

      if (event.key === "Escape") {
        if (map.length === 0) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        const ordered = [...map].sort((a, b) => a.from - b.from);

        const exitPosition = current
          ? current.to
          : (ordered.at(-1)?.to ?? caretPos);

        setPlaceholders([]);

        element.setSelectionRange(exitPosition, exitPosition);

        setCaret(exitPosition);
        return;
      }

      if (event.key === "Tab" && map.length > 0) {
        const target = navigatePlaceholder(
          map,
          caretPos,
          event.shiftKey ? "prev" : "next",
        );

        if (target == null) {
          return;
        }

        const ordered = [...map].sort((a, b) => a.from - b.from);

        const currentIndex = ordered.findIndex(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        const targetIndex = ordered.findIndex(
          (placeholder) =>
            Math.floor((placeholder.from + placeholder.to) / 2) === target,
        );

        const wrapping =
          currentIndex !== -1 &&
          targetIndex !== -1 &&
          (event.shiftKey
            ? targetIndex > currentIndex
            : targetIndex < currentIndex);

        if (wrapping) {
          event.preventDefault();
          event.stopPropagation();

          setPlaceholders([]);

          setCaret(caretPos);
          return;
        }

        event.preventDefault();
        event.stopPropagation();

        element.focus();
        element.setSelectionRange(target, target);

        editAnchorRef.current = target;
        setCaret(target);
        return;
      }

      if (event.key === "ArrowRight" && !event.shiftKey && map.length > 0) {
        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        if (current && caretPos >= current.to) {
          setPlaceholders([]);
        }

        return;
      }

      if (event.key === "ArrowLeft" && !event.shiftKey && map.length > 0) {
        const current = map.find(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        if (current && caretPos <= current.from) {
          setPlaceholders([]);
        }
      }
    };

    element.addEventListener("keydown", onKeyDown, true);

    return () => element.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const jumpToSlot = useCallback((slot) => {
    const element = sourceRef.current;

    if (!element || !slot) {
      return;
    }

    element.focus();

    element.setSelectionRange(slot.from, slot.from);

    editAnchorRef.current = slot.from;
    setCaret(slot.from);
  }, []);

  const onBlur = (event) => {
    if (
      containerRef.current &&
      event.relatedTarget &&
      containerRef.current.contains(event.relatedTarget)
    ) {
      return;
    }

    setPlaceholders([]);

    setCaret(event.currentTarget.selectionStart ?? 0);
  };

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
              key={`${slot.from}-${slot.to}`}
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
                  <span style={{ lineHeight: 1 }}>…</span>
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

  const segmentedBtnStyle = (isActive) => ({
    padding: "4px 12px",
    border: "none",
    fontSize: "12px",
    cursor: "pointer",
    background: isActive ? COLORS.accent : "transparent",
    color: isActive ? "#ffffff" : COLORS.label,
    transition: "background 0.15s ease, color 0.15s ease",
  });

  const hiddenTextareaStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "1px",
    boxSizing: "border-box",
    padding: 0,
    margin: 0,
    border: "none",
    background: "transparent",
    color: "transparent",
    caretColor: "transparent",
    resize: "none",
    opacity: 0,
    overflow: "hidden",
    pointerEvents: "none",
  };

  const visibleTextareaStyle = {
    width: "100%",
    boxSizing: "border-box",
    fontFamily: "'Courier New', monospace",
    fontSize: "13px",
    padding: "8px 10px",
    border: `1px solid ${COLORS.fieldBorder}`,
    borderRadius: "6px",
    background: COLORS.inputBg,
    color: COLORS.text,
    resize: "vertical",
  };

  const switchView = (nextView) => {
    setView(nextView);

    const element = sourceRef.current;

    if (!element) {
      return;
    }

    element.focus();
    element.setSelectionRange(caret, caret);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <style>{caretBlinkStyle}</style>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            border: `1px solid ${COLORS.fieldBorder}`,
            borderRadius: RADIUS.sm,
            overflow: "hidden",
          }}
        >
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => switchView("source")}
            aria-pressed={view === "source"}
            style={segmentedBtnStyle(view === "source")}
          >
            Source
          </button>

          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => switchView("slots")}
            aria-pressed={view === "slots"}
            style={segmentedBtnStyle(view === "slots")}
          >
            Visual
          </button>
        </div>
      </div>

      {showToolbar && (
        <MathSymbolToolbar
          groups={toolbarGroups}
          onInsert={applyItem}
          compact
        />
      )}

      {view === "slots" && (
        <div
          role="group"
          aria-label="Visual expression"
          onMouseDown={(event) => event.preventDefault()}
          onClick={(event) => {
            if (event.target.closest("button")) {
              return;
            }

            const element = sourceRef.current;

            if (!element) {
              return;
            }

            element.focus();

            setPlaceholders([]);

            const endPosition = latex.length;

            element.setSelectionRange(endPosition, endPosition);

            setCaret(endPosition);
          }}
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

          {chips}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <textarea
          ref={sourceRef}
          value={latex}
          onChange={onSourceChange}
          onSelect={handleSelect}
          onKeyDown={captureEditAnchor}
          onBeforeInput={captureEditAnchor}
          onPointerDown={captureEditAnchor}
          onCompositionStart={captureEditAnchor}
          onBlur={onBlur}
          autoFocus={autoFocus}
          placeholder={placeholder}
          aria-label="LaTeX source"
          spellCheck="false"
          rows={2}
          style={view === "source" ? visibleTextareaStyle : hiddenTextareaStyle}
        />
      </div>

      {view === "source" && chips}

      {view === "source" && <MathRenderer latex={latex} mode={mode} />}
    </div>
  );
};

export default MathEditor;
