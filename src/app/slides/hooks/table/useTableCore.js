import { useCallback } from "react";
import { useEditorContext } from "../../components/EditorContext";
import { useHistory } from "../useHistory";

export function useTableCore() {
  const { setSlides, setSlidesWithoutHistory } = useHistory();
  const { focusEditor } = useEditorContext();

  const updateTable = useCallback(
    (slideId, blockId, updater, { recordHistory = true } = {}) => {
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
    },
    [setSlides, setSlidesWithoutHistory],
  );

  const updateCell = useCallback(
    (slideId, blockId, rowIndex, columnIndex, newContent) => {
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
    },
    [updateTable],
  );

  const focusAdjacentCell = useCallback(
    ({ rows, rowIndex, columnIndex, direction }) => {
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
    },
    [focusEditor],
  );

  return { updateTable, updateCell, focusAdjacentCell };
}
