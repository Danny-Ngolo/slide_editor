"use client";

import { Plus, Copy, Trash2, Headset, Combine, Split, ClipboardPaste } from "lucide-react";

import "./table.css";
import { useTable } from "@/app/slides/hooks/useTable";
import { useEditorContext } from "../../EditorContext";

const TableActionMenu = ({ tableMenu, closeMenu }) => {
  const {
    addRow,
    addColumn,
    deleteRow,
    deleteColumn,
    duplicateRow,
    duplicateColumn,
    toggleHeaderRow,
    toggleHeaderColumn,
    mergeSelectedCells,
    splitCell,
    copyCell,
    copyRow,
    copyColumn,
    pasteCell,
    pasteRow,
    pasteColumn,
    tableClipboard,
    selectedCells,
  } = useTable();

  const { selectedBlock, tableMenuRef } = useEditorContext();

  const { blockId, slideId } = selectedBlock || {};

  return (
    <div
      ref={tableMenuRef}
      className="table-action-menu"
      style={{
        position: "fixed",
        left: (tableMenu?.anchor?.right ?? tableMenu?.anchor?.left ?? 0) + 6,
        top: tableMenu?.anchor?.top ?? 0,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {tableMenu.type === "row" && (
        <>
          <button
            onClick={() => {
              addRow(slideId, blockId, tableMenu.rowIndex, "before");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add row above
          </button>

          <button
            onClick={() => {
              addRow(slideId, blockId, tableMenu.rowIndex, "after");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add row below
          </button>

          <button
            onClick={() => {
              duplicateRow(slideId, blockId, tableMenu.rowIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Duplicate row
          </button>

          <button
            onClick={() => {
              copyRow(slideId, blockId, tableMenu.rowIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Copy row
          </button>

          <button
            disabled={tableClipboard?.type !== "row"}
            style={{
              opacity: tableClipboard?.type !== "row" ? 0.5 : 1,
              cursor: tableClipboard?.type !== "row" ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              pasteRow(slideId, blockId, tableMenu.rowIndex);
              closeMenu();
            }}
          >
            <ClipboardPaste size={15} /> Paste row
          </button>

          <button
            className="danger"
            onClick={() => {
              deleteRow(slideId, blockId, tableMenu.rowIndex);
              closeMenu();
            }}
          >
            <Trash2 size={15} /> Delete row
          </button>

          <button
            onClick={() => {
              toggleHeaderRow({
                slideId,
                blockId,
                rowIndex: tableMenu.rowIndex,
              });
              closeMenu();
            }}
          >
            <Headset size={15} /> Toggle Header
          </button>
        </>
      )}

      {tableMenu.type === "column" && (
        <>
          <button
            onClick={() => {
              addColumn(slideId, blockId, tableMenu.columnIndex, "before");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add column left
          </button>

          <button
            onClick={() => {
              addColumn(slideId, blockId, tableMenu.columnIndex, "after");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add column right
          </button>

          <button
            onClick={() => {
              duplicateColumn(slideId, blockId, tableMenu.columnIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Duplicate column
          </button>

          <button
            onClick={() => {
              copyColumn(slideId, blockId, tableMenu.columnIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Copy column
          </button>

          <button
            disabled={tableClipboard?.type !== "column"}
            style={{
              opacity: tableClipboard?.type !== "column" ? 0.5 : 1,
              cursor: tableClipboard?.type !== "column" ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              pasteColumn(slideId, blockId, tableMenu.columnIndex);
              closeMenu();
            }}
          >
            <ClipboardPaste size={15} /> Paste column
          </button>

          <button
            className="danger"
            onClick={() => {
              deleteColumn(slideId, blockId, tableMenu.columnIndex);
              closeMenu();
            }}
          >
            <Trash2 size={15} /> Delete column
          </button>

          <button
            onClick={() => {
              toggleHeaderColumn({
                slideId,
                blockId,
                columnIndex: tableMenu.columnIndex,
              });
              closeMenu();
            }}
          >
            <Headset size={15} /> Toggle Header
          </button>
        </>
      )}

      {/* Cell merge/split UI */}
      {tableMenu.type === "cell" && (
        <>
          <button
            disabled={!selectedCells || selectedCells.size < 2}
            style={{
              opacity: !selectedCells || selectedCells.size < 2 ? 0.5 : 1,
              cursor: !selectedCells || selectedCells.size < 2 ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              mergeSelectedCells(slideId, blockId);
              closeMenu();
            }}
          >
            <Combine size={15} /> Merge Cells
          </button>
          <button
            onClick={() => {
              if (selectedCells && selectedCells.size) {
                const first = Array.from(selectedCells)[0];
                const [r, c] = first.split(',').map(Number);
                splitCell(slideId, blockId, r, c);
              }
              closeMenu();
            }}
          >
            <Split size={15} /> Split Cell
          </button>
          <button
            onClick={() => {
              copyCell(slideId, blockId);
              closeMenu();
            }}
          >
            <Copy size={15} /> Copy Cells
          </button>
          <button
            disabled={!tableClipboard}
            style={{
              opacity: !tableClipboard ? 0.5 : 1,
              cursor: !tableClipboard ? "not-allowed" : "pointer",
            }}
            onClick={() => {
              pasteCell(slideId, blockId, tableMenu.rowIndex, tableMenu.columnIndex);
              closeMenu();
            }}
          >
            <ClipboardPaste size={15} /> Paste
          </button>
        </>
      )}
    </div>
  );
};

export default TableActionMenu;
