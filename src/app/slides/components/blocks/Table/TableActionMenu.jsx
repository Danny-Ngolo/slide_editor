"use client";

import { Plus, Copy, Trash2 } from "lucide-react";

import "./table.css";
import { useEffect } from "react";
import { useTable } from "@/app/slides/hooks/useTable";

const TableActionMenu = ({ menu, slideId, blockId, closeMenu }) => {
  const {
    addRow,
    addColumn,

    deleteRow,
    deleteColumn,

    duplicateRow,
    duplicateColumn,
  } = useTable();

  return (
    <div
      className="table-action-menu"
      style={{
        position: "fixed",
        left: menu.anchor.right + 6,
        top: menu.anchor.top,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {menu.type === "row" ? (
        <>
          <button
            onClick={() => {
              addRow(slideId, blockId, menu.rowIndex, "before");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add row above
          </button>

          <button
            onClick={() => {
              addRow(slideId, blockId, menu.rowIndex, "after");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add row below
          </button>

          <button
            onClick={() => {
              duplicateRow(slideId, blockId, menu.rowIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Duplicate row
          </button>

          <button
            className="danger"
            onClick={() => {
              deleteRow(slideId, blockId, menu.rowIndex);
              closeMenu();
            }}
          >
            <Trash2 size={15} /> Delete row
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              addColumn(slideId, blockId, menu.columnIndex, "before");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add column left
          </button>

          <button
            onClick={() => {
              addColumn(slideId, blockId, menu.columnIndex, "after");
              closeMenu();
            }}
          >
            <Plus size={15} /> Add column right
          </button>

          <button
            onClick={() => {
              duplicateColumn(slideId, blockId, menu.columnIndex);
              closeMenu();
            }}
          >
            <Copy size={15} /> Duplicate column
          </button>

          <button
            className="danger"
            onClick={() => {
              deleteColumn(slideId, blockId, menu.columnIndex);
              closeMenu();
            }}
          >
            <Trash2 size={15} /> Delete column
          </button>
        </>
      )}
    </div>
  );
};

export default TableActionMenu;
