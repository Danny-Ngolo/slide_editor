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
import {
  navigatePlaceholder,
  offsetPlaceholders,
  detectPlaceholders,
} from "./mathPlaceholder";
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

const getHighlightedDisplayLatex = (latex, placeholders = [], caretPos) => {
  if (!latex || placeholders.length === 0) return latex;

  const activeSlot = placeholders.find(
    (p) => caretPos >= p.from && caretPos <= p.to,
  );
  if (!activeSlot) return latex; // Only highlight the active slot to prevent nested \colorbox / $ collisions

  const safeFrom = Math.max(0, Math.min(activeSlot.from, latex.length));
  const safeTo = Math.max(safeFrom, Math.min(activeSlot.to, latex.length));

  const before = latex.slice(0, safeFrom);
  const content = latex.slice(safeFrom, safeTo);
  const after = latex.slice(safeTo);

  const bgColor = COLORS.accentSoft;
  const textColor = COLORS.accentText;
  const displayContent = content.length === 0 ? "\\phantom{0}" : content;

  const wrapped = `\\colorbox{${bgColor}}{\\color{${textColor}}{$\\displaystyle ${displayContent}$}}`;
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

  const [activePlaceholders, setActivePlaceholders] = useState(() =>
    detectPlaceholders(latex),
  );
  const [caret, setCaret] = useState(0);
  const [view, setView] = useState("source");

  const pendingApply = useRef(null);
  const editAnchorRef = useRef(0);
  const prevLatexRef = useRef(latex);

  const activePlaceholdersRef = useRef(activePlaceholders);
  useEffect(() => {
    activePlaceholdersRef.current = activePlaceholders;
  }, [activePlaceholders]);

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleSelect = (e) => {
    setCaret(e.currentTarget.selectionStart ?? 0);
  };

  const landingSlot = (placeholders = [], pos) =>
    placeholders.find((p) => pos >= p.from && pos <= p.to) ??
    placeholders
      .map((p) => ({ p, d: Math.abs((p.from + p.to) / 2 - pos) }))
      .sort((a, b) => a.d - b.d)[0]?.p ??
    null;

  const applyItem = useCallback(
    (item) => {
      const el = sourceRef.current;
      if (!el) return;
      const selection = { start: el.selectionStart, end: el.selectionEnd };
      const currentLatex = prevLatexRef.current;
      const result = applyInsert(currentLatex, selection, item);

      let nextPlaceholders = result.placeholders;
      if (activePlaceholders.length > 0) {
        const adjustedExisting = offsetPlaceholders(
          activePlaceholders,
          currentLatex,
          result.latex,
          selection.start,
        );
        if (item.type === "template") {
          const combined = [...adjustedExisting, ...result.placeholders];
          nextPlaceholders = combined
            .sort((a, b) => a.from - b.from)
            .map((p, idx) => ({ ...p, index: idx }));
        } else {
          nextPlaceholders = adjustedExisting;
        }
      }

      pendingApply.current = {
        caret: result.selection,
        placeholders: nextPlaceholders,
      };
      setCaret(result.selection.start);
      prevLatexRef.current = result.latex;
      onChange?.(result.latex);
    },
    [activePlaceholders, onChange],
  );

  useLayoutEffect(() => {
    prevLatexRef.current = latex;
    const pending = pendingApply.current;
    if (!pending) return;
    const el = sourceRef.current;
    if (el) {
      el.focus();
      const slot = landingSlot(pending.placeholders, pending.caret.start);
      if (slot) {
        el.setSelectionRange(slot.from, slot.from);
        setCaret(slot.from);
      } else {
        el.setSelectionRange(pending.caret.start, pending.caret.end);
      }
      setActivePlaceholders(pending.placeholders);
    }
    pendingApply.current = null;
  }, [latex]);

  const captureEditAnchor = (e) => {
    const el = e.currentTarget;
    if (el) editAnchorRef.current = el.selectionStart ?? editAnchorRef.current;
  };

  const onSourceChange = (e) => {
    const el = e.currentTarget;
    const nextLatex = el.value;

    setActivePlaceholders((prev) =>
      offsetPlaceholders(
        prev,
        prevLatexRef.current,
        nextLatex,
        editAnchorRef.current,
      ),
    );

    prevLatexRef.current = nextLatex;
    setCaret(el.selectionStart ?? nextLatex.length);
    onChange?.(nextLatex);
  };

  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;

    const onKeyDown = (e) => {
      const map = activePlaceholdersRef.current;
      const caretPos = el.selectionStart;

      if (e.key === "Escape" && map.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        const currentSlot = map.find(
          (p) => caretPos >= p.from && caretPos <= p.to,
        );
        const allSlots = [...map].sort((a, b) => a.from - b.from);
        const exitPos = currentSlot
          ? currentSlot.to
          : (allSlots[allSlots.length - 1]?.to ?? caretPos);
        setActivePlaceholders([]);
        el.setSelectionRange(exitPos, exitPos);
        setCaret(exitPos);
        return;
      }

      if (e.key === "ArrowRight" && map.length > 0 && !e.shiftKey) {
        const currentSlot = map.find(
          (p) => caretPos >= p.from && caretPos <= p.to,
        );
        if (currentSlot && caretPos >= currentSlot.to) {
          setActivePlaceholders([]);
        }
      }

      if (e.key === "ArrowLeft" && map.length > 0 && !e.shiftKey) {
        const currentSlot = map.find(
          (p) => caretPos >= p.from && caretPos <= p.to,
        );
        if (currentSlot && caretPos <= currentSlot.from) {
          setActivePlaceholders([]);
        }
      }

      if (e.key === "Tab") {
        if (!map.length) return;

        const target = navigatePlaceholder(
          map,
          caretPos,
          e.shiftKey ? "prev" : "next",
        );
        if (target == null) return;

        const isWrapAround = e.shiftKey ? target > caretPos : target < caretPos;

        if (isWrapAround) {
          setActivePlaceholders([]);
          setCaret(caretPos);
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const slot =
          map.find((p) => Math.floor((p.from + p.to) / 2) === target) || null;
        if (slot) {
          el.setSelectionRange(slot.from, slot.from);
          editAnchorRef.current = slot.from;
          setCaret(slot.from);
        } else {
          el.setSelectionRange(target, target);
          editAnchorRef.current = target;
          setCaret(target);
        }
      }

      if (map.length > 0 && (e.key === "Backspace" || e.key === "Delete")) {
        const isCollapsed = el.selectionEnd === caretPos;
        if (isCollapsed) {
          const allSlotsEmpty = map.every((p) => p.to === p.from);
          if (allSlotsEmpty) {
            e.preventDefault();
            e.stopPropagation();
            setActivePlaceholders([]);
            setCaret(0);
            onChangeRef.current?.("");
            return;
          }

          const currentSlot = map.find(
            (p) => caretPos >= p.from && caretPos <= p.to,
          );
          if (currentSlot) {
            if (e.key === "Backspace" && caretPos === currentSlot.from) {
              e.preventDefault();
              e.stopPropagation();
            }
            if (e.key === "Delete" && caretPos === currentSlot.to) {
              e.preventDefault();
              e.stopPropagation();
            }
          }
        }
      }
    };

    el.addEventListener("keydown", onKeyDown, true);
    return () => el.removeEventListener("keydown", onKeyDown, true);
  }, []);

  const jumpToSlot = useCallback((slot) => {
    const el = sourceRef.current;
    if (!el || !slot) return;
    el.focus();
    el.setSelectionRange(slot.from, slot.from);
    editAnchorRef.current = slot.from;
    setCaret(slot.from);
  }, []);

  const onBlur = (e) => {
    if (
      containerRef.current &&
      e.relatedTarget &&
      containerRef.current.contains(e.relatedTarget)
    ) {
      return;
    }
    setActivePlaceholders([]);
    setCaret(e.currentTarget.selectionStart ?? 0);
  };

  const chips =
    activePlaceholders.length > 0 ? (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {activePlaceholders.map((slot) => {
          const content = latex.slice(slot.from, slot.to);
          const isActive = caret >= slot.from && caret <= slot.to;
          const isEmpty = content.length === 0;
          return (
            <button
              key={`${slot.index}-${slot.from}`}
              type="button"
              title="Click to fill this slot"
              aria-label={`Fill slot ${slot.index}`}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                jumpToSlot(slot);
              }}
              onClick={(e) => {
                e.stopPropagation();
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

  const switchView = (next) => {
    setView(next);
    const el = sourceRef.current;
    if (el) {
      el.focus();
      el.setSelectionRange(caret, caret);
    }
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
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
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
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => switchView("source")}
            aria-pressed={view === "source"}
            style={segmentedBtnStyle(view === "source")}
          >
            Source
          </button>
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
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
          onMouseDown={(e) => e.preventDefault()}
          onClick={(e) => {
            if (e.target.closest("button")) return;

            const el = sourceRef.current;
            if (!el) return;
            el.focus();

            setActivePlaceholders([]);
            const endPos = latex.length;
            el.setSelectionRange(endPos, endPos);
            setCaret(endPos);
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
            latex={getHighlightedDisplayLatex(latex, activePlaceholders, caret)}
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
