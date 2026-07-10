"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React from "react";
import TableCell from "./TableCell";
import "./table.css";
import TableHandle from "./TableHandle";
import { useEditorContext } from "../../EditorContext";

import TableDragHandle from "./TableDragHandle";
import { useEditorSortable } from "@/app/slides/hooks/dnd/useEditorSortable";

const TableRow = ({ slideId, block, row, rowIndex }) => {
  const {
    updateCell,
    handleRowHandleClick,
    tableSelection,
    startColumnResize,
    startRowResize,
    minColumnWidth,
    minRowHeight,
  } = useTable();
  const { setSelectedBlock, setSelectedBlocks, setTableMenu } =
    useEditorContext();

  const { listeners, attributes, setNodeRef, style } = useEditorSortable({
    id: row.id,
    data: { type: "row" },
  });

  return (
    <tr
      key={row.id}
      ref={setNodeRef}
      style={style}
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
        <TableDragHandle attributes={attributes} listeners={listeners} />
        <TableHandle
          onClick={(e) => {
            setSelectedBlock({ slideId, blockId: block.id });
            setSelectedBlocks([{ slideId, blockId: block.id }]);

            handleRowHandleClick(e, block, setTableMenu, rowIndex);
          }}
        />
      </td>

      {row?.cells.map((cell, columnIndex) => (
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
            width: block.content.columnWidths?.[columnIndex] ?? minColumnWidth,
            height: block.content.rowHeights?.[rowIndex] ?? minRowHeight,
          }}
        >
          <TableCell
            slideId={slideId}
            blockId={block.id}
            rowIndex={rowIndex}
            columnIndex={columnIndex}
            cell={cell}
            updateCell={updateCell}
            block={block}
          />

          <div
            className="column-resize-handle"
            onMouseDown={(e) => {
              startColumnResize(e, block, columnIndex);
            }}
          />
          <div
            className="row-resize-handle"
            onMouseDown={(e) => {
              startRowResize(e, block, rowIndex);
            }}
          />
        </td>
      ))}
    </tr>
  );
};

export default TableRow;
