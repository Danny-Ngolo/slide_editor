"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React from "react";
import TableCell from "./TableCell";

const TableBlock = ({ slideId, block }) => {
  const { updateCell } = useTable();

  const rows = block.content?.rows || [];

  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
        background: "black",
      }}
    >
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row[0].id}>
            {row.map((cell, columnIndex) => (
              <td
                key={cell.id}
                // dangerouslySetInnerHTML={{
                //   __html: cell.html,
                // }}
                style={{
                  border: "1px solid #ccc",
                  minWidth: "120px",
                  minHeight: "40px",
                  padding: "8px",
                  verticalAlign: "top",
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
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TableBlock;
