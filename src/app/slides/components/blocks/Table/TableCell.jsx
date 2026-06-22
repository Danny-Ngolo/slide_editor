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
}) => {
  const { updateEditorState, initEditor, updateEditorUI } = useRichTextEditor();

  const editor = initEditor({
    slideId,
    blockId,
    content: {
      html: cell.html,
    },
    onContentChange(content) {
      updateCell(slideId, blockId, rowIndex, columnIndex, content);
    },
  });

  useEffect(() => {
    if (!editor) return;

    const editorHandler = () => updateEditorState(editor);
    editor.on("selectionUpdate", editorHandler);

    return () => {
      editor.off("selectionUpdate", editorHandler);
    };
  }, [editor]);

  useEffect(() => {
    updateEditorUI(editor, { html: cell?.html });
  }, [editor, cell.html]);

  if (!editor) return null;

  return <EditorContent editor={editor} />;
};

export default TableCell;
