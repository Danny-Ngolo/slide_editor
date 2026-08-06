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
    handleCellMouseEnter,
    handleDragEnd,
    isSelecting,
    clearCellSelection,
    mergeSelectedCells,
    splitCell,
    deleteTableSelection,
  } = useTable();
  const {
    setTableMenu,
    tableMenuRef,
    tableResizeState,
    tableSelection,
    selectedCells,
    cellDragActive,
  } = useEditorContext();

  const tableRef = useRef(null);

  const rows = block.content?.rows || [];

  // Live ref so the document-level hit-test always calls the freshest
  // handleCellMouseEnter (it closes over isSelecting/anchor/cellDragActive).
  const handleCellMouseEnterRef = useRef(handleCellMouseEnter);
  useEffect(() => {
    handleCellMouseEnterRef.current = handleCellMouseEnter;
  });

  // Keyboard shortcuts for merge (Ctrl+M) and split (Ctrl+S) active on selected cells
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.ctrlKey && e.key.toLowerCase() === "m") {
        if (!selectedCells || selectedCells.size === 0) return;
        e.preventDefault();
        mergeSelectedCells(slideId, block.id);
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        if (!selectedCells || selectedCells.size === 0) return;
        e.preventDefault();
        const first = Array.from(selectedCells)[0];
        const [r, c] = first.split(',').map(Number);
        splitCell(slideId, block.id, r, c);
        return;
      }

      // Delete / Backspace: clear multi-cell selection or remove a selected
      // row/column. stopPropagation keeps the global block delete away.
      if (e.key === "Delete" || e.key === "Backspace") {
        const hasRowOrColumn =
          tableSelection?.blockId === block.id &&
          (tableSelection.type === "row" || tableSelection.type === "column");
        const hasMultiCell = selectedCells && selectedCells.size > 1;
        if (!hasRowOrColumn && !hasMultiCell) return;

        if (deleteTableSelection(slideId, block.id)) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    selectedCells,
    slideId,
    block.id,
    mergeSelectedCells,
    splitCell,
    deleteTableSelection,
    tableSelection,
  ]);

  useEffect(() => {
    // Always-on: clicking/pressing anywhere outside this table (and outside its
    // open menu) clears the cell/row/column selection and any open menu.
    // Using mousedown (not click) so the click that follows a drag-release does
    // not immediately close a menu opened on mouseup.
    const closeTableMenu = () => setTableMenu(null);

    const handlePointerDownOutside = (e) => {
      if (tableRef.current?.contains(e.target)) return;
      if (tableMenuRef.current?.contains(e.target)) return;
      closeTableMenu();
      clearTableSelection();
      clearCellSelection();
    };

    document.addEventListener("mousedown", handlePointerDownOutside);

    return () =>
      document.removeEventListener("mousedown", handlePointerDownOutside);
  }, [clearCellSelection, clearTableSelection, setTableMenu, tableMenuRef, tableRef]);

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
  }, [tableResizeState, slideId, block, handleTableMouseMove, handleTableMouseUp]);

  // Global mouseup/pointerup/pointercancel — ends drag selection even if the
  // pointer is released outside any cell, and releases the eager touch lock when
  // the browser takes the gesture over for native text selection/scroll.
  // Always-on (no dependency on isSelecting) so we never miss a cleanup.
  useEffect(() => {
    document.addEventListener('mouseup', handleCellMouseUp);
    document.addEventListener('pointerup', handleCellMouseUp);
    document.addEventListener('pointercancel', handleCellMouseUp);
    return () => {
      document.removeEventListener('mouseup', handleCellMouseUp);
      document.removeEventListener('pointerup', handleCellMouseUp);
      document.removeEventListener('pointercancel', handleCellMouseUp);
    };
  }, [handleCellMouseUp]);

  // Multi-cell selection is extended from the document level instead of
  // relying on each cell's pointerenter. While the button is held, the browser
  // implicitly captures the pointer to the first cell (Pointer Events spec), so
  // pointerenter never fires on the other cells being dragged over — we
  // hit-test the pointer position instead. This is also what makes the drag
  // work on touch (non-passive touchmove preventDefault owns the gesture so it
  // is not treated as a scroll or hijacked into text-selection).
  useEffect(() => {
    if (!isSelecting) return;

    const handlePointerMove = (e) => {
      const el = document
        .elementFromPoint(e.clientX, e.clientY)
        ?.closest?.(".table-cell-inner");
      if (!el) return;
      const row = Number(el.dataset.row);
      const col = Number(el.dataset.col);
      if (Number.isInteger(row) && Number.isInteger(col)) {
        handleCellMouseEnterRef.current(row, col);
      }
    };

    const preventTouchScroll = (e) => e.preventDefault();

    document.addEventListener("pointermove", handlePointerMove);
    document.addEventListener("touchmove", preventTouchScroll, {
      passive: false,
    });
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("touchmove", preventTouchScroll);
    };
  }, [isSelecting]);



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
      <table ref={tableRef} className="table-block" data-cell-drag={cellDragActive}>
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
