"use client";

import React from "react";
import { useEditorSortable } from "@/app/slides/hooks/dnd/useEditorSortable";
import TableDragHandle from "./TableDragHandle";
import TableHandle from "./TableHandle";
import { useTable } from "@/app/slides/hooks/useTable";
import { useEditorContext } from "../../EditorContext";

const TableHeaderCell = ({ slideId, block, cell, columnIndex }) => {
  const { handleColumnHandleClick } = useTable();
  const { setSelectedBlock, setTableMenu } =
    useEditorContext();

  const { attributes, listeners, setNodeRef, style } = useEditorSortable({
    id: cell.id,
    data: { type: "column" },
  });

  return (
    <th ref={setNodeRef} style={style}>
      <TableDragHandle listeners={listeners} attributes={attributes} />
      <TableHandle
        onClick={(e) => {
          setSelectedBlock({ slideId, blockId: block.id });

          handleColumnHandleClick(e, block, setTableMenu, columnIndex);
        }}
      />
    </th>
  );
};

export default TableHeaderCell;
