"use client";

import React from "react";
import "./table.css";

import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TableRow from "./TableRow";

const TableBody = ({ slideId, block, rows }) => {
  return (
    <SortableContext
      items={rows.map((row) => row.id)}
      strategy={verticalListSortingStrategy}
    >
      <tbody>
        {rows.map((row, rowIndex) => (
          <TableRow
            key={row.id}
            slideId={slideId}
            block={block}
            row={row}
            rowIndex={rowIndex}
          />
        ))}
      </tbody>
    </SortableContext>
  );
};

export default TableBody;
