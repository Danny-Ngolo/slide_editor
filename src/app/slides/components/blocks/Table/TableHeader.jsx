"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React from "react";
import "./table.css";
import TableHandle from "./TableHandle";
import { useEditorContext } from "../../EditorContext";

const TableHeader = ({ firstRowCells, slideId, block }) => {
  const { handleColumnHandleClick } = useTable();
  const { setSelectedBlock, setSelectedBlocks, setTableMenu } =
    useEditorContext();

  return (
    <thead>
      <tr>
        {/* Empty corner */}
        <th />

        {/* Column handles */}
        {firstRowCells.map((cell, columnIndex) => {
          return (
            <th key={cell.id}>
              <TableHandle
                onClick={(e) => {
                  setSelectedBlock({ slideId, blockId: block.id });
                  setSelectedBlocks([{ slideId, blockId: block.id }]);

                  handleColumnHandleClick(e, block, setTableMenu, columnIndex);
                }}
              />
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

export default TableHeader;
