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

import { analyzeLatex, navigatePlaceholder } from "./mathPlaceholder";

import { MATH_GROUPS } from "./mathSymbols";
import { COLORS, RADIUS, FOCUS_RING } from "../shared/styles";

const caretBlinkStyle = `
  @keyframes math-caret-blink {
    from, to { background-color: transparent }
    50% { background-color: ${COLORS.accent} }
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

const innermostTemplateAt = (templates, position) => {
  let innermost = null;

  for (const template of templates) {
    if (template.from <= position && position < template.to) {
      if (
        !innermost ||
        template.to - template.from < innermost.to - innermost.from
      ) {
        innermost = template;
      }
    }
  }

  return innermost;
};

const isStructuralPosition = (templates, position) => {
  const innermost = innermostTemplateAt(templates, position);

  if (!innermost) {
    return false;
  }

  return !innermost.slots.some(
    (slot) => slot.from <= position && position < slot.to,
  );
};

const rangeHasStructuralPosition = (templates, from, to) => {
  for (let position = from; position < to; position++) {
    if (isStructuralPosition(templates, position)) {
      return true;
    }
  }

  return false;
};

const findRemovableEmptyTemplate = (analysis, position, deleteKey) => {
  const candidates = analysis.templates.filter((template) => {
    const inside = deleteKey
      ? position >= template.from && position < template.to
      : position >= template.from && position <= template.to;

    if (!inside) {
      return false;
    }

    return template.slots.every((slot) => slot.from === slot.to);
  });

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.to - a.from - (b.to - b.from))[0];
};

const isColorboxSafe = (content) => {
  let depth = 0;

  for (let index = 0; index < content.length; index++) {
    if (content[index] === "\\") {
      index++;
      continue;
    }

    if (content[index] === "{") {
      depth++;
      continue;
    }

    if (content[index] === "}") {
      depth--;

      if (depth < 0) {
        return false;
      }
    }
  }

  return depth === 0;
};

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

  const displayContent = content.length === 0 ? "\\phantom{0}" : content;

  if (!isColorboxSafe(displayContent)) {
    return latex;
  }

  const wrapped =
    `\\colorbox{${COLORS.accentSoft}}{` +
    `\\color{${COLORS.accentText}}{` +
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

  const analysis = useMemo(() => analyzeLatex(latex), [latex]);

  const [placeholders, setPlaceholders] = useState(analysis.placeholders);

  const [caret, setCaret] = useState(0);

  const [view, setView] = useState("source");

  const previousLatexRef = useRef(latex);

  const pendingCaretRef = useRef(null);

  const structureRef = useRef(analysis);

  const placeholdersRef = useRef(placeholders);

  const [previousLatex, setPreviousLatex] = useState(latex);

  if (previousLatex !== latex) {
    setPreviousLatex(latex);

    setPlaceholders(analysis.placeholders);
  }

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

  const applyItem = useCallback((item) => {
    const element = sourceRef.current;

    if (!element) {
      return;
    }

    const selection = {
      start: element.selectionStart ?? previousLatexRef.current.length,

      end: element.selectionEnd ?? element.selectionStart ?? 0,
    };

    const result = applyInsert(previousLatexRef.current, selection, item);

    const analysis = analyzeLatex(result.latex);

    structureRef.current = analysis;

    setPlaceholders(analysis.placeholders);

    pendingCaretRef.current = result.selection.start;

    previousLatexRef.current = result.latex;

    setCaret(result.selection.start);

    onChangeRef.current?.(result.latex);
  }, []);

  useLayoutEffect(() => {
    previousLatexRef.current = latex;

    structureRef.current = analysis;

    const pendingCaret = pendingCaretRef.current;

    if (pendingCaret === null) {
      return;
    }

    const element = sourceRef.current;

    if (!element) {
      pendingCaretRef.current = null;
      return;
    }

    element.focus();

    const nextCaret = Math.max(0, Math.min(pendingCaret, latex.length));

    element.setSelectionRange(nextCaret, nextCaret);

    setCaret(nextCaret);

    pendingCaretRef.current = null;
  }, [latex, analysis]);

  const onSourceChange = (event) => {
    const element = event.currentTarget;

    const nextLatex = element.value;

    const analysis = analyzeLatex(nextLatex);

    previousLatexRef.current = nextLatex;

    structureRef.current = analysis;

    setPlaceholders(analysis.placeholders);

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

      const structure = structureRef.current;

      const caretPos = element.selectionStart ?? 0;

      const selectionEnd = element.selectionEnd ?? caretPos;

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
          : (ordered[ordered.length - 1]?.to ?? caretPos);

        setPlaceholders([]);

        element.setSelectionRange(exitPosition, exitPosition);

        setCaret(exitPosition);

        return;
      }

      if (event.key === "Tab" && map.length > 0) {
        event.stopPropagation();

        const target = navigatePlaceholder(
          map,
          caretPos,
          event.shiftKey ? "prev" : "next",
        );

        if (target === null) {
          return;
        }

        const ordered = [...map].sort((a, b) => a.from - b.from);

        const currentIndex = ordered.findIndex(
          (placeholder) =>
            caretPos >= placeholder.from && caretPos <= placeholder.to,
        );

        const targetIndex = ordered.findIndex(
          (placeholder) => placeholder.to === target,
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

        return;
      }

      if (event.key === "Backspace" || event.key === "Delete") {
        const templates = structure.templates;

        if (templates.length > 0) {
          const removable = findRemovableEmptyTemplate(
            structure,
            caretPos,
            event.key === "Delete",
          );

          if (removable) {
            event.preventDefault();
            event.stopPropagation();

            const currentLatex = previousLatexRef.current;

            const cleanedLatex =
              currentLatex.slice(0, removable.from) +
              currentLatex.slice(removable.to);

            const nextAnalysis = analyzeLatex(cleanedLatex);

            const nextCaret = Math.min(removable.from, cleanedLatex.length);

            previousLatexRef.current = cleanedLatex;

            structureRef.current = nextAnalysis;

            setPlaceholders(nextAnalysis.placeholders);

            setCaret(nextCaret);

            pendingCaretRef.current = nextCaret;

            onChangeRef.current?.(cleanedLatex);

            return;
          }

          const hasSelection = selectionEnd !== caretPos;

          const deleteFrom = hasSelection
            ? Math.min(caretPos, selectionEnd)
            : event.key === "Backspace"
              ? caretPos - 1
              : caretPos;

          const deleteTo = hasSelection
            ? Math.max(caretPos, selectionEnd)
            : deleteFrom + 1;

          if (rangeHasStructuralPosition(templates, deleteFrom, deleteTo)) {
            event.preventDefault();
            event.stopPropagation();
          }
        }

        return;
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

    element.setSelectionRange(slot.to, slot.to);

    setCaret(slot.to);
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

    if (nextView === "slots") {
      const mapped = analysis.placeholders;

      const insidePlaceholder = mapped.some(
        (placeholder) => caret >= placeholder.from && caret <= placeholder.to,
      );

      const nextCaret = insidePlaceholder ? caret : latex.length;

      setPlaceholders(mapped);

      setCaret(nextCaret);

      element.setSelectionRange(nextCaret, nextCaret);

      return;
    }

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

            const mapped = analysis.placeholders;

            setPlaceholders(mapped);

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

          {caret >= latex.length &&
            !placeholders.some(
              (placeholder) =>
                caret >= placeholder.from && caret <= placeholder.to,
            ) && <BlinkingCaret />}

          {chips}
        </div>
      )}

      <div
        style={{
          position: "relative",
        }}
      >
        <textarea
          ref={sourceRef}
          value={latex}
          onChange={onSourceChange}
          onSelect={handleSelect}
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
