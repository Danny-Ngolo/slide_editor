import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { useClipboard } from "./useClipboard";
import { useHistory } from "./useHistory";
import { useSlides } from "./useSlides";

export function useEditorKeyboard() {
  const {
    activeEditor,
    selectedBlocks,
    setSelectedBlocks,
    selectedBlock,
    setSelectedBlock,
    selectedSlides,
    setSelectedSlides,
    isUndoRedoRef,
  } = useEditorContext();
  const { undo, redo, setSlides } = useHistory();
  const { slidesHistory } = useHistory();
  const {
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    pasteBlocks,
    copySelectedSlides,
    pasteSlides,
    duplicateSelectedSlides,
    deleteSelectedSlides,
    duplicateSlide,
  } = useClipboard();
  const { activeSlideId, setActiveSlideId, effectiveActiveSlideId, addBlock, moveBlocksToSlide } =
    useSlides();
  const slides = slidesHistory.present;

  const goToSlide = useCallback(
    (dir) => {
      if (!slides.length) return;

      const currentIndex = slides.findIndex(
        (slide) => slide.id === effectiveActiveSlideId,
      );
      const baseIndex = currentIndex === -1 ? 0 : currentIndex;
      const nextIndex = Math.max(
        0,
        Math.min(slides.length - 1, baseIndex + dir),
      );

      if (nextIndex !== currentIndex) {
        setActiveSlideId(slides[nextIndex].id);
      }
    },
    [slides, effectiveActiveSlideId, setActiveSlideId],
  );

  const moveSelectedBlocks = useCallback(
    (dir) => {
      if (!selectedBlocks.length) return;

      setSlides((prev) =>
        prev.map((slide) => {
          const indices = [];

          slide.blocks.forEach((block, i) => {
            if (
              selectedBlocks.some(
                (selected) =>
                  selected.slideId === slide.id &&
                  selected.blockId === block.id,
              )
            ) {
              indices.push(i);
            }
          });

          if (!indices.length) return slide;

          const first = indices[0];
          const last = indices[indices.length - 1];
          const blocks = [...slide.blocks];

          if (dir < 0) {
            if (first === 0) return slide;

            const [moved] = blocks.splice(first - 1, 1);
            blocks.splice(last, 0, moved);
          } else {
            if (last === blocks.length - 1) return slide;

            const [moved] = blocks.splice(last + 1, 1);
            blocks.splice(first, 0, moved);
          }

          return { ...slide, blocks };
        }),
      );
    },
    [selectedBlocks, setSlides],
  );

  const moveSelection = useCallback(
    (dir) => {
      if (selectedSlides.length) return;

      const slide = slides.find((s) => s.id === effectiveActiveSlideId);

      if (!slide || !slide.blocks.length) return;

      const current = selectedBlocks.find(
        (selected) => selected.slideId === slide.id,
      );
      const currentIndex = current
        ? slide.blocks.findIndex((block) => block.id === current.blockId)
        : -1;
      const baseIndex =
        currentIndex === -1 ? (dir < 0 ? slide.blocks.length : -1) : currentIndex;
      const nextIndex = Math.max(
        0,
        Math.min(slide.blocks.length - 1, baseIndex + dir),
      );
      const target = slide.blocks[nextIndex];

      setSelectedBlock({ slideId: slide.id, blockId: target.id });
      setSelectedBlocks([{ slideId: slide.id, blockId: target.id }]);
    },
    [
      slides,
      effectiveActiveSlideId,
      selectedBlocks,
      selectedSlides,
      setSelectedBlock,
      setSelectedBlocks,
    ],
  );

  const insertBlockAfterSelection = useCallback(() => {
    const selected =
      selectedBlocks[0] || (selectedBlock.slideId ? selectedBlock : null);

    if (!selected) return;

    const slide = slides.find((s) => s.id === selected.slideId);

    if (!slide) return;

    const index = slide.blocks.findIndex(
      (block) => block.id === selected.blockId,
    );

    if (index === -1) return;

    addBlock(selected.slideId, "text", index + 1);
  }, [selectedBlocks, selectedBlock, slides, addBlock]);

  const moveSelectedBlocksToSlide = useCallback(
    (dir) => {
      if (!selectedBlocks.length || slides.length < 2) return;

      const groups = new Map();

      selectedBlocks.forEach((block) => {
        if (!groups.has(block.slideId)) groups.set(block.slideId, []);
        groups.get(block.slideId).push(block.blockId);
      });

      const moved = [];

      groups.forEach((blockIds, sourceSlideId) => {
        const sourceIndex = slides.findIndex(
          (slide) => slide.id === sourceSlideId,
        );

        if (sourceIndex === -1) return;

        const targetIndex = Math.max(
          0,
          Math.min(slides.length - 1, sourceIndex + dir),
        );

        if (targetIndex === sourceIndex) return;

        const targetSlideId = slides[targetIndex].id;

        moveBlocksToSlide(sourceSlideId, blockIds, targetSlideId);
        blockIds.forEach((blockId) =>
          moved.push({ slideId: targetSlideId, blockId }),
        );
      });

      if (moved.length) {
        setActiveSlideId(moved[moved.length - 1].slideId);
        setSelectedBlocks(moved);
      }
    },
    [
      selectedBlocks,
      slides,
      moveBlocksToSlide,
      setActiveSlideId,
      setSelectedBlocks,
    ],
  );

  const handleKeyDown = (e) => {
    const isEditingText = !!activeEditor;

    if (isEditingText) return;

    if (e.target?.closest?.("[data-code-editor]")) return;

    const target = e.target;
    const inFormControl = target?.closest?.(
      "input, textarea, select, [contenteditable]",
    );
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

    if (inFormControl) return;

    if (key === "escape") {
      e.preventDefault();
      setSelectedBlocks([]);
      setSelectedSlides([]);
      return;
    }

    if (
      e.ctrlKey &&
      key === "d" &&
      !selectedBlocks.length &&
      !selectedSlides.length
    ) {
      e.preventDefault();

      if (effectiveActiveSlideId) {
        duplicateSlide(effectiveActiveSlideId);
      }

      return;
    }

    if (e.ctrlKey && key === "pageup") {
      e.preventDefault();
      goToSlide(-1);
      return;
    }

    if (e.ctrlKey && key === "pagedown") {
      e.preventDefault();
      goToSlide(1);
      return;
    }

    if (e.ctrlKey && e.altKey && key === "arrowup") {
      e.preventDefault();
      goToSlide(-1);
      return;
    }

    if (e.ctrlKey && e.altKey && key === "arrowdown") {
      e.preventDefault();
      goToSlide(1);
      return;
    }

    if (selectedSlides.length) return;

    if (e.altKey && e.shiftKey && key === "arrowup") {
      e.preventDefault();
      moveSelectedBlocksToSlide(-1);
      return;
    }

    if (e.altKey && e.shiftKey && key === "arrowdown") {
      e.preventDefault();
      moveSelectedBlocksToSlide(1);
      return;
    }

    if (e.altKey && key === "arrowup") {
      e.preventDefault();
      moveSelectedBlocks(-1);
      return;
    }

    if (e.altKey && key === "arrowdown") {
      e.preventDefault();
      moveSelectedBlocks(1);
      return;
    }

    if (key === "arrowup") {
      e.preventDefault();
      moveSelection(-1);
      return;
    }

    if (key === "arrowdown") {
      e.preventDefault();
      moveSelection(1);
      return;
    }

    if (key === "enter") {
      e.preventDefault();
      insertBlockAfterSelection();
    }
  };

  return { handleKeyDown };
}