"use client";

import React from "react";
import "./table.css";
import {
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import TableHeaderCell from "./TableHeaderCell";

const TableHeader = ({ firstRowCells, slideId, block }) => {
  return (
    <SortableContext
      items={firstRowCells.map((cell) => cell.id)}
      strategy={horizontalListSortingStrategy}
    >
      <thead>
        <tr>
          {/* Empty corner */}
          <th />

          {/* Column handles */}
          {firstRowCells.map((cell, columnIndex) => {
            return (
              <TableHeaderCell
                key={cell.id}
                slideId={slideId}
                cell={cell}
                columnIndex={columnIndex}
                block={block}
              />
            );
          })}
        </tr>
      </thead>
    </SortableContext>
  );
};

export default TableHeader;
