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
  const { updateEditorState, initEditor, updateEditorUI } = useRichTextEditor();

  const { registerEditor, unregisterEditor, focusEditor, tableSelection } =
    useEditorContext();

  const { selectCell } = useTable();

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

  return (
    //     <div
    //       onClick={() =>
    //         selectCell({
    //           blockId,
    //           rowIndex,
    //           columnIndex,
    //         })
    //       }
    //       className={`
    // table-cell

    // ${
    //   tableSelection.blockId === blockId &&
    //   tableSelection.type === "cell" &&
    //   tableSelection.row === rowIndex &&
    //   tableSelection.column === columnIndex
    //     ? "selected-cell"
    //     : ""
    // }
    // `}
    //     >
    <EditorContent editor={editor} />
    // </div>
  );
};

export default TableCell;
