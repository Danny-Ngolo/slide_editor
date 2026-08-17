"use client";

import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import "highlight.js/styles/github.css";
import { highlightCode } from "./codeHighlight";
import { COLORS, RADIUS } from "../shared/styles";

const INDENT = "  ";
const GUTTER_WIDTH = 48;
const PADDING_TOP = 10;
const PADDING_BOTTOM = 10;
const PADDING_RIGHT = 12;
const CODE_PADDING_LEFT = GUTTER_WIDTH + 12;
const FONT = "'Courier New', monospace";
const FONT_SIZE = "13px";
const LINE_HEIGHT = 1.5;

const placeholderStyle = `
  .code-editor-textarea::placeholder {
    color: ${COLORS.placeholder};
  }
`;

const editorLayerStyle = {
  fontFamily: FONT,
  fontSize: FONT_SIZE,
  lineHeight: LINE_HEIGHT,
  whiteSpace: "pre",
  tabSize: 2,
};

const indentBlock = (text) => text.replace(/^/gm, INDENT);
const dedentBlock = (text) => text.replace(/^ {1,2}/gm, "");

const COMMENT_STYLES = {
  javascript: { line: "//" },
  typescript: { line: "//" },
  python: { line: "#" },
  html: { block: ["<!--", "-->"] },
  css: { block: ["/*", "*/"] },
  scss: { line: "//" },
  sql: { line: "--" },
  bash: { line: "#" },
  json: { line: "//" },
  xml: { block: ["<!--", "-->"] },
  yaml: { line: "#" },
  java: { line: "//" },
  c: { line: "//" },
  cpp: { line: "//" },
  csharp: { line: "//" },
  go: { line: "//" },
  rust: { line: "//" },
  php: { line: "//" },
  ruby: { line: "#" },
  swift: { line: "//" },
  kotlin: { line: "//" },
  markdown: { block: ["<!--", "-->"] },
};

const makeLineStyle = (prefix) => ({
  isCommented: (line) => line.trim().startsWith(prefix),
  comment: (line) => {
    const ws = (line.match(/^\s*/) || [""])[0].length;
    const text = `${line.slice(0, ws)}${prefix} ${line.slice(ws)}`;
    return { text, mapCol: (c) => (c <= ws ? c : c + prefix.length + 1) };
  },
  uncomment: (line) => {
    if (!line.trim().startsWith(prefix)) {
      return { text: line, mapCol: (c) => c };
    }
    const idx = line.indexOf(prefix);
    let drop = prefix.length;
    if (line[idx + prefix.length] === " ") drop += 1;
    const text = line.slice(0, idx) + line.slice(idx + drop);
    return { text, mapCol: (c) => (c <= idx ? c : c - drop) };
  },
});

const makeBlockStyle = (open, close) => ({
  isCommented: (line) => {
    const t = line.trim();
    return t.startsWith(open) && t.endsWith(close);
  },
  comment: (line) => {
    if (line.trim() === "") return { text: line, mapCol: (c) => c };
    const ws = (line.match(/^\s*/) || [""])[0].length;
    const text = `${line.slice(0, ws)}${open} ${line.slice(ws)} ${close}`;
    return {
      text,
      mapCol: (c) =>
        c >= line.length
          ? text.length
          : c <= ws
            ? c
            : ws + open.length + 1 + (c - ws),
    };
  },
  uncomment: (line) => {
    if (!line.trim().startsWith(open) || !line.trim().endsWith(close)) {
      return { text: line, mapCol: (c) => c };
    }
    const idxOpen = line.indexOf(open);
    const idxClose = line.lastIndexOf(close);
    let dropOpen = open.length;
    if (line[idxOpen + open.length] === " ") dropOpen += 1;
    let dropClose = close.length;
    if (line[idxClose - 1] === " ") dropClose += 1;
    const text =
      line.slice(0, idxOpen) +
      line.slice(idxOpen + dropOpen, idxClose - (dropClose - close.length)) +
      line.slice(idxClose + close.length);
    return {
      text,
      mapCol: (c) => {
        if (c <= idxOpen) return c;
        if (c >= idxClose + close.length) return c - dropOpen - dropClose;
        return c - dropOpen;
      },
    };
  },
});

const COMMENT_BUILDERS = {
  line: makeLineStyle,
  block: makeBlockStyle,
};

const getCommentStyle = (language) => {
  const def = COMMENT_STYLES[language];

  if (!def) return null;

  return def.line
    ? COMMENT_BUILDERS.line(def.line)
    : COMMENT_BUILDERS.block(def.block[0], def.block[1]);
};

const transformBlock = (block, style) => {
  const lines = block.split("\n");
  const nonEmpty = lines.filter((line) => line.trim() !== "");
  const mode =
    nonEmpty.length > 0 && nonEmpty.every(style.isCommented)
      ? "uncomment"
      : "comment";
  const results = lines.map((line) =>
    mode === "uncomment" ? style.uncomment(line) : style.comment(line),
  );

  return {
    text: results.map((r) => r.text).join("\n"),
    mapOffset: (offset) => {
      let remaining = offset;
      let i = 0;

      while (i < lines.length - 1 && remaining > lines[i].length) {
        remaining -= lines[i].length + 1;
        i += 1;
      }

      const col = Math.min(remaining, lines[i] ? lines[i].length : 0);
      let pos = 0;

      for (let j = 0; j < i; j += 1) pos += results[j].text.length + 1;

      return pos + results[i].mapCol(col);
    },
  };
};

