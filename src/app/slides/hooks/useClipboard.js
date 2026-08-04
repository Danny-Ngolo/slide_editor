import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { cloneBlock } from "../utils/cloneBlock";
import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";
import { useSlides } from "./useSlides";

export function useClipboard() {
  const {
    copiedBlock,
    setCopiedBlock,
    copiedBlocks,
    setCopiedBlocks,
    selectedBlocks,
    setSelectedBlocks,
  } = useEditorContext();
  const { recordedActiveSlideId } = useSlides();
  const { setSlides, slidesHistory } = useHistory();
  const slides = slidesHistory.present;

  const copyBlock = (slideId, blockId) => {
    const slide = slides.find((slide) => slide.id === slideId);

    if (!slide) return;

    const block = slide.blocks.find((block) => block.id === blockId);

    if (!block) return;

    setCopiedBlock(cloneBlock(block));
  };

  const pasteBlock = (slideId, targetBlockId) => {
    if (!copiedBlock) return;

    setSlides((prevSlides) => {
      return prevSlides.map((slide) => {
        if (slide.id !== slideId) return slide;

        const blockIndex = slide.blocks.findIndex(
          (block) => block.id === targetBlockId,
        );

        if (blockIndex === -1) return slide;

        const newBlock = {
          ...cloneBlock(copiedBlock),
          id: generateId(),
        };

        const updatedBlocks = [...slide.blocks];
        updatedBlocks.splice(blockIndex + 1, 0, newBlock);

        return {
          ...slide,
          blocks: updatedBlocks,
        };
      });
    });
  };

  const duplicateBlock = (slideId, blockId) => {
    console.log("duplicating a block...");

    setSlides((prevSlides) => {
      return prevSlides.map((slide) => {
        if (slide.id !== slideId) return slide;

        const blockIndex = slide.blocks.findIndex(
          (block) => block.id === blockId,
        );

        if (blockIndex === -1) return slide;

        const blockToDuplicate = slide.blocks[blockIndex];
        const duplicatedBlock = {
          ...cloneBlock(blockToDuplicate),
          id: generateId(),
        };

        const updatedBlocks = [...slide.blocks];
        updatedBlocks.splice(blockIndex + 1, 0, duplicatedBlock);

        return {
          ...slide,
          blocks: updatedBlocks,
        };
      });
    });
  };

  const deleteSelectedBlocks = useCallback(() => {
    if (selectedBlocks.length === 0) return;

    if (confirm("Do you really want to delete the selected blocks ?")) {
      setSlides((prev) =>
        prev.map((slide) => ({
          ...slide,
          blocks: slide.blocks.filter(
            (block) =>
              !selectedBlocks.some(
                (selected) =>
                  selected.slideId === slide.id &&
                  selected.blockId === block.id,
              ),
          ),
        })),
      );

      setSelectedBlocks([]);
    }
  }, [selectedBlocks, setSlides, setSelectedBlocks]);

  const copySelectedBlocks = useCallback(() => {
    const blocksToCopy = [];

    slides.forEach((slide) => {
      slide.blocks.forEach((block) => {
        const selected = selectedBlocks.some(
          (s) => s.slideId === slide.id && s.blockId === block.id,
        );

        if (selected) {
          blocksToCopy.push(cloneBlock(block));
        }
      });
    });

    setCopiedBlocks(blocksToCopy);
  }, [slides, selectedBlocks, setCopiedBlocks]);

  const pasteBlocks = useCallback(() => {
    if (copiedBlocks.length === 0) return;

    setSlides((prev) =>
      prev.map((slide) => {
        if (slide.id !== recordedActiveSlideId) return slide;

        return {
          ...slide,
          blocks: [
            ...slide.blocks,
            ...copiedBlocks.map((block) => ({
              ...cloneBlock(block),
              id: generateId(),
            })),
          ],
        };
      }),
    );
  }, [copiedBlocks, recordedActiveSlideId, setSlides]);

  const duplicateSelectedBlocks = useCallback(() => {
    const blocksToDuplicate = [];

    slides.forEach((slide) => {
      slide.blocks.forEach((block) => {
        const selected = selectedBlocks.some(
          (s) => s.slideId === slide.id && s.blockId === block.id,
        );

        if (selected) {
          blocksToDuplicate.push({
            slideId: slide.id,
            block,
          });
        }
      });
    });

    setSlides((prev) =>
      prev.map((slide) => {
        const duplicates = blocksToDuplicate
          .filter((b) => b.slideId === slide.id)
          .map((b) => ({
            ...cloneBlock(b.block),
            id: generateId(),
          }));

        return {
          ...slide,
          blocks: [...slide.blocks, ...duplicates],
        };
      }),
    );
  }, [slides, selectedBlocks, setSlides]);

  return {
    copyBlock,
    pasteBlock,
    duplicateBlock,
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    pasteBlocks,
  };
}
