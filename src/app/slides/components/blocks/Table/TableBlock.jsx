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

    handleMouseMove,
    handleMouseUp,
    handleDragEnd,
  } = useTable();
  const {
    tableMenu,
    setTableMenu,
    tableMenuRef,
    tableResizeState,
    tableSelection,
  } = useEditorContext();

  const tableRef = useRef(null);

  const rows = block.content?.rows || [];

  useEffect(() => {
    if (tableSelection?.blockId !== block.id) return;

    const closeTableMenu = () => setTableMenu(null);

    const handleClickOutside = (e) => {
      const insideMenu = tableMenuRef.current?.contains(e.target);

      if (insideMenu) return;

      closeTableMenu();
      clearTableSelection();
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [tableMenu, tableSelection]);

  useEffect(() => {
    if (!tableResizeState) return;
    const mouseMove = (e) => {
      handleMouseMove(e, slideId, block);
    };
    const mouseUp = () => {
      handleMouseUp();
    };
    document.addEventListener("mousemove", mouseMove);
    document.addEventListener("mouseup", mouseUp);
    return () => {
      document.removeEventListener("mousemove", mouseMove);
      document.removeEventListener("mouseup", mouseUp);
    };
  }, [tableResizeState, slideId, block]);

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
      <table ref={tableRef} className="table-block">
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
