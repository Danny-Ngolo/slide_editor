"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React, { useEffect, useRef, useState } from "react";
import TableCell from "./TableCell";
import TableRowHandle from "./TableRowHandle";
import TableColumnHandle from "./TableColumnHandle";
import "./table.css";
import TableActionMenu from "./TableActionMenu";

const TableBlock = ({ slideId, block }) => {
  const {
    updateCell,
    addRow,
    deleteRow,
    duplicateRow,
    addColumn,
    deleteColumn,
    duplicateColumn,
  } = useTable();

  const [menu, setMenu] = useState(null);

  const rows = block.content?.rows || [];

  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;

    const handleClickOutside = (e) => {
      if (menuRef.current?.contains(e.target)) return;
      setMenu(null);
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [menu]);

  return (
    <>
      <table
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
                {/* <TableColumnHandle
                onClick={() =>
                  addColumn(slideId, block.id, columnIndex, "after")
                }
              /> */}

                <TableColumnHandle
                  onClick={(e) => {
                    e.stopPropagation();

                    setMenu({
                      type: "column",
                      columnIndex,
                      anchor: e.currentTarget.getBoundingClientRect(),
                    });
                  }}
                />
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={row[0].id}>
              {/* Row Handle */}
              <td className="row-handle-cell">
                {/* <TableRowHandle
                onClick={() => addRow(slideId, block.id, rowIndex, "after")}
              /> */}

                <TableRowHandle
                  onClick={(e) => {
                    e.stopPropagation();

                    setMenu({
                      type: "row",
                      rowIndex,
                      anchor: e.currentTarget.getBoundingClientRect(),
                    });
                  }}
                />
              </td>

              {row.map((cell, columnIndex) => (
                <td
                  key={cell.id}
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

      {menu && (
        <TableActionMenu
          ref={menuRef}
          menu={menu}
          slideId={slideId}
          blockId={block.id}
          // addRow={addRow}
          // addColumn={addColumn}
          // deleteRow={deleteRow}
          // deleteColumn={deleteColumn}
          // duplicateRow={duplicateRow}
          // duplicateColumn={duplicateColumn}
          closeMenu={() => setMenu(null)}
        />
      )}
    </>
  );
};

export default TableBlock;