const toggleCommentRange = (value, start, end, style) => {
  if (!style) return null;

  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const lineEnd = value.indexOf("\n", end);
  const blockStart = lineStart;
  const blockEnd = lineEnd === -1 ? value.length : lineEnd;
  const block = value.slice(blockStart, blockEnd);

  const transformed = transformBlock(block, style);

  return {
    value:
      value.slice(0, blockStart) + transformed.text + value.slice(blockEnd),
    start: blockStart + transformed.mapOffset(start - blockStart),
    end: blockStart + transformed.mapOffset(end - blockStart),
  };
};

const CodeEditor = ({
  code = "",
  language = null,
  onChange,
  placeholder = "Start typing or paste your code...",
}) => {
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const gutterRef = useRef(null);
  const pendingSelectionRef = useRef(null);

  const lineCount = code.split("\n").length;

  const highlighted = useMemo(
    () => highlightCode(code, language),
    [code, language],
  );

  const applyPendingSelection = useCallback(() => {
    const pending = pendingSelectionRef.current;

    pendingSelectionRef.current = null;

    if (!pending) return;

    const ta = textareaRef.current;

    if (!ta) return;

    ta.setSelectionRange(pending.start, pending.end);
  }, []);

  useLayoutEffect(applyPendingSelection, [code, applyPendingSelection]);

  const syncScroll = useCallback(() => {
    const ta = textareaRef.current;
    const pre = preRef.current;
    const gutter = gutterRef.current;

    if (!ta || !pre || !gutter) return;

    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
    gutter.scrollTop = ta.scrollTop;
  }, []);

  useEffect(() => {
    syncScroll();
  }, [syncScroll, lineCount]);

  const handleKeyDown = (e) => {
    const ta = e.currentTarget;

    if ((e.ctrlKey || e.metaKey) && e.key === "/") {
      const result = toggleCommentRange(
        ta.value,
        ta.selectionStart,
        ta.selectionEnd,
        getCommentStyle(language),
      );

      if (result) {
        e.preventDefault();
        e.stopPropagation();
        pendingSelectionRef.current = { start: result.start, end: result.end };
        onChange(result.value);
      }

      return;
    }

    if (e.key !== "Tab") return;

    e.preventDefault();
    e.stopPropagation();

    const { value, selectionStart: start, selectionEnd: end } = ta;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", end);
    const blockStart = lineStart;
    const blockEnd = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(blockStart, blockEnd);
    const transform = e.shiftKey ? dedentBlock : indentBlock;

    const next =
      value.slice(0, blockStart) + transform(block) + value.slice(blockEnd);

    const nextStart = blockStart + transform(value.slice(blockStart, start)).length;
    const nextEnd = blockStart + transform(value.slice(blockStart, end)).length;

    pendingSelectionRef.current = { start: nextStart, end: nextEnd };
    onChange(next);
  };

  const handleScroll = () => syncScroll();

  const gutterNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join(
    "\n",
  );

  return (
    <div
      style={{
        position: "relative",
        border: `1px solid ${COLORS.fieldBorder}`,
        borderRadius: RADIUS.md,
        background: COLORS.inputBg,
        overflow: "hidden",
      }}
    >
      <style>{placeholderStyle}</style>

      <div
        ref={gutterRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: GUTTER_WIDTH,
          overflow: "hidden",
          background: COLORS.fieldBg,
          borderRight: `1px solid ${COLORS.fieldBorder}`,
          paddingTop: PADDING_TOP,
          paddingBottom: PADDING_BOTTOM,
          boxSizing: "border-box",
          zIndex: 2,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            ...editorLayerStyle,
            textAlign: "right",
            paddingRight: "8px",
            color: COLORS.placeholder,
          }}
        >
          {gutterNumbers}
        </div>
      </div>

      <pre
        ref={preRef}
        aria-hidden="true"
        className="hljs"
        dangerouslySetInnerHTML={{ __html: highlighted }}
        style={{
          ...editorLayerStyle,
          margin: 0,
          padding: `${PADDING_TOP}px ${PADDING_RIGHT}px ${PADDING_BOTTOM}px ${CODE_PADDING_LEFT}px`,
          overflow: "hidden",
          background: "transparent",
          color: COLORS.text,
          minHeight: "60px",
        }}
      />

      <textarea
        ref={textareaRef}
        className="code-editor-textarea"
        data-code-editor
        value={code}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
        placeholder={placeholder}
        aria-label="Code"
        spellCheck="false"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        wrap="off"
        style={{
          ...editorLayerStyle,
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          padding: `${PADDING_TOP}px ${PADDING_RIGHT}px ${PADDING_BOTTOM}px ${CODE_PADDING_LEFT}px`,
          margin: 0,
          boxSizing: "border-box",
          border: "none",
          outline: "none",
          resize: "none",
          background: "transparent",
          color: "transparent",
          caretColor: COLORS.accent,
          overflow: "auto",
          zIndex: 1,
        }}
      />
    </div>
  );
};

export default CodeEditor;
