"use client";

import { EditorContent } from "@tiptap/react";
import React, { useEffect } from "react";
import { useRichTextEditor } from "@/app/slides/hooks/useRichTextEditor";
import { useEditorContext } from "../../EditorContext";

const TableCell = ({
  slideId,
  blockId,
  rowIndex,
  columnIndex,
  cell,
  updateCell,
  block,
}) => {
  const { updateEditorState, initEditor, updateEditorUI } = useRichTextEditor();

  const { registerEditor, unregisterEditor, focusEditor } = useEditorContext();

  const editor = initEditor({
    slideId,
    blockId,
    content: {
      html: cell.html,
    },
    blockType: block.type || "table",
    onContentChange(content) {
      updateCell(slideId, blockId, rowIndex, columnIndex, content);
    },
    rows: block.content.rows || [],
    columnIndex,
    rowIndex,
  });

  const focusCell = (rows, rowIndex, columnIndex) => {
    const cell = rows[rowIndex]?.cells[columnIndex];

    if (!cell) return;

    focusEditor(cell.id);
  };

  useEffect(() => {
    if (!editor) return;

    const editorHandler = () => updateEditorState(editor);
    editor.on("selectionUpdate", editorHandler);

    return () => {
      editor.off("selectionUpdate", editorHandler);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;

    registerEditor(cell.id, editor);

    return () => {
      unregisterEditor(cell.id);
    };
  }, [editor, cell.id]);

  useEffect(() => {
    updateEditorUI(editor, { html: cell?.html });
  }, [editor, cell.html]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default TableCell;
