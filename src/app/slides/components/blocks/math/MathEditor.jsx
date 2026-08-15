"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import MathRenderer from "./MathRenderer";
import MathSlotsView from "./MathSlotsView";
import MathEditorShell from "./MathEditorShell";
import { applyInsert } from "./mathInsert";

import { analyzeLatex } from "./mathPlaceholder";

import {
  findRemovableEmptyTemplate,
  getSelectedTemplate,
} from "./mathEditorUtils";

import { MATH_GROUPS } from "./mathSymbols";
import { COLORS, RADIUS } from "../shared/styles";
import { useMathEditorKeyboard } from "./useMathEditorKeyboard";

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

  const mouseDownInsideRef = useRef(false);

  const analysis = useMemo(() => analyzeLatex(latex), [latex]);

  const [placeholders, setPlaceholders] = useState(analysis.placeholders);

  const [caret, setCaret] = useState(0);

  const [view, setView] = useState("slots");

  const viewRef = useRef(view);

  useEffect(() => {
    viewRef.current = view;
  }, [view]);

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

  useEffect(() => {
    const clearMouseDownFlag = () => {
      mouseDownInsideRef.current = false;
    };

    window.addEventListener("pointerup", clearMouseDownFlag);

    window.addEventListener("blur", clearMouseDownFlag);

    return () => {
      window.removeEventListener("pointerup", clearMouseDownFlag);

      window.removeEventListener("blur", clearMouseDownFlag);
    };
  }, []);

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

  const selectedTemplate = useMemo(() => {
    if (view !== "slots") {
      return null;
    }

    if (
      findRemovableEmptyTemplate(analysis, caret, false) ||
      findRemovableEmptyTemplate(analysis, caret, true)
    ) {
      return null;
    }

    return (
      getSelectedTemplate(analysis, caret, "Backspace") ??
      getSelectedTemplate(analysis, caret, "Delete")
    );
  }, [view, analysis, caret]);

  useMathEditorKeyboard({
    elementRef: sourceRef,
    structureRef,
    placeholdersRef,
    previousLatexRef,
    viewRef,
    setPlaceholders,
    setCaret,
    onChangeRef,
    pendingCaretRef,
  });

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
    const insideContainer =
      containerRef.current &&
      event.relatedTarget &&
      containerRef.current.contains(event.relatedTarget);

    const windowFocused =
      typeof document !== "undefined" &&
      document.hasFocus() &&
      document.visibilityState !== "hidden";

    if (insideContainer || !windowFocused || mouseDownInsideRef.current) {
      return;
    }

    setPlaceholders([]);

    setCaret(event.currentTarget.selectionStart ?? 0);
  };

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
      onMouseDownCapture={() => {
        mouseDownInsideRef.current = true;
      }}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "8px",
      }}
    >
      <style>{caretBlinkStyle}</style>

      <MathEditorShell
        view={view}
        switchView={switchView}
        showToolbar={showToolbar}
        toolbarGroups={toolbarGroups}
        applyItem={applyItem}
      >
        {view === "slots" && (
          <MathSlotsView
            latex={latex}
            placeholders={placeholders}
            caret={caret}
            selectedTemplate={selectedTemplate}
            sourceRef={sourceRef}
            jumpToSlot={jumpToSlot}
            setPlaceholders={setPlaceholders}
            setCaret={setCaret}
            BlinkingCaret={BlinkingCaret}
          />
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
            style={
              view === "source" ? visibleTextareaStyle : hiddenTextareaStyle
            }
          />
        </div>

        {view === "source" && placeholders.length > 0 && (
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
                    boxShadow: isActive
                      ? "0 0 0 2px rgba(99, 102, 241, 0.15)"
                      : "none",
                    background: isActive ? "#e0e7ff" : COLORS.fieldBg,
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
        )}

        {view === "source" && placeholders.length === 0 && (
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
        )}

        {view === "source" && <MathRenderer latex={latex} mode={mode} />}
      </MathEditorShell>
    </div>
  );
};

export default MathEditor;
