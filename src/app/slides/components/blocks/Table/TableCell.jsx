"use client";

import "./table.css";
import { EditorContent } from "@tiptap/react";
import React, { useEffect } from "react";
import { useRichTextEditor } from "@/app/slides/hooks/useRichTextEditor";
import { useEditorContext } from "../../EditorContext";
import { useTable } from "@/app/slides/hooks/useTable";

const TableCell = ({
  slideId,
  blockId,
  rowIndex,
  columnIndex,
  cell,
  updateCell,
  block,
}) => {
  const { updateEditorState, useInitEditor, updateEditorUI } = useRichTextEditor();

  const { registerEditor, unregisterEditor, focusEditor, tableSelection } =
    useEditorContext();

  const { handleCellMouseDown, handleCellMouseUp, handleCellKeyDown } = useTable();

  const editor = useInitEditor({
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
  }, [editor, updateEditorState]);

  useEffect(() => {
    if (!editor) return;

    registerEditor(cell.id, editor);

    return () => {
      unregisterEditor(cell.id);
    };
  }, [editor, cell.id, registerEditor, unregisterEditor]);

  useEffect(() => {
    updateEditorUI(editor, { html: cell?.html });
  }, [editor, cell.html, updateEditorUI]);

  if (!editor) return null;

  return (
    <div
      tabIndex={0}
      onPointerDown={(e) => {
        // Only trigger drag selection on primary left clicks (button 0)
        if (e.button !== 0) return;
        handleCellMouseDown(rowIndex, columnIndex, cell.id, e.shiftKey, block.id);
      }}
      onPointerUp={(e) => handleCellMouseUp(e)}
      onKeyDownCapture={(e) => handleCellKeyDown(e, rowIndex, columnIndex, block)}
      className="table-cell-inner"
      data-row={rowIndex}
      data-col={columnIndex}
    >
      <EditorContent editor={editor} />
    </div>

  );
};

export default TableCell;
