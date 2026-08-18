import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { cloneBlock } from "../utils/cloneBlock";
import { cloneSlide } from "../utils/cloneSlide";
import { serializeClipboard, persistClipboard } from "../utils/clipboardFormat";
import { writeOsClipboardData } from "../utils/osClipboard";
import { useHistory } from "./useHistory";
import { useSlides } from "./useSlides";
import { generateId } from "../utils/generateId";

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
  const { recordedActiveSlideId, setActiveSlideId } = useSlides();
  const { setSlides, slidesHistory } = useHistory();
  const slides = slidesHistory.present;

  const writeOsClipboard = useCallback((kind, items) => {
    if (!items?.length) return;

    const { json, plain } = serializeClipboard(kind, items);
    writeOsClipboardData({ json, plain });
    persistClipboard(json);
  }, []);

  const copyBlock = (slideId, blockId) => {
    const slide = slides.find((slide) => slide.id === slideId);

    if (!slide) return;

    const block = slide.blocks.find((block) => block.id === blockId);

    if (!block) return;

    setCopiedBlock(cloneBlock(block));
    writeOsClipboard("block", [block]);
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
    writeOsClipboard("block", blocksToCopy);
  }, [slides, selectedBlocks, setCopiedBlocks, writeOsClipboard]);

  const getSelectedCopyData = useCallback(() => {
    if (selectedBlocks.length) {
      const items = [];

      slides.forEach((slide) => {
        slide.blocks.forEach((block) => {
          if (
            selectedBlocks.some(
              (s) => s.slideId === slide.id && s.blockId === block.id,
            )
          ) {
            items.push(block);
          }
        });
      });

      return items.length ? { kind: "block", items } : null;
    }

    if (selectedSlides.length) {
      const items = slides.filter((slide) => selectedSlides.includes(slide.id));

      return items.length ? { kind: "slide", items } : null;
    }

    return null;
  }, [slides, selectedBlocks, selectedSlides]);

  const pasteBlocksFrom = useCallback(
    (items) => {
      if (!items?.length || !recordedActiveSlideId) return;

      const copies = items.map((block) => cloneBlock(block));

      setSlides((prev) =>
        prev.map((slide) => {
          if (slide.id !== recordedActiveSlideId) return slide;

          return {
            ...slide,
            blocks: [...slide.blocks, ...copies],
          };
        }),
      );

      setSelectedBlocks(
        copies.map((copy) => ({
          slideId: recordedActiveSlideId,
          blockId: copy.id,
        })),
      );
    },
    [recordedActiveSlideId, setSlides, setSelectedBlocks],
  );

  const pasteBlocks = useCallback(() => {
    pasteBlocksFrom(copiedBlocks);
  }, [copiedBlocks, pasteBlocksFrom]);

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
    writeOsClipboard("slide", slidesToCopy);
  }, [slides, selectedSlides, setCopiedSlides, writeOsClipboard]);

  const pasteSlidesFrom = useCallback(
    (items) => {
      if (!items?.length) return;

      const copies = items.map((slide) => cloneSlide(slide));

      setSlides((prev) => {
        const anchorIndex = prev.findIndex(
          (slide) => slide.id === recordedActiveSlideId,
        );

        const insertIndex = anchorIndex === -1 ? prev.length : anchorIndex + 1;
        const updated = [...prev];

        updated.splice(insertIndex, 0, ...copies);

        return updated;
      });

      setSelectedSlides(copies.map((slide) => slide.id));
      setActiveSlideId(copies[copies.length - 1].id);
    },
    [recordedActiveSlideId, setSlides, setSelectedSlides, setActiveSlideId],
  );

  const pasteSlides = useCallback(() => {
    pasteSlidesFrom(copiedSlides);
  }, [copiedSlides, pasteSlidesFrom]);

  const duplicateSelectedSlides = useCallback(() => {
    if (selectedSlides.length === 0) return;

    const duplicates = slides
      .filter((slide) => selectedSlides.includes(slide.id))
      .map((slide) => cloneSlide(slide));

    setSlides((prev) => {
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

    if (duplicates.length) {
      setSelectedSlides(duplicates.map((slide) => slide.id));
      setActiveSlideId(duplicates[duplicates.length - 1].id);
    }
  }, [slides, selectedSlides, setSlides, setSelectedSlides, setActiveSlideId]);

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
    writeOsClipboard("slide", [slide]);
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

    const copy = cloneSlide(slide);

    setSlides((prev) => {
      const anchorIndex = prev.findIndex((s) => s.id === slideId);

      if (anchorIndex === -1) return prev;

      const updated = [...prev];

      updated.splice(anchorIndex + 1, 0, copy);

      return updated;
    });

    setSelectedSlides([copy.id]);
    setActiveSlideId(copy.id);
  };

  return {
    copyBlock,
    pasteBlock,
    duplicateBlock,
    deleteSelectedBlocks,
    copySelectedBlocks,
    duplicateSelectedBlocks,
    getSelectedCopyData,
    pasteBlocks,
    pasteBlocksFrom,
    copySlide,
    pasteSlide,
    duplicateSlide,
    copySelectedSlides,
    pasteSlides,
    pasteSlidesFrom,
    duplicateSelectedSlides,
    deleteSelectedSlides,
  };
}
