import { useEffect } from "react";
import { useEditorContext } from "../components/EditorContext";
import { useHistory } from "./useHistory";
import {
  MIN_COLUMN_WIDTH,
  MIN_ROW_HEIGHT,
  createEmptyCell,
  createTableBlock,
  findSlideByBlockId,
  getRangeSet,
} from "./table/tableUtils";
import { useTableClipboard } from "./table/useTableClipboard";
import { useTableCore } from "./table/useTableCore";
import { useTableDeletion } from "./table/useTableDeletion";
import { useTableResize } from "./table/useTableResize";
import { useTableSelection } from "./table/useTableSelection";
import { useTableStructure } from "./table/useTableStructure";

export function useTable() {
  const {
    selectionAnchor,
    setSelectionAnchor,
    setSelectedCells,
    selectedCells,
    setTableClipboard,
    tableClipboard,
    focusEditor,
    isSelecting,
    registerTablePasteHandler,
  } = useEditorContext();
  const { slidesHistory } = useHistory();
  const slides = slidesHistory.present;

  const { updateTable, updateCell, focusAdjacentCell } = useTableCore();
  const structure = useTableStructure({ updateTable });
  const selection = useTableSelection({ updateTable });
  const clipboard = useTableClipboard({ updateTable });
  const resize = useTableResize({ updateTable });
  const deletion = useTableDeletion({
    updateTable,
    deleteRow: structure.deleteRow,
    deleteColumn: structure.deleteColumn,
    clearTableSelection: structure.clearTableSelection,
    clearCellSelection: selection.clearCellSelection,
  });

  // Expose the OS-clipboard grid import to the global paste handler. Registered
  // per active table block; the handler itself is generic over slide/block ids.
  useEffect(() => {
    registerTablePasteHandler(({ blockId, targetRow, targetCol, text }) => {
      const slideId = findSlideByBlockId(slides, blockId)?.id;

      if (slideId) {
        clipboard.pasteTextGrid(slideId, blockId, targetRow, targetCol, text);
      }
    });

    return () => registerTablePasteHandler(null);
  }, [registerTablePasteHandler, clipboard, slides]);

  // Keyboard navigation and selection
  const handleCellKeyDown = (e, row, col, block) => {
    const rowsData = block.content.rows;

    const slideId = findSlideByBlockId(slides, block.id)?.id;

    if (e.key === "Delete" || e.key === "Backspace") {
      if (slideId && deletion.deleteTableSelection(slideId, block.id)) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      e.stopPropagation();
      if (slideId) clipboard.copyCell(slideId, block.id);
      return;
    }
    if (e.ctrlKey && !e.shiftKey && e.key.toLowerCase() === "v") {
      if (!slideId || !tableClipboard) {
        // Nothing in the in-memory clipboard: let the native paste event fire
        // so the global paste handler can import text/plain (e.g. from Excel).
        return;
      }

      e.preventDefault();
      e.stopPropagation();
      if (tableClipboard.type === "row") {
        clipboard.pasteRow(slideId, block.id, row);
      } else if (tableClipboard.type === "column") {
        clipboard.pasteColumn(slideId, block.id, col);
      } else {
        clipboard.pasteCell(slideId, block.id, row, col);
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

  return {
    createTableBlock,
    createEmptyCell,
    updateTable,
    updateCell,
    addRow: structure.addRow,
    deleteRow: structure.deleteRow,
    duplicateRow: structure.duplicateRow,
    addColumn: structure.addColumn,
    duplicateColumn: structure.duplicateColumn,
    deleteColumn: structure.deleteColumn,
    clearTableSelection: structure.clearTableSelection,
    handleColumnHandleClick: structure.handleColumnHandleClick,
    handleRowHandleClick: structure.handleRowHandleClick,
    toggleHeaderRow: structure.toggleHeaderRow,
    toggleHeaderColumn: structure.toggleHeaderColumn,

    startColumnResize: resize.startColumnResize,
    startRowResize: resize.startRowResize,
    handleTableMouseMove: resize.handleTableMouseMove,
    handleTableMouseUp: resize.handleTableMouseUp,
    minColumnWidth: MIN_COLUMN_WIDTH,
    minRowHeight: MIN_ROW_HEIGHT,

    moveRow: structure.moveRow,
    handleDragEnd: structure.handleDragEnd,

    focusAdjacentCell,
    // Selection utilities
    selectCell: selection.selectCell,
    clearCellSelection: selection.clearCellSelection,
    mergeSelectedCells: selection.mergeSelectedCells,
    splitCell: selection.splitCell,
    // Deletion utilities
    clearSelectedCells: deletion.clearSelectedCells,
    deleteTableSelection: deletion.deleteTableSelection,
    // expose raw selected set for UI
    selectedCells,
    setSelectedCells,
    // Interaction handlers
    handleCellMouseDown: selection.handleCellMouseDown,
    handleCellMouseEnter: selection.handleCellMouseEnter,
    handleCellMouseUp: selection.handleCellMouseUp,
    handleCellKeyDown,
    handleCellContextMenu: selection.handleCellContextMenu,
    // Clipboard utilities
    copyCell: clipboard.copyCell,
    copyRow: clipboard.copyRow,
    copyColumn: clipboard.copyColumn,
    pasteCell: clipboard.pasteCell,
    pasteRow: clipboard.pasteRow,
    pasteColumn: clipboard.pasteColumn,
    tableClipboard,
    setTableClipboard,
    // Expose for TableBlock to drive data-selecting attribute
    isSelecting,
  };
}