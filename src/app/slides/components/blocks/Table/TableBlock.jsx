"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React, { useEffect, useRef } from "react";
import TableCell from "./TableCell";
import "./table.css";
import TableHandle from "./TableHandle";
import { useEditorContext } from "../../EditorContext";

const TableBlock = ({ slideId, block }) => {
  const {
    updateCell,
    handleColumnHandleClick,
    handleRowHandleClick,
    tableSelection,
    setTableSelection,

    resizeState,
    setResizeState,
    handleMouseMove,
    handleMouseUp,
    startColumnResize,
    startRowResize,
  } = useTable();
  const {
    setSelectedBlock,
    setSelectedBlocks,
    tableMenu,
    setTableMenu,
    tableMenuRef,
  } = useEditorContext();

  const tableRef = useRef(null);

  const rows = block.content?.rows || [];

  useEffect(() => {
    if (tableSelection?.blockId !== block.id) return;

    const closeTableMenu = () => setTableMenu(null);

    const clearSelection = () => {
      setTableSelection({
        blockId: null,
        type: null,
        row: null,
        column: null,
      });
    };

    const handleClickOutside = (e) => {
      const insideMenu = tableMenuRef.current?.contains(e.target);

      if (insideMenu) return;

      closeTableMenu();
      clearSelection();
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [tableMenu, tableSelection]);

  useEffect(() => {
    if (!resizeState) return;

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
  }, [resizeState, slideId, block]);

  return (
    <>
      <table
        ref={tableRef}
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "black",
        }}
      >
        <thead>
          <tr>
            {/* Empty corner */}
            <th />

            {/* Column handles */}
            {rows[0].map((cell, columnIndex) => (
              <th key={cell.id}>
                <TableHandle
                  onClick={(e) => {
                    setSelectedBlock({ slideId, blockId: block.id });
                    setSelectedBlocks([{ slideId, blockId: block.id }]);

                    handleColumnHandleClick(
                      e,
                      block,
                      setTableMenu,
                      columnIndex,
                    );
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={row[0].id}
              className={`
table-row
  ${
    tableSelection.blockId === block.id &&
    tableSelection.type === "row" &&
    tableSelection.row === rowIndex
      ? "selected-row"
      : ""
  }
  ${rowIndex === block.content?.headerRow ? "table-header-row" : ""}
`}
            >
              {/* Row Handle */}
              <td className="row-handle-cell">
                <TableHandle
                  onClick={(e) => {
                    setSelectedBlock({ slideId, blockId: block.id });
                    setSelectedBlocks([{ slideId, blockId: block.id }]);

                    handleRowHandleClick(e, block, setTableMenu, rowIndex);
                  }}
                />
              </td>

              {row.map((cell, columnIndex) => (
                <td
                  key={cell.id}
                  className={`
table-cell
  ${
    tableSelection.blockId === block.id &&
    tableSelection.type === "column" &&
    tableSelection.column === columnIndex
      ? "selected-column"
      : ""
  }
  ${columnIndex === block.content?.headerColumn ? "table-header-column" : ""}
`}
                  style={{
                    width: block.content.columnWidths?.[columnIndex] ?? 100,

                    height: block.content.rowHeights?.[rowIndex] ?? 40,
                  }}
                >
                  <TableCell
                    slideId={slideId}
                    blockId={block.id}
                    rowIndex={rowIndex}
                    columnIndex={columnIndex}
                    cell={cell}
                    updateCell={updateCell}
                  />

                  {rowIndex === 0 && (
                    <div
                      className="column-resize-handle"
                      onMouseDown={(e) =>
                        startColumnResize(e, block, columnIndex)
                      }
                    />
                  )}
                  {columnIndex === 0 && (
                    <div
                      className="row-resize-handle"
                      onMouseDown={(e) => startRowResize(e, block, rowIndex)}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default TableBlock;
