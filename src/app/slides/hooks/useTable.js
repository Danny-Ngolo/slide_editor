import { generateId } from "../utils/generateId";

import { useHistory } from "./useHistory";
import { useEditorContext } from "../components/EditorContext";
import { arrayMove } from "@dnd-kit/sortable";

export function useTable() {
  const { setSlides, setSlidesWithoutHistory, slidesHistory } = useHistory();
  const {
    tableSelection,
    setTableSelection,
    tableResizeState,
    setTableResizeState,
    focusEditor,
    selectedCells,
    setSelectedCells,
    isSelecting,
    setIsSelecting,
    selectionAnchor,
    setSelectionAnchor,
    setTableMenu,
    tableClipboard,
    setTableClipboard,
  } = useEditorContext();

  const slides = slidesHistory.present;

  // Find the block containing a given table block id, plus its slide id.
  const findBlock = (slideId, blockId) => {
    const slide = slides.find((s) => s.id === slideId);
    return slide?.blocks.find((b) => b.id === blockId) || null;
  };

  const findSlideByBlockId = (blockId) => {
    return slides.find((s) => s.blocks.some((b) => b.id === blockId));
  };

  // The clipboard always stores a 2D grid of html strings (rows of cells).
  // This normalizes whatever was copied into that shape so paste can be shared.
  const clipboardGrid = () => {
    if (!tableClipboard) return [];
    if (tableClipboard.type === "cell") return tableClipboard.grid;
    if (tableClipboard.type === "row") return [tableClipboard.htmlCells];
    if (tableClipboard.type === "column")
      return tableClipboard.htmlCells.map((html) => [html]);
    return [];
  };

  // Drag selection — state is now shared via EditorContext (not local useState)
  // so every component calling useTable() reads the same values.

  // Utility to compute rectangular range set
  const getRangeSet = (anchor, current) => {
    const startRow = Math.min(anchor.row, current.row);
    const endRow = Math.max(anchor.row, current.row);
    const startCol = Math.min(anchor.col, current.col);
    const endCol = Math.max(anchor.col, current.col);
    const set = new Set();
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        set.add(`${r},${c}`);
      }
    }
    return set;
  };

  // Mouse handlers for drag selection
  const handleCellMouseDown = (row, col, cellId, shiftKey = false) => {
    let anchor = selectionAnchor;
    if (shiftKey && anchor) {
      const newSet = getRangeSet(anchor, { row, col });
      setSelectedCells(newSet);
    } else {
      anchor = { row, col };
      setSelectionAnchor(anchor);
      setSelectedCells(new Set([`${row},${col}`]));
    }
    setIsSelecting(true);
    // Re-enable TipTap focus — safe now because isSelecting is shared context,
    // so onPointerEnter on other cells will correctly detect the drag state.
    if (cellId) focusEditor(cellId);
  };

  const handleCellMouseEnter = (row, col) => {
    if (isSelecting && selectionAnchor) {
      const newSet = getRangeSet(selectionAnchor, { row, col });
      setSelectedCells(newSet);
    }
  };

  const handleCellMouseUp = () => {
    setIsSelecting(false);
  };

  // Right-click handler — opens TableActionMenu with type "cell" so
  // the Merge / Split buttons become accessible.
  const handleCellContextMenu = (e, blockId, rowIndex, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();
    // If right-clicked cell is not already part of the selection, replace it
    if (!selectedCells.has(`${rowIndex},${columnIndex}`)) {
      setSelectedCells(new Set([`${rowIndex},${columnIndex}`]));
    }
    setTableMenu({
      blockId,
      type: "cell",
      rowIndex,
      columnIndex,
      // Use clientX/Y as position anchor
      anchor: { top: e.clientY, right: e.clientX - 6, left: e.clientX },
    });
  };

  // Keyboard navigation and selection
  const handleCellKeyDown = (e, row, col, block) => {
    const rowsData = block.content.rows;

    const slideId = findSlideByBlockId(block.id)?.id;

    // Delete / Backspace: delegate to the table deletion dispatcher so a
    // multi-cell selection is cleared, and a selected row/column is removed.
    // stopPropagation keeps the global block delete handler from firing.
    if (e.key === "Delete" || e.key === "Backspace") {
      if (slideId && deleteTableSelection(slideId, block.id)) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      e.stopPropagation();
      if (slideId) copyCell(slideId, block.id);
      return;
    }
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "v") {
      e.preventDefault();
      e.stopPropagation();
      if (!slideId || !tableClipboard) return;
      if (tableClipboard.type === "row") {
        pasteRow(slideId, block.id, row);
      } else if (tableClipboard.type === "column") {
        pasteColumn(slideId, block.id, col);
      } else {
        pasteCell(slideId, block.id, row, col);
      }
      return;
    }
    if (
      !e.shiftKey &&
      (e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown")
    ) {
      const dir = e.key.replace("Arrow", "").toLowerCase();
      focusAdjacentCell({
        rows: rowsData,
        rowIndex: row,
        columnIndex: col,
        direction: dir,
      });
      e.preventDefault();
      return;
    }
    if (e.ctrlKey && e.key.toLowerCase() === "a") {
      const all = new Set();
      rowsData.forEach((r, ri) => {
        r.cells.forEach((c, ci) => {
          all.add(`${ri},${ci}`);
        });
      });
      setSelectedCells(all);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.shiftKey && e.key.startsWith("Arrow")) {
      const dir = e.key.replace("Arrow", "").toLowerCase();
      const anchor = selectionAnchor || { row, col };
      setSelectionAnchor(anchor);
      let targetRow = row;
      let targetCol = col;
      if (dir === "right")
        targetCol = Math.min(col + 1, rowsData[0].cells.length - 1);
      if (dir === "left") targetCol = Math.max(col - 1, 0);
      if (dir === "down") targetRow = Math.min(row + 1, rowsData.length - 1);
      if (dir === "up") targetRow = Math.max(row - 1, 0);
      const newSet = getRangeSet(anchor, { row: targetRow, col: targetCol });
      setSelectedCells(newSet);
      const newCellId = rowsData[targetRow].cells[targetCol].id;
      focusEditor(newCellId);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const minColumnWidth = 36;
  const minRowHeight = 30;

  const createTableBlock = () => {
    const tableBlock = {
      id: generateId(),
      type: "table",
      content: {
        rows: [
          {
            id: generateId(),
            cells: [
              { id: generateId(), html: "<p></p>" },
              { id: generateId(), html: "<p></p>" },
            ],
          },
          {
            id: generateId(),
            cells: [
              { id: generateId(), html: "<p></p>" },
              { id: generateId(), html: "<p></p>" },
            ],
          },
        ],
      },
      headerRow: null,
      headerColumn: null,
      columnWidths: [minColumnWidth, minColumnWidth],
      rowHeights: [minRowHeight, minRowHeight],
    };

    return tableBlock;
  };

  const createEmptyCell = () => ({
    id: generateId(),
    html: "<p></p>",
    colspan: 1,
    rowspan: 1,
    hidden: false,
    width: null,
    height: null,

    background: null,
    align: "left",
  });

  const createRow = (columnCount) => {
    const cells = Array.from({ length: columnCount }, () => createEmptyCell());

    return { id: generateId(), cells };
  };

  const updateTable = (
    slideId,
    blockId,
    updater,
    { recordHistory = true } = {},
  ) => {
    const update = recordHistory ? setSlides : setSlidesWithoutHistory;

    update((slides) =>
      slides.map((slide) => {
        if (slide.id !== slideId) return slide;

        return {
          ...slide,
          blocks: slide.blocks.map((block) => {
            if (block.id !== blockId) return block;

            const updatedBlock = updater(block);

            return { ...updatedBlock };
          }),
        };
      }),
    );
  };

  const updateCell = (slideId, blockId, rowIndex, columnIndex, newContent) => {
    updateTable(
      slideId,
      blockId,
      (block) => {
        const newRows = [...block.content.rows];

        newRows[rowIndex] = {
          ...newRows[rowIndex],
          cells: [...newRows[rowIndex].cells],
        };

        newRows[rowIndex].cells[columnIndex] = {
          ...newRows[rowIndex].cells[columnIndex],
          ...newContent,
        };

        return {
          ...block,
          content: {
            ...block.content,
            rows: newRows,
          },
        };
      },
      { recordHistory: false },
    );
  };

  const addRow = (slideId, blockId, rowIndex, position = "after") => {
    updateTable(
      slideId,
      blockId,
      (block) => {
        const newRows = [...block.content?.rows];
        const columnCount = newRows[0]?.cells.length || 0;

        const newRow = createRow(columnCount);

        const insertIndex = position === "before" ? rowIndex : rowIndex + 1;

        newRows.splice(insertIndex, 0, newRow);

        return {
          ...block,
          content: {
            ...block.content,
            rows: newRows,
          },
        };
      },
      { recordHistory: true },
    );
  };

  const deleteRow = (slideId, blockId, rowIndex) =>
    updateTable(slideId, blockId, (block) => {
      if (block.content?.rows?.length === 1) return block;

      const newRows = [...block.content.rows];

      newRows.splice(rowIndex, 1);

      return {
        ...block,
        content: {
          ...block.content,
          rows: newRows,
        },
      };
    });

  const duplicateRow = (slideId, blockId, rowIndex) =>
    updateTable(slideId, blockId, (block) => {
      const newRows = [...block.content?.rows];

      const duplicated = {
        ...newRows[rowIndex],
        id: generateId(),
        cells: newRows[rowIndex].cells.map((cell) => ({
          ...cell,
          id: generateId(),
        })),
      };

      newRows.splice(rowIndex + 1, 0, duplicated);

      return {
        ...block,
        content: {
          ...block.content,
          rows: newRows,
        },
      };
    });

  const addColumn = (slideId, blockId, columnIndex, position = "after") => {
    updateTable(
      slideId,
      blockId,
      (block) => {
        const insertIndex =
          position === "before" ? columnIndex : columnIndex + 1;

        const newRows = block.content?.rows?.map((row) => {
          const newRow = {
            ...row,
            cells: [...row.cells],
          };

          newRow.cells.splice(insertIndex, 0, createEmptyCell());

          return newRow;
        });

        return {
          ...block,
          content: {
            ...block.content,
            rows: newRows,
          },
        };
      },
      { recordHistory: true },
    );
  };

  const deleteColumn = (slideId, blockId, columnIndex) =>
    updateTable(slideId, blockId, (block) => {
      if (block.content?.rows[0].cells.length === 1) return block;

      const newRows = block.content.rows.map((row) => {
        const newRow = {
          ...row,
          cells: [...row.cells],
        };

        newRow.cells.splice(columnIndex, 1);

        return newRow;
      });

      return {
        ...block,
        content: {
          ...block.content,
          rows: newRows,
        },
      };
    });

  const duplicateColumn = (slideId, blockId, columnIndex) => {
    updateTable(slideId, blockId, (block) => {
      const newRows = block.content?.rows?.map((row) => {
        const newRow = {
          ...row,
          cells: [...row.cells],
        };

        const duplicated = {
          ...newRow.cells[columnIndex],
          id: generateId(),
        };

        newRow.cells.splice(columnIndex + 1, 0, duplicated);

        return newRow;
      });

      return {
        ...block,
        content: {
          ...block.content,
          rows: newRows,
        },
      };
    });
  };

  const handleRowHandleClick = (e, block, setMenu, rowIndex) => {
    e.stopPropagation();

    const selected =
      tableSelection.blockId === block.id &&
      tableSelection.type === "row" &&
      tableSelection.row === rowIndex;

    if (selected) {
      setMenu({
        blockId: block.id,
        type: "row",
        rowIndex,
        anchor: e.currentTarget.getBoundingClientRect(),
      });
    } else {
      setTableSelection({
        blockId: block.id,
        type: "row",
        row: rowIndex,
        column: null,
      });
    }
  };

  const handleColumnHandleClick = (e, block, setMenu, columnIndex) => {
    e.stopPropagation();

    const selected =
      tableSelection.blockId === block.id &&
      tableSelection.type === "column" &&
      tableSelection.column === columnIndex;

    if (selected) {
      setMenu({
        blockId: block.id,
        type: "column",
        columnIndex,
        anchor: e.currentTarget.getBoundingClientRect(),
      });
    } else {
      setTableSelection({
        blockId: block.id,
        type: "column",
        column: columnIndex,
        row: null,
      });
    }
  };

  const clearTableSelection = () => {
    setTableSelection({
      blockId: null,
      type: null,
      row: null,
      column: null,
    });
  };

  const toggleHeaderColumn = ({ slideId, blockId, columnIndex }) => {
    updateTable(slideId, blockId, (block) => ({
      ...block,
      content: {
        ...block.content,
        headerColumn:
          block.content.headerColumn === columnIndex ? null : columnIndex,
      },
    }));
  };

  const toggleHeaderRow = ({ slideId, blockId, rowIndex }) => {
    updateTable(slideId, blockId, (block) => ({
      ...block,
      content: {
        ...block.content,
        headerRow: block.content.headerRow === rowIndex ? null : rowIndex,
      },
    }));
  };

  const startColumnResize = (e, block, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();

    setTableResizeState({
      type: "column",
      index: columnIndex,
      startX: e.clientX,
      initialWidth:
        block.content?.columnWidths?.[columnIndex] ?? minColumnWidth,
    });
  };

  const startRowResize = (e, block, rowIndex) => {
    e.preventDefault();
    e.stopPropagation();

    setTableResizeState({
      type: "row",
      index: rowIndex,
      startY: e.clientY,
      initialHeight: block.content?.rowHeights?.[rowIndex] ?? minRowHeight,
    });
  };

  const handleTableMouseMove = (e, slideId, block) => {
    if (tableResizeState.type === "column") {
      const delta = e.clientX - tableResizeState.startX;

      const newWidth = Math.max(
        minColumnWidth,
        tableResizeState.initialWidth + delta,
      );

      updateTable(
        slideId,
        block.id,
        (tableBlock) => {
          const widths = [...(tableBlock.content?.columnWidths || [])];

          widths[tableResizeState.index] = newWidth;

          return {
            ...tableBlock,
            content: {
              ...tableBlock.content,
              columnWidths: widths,
            },
          };
        },
        {
          recordHistory: false,
        },
      );
    }

    if (tableResizeState.type === "row") {
      const delta = e.clientY - tableResizeState.startY;

      const newHeight = Math.max(
        minRowHeight,
        tableResizeState.initialHeight + delta,
      );

      updateTable(
        slideId,
        block.id,
        (tableBlock) => {
          const heights = [...(tableBlock.content.rowHeights || [])];

          heights[tableResizeState.index] = newHeight;

          return {
            ...tableBlock,
            content: {
              ...tableBlock.content,
              rowHeights: heights,
            },
          };
        },
        {
          recordHistory: false,
        },
      );
    }
  };

  const handleTableMouseUp = () => {
    setTableResizeState(null);
  };

  const moveRow = (slideId, blockId, fromIndex, toIndex) => {
    updateTable(
      slideId,
      blockId,
      (block) => {
        const rows = [...(block.content?.rows || [])];
        const rowHeights = [...(block.content?.rowHeights || [])];

        if (
          fromIndex === toIndex ||
          fromIndex < 0 ||
          toIndex < 0 ||
          fromIndex >= rows.length ||
          toIndex >= rows.length
        ) {
          return block;
        }

        // 1. Extract the row
        const [movedRow] = rows.splice(fromIndex, 1);

        // 2. Insert it at new position
        rows.splice(toIndex, 0, movedRow);

        // 3. Move corresponding row height
        if (rowHeights.length) {
          const [movedHeight] = rowHeights.splice(fromIndex, 1);
          rowHeights.splice(toIndex, 0, movedHeight);
        }

        return {
          ...block,
          content: {
            ...block.content,
            rows,
            rowHeights,
          },
        };
      },
      { recordHistory: true },
    );
  };

  const moveColumn = (slideId, blockId, fromIndex, toIndex) => {
    updateTable(
      slideId,
      blockId,
      (block) => {
        const rows = block.content.rows || [];

        const newRows = rows.map((row) => ({
          ...row,
          cells: arrayMove([...row.cells], fromIndex, toIndex),
        }));

        const newColumnWidths = arrayMove(
          [...(block.content.columnWidths || [])],
          fromIndex,
          toIndex,
        );

        let headerColumn = block.content.headerColumn;

        if (headerColumn === fromIndex) {
          headerColumn = toIndex;
        } else if (headerColumn > fromIndex && headerColumn <= toIndex) {
          headerColumn -= 1;
        } else if (headerColumn < fromIndex && headerColumn >= toIndex) {
          headerColumn += 1;
        }

        return {
          ...block,
          content: {
            ...block.content,
            rows: newRows,
            columnWidths: newColumnWidths,
            headerColumn,
          },
        };
      },
      { recordHistory: true },
    );
  };

  const handleRowDragEnd = ({ e, slideId, block }) => {
    const { active, over } = e;

    if (!over || active.id === over.id) return;

    const rows = block.content.rows;

    const fromIndex = rows.findIndex((row) => row.id === active.id);
    const toIndex = rows.findIndex((row) => row.id === over.id);

    moveRow(slideId, block.id, fromIndex, toIndex);
  };

  const handleColumnDragEnd = ({ e, slideId, block }) => {
    const { active, over } = e;

    if (!over || active.id === over.id) return;

    const columns = block.content.rows?.[0]?.cells || [];

    const fromIndex = columns.findIndex((cell) => cell.id === active.id);
    const toIndex = columns.findIndex((cell) => cell.id === over.id);

    moveColumn(slideId, block.id, fromIndex, toIndex);
  };

  const handleDragEnd = ({ e, slideId, block }) => {
    const dragType = e.active.data.current?.type;

    switch (dragType) {
      case "row":
        handleRowDragEnd({ e, slideId, block });
        break;
      case "column":
        handleColumnDragEnd({ e, slideId, block });
        break;
    }
  };

  const focusAdjacentCell = ({ rows, rowIndex, columnIndex, direction }) => {
    let nextRow = rowIndex;
    let nextColumn = columnIndex;

    switch (direction) {
      case "left":
        nextColumn--;
        break;

      case "right":
        nextColumn++;
        break;

      case "up":
        nextRow--;
        break;

      case "down":
        nextRow++;
        break;
    }

    const nextCell = rows[nextRow]?.cells[nextColumn];
    if (!nextCell) return;

    focusEditor(nextCell.id);
  };

  const selectCell = (rowIndex, columnIndex) => {
    setSelectedCells((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${rowIndex},${columnIndex}`);
      return newSet;
    });
  };

  const clearCellSelection = () => {
    setSelectedCells(new Set());
    setSelectionAnchor(null);
  };

  const mergeSelectedCells = (slideId, blockId) => {
    const cellsArray = Array.from(selectedCells).map((str) => {
      const [r, c] = str.split(",").map(Number);
      return { rowIndex: r, columnIndex: c };
    });
    if (cellsArray.length < 2) return;
    const rows = cellsArray.map((c) => c.rowIndex);
    const cols = cellsArray.map((c) => c.columnIndex);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;
    updateTable(slideId, blockId, (block) => {
      const newRows = block.content.rows.map((row) => ({
        ...row,
        cells: [...row.cells],
      }));
      // update top‑left cell
      const topCell = newRows[minRow].cells[minCol];
      newRows[minRow].cells[minCol] = {
        ...topCell,
        colspan: colSpan,
        rowspan: rowSpan,
        hidden: false,
      };
      // hide other cells in the span
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (r === minRow && c === minCol) continue;
          const cell = newRows[r].cells[c];
          newRows[r].cells[c] = { ...cell, hidden: true };
        }
      }

      console.log("newRows", newRows);
      return { ...block, content: { ...block.content, rows: newRows } };
    });
    // clear selection after merge
    clearCellSelection();
  };

  const splitCell = (slideId, blockId, rowIndex, columnIndex) => {
    updateTable(slideId, blockId, (block) => {
      const target = block.content.rows[rowIndex].cells[columnIndex];
      const { colspan, rowspan } = target;
      if (colspan === 1 && rowspan === 1) return block;
      const newRows = block.content.rows.map((row) => ({
        ...row,
        cells: [...row.cells],
      }));
      // reset the merged cell
      newRows[rowIndex].cells[columnIndex] = {
        ...target,
        colspan: 1,
        rowspan: 1,
        hidden: false,
      };
      // unhide all cells that were hidden inside the span
      for (let r = rowIndex; r < rowIndex + rowspan; r++) {
        for (let c = columnIndex; c < columnIndex + colspan; c++) {
          if (r === rowIndex && c === columnIndex) continue;
          const cell = newRows[r].cells[c];
          newRows[r].cells[c] = {
            ...cell,
            hidden: false,
            colspan: 1,
            rowspan: 1,
          };
        }
      }
      return { ...block, content: { ...block.content, rows: newRows } };
    });
  };

  // Clear the content (html) of every cell in the current cell selection.
  const clearSelectedCells = (slideId, blockId) => {
    if (!selectedCells || selectedCells.size === 0) return;

    updateTable(
      slideId,
      blockId,
      (block) => {
        const newRows = block.content.rows.map((row) => ({
          ...row,
          cells: [...row.cells],
        }));

        selectedCells.forEach((coord) => {
          const [r, c] = coord.split(",").map(Number);
          const row = newRows[r];
          if (!row || !row.cells[c]) return;
          row.cells[c] = { ...row.cells[c], html: "<p></p>" };
        });

        return { ...block, content: { ...block.content, rows: newRows } };
      },
      { recordHistory: true },
    );
  };

  // Deletion dispatcher used by the Delete/Backspace keys and the menu:
  // - row selected → delete the row
  // - column selected → delete the column
  // - multi-cell selection → clear the cells' content
  const deleteTableSelection = (slideId, blockId) => {
    if (tableSelection?.blockId === blockId && tableSelection.type === "row") {
      deleteRow(slideId, blockId, tableSelection.row);
      clearTableSelection();
      return true;
    }
    if (
      tableSelection?.blockId === blockId &&
      tableSelection.type === "column"
    ) {
      deleteColumn(slideId, blockId, tableSelection.column);
      clearTableSelection();
      return true;
    }
    if (selectedCells.size > 1) {
      clearSelectedCells(slideId, blockId);
      clearCellSelection();
      return true;
    }
    return false;
  };

  // ---------------------------------------------------------------------------
  // Table Clipboard (copy / paste cells, rows, columns)
  // ---------------------------------------------------------------------------

  // Copy a single cell or a rectangular multi-cell selection into the internal
  // clipboard. The html of every cell in the selection rectangle is snapshotted.
  const copyCell = (slideId, blockId) => {
    const block = findBlock(slideId, blockId);
    if (!block) return;

    const coords = Array.from(selectedCells)
      .map((s) => s.split(",").map(Number))
      .filter((c) => Number.isInteger(c[0]) && Number.isInteger(c[1]));

    if (coords.length === 0) return;

    const rows = coords.map((c) => c[0]);
    const cols = coords.map((c) => c[1]);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);

    const grid = [];
    for (let r = minRow; r <= maxRow; r++) {
      const rowHtml = [];
      for (let c = minCol; c <= maxCol; c++) {
        rowHtml.push(block.content.rows[r]?.cells[c]?.html ?? "<p></p>");
      }
      grid.push(rowHtml);
    }

    const columnWidths = (block.content.columnWidths || []).slice(minCol, maxCol + 1);
    const rowHeights = (block.content.rowHeights || []).slice(minRow, maxRow + 1);

    setTableClipboard({ type: "cell", blockId, grid, columnWidths, rowHeights });
  };

  // Copy one full row of html content.
  const copyRow = (slideId, blockId, rowIndex) => {
    const block = findBlock(slideId, blockId);
    if (!block) return;
    const row = block.content.rows[rowIndex];
    if (!row) return;

    const htmlCells = row.cells.map((c) => c.html ?? "<p></p>");
    const columnWidths = [...(block.content.columnWidths || [])];
    const rowHeights = [block.content.rowHeights?.[rowIndex] ?? minRowHeight];
    setTableClipboard({ type: "row", blockId, htmlCells, columnWidths, rowHeights });
  };

  // Copy one full column of html content.
  const copyColumn = (slideId, blockId, columnIndex) => {
    const block = findBlock(slideId, blockId);
    if (!block) return;

    const htmlCells = block.content.rows.map(
      (row) => row.cells[columnIndex]?.html ?? "<p></p>",
    );
    const columnWidths = [block.content.columnWidths?.[columnIndex] ?? minColumnWidth];
    const rowHeights = [...(block.content.rowHeights || [])];
    setTableClipboard({ type: "column", blockId, htmlCells, columnWidths, rowHeights });
  };

  // Paste a 2D grid of html starting at (targetRow, targetCol).
  // The table auto-expands with extra rows/columns when the grid overflows
  // the current bounds.
  const pasteCell = (slideId, blockId, targetRow, targetCol) => {
    const grid = clipboardGrid();
    if (!grid.length) return;
    const block = findBlock(slideId, blockId);
    if (!block) return;

    const gridHeight = grid.length;
    const gridWidth = grid[0].length;

    updateTable(
      slideId,
      blockId,
      (b) => {
        const requiredRows = targetRow + gridHeight;
        const requiredCols = targetCol + gridWidth;

        const newRows = b.content.rows.map((row) => ({
          ...row,
          cells: [...row.cells],
        }));

        // Expand existing rows with empty cells to fit the pasted width.
        newRows.forEach((row) => {
          while (row.cells.length < requiredCols) {
            row.cells.push(createEmptyCell());
          }
        });

        // Add new rows below if the pasted grid extends past the last row.
        while (newRows.length < requiredRows) {
          newRows.push(createRow(requiredCols));
        }

        grid.forEach((rowHtml, dr) => {
          const r = targetRow + dr;
          const row = newRows[r];
          row.cells = [...row.cells];
          rowHtml.forEach((html, dc) => {
            const c = targetCol + dc;
            row.cells[c] = { ...row.cells[c], html };
          });
        });

        const columnWidths = b.content.columnWidths
          ? [...b.content.columnWidths]
          : [];
        while (columnWidths.length < requiredCols) columnWidths.push(minColumnWidth);

        const rowHeights = b.content.rowHeights
          ? [...b.content.rowHeights]
          : [];
        while (rowHeights.length < requiredRows) rowHeights.push(minRowHeight);

        // Inherit the copied widths and heights onto the pasted region.
        (tableClipboard.columnWidths || []).forEach((width, dc) => {
          columnWidths[targetCol + dc] = width;
        });
        (tableClipboard.rowHeights || []).forEach((height, dr) => {
          rowHeights[targetRow + dr] = height;
        });

        return {
          ...b,
          content: { ...b.content, rows: newRows, columnWidths, rowHeights },
        };
      },
      { recordHistory: true },
    );
  };

  // Paste a copied row (or a single-row cell grid) as a new row after targetRow.
  const pasteRow = (slideId, blockId, targetRow) => {
    const grid = clipboardGrid();
    if (!grid.length) return;
    const block = findBlock(slideId, blockId);
    if (!block) return;

    const sourceRow = grid[0] || [];
    const columnCount = Math.max(
      sourceRow.length,
      block.content.rows[0]?.cells.length || 0,
    );

    updateTable(
      slideId,
      blockId,
      (b) => {
        // Ensure every existing row has enough cells to hold the pasted width.
        const rows = b.content.rows.map((row) => {
          const cells = [...row.cells];
          while (cells.length < columnCount) cells.push(createEmptyCell());
          return { ...row, cells };
        });

        const newRow = {
          id: generateId(),
          cells: Array.from({ length: columnCount }, (_, i) => ({
            ...createEmptyCell(),
            html: sourceRow[i] ?? "<p></p>",
          })),
        };

        rows.splice(targetRow + 1, 0, newRow);

        const columnWidths = b.content.columnWidths
          ? [...b.content.columnWidths]
          : [];
        while (columnWidths.length < columnCount)
          columnWidths.push(minColumnWidth);

        // Inherit the copied row's widths onto the affected columns.
        (tableClipboard.columnWidths || []).forEach((width, i) => {
          if (columnWidths[i] !== undefined) columnWidths[i] = width;
        });

        const rowHeights = b.content.rowHeights
          ? [...b.content.rowHeights]
          : [];
        const pastedHeight = tableClipboard.rowHeights?.[0] ?? minRowHeight;
        rowHeights.splice(targetRow + 1, 0, pastedHeight);

        return {
          ...b,
          content: { ...b.content, rows, columnWidths, rowHeights },
        };
      },
      { recordHistory: true },
    );
  };

  // Paste a copied column into every row after targetCol.
  const pasteColumn = (slideId, blockId, targetCol) => {
    const grid = clipboardGrid();
    if (!grid.length) return;

    // grid for a column is an array of rows each holding a single html string.
    const sourceColumn = grid.map((row) => row[0]);

    updateTable(
      slideId,
      blockId,
      (b) => {
        let rows = b.content.rows.map((row) => ({
          ...row,
          cells: [...row.cells],
        }));

        // Expand the table with new rows if the pasted column is taller.
        while (rows.length < sourceColumn.length) {
          const columnCount = rows[0]?.cells.length || 0;
          rows.push(createRow(columnCount));
        }

        rows = rows.map((row, r) => {
          const cells = [...row.cells];
          cells.splice(targetCol + 1, 0, {
            ...createEmptyCell(),
            html: sourceColumn[r] ?? "<p></p>",
          });
          return { ...row, cells };
        });

        const columnWidths = b.content.columnWidths
          ? [...b.content.columnWidths]
          : [];
        const pastedWidth = tableClipboard.columnWidths?.[0] ?? minColumnWidth;
        columnWidths.splice(targetCol + 1, 0, pastedWidth);

        const rowHeights = b.content.rowHeights
          ? [...b.content.rowHeights]
          : [];
        while (rowHeights.length < rows.length) rowHeights.push(minRowHeight);
        // Inherit the copied column's row heights onto the affected rows.
        (tableClipboard.rowHeights || []).forEach((height, r) => {
          if (rowHeights[r] !== undefined) rowHeights[r] = height;
        });

        return {
          ...b,
          content: { ...b.content, rows, columnWidths, rowHeights },
        };
      },
      { recordHistory: true },
    );
  };

  return {
    createTableBlock,
    createEmptyCell,
    updateTable,
    updateCell,
    addRow,
    deleteRow,
    duplicateRow,
    addColumn,
    duplicateColumn,
    deleteColumn,
    clearTableSelection,
    handleColumnHandleClick,
    handleRowHandleClick,
    toggleHeaderRow,
    toggleHeaderColumn,

    startColumnResize,
    startRowResize,
    handleTableMouseMove,
    handleTableMouseUp,
    minColumnWidth,
    minRowHeight,

    moveRow,
    handleDragEnd,

    focusAdjacentCell,
    // Selection utilities
    selectCell,
    clearCellSelection,
    mergeSelectedCells,
    splitCell,
    // Deletion utilities
    clearSelectedCells,
    deleteTableSelection,
    // expose raw selected set for UI
    selectedCells,
    setSelectedCells,
    // Interaction handlers
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    handleCellKeyDown,
    handleCellContextMenu,
    // Clipboard utilities
    copyCell,
    copyRow,
    copyColumn,
    pasteCell,
    pasteRow,
    pasteColumn,
    tableClipboard,
    setTableClipboard,
    // Expose for TableBlock to drive data-selecting attribute
    isSelecting,
  };
}
