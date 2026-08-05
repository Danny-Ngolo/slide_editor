import { useCallback } from "react";
import { useEditorContext } from "../components/EditorContext";
import { generateId } from "../utils/generateId";
import { useHistory } from "./useHistory";
import { useTable } from "./useTable";
import { createExerciseBlock } from "./exerciseUtils";

export function useSlides() {
  const { setSlides, slidesHistory, setSlidesWithoutHistory } = useHistory();
  const { setSlidesHistory, recordedActiveSlideId, setRecordedActiveSlideId } =
    useEditorContext();
  const { createTableBlock } = useTable();
  const slides = slidesHistory.present;

  const initializeSlides = useCallback(
    (slides) => {
      setSlidesHistory((prev) => ({
        past: [],
        present: slides,
        future: [],
      }));
    },
    [setSlidesHistory],
  );

  const addSlide = () => {
    const newSlide = {
      id: generateId(),
      title: `Slide ${slides.length + 1}`,
      blocks: [],
    };

    setSlides([...slides, newSlide]);
  };

  const deleteSlide = (slideId) => {
    if (slides.length === 1) return;

    if (confirm("Do you really want to delete this slide ?") && slideId) {
      setSlides(slides.filter((slide) => slide.id !== slideId));
    }
  };

  const updateSlideTitle = (slideId, newTitle) => {
    setSlides(
      slides.map((slide) =>
        slide.id === slideId ? { ...slide, title: newTitle } : slide,
      ),
    );
  };

  const recordActiveSlideId = useCallback(
    (newActiveSlideId) => {
      setRecordedActiveSlideId(newActiveSlideId);
    },
    [setRecordedActiveSlideId],
  );

  const addBlock = (slideId, type, index = null, initialContent) => {
    const newBlock =
      type === "table"
        ? createTableBlock()
        : type === "exercise"
          ? createExerciseBlock()
          : {
              id: generateId(),
              type: type,
              content: initialContent || {},
              important: false,
            };

    if (type === "callout" || (type === "text" && !newBlock.content.html)) {
      newBlock.content.html = "<p></p>";
    }

    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        let blocks = [...slide.blocks];

        if (index === null) {
          blocks.push(newBlock);
        } else {
          blocks.splice(index, 0, newBlock);
        }

        return {
          ...slide,
          blocks,
        };
      }

      return slide;
    });

    setSlides(updatedSlides);
  };

  const updateBlock = useCallback(
    (slideId, blockId, newContent, options = {}) => {
      const updatedSlides = slides.map((slide) => {
        if (slide.id === slideId) {
          const updatedBlocks = slide.blocks.map((block) => {
            if (block.id === blockId)
              return {
                ...block,
                content: newContent,
              };

            return block;
          });

          return {
            ...slide,
            blocks: updatedBlocks,
          };
        }

        return slide;
      });

      const { recordHistory } = options;

      if (recordHistory) {
        setSlides(updatedSlides);
      } else {
        setSlidesWithoutHistory(updatedSlides);
      }
    },
    [slides, setSlides, setSlidesWithoutHistory],
  );

  const replaceBlock = (slideId, blockId, newBlock) => {
    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedBlocks = slide.blocks.map((block) => {
          if (block.id === blockId) return newBlock;

          return block;
        });

        return {
          ...slide,
          blocks: updatedBlocks,
        };
      }

      return slide;
    });

    setSlides(updatedSlides);
  };

  const transformBlock = (slideId, blockId, block, target) => {
    const transformed = {
      ...block,
      type: target.type,
      content: {
        html: block.content.html,
      },
    };

    if (target.variant) {
      transformed.content.variant = target.variant;
    }

    replaceBlock(slideId, blockId, transformed);
  };

  const deleteBlock = (slideId, blockId) => {
    console.log("deleting block...");

    if (confirm("Do you really want to delete this block ?")) {
      setSlides(
        slides.map((slide) => {
          if (slide.id !== slideId) return slide;

          return {
            ...slide,
            blocks: slide.blocks.filter((b) => b.id !== blockId),
          };
        }),
      );
    }
  };

  const toggleImportant = (slideId, blockId) => {
    const updatedSlides = slides.map((slide) => {
      if (slide.id === slideId) {
        const updatedBlocks = slide.blocks.map((block) => {
          if (block.id === blockId) {
            return { ...block, important: !block.important };
          }

          return block;
        });

        return { ...slide, blocks: updatedBlocks };
      }

      return slide;
    });

    setSlides(updatedSlides);
  };

  return {
    recordedActiveSlideId,
    recordActiveSlideId,
    initializeSlides,
    addSlide,
    deleteSlide,
    updateSlideTitle,
    addBlock,
    updateBlock,
    deleteBlock,
    toggleImportant,
    transformBlock,
    replaceBlock,
  };
}
