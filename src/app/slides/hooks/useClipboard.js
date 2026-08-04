import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { cloneBlock } from "../utils/cloneBlock";
import { cloneSlide } from "../utils/cloneSlide";
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
    copiedSlides,
    setCopiedSlides,
    selectedSlides,
    setSelectedSlides,
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

  const copySelectedSlides = useCallback(() => {
    const slidesToCopy = slides
      .filter((slide) => selectedSlides.includes(slide.id))
      .map((slide) => cloneSlide(slide, { asCopy: false }));

    setCopiedSlides(slidesToCopy);
  }, [slides, selectedSlides, setCopiedSlides]);

  const pasteSlides = useCallback(() => {
    if (copiedSlides.length === 0) return;

    setSlides((prev) => {
      const anchorIndex = prev.findIndex(
        (slide) => slide.id === recordedActiveSlideId,
      );

      const insertIndex = anchorIndex === -1 ? prev.length : anchorIndex + 1;
      const copies = copiedSlides.map((slide) => cloneSlide(slide));
      const updated = [...prev];

      updated.splice(insertIndex, 0, ...copies);

      return updated;
    });
  }, [copiedSlides, recordedActiveSlideId, setSlides]);

  const duplicateSelectedSlides = useCallback(() => {
    if (selectedSlides.length === 0) return;

    setSlides((prev) => {
      const duplicates = prev
        .filter((slide) => selectedSlides.includes(slide.id))
        .map((slide) => cloneSlide(slide));
      const result = [...prev];
      let dupIndex = 0;
      let offset = 0;

      prev.forEach((slide, index) => {
        if (!selectedSlides.includes(slide.id)) return;

        result.splice(index + 1 + offset, 0, duplicates[dupIndex]);
        offset += 1;
        dupIndex += 1;
      });

      return result;
    });
  }, [selectedSlides, setSlides]);

  const deleteSelectedSlides = useCallback(() => {
    if (selectedSlides.length === 0) return;

    const remaining = slides.filter(
      (slide) => !selectedSlides.includes(slide.id),
    ).length;

    if (remaining < 1) return;

    if (confirm("Do you really want to delete the selected slides ?")) {
      setSlides((prev) =>
        prev.filter((slide) => !selectedSlides.includes(slide.id)),
      );

      setSelectedSlides([]);
    }
  }, [slides, selectedSlides, setSlides, setSelectedSlides]);

  const copySlide = (slideId) => {
    const slide = slides.find((slide) => slide.id === slideId);

    if (!slide) return;

    setCopiedSlides([cloneSlide(slide, { asCopy: false })]);
  };

  const pasteSlide = (slideId) => {
    if (copiedSlides.length === 0) return;

    setSlides((prev) => {
      const anchorIndex = prev.findIndex((slide) => slide.id === slideId);
      const insertIndex = anchorIndex === -1 ? prev.length : anchorIndex + 1;
      const copies = copiedSlides.map((slide) => cloneSlide(slide));
      const updated = [...prev];

      updated.splice(insertIndex, 0, ...copies);

      return updated;
    });
  };

  const duplicateSlide = (slideId) => {
    const slide = slides.find((slide) => slide.id === slideId);

    if (!slide) return;

    setSlides((prev) => {
      const anchorIndex = prev.findIndex((s) => s.id === slideId);

      if (anchorIndex === -1) return prev;

      const updated = [...prev];

      updated.splice(anchorIndex + 1, 0, cloneSlide(slide));

      return updated;
    });
  };

  return {
    copyBlock,
    pasteBlock,
    duplicateBlock,
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    pasteBlocks,
    copySlide,
    pasteSlide,
    duplicateSlide,
    copySelectedSlides,
    pasteSlides,
    duplicateSelectedSlides,
    deleteSelectedSlides,
  };
}
