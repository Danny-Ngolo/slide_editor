"use client";

import React from "react";
import { useEditorContext } from "./EditorContext";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Underline,
  Highlighter,
  Quote,
  ListOrdered,
} from "lucide-react";
import ToolbarButton from "./ToolbarButton";

const EditorToolBar = () => {
  const { activeEditor, editorState } = useEditorContext();

  return (
    <div
      style={{
        padding: "10px",
        borderBottom: "1px solid #ccc",
        display: "flex",
        gap: "10px",
        position: "sticky",
        top: 0,
        background: "white",
        zIndex: 10,
      }}
    >
      {!activeEditor ? (
        <p style={{ color: "#111" }}>Select a block to show edit options.</p>
      ) : (
        <>
          <ToolbarButton
            title={"Bold"}
            onClick={() => {
              activeEditor.chain().focus().toggleBold().run();
            }}
            isActive={editorState.bold}
          >
            <Bold size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"Italic"}
            onClick={() => activeEditor.chain().focus().toggleItalic().run()}
            isActive={editorState.italic}
          >
            <Italic size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"Heading1"}
            onClick={() => {
              activeEditor.chain().focus().toggleHeading({ level: 1 }).run();
            }}
            isActive={editorState.heading1}
          >
            <Heading1 size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"Heading2"}
            onClick={() => {
              activeEditor.chain().focus().toggleHeading({ level: 2 }).run();
            }}
            isActive={editorState.heading2}
          >
            <Heading2 size={18} />
          </ToolbarButton>

          <ToolbarButton
            title={"Heading3"}
            onClick={() => {
              activeEditor.chain().focus().toggleHeading({ level: 3 }).run();
            }}
            isActive={editorState.heading3}
          >
            <Heading3 size={17} />
          </ToolbarButton>

          <ToolbarButton
            title={"BulletList"}
            onClick={() => {
              activeEditor.chain().focus().toggleBulletList().run();
            }}
            isActive={editorState.bulletList}
          >
            <List size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"OrderedList"}
            onClick={() => {
              activeEditor.chain().focus().toggleOrderedList().run();
            }}
            isActive={editorState.orderedList}
          >
            <ListOrdered size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"BlockQuote"}
            onClick={() => {
              activeEditor.chain().focus().toggleBlockquote().run();
            }}
            isActive={editorState.blockquote}
          >
            <Quote size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"Underline"}
            onClick={() => {
              activeEditor.chain().focus().toggleUnderline().run();
            }}
            isActive={editorState.underline}
          >
            <Underline size={20} />
          </ToolbarButton>

          <ToolbarButton
            title={"Highlight"}
            onClick={() => {
              activeEditor.chain().focus().toggleHighlight().run();
            }}
            isActive={editorState.highlight}
          >
            <Highlighter size={20} />
          </ToolbarButton>
        </>
      )}
    </div>
  );
};

export default EditorToolBar;
