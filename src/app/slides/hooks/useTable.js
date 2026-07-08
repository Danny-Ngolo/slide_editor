import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";
import { useEditorContext } from "../components/EditorContext";
import { arrayMove } from "@dnd-kit/sortable";

export function useTable() {
  const { setSlides, setSlidesWithoutHistory } = useHistory();
  const {
    tableSelection,
    setTableSelection,
    tableResizeState,
    setTableResizeState,
  } = useEditorContext();

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

        console.log("newRows", newRows);

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

  const handleMouseMove = (e, slideId, block) => {
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

  const handleMouseUp = () => {
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

  return {
    createTableBlock,
    updateCell,
    addRow,
    duplicateRow,
    deleteRow,
    addColumn,
    duplicateColumn,
    deleteColumn,
    tableSelection,
    setTableSelection,
    handleColumnHandleClick,
    handleRowHandleClick,
    toggleHeaderRow,
    toggleHeaderColumn,

    startColumnResize,
    startRowResize,
    handleMouseMove,
    handleMouseUp,
    minColumnWidth,
    minRowHeight,

    moveRow,
    handleDragEnd,
  };
}
