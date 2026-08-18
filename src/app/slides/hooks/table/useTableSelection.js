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
    cellDragActive,
    setCellDragActive,
    selectedCells,
    focusEditor,
    setTableMenu,
    tableDragRef,
    lastPointerTypeRef,
    activeEditor,
    setActiveEditor,
    setShowSlashMenu,
  } = useEditorContext();

  // Leave cell edit mode: blur the active editor's DOM and clear the toolbar /
  // slash-menu state so a later paste targets the (focused) cell div instead of
  // the contenteditable.
  const exitCellEditing = useCallback(() => {
    activeEditor?.view?.dom?.blur?.();
    setActiveEditor(null);
    setShowSlashMenu(false);
  }, [activeEditor, setActiveEditor, setShowSlashMenu]);

  const handleCellMouseDown = (row, col, cellId, shiftKey = false, blockId, e) => {
    const pointerType = e?.pointerType || "mouse";
    lastPointerTypeRef.current = pointerType;
    // Shared drag state so the press cell, dragged-over cells and release cell
    // all agree on what happened during this drag.
    tableDragRef.current = {
      didDrag: false,
      blockId: blockId || null,
      lastCell: { row, col },
    };
    // A fresh pointer-down on a cell starts a new interaction: close any open
    // table menu (right-click/long-press/drag-release) so it doesn't linger.
    setTableMenu(null);

    // Shift-click always extends the existing anchor range without entering
    // edit mode — mirrors Excel.
    if (shiftKey && selectionAnchor) {
      const newSet = getRangeSet(selectionAnchor, { row, col });
      setSelectedCells(newSet);
      setSelectionAnchor(selectionAnchor);
      setIsSelecting(true);
      setCellDragActive(false);
      exitCellEditing();
      return;
    }

    const coord = `${row},${col}`;

    // Second click on an already-selected single cell enters edit mode (Excel):
    // drop the selection and focus that cell's editor.
    if (!shiftKey && selectedCells.size === 1 && selectedCells.has(coord)) {
      clearCellSelection();
      if (cellId) focusEditor(cellId);
      return;
    }

    // First click selects the single cell without focusing the editor.
    setSelectionAnchor({ row, col });
    setSelectedCells(new Set([coord]));
    setIsSelecting(true);
    setCellDragActive(false);
    // The pointerdown default would move focus into the cell's contenteditable
    // and immediately start editing. Cancel it and focus the cell div instead
    // (a div summons no mobile keyboard, and pasting still targets the table).
    // Canceling pointerdown also suppresses the compatibility mouse events, so
    // ProseMirror never gets a chance to focus its editor.
    e?.preventDefault?.();
    exitCellEditing();
    e?.currentTarget?.focus?.({ preventScroll: true });
  };

  const handleCellMouseEnter = (row, col) => {
    if (!tableDragRef.current) {
      tableDragRef.current = {
        didDrag: false,
        blockId: null,
        lastCell: { row, col },
      };
    } else {
      tableDragRef.current.lastCell = { row, col };
    }
    if (!isSelecting || !selectionAnchor) return;
    const crossing =
      selectionAnchor.row !== row || selectionAnchor.col !== col;
    if (crossing) {
      tableDragRef.current.didDrag = true;
      setCellDragActive(true);
    }
    if (!crossing && !cellDragActive) return;
    const newSet = getRangeSet(selectionAnchor, { row, col });
    setSelectedCells(newSet);
  };

  const handleCellMouseUp = useCallback(
    (e) => {
      setIsSelecting(false);
      setCellDragActive(false);
      const drag = tableDragRef.current;
      tableDragRef.current = null;
      // A cancelled gesture (browser took over for scroll/native selection):
      // clean up but do not surface the cell menu.
      if (e?.type === "pointercancel") return;
      // After a cross-cell drag, surface the cell menu (Copy/Paste/Merge/Split/
      // Clear) at the release point so those actions are reachable without
      // right-clicking.
      if (!drag?.didDrag || !drag.blockId) return;
      const pointerX = typeof e?.clientX === "number" ? e.clientX : 0;
      const pointerY = typeof e?.clientY === "number" ? e.clientY : 0;
      setTableMenu({
        blockId: drag.blockId,
        type: "cell",
        rowIndex: drag.lastCell?.row ?? 0,
        columnIndex: drag.lastCell?.col ?? 0,
        anchor: { top: pointerY, right: pointerX - 6, left: pointerX },
      });
    },
    [setIsSelecting, setCellDragActive, setTableMenu, tableDragRef],
  );

  // Right-click handler — opens the menu with type "cell" so the Merge/Split
  // buttons become accessible.
  const handleCellContextMenu = (e, blockId, rowIndex, columnIndex) => {
    // On touch, a long-press is the native gesture for text selection (Android
    // fires contextmenu on long-press). Let the browser keep it: no cell select,
    // no menu, no preventDefault. A tap already selects the cell (first click),
    // so long-press keeps native text selection on top of it. Right-click keeps
    // the menu.
    const isTouch =
      lastPointerTypeRef.current === "touch" ||
      e?.pointerType === "touch" ||
      e?.sourceCapabilities?.firesTouchEvents;
    if (isTouch) return;
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
    setCellDragActive(false);
    tableDragRef.current = null;
  }, [setSelectedCells, setSelectionAnchor, setCellDragActive, tableDragRef]);

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