import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";
import { useEditorContext } from "../components/EditorContext";

export function useTable() {
  const { setSlides, setSlidesWithoutHistory } = useHistory();
  const { tableSelection, setTableSelection } = useEditorContext();

  const createTableBlock = () => {
    const tableBlock = {
      id: generateId(),
      type: "table",
      content: {
        rows: [
          [
            {
              id: generateId(),
              html: "<p></p>",
            },
            {
              id: generateId(),
              html: "<p></p>",
            },
          ],
          [
            {
              id: generateId(),
              html: "<p></p>",
            },
            {
              id: generateId(),
              html: "<p></p>",
            },
          ],
        ],
      },
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
    return Array.from({ length: columnCount }, () => createEmptyCell());
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
        const newRows = [...block.content?.rows];

        newRows[rowIndex] = [...newRows[rowIndex]];

        newRows[rowIndex][columnIndex] = {
          ...newRows[rowIndex][columnIndex],
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
        console.log("adding row");

        const newRows = [...block.content?.rows];

        const columnCount = newRows[0]?.length || 0;

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

      const duplicated = newRows[rowIndex].map((cell) => ({
        ...cell,
        id: generateId(),
      }));

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
          const newRow = [...row];

          newRow.splice(insertIndex, 0, createEmptyCell());

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
      if (block.content?.rows[0].length === 1) return block;

      const newRows = block.content.rows.map((row) => {
        const newRow = [...row];

        newRow.splice(columnIndex, 1);

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
        const newRow = [...row];

        const duplicated = {
          ...row[columnIndex],
          id: generateId(),
        };

        newRow.splice(columnIndex + 1, 0, duplicated);

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
  };
}
