import { useEditorContext } from "../components/EditorContext";
import { useClipboard } from "./useClipboard";
import { useHistory } from "./useHistory";

export function useEditorKeyboard() {
  const { activeEditor, selectedBlocks, selectedSlides, isUndoRedoRef } =
    useEditorContext();
  const { undo, redo } = useHistory();
  const {
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    pasteBlocks,
    copySelectedSlides,
    pasteSlides,
    duplicateSelectedSlides,
    deleteSelectedSlides,
  } = useClipboard();

  const handleKeyDown = (e) => {
    const isEditingText = !!activeEditor;

    if (isEditingText) return;

    const key = e.key.toLowerCase();

    if (e.ctrlKey && key === "z") {
      e.preventDefault();

      undo(isUndoRedoRef);
      return;
    }

    if (e.ctrlKey && key === "y") {
      e.preventDefault();

      redo(isUndoRedoRef);
      return;
    }

    if (selectedBlocks.length) {
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

      return;
    }

    if (selectedSlides.length) {
      if (key === "delete") {
        deleteSelectedSlides();
      }

      if (e.ctrlKey && key === "c") {
        copySelectedSlides();
      }

      if (e.ctrlKey && key === "v") {
        pasteSlides();
      }

      if (e.ctrlKey && key === "d") {
        e.preventDefault();
        duplicateSelectedSlides();
      }
    }
  };

  return { handleKeyDown };
}