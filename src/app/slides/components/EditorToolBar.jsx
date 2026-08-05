"use client";

import React, { useEffect, useRef, useState } from "react";
import { useEditorContext } from "./EditorContext";
import { useHistory } from "../hooks/useHistory";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Code,
  Ellipsis,
  Heading1,
  Heading2,
  Heading3,
  Highlighter,
  Italic,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
  Undo2,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";

const COMPACT_BREAKPOINT = "1024px";
const DIVIDER = {
  width: "1px",
  alignSelf: "stretch",
  background: "#ccc",
  margin: "0 4px",
};

const EditorToolBar = () => {
  const { activeEditor, editorState, editorToolBarRef, isUndoRedoRef } =
    useEditorContext();
  const { undo, redo, slidesHistory } = useHistory();
  const [isCompact, setIsCompact] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  const [showMore, setShowMore] = useState(false);
  const moreRef = useRef(null);

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${COMPACT_BREAKPOINT})`);
    const update = () => setIsCompact(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) {
        setShowMore(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const iconSize =
    viewportWidth < 480 ? 15 : viewportWidth < 768 ? 17 : viewportWidth < 1100 ? 18 : 20;

  if (!activeEditor) {
    return (
      <div
        ref={editorToolBarRef}
        style={{
          padding: "10px",
          borderBottom: "1px solid #ccc",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          position: "sticky",
          top: 0,
          background: "white",
          zIndex: 10,
        }}
      >
        <UndoRedoGroup undo={undo} redo={redo} isUndoRedoRef={isUndoRedoRef} slidesHistory={slidesHistory} size={iconSize} />
        <div style={{ ...DIVIDER }} />
        <p style={{ color: "#111" }}>Select a block to show edit options.</p>
      </div>
    );
  }

  const handleLink = () => {
    const previousUrl = activeEditor.getAttributes("link").href || "";
    const url = window.prompt("Enter link URL", previousUrl || "https://");

    if (url === null) return;

    if (url.trim() === "") {
      activeEditor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    activeEditor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  };

  const tools = [
    { id: "bold", label: "Bold", Icon: Bold, primary: true, isActive: (s) => s.bold, onClick: () => activeEditor.chain().focus().toggleBold().run() },
    { id: "italic", label: "Italic", Icon: Italic, primary: true, isActive: (s) => s.italic, onClick: () => activeEditor.chain().focus().toggleItalic().run() },
    { id: "underline", label: "Underline", Icon: Underline, primary: true, isActive: (s) => s.underline, onClick: () => activeEditor.chain().focus().toggleUnderline().run() },
    { id: "strike", label: "Strike", Icon: Strikethrough, isActive: (s) => s.strike, onClick: () => activeEditor.chain().focus().toggleStrike().run() },
    { id: "code", label: "Inline code", Icon: Code, isActive: (s) => s.code, onClick: () => activeEditor.chain().focus().toggleCode().run() },
    { id: "subscript", label: "Subscript", Icon: Subscript, isActive: (s) => s.subscript, onClick: () => activeEditor.chain().focus().toggleSubscript().run() },
    { id: "superscript", label: "Superscript", Icon: Superscript, isActive: (s) => s.superscript, onClick: () => activeEditor.chain().focus().toggleSuperscript().run() },

    { id: "h1", label: "Heading 1", Icon: Heading1, primary: true, isActive: (s) => s.heading1, onClick: () => activeEditor.chain().focus().toggleHeading({ level: 1 }).run() },
    { id: "h2", label: "Heading 2", Icon: Heading2, primary: true, isActive: (s) => s.heading2, onClick: () => activeEditor.chain().focus().toggleHeading({ level: 2 }).run() },
    { id: "h3", label: "Heading 3", Icon: Heading3, primary: true, isActive: (s) => s.heading3, onClick: () => activeEditor.chain().focus().toggleHeading({ level: 3 }).run() },
    { id: "paragraph", label: "Paragraph", Icon: Pilcrow, isActive: (s) => s.paragraph, onClick: () => activeEditor.chain().focus().setParagraph().run() },

    { id: "bullet", label: "Bullet list", Icon: List, primary: true, isActive: (s) => s.bulletList, onClick: () => activeEditor.chain().focus().toggleBulletList().run() },
    { id: "ordered", label: "Ordered list", Icon: ListOrdered, primary: true, isActive: (s) => s.orderedList, onClick: () => activeEditor.chain().focus().toggleOrderedList().run() },
    { id: "taskList", label: "Task list", Icon: ListChecks, isActive: (s) => s.taskList, onClick: () => activeEditor.chain().focus().toggleTaskList().run() },
    { id: "blockquote", label: "Block quote", Icon: Quote, primary: true, isActive: (s) => s.blockquote, onClick: () => activeEditor.chain().focus().toggleBlockquote().run() },

    { id: "alignLeft", label: "Align left", Icon: AlignLeft, isActive: (s) => s.textAlignLeft, onClick: () => activeEditor.chain().focus().setTextAlign("left").run() },
    { id: "alignCenter", label: "Align center", Icon: AlignCenter, isActive: (s) => s.textAlignCenter, onClick: () => activeEditor.chain().focus().setTextAlign("center").run() },
    { id: "alignRight", label: "Align right", Icon: AlignRight, isActive: (s) => s.textAlignRight, onClick: () => activeEditor.chain().focus().setTextAlign("right").run() },

    { id: "link", label: "Link", Icon: Link, primary: true, isActive: (s) => s.link, onClick: handleLink },
    { id: "codeBlock", label: "Code block", Icon: SquareCode, isActive: (s) => s.codeBlock, onClick: () => activeEditor.chain().focus().toggleCodeBlock().run() },
    { id: "hr", label: "Horizontal rule", Icon: Minus, isActive: () => false, onClick: () => activeEditor.chain().focus().setHorizontalRule().run() },
    { id: "highlight", label: "Highlight", Icon: Highlighter, primary: true, isActive: (s) => s.highlight, onClick: () => activeEditor.chain().focus().toggleHighlight().run() },
    { id: "clear", label: "Clear formatting", Icon: RemoveFormatting, isActive: () => false, onClick: () => activeEditor.chain().focus().unsetAllMarks().clearNodes().run() },
  ];

  const sections = [
    { tools: ["bold", "italic", "underline", "strike", "code", "subscript", "superscript"] },
    { tools: ["h1", "h2", "h3", "paragraph"] },
    { tools: ["bullet", "ordered", "taskList", "blockquote"] },
    { tools: ["alignLeft", "alignCenter", "alignRight"] },
    { tools: ["link", "codeBlock", "hr", "highlight", "clear"] },
  ];

  const toolsById = Object.fromEntries(tools.map((t) => [t.id, t]));

  const overflowTools = tools.filter((t) => !t.primary);

  const renderSection = (section) => {
    const visibleIds = isCompact
      ? section.tools.filter((id) => toolsById[id].primary)
      : section.tools;

    return visibleIds.map((id) => {
      const tool = toolsById[id];
      return (
        <ToolbarButton
          key={id}
          title={tool.label}
          isActive={tool.isActive(editorState)}
          onClick={tool.onClick}
        >
          <tool.Icon size={iconSize} />
        </ToolbarButton>
      );
    });
  };

  return (
    <div
      ref={editorToolBarRef}
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        columnGap: "10px",
        rowGap: "10px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      <UndoRedoGroup undo={undo} redo={redo} isUndoRedoRef={isUndoRedoRef} slidesHistory={slidesHistory} size={iconSize} />

      {sections.map((section, i) => {
        const visibleIds = isCompact
          ? section.tools.filter((id) => toolsById[id].primary)
          : section.tools;

        if (visibleIds.length === 0) return null;

        return (
          <React.Fragment key={i}>
            <div style={{ ...DIVIDER }} />
            {renderSection(section)}
          </React.Fragment>
        );
      })}

      {isCompact && overflowTools.length > 0 && (
        <div ref={moreRef} style={{ position: "relative" }}>
          <div style={{ ...DIVIDER }} />
          <ToolbarButton
            title="More options"
            isActive={showMore}
            onClick={() => setShowMore((prev) => !prev)}
          >
            <Ellipsis size={iconSize} />
          </ToolbarButton>

          {showMore && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "8px",
                background: "white",
                color: "black",
                boxShadow: "2px 4px 8px #00000080",
                zIndex: 300,
                width: "180px",
                maxHeight: "320px",
                overflowY: "auto",
              }}
            >
              {overflowTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    tool.onClick();
                    setShowMore(false);
                  }}
                  style={{
                    width: "100%",
                    border: "none",
                    borderBottom: "1px solid #eee",
                    padding: "12px",
                    background: tool.isActive(editorState) ? "#e7e7ff" : "transparent",
                    color: "black",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    textAlign: "left",
                    fontSize: "0.9em",
                  }}
                >
                  <tool.Icon size={iconSize} />
                  {tool.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function UndoRedoGroup({ undo, redo, isUndoRedoRef, slidesHistory, size }) {
  return (
    <>
      <ToolbarButton
        title="Undo"
        disabled={slidesHistory.past.length === 0}
        onClick={() => undo(isUndoRedoRef)}
      >
        <Undo2 size={size} />
      </ToolbarButton>
      <ToolbarButton
        title="Redo"
        disabled={slidesHistory.future.length === 0}
        onClick={() => redo(isUndoRedoRef)}
      >
        <Redo2 size={size} />
      </ToolbarButton>
    </>
  );
}

export default EditorToolBar;