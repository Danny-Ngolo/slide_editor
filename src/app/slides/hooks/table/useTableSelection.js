import { useCallback } from "react";
import { useEditorContext } from "../../components/EditorContext";
import { getRangeSet } from "./tableUtils";

export function useTableSelection({ updateTable }) {
  const {
    selectionAnchor,
    setSelectionAnchor,
    setSelectedCells,
    isSelecting,
    setIsSelecting,
    selectedCells,
    focusEditor,
    setTableMenu,
  } = useEditorContext();

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
    if (cellId) focusEditor(cellId);
  };

  const handleCellMouseEnter = (row, col) => {
    if (isSelecting && selectionAnchor) {
      const newSet = getRangeSet(selectionAnchor, { row, col });
      setSelectedCells(newSet);
    }
  };

  const handleCellMouseUp = useCallback(() => {
    setIsSelecting(false);
  }, [setIsSelecting]);

  // Right-click handler — opens the menu with type "cell" so the Merge/Split
  // buttons become accessible.
  const handleCellContextMenu = (e, blockId, rowIndex, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedCells.has(`${rowIndex},${columnIndex}`)) {
      setSelectedCells(new Set([`${rowIndex},${columnIndex}`]));
    }
    setTableMenu({
      blockId,
      type: "cell",
      rowIndex,
      columnIndex,
      anchor: { top: e.clientY, right: e.clientX - 6, left: e.clientX },
    });
  };

  const selectCell = (rowIndex, columnIndex) => {
    setSelectedCells((prev) => {
      const newSet = new Set(prev);
      newSet.add(`${rowIndex},${columnIndex}`);
      return newSet;
    });
  };

  const clearCellSelection = useCallback(() => {
    setSelectedCells(new Set());
    setSelectionAnchor(null);
  }, [setSelectedCells, setSelectionAnchor]);

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
      const topCell = newRows[minRow].cells[minCol];
      newRows[minRow].cells[minCol] = {
        ...topCell,
        colspan: colSpan,
        rowspan: rowSpan,
        hidden: false,
      };
      for (let r = minRow; r <= maxRow; r++) {
        for (let c = minCol; c <= maxCol; c++) {
          if (r === minRow && c === minCol) continue;
          const cell = newRows[r].cells[c];
          newRows[r].cells[c] = { ...cell, hidden: true };
        }
      }

      return { ...block, content: { ...block.content, rows: newRows } };
    });
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
      newRows[rowIndex].cells[columnIndex] = {
        ...target,
        colspan: 1,
        rowspan: 1,
        hidden: false,
      };
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

  return {
    handleCellMouseDown,
    handleCellMouseEnter,
    handleCellMouseUp,
    handleCellContextMenu,
    selectCell,
    clearCellSelection,
    mergeSelectedCells,
    splitCell,
  };
}