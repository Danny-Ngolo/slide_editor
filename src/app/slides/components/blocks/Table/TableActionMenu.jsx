"use client";

import { Plus, Copy, Trash2, Headset } from "lucide-react";

import "./table.css";
import { useTable } from "@/app/slides/hooks/useTable";
import { useEditorContext } from "../../EditorContext";
import { useEffect } from "react";

const TableActionMenu = ({ tableMenu, /* slideId, blockId, */ closeMenu }) => {
  const {
    addRow,
    addColumn,

    deleteRow,
    deleteColumn,

    duplicateRow,
    duplicateColumn,

    toggleHeaderRow,
    toggleHeaderColumn,
  } = useTable();

  const { selectedBlock, tableMenuRef } = useEditorContext();

  const { blockId, slideId } = selectedBlock;

  return (
    <div
      ref={tableMenuRef}
      className="table-action-menu"
      style={{
        position: "fixed",
        left: tableMenu?.anchor?.right + 6 || 6,
        top: tableMenu?.anchor?.top || 0,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {tableMenu.type === "row" ? (
        <>
          <button
            onClick={() => {
              console.log(slideId, blockId);
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
      ) : (
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
    </div>
  );
};

export default TableActionMenu;
