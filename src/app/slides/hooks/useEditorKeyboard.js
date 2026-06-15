import { useEditorContext } from "../components/EditorContext";
import { useClipboard } from "./useClipboard";
import { useHistory } from "./useHistory";

export function useEditorKeyboard() {
  const { selectedBlocks } = useEditorContext();
  const { undo, redo } = useHistory();
  const {
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    pasteBlocks,
  } = useClipboard();

  const handleKeyDown = (e) => {
    const isEditingText = !!activeEditor;

    if (isEditingText) return;

    const key = e.key.toLowerCase();

    if (e.ctrlKey && key === "z") {
      e.preventDefault();

      undo();
    }

    if (e.ctrlKey && key === "y") {
      e.preventDefault();

      redo();
    }

    // NEW IMPLEMENTATION

    if (!selectedBlocks?.length) return;

    if (key === "delete") {
      deleteSelectedBlocks();
    }

    if (e.ctrlKey && key === "c") {
      copySelectedBlocks();
    }

    if (e.ctrlKey && key === "v") {
      pasteBlocks();
    }

    if (e.ctrlKey && key === "d") {
      e.preventDefault();
      duplicateSelectedBlocks();
    }
  };

  return { handleKeyDown };
}
