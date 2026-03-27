"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";

import { useEditorContext } from "../EditorContext";

const TextBlock = ({ block, slideId, updateBlock, toggleImportant }) => {
  const { setActiveEditor, setEditorState } = useEditorContext();

  const getEditorState = (editor) => {
    if (!editor) return {};

    return {
      bold: editor.isActive("bold"),
      italic: editor.isActive("italic"),
      heading1: editor.isActive("heading", { level: 1 }),
      heading2: editor.isActive("heading", { level: 2 }),
      heading3: editor.isActive("heading", { level: 3 }),
      blockquote: editor.isActive("blockquote"),
      bulletList: editor.isActive("bulletList"),
      orderedList: editor.isActive("orderedList"),
      highlight: editor.isActive("highlight"),
      underline: editor.isActive("underline"),
    };
  };

  const updateEditorState = (editor) => {
    setEditorState(getEditorState(editor));
  };

  const editor = useEditor({
    extensions: [StarterKit, Underline, Highlight],
    immediatelyRender: false,
    content: block.content || "<p></p>",
    onFocus({ editor }) {
      setActiveEditor(editor);

      updateEditorState(editor);
    },

    onUpdate({ editor }) {
      updateBlock(slideId, block.id, editor.getHTML());

      updateEditorState(editor);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const handler = () => updateEditorState(editor);

    editor.on("selectionUpdate", handler);

    return () => {
      editor.off("selectionUpdate", handler);
    };
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      style={{
        marginBottom: "15px",
        padding: "10px",
        border: block.important ? "2px solid orange" : "1px solid #ccc",
        minHeight: "80px",
      }}
    >
      <button onClick={() => toggleImportant(slideId, block.id)}>
        {block.important ? "⭐ Important" : "Mark Important"}
      </button>

      <EditorContent editor={editor} />
    </div>
  );
};

export default TextBlock;
