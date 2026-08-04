import { generateId } from "../../utils/generateId";

export const MIN_COLUMN_WIDTH = 36;
export const MIN_ROW_HEIGHT = 30;
export const EMPTY_CELL_HTML = "<p></p>";

export const createEmptyCell = () => ({
  id: generateId(),
  html: EMPTY_CELL_HTML,
  colspan: 1,
  rowspan: 1,
  hidden: false,
  width: null,
  height: null,

  background: null,
  align: "left",
});

export const createRow = (columnCount) => {
  const cells = Array.from({ length: columnCount }, () => createEmptyCell());

  return { id: generateId(), cells };
};

export const createTableBlock = () => ({
  id: generateId(),
  type: "table",
  content: {
    rows: [
      {
        id: generateId(),
        cells: [
          { id: generateId(), html: EMPTY_CELL_HTML },
          { id: generateId(), html: EMPTY_CELL_HTML },
        ],
      },
      {
        id: generateId(),
        cells: [
          { id: generateId(), html: EMPTY_CELL_HTML },
          { id: generateId(), html: EMPTY_CELL_HTML },
        ],
      },
    ],
  },
  headerRow: null,
  headerColumn: null,
  columnWidths: [MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH],
  rowHeights: [MIN_ROW_HEIGHT, MIN_ROW_HEIGHT],
});

export const findBlock = (slides, slideId, blockId) => {
  const slide = slides.find((s) => s.id === slideId);
  return slide?.blocks.find((b) => b.id === blockId) || null;
};

export const findSlideByBlockId = (slides, blockId) => {
  return slides.find((s) => s.blocks.some((b) => b.id === blockId));
};

// Utility to compute rectangular range set
export const getRangeSet = (anchor, current) => {
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

// The clipboard always stores a 2D grid of html strings (rows of cells).
// This normalizes whatever was copied into that shape so paste can be shared.
export const clipboardGrid = (tableClipboard) => {
  if (!tableClipboard) return [];
  if (tableClipboard.type === "cell") return tableClipboard.grid;
  if (tableClipboard.type === "row") return [tableClipboard.htmlCells];
  if (tableClipboard.type === "column")
    return tableClipboard.htmlCells.map((html) => [html]);
  return [];
};
