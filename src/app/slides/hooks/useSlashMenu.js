import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { useSlides } from "./useSlides";

export function useSlashMenu() {
  const {
    setSelectedBlockIndex,
    showSlashMenu,
    setShowSlashMenu,
    slashRange,
    setSlashRange,
    filteredItems,
  } = useEditorContext();
  const { addBlock } = useSlides();

  const handleDirectionKey = useCallback(
    (e) => {
      if (!showSlashMenu || filteredItems?.length === "undefined") return;

      const itemsCount = filteredItems.length;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedBlockIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedBlockIndex((prev) => (prev + 1) % itemsCount);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setShowSlashMenu(false);
      }
    },
    [
      showSlashMenu,
      filteredItems,
      setSelectedBlockIndex,
      setShowSlashMenu,
    ],
  );

  const handleSlashSelect = (editor, slideId, type, variant = undefined) => {
    if (!editor || !slashRange) return;

    // delete "/query"
    editor.chain().focus().deleteRange(slashRange).run();

    // insert new block
    addBlock(slideId, type, null, { variant });

    setShowSlashMenu(false);
    setSlashRange(null);
  };

  return {
    handleDirectionKey,
    handleSlashSelect,
  };
}
