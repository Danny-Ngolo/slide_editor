"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React, { useEffect, useRef } from "react";
import "./table.css";
import { useEditorContext } from "../../EditorContext";

import { DndContext, closestCenter } from "@dnd-kit/core";

import TableHeader from "./TableHeader";
import TableBody from "./TableBody";

const TableBlock = ({ slideId, block }) => {
  const {
    clearTableSelection,
    handleTableMouseMove,
    handleTableMouseUp,
    handleCellMouseUp,
    handleDragEnd,
    isSelecting,
    clearCellSelection,
    mergeSelectedCells,
    splitCell,
  } = useTable();
  const {
    tableMenu,
    setTableMenu,
    tableMenuRef,
    tableResizeState,
    tableSelection,
    selectedCells,
  } = useEditorContext();

  const tableRef = useRef(null);

  const rows = block.content?.rows || [];

  // Keyboard shortcuts for merge (Ctrl+M) and split (Ctrl+S) active on selected cells
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (!selectedCells || selectedCells.size === 0) return;

      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        e.preventDefault();
        mergeSelectedCells(slideId, block.id);
      }
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        const first = Array.from(selectedCells)[0];
        const [r, c] = first.split(',').map(Number);
        splitCell(slideId, block.id, r, c);
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [selectedCells, slideId, block.id, mergeSelectedCells, splitCell]);

  useEffect(() => {
    const isMenuForThisBlock = tableMenu?.blockId === block.id || tableSelection?.blockId === block.id;
    if (!isMenuForThisBlock) return;

    const closeTableMenu = () => setTableMenu(null);

    const handleClickOutside = (e) => {
      const insideMenu = tableMenuRef.current?.contains(e.target);

      if (insideMenu) return;

      closeTableMenu();
      clearTableSelection();
      clearCellSelection();
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [tableMenu, tableSelection, block.id]);

  useEffect(() => {
    if (!tableResizeState) return;
    const mouseMove = (e) => {
      handleTableMouseMove(e, slideId, block);
    };
    const mouseUp = () => {
      handleTableMouseUp();
    };
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [tableResizeState, slideId, block]);

  // Global mouseup — ends drag selection even if the mouse is released outside any cell.
  // Always-on (no dependency on isSelecting) so we never miss a mouseup.
  useEffect(() => {
    document.addEventListener('mouseup', handleCellMouseUp);
    return () => document.removeEventListener('mouseup', handleCellMouseUp);
  }, []);



  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragEnd={(e) =>
        handleDragEnd({
          e,
          slideId,
          block,
        })
      }
    >
      <table ref={tableRef} className="table-block" data-selecting={isSelecting}>
        <TableHeader
          slideId={slideId}
          block={block}
          firstRowCells={rows[0].cells || []}
        />
        <TableBody slideId={slideId} block={block} rows={rows} />
      </table>
    </DndContext>
  );
};

export default TableBlock;
