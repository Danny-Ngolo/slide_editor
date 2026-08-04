import { useEditorContext } from "../../components/EditorContext";

export function useTableDeletion({
  updateTable,
  deleteRow,
  deleteColumn,
  clearTableSelection,
  clearCellSelection,
}) {
  const { tableSelection, selectedCells } = useEditorContext();

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

  return {
    clearSelectedCells,
    deleteTableSelection,
  };
}