import { useEditorContext } from "../../components/EditorContext";
import { generateId } from "../../utils/generateId";
import {
  htmlToPlainText,
  parseTsvToGrid,
  textToCellHtml,
} from "../../utils/clipboardFormat";
import { writeOsText } from "../../utils/osClipboard";
import { useHistory } from "../useHistory";
import {
  MIN_COLUMN_WIDTH,
  MIN_ROW_HEIGHT,
  clipboardGrid,
  createEmptyCell,
  createRow,
  findBlock,
} from "./tableUtils";

export function useTableClipboard({ updateTable }) {
  const { slidesHistory } = useHistory();
  const slides = slidesHistory.present;
  const { tableClipboard, setTableClipboard, selectedCells } =
    useEditorContext();

  const copyCell = (slideId, blockId) => {
    const block = findBlock(slides, slideId, blockId);
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

    const columnWidths = (block.content.columnWidths || []).slice(
      minCol,
      maxCol + 1,
    );
    const rowHeights = (block.content.rowHeights || []).slice(
      minRow,
      maxRow + 1,
    );

    setTableClipboard({ type: "cell", blockId, grid, columnWidths, rowHeights });

    const tsv = grid
      .map((row) => row.map((html) => htmlToPlainText(html)).join("\t"))
      .join("\n");

    writeOsText(tsv);
  };

  const copyRow = (slideId, blockId, rowIndex) => {
    const block = findBlock(slides, slideId, blockId);
    if (!block) return;
    const row = block.content.rows[rowIndex];
    if (!row) return;

    const htmlCells = row.cells.map((c) => c.html ?? "<p></p>");
    const columnWidths = [...(block.content.columnWidths || [])];
    const rowHeights = [
      block.content.rowHeights?.[rowIndex] ?? MIN_ROW_HEIGHT,
    ];
    setTableClipboard({ type: "row", blockId, htmlCells, columnWidths, rowHeights });

    writeOsText(htmlCells.map((html) => htmlToPlainText(html)).join("\t"));
  };

  const copyColumn = (slideId, blockId, columnIndex) => {
    const block = findBlock(slides, slideId, blockId);
    if (!block) return;

    const htmlCells = block.content.rows.map(
      (row) => row.cells[columnIndex]?.html ?? "<p></p>",
    );
    const columnWidths = [
      block.content.columnWidths?.[columnIndex] ?? MIN_COLUMN_WIDTH,
    ];
    const rowHeights = [...(block.content.rowHeights || [])];
    setTableClipboard({ type: "column", blockId, htmlCells, columnWidths, rowHeights });

    writeOsText(htmlCells.map((html) => htmlToPlainText(html)).join("\n"));
  };

  const pasteGridIntoTable = (slideId, blockId, targetRow, targetCol, grid, widths = [], heights = []) => {
    if (!grid.length) return;
    const block = findBlock(slides, slideId, blockId);
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

        newRows.forEach((row) => {
          while (row.cells.length < requiredCols) {
            row.cells.push(createEmptyCell());
          }
        });

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
        while (columnWidths.length < requiredCols)
          columnWidths.push(MIN_COLUMN_WIDTH);

        const rowHeights = b.content.rowHeights ? [...b.content.rowHeights] : [];
        while (rowHeights.length < requiredRows) rowHeights.push(MIN_ROW_HEIGHT);

        widths.forEach((width, dc) => {
          columnWidths[targetCol + dc] = width;
        });
        heights.forEach((height, dr) => {
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

  const pasteCell = (slideId, blockId, targetRow, targetCol) => {
    const grid = clipboardGrid(tableClipboard);
    if (!grid.length) return;

    pasteGridIntoTable(
      slideId,
      blockId,
      targetRow,
      targetCol,
      grid,
      tableClipboard.columnWidths || [],
      tableClipboard.rowHeights || [],
    );
  };

  const pasteTextGrid = (slideId, blockId, targetRow, targetCol, text) => {
    if (!text) return;

    const grid = parseTsvToGrid(text).map((row) =>
      row.map((cell) => textToCellHtml(cell)),
    );

    if (!grid.length) return;

    pasteGridIntoTable(slideId, blockId, targetRow, targetCol, grid);
  };

  const pasteRow = (slideId, blockId, targetRow) => {
    const grid = clipboardGrid(tableClipboard);
    if (!grid.length) return;
    const block = findBlock(slides, slideId, blockId);
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
          columnWidths.push(MIN_COLUMN_WIDTH);

        (tableClipboard.columnWidths || []).forEach((width, i) => {
          if (columnWidths[i] !== undefined) columnWidths[i] = width;
        });

        const rowHeights = b.content.rowHeights ? [...b.content.rowHeights] : [];
        const pastedHeight = tableClipboard.rowHeights?.[0] ?? MIN_ROW_HEIGHT;
        rowHeights.splice(targetRow + 1, 0, pastedHeight);

        return {
          ...b,
          content: { ...b.content, rows, columnWidths, rowHeights },
        };
      },
      { recordHistory: true },
    );
  };

  const pasteColumn = (slideId, blockId, targetCol) => {
    const grid = clipboardGrid(tableClipboard);
    if (!grid.length) return;

    const sourceColumn = grid.map((row) => row[0]);

    updateTable(
      slideId,
      blockId,
      (b) => {
        let rows = b.content.rows.map((row) => ({
          ...row,
          cells: [...row.cells],
        }));

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
        const pastedWidth = tableClipboard.columnWidths?.[0] ?? MIN_COLUMN_WIDTH;
        columnWidths.splice(targetCol + 1, 0, pastedWidth);

        const rowHeights = b.content.rowHeights ? [...b.content.rowHeights] : [];
        while (rowHeights.length < rows.length) rowHeights.push(MIN_ROW_HEIGHT);
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
    copyCell,
    copyRow,
    copyColumn,
    pasteCell,
    pasteRow,
    pasteColumn,
    pasteTextGrid,
  };
}