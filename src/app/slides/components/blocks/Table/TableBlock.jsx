"use client";

import { useTable } from "@/app/slides/hooks/useTable";
import React, { useEffect, useRef, useState } from "react";
import TableCell from "./TableCell";
import "./table.css";
import TableActionMenu from "./TableActionMenu";
import TableHandle from "./TableHandle";
import { useEditorContext } from "../../EditorContext";

const TableBlock = ({ slideId, block }) => {
  const {
    updateCell,
    handleColumnHandleClick,
    handleRowHandleClick,
    tableSelection,
    setTableSelection,
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
      console.log("closing menu...");

      const insideTable = tableRef.current?.contains(e.target);
      const insideMenu = tableMenuRef.current?.contains(e.target);

      console.log("insideMenu", insideMenu);
      console.log("insideTable", insideTable);

      if (insideMenu) {
        console.log("inside menu");

        return;
      }

      if (insideTable) {
        console.log("inside table");
        closeTableMenu();
        return;
      }

      console.log("Inside nothing");

      console.log("menu before close", tableMenu);

      closeTableMenu();
      clearSelection();
    };

    document.addEventListener("click", handleClickOutside);

    return () => document.removeEventListener("click", handleClickOutside);
  }, [tableMenu, tableSelection]);

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
              className={
                tableSelection.blockId === block.id &&
                tableSelection.type === "row" &&
                tableSelection.row === rowIndex
                  ? "selected-row"
                  : ""
              }
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
                  className={
                    tableSelection.blockId === block.id &&
                    tableSelection.type === "column" &&
                    tableSelection.column === columnIndex
                      ? "selected-column"
                      : "table-cell"
                  }
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

      {/* {tableMenu && (
        <div ref={tableMenuRef}>
          <TableActionMenu
            menu={tableMenu}
            slideId={slideId}
            blockId={block.id}
            closeMenu={() => setTableMenu(null)}
          />
        </div>
      )} */}
    </>
  );
};

export default TableBlock;
