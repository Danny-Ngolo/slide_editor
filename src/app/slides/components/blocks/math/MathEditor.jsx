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
import { navigatePlaceholder, offsetPlaceholders, detectPlaceholders } from "./mathPlaceholder";
import { MATH_GROUPS } from "./mathSymbols";
import { COLORS, RADIUS, FOCUS_RING } from "../shared/styles";

// Fully controlled editing component (§16.12 State Ownership Contract).
// MathEditor owns no persistent data: it receives `latex` via props and reports
// edits through `onChange`. In-progress text is held by the block layer.
//
// The toolbar is composed internally on purpose: since insertion must read the
// textarea's live caret (DOM state React deliberately doesn't track), the
// insert command lives *in the same component* as the caret. That makes it a
// plain callback, avoiding any imperative ref handle.
//
// Calculator-style authoring (Step 1) + Slots view (Step 2, §16.4/§16.9):
// - Templates land as *slots*; the transient placeholder map survives typing
//   (offsetPlaceholders) and drives Tab/Shift+Tab + the chip strip.
// - `view` toggles "source" (LaTeX textarea, the escape hatch for LaTeX-literate
//   users) and "visual" (proof-sheet: big preview + chips; the textarea stays
//   mounted but visually hidden so native typing/arrows/delete/IME keep working
//   against it). The toggle and the slot map are transient editor state — never
//   persisted, so the document schema, withDefaults and history stay untouched.
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
  if (placeholders.length === 0) return latex;

  // Find which slot the caret is currently in
  const activeSlot = placeholders.find((p) => caretPos >= p.from && caretPos <= p.to);

  // Sort placeholders from right to left (descending by 'from')
  const sorted = [...placeholders].sort((a, b) => b.from - a.from);

  let result = latex;
  for (const slot of sorted) {
    const before = result.slice(0, slot.from);
    const content = result.slice(slot.from, slot.to);
    const after = result.slice(slot.to);

    const isActive = activeSlot && slot.index === activeSlot.index;
    const bgColor = isActive ? COLORS.accentSoft : "#f1f3f5"; // soft gray for inactive slots
    const textColor = isActive ? COLORS.accentText : COLORS.text;
    const displayContent = content.length === 0 ? "\\phantom{0}" : content;

    const wrapped = `\\colorbox{${bgColor}}{\\color{${textColor}}{$${displayContent}$}}`;
    result = before + wrapped + after;
  }
  return result;
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

  // Transient slot map (§16.4) — [{ index, from, to }] measured against the
  // current `latex`. Never persisted; recomputed from inserts, kept alive
  // across user edits, discarded when the walk is done or focus leaves.
  // `caret` mirrors the live caret for which slot chip is highlighted.
  const [activePlaceholders, setActivePlaceholders] = useState(() => detectPlaceholders(latex));
  const [caret, setCaret] = useState(0);
  const [view, setView] = useState("source"); // "source" | "slots"

  // Adjust the slot map when a *prop* changes, not on every render: once the
  // `latex` prop becomes a known template shape while no walk is active (block
  // load / undo / paste / view switch), seed it. This is the React-recommended
  // "derive state from props during render" pattern — safe from the cascade it
  // would cause inside an effect.
  const [prevLatex, setPrevLatex] = useState(latex);
  if (prevLatex !== latex) {
    setPrevLatex(latex);
    if (activePlaceholders.length === 0) {
      const parsed = detectPlaceholders(latex);
      if (parsed.length > 0) setActivePlaceholders(parsed);
    }
  }

  const pendingApply = useRef(null); // { caret: {start,end}, placeholders }
  // Caret position BEFORE the current edit. Only events that fire while the DOM
  // is still unmodified may write it — never `onSelect` (the selection change
  // event fires AFTER the text/selection moved, i.e. post-edit).
  const editAnchorRef = useRef(0);
  const prevLatexRef = useRef(latex); // latex the previous render saw

  // Live mirror for the native Tab listener (capture-phase, element-level).
  const activePlaceholdersRef = useRef(activePlaceholders);
  useEffect(() => {
    activePlaceholdersRef.current = activePlaceholders;
  }, [activePlaceholders]);

  const viewRef = useRef(view);
  useEffect(() => {
    viewRef.current = view;
  }, [view]);

  // Mirror for the native listener so it can report edits without being
  // re-registered every render (and without tripping the deps linter).
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const handleSelect = (e) => {
    setCaret(e.currentTarget.selectionStart ?? 0);
  };

  // The slot the caret landed in — exact containment, else nearest center.
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
      const result = applyInsert(latex, selection, item);

      let nextPlaceholders = result.placeholders;
      if (activePlaceholders.length > 0) {
        const adjustedExisting = offsetPlaceholders(
          activePlaceholders,
          latex,
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
      onChange?.(result.latex);
    },
    [latex, onChange, activePlaceholders],
  );

  // After the parent applies the new `latex`, restore the caret so the typed
  // insert lands in the right place — and select the landing slot's FULL range
  // (select-on-landing), so the first keystroke replaces any seed content.
  useLayoutEffect(() => {
    prevLatexRef.current = latex;
    const pending = pendingApply.current;
    if (!pending) return;
    const el = sourceRef.current;
    if (el) {
      el.focus();
      const slot = landingSlot(pending.placeholders, pending.caret.start);
      if (slot) {
        el.setSelectionRange(slot.from, slot.to);
        setCaret(slot.from);
      } else {
        el.setSelectionRange(pending.caret.start, pending.caret.end);
      }
      setActivePlaceholders(pending.placeholders);
    }
    pendingApply.current = null;
  }, [latex]);

  // Capture the pre-edit caret from events guaranteed to fire on the untouched
  // DOM: keyboard press (keydown), any input mutation about to happen
  // (beforeinput), pointer placement, and IME composition start.
  const captureEditAnchor = (e) => {
    const el = e.currentTarget;
    if (el) editAnchorRef.current = el.selectionStart ?? editAnchorRef.current;
  };

  const onSourceChange = (e) => {
    const el = e.currentTarget;
    const nextLatex = el.value;

    // Keep the slot map alive: this edit started at editAnchorRef (the pre-edit
    // caret); shift the slots that lie at/after it, grow the one it hit.
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

  // Tab / Shift+Tab slot walk, via a NATIVE capture-phase listener on the
  // textarea. Capture on the target fires before any ancestor or delegated
  // listener, so no parent keydown handler or event-delegation quirk can
  // swallow or re-route the key before we preventDefault it.
  useEffect(() => {
    const el = sourceRef.current;
    if (!el) return;

    const onKeyDown = (e) => {
      if (e.key === "Tab") {
        const map = activePlaceholdersRef.current;
        if (!map.length) return; // nothing to walk -> default browser behavior

        const caretPos = el.selectionStart;
        const target = navigatePlaceholder(
          map,
          caretPos,
          e.shiftKey ? "prev" : "next",
        );
        if (target == null) return;

        // Wrap-around detection: if going next, target center should be larger; if prev, smaller.
        const isWrapAround = e.shiftKey ? target > caretPos : target < caretPos;

        if (isWrapAround) {
          setActivePlaceholders([]);
          setCaret(caretPos);
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const slot = map.find((p) => Math.floor((p.from + p.to) / 2) === target) || null;
        if (slot) {
          // Select-on-landing: select the whole slot so typing replaces content.
          el.setSelectionRange(slot.from, slot.to);
          editAnchorRef.current = slot.from;
          setCaret(slot.from);
        } else {
          el.setSelectionRange(target, target);
          editAnchorRef.current = target;
          setCaret(target);
        }
      }

      if (viewRef.current === "slots" && (e.key === "Backspace" || e.key === "Delete")) {
        const map = activePlaceholdersRef.current;
        if (!map.length) return;

        const caretPos = el.selectionStart;
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

          const currentSlot = map.find((p) => caretPos >= p.from && caretPos <= p.to);
          if (currentSlot) {
            if (e.key === "Backspace" && caretPos === currentSlot.from) {
              e.preventDefault();
              e.stopPropagation();
            } else if (e.key === "Delete" && caretPos === currentSlot.to) {
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

  // Jump the caret into a slot when its chip is clicked.
  const jumpToSlot = useCallback((slot) => {
    const el = sourceRef.current;
    if (!el || !slot) return;
    el.focus();
    el.setSelectionRange(slot.from, slot.to);
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

  // Chip strip: one pill per active slot. Lit = caret inside, dashed hollow box
  // (`…`) = empty, otherwise live KaTeX of the slot's current value.
  const chips = activePlaceholders.length > 0 && (
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
              isActive ? <BlinkingCaret /> : <span style={{ lineHeight: 1 }}>…</span>
            ) : (
              <span style={{ display: "inline-flex", alignItems: "center", lineHeight: 1 }}>
                <MathRenderer latex={content} mode="inline" />
                {isActive && <BlinkingCaret />}
              </span>
            )}
          </button>
        );
      })}
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

  // Visually hide the textarea without unmounting it: native typing, arrows,
  // delete, selection and IME must keep operating against a real input even
  // when only the preview + chips are visible.
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
          onClick={() => {
            const el = sourceRef.current;
            if (!el) return;
            el.focus();
            const map = activePlaceholdersRef.current;
            if (map.length > 0) {
              const caretPos = el.selectionStart;
              const slot = landingSlot(map, caretPos);
              if (slot) {
                el.setSelectionRange(slot.from, slot.to);
                editAnchorRef.current = slot.from;
                setCaret(slot.from);
              }
            }
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
          <MathRenderer latex={getHighlightedDisplayLatex(latex, activePlaceholders, caret)} mode="display" />
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
