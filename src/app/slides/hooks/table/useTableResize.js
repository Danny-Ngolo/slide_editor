import { useCallback } from "react";
import { useEditorContext } from "../../components/EditorContext";
import { MIN_COLUMN_WIDTH, MIN_ROW_HEIGHT } from "./tableUtils";

export function useTableResize({ updateTable }) {
  const { tableResizeState, setTableResizeState } = useEditorContext();

  const startColumnResize = (e, block, columnIndex) => {
    e.preventDefault();
    e.stopPropagation();

    setTableResizeState({
      type: "column",
      index: columnIndex,
      startX: e.clientX,
      initialWidth:
        block.content?.columnWidths?.[columnIndex] ?? MIN_COLUMN_WIDTH,
    });
  };

  const startRowResize = (e, block, rowIndex) => {
    e.preventDefault();
    e.stopPropagation();

    setTableResizeState({
      type: "row",
      index: rowIndex,
      startY: e.clientY,
      initialHeight: block.content?.rowHeights?.[rowIndex] ?? MIN_ROW_HEIGHT,
    });
  };

  const handleTableMouseMove = useCallback(
    (e, slideId, block) => {
      if (tableResizeState.type === "column") {
        const delta = e.clientX - tableResizeState.startX;

        const newWidth = Math.max(
          MIN_COLUMN_WIDTH,
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
          MIN_ROW_HEIGHT,
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
    },
    [tableResizeState, updateTable],
  );

  const handleTableMouseUp = useCallback(() => {
    setTableResizeState(null);
  }, [setTableResizeState]);

  return {
    startColumnResize,
    startRowResize,
    handleTableMouseMove,
    handleTableMouseUp,
  };
}